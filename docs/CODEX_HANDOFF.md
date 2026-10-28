# TraceCraft: continue in Codex

This checkout contains the daily practice alpha, real browser SQL/Python labs, and interactive system design. The current feature branch adds Vercel email-code accounts with Better Auth, Resend and Neon Postgres, reviewed whole-snapshot sync, a mobile menu, and eight evidence-based curriculum milestones. The earlier local GitHub/SQLite adapter remains optional. The user requested deployment from the feature branch and explicitly said not to merge PR #2.

## Start here

Read `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, and `docs/QA.md` before editing. Preserve the existing SQL/Python behavior, original learning content, progress migration boundaries, keyboard access, and honest model labels.

Requirements: Node.js 22.13 or newer and `npm ci`. Vercel uses Node 24. Plain local startup does not enable hosted accounts; follow [PROGRESS_SYNC.md](PROGRESS_SYNC.md) for migrations and hosted configuration. Never print or commit `.env.local`.

```bash
npm ci
npm start
```

Open `http://127.0.0.1:3000`. Useful routes are `#today`, `#sql`, `#python`, `#design`, `#architecture`, and `#developer-path`.

```bash
npm run check
npm test
npm run build
node --test --test-isolation=none tests/*.test.mjs
```

The last command expands the individual Node test results on runtimes whose default reporter groups by test file. Python contract tests also use a local `python3`, or the `TRACECRAFT_PYTHON` environment variable. Read explicit skips rather than counting them as successful Python verification.

Serve the whole build over HTTP(S), including module scripts, workers, and WebAssembly files:

```bash
npm start -- --dist --host 127.0.0.1 --port 3000
```

Stop an existing server on the same port first. The alternate `tracecraft-preview.html` is an entry into the directory, not a standalone downloadable application.

## Code map

| Files | Purpose |
|---|---|
| `src/app.mjs` | Shared shell, navigation, and retained visual/debugging/interview tools |
| `src/styles.css`, `src/design.css`, `src/system-design.css` | Existing component styles, redesigned workspace, and system-design canvas/inspector/table layouts |
| `src/training.mjs`, `src/training-state.mjs` | Daily session, SQL/Python workbenches, reviews, help records, and training backup behavior |
| `src/training-content.mjs` | 56-day sequence, full-Python drills, and architecture prompts |
| `src/curriculum.mjs` | Eight milestone guides, prerequisites, evidence, reflection prompts and runnable lesson links |
| `src/progress.mjs`, `src/email-signin.mjs` | Email-code forms, account review, explicit save/restore, complete backups and deletion |
| `api/index.mjs`, `server/` | Vercel Web handler, verified sessions, bounded email delivery, owner-scoped Postgres snapshots |
| `scripts/migrate-accounts.mjs`, `scripts/verify-postgres.mjs` | Explicit schema provisioning and disposable synthetic database verification; neither sends email |
| `scripts/validate-content.mjs` | Executable lesson and curriculum authoring contract, also run by `npm run check` |
| `src/sql-content.mjs`, `src/sql-runtime.mjs`, `src/sql-worker.js` | Real SQLite exercises, fixture checks, and worker lifecycle |
| `src/python-runtime.mjs`, `src/python-worker.js` | Pinned Pyodide loading, real Python execution, assertions, traces, and cancellation |
| `src/system-design.mjs` | Graph editing, controls, simulation presentation, challenge checks, explanations, and imports |
| `src/system-design-state.mjs` | Validated local design workspace and practice history |
| `src/system-design-engine.mjs` | Pure deterministic flow model and requirement evaluator |
| `src/system-design-content.mjs` | Six original design challenges, changed workload fixtures, worked examples, and deliberate bugs |
| `tests/system-design.test.mjs` | Engine invariants, limits, failure cases, and challenge contracts |
| `scripts/serve.mjs`, `scripts/build.mjs` | Static serving and complete-directory build |
| `public/vendor/sqljs/` | Vendored SQLite WASM distribution with license/provenance |

