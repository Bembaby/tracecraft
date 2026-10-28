# Current increment: verified email, Vercel and curriculum

October 28, 2026. `npm run check`, `npm test`, `npm run build` and `npm audit --omit=dev` pass. There are **224 passing tests, 0 failures, 0 skips**, and no known production dependency vulnerabilities in that audit. CI now installs the pinned dependencies before checks on Ubuntu/Node 22 and Windows/Node 24.

The added tests use real Better Auth with an in-memory SQLite database, hashed one-time codes and actual session cookies. They cover expiry, three wrong guesses, resend throttling, unverified-user denial, cross-user isolation, token-free JSON, Origin/header enforcement, route allowlisting and account deletion. Sender tests cover bounded retry with one idempotency key. Curriculum tests reject missing lesson contracts, invalid prerequisites and dangling lesson references; saved self-checks remain separate from code passes.

An explicit `scripts/verify-postgres.mjs` run passed against the provisioned Neon database. Disposable synthetic accounts exercised the actual email-code auth handler without sending mail, concurrent inserts produced one success and one conflict, a new store instance read the saved revision, a second owner could not read it, concurrent quotas stayed bounded, and deletion cascaded to sessions/progress. The script cleaned its records.

Local browser observations: requested a synthetic code through the normal form, verified it, observed the verified account and sync controls, changed to week 6, saved a self-check and note, reloaded and recovered both. At 390px, document client/scroll widths were both 375px and the new mobile menu exposed all core workspaces. Desktop and narrow curriculum layouts were inspected. The design detector found no regex findings in the five changed UI files; parsed-page contrast rules did not run, so that is not a full accessibility pass.

## Observed Vercel deployment

