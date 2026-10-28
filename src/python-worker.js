import { PYODIDE_BASE_URL, PYTHON_HARNESS, PYTHON_LIMITS } from './python-runtime.mjs';

let initialization;
let busy = false;

async function initialize() {
  // No remote import happens until the first explicitly requested run.
  const { loadPyodide } = await import(`${PYODIDE_BASE_URL}pyodide.mjs`);
  const pyodide = await loadPyodide({
    indexURL: PYODIDE_BASE_URL,
    jsglobals: {},
    stdout: () => {},
    stderr: () => {},
    stdin: () => null,
  });
  pyodide.runPython(PYTHON_HARNESS);
  return pyodide.globals.get('tracecraft_execute');
}

self.onmessage = async ({ data }) => {
  if (data?.type !== 'run') return;
  const { id, code, tests = '', trace = true } = data;
  if (busy) return;
  busy = true;
  try {
    if (typeof code !== 'string' || code.length > PYTHON_LIMITS.sourceCharacters ||
        typeof tests !== 'string' || tests.length > PYTHON_LIMITS.testsCharacters) {
      throw new Error('Source or checks exceeded the practice limits.');
    }
    initialization ??= initialize();
    const execute = await initialization;
    self.postMessage({ type: 'started', id });
    // Source travels only to this local worker. No package auto-install or code
    // submission endpoint is called. Ordinary CPython compile/exec runs below.
    const serialized = execute(JSON.stringify({ code, tests, trace: Boolean(trace) }));
    const result = JSON.parse(serialized);
    self.postMessage({ type: 'result', id, result });
  } catch (error) {
    initialization = undefined;
    self.postMessage({ type: 'result', id, result: {
      stdout: '', stderr: '', frames: [], passed: false,
      error: `Python could not complete this run: ${String(error?.message || error).slice(0, PYTHON_LIMITS.errorCharacters)}. If the runtime download failed, check your connection and retry.`,
    } });
  } finally {
    busy = false;
  }
};