Read [SYSTEM_DESIGN_LAB.md](SYSTEM_DESIGN_LAB.md) for the learner and authoring contracts, and [SIMULATION_MODEL.md](SIMULATION_MODEL.md) before changing any simulation arithmetic.

## What is implemented versus still needed

| Area | Current boundary |
|---|---|
| Daily work | Two-hour session, concrete assignments, practice evidence, saved drafts, delayed review suggestions |
| SQL | Real disposable SQLite execution and fresh-fixture checks; not a managed MySQL server |
| Python | Real CPython in a browser worker after a pinned runtime download; not a full desktop environment |
| System design | Editable graph and deterministic capacity/flow estimates with changed workload checks; not a real deployment simulator |
| Progress | Three local stores, complete backups/recovery, and optional account snapshots with explicit conflict review |
| Login | Hosted single-use email codes with verified inbox access and HttpOnly sessions. No OAuth provider needed. The local GitHub adapter remains separate. A display name is still a preference |
| Java/MySQL project work | Assigned in the curriculum and performed in a separate local backend project |
| AI tutor | Not implemented; no paid model, voice, or execution service is required |

The six design challenges include reference graphs that pass their authored workloads and deliberate bugs that fail. Do not replace those tests with a component-count-only score. Keep assistance, checked behavior, and self-assessed explanations separate.

## Recommended next pull requests

### 1. Make continued daily use reliable

Before adding features, reproduce the current tests and inspect the reported gaps in `docs/QA.md`. Focus any new verification on a concrete behavior: narrow-screen graph controls, keyboard navigation, draft recovery, storage failures, backup replacement, or worker cancellation. Do not rewrite the app into a framework solely to change its appearance.

Acceptance: a learner can start a session, complete an actual SQL/Python attempt, edit and check a design, export all relevant work, reload, and recover the same drafts. Edits clear stale results. Keyboard and table controls provide the same meaningful operations as the canvas.

### 2. Verify configured account deployment and deepen sync

The current hosted adapter implements verified email accounts and Postgres snapshots. Preserve explicit sync review and local mode. Follow [PROGRESS_SYNC.md](PROGRESS_SYNC.md) for setup and exact boundaries. Operational database backup/restore and a real recipient's inbox placement remain separate release checks; synthetic delivery tests do not prove inbox placement. Keep the legacy local adapter's tests passing.

Separate at least: user identity, content revision, draft workspace, attempt snapshot, assistance events, explanation, review state, and journal entry. Persist the runtime/model version with checked attempts. Define conflict behavior for two devices instead of silently overwriting newer work.

Acceptance: sign in on a second browser and recover the same user-owned progress; one user cannot read or modify another user's records; export and deletion work; local-only use still works. No passwords, API credentials, or session cookies are stored in browser progress. Do not provision a paid service or enable charges without the user's explicit budget decision.

### 3. Add a real Java/Spring + relational-database project track

Use a small workout journal backend as the learning project. Keep the feature sequence concrete: schema and constraints, JDBC query, service transaction, validated API endpoint, authorization, tests, migration, backup/restore, and a measured failure experiment. Keep synthetic data separate from personal data.

Acceptance: each lesson produces runnable code or a reproducible database operation and states what the check actually proves. A browser checkbox does not certify a local migration, backup, or deployment. Avoid adding microservices before the project has a working end-to-end feature and a specific reason to split a business capability.

### 4. Deepen system-design experiments carefully

Useful future additions include queue recovery over multiple phases, bounded retries, idempotency, cache freshness, service ownership, and versioned API contracts. These require explicit model semantics and counterexamples; adding a box and an animation is insufficient.

Acceptance: each new behavior changes calculated results for the right reason, conserves work, has a text equivalent, and has tests that reject its deliberate failure case. Preserve current results under an explicit model version. Do not label averages as percentiles or convert authored capacities into cloud sizing advice.

### 5. Improve lesson authoring and review

