/** Real CPython practice in a disposable browser worker. No work starts at import. */
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYTHON_LIMITS = Object.freeze({
  sourceCharacters: 12000,
  testsCharacters: 20000,
  outputCharacters: 12000,
  errorCharacters: 5000,
  frames: 240,
  locals: 24,
  valueCharacters: 220,
  startupMs: 45000,
  executionMs: 5000,
});

// This exact harness is also exercised with local CPython by the contract tests.
// exec here is Python execution inside the worker, never JavaScript eval/Function.
export const PYTHON_HARNESS = String.raw`
import sys as _tc_sys
import json as _tc_json
import traceback as _tc_traceback
import builtins as _tc_builtins
import itertools as _tc_itertools

def tracecraft_execute(payload_json):
    payload = _tc_json.loads(payload_json)
    source = payload.get("code", "")
    checks = payload.get("tests", "")
    want_trace = payload.get("trace", True)
    if not isinstance(source, str) or len(source) > 12000:
        raise ValueError("Python source is limited to 12,000 characters.")
    if not isinstance(checks, str) or len(checks) > 20000:
        raise ValueError("Python checks are limited to 20,000 characters.")

    class Capture:
        encoding = "utf-8"
        def __init__(self):
            self.parts = []
            self.size = 0
            self.truncated = False
        def write(self, value):
            if not isinstance(value, str):
                raise TypeError("write() requires a string")
            remaining = 12000 - self.size
            if len(value) > remaining:
                self.truncated = True
            if remaining > 0:
                part = value[:remaining]
                self.parts.append(part)
                self.size += len(part)
            return len(value)
        def flush(self):
            pass
        def isatty(self):
            return False
        def getvalue(self):
            return "".join(self.parts)

    def short(value, depth=0, seen=None):
        # Bound common containers before formatting, and do not invoke a learner's
        # custom __repr__. These are pedagogical text summaries, not a heap graph.
        if seen is None:
            seen = set()
        kind = type(value)
        try:
            if kind is str:
                result = repr(value[:160]) + ("..." if len(value) > 160 else "")
            elif kind in (int, float, bool, type(None)):
                result = repr(value)
            elif kind in (list, tuple, dict, set, frozenset):
                identity = id(value)
                if identity in seen:
                    return "<cycle>"
                if depth >= 2:
                    return "<" + kind.__name__ + ": " + str(len(value)) + " items>"
                next_seen = seen | {identity}
                if kind is dict:
                    pieces = [short(k, depth + 1, next_seen) + ": " + short(v, depth + 1, next_seen)
                              for k, v in _tc_itertools.islice(value.items(), 8)]
                    opening, closing = "{", "}"
                else:
                    pieces = [short(item, depth + 1, next_seen)
                              for item in _tc_itertools.islice(value, 8)]
                    opening, closing = ("[", "]") if kind is list else (("(", ")") if kind is tuple else ("{", "}"))
                if len(value) > 8:
                    pieces.append("...")
                result = opening + ", ".join(pieces) + closing
                if kind is tuple and len(value) == 1:
                    result = "(" + pieces[0] + ",)"
                elif kind is set and not value:
                    result = "set()"
                elif kind is frozenset:
                    result = "frozenset(" + (result if value else "") + ")"
            else:
                result = object.__repr__(value)
        except BaseException:
            result = "<value unavailable>"
        return result if len(result) <= 220 else result[:217] + "..."

    output, errors = Capture(), Capture()
    frames = []
    trace_truncated = False
    phase = "program"
    def tracer(frame, event, arg):
        nonlocal trace_truncated
        if frame.f_code.co_filename != "<learner>":
            return None
        if event in ("line", "return", "exception"):
            if len(frames) < 240:
                values = {}
                for name, value in frame.f_locals.items():
                    if name.startswith("__"):
                        continue
                    if len(values) >= 24:
                        break
                    values[name] = short(value)
                frames.append({"line": frame.f_lineno, "locals": values,
                               "event": event, "function": frame.f_code.co_name,
                               "stage": phase})
            else:
                trace_truncated = True
        return tracer

    namespace = {"__name__": "__main__", "__builtins__": dict(vars(_tc_builtins))}
    previous_stdout, previous_stderr = _tc_sys.stdout, _tc_sys.stderr
    previous_trace = _tc_sys.gettrace()
    failure = None
    passed = None
    try:
        _tc_sys.stdout, _tc_sys.stderr = output, errors
        if want_trace:
            _tc_sys.settrace(tracer)
        exec(compile(source, "<learner>", "exec"), namespace, namespace)
        if checks.strip():
            phase = "checks"
            exec(compile(checks, "<checks>", "exec"), namespace, namespace)
            passed = True
    except BaseException as error:
        passed = False
        failure = "".join(_tc_traceback.format_exception(type(error), error, error.__traceback__, limit=6))[-5000:]
    finally:
        _tc_sys.settrace(previous_trace)
        _tc_sys.stdout, _tc_sys.stderr = previous_stdout, previous_stderr
    return _tc_json.dumps({"stdout": output.getvalue(), "stderr": errors.getvalue(),
                           "error": failure, "passed": passed, "frames": frames,
                           "truncated": output.truncated or errors.truncated or trace_truncated,
                           "traceTruncated": trace_truncated,
                           "outputTruncated": output.truncated or errors.truncated})
`;

