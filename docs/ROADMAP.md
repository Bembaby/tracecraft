# Build roadmap with acceptance gates

Updated October 28, 2026 for the **v0.3 alpha**. This roadmap distinguishes implemented source, observed verification, and proposed work. The public [Bembaby/tracecraft](https://github.com/Bembaby/tracecraft) repository exists. A source change, a saved hosting version, a successful deployment, and a passing remote CI run are separate events; none should be inferred from another.

## Current source increment: verified accounts and a mature backend path

Implemented on the feature branch: verified email-code login, Better Auth HttpOnly sessions, owner-scoped Postgres snapshots, atomic revision conflicts, explicit save/restore, complete backups, recovery and deletion. Vercel hosts the API; Neon free storage and a verified Resend sending subdomain are provisioned. Local mode and the earlier GitHub/SQLite adapter remain available. Two SQL and two Python exercises add retry-safe writes, cursor pagination, payload validation and owner-scoped reads.

Eight milestone guides add prerequisite evidence, explicit practice environments, linked executable lessons, 56 sessions, changed-requirement gates, saved notes and self-assessments. The authoring validator rejects incomplete runnable lesson contracts and broken curriculum links. The mobile menu makes core workspaces reachable without horizontal navigation.

The local suite has 224 passing tests. A real Postgres check verifies ownership, concurrent-save conflicts, durable reads, atomic quotas and cascading deletion using disposable synthetic records. Deployment, delivery, desktop and narrow-screen observations are recorded separately in [QA.md](QA.md). Inbox access is not identity certification. See [PROGRESS_SYNC.md](PROGRESS_SYNC.md).

## Milestone 0: Original visual learning alpha: retained

Eight original numeric Mini-Python exercises, public fixtures and deliberate bugs, source-linked post-operation traces, line-block reordering, 13-stage topic map, three systems concept demos, reading links, four interview prompts, optional browser voice, optional visual libraries, and original local progress remain available under separate navigation links.

These tools keep their existing limits. Mini-Python is a teaching subset, the retrieval demo is keyword matching without generation, and the old relational-filtering demo applies a JavaScript predicate. The new SQL and Python labs are distinct implementations.

## Milestone 1: Daily developer practice: implemented in v0.2

### Daily work and evidence

- A 120-minute session with 110 minutes of work and a 10-minute break.
- Seven check-in blocks, a concrete assignment, evidence notes, and an explicit next step.
- A 56-day path covering SQL, Python fundamentals, local database ownership, a Java/Spring feature, tests, debugging, deployment rehearsal, distributed-system behavior, and interviews.
- Suggested competency gates and repeated independent attempts rather than a promise of mastery on a date.
- Drafts, explanations, checked attempts, recorded in-app assistance, and retries scheduled at 1, 3, 7, and 14 days.
- Validated JSON export/import for training state, retaining the original visual-lab state separately.

### Real SQL

Ten original exercises run against SQLite through a vendored sql.js worker. Tasks cover schema/constraints, filtering, inner/left joins, grouping, NULL/absence, window queries, updates, rollback, and indexes/query plans. Checks use changed fresh fixtures and inspect query results or database state. Source/output bounds, cancellation, and worker deadlines are implemented.

### Real Python

Six original exercises run through a pinned, explicitly enabled Pyodide module worker. Classes, functions, strings, collections, slicing, and exceptions use CPython semantics. Assertion checks and source-linked traces record actual execution; the controller bounds startup, execution, output, and traces. Local CPython harness verification and browser CDN/WASM verification are separate checks.

### Design conversations

Six original architecture scenarios require an initial written answer before viewing a comparison. Rubrics address concrete boundaries, operational costs, compatibility, timeouts, retries, duplicate delivery, data ownership, and failure recovery. They remain self-assessed, not AI-graded.

**Acceptance gate:** a learner can open the daily task, write and run code, inspect a failure, use help with an honest record, explain the result, export progress, and return for a changed or delayed attempt. [QA.md](QA.md) records which parts have been observed and which remain to verify.

## Milestone 2: A clearer workspace and interactive system design: implemented in v0.3

The shared workspace has grouped navigation, neutral charcoal surfaces, restrained lime accents, more consistent type, and a daily page centered on the next assignment and session. Existing SQL/Python tools and original learning features remain available.

The system-design lab adds:

- Editable components and directed connections, drag/keyboard positioning, inspector controls, canvas/table views, and session undo/redo.
- Traffic, read/write mix, duration, and component-failure controls that affect a deterministic calculation over the current graph.
- Distinct completed, rejected, failed, and pending rates, plus configured-path mean latency estimates.
- Six original challenges covering caches, failover, admission limits, finite queues, changed write load, and a simple end-to-end request.
- Nineteen baseline and changed-workload cases, public behavior/configuration checks, reference designs, and deliberate failures.
- Saved design drafts, self-assessed explanations, recorded assistance, bounded recent checks, and a separate validated backup with import review.

The model's limits are deliberate. It does not benchmark infrastructure, calculate p99 latency, validate data ownership, prove durability, or grade production readiness. A separate queue phase, cache freshness, retries, idempotency, and richer service semantics remain future work. Use [SYSTEM_DESIGN_LAB.md](SYSTEM_DESIGN_LAB.md) and [SIMULATION_MODEL.md](SIMULATION_MODEL.md) as the current contracts.

**Acceptance gate:** edit a connection or capacity, observe the calculated consequence, introduce a failure, check changed workloads, explain the limitation, and restore a saved design. Automated model checks and observed UI coverage are recorded separately in [QA.md](QA.md).

## Release verification: Private publication

Use the existing private Site identity for publication. A live URL, successful deployment, and a remote CI result each require their own confirming operation; consult the deployment record and final delivery result.

Use the latest QA observations to identify the remaining release work; earlier SQL/Python browser checks are retained historical evidence, not proof of the redesigned version on every device. Verify graph/table and keyboard operations, narrow-screen layout, persistence and backup replacement, and final checks/builds. Validate hosted asset paths and worker behavior when publication is available. Preserve the existing/private audience and keep progress backups and personal notes out of source control.

The static directory must be served over HTTP(S). The retained `tracecraft-preview.html` is an alternate entry into that directory, not a portable single-file application.

## Next milestone: Reliable continued practice

1. **Runtime/browser coverage.** Exercise startup failure, cancellation, retry, output truncation, tab navigation, and loading recovery in supported desktop and mobile browsers. Verify native storage behavior rather than relying only on in-memory test doubles.
2. **Better evidence portability.** Review backup replacement UX, partial recovery, schema versions, and deletion behavior across the separate legacy, training, and system-design stores. Keep export understandable and validate imports strictly.
3. **Lesson authoring contract.** Formalize content revisions and validators for prerequisites, exact input/output contracts, original explanations, fixture coverage, deliberate bugs, sources, and execution support. The present reviewed exercises do not imply hundreds of completed lessons.
4. **Teaching based on errors.** Add a small number of useful task variations where observed attempts show a need. Preserve the distinction between answer exposure, passing checks, later independent work, and self-assessed explanations.
5. **Accessible editor and traces.** Improve source selection, keyboard instructions, text zoom, and trace navigation while retaining a plain-text fallback. Object identity and full call-stack/heap visualization remain further work; current Python traces use bounded summaries.

**Gate:** a learner can resume after interruptions, recover from runtime errors, move progress with a tested backup, and complete an unfamiliar variation without the prior answer visible.

## Account milestone: implemented source, ongoing operations

The current feature branch implements verified email accounts and durable reviewed progress. Preserve this boundary and finish operational qualification before broad public-service claims:

- Keep a supported authentication flow with a clear data model and authorization boundary.
- Persist attempts, assistance, explanations, reviews, and content/runtime versions under the correct owner.
- Test cross-user denial, export, deletion, synchronization conflicts, and local-only use.
- Avoid an anonymous writable shared database.
- Keep provider configuration and any secrets server-side; never request browser session cookies or save API credentials in localStorage.

**Gate:** progress survives device changes, concurrent updates have defined behavior, and users cannot read or mutate one another’s private records. Choose any paid provider, region, and budget explicitly before enabling charges.

The [Codex handoff](CODEX_HANDOFF.md) contains the source map, current storage boundaries, existing hosting identity, and focused implementation prompts for continuing this work.

## Later milestone: Deeper backend and systems labs

The current path assigns real local MySQL and Java/Spring work; the browser does not execute or certify those project steps. Add instrumented labs only where they produce observable behavior:

- Database migrations, constraints, concurrent transactions, query plans, backup and verified restore.
- A complete API feature with validation, authorization, persistence, tests, and an investigated failure.
- Cache freshness, bounded retries, idempotency, queues, event delivery, and compatible service contracts.
- A Java runtime or isolated execution adapter with its own semantics and limits, if target-role needs justify it.
- Original algorithm exercises and changed constraints after fundamental coding fluency is established.

**Gate:** each claimed skill is supported by a reproducible experiment or code change, relevant tests, an explanation, and a limitation. A checklist or architecture diagram alone does not meet it.

## Later milestone: Optional source-grounded tutor

A real tutor/voice integration remains proposed. Start with one approved provider and licensed/original lesson sources. Filter permissions before retrieval, preserve source versions, distinguish retrieval quality from answer quality, and evaluate ordinary, unsupported, contradictory, and malicious inputs. Label human/self/AI feedback separately and ground it in the learner’s actual attempt.

Use supported credentials, short-lived browser authorization where applicable, cancellation, quotas, retention rules, and explicit budgets. Consumer subscriptions are not general API credentials. No paid provider, live voice service, or RAG claim is added by v0.3.

**Gate:** feedback can point to the observed attempt and relevant sources, unsupported answers are handled explicitly, authorization holds, and usage/cost controls work under failure.

## Longer-term work

Community review, collaborative debugging, project events, specialist courses, and commercialization require demonstrated learner value plus appropriate moderation, content rights, privacy, accessibility, and operating controls. They should not displace the small daily loop that is useful now.

The roadmap is a sequence of engineering decisions and acceptance gates. It does not certify expertise, predict hiring outcomes, or claim work has been deployed merely because its source exists.