The current validator covers lesson identifiers, prerequisites, HTTPS primary-source links, contracts, fixtures, bugs, solutions and explanations. Runtime suites execute solutions and reject deliberate bugs. Extend this contract when adding new lesson types. Keep source material original or appropriately licensed and version content so an old attempt remains interpretable.

Acceptance: every new exercise's solution passes, its bug fails for the intended reason, and delayed practice can hide an earlier answer without losing the attempt history.

## Progress and privacy boundaries

| Store | Scope |
|---|---|
| `tracecraft:v1` | Original visual/debugging/interview workspace |
| `tracecraft:training:v1` | Daily learning, SQL/Python drafts, explanations, review suggestions, latest 500 checks |
| `tracecraft:system-design:v1` | Design drafts/settings/notes/help and latest 100 checks |

Training and system-design exports are separate. A design backup uses `tracecraft-system-design` version 1 and is limited to 2 MB on import. The import review should show what will be replaced before applying it. Do not commit progress exports, private notes, uploaded interviews, cookies, or credentials into the public repository.

## Repository and hosting continuity

The current public edition is [tracecraft.dev](https://tracecraft.dev), deployed on Vercel from `codex/authenticated-progress`. The linked project is `tracecraft` in the existing `belal-embabys-projects` team. Neon free Postgres is connected, schemas migrated, and `mail.tracecraft.dev` is verified for sending through a restricted Resend key. Secrets live in Vercel and ignored local environment files. The domain is registered for one year with auto-renew off; registrant contact verification is confirmed. Keep PR #2 open and unmerged. The prior private Site below is historical and was not changed by this deployment.

The existing repository is `Bembaby/tracecraft`. The earlier increment used `feature/daily-developer-practice`. The account/progress increment uses `codex/authenticated-progress` from current `main`. Inspect `git status`, current branch, and remotes before committing, pushing, or opening a PR; local changes and a downloadable source archive do not establish that GitHub already contains the changes.

An earlier October 28, 2026 GitHub upload attempt returned HTTP 403 before the `Bembaby` GitHub App installation was connected. This was a historical access issue, not an ongoing constraint. The v0.3 changes were then prepared for a normal pull request into `main`. Check GitHub for the current merged commit and any newer work before starting. The downloadable archive is a source snapshot, not a substitute for checking the current GitHub branch.

A private TraceCraft Site has already been registered with exact project ID:

```text
appgprj_6ae220df305c8191991808428a7ea579
```

Reuse that identity when continuing the Sites workflow. On October 28, 2026, private publication succeeded at https://tracecraft-daily.belal919.chatgpt.site. The first publication of v0.3 used source commit `aeabd54138afd6f4649c9d4627aa7c666ac040ec` in the separate Sites source repository and saved version `appgprj_6ae220df305c8191991808428a7ea579~appgver_de70c3cc569c8191b13bca1a1317b96c`. Subsequent copy corrections may have newer versions. Retrieve the current version and deployment status before a future update. Do not create another Site merely because an expected URL is not live, change its audience to work around deployment, or put source credentials in files or shell arguments.

The repo's `publish:github` helper creates a new copy and is not the update workflow for this existing repository. Use an ordinary feature-branch update or the supported repository connector. A hosting push and a GitHub push are separate operations.

## Pasteable Codex starting prompt

> Continue this TraceCraft checkout. Read AGENTS.md, README.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/QA.md, and docs/CODEX_HANDOFF.md first. Inspect the current branch and working tree and preserve all uncommitted work. Run the current checks and launch the app. Preserve the working SQL/Python labs, two-hour daily routine, original content, graph simulation semantics, and local progress. Start with the first concrete unfinished acceptance gate in the handoff. For account/progress work, implement a supported authentication and user-owned persistence boundary while retaining local mode; verify cross-user denial, sync conflict behavior, export, and deletion. Keep simulation results labeled as educational estimates and do not claim deployment or remote CI without observing it. Make focused, reviewable commits and update the documentation to match the actual result.

For a narrower task, replace the last part with one acceptance gate above. Keep the source that already works and make the next change demonstrable.