function failureResult(message, extra = {}) {
  return { stdout: '', stderr: '', error: message, passed: false, frames: [], ...extra };
}

/**
 * run() is the explicit opt-in boundary. Constructing an instance creates no worker
 * and makes no CDN requests. Call only after the UI explains the CDN download.
 */
export class PythonRuntime {
  constructor({
    workerUrl = new URL('./python-worker.js', import.meta.url),
    workerFactory = url => new Worker(url, { type: 'module' }),
    startupTimeoutMs = PYTHON_LIMITS.startupMs,
    executionTimeoutMs = PYTHON_LIMITS.executionMs,
  } = {}) {
    this.workerUrl = workerUrl;
    this.workerFactory = workerFactory;
    this.startupTimeoutMs = startupTimeoutMs;
    this.executionTimeoutMs = executionTimeoutMs;
    this.worker = null;
    this.pending = null;
    this.sequence = 0;
  }

  run(code, { tests = '', trace = true } = {}) {
    if (typeof code !== 'string' || code.length > PYTHON_LIMITS.sourceCharacters) {
      return Promise.resolve(failureResult('Python source is limited to 12,000 characters.'));
    }
    if (typeof tests !== 'string' || tests.length > PYTHON_LIMITS.testsCharacters) {
      return Promise.resolve(failureResult('Python checks are limited to 20,000 characters.'));
    }
    if (this.pending) {
      return Promise.resolve(failureResult('A Python run is already active. Stop it before starting another.'));
    }
    return new Promise(resolve => {
      const id = ++this.sequence;
      const finish = result => {
        if (this.pending?.id !== id) return;
        clearTimeout(this.pending.timer);
        this.pending = null;
        resolve(result);
      };
      this.pending = { id, finish, timer: null };
      const deadline = (milliseconds, message) => {
        if (this.pending?.id !== id) return;
        clearTimeout(this.pending.timer);
        this.pending.timer = setTimeout(() => {
          this.worker?.terminate();
          this.worker = null;
          finish(failureResult(message, { timedOut: true }));
        }, milliseconds);
      };
      try {
        if (!this.worker) {
          this.worker = this.workerFactory(this.workerUrl);
          const worker = this.worker;
          worker.onmessage = ({ data }) => {
            if (this.worker !== worker) return;
            const active = this.pending;
            if (!active || !data || data.id !== active.id) return;
            if (data.type === 'started') {
              clearTimeout(active.timer);
              active.timer = setTimeout(() => {
                this.worker?.terminate();
                this.worker = null;
                active.finish(failureResult('Python exceeded the 5-second execution limit. The worker was stopped; shorten the program and run again.', { timedOut: true }));
              }, this.executionTimeoutMs);
            } else if (data.type === 'result') {
              active.finish(data.result);
            }
          };
          worker.onerror = () => {
            if (this.worker !== worker) return;
            this.worker?.terminate();
            this.worker = null;
            this.pending?.finish(failureResult('Python could not start. Check your connection and whether the browser allows the jsDelivr download and WebAssembly, then try again.'));
          };
          worker.onmessageerror = () => {
            if (this.worker !== worker) return;
            this.worker?.terminate();
            this.worker = null;
            this.pending?.finish(failureResult('The Python worker returned an unreadable result. Try running again.'));
          };
        }
        deadline(this.startupTimeoutMs, 'The Python runtime download timed out. Check your connection and retry; your code was not submitted to a server.');
        this.worker.postMessage({ type: 'run', id, code, tests, trace: Boolean(trace) });
      } catch (error) {
        this.worker?.terminate();
        this.worker = null;
        finish(failureResult(`Python workers are unavailable in this view. Open TraceCraft from its hosted URL or localhost. ${String(error?.message || '').slice(0,200)}`));
      }
    });
  }

  /** Stop a pending run and release its memory. A later run creates a new worker. */
  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.pending?.finish(failureResult('Python run stopped. Your draft is unchanged.', { cancelled: true }));
  }
}
