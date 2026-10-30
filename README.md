# TraceCraft
### Learn it. Write it. Test it. Explain it.

TraceCraft is a developer-practice **alpha** with required email-code sign-in. Drafts save on the device and can autosave to the account after review. The Vercel edition adds verified email-code accounts, durable Postgres progress, and reviewed save/restore. An eight-milestone backend path connects practical SQL/Python checks to a separate Java/Spring and MySQL project. The two-hour routine, full SQL/Python labs, and interactive system design simulator remain available.

The learning loop is **attempt → run → inspect → explain → retry**. Progress distinguishes a passing check from a self-reported completed day, and records when the app supplied a hint or solution. These are practice records, not a certification or a hiring prediction.

## Play it like a game

Every workspace uses one arcade look. Lessons play one stage at a time with a lesson map, Back/Continue and a "Show whole lesson" option. A robot guide reacts to checked answers, correct answers get a small celebration (sound is optional and off by default), and the top bar shows your level, practice XP and daily practice streak. These numbers come only from real records: first-correct quick and API lesson questions for XP and level, and days with checked practice for the streak. They are practice evidence, not a skill score. See [DESIGN.md](DESIGN.md).

## Make APIs click

[API adventure](https://tracecraft.dev/#apis) adds nine tracks, 46 original lessons, 138 tap/type recognition questions, eight input-driven request models and a five-question daily review. Start with HTTP, go deeper into REST, then learn SOAP, RPC/gRPC, GraphQL, webhooks, WebSockets, WebRTC and SSE. Six short steps lead from an idea to a prediction, a correction and an explanation. Progress uses the existing reviewed account snapshots. The labs are bounded models; a separate HTTP inspector makes one real same-origin health request. See [course and video analysis](docs/API_ADVENTURE.md) and [phone review cycles](docs/API_PHONE_ROUNDS.md).

## Start from zero

After signing in, **Start here** gives one ordered route: beginner lessons, small practice, interview preparation, then mock interviews. **Beginner lessons** has 25 original lessons: 12 Python, 6 SQL, and 7 Java. They explain each language’s purpose and syntax before asking a question. Python, SQL and Java tasks run real code in browser workers. Java has seven guided foundation tasks and three problem-solving tasks, without a learner-installed JDK or file setup. The supported console subset and limits are documented in [Browser Java](docs/JAVA_RUNTIME.md).

The current source has 51 Python tasks, 40 SQL tasks, 10 checked Java tasks, and 25 quick-question quests with 75 questions. Read marks, notes, recognition answers, and runtime checks stay separate. A suggested next step follows missing practice, and beginner records use existing backups and reviewed account sync. See [the ten additional rounds](docs/JAVA_COURSE_ROUNDS.md), [the 15-round improvement record](docs/IMPROVEMENT_ROUNDS.md) and [verification](docs/QA.md).

**Personal practice** (`#coach`) connects a resumable six-part diagnostic, a focused 14-session opening sequence, 120/60/30-minute plans, skill-specific evidence, a private correction notebook, and capped delayed reviews. Twelve new Python fluency tasks and 15 fitness-data SQL tasks use the existing real runners. Thirty-five original scenarios cover request flows, authentication, ten debugging investigations, eight own-project explanations, and specialist placement. Learn, Practice and Interview modes offer five explicit help levels. Written explanations use separate technical and communication self-review, not AI grading. Optional walking practice provides browser read-aloud and editable text; optional response clocks never grade or submit. Private context stays in learner progress. See [implementation and remaining scope](docs/PLATFORM_IMPLEMENTATION.md).

## Start locally

**TCS path** (`#tcs`) adds 25 ordered lessons across the requested Python, SQL, Git, HTTP, security, AI and flow-tracing topics. It includes worked examples, vocabulary, predictions, recognition checks, private notes, resume and mixed review, plus eight new Python and two new SQL tasks. The full library now has 51 Python and 40 SQL tasks alongside ten browser Java tasks. See [TCS path](docs/TCS_PATH.md) for coverage and assessment boundaries.

Requires Node.js 22.13 or newer. Install the pinned account dependencies before running checks. Node 24 is configured on Vercel.

```bash
npm ci
npm start
```

Open `http://127.0.0.1:3000`. The browser requires the same-origin verified email account service. Plain `npm start` serves assets and reports sign-in unavailable when that service is not configured; it has no guest bypass. Use the hosted environment described in [account setup](docs/PROGRESS_SYNC.md) for email sign-in. After signing in, **Start here** is the entry. Follow **Beginner lessons** for explanations from zero, or use **Practice library** to choose an activity. **Quick questions** has multiple choice and fill-in-the-blank practice with recorded hints and one-time practice XP. **Interview course** connects 23 original lessons to the original 40 interview drills, alongside 14 new beginner Python/SQL tasks, saved explanations and four mock interviews, with backend/general software engineering and frontend/full-stack preparation options. Begin with **Daily session** for the day's assignment, **SQL lab** to write actual queries, or **System design** to edit a diagram and investigate a bottleneck. See [the course guide](docs/INTERVIEW_COURSE.md), [START_HERE.md](START_HERE.md) and [the Codex handoff](docs/CODEX_HANDOFF.md).

```bash
npm run check
npm test
npm run build
npm start -- --dist --host 127.0.0.1 --port 3000
```

Stop an already running server before starting another on the same port. The server also accepts `HOST` and `PORT` environment variables. The Python contract tests use a local `python3` executable, or `TRACECRAFT_PYTHON`; checks that require CPython explicitly skip when it is unavailable. Authored Java checks use a Java 21+ launcher, or TRACECRAFT_JAVA; those checks explicitly skip when Java is unavailable. Those optional author checks are separate from the in-browser Java compiler, whose actual WebAssembly tests require no JDK.

**Serve the complete directory over HTTP(S).** The build copies `index.html`, `src/`, and `public/` into `dist/`. It preserves `dist/tracecraft-preview.html` as a second HTML entry, but that file is **no longer a self-contained preview**. Worker scripts, modules, and WebAssembly assets must remain beside it. Opening the HTML through `file://` or sharing only that one file does not provide the complete application.

## What the current source includes

| Area | Implemented behavior |
|---|---|
| Workspace redesign | Charcoal surfaces, restrained lime accents, grouped navigation, a more direct daily assignment, compact session controls, and consistent workbench typography |
| Beginner course | 25 original lessons covering Python, SQL, and Java purpose/syntax, worked examples, vocabulary, optional notes and separate read/practice records |
| Beginner arcade | 25 original quests, 75 recognition questions across foundations, Python patterns, Java and JavaScript/React models; tap-to-fill or typed answers, recorded hints, one-time XP and mobile navigation |
| Interview course | 23 lessons with 69 original teaching sections, counterexamples, saved reflections, linked runnable work, follow-ups and explicit self-assessment; backend and frontend/full-stack focuses |
| Mock interviews | Four original rehearsals with optional clocks, fresh linked attempts, saved debriefs and runtime evidence kept separate from self-reported interview behaviors |
| Daily session | 120-minute session: 110 minutes of work and a 10-minute break; seven check-in blocks; evidence notes; next assignment; timer pauses when the tab is hidden |
| Developer path | Eight focused milestones with prerequisites, environments, linked runnable checks, 56 daily assignments, evidence, failure cases and saved self-assessments; repeat or slow the sequence |
| SQL lab | 40 original exercises executed by local SQLite in a worker: schemas/constraints, filters, joins, grouping, NULL/absence, windows, updates, rollback, indexes, cardinality, date boundaries and actual query plans; 15 share one synthetic fitness schema |
| SQL checks | Fresh databases for changed fixtures, query-result or state checks, preserved duplicates, constraint probes, deliberate bugs, hints, and explanations |
| Python lab | 51 original full-Python drills: operation-specific fluency, parsing, fundamentals, API boundaries, hashing, two pointers, windows, stacks, binary search, graphs, trees, dynamic programming, linked nodes and heaps; public assertions and source-linked traces |
| Java lab | Ten original console tasks compiled by browser javac/TeaVM, changed and edge inputs, real diagnostics, separate execution workers, stop/timeouts, saved drafts and input values |
| System design | Editable component graph, directed connections, traffic/read-mix controls, component failures, numerical flow results, canvas/table views, keyboard editing, undo/redo, and saved drafts |
| Design challenges | Six original challenges with capacity budgets, actual-topology checks, 19 baseline/changed-workload cases, hints, reference graphs, deliberate bugs, and explanations |
| Design discussions | Six separate scenarios covering monolith/service choice, timeouts, duplicate requests, outbox delivery, stale caches, and data ownership; written attempts before worked explanations |
| Evidence and review | Saved drafts, explanations, checked attempts, in-app help use, and suggested retries after 1, 3, 7, and 14 days; same-day repeated passes do not advance the interval |
| Portability and account sync | Verified email codes on Vercel, user-owned Postgres snapshots, revision-checked saves, reviewed restore, complete backups, local recovery and account-data deletion; a separate local GitHub/SQLite adapter remains available |
| Original tools | Eight Mini-Python visual exercises, line-block reordering, three systems demos, four interview prompts, the 13-stage topic map, reading room, and optional visual/audio enhancements remain available |

### SQL and Python runtime boundaries

The SQL lab uses **vendored sql.js 1.15.2**. The actual SQLite version is displayed by the running engine. Assets are served with the app, and queries run in a disposable browser database. Running SQL changes that workspace; checking uses separate fresh databases. Leaving or resetting the lab discards its database, while editor drafts and practice records are saved separately. See [SQL lab](docs/SQL_LAB.md).

The Python lab uses **Pyodide 314.0.7**, providing CPython in a browser worker. Enable Python and then run or check a program to download the pinned runtime from jsDelivr. An internet connection is needed for the initial download. The CDN receives ordinary asset-request metadata; TraceCraft does not send code to a remote execution service. Browser loading/CSP verification is reported separately from local CPython tests in [QA](docs/QA.md). See [Python runtime](docs/PYTHON_RUNTIME.md) for exact bounds and limitations.

The Java lab self-hosts a pinned javac/TeaVM compiler, compiles edited Main.java source and runs generated WebAssembly in a separate disposable worker. No learner JDK, manual file download or remote execution service is needed. It supports the console features used by its ten tasks, rather than a complete JVM/JDK. Licenses and corresponding source are served beside its binaries. See [Browser Java](docs/JAVA_RUNTIME.md).

All three runners have execution deadlines and bounded results. They support personal practice; they are not audited hostile-code sandboxes or tamper-resistant grading services. Learner programs never execute in the application API.

### System design model boundaries

Build a directed graph from clients, a CDN, an API gateway, a rate limiter, a load balancer, application servers, a cache, a database, a queue, and workers. Change a component's assumptions or take it offline to see its effect on actual connected paths. Challenge checks use fixed public workloads and configuration budgets; changing the exploratory traffic slider does not change the requirements.

The engine keeps **completed, deliberately rejected, failed, and pending work separate**. Read-cache hits do not complete writes. A load balancer shares traffic among its available direct targets. A finite queue distinguishes acceptance from completion and exposes pending messages. A broken connection has a consequence; merely adding a component does not make it handle traffic.

All capacities and service times are **authored educational assumptions**. This is a deterministic flow model, not a benchmark or a real infrastructure deployment. Its estimated mean completion latency excludes congestion, queue waiting, jitter, and percentiles. It does not simulate cache freshness, transaction isolation, service ownership, retry safety, or exactly-once effects. Use [the lab guide](docs/SYSTEM_DESIGN_LAB.md) and [the exact model contract](docs/SIMULATION_MODEL.md) to understand what a result proves.

## Follow the path without confusing a checklist with a skill

The first sessions focus on writing a valid schema and join from a blank editor, refreshing Python fundamentals, and explaining a small design clearly. Later tasks require a **separate local MySQL database and Java/Spring learning project**: migrations, concurrent connections, backups/restores, authorization, API tests, debugging, and failure experiments. Selecting or checking off those assignments does not perform that work automatically.

Use the [two-hour plan](docs/DAILY_PLAN.md) for the daily loop and the [developer path](docs/DEVELOPER_PATH.md) for all 56 assignments. Eight weeks is a suggested sequence, not a promise of expertise. Retry a gate with changed data and record assistance honestly.

## Progress, accounts, and hosting

Progress is local by default. **Account & sync** saves all three workspaces after email verification and explicit review on the hosted edition. After signing in, choose the browser or account copy to continue and enable autosave. Autosave checks revisions and stops for review on conflicts, changed accounts, or errors. Local practice and complete backups remain available. Complete exports and local recovery remain available inside the signed-in workspace. These files contain code, diagrams, and personal notes. See [account setup and boundaries](docs/PROGRESS_SYNC.md).

| Workspace | Storage key | Backup location |
|---|---|---|
| Daily training, SQL/Python, reviews | `tracecraft:training:v1` | Daily session; latest 500 checks retained |
| System design graphs, notes, and checks | `tracecraft:system-design:v1` | System design; latest 100 checks retained |
| Original visual/debugging/interview tools | `tracecraft:v1` | Settings |

Importing one workspace does not replace the other stores. System design imports use a 2 MB limit and show a review before replacement. A local display name is a profile preference, not an authenticated account.

Vercel serves the browser app and same-origin account function. Better Auth verifies a single-use email code, Resend sends it from the dedicated sending domain, and Neon Postgres stores accounts and progress. Codes expire after five minutes; sessions use HttpOnly cookies. Hosted snapshots are limited to 4 MB. Sign-in codes expire after five minutes and are single-use. Account sessions last up to seven days with activity-based renewal. No learner programs execute in the account API. Plain `npm start` serves local assets; the required email account service must also be available to enter the browser workspace. The older GitHub/SQLite API adapter is retained for compatibility, but its session does not satisfy the new email sign-in gate. A static Site alone does not supply hosted accounts.

**Current deployment:** [tracecraft.dev](https://tracecraft.dev/#tcs) includes the 25-lesson TCS path, connected personal practice, 51 Python tasks, 40 SQL tasks, ten browser Java tasks, 35 additional authored scenarios, 25 beginner lessons, 25 recognition quests/75 questions, the interview course and four rehearsals. Deployment `dpl_3qKscnQ9orEvMCCjdqN1Gfat5S8S` is READY from the uncommitted feature-branch working tree based on `3e0fdd5`. All 609 local tests passed without skips. All 111 public assets match the tested source; health and required-account boundaries passed public checks. Authenticated desktop/phone learner flows used an isolated local account handler. No source push, merge, or new remote CI run is claimed. See [QA](docs/QA.md), [TCS coverage](docs/TCS_PATH.md) and [the platform scope](docs/PLATFORM_IMPLEMENTATION.md).

**Earlier v0.3 publication:** [tracecraft-daily.belal919.chatgpt.site](https://tracecraft-daily.belal919.chatgpt.site) remains the prior owner-only static Site, with browser-local progress. It is separate from the public Vercel edition.

## Repository and development

The existing public repository is [Bembaby/tracecraft](https://github.com/Bembaby/tracecraft), with `main` as its default branch. The current source and all automated tests can be developed locally without provisioning a hosting account. Browser entry requires the configured email service. A local passing check does not establish a GitHub Actions run or a deployed version.

The `publish:github` script is for publishing a **new fork/copy** under an authenticated account; it stops if a repository or `origin` already exists. It is not the update workflow for this existing repository. Keep exported progress, credentials, customer data, and private documents out of commits. `package.json`’s `private: true` prevents accidental npm publication; it does not change GitHub visibility.

## Documentation

- [Daily plan](docs/DAILY_PLAN.md): the 120-minute loop and immediate three-session preparation track.
- [Developer path](docs/DEVELOPER_PATH.md): eight weeks of assignments and observable gates.
- [Interview course](docs/INTERVIEW_COURSE.md): shipped coverage, learning sequence, mock interviews, evidence and remaining project work.
- [SQL lab](docs/SQL_LAB.md): engine, exercises, fixture checks, limits, and vendor provenance.
- [Python runtime](docs/PYTHON_RUNTIME.md): loading consent, CPython behavior, traces, cancellation, and test scope.
- [System design lab](docs/SYSTEM_DESIGN_LAB.md): controls, six challenges, practice routine, backups, and authoring contract.
- [Simulation model](docs/SIMULATION_MODEL.md): exact flow arithmetic, assumptions, limits, and requirement evaluator.
- [Progress sync](docs/PROGRESS_SYNC.md): verified email setup, durable storage, conflicts, backups, deletion, and the legacy local adapter.
- [Codex handoff](docs/CODEX_HANDOFF.md): code map, startup commands, existing Site identity, and focused next implementation gates.
- [Architecture](docs/ARCHITECTURE.md): implemented boundaries and future server responsibilities.
- [Roadmap](docs/ROADMAP.md): shipped work, remaining acceptance gates, and later milestones.
- [QA](docs/QA.md): current observations, historical evidence, and pending verification.
- [Original curriculum](docs/CURRICULUM.md): the broader topic map; planned content remains planned.
- [Research](docs/RESEARCH.md), [product brief](docs/PRODUCT.md), [voice plan](docs/VOICE.md), and [content policy](docs/CONTENT_POLICY.md): earlier design work and longer-term direction.

## Retained prototype labels

The **Visual debugger** runs Mini-Python, a bounded teaching subset. It remains distinct from the new full-Python lab. Its numeric representation, supported syntax, and memory snapshots are simplified; it is not CPython. The systems retrieval demo is keyword retrieval without generation, and the original row-filtering demo is a JavaScript visualization. The new SQL lab is the place to execute SQL.

The app does not provide AI grading, an LLM tutor, paid voice APIs, production database administration, multiplayer contests, or a job-outcome score. The broader topic map describes future learning coverage as well as shipped exercises.

## Privacy, accessibility, and licenses

No analytics or tracking scripts are installed. Browser storage is not encrypted cloud storage. Optional browser speech recognition may send audio to the browser vendor; the existing consent flow remains device dependent. Optional visual libraries and the enabled Python runtime contact jsDelivr. The browser does not ask for API keys, account passwords, or pasted session cookies. Verified email accounts use a server-managed HttpOnly session; credentials never enter browser progress. An email verification proves inbox access, not identity or skill.

Keyboard navigation, text equivalents, responsive layouts, and reduced-motion behavior remain design requirements. See QA for what was actually checked; no accessibility certification or production security audit is claimed.

Original code and teaching content are [MIT licensed](LICENSE). The bundled Nunito font retains its SIL Open Font License in `public/fonts/OFL.txt`. The arcade guide is an original AI-generated decorative asset. Better Auth 1.7.14 and pg 8.23.1 are MIT; @vercel/functions 3.6.1 is Apache-2.0. The lockfile pins their dependency tree. Vendored sql.js includes its own MIT notice; SQLite is public domain. Pyodide and its components retain their upstream licenses, including Pyodide’s MPL 2.0. Linked external materials retain their copyrights. “TraceCraft” remains a working name without a claim of trademark clearance.
