import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PythonRuntime, PYTHON_HARNESS, PYTHON_LIMITS } from '../src/python-runtime.mjs';

const pythonCommand = process.env.TRACECRAFT_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const probe = spawnSync(pythonCommand, ['--version'], { encoding: 'utf8' });
const pythonAvailable = probe.status === 0;
const pythonTest = (name, fn) => test(name, { skip: pythonAvailable ? false : 'Local CPython unavailable; set TRACECRAFT_PYTHON.' }, fn);

function executePython(runs) {
  const directory = mkdtempSync(join(tmpdir(), 'tracecraft-python-'));
  try {
    const harnessPath = join(directory, 'harness.py');
    const fixturesPath = join(directory, 'fixtures.json');
    const script = `${PYTHON_HARNESS}\nwith open(_tc_sys.argv[1], encoding="utf-8") as fixture_file:\n    _tc_runs = _tc_json.load(fixture_file)\n_tc_results = [_tc_json.loads(tracecraft_execute(_tc_json.dumps(item))) for item in _tc_runs]\nprint(_tc_json.dumps(_tc_results))\n`;
    writeFileSync(harnessPath, script);
    writeFileSync(fixturesPath, JSON.stringify(runs));
    const result = spawnSync(pythonCommand, [harnessPath, fixturesPath], {
      encoding: 'utf8', timeout: 5000, maxBuffer: 5 * 1024 * 1024,
    });
    // Some managed runners report a cleanup EPERM despite an exited child with
    // status 0 and complete stdout. Validate the exit status and actual result.
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    return JSON.parse(result.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

class FakeWorker {
  sent = [];
  terminated = false;
  postMessage(value) { this.sent.push(value); }
  terminate() { this.terminated = true; }
  emit(data) { this.onmessage?.({ data }); }
}

test('Python construction and invalid input make no worker/CDN request', async () => {
  let created = 0;
  const runtime = new PythonRuntime({ workerFactory: () => { created++; return new FakeWorker(); } });
  assert.equal(created, 0);
  assert.match((await runtime.run('x'.repeat(PYTHON_LIMITS.sourceCharacters + 1))).error, /12,000/);
  assert.match((await runtime.run('print(1)', { tests: 12 })).error, /20,000/);
  assert.equal(created, 0);
});

test('Python adapter returns the matching execution result and refuses concurrent runs', async () => {
  const worker = new FakeWorker();
  const runtime = new PythonRuntime({ workerFactory: () => worker });
  const pending = runtime.run('print(3)', { tests: 'assert 3 == 3', trace: true });
  assert.match((await runtime.run('print(9)')).error, /already active/);
  assert.equal(worker.sent.length, 1);
  const { id } = worker.sent[0];
  worker.emit({ type: 'result', id: id + 1, result: { stdout: 'wrong' } });
  worker.emit({ type: 'started', id });
  const expected = { stdout: '3\n', stderr: '', frames: [{ line: 1, locals: {} }], passed: true };
  worker.emit({ type: 'result', id, result: expected });
  assert.deepEqual(await pending, expected);
  runtime.dispose();
});

test('Python worker is terminated on execution timeout and a later run can restart', async () => {
  const workers = [];
  const runtime = new PythonRuntime({ executionTimeoutMs: 15, workerFactory: () => {
    const worker = new FakeWorker(); workers.push(worker); return worker;
  } });
  const pending = runtime.run('while True: pass');
  workers[0].emit({ type: 'started', id: workers[0].sent[0].id });
  assert.equal((await pending).timedOut, true);
  assert.equal(workers[0].terminated, true);
  const next = runtime.run('print(1)');
  assert.equal(workers.length, 2);
  workers[0].onerror(); // Late events from the terminated worker must be ignored.
  assert.equal(workers[1].terminated, false);
  workers[1].emit({ type: 'result', id: workers[1].sent[0].id, result: { stdout: '1\n', stderr: '', frames: [] } });
  assert.equal((await next).stdout, '1\n');
  runtime.dispose();
});

test('Python runtime download timeout and cancellation settle the pending promise', async () => {
  const worker = new FakeWorker();
  const runtime = new PythonRuntime({ startupTimeoutMs: 15, workerFactory: () => worker });
  const timedOut = await runtime.run('pass');
  assert.equal(timedOut.timedOut, true);
  assert.equal(worker.terminated, true);
  const pending = runtime.run('pass');
  runtime.dispose();
  assert.equal((await pending).cancelled, true);
});

pythonTest('real Python supports functions, classes, distinct instances, and slicing', () => {
  const code = `class Workout:
    def __init__(self, name):
        self.name = name
        self.sets = []
    def add_set(self, reps):
        self.sets.append(reps)

def recent(values):
    return values[-2:]

first = Workout("squat")
second = Workout("row")
first.add_set(8)
first.add_set(6)
first.add_set(5)
print(first.name, recent(first.sets), second.sets)
`;
  const [result] = executePython([{ code, tests: 'assert first.sets == [8, 6, 5]\nassert second.sets == []\nassert recent([]) == []', trace: true }]);
  assert.equal(result.error, null);
  assert.equal(result.passed, true);
  assert.equal(result.stdout, 'squat [6, 5] []\n');
  assert.ok(result.frames.some(frame => frame.function === '__init__'));
  assert.ok(result.frames.some(frame => frame.function === 'recent' && frame.stage === 'checks'));
  assert.ok(result.frames.every(frame => frame.line > 0 && frame.line <= code.split('\n').length));
});

pythonTest('trace frames come from edited code and preserve before-line snapshots', () => {
  const [original, edited] = executePython([
    { code: 'values = [1]\nalias = values\nalias.append(2)\nprint(values)' },
    { code: 'values = [5]\nalias = values\nalias.append(7)\nprint(values)' },
  ]);
  assert.equal(original.stdout, '[1, 2]\n');
  assert.equal(edited.stdout, '[5, 7]\n');
  assert.equal(original.frames.find(frame => frame.line === 3 && frame.event === 'line').locals.values, '[1]');
  assert.equal(original.frames.find(frame => frame.line === 4 && frame.event === 'line').locals.values, '[1, 2]');
  assert.equal(edited.frames.find(frame => frame.line === 4 && frame.event === 'line').locals.alias, '[5, 7]');
});

pythonTest('recursive calls and exceptions retain actual function names and source lines', () => {
  const code = 'def countdown(n):\n    if n == 0:\n        return 0\n    return 1 + countdown(n - 1)\nprint(countdown(3))\nprint(1 / 0)';
  const [result] = executePython([{ code }]);
  assert.equal(result.stdout, '3\n');
  assert.match(result.error, /ZeroDivisionError/);
  assert.match(result.error, /line 6/);
  assert.ok(result.frames.filter(frame => frame.function === 'countdown' && frame.event === 'return').length >= 4);
  assert.ok(result.frames.some(frame => frame.line === 6 && frame.event === 'exception'));
});

pythonTest('syntax errors and failed checks produce failure, never a pass badge', () => {
  const [syntax, assertion, successful] = executePython([
    { code: 'def broken(:\n    pass', tests: 'assert True' },
    { code: 'answer = 4', tests: 'assert answer == 5, "Expected five"' },
    { code: 'answer = 5', tests: 'assert answer == 5' },
  ]);
  assert.equal(syntax.passed, false);
  assert.match(syntax.error, /SyntaxError/);
  assert.equal(syntax.frames.length, 0);
  assert.equal(assertion.passed, false);
  assert.match(assertion.error, /Expected five/);
  assert.equal(successful.passed, true);
});

pythonTest('each run has a fresh learner namespace and can opt out of trace', () => {
  const results = executePython([
    { code: 'previous_answer = 42', trace: false },
    { code: 'assert "previous_answer" not in globals()\nprint("fresh")', trace: false },
  ]);
  assert.equal(results[0].passed, null);
  assert.equal(results[0].frames.length, 0);
  assert.equal(results[1].stdout, 'fresh\n');
  assert.equal(results[1].error, null);
});

pythonTest('stdout, stderr, trace frame count, and represented values stay bounded', () => {
  const [result] = executePython([{ code: 'import sys\nprint("x" * 15000)\nsys.stderr.write("y" * 15000)\nvalues = list(range(1000))\nfor i in range(1000):\n    total = i' }]);
  assert.equal(result.stdout.length, PYTHON_LIMITS.outputCharacters);
  assert.equal(result.stderr.length, PYTHON_LIMITS.outputCharacters);
  assert.equal(result.frames.length, PYTHON_LIMITS.frames);
  assert.equal(result.truncated, true);
  assert.equal(result.outputTruncated, true);
  assert.equal(result.traceTruncated, true);
  for (const frame of result.frames) {
    assert.ok(Object.keys(frame.locals).length <= PYTHON_LIMITS.locals);
    for (const value of Object.values(frame.locals)) assert.ok(value.length <= PYTHON_LIMITS.valueCharacters);
  }
});

pythonTest('tracing does not call custom learner repr and handles recursive containers', () => {
  const code = 'calls = []\nclass Example:\n    def __repr__(self):\n        calls.append(1)\n        return "example"\nitem = Example()\nvalues = []\nvalues.append(values)\nassert calls == []';
  const [result] = executePython([{ code, tests: 'assert calls == []' }]);
  assert.equal(result.passed, true);
  assert.ok(result.frames.some(frame => frame.locals.values?.includes('<cycle>')));
});

pythonTest('summaries preserve tuple and set distinctions without pretending to be a heap graph', () => {
  const [result] = executePython([{ code: 'single = (1,)\nempty = set()\nfrozen = frozenset([2])\npass' }]);
  const locals = result.frames.at(-1).locals;
  assert.equal(locals.single, '(1,)');
  assert.equal(locals.empty, 'set()');
  assert.equal(locals.frozen, 'frozenset({2})');
});

pythonTest('every authored Python solution passes its assertions and every deliberate bug fails', async () => {
  const { PYTHON_DRILLS } = await import('../src/training-content.mjs');
  assert.ok(PYTHON_DRILLS.length >= 4);
  const ids = new Set();
  for (const drill of PYTHON_DRILLS) {
    assert.ok(!ids.has(drill.id), `Duplicate drill id ${drill.id}`);
    ids.add(drill.id);
    for (const key of ['title', 'prompt', 'starter', 'solution', 'tests', 'explanation', 'bug', 'contract', 'complexity']) {
      assert.equal(typeof drill[key], 'string', `${drill.id}: ${key} must be text`);
      assert.ok(drill[key].trim(), `${drill.id}: ${key} must be nonempty`);
    }
    assert.ok(Array.isArray(drill.sources) && drill.sources.length, `${drill.id}: primary sources required`);
  }
  const runs = PYTHON_DRILLS.flatMap(drill => [
    { code: drill.solution, tests: drill.tests, trace: true },
    { code: drill.bug, tests: drill.tests, trace: false },
  ]);
  const results = executePython(runs);
  PYTHON_DRILLS.forEach((drill, index) => {
    assert.equal(results[index * 2].passed, true, `${drill.id} solution: ${results[index * 2].error}`);
    assert.equal(results[index * 2 + 1].passed, false, `${drill.id}: deliberate bug unexpectedly passed`);
  });
});
