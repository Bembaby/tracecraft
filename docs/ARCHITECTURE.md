# Architecture: prototype now, production boundaries next

## Implemented alpha

```text
Browser
  ├─ original lesson data and UI
  ├─ bounded Mini-Python parser/interpreter
  │    └─ snapshots → source line / variables / output
  ├─ public fixture evaluator
  ├─ toy systems models
  └─ local progress storage
       optional: browser speech service
       optional: jsDelivr → Three.js / Anime.js

Node static server: serves assets only; does not run submitted code
```

The app has no database, account system, cloud execution, LLM inference, or secret store. The build is a copy/inlining operation, not a production bundler. The client modules and single-file preview use the same source. A dependency-free baseline is useful for inspection and reproducible starter behavior, not a long-term argument against frameworks.

### Mini-Python contract

The parser accepts numeric/boolean expressions, flat lists, assignments, selected compound assignments, `for`, `if/else`, and `print`. Built-ins are a bounded subset of `range`, `len`, `sum`, `min`, and `max`. Four-space indentation is required. There is no string/object/module/class/function API, no `eval`, and no conversion into arbitrary JavaScript source.

Limits: 12,000 source characters; 160 lines; 500 trace frames; 50,000 counted operations; 200 list/range items; finite numeric magnitude at most 1e12. Nested lists are rejected, including in fixture overrides, to avoid explosive snapshot structures. Snapshots are post-operation copies. Frames include the original source line. An empty loop records that its body was skipped.

This is a numeric teaching model, not full Python semantics: JavaScript numbers are used, no distinction between arbitrary-precision Python integers and floating representation is preserved, `range` is materialized, and output formatting is simplified. Do not use it to teach precise CPython heap layouts or evaluate arbitrary interview submissions. Large or unsupported input must yield a visible error rather than a fictional trace.

Public fixtures replace the first direct assignment to designated input names. A malicious learner can inspect or bypass these tests. That is acceptable for an explicitly local practice tool, not for ranked contests, certificates, or paid entitlement enforcement.

## Proposed production architecture

```text
Web app / accessible editor
       │ authenticated HTTPS
Application API ── authorization ── PostgreSQL
       │                               ├─ lessons / revisions / sources
       │                               ├─ attempts / concept evidence
       │                               └─ sessions / entitlements
       ├─ job queue → runner control plane
       │                └─ ephemeral isolated execution environments
       │                      Python / Java / SQL
       ├─ tutor orchestrator → approved source retrieval → model adapters
       └─ short-lived voice-session credential → browser realtime channel
```

Start with a modular application, not a microservice for every noun. Separate the **execution security boundary**, however, from the beginning. A web/API deployment platform can host the UI and control plane; it must not be assumed suitable for arbitrary untrusted programs merely because it can run server code.

A TypeScript application and component framework can organize complex lab state, streaming results, authoring, and account flows. Next.js is a candidate rather than an already implemented dependency. PostgreSQL holds relational progress and source metadata; use vector indexing only once a measured retrieval baseline justifies it. The queue carries opaque job identifiers rather than raw credentials. Object storage holds bounded artifacts with short-lived, authorization-checked download access.

### Identity and data isolation

Use an established identity provider with a supported GitHub/OIDC login flow. Authentication answers who the user is; authorization decides which attempts, documents, classrooms, and billing entitlements they may access. Test both. Keep private progress private by default. Sharing is explicit and revocable.

Suggested entities:

- `users`, `profiles`, `organizations`, `memberships`.
- `concepts`, `concept_prerequisites`, `lessons`, `lesson_revisions`, `exercises`, `exercise_versions`, `test_cases`.
- `attempts`, `run_jobs`, `trace_artifacts`, `hint_events`, `explanation_attempts`, `concept_evidence`, `review_schedule`.
- `projects`, `project_evidence`, `mock_sessions`, `self_assessments`, `assessor_reviews`.
- `sources`, `source_versions`, `source_permissions`, `document_chunks`, `ingestion_jobs`.
- `provider_connections`, `usage_ledger`, `plan_entitlements`, `consent_events`.

Persist exercise revision, runtime image digest, input seed, outcome, help mode, and rubric version with an attempt. A result without its version context is difficult to reproduce. Treat traces and voice transcripts as user data with explicit retention, export, and deletion rules.

### Untrusted code execution

These are design requirements, not an implemented or audited security system:

