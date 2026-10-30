# API adventure: release verification

October 29, 2026 (America/New_York). This release is delivered through [PR #2](https://github.com/Bembaby/tracecraft/pull/2). The owner explicitly requested merge and deployment, superseding the historical no-merge notes below.

The new `#apis` path has nine tracks, 46 original lessons, 138 recognition questions, eight deterministic request models, one actual same-origin health-response inspector and five-question review. [API_ADVENTURE.md](API_ADVENTURE.md) records the complete course map, analysis of the full video captions and selected chapter visuals, primary-source corrections, and model/real-project boundaries. Existing Python, SQL, browser Java, system design and other learning paths remain available.

`npm run check`, `npm test` and `npm run build` pass: **656 passed, 0 failed, 0 skipped**. Local author verification used CPython, vendored SQLite and JDK 25. CI now installs pinned official setup-java v6/Temurin 25 so the Java reference/bug checks run on Ubuntu/Node22 and Windows/Node24. No dependency or paid infrastructure was added for the API course.

The new tests independently check the 46 blank answers, important protocol distinctions, original question authoring contracts, all model presets and changed/edge behavior. REST tests include ownership, strict JSON types, required/full updates, pagination, retry scope and ETags. Other model tests cover XML parsing, RPC arity/deadline/cancellation, partial GraphQL errors, distinct webhook effects, pending socket messages, 96 RTC assumption combinations and SSE multiline/gap recovery. State tests cover revision invalidation, assistance, XP deduplication, review caps, independent HTTP/REST checkpoints, allowlisted drafts, escaped notes, failed device saves and complete backup/account validation. Actual application startup is checked behind the gate and at API overview, lesson and lab routes.

The [browser ledger](API_PHONE_ROUNDS.md) records 52 cycles, 46 passing (45 phone-width checks and one desktop check). Four initial failures were test-wording assumptions; two identified application defects that were fixed and retested. The fresh finish reviewer found one additional numeric-input recovery edge case. It was corrected, covered by a behavioral regression and retested on the 320px browser view. The reviewer scored that single fix resolved with disposition `ship`; its verdict pass was limited to that correction. The independent documentary comparison preserved DESIGN.md and its sidecar. Remaining palette/type/radius detector findings are advisories in the existing arcade world. Documentation drift in quick-question-only XP descriptions and the narrower prose-measure description was reported without rewriting the design system.

Browser observations used synthetic verified-email accounts and an in-memory loopback store with the actual hosted handler and production CSP. Wrong/correct answers, tap/keyboard blanks, literal HTML/Unicode notes, resume, edited requests, invalid/empty inputs, optional path diagrams, reviewed account save/restore, reduced-motion preference and visible keyboard focus were checked. API position, notes and lab draft survived account restore. No browser console errors were observed. No physical phone or screen reader is claimed.

Production deployment **`dpl_B4cgZQNKW9MkMMFV523gfBSQ7Piv`** is READY at **https://tracecraft.dev**, built from the verified feature working tree. All **131** public assets match the local production build by SHA-256. `/api/health` returns 200/ok, `/api/session` confirms email-code accounts, and anonymous `/api/progress` returns 401. The live `#apis` phone entry requires sign-in and states the five-minute, one-use code and remembered server session. The account system uses its existing infrastructure; no new external email or signed-in production walkthrough was performed for this course release. Signed-in API course and owner snapshot behavior were checked on loopback. The previous production deployment `dpl_298MSpvRvx5Gn8H2mFMpb7J57zji` remains the rollback point.

Final synthetic captures: [desktop](screenshots/api-adventure-desktop.png), [phone lesson](screenshots/api-adventure-phone.png), [phone feedback](screenshots/api-answer-phone.png), [320px lab](screenshots/api-lab-small-phone.png). Earlier sections below are historical verification records.

# Arcade-everywhere game layer: verification

October 29, 2026 (America/New_York). At the owner's request the whole app now uses the arcade world (navy, lavender, lime, quest tiles, pixel robot), lessons play as step-by-step levels, and the shell shows a level, practice-XP and streak HUD. Design authority is [DESIGN.md](../DESIGN.md); product truth is [PRODUCT.md](../PRODUCT.md). This is a source and loopback observation record, not deployment evidence.

What changed:

- `src/game.css` is the final stylesheet layer. Older layers had near-neutral charcoal colors remapped to the navy family at equal OKLCH lightness, and 9 to 11px interface text raised (system design canvas minimum 11px). Decorative uppercase kickers above headings were removed; informative labels are sentence case.
- `src/lesson-stages.mjs` enhances rendered TCS, beginner and interview course articles: one stage at a time, Back/Continue, a clickable lesson map, "Show whole lesson", focus moved to each stage heading, and a polite live stage count. Nothing is locked, nothing is recorded, and finishing focuses "Mark lesson read" without marking it. Without MutationObserver the lessons stay full pages.
- `src/game-stats.mjs` derives XP and level from the existing first-correct quick-question records (unchanged rule: 10 XP each, a level per 6) and the streak from local days holding a checked runnable attempt, a first-correct quick question or a checked coach scenario. Read marks and notes never count. `tests/game-stats.test.mjs` covers these rules.
- `src/game-fx.mjs` reacts only to results modules already decided (TCS checks, quick questions, SQL/Python/Java checks, coach scenarios): opt-in synthesized chime (off by default), a 22-piece confetti burst, and a decorative robot reaction. Reduced motion removes confetti and guide animation.
- `public/images/arcade-guide-sm.png` is a 440px resample of the existing robot (148 KB instead of 743 KB), used wherever the robot appears.

`npm run check` and `npm run build` pass. `npm test` passes **613 passed, 0 failed, 0 skipped** with `TRACECRAFT_JAVA`/`TRACECRAFT_JAVAC` pointed at the ignored local JDK 25; without them the 21 Java author-verification tests skip as designed.

Loopback browser observations (existing synthetic-email harness, Chrome via Playwright, 1440, 1690 and 390 px): a TCS lesson advanced stage by stage with focus on each heading; a wrong then right recognition check showed "Revisit this claim" then "This claim is supported" with confetti and the lesson-panel robot reacting; Finish focused "Mark lesson read"; whole-lesson mode showed all seven stages; a correct quick question moved the HUD from 0 to 10 XP with a lit one-day streak; no horizontal overflow at 390 px; no browser console errors. Native devices and screen readers were not checked for this increment.

Deployed October 29, 2026 to **https://tracecraft.dev** as Vercel deployment `dpl_298MSpvRvx5Gn8H2mFMpb7J57zji` (READY, aliased to the custom domain) from the uncommitted working tree on `codex/authenticated-progress`, base `3e0fdd5`; no source push or PR merge. The prior production deployment `tracecraft-4m0kfvy2l` remains the rollback point. The pre-publish gate above passed immediately before upload. After READY, all 117 public assets matched local SHA-256 values, `/api/health` returned 200/ok, `/api/session` reported email-code accounts and anonymous `/api/progress` returned 401. The live sign-in entry rendered with the new styles at 1440 and 390 px without console errors or horizontal overflow. No signed-in production walkthrough or external email was performed for this increment; signed-in behavior was observed on loopback only. The Impeccable detector's remaining warnings are the documented pressable lower edge on actions.

# TCS path: verification

October 29, 2026 (America/New_York). The requested path covers all 24 discussion topics across 25 original lessons. Eight new CPython tasks and two SQLite tasks bring the library to 51 Python, 40 SQL and ten browser Java tasks. Read marks, current-version recognition checks, predictions, private notes, latest runnable checks and mixed review remain separate records. [TCS_PATH.md](TCS_PATH.md) maps the coverage and exact assessment boundaries.

`npm run check`, `npm test` and `npm run build` pass: **609 passed, 0 failed, 0 skipped**. The 29 focused TCS tests verify every reference/bug pair in actual CPython or vendored SQLite, all displayed Python fixture assertions and seven worked outputs, independently maintained recognition answers, changed/randomized inputs, equivalent SQL, state/schema preservation, old backup migration, complete snapshot round trips, escaped notes and persistent save-failure warnings. Independent critique exposed and corrected weak checks for positive object lengths, half-up rounding, rendered-string sort order and SQL final ties. The final critic rechecked all 29 tests and found no remaining blocker in its scope.

Authenticated browser checks used isolated loopback with real Better Auth, synthetic email delivery, in-memory account storage and production CSP. No new external mail or real learner account was used:

- TCS appears in desktop navigation, the phone menu, Start here/library entries and search metadata. Its 25 lessons are grouped into seven units, with resume, previous/next and mixed review links. All four beginner prerequisite links resolve.
- A wrong recognition answer showed correction feedback. A correct answer, read mark, prediction and explanation survived reload. The worked result remained closed until requested. Linked runtime evidence updated after an actual code check.
- Actual Pyodide checks passed edited guard-clause code and the URL-origin policy using urllib.parse. These are CPython execution observations, separate from recognition.
- On phone width, real SQLite rejected COUNT(*) for an unmatched child, then accepted COUNT(child.id) across all four starting/changed/zero-child/empty fixtures. The changed fixture includes identical name/count parents to test final ID ordering.
- Mixed review rendered eight questions and recorded a correct choice separately. Reviewed account save included TCS records; after an unsynced local note edit, reviewed restore recovered the saved original text.
- Desktop 1440x900 and phone 390x844 layouts were inspected. Client/scroll widths were 1425/1425 and 375/375, including long resume links. Screenshots: [desktop path](screenshots/tcs-path-desktop.png), [phone path](screenshots/tcs-path-phone.png), [phone lesson](screenshots/tcs-lesson-phone.png). No console warnings or errors were observed.

The interface detector reported three advisory design-document type/palette differences and zero primary findings. Native devices, screen-reader study, authenticated production execution, real provider security configuration, model training and AI/clinical evaluation remain outside these observations. No Git push, PR merge, dependency or paid infrastructure was added.

Production deployment `dpl_3qKscnQ9orEvMCCjdqN1Gfat5S8S` is READY and aliased to [tracecraft.dev/#tcs](https://tracecraft.dev/#tcs). At 16:07 UTC (12:07 EDT), all 111 public asset SHA-256 values matched the tested source. Health returned 200/ok, email-code accounts remained enabled and anonymous progress returned 401. The live TCS URL rendered the required sign-in entry without console errors. Deployment-scoped error/fatal logs returned no entries. No new external email or signed-in production exercise was used for this increment. The uncommitted working tree remains on `codex/authenticated-progress`, based on `3e0fdd5`.

# Connected practical learning: earlier verification

October 29, 2026 (America/New_York). The attached platform requirements extend the existing alpha with 12 Python fluency tasks, 15 fitness SQLite tasks and 35 original authored scenarios (including ten incidents and eight own-project explanations). The retained totals are 43 Python, 38 SQL and ten Java tasks, plus beginner lessons, recognition questions, interviews and system design. The private coach adds a six-part diagnostic, 62 skill definitions, editable notebook, configurable retention, capped reviews, a 14-session opening sequence and 120/60/30-minute plans. Scope and remaining specialist work are recorded in [PLATFORM_IMPLEMENTATION.md](PLATFORM_IMPLEMENTATION.md).

`npm run check`, `npm test` and `npm run build` pass: **576 passed, 0 failed, 0 skipped**. Actual CPython tests cover every new reference/bug pair, exact integer type requirements and parser boundaries. Actual vendored SQLite tests cover all 53 new fixtures, changed records, empty tables, equivalent query/schema forms, foreign keys, rollback, primary keys, read-only schema preservation and aggregation fan-out. An independent answer key covers all scenario choices; canonical resolution rejects injected options. Private-state tests cover old snapshots, malformed IDs, help escalation, documentation flags, delayed distinct-variation evidence, drafts, notebook editing and paused clock backups. Retained Java/compiler/account/design suites also pass. Six independent critiques found and corrected grading, variation, evidence and interface issues; the final interface critic rechecked 47 focused tests without a remaining blocker.

Authenticated browser observations use isolated loopback, real Better Auth, synthetic email delivery, in-memory progress storage and exact production CSP. No external email or learner account was used:

- Diagnostic skip/reload resumed the next part and retained Not assessed. Practice launches use neutral attempt-first mode.
- New CPython work required a prediction before execution, ran edited code and passed assertions. Learn guidance remained recorded assistance after changing mode.
- Fitness SQL passed starting, changed, zero-child and empty-table fixtures in real SQLite 3.54.0 at phone width. The contract explicitly labels the dialect.
- Notebook assumption, correction, example and variation drafts survived reload; saving retained the linked actual attempt and submitted code. A synthetic private profile survived reload.
- Reviewed account save included the notebook, diagnostic, authored choices and profile. After pausing autosave and making a temporary local profile edit, reviewed restore recovered the saved original text. This uses the actual API handler with synthetic in-memory storage; prior production Postgres evidence remains separate below.
- Walking read/repeat and stop controls operated without console errors. A wrong selected claim failed even with correct free text; a corrected choice passed after retry. Feedback explicitly separates writing self-review from authored-choice checking.
- A 30-second optional explanation clock started, preserved the typed draft on reload and returned paused with remaining time. Untimed is the default; expiration never submits or changes correctness.
- Desktop 1440x900 and phone 390x844 rendered without horizontal document overflow (client/scroll widths 1425/1425 and 375/375). New controls and primary navigation were inspected. Screenshots: [desktop coach](screenshots/practical-coach-desktop.png), [phone coach](screenshots/practical-coach-phone.png). No console warnings/errors were observed in these flows.

The interface detector ran on five changed interface files: seven advisory design-document palette/type differences, zero primary findings. This is not a contrast or accessibility certification. Physical devices, screen-reader study, real voice/audio assessment, specialist project execution, authenticated production walkthrough and operational backup restoration remain separate verification. Browser read-aloud is not transcription, authored choices are not AI feedback, and passing task fixtures are not interview-readiness certification.

Production deployment `dpl_5fDuWFCf1QWG5fG2Ce2vKWkWMC5K` is READY and aliased to [tracecraft.dev](https://tracecraft.dev/#coach). At 14:37 UTC (10:37 EDT), all 106 public asset SHA-256 values matched the tested working tree, health returned 200/ok, email-code accounts remained enabled and anonymous progress returned 401. A deployment-scoped error/fatal log query returned no entries. The live coach URL rendered its required sign-in entry without console errors. No new external email or authenticated production walkthrough was performed for this increment. Source remains uncommitted on `codex/authenticated-progress`, based on `3e0fdd5`; no source push, PR merge or remote CI run occurred.

# Browser Java and ten additional coursework rounds: earlier verification

October 29, 2026 (America/New_York). The source adds actual javac/TeaVM browser Java with ten tasks, 64 published fixtures and ten deliberate bugs, 24 additional SQL/Python teaching sections, beginner prediction journals, two Java interview units and a fourth rehearsal. The ten-round ledger is [JAVA_COURSE_ROUNDS.md](JAVA_COURSE_ROUNDS.md). All ten fresh critiques are complete; the final critic rechecked its two corrections and found no remaining release blocker. Deployment dpl_8Lk1DSoGrLJSjkjk78fnpKBZZPJr is READY at https://tracecraft.dev. At 13:40 UTC (09:40 EDT), all 97 public asset SHA-256 values matched, health returned 200/ok, email-code sessions were enabled, and anonymous progress returned 401. The live sign-in entry rendered. A deployment-scoped error/fatal log scan through 09:44 EDT returned no entries. No new external email or authenticated production Java run was performed; actual authenticated runtime observations below use isolated loopback. Source remains the uncommitted feature-branch working tree based on 3e0fdd5, with no source push or PR merge.

`npm run check`, `npm test`, and `npm run build` pass. The full test run has **402 passed, 0 failed, 0 skipped**. Actual shipped javac/TeaVM and generated WebAssembly run all ten solutions and reject all ten bugs, without a JDK. Actual Java 21 separately validates the authored programs, nine new teaching programs and 24 independent small-input oracles. Actual CPython verifies all 12 new Python teaching outputs; actual vendored SQLite verifies all 12 new SQL outputs plus targeted rollback and literal semantics. Runtime/controller tests cover fresh fixture workers, exact stdout/stderr, output bounds, typed import refusals, the 64 MiB linear-memory cap, source changes, line diagnostics, cancellation, late worker messages and phase-specific deadlines. This memory cap is not a total WebAssembly GC or browser-process memory guarantee.

An independent runtime audit passed 27 tests and found missing Rhino notices/source and a no-Git packaging issue. The pinned Rhino MPL source/license and TeaVM relocation recipe, MIT/BSD notices, both ASM versions, and reproducible source-archive path are corrected. Public vendor asset hashes match their manifest. The source archive was extracted and its packaging recipe run without Git metadata; compiler, static runtime and both class library hashes matched. The source archive contains compiler source and licensing inputs; no credential files were found. This is not a security certification.

Authenticated browser observations used isolated loopback with real Better Auth, a synthetic email sink, in-memory progress storage and the exact production CSP. No external email or existing learner account data was used for this increment:

- Edited Java failed and then passed all first-task fixtures. A real missing semicolon produced line 3/column 41 plus plain-language guidance; Go to line selected exactly that source line.
- Stop preserved the draft and a fresh run printed Retry works. A real infinite loop stopped on the execution watchdog and displayed loop-progress guidance. No browser console errors were observed.
- At 390px, one explicit empty string printed Hello, !. Changing the input invalidated the previous result. Input text, empty-value state and code survived reload. The corrected greeting passed all five fixtures, and binary search passed all eleven fixtures including duplicate and 50-value boundaries.
- A SQL prediction survived reload with its worked result hidden and a full-width writing field. Saved predictions remain ungraded.
- A long native exercise selector initially overflowed the phone layout; the corrected grid reports document client/scroll widths 375/375. Final Java continuation links are separate controls and correctly open the rehearsal list. Starting Java rehearsal showed 0/2 fresh checks, preserved old attempts separately and prepared actual starters.

Screenshots: [desktop Java result](screenshots/java-browser-desktop.png), [phone Java result](screenshots/java-browser-phone.png). Final desktop client/scroll widths were 1425/1425 at 1440px. The interface detector ran once and reported 19 advisory design-document differences, with no non-advisory findings. Wider browser/device coverage, screen-reader study, authenticated production Java execution and operational backup restoration remain separate observations until recorded. Older release records below remain historical.

# Beginner learning overhaul: earlier release verification

October 28, 2026 (America/New_York). The current source completes 15 requested improvement rounds, with a fresh critic after each implementation. The detailed ledger is [IMPROVEMENT_ROUNDS.md](IMPROVEMENT_ROUNDS.md). The final critic rechecked its corrections and found no remaining release blocker.

Production deployment `dpl_HonJX6g9hVNJTLRK223hi9TVTVbA` reached READY and was assigned to **https://tracecraft.dev** late on October 28. Source is the uncommitted working tree on `codex/authenticated-progress`, based on `3e0fdd5`. No merge or source push occurred. Public verification at 23:55 EDT confirmed SHA-256 matches for all 66 entry/module/assets, health 200/ok, enabled email-code accounts, and anonymous progress access 401. The live sign-in entry rendered. No fresh external email or signed-in production walkthrough was performed for this increment; authenticated learner flows below used isolated loopback. A deployment-scoped error/fatal log scan through midnight into October 29 returned no entries. Existing provider/database configuration was retained.

`npm run check`, `npm test`, and `npm run build` passed with **310 tests passed, 0 failures, 0 skips**. Actual CPython verifies all Python reference solutions and deliberate bugs. Actual SQLite verifies all SQL fixtures, including unchanged book records/schema and mutations that otherwise return matching answers. Portable, checksum-verified Eclipse Temurin 21.0.12.1+1 was used only for local authored Java checks. Seven Java reference/bug models, all complete downloads, teaching fragments and completed blanks compile; direct output questions and complete downloads have output comparisons. The JDK is ignored local tooling and is not shipped.

The isolated loopback browser uses real Better Auth with a synthetic message sink and in-memory progress store. No external email or learner data was used. Observations:

- Desktop Start here and phone catalogue/lesson/task routes rendered. Document client/scroll widths matched at 1265/1265 initially, 1425/1425 at 1440px, and 375/375 at 390px after scrollbars.
- The first Python greeting passed in the actual browser worker. Its output was Hello, coder!, and it offered a next lesson without requiring trace use.
- At phone width, an unknown SQL column produced visible plain-language guidance. The corrected SELECT passed normal, changed-title/ID, and empty-table fixtures in actual SQLite.
- Keyboard activation of the skip link retained the SQL route and focused main. Cancelling a long SQL query retained the draft, stopped the worker, and focused results. Reset then allowed a new successful check.
- A Java question rejected a wrong answer, retained hint use, accepted a tapped blank, completed all three questions, focused the completion heading, and continued to the next Java lesson. This was recognition practice, not Java execution.
- Final resume behavior advanced past checked work without requiring a read mark, retained a later language, and offered a direct return to the last opened lesson. Beginner notes, read marks, and remembered lessons saved locally; automated coverage restores them through complete account backups. Account writes remain reviewed opt-in. Repeated targeted progress runs did not reproduce an earlier transient Node test-worker abort.
- No browser console errors were observed in these loopback flows.

Screenshots: [desktop learning path](screenshots/beginner-path-desktop.png), [phone learning path](screenshots/beginner-path-phone.png), [phone Java completion](screenshots/beginner-java-phone.png). The mechanical detector ran once and reported 21 advisory design-document differences, with no non-advisory findings. Native devices, screen-reader study, a full browser/zoom matrix, operational backup restoration and learning/hiring effectiveness remain separate checks. Prior production observations below apply to their recorded releases.

# Interview course enrichment: production and browser verification

Production deployment `dpl_HbbRmd6j9ndCaU7t7nkRZq5AgsqC` reached READY and was aliased to **https://tracecraft.dev** on October 28, 2026 (America/New_York). It publishes the uncommitted feature-branch working tree based on `3e0fdd5`; no merge or source push occurred. Public HTTPS checks returned 200 and matching SHA-256 for the entry and 11 course/integration modules. Health returned `ok`, email-code accounts remained enabled, and unauthenticated progress access returned 401. A fresh provider-test message was reported delivered; its code opened the live course. The live course was inspected at 390x844 and 1440x900, with equal document client/scroll widths of 375/375 and 1425/1425. Screenshot bytes are scaled by the browser provider to the client width while preserving the requested viewport aspect. Reload retained the verified session, and the synthetic browser account was signed out after checking. No existing browser drafts were uploaded to it. Vercel returned no error/fatal log entries for this deployment during the verification window. Screenshots: [live phone](screenshots/interview-course-live-phone.jpg), [live desktop](screenshots/interview-course-live-desktop.jpg).

October 28, 2026. The course extends the retained developer path with 21 original lessons (63 authored sections), 22 runnable Python and 18 SQLite drills, 18 arcade quests/54 questions and three rehearsals. Backend/general software engineering and frontend/full-stack are both included by default. Course revision is `2026-10-28.1`; checked lab content revision is `2026-10-28.3`.

`npm run check`, `npm test` and `npm run build` pass: **283 tests passed, 0 failed, 0 skipped**. The retained runtime suites verify every Python/SQL reference solution and deliberate bug. New deterministic randomized tests compare algorithm outputs against independent small-input oracles. Course checks cover ordered prerequisites, links to all 40 exercises, malformed imports, 30-debrief bounds, latest-failure precedence, assisted evidence, later-day checks, rehearsal start boundaries, frozen revisions, elapsed clock snapshots and complete backup round trips. Author-controlled JavaScript reference/bug functions have actual Node fixture tests. No submitted JavaScript execution or automatic React component assessment was added. Actual module startup smoke tests include direct course and mock routes behind the verified-session gate.

Browser-only QA used an isolated loopback origin with real Better Auth and a synthetic message sink, the actual hosted API handler and a test progress store. No external email or learner data was used. The following was observed:

| Flow | Observed result |
|---|---|
| Desktop and phone | Course overview at 1440px and 390px, lesson reading at 390px, usable focus and lesson selectors; client/scroll widths matched (1425px and 375px respectively) |
| Lesson records | Reflection, one self-check and read mark survived reload; read marks did not produce runtime evidence |
| CPython | The stable-unique starter failed an assertion, the authored solution passed with 73 actual source-linked frames; studying the solution remained assisted in the mock |
| SQLite | The avoid-fanout bug failed two of three fixtures; the corrected query passed all three in actual SQLite 3.54.0 |
| Mock | Started fresh linked starters, clock continued during lab navigation, elapsed time and written response survived reload with the clock paused, unfinished debrief saved with 0/2 independent checks |
| Account review | Comparison showed course reflection and rehearsal counts; reviewed save created an account snapshot; after pausing autosave and editing a note, reviewed account restore recovered the original reflection |
| Frontend arcade | Collection filter showed six JavaScript/React quests; multiple choice and tapped nullish-operator blank accepted, earning 20 first-completion practice XP |
| Runtime logs | No browser console errors observed in this loopback course run |

Loopback screenshots: [desktop course](screenshots/interview-course-desktop.jpg), [phone course](screenshots/interview-course-phone.jpg). The ignored loopback harness and synthetic delivery file are not part of the build or deployment. Full native-device testing, screen-reader study, real-recipient inbox placement, operational backup restoration and learning/hiring effectiveness remain separate checks. The frontend project portion is explicitly self-reported until real external project tests are produced. A visual detector ran once and raised advisory palette/type-ramp differences against the incumbent design documentation. The independent reviewer returned `ship` with no material fixes for the supplied course captures and inspected source; the documenter confirmed a scoped extension and preserved the incumbent files. Pre-existing design metadata drift remains. These checks are not an accessibility certification.

# Earlier production deployment: arcade and required OTP sign-in

Deployed October 28, 2026 (America/New_York) to **https://tracecraft.dev**. Vercel deployment `dpl_Hf9eUkEJZKHoEFvyFuhHec2CtpY8` reached READY and was aliased to the existing custom domain. The upload used the current working tree on `codex/authenticated-progress` (base commit `3e0fdd5`, with uncommitted arcade/auth changes). No PR was merged. The existing Node 24, Postgres and email provider configuration was retained.

`npm run check`, `npm test` and `npm run build` passed immediately before publication: **247 passed, 0 failed, 0 skipped**. Public HTTPS checks returned 200 for the entry, font, mascot and new source modules; downloaded asset hashes matched the local files. Health returned `ok`, the session endpoint reported enabled email-code accounts, and unauthenticated progress access returned 401.

Live browser checks used only the in-app browser. At 390px, client and scroll widths were both 375px after the scrollbar. The sign-in screen, five-minute OTP countdown and resend cooldown rendered. A provider test recipient received the email and its code created a verified session. A mobile quest rejected an incorrect answer, preserved hint assistance, accepted a multiple-choice answer and a tapped code piece, and finished with 30 practice XP. Reload retained the session, completed quest and local progress. At 1440px, client and scroll widths were both 1425px. No browser console errors were observed. Screenshots: [phone arcade](screenshots/arcade-live-phone.jpg), [desktop arcade](screenshots/arcade-live-desktop.jpg).

A separate synthetic API session verified live single-use code rejection, HttpOnly session cookies, a durable Postgres read of arcade progress, stale-revision conflict rejection and session revocation. That API test account and its saved progress were deleted afterward. Existing browser drafts were not uploaded to the synthetic account. The browser test session was signed out. Vercel's error/fatal runtime-log query returned no matching entries during verification.

The provider test recipient simulates delivery. This is not evidence of a real person's inbox placement. Viewport checks are not native iPhone/Android tests or a full accessibility study. Five-minute expiry also has automated server coverage; the live flow checked the displayed deadline and single use without waiting for a code to expire. The earlier blocked-browser notes below describe the preceding local increment.

# Current local increment: mobile arcade and required email sign-in

October 28, 2026. The browser entry requires a server-confirmed verified email-code session. The source adds an arcade quest path, 18 multiple choice and fill-in-the-blank questions, one-time practice XP, recorded hint exposure, mobile navigation, and reviewed opt-in account autosave. Full Python/SQL and system design remain in the source.

`npm run check`, `npm test`, and `npm run build` passed after the final changes. The current suite has **247 passing tests, 0 failures, 0 skips**. New coverage executes the original arcade reference solutions and deliberate bugs against CPython/SQLite, checks edge fixtures, rejects malformed progress, preserves question/hint state in complete backups, and verifies XP cannot be collected twice. Autosave tests cover initial-save races, concurrent edits, reload recovery, account switching, revoked sessions, stale revisions, network failures and quota errors. Real Better Auth tests verify five-minute code expiry, single use, seven-day cookie lifetime, HttpOnly session cookies, owner isolation and expected-user mismatch denial. Gate tests reject unverified, absent and non-email sessions. A source-level DOM double also imports the actual app modules and checks gated versus verified entry; it is not a rendered browser check.

A source reviewer checked the arcade and autosave changes and the corrected hint, in-flight-save and session invalidation paths. This is source evidence only. Browser-only tooling reported disabled in Work settings. Native computer inspection was subsequently stopped by the tool because it could not establish the browser URL confidently. No workaround was used. **Post-change desktop and narrow rendered verification, real-device checks, production OTP delivery for this increment, and deployment are pending.** Do not infer current hosted behavior from this local build. Earlier observations below apply to their recorded increments.

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
