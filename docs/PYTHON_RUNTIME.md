# Real Python practice runtime

Implementation date: October 28, 2026. This is a browser-local practice runner, not a hosted code judge or an audited adversarial sandbox.

## Dependency and loading consent

The runtime pins **Pyodide 314.0.7**, the stable release identified by the project's official documentation and release history on the implementation date. Pyodide provides CPython compiled to WebAssembly. This release family uses Python 3.14; it requires a **module worker**, not a classic `importScripts` worker.

Importing `src/python-runtime.mjs` and constructing `PythonRuntime` make no remote requests. The UI must describe the download and call `run` only after an explicit learner action. The first remote module requested by that action is:

`https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs`

Pyodide subsequently fetches runtime assets (including its WebAssembly module, standard library archive, and package lockfile) under the same pinned `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/` base. The CDN receives ordinary asset request metadata such as the requesting IP address. TraceCraft does not send the submitted program, assertions, or output to a code execution server. It does not automatically install packages mentioned in learner imports. There are no model/API credentials and no per-run paid service.

Pyodide is distributed under the **Mozilla Public License 2.0**; CPython and individual packaged dependencies retain their own licenses. This adapter links to the unmodified hosted distribution and does not relabel the dependency as MIT. A later self-hosted distribution must retain the upstream notices and comply with its component licenses. Version pinning is not an integrity signature; the current CDN import depends on the integrity of that provider and distribution.

Primary references:

- [Pyodide 314.0.7 release notes](https://pyodide.org/en/314.0.7/project/changelog.html#version-314-0-7)
- [Official module-worker instructions](https://pyodide.org/en/314.0.7/usage/webworker.html)
- [Pyodide JavaScript API](https://pyodide.org/en/314.0.7/usage/api/js-api.html)
- [Upstream repository and license](https://github.com/pyodide/pyodide)
- [Python trace-event semantics](https://docs.python.org/3.14/library/sys.html#sys.settrace)

## Adapter contract

```js
import { PythonRuntime } from './src/python-runtime.mjs';
const python = new PythonRuntime(); // No download yet.
// After the learner explicitly enables the runtime:
const result = await python.run(source, { tests: assertionCode, trace: true });
// Stop a run or release runtime memory. A subsequent run can start a new worker.
python.dispose();
```

`run` resolves to `{ stdout, stderr, error, passed, frames, truncated }`. Additional flags distinguish `outputTruncated`, `traceTruncated`, `cancelled`, and `timedOut`. `passed` is `null` when no assertion code was requested, `true` only when the program and assertions finish without an exception, and `false` on a program/check failure. These are visible practice assertions, not secret or independently verified assessment.

The default worker URL is resolved beside the runtime module. A build that inlines that module into an HTML file must provide the appropriate explicit URL, for example `new PythonRuntime({workerUrl: new URL('src/python-worker.js', document.baseURI)})`. The worker and its supporting module must still be available: the optional Python runner is not a standalone offline HTML feature.

Every run uses a new learner global namespace with its own builtins dictionary. Code is compiled with the exact filename `<learner>` and executed by CPython. Assertions run afterward in that namespace under `<checks>`. Functions, classes, comprehensions, dictionaries, slicing, arbitrary-precision Python integers, and ordinary language semantics come from CPython rather than the older teaching interpreter.

The interpreter process and imported module cache are reused between successful runs for responsiveness; a new namespace is not a fully reset machine. `dispose` or a timeout terminates the worker and releases that interpreter. Standard input returns EOF; there is no interactive terminal. No claim is made that all desktop Python packages, operating-system capabilities, or asynchronous/threaded workflows run in this browser distribution.

## Trace semantics

`sys.settrace` records events whose code filename is `<learner>`. A frame has `line`, `locals`, `event`, `function`, and `stage` fields. `event: 'line'` means **before that line executes**. Return and exception events report the state at those actual events. `stage` distinguishes the initial program from learner functions invoked by the practice assertions.

Only actual observed execution produces frames; edited source produces a new trace. Assertion lines and runtime internals are omitted. A program that only defines a function does not execute its body unless that function is subsequently called by the program or checks.

Local values are short textual summaries, not a complete heap graph or proof of object identity. Common built-in containers are bounded before formatting; cycles are marked; custom learner `__repr__` methods are not invoked by the tracer. A local snapshot is a copied string representation, so later mutation does not rewrite earlier frames. The UI must escape all output and locals before rendering them as HTML.

## Bounds and cancellation

| Resource | Limit / behavior |
|---|---|
| Learner source | 12,000 characters |
| Assertion source | 20,000 characters |
| Runtime initialization | 45 seconds, then terminate and allow retry |
| One execution, including checks | 5 seconds after worker startup, then terminate |
| Standard output and standard error | 12,000 characters per stream; remainder discarded with a truncation flag |
| Trace | First 240 observed frames; later frames omitted with a truncation flag |
| Local values | First 24 non-dunder names per frame; summaries capped at 220 characters |
| Container summaries | At most 8 children per container and 2 levels of expansion |
| Errors | At most 5,000 characters |

The execution watchdog lives on the main thread and terminates the worker; it does not depend on the Python loop cooperating. There is no hard independently enforced memory quota, so pathological allocation can still stress the browser. The limits protect ordinary practice responsiveness, not hostile multi-tenant execution. The controller permits only one pending run per instance.

## Browser policy

Serve the worker from the same origin with a JavaScript MIME type. A compatible policy needs these directives in addition to the application's other policies:

```text
script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval';
worker-src 'self';
connect-src 'self' https://cdn.jsdelivr.net;
```

The worker response must receive the applicable policy too. WebAssembly compilation needs `'wasm-unsafe-eval'`; JavaScript `'unsafe-eval'` is not intentionally enabled by this adapter. See [MDN's CSP WebAssembly explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src#unsafe_webassembly_execution). Hosted CSP and this exact distribution need a real browser smoke check before asserting that a deployment works.

The runtime supplies an empty `jsglobals` bridge to reduce accidental browser API exposure. This is not a claim of network isolation: Python/Pyodide internals, browser worker capabilities, and learner modification can expose more capabilities. Do not execute arbitrary third-party programs or treat local assertions as trustworthy grading of an adversary. TraceCraft's server remains a static asset server and never executes submitted Python.

## Verification

`node --test tests/python-contract.test.mjs` checks controller cancellation, startup and execution deadlines, source bounds, and retry behavior with a controlled worker test double. It runs the exact embedded Python harness in actual local CPython for classes, distinct instances, functions, recursion, slicing, aliasing, edited source, errors, trace phase, output limits, fresh namespaces, and every authored Python solution/deliberate bug.

Set `TRACECRAFT_PYTHON` to a Python executable if `python3` is unavailable. CPython-dependent checks explicitly skip when no executable is available. Local CPython verification is not a substitute for browser Pyodide verification: the latter must also check the CDN, WebAssembly, worker loading, CSP, cancellation, and supported-browser behavior. Desktop/narrow-screen app verification is recorded separately in `docs/QA.md`.

Observed during implementation: all 13 contract tests passed on Node 24.22.1 with local CPython 3.12.14, including the six authored drill solutions and rejection of their six deliberate bugs. These are separate from the browser's Python 3.14 runtime and do not establish browser networking or CSP success.