1. The API validates and queues a job. It never runs user Python/Java inline.
2. A dedicated control plane starts a disposable sandbox with a pinned runtime image. Prefer a hardened isolation technology appropriate for adversarial multi-tenancy; evaluate microVMs or a syscall-sandboxed runtime rather than relying on an ordinary container alone.
3. Deny external networking by default. Do not mount host sockets, metadata services, credentials, home directories, or the production filesystem.
4. Use non-root execution, read-only base images, a small disposable work directory, and explicit CPU, memory, process, wall-time, file-count, output-byte, and artifact-byte limits.
5. Kill work that exceeds limits. Cap retries and handle cancellation, queue backpressure, and duplicate jobs with idempotency.
6. Keep judge fixtures in the appropriate server-side evaluation boundary. Separate trusted harness code from submitted source. Validate and sanitize result artifacts before rendering them.
7. Patch and scan runtime images, inspect dependency supply chains, isolate tenants, record audit events, and run adversarial tests before public launch.

A browser WASM runtime can support convenient local practice, but host capabilities and browser APIs still define its security boundary. A Web Worker is helpful for responsiveness and termination, not a universal security proof. A public grader cannot trust a score computed entirely by the client.

### Trace protocol proposal

```ts
type TraceEvent = {
  runId: string;
  sequence: number;
  phase: 'before' | 'after';
  source: { file: string; line: number; column?: number };
  kind: 'assign' | 'branch' | 'call' | 'return' | 'iteration' | 'output' | 'error';
  frames: Array<{ id: string; functionName: string; locals: Record<string, ValueRef> }>;
  objects: Record<string, { type: string; summary: string; children?: ValueRef[] }>;
  stdoutDelta?: string;
  explanationKey?: string;
};
type ValueRef = { primitive: string | number | boolean | null } | { objectId: string };
```

This future representation preserves object identity and call frames, unlike the miniature snapshot dictionary. Stable sequence numbers allow pause/step/replay and discarded duplicate events. All text is escaped, snapshots are size-bounded, and errors are structured. The lesson specifies whether a highlighted frame is before or after an operation; never mix conventions silently.

Full-Python tracing can use controlled instrumentation within the isolated runtime. Java requires a separate versioned instrumentation/debugging strategy. Both need semantic regression tests for aliasing, mutation, recursion, exceptions, and output. Deterministic replay has limits with threads, randomness, wall-clock input, and external I/O; explain or disable unsupported nondeterminism.

### Real RAG tutor

Begin with the original lesson corpus and a keyword baseline. Build a small held-out query set with annotated relevant sources and unsupported questions. Compare lexical, vector, hybrid, and reranked retrieval; measure relevant-source coverage, ranking, latency, and cost separately from answer quality.

Apply identity and document permissions before candidate text reaches the model. Preserve source/edition/chunk identifiers. Retrieved content is untrusted data, not an instruction to reveal secrets or change policy. Generation must cite supporting passages, identify missing evidence, and abstain when necessary. A citation is not automatically a factual guarantee: verify that it actually supports the answer.

Test stale versions, deleted documents, ambiguous questions, low recall, contradictory sources, malicious source instructions, and cross-user access. Deletion must remove raw files, chunks, indexes, caches, and derived artifacts according to policy. See CONTENT_POLICY.md.

### Quality and cost controls

Instrument errors and performance without logging raw private code or voice by default. Use a request ID and explicit retention. Budget per run, lesson, voice session, and user. Store a usage ledger with idempotent accounting; quotas belong server-side. A daily app budget must stop provider calls even if the client UI is modified.

No pricing or uptime target is promised here. Benchmark actual runtime startup, compilation, trace size, provider latency, and mobile behavior before choosing infrastructure tiers. The strongest initial optimization is keeping a lesson comprehensible and the default path inexpensive.

## Primary technical references

- Python tutorial and semantics: https://docs.python.org/3/tutorial/ and https://docs.python.org/3/reference/
- Java language, collections, JVM, and tooling: https://dev.java/learn/
- PostgreSQL tutorial and manual: https://www.postgresql.org/docs/current/tutorial.html
- Pyodide worker architecture (verify current initialization API before implementation): https://pyodide.org/en/stable/usage/webworker.html
- Three.js rendering: https://threejs.org/docs/pages/WebGLRenderer.html
- Anime.js API: https://animejs.com/documentation/
- OpenAI realtime browser connection: https://developers.openai.com/api/docs/guides/realtime-webrtc

The security architecture above is a proposed set of engineering constraints, not a vendor certification or a claim that one linked tool provides them all.
