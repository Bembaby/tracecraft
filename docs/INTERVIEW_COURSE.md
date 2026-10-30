# Interview course: learn, implement, explain, revisit

Updated October 29, 2026. Browser Java and the ten additional rounds are deployed; see [JAVA_COURSE_ROUNDS.md](JAVA_COURSE_ROUNDS.md). This original alpha course targets junior backend/general software engineering and frontend/full-stack preparation. Open `#developer-path/course` after verified email sign-in. The default includes both tracks; learners can choose a narrower focus. It is preparation practice, without a promise of passing an interview or a calibrated readiness score.

## What the enrichment fixes

The previous eight-milestone path already linked SQL/Python work to a separate backend project, but it did not teach a broad algorithm sequence or browser/React reasoning. Recognition questions alone could encourage familiarity without independent production. The enrichment adds explanations before tasks, exact contracts, edge cases, deliberate bugs, fresh attempts, saved reasoning, later retries and rehearsals that keep those forms of evidence separate.

| Gap | Current course response | Evidence boundary |
|---|---|---|
| Jump from syntax to a solution | Contract, baseline, invariant, counterexample and complexity lessons | Reading and reflection are self-reported |
| Narrow algorithm coverage | 14 new full-Python drills, making 22 total | Actual CPython assertions and traces; public fixtures are inspectable |
| SQL sample familiarity | Six new SQLite drills, making 18 total, with changed data and exact row semantics | SQLite worker checks do not establish production database operation |
| No frontend learning sequence | Five browser/JavaScript/accessibility/React lessons and six authored arcade models | Models are recognition practice; real components require external project tests |
| Checklist mistaken for mastery | Latest independent/assisted/failed check labels, notes and read marks shown separately | Client-side records depend on honest reporting of outside help |
| Isolated tasks without interview conversation | Four optional-clock rehearsals with clarifications, tests, tradeoffs and debriefs | No AI grading, employer scoring or hiring prediction |

## Learning sequence

Each of the 23 lessons has three original sections with an example to predict and a specific pitfall, linked practice where applicable, a reflection prompt, three self-checks and a changed-requirement follow-up. Prerequisites are ordered and validated.

| Sequence | Lessons | Practice emphasis |
|---|---|---|
| 1 to 4 | Problem solving, Python fluency, object responsibilities, complexity | Exact contracts, aliasing, errors, identity, dependency boundaries and growth arguments |
| 5 to 10 | Structures, hashing, two pointers/windows, search/stacks, graphs/intervals, recursion/DP | Linked nodes, bounded heaps, counts, stable uniqueness, complements, merges, lower bounds, nesting, BFS, trees and target states |
| 11 to 12 | SQL foundations and reasoning | Constraints, joins, groups, NULL, independent child aggregation, deterministic windows, distinct rank and date bounds |
| 13 to 15 | Testing/debugging, HTTP/data, backend design | Reproduction, regression cases, owner checks, pagination, idempotency, failure and topology |
| 16 to 20 | Web basics, JavaScript, async UI, accessible UI, React | Browser requests, values, copying, closures, races, forms, state snapshots, updater queues and effect boundaries |
| 21 | Delivery and interview discussion | A tested project, specific decisions, tradeoffs and truthful experience stories |
| 22 to 23 | Java fluency and problem solving option | Browser Main setup, object state, precise errors, ordered collections and leftmost search |

The backend focus includes 18 lessons, including the Java practice option. Frontend/full-stack includes those lessons plus all five web lessons. All 40 original interview exercises and six Java exercises are linked; repeated links do not inflate the evidence count. The existing Java/Spring and MySQL project assignments remain available under Project milestones. The Java practice option adds two units, six distinct linked browser tasks and a fourth Java rehearsal. Ten Java tasks execute here through javac/TeaVM. The Spring project remains separate local work.

## Practice without rushing

Start with the foundation arcade collection when syntax or terms feel unfamiliar. It offers tap-friendly multiple choice and fill-in-the-blank questions. Then read the linked lesson, predict the authored example, and write a small implementation before opening help. Run normal and edge fixtures, repair the deliberate bug and save your explanation. Return on a later local calendar day with the previous draft hidden. A failed latest check stays visible even when an older attempt passed.

The arcade has 25 original quests and 75 questions: six foundations, six Python patterns, six JavaScript/React models and seven Java quests. First-completion XP cannot be collected again by repeatedly submitting an answer. Arcade completion is separate from independent runtime evidence. The authored JavaScript models have tested reference and bug functions, but the browser does not execute submitted JavaScript or render learner React components.

## Rehearsals

| Rehearsal | Suggested budget | Required checked tasks and discussion |
|---|---|---|
| Java coding and explanation | 35 minutes | Browser Java first-seen uniqueness, first matching position, duplicate/empty cases and complete cost explanation |
| Coding and reasoning | 35 minutes | Stable uniqueness, first qualifying position, clarification, invariant, tests, complexity and changed requirement |
| Backend and data | 50 minutes | Owner-scoped read, independent SQL child aggregation, request and failure reasoning |
| Frontend and full-stack | 55 minutes | Paid-order summary in SQLite, plus an external UI feature and self-reported browser/project evidence |

Starting archives linked drafts and resets starters. Help used that day remains recorded. The optional clock includes linked-lab work while the tab is visible, pauses in the background or after reload, and never completes a task. Save an unfinished rehearsal to retain its gaps. A debrief freezes the latest relevant runtime evidence since its start, content/runtime revisions, written responses and self-checks. The latest 30 rehearsals are retained.

## Saved progress

Read marks, focus, reflections, self-checks, active rehearsal and debriefs belong to the existing training workspace. Native local storage, complete training backups, reviewed account save/restore and opt-in autosave include them. Credentials and session cookies remain outside progress. Notes are personal data, so the existing explicit starting-copy review and revision/owner conflict protections still apply.

## What still requires real practice

Build and test a small application in your target stack. Show a real browser interaction, keyboard use, loading/empty/error states, session-backed ownership, a database integration, a regression test and a deployment you can explain. For React, exercise components and effects in an actual project. For database operations, use a separate server database and test transactions, migration and recovery. Ask a person to challenge an unfamiliar variation and a design tradeoff. The app cannot verify these through a checkbox.

There is no requirement to finish advanced specialist/RAG material before applying for a junior role. Interview formats vary. Confirm language, format and accommodation needs with the recruiter, and use the employer's guidance to adjust preparation. No learner outcome or job-placement claim is made.

## Originality and source guidance

All teaching notes, contracts, fixtures, solutions, deliberate bugs and questions are original. Primary sources informed topic coverage and offer further reading, rather than supplying copied problems:

- [Microsoft technical interviewing](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html) covers clarifying, testing, problem solving, coding and design discussion.
- [Amazon software development topics](https://www.amazon.jobs/content/en/how-we-hire/interview-prep/software-development-topics) describes possible technical preparation areas and role-dependent formats.
- [Python tutorial](https://docs.python.org/3/tutorial/datastructures.html), [SQLite SELECT](https://sqlite.org/lang_select.html), [React learning documentation](https://react.dev/learn), [MDN curriculum](https://developer.mozilla.org/en-US/curriculum/) and [W3C forms](https://www.w3.org/WAI/tutorials/forms/) provide language/platform references.

Source links are not employer endorsement. See [QA.md](QA.md) for observed runtime, persistence, mobile and deployment verification, including limits.