The production deployment at [tracecraft.dev](https://tracecraft.dev) reached READY from feature commit `b1579c3`. Vercel reported the domain verified with correct DNS; HTTPS returned the app publicly. Registrar contact verification is confirmed. `/api/health` read the actual database successfully, `/api/session` reported email-code accounts, and anonymous progress returned 401. Responses included the intended security headers and private API responses used `no-store`. Ubuntu/Node 22 and Windows/Node 24 CI passed for this commit.

Using Resend's official labeled test recipient, the browser requested a real code through the public API. The provider reported delivered test status. Entering that code created a verified account and a working session. A milestone note and self-check saved as revision 1; after changing local text, reviewed restore reloaded the original saved evidence. The synthetic account was isolated from learner data and removed after verification. This is a provider delivery simulation, not evidence of a real recipient's inbox placement.

The deployed SQLite 3.54.0 worker passed all three retry-safe-insert fixtures. The full Python worker loaded under the production CSP, passed owner-scoped-read assertions and produced 36 actual trace frames without console errors. At 390px the design starter completed 300/1,000 requests per second; editing cache hits to 80% completed 1,000/1,000 and passed 57/57 modeled checks. Account review and design had equal 375px client/scroll widths. The daily timer changed to Pause session while running, then returned to Start / resume at 119:59 after navigating away and back, without recording a completed day. Desktop and narrow review screenshots contain only a synthetic identity: [desktop](screenshots/tracecraft-live-sync-desktop.jpg), [narrow](screenshots/tracecraft-live-sync-narrow.jpg).

Screen-reader studies, a full device matrix, provider-backup restoration, sustained load and adversarial security qualification remain separate gates. The final follow-up changes only loading copy and documentation; production release metadata is recorded in the handoff.

## Earlier increment: optional GitHub sync and backend practice

The following is historical evidence for the preceding source increment. Its deployment limitations do not describe the new email account adapter.

Verified locally on October 28, 2026 from the updated feature-branch source. This is alpha source evidence, not a deployed account service, live GitHub consent result, security audit, or accessibility certification.

## Automated checks

`npm run check`, `npm test`, and `npm run build` pass on Windows with Node 24.15. The final local suite has **216 passing tests, 0 failed, 0 skipped**. All 12 SQL reference solutions pass changed fixtures and all deliberate bugs fail. All 8 Python solutions pass their exact harness assertions in local CPython; all deliberate bugs fail. The system design engine arithmetic and all six challenges remain unchanged and pass the retained suite.

Baseline inspection preceded edits. Syntax and build passed, but the SQL suite failed on Windows because URL.pathname duplicated the drive prefix in the WASM filename. `fileURLToPath` fixes this. The local Python test executable now defaults to `python` on Windows, avoiding false coverage through skipped `python3` tests. CI now includes Ubuntu/Node 22 and Windows/Node 24. Remote CI status must be observed separately.

The new progress suite verifies configuration, supported snapshot schemas, credential-field allowlisting, runtime/content metadata, recovery backups, local-change conflicts, storage-quota abort/rollback, durable SQLite reopen, owner scoping, single-use browser-bound expiring OAuth state, hashed/expired sessions, Secure/HttpOnly cookies, failed provider exchange, foreign-Origin denial, required request headers, malformed/oversized bodies, and stale revision rejection. A real HTTP server with mocked GitHub token/user responses exercises two app sessions for one identity and another independent identity, export, logout, and account-data deletion including all sessions. These tests do not contact GitHub.

## Observed browser checks

| Area | Observed result |
|---|---|
| Before edits | Inspected daily, SQL, Python and design workspaces; real SQLite initialized; design starter completed 300 of 1,000 req/s |
| New SQL lesson | Retry-safe insert solution passed all three fresh fixtures in SQLite 3.54.0; loading the deliberate overwrite bug failed the existing-result fixture |
| New Python lesson | Owner-scoped lookup passed the actual browser CPython assertions with 36 source-linked frames; no browser console errors observed |
| Complete backups | Downloaded native JSON, selected that file through the browser file picker, reviewed replacement counts, restored, reloaded, and retained the saved SQL draft; invalid JSON was rejected before replacement |
| Authenticated review UI | An isolated loopback-only test harness seeded a synthetic account session against the real API. Saving a journal, editing the local copy, then restoring recovered the saved text. No real GitHub login was used for this UI check |
| Narrow review | At 390px, document client/scroll widths were both 375px after the scrollbar. Copy comparisons stack vertically, actions remain reachable, and Tab moves from local export to account restore |
| Narrow SQL | At 390px, document client/scroll widths were both 375px; the new exercise ran and checked successfully |
| Desktop review | Inspected at 1440px; saved screenshots use a synthetic identity and contain no personal progress |
| Design and daily regression | At 390px, an 80% cache hit rate completed all 1,000 req/s and passed 57/57 checks. Failure invalidated the pass; undo and reload restored 80%. Graph keyboard movement and the table view worked. The daily timer paused when navigating to sync; new backend links were visible in Developer path |

Screenshots: [desktop account review](screenshots/tracecraft-progress-sync-desktop.jpg) and [narrow account review](screenshots/tracecraft-progress-sync-narrow.jpg). The temporary synthetic-session harness is ignored, is not a production authentication route, and is not part of the shipped build. The design detector reported no findings for the changed UI. Both prohibited dash characters were removed from remaining authored UI/documentation text.

## Remaining deployment and broader gates

Live GitHub consent/callback verification requires a registered OAuth app, server-side client credentials, an exact configured origin, and a private durable server volume. None was provisioned or deployed in this increment. The existing static Site still uses local mode. The account service remains a single-instance SQLite alpha with explicit whole-snapshot synchronization, no automatic merging, and no background upload. Full browser matrices, screen-reader study, adversarial/public-service hardening, hosted backup restoration, and operator backup retention remain separate work. See [PROGRESS_SYNC.md](PROGRESS_SYNC.md).

# Quality report: v0.3 alpha

Updated October 28, 2026. This release adds the redesigned workspace and interactive system design lab to the existing SQL/Python app. Evidence below describes the tested source, not a security or accessibility certification.

## v0.3 automated verification

`npm run check`, `npm test`, and `npm run build` passed. The expanded Node runner recorded **203 tests passed, 0 failed, 0 skipped** across six suites: 130 retained tests, 53 system design engine/content tests, and 20 design-state/import tests.

The design suite checks request conservation, actual graph connectivity, cache read/write behavior, rate limiting, healthy load-balancer targets, finite queue buffers, unequal-worker queues, graph validation, and public requirement evaluation. All six reference designs pass all 19 authored workload cases. All six deliberate bugs and all six incomplete starters are rejected. The state suite covers backup round-trips, malformed and prototype-related input, safe incomplete drafts, bounded history, and independent snapshots.

## v0.3 browser observations

The actual directory app was served in the managed browser. The following interactions were observed:

| Area | Observed result |
|---|---|
| Daily session | Redesigned assignment, two-hour timer, evidence counts, agenda, review queue, and journal rendered with preserved local progress |
| Catalog bottleneck | At 1,000 req/s, the starter completed 300 and failed 700. Editing the read-hit rate to 80% reduced database input to 280 req/s, completed all 1,000, and passed 57/57 baseline/variant requirements |
| Configuration editing | An input/blur issue discovered in browser QA was repaired; numeric controls now update the live model as valid input changes |
| Failure and stale feedback | Taking the cache offline changed completion to zero and visibly invalidated the previous passing check. Undo restored the prior configuration |
| Connections | The inspector's destination selector added the missing app-to-database edge in the request-path challenge, which passed 54/54 public requirements |
| Table equivalent | Node state and directed connections were visible in the Connections & data view |
| Keyboard movement | ArrowRight moved a focused cache node from x=600 to x=610 without losing keyboard focus |
| Worked design and failover | Loading the three-server worked graph recorded solution assistance. Disabling API A sent 300 req/s to each surviving server and still completed all 600 requests/sec |
| Persistence | Reload restored the selected challenge, graph configuration, failed-node selection, and recorded attempts from native browser storage |
| Writing preference | Original project text contains no U+2014 characters or HTML/JavaScript encodings of them. The Site display title is TraceCraft: Daily Developer Practice. The browser showed Pending for simulation metrics before a run |
| Narrow layout | Actual source modules rendered in isolated 390px and 768px iframe viewports. The 390px design page had equal document client/scroll widths (375px after scrollbar); its 690px diagram scrolled within its 337px board viewport. Mobile Run simulation worked. This is viewport QA, not a native iOS/Android test |

Preview images are in `docs/screenshots/`. The responsive harness was temporary and removed before final packaging; production frame-protection headers were unchanged. Browser test data is stored only on the preview origin and is not shipped as learner progress.

## Remaining limits

- No authenticated application accounts or cross-device progress synchronization exist. Original tools, training, and system design have three documented local stores and separate backups.
- Backup parsing and round-trip validation have automated coverage. A native file-picker export/import round-trip and full browser/device matrix remain future release checks.
- The graph is a deterministic teaching model, not a measured service, load test, availability forecast, latency SLO validator, or secure grading system. Its check labels are practice evidence.
- Remote source/publication status is reported separately in README and the handoff. Local build/test success does not establish remote CI or production deployment.

## Retained v0.2 evidence

The following earlier report documents the initial real SQL/Python release. Its browser observations apply to those runtime features; it is retained for context and does not add new v0.3 coverage.

# Quality report: v0.2 alpha

Updated October 28, 2026. This report distinguishes automated checks, actual browser observations, pending release verification, and historical evidence. It is not an accessibility certification, production security audit, adversarial isolation assessment, or validation of learning/hiring outcomes.

## Current automated verification

JavaScript syntax checks passed. All four Node test files passed, and an expanded run with `node --test --test-isolation=none tests/*.test.mjs` recorded **130 tests passed, 0 failed, 0 skipped**. The directory build also completed successfully.

| Suite | What it checks |
|---|---|
| `tests/engine.test.mjs` | Retained Mini-Python exercises and deliberate bugs, interpreter limits/semantics, source mapping, snapshots, retrieval, and original curriculum links |
| `tests/sql.test.mjs` | Actual vendored SQLite execution, every SQL solution and deliberate bug, changed fixtures, foreign-key/other constraints, duplicate preservation, mutation/schema checks, bounds, query plans, controller cancellation and reset |
| `tests/python-contract.test.mjs` | Controller deadlines/cancellation/retry with a controlled worker, and the exact embedded harness executed in local CPython for authored drills, functions/classes/slices, exceptions, trace timing, limits, and fresh namespaces |
| `tests/training-state.test.mjs` | Training-state import validation, assistance records, attempt evidence, and review scheduling including same-day behavior |

The six authored Python solutions passed their real local CPython assertion checks; all six deliberate bugs were rejected. Local CPython testing verifies the harness and exercise behavior, but it does not establish that the browser can download and initialize the pinned Pyodide distribution. The latter is a separate live check.

The static build now preserves a directory of modules, worker scripts, and WASM assets. The alternate `tracecraft-preview.html` is no longer standalone. The legacy single-file smoke test is not a current release gate.

## Current browser observations

These observations used the managed browser against the actual served application, rather than the historical Playwright `set_content` approach.

| Interaction | Observed result | Scope |
|---|---|---|
| Desktop Daily session | Visually inspected | New dashboard, two-hour routine, assignments, evidence/review presentation |
| SQL initialization | Successful | Actual browser engine reported SQLite 3.54.0 |
| Schema creation, seed inserts, and join | Successful | A complete multi-statement program created the schema and returned the three expected join rows |
| SQL fresh-fixture checks | Passed for the observed schema exercise | Checks ran separately against fresh fixtures |
| Missing-constraints deliberate bug | Rejected | The checker detected that correct-looking output without the required schema constraints is insufficient |
| Real Python runtime | Successful | Browser downloaded the pinned runtime; classes, separate instance state, and slicing returned expected output |
| Python assertions and traces | Successful | The workout-class assertions passed; 50 source-linked frames were produced |
| Python timeout | Successful | An infinite loop was terminated with the documented 5-second execution-limit message |
| Stale result invalidation | Successful | Editing passing Python code immediately replaced the old result with a request to run the new version |
| Native draft persistence | Successful for observed Python draft | Reloading the served page restored the actual editor draft from browser storage |

This is a concrete smoke-check record, not a claim that every route, every exercise, every device, or every failure path has been tested interactively.

## Release verification still in progress

- Broaden browser checks to other Python exercises and error recovery as needed; the actual runtime, one assertion exercise, tracing, and timeout are already observed above.
- Inspect narrow-screen layouts, long result tables, editors, navigation, and keyboard controls; no current mobile observation is claimed yet.
- Exercise native localStorage persistence after reload, training export/import, failed imports, and restoration of drafts/notes on the served origin.
- Verify timer pause/resume and background-tab behavior in the browser; confirm time alone cannot mark a lesson complete.
- Source syntax checks, all four test files, the expanded 130-test run, and the directory build passed. No remote CI run is claimed.
- Remote publishing and GitHub branch-save calls were interrupted. Read-only follow-up confirmed no saved Site version and no remote feature branch. The updated source is delivered locally; no live deployment or hosted-browser success is claimed.

## Scope and limitations

### Runtime checks

SQL uses a disposable browser-local SQLite database. It does not test MySQL/PostgreSQL server accounts, concurrent connections, production isolation, backups, or restore operations. Those are explicit assignments in a separate local learning project.

Python code runs locally in a worker after a runtime download, but the browser interpreter is a different environment from the local CPython used by contract tests. Runtime startup, CDN availability, WASM compilation, MIME types, Content Security Policy, browser engine behavior, and cancellation must be checked in that environment. No general desktop-package compatibility or hard browser memory quota is claimed.

Worker cancellation and resource bounds support ordinary personal practice. They are not proof of security against hostile arbitrary code, browser vulnerabilities, malicious grading clients, or multi-tenant attacks. Public assertions and fixtures are inspectable practice evidence.

### Progress and identity

Training state and original visual-lab state use separate localStorage keys. Training backup import validates its supported structure and replaces training state; it is not a merge or cross-device synchronization service. The current import size cap is 64 MB. Attempt history retains the latest 500 checks; review summaries and the per-day journal are separate. Export regularly if full earlier attempt history matters. Exported backups contain learner code and notes and should remain private unless the learner chooses to share them.

A display name is not an account, and a private hosting gate is not a cloud progress backend. No custom account API, cross-user progress store, server-side execution service, or paid provider integration has been added.

### Remaining broader checks

No full browser matrix, native iOS pass, screen-reader study, 200% text-zoom audit, formal contrast/touch-target audit, comprehensive fuzzing, sustained load/memory test, or measured learning-effectiveness study is claimed. Optional microphone/speech services and Three.js/Anime.js also retain their earlier device/network-specific verification limits.

## Reproduce the current checks

```bash
npm run check
npm test
npm run build
npm start -- --dist --host 127.0.0.1 --port 3000
```

Use Node.js 22 or later. Local CPython is used by part of the Python contract suite; set `TRACECRAFT_PYTHON` if `python3` is unavailable. Check the test output for explicit skips rather than treating missing-runtime skips as Python verification.

Open `http://127.0.0.1:3000` in a normal browser. Verify SQL with actual edited code, then enable and run Python with an internet connection. Serve the entire build directory. A `file://` preview or an HTML file without its worker/WASM assets does not exercise the supported application.

The included `_headers` expresses intended headers for hosts that support that format. Hosting behavior must be checked independently; merely generating the file does not prove a platform applies it.

## Historical evidence: v0.1 on September 8, 2026

The earlier alpha recorded 78 passing Node tests and 25 Playwright interaction checks against an inlined single-file build, plus narrow-screen observations at 390px and 760px. Those checks covered the original seven routes, bounded Mini-Python runtime, public fixture behavior, demos, studio, settings, and local-state serialization using a test double.

That earlier environment used `set_content` because browser navigation was restricted. Its screenshots and tests were evidence for that older source/build. They are **not** current v0.2 browser passes, do not cover the new SQL/Python workers, and do not establish native storage persistence or the pinned CDN under today’s CSP. The old `tests/browser_smoke.py` remains a historical tool and should not be presented as validating the new directory build without being updated.

The repository has since been published on GitHub. Old statements that no repository existed describe the earlier preparation environment; they are no longer current. No remote Actions result is inferred from local tests.
