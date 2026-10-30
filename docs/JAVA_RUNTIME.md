# Browser Java alpha

Java now compiles and runs inside TraceCraft. Learners open Java lab, enable browser Java, edit Main.java, and choose Run or Check. No learner-installed JDK, file download, account on an execution service, or application-server execution is required.

## What runs

The website serves about 7.2 MB of compiler/library assets on the first action. OpenJDK javac compiles the edited source, then TeaVM converts that bytecode to WebAssembly. A separate disposable browser worker executes the generated program. Each check fixture gets a new program instance. Source edits are compiled again; no prerecorded result substitutes for execution.

The supported console-program subset includes the features exercised by the ten tasks: types, assignments, branches, loops, methods, classes, instance/static state, arrays, strings, ArrayList, LinkedHashSet, LinkedHashMap, parsing and exceptions. It is not a complete JVM or JDK. Desktop UI, Spring servers, threads, native calls, files, networking, reflection and arbitrary added libraries are outside this workspace. Some otherwise valid Java APIs are absent from the compiler SDK. For example, the authored map tasks iterate keySet and get rather than Map.Entry. Local backend project milestones still require their separate development environment.

Input values are passed as strings to main's args array, one value per input-box line. The explicit empty-value checkbox distinguishes no arguments from one empty string. Fixed examples can populate this box without changing code. Check runs the task's published normal, changed and edge fixtures and compares exact stdout. It checks observable behavior, not the chosen technique or hiring readiness. Drafts, custom inputs, notes, assistance and versioned attempts use local progress and reviewed account snapshots.

## Bounds and recovery

- Source: 20,000 characters. At most 100 input strings, each at most 1,000 characters.
- Startup: 90 seconds. Compilation: 60 seconds. Each program fixture: 5 seconds.
- Printed stdout/stderr together: 12,000 characters. Truncated output cannot pass.
- Generated program bytes: at most 10 MB. Linear memory import: at most 64 MiB. WebAssembly GC-managed objects also use browser-managed memory, so this is not a total process-memory guarantee.
- Stop or leaving the lab terminates active workers and preserves the draft. Timeout and fatal compiler failure support a new run. Messages from cancelled generations cannot replace a retry.

Loading, compilation and execution failures have distinct guidance. A real javac diagnostic includes a source line and column; Go to line selects that line in the editor. Editing code or input invalidates the old displayed result. Help use and continued answers remain visible in practice evidence. These browser runners are personal-practice tools, not audited hostile-code sandboxes or tamper-resistant graders.

## Security boundary

The application API never compiles or executes learner Java. The compiler runs in one worker; generated program WebAssembly runs in another. The execution loader accepts only the exact typed TeaVM bootstrap imports required by the tested console programs, rejects unapproved modules, disables automatic module imports, restricts argument access to array length/own indexed entries, and permits one fixed string-adapter closure. Browser global access, prototype traversal, arbitrary function invocation and dynamic JavaScript bodies are rejected. The runtime patch uses static closures, without eval or Function constructors. The site's CSP retains wasm-unsafe-eval for WebAssembly but does not enable JavaScript unsafe-eval.

## Pinned upstream and redistribution

The compiler is built from teavm-javac revision `208d4c97a602ba0df055f16e6882059fb69d0122`, TeaVM `0.16.0`, and OpenJDK jdk25u revision `6c48f4ed707bf0b15f9b6098de30db8aae6fa40f`. A Windows archive-path patch changes only Apache-licensed compiler glue so library resources use portable slash paths. OpenJDK sources are unmodified.

The public vendor directory contains notices, Apache/BSD/Unicode/MPL licenses, GPLv2 with Classpath Exception, corresponding compiler sources, generated resource sources, Rhino sources and relocation recipe, and build/patch scripts. The source archive is available next to the compiled assets, independently of this repository's Git publication. Its manifest records exact asset SHA-256 values. See `public/vendor/java/NOTICE.txt` and `manifest.json`.

Author rebuild: use Java 25 for the pinned upstream Gradle build, apply the archive-path patch to a pristine clone on Windows, run `:compiler:createDist`, then `python scripts/vendor-java.py PATH_TO_CHECKOUT` from this repository. Packaging inputs are versioned in scripts/java-notices and scripts/java-source-inputs. These author tools are separate from the learner experience.

## Verification

The actual shipped browser compiler and WebAssembly engine verify all ten reference solutions, 64 changed/edge fixtures and ten deliberate bugs without a JDK. Additional actual-JDK tests validate the authored programs and independent small-input oracles. Controller checks cover timeout phases, cancellation, stale messages, fixture isolation and output bounds. Browser observations and publication status are recorded in QA.md and JAVA_COURSE_ROUNDS.md.
