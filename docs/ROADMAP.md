# Build roadmap with acceptance gates

This roadmap describes implementation scope, not guaranteed delivery dates. “Complete” below means implemented in this source package. No remote repository, deployment, or provider account has been provisioned by the preparation environment.

## Milestone 0 — Useful local alpha: implemented

Eight original numeric Python-like exercises; a bounded interpreter; real post-operation traces; visible public tests; deliberate bugs; line-block reordering; original explanation notes; 13-stage curriculum specification; three systems concept demos; 12 linked readings; four self-practice prompts; optional browser voice; local progress; responsive styling; optional Three.js/Anime.js code; automated core tests; documentation.

Acceptance: run the source without dependency downloads, alter code and observe a matching trace, catch every deliberate bug with a public test, navigate the map without implying planned content exists, and keep the core usable without remote libraries. See QA.md for actual checks and limitations.

## Milestone 1 — Reliable real-Python learning loop: next priority

**P1.1 Runtime adapter and cancellation.** Implement a full Python runtime with a documented choice between browser-contained practice and isolated server execution. Run it off the UI thread. Enforce cancellation and output/trace bounds. No network or secret access is assumed safe without a threat model.

**P1.2 Trace contract.** Preserve call frames, object identity, references, mutation, exceptions, and source mapping. Build fixtures for recursion, aliasing, branching, empty inputs, errors, and limits. Every displayed frame must correspond to actual execution.

**P1.3 Accessible editor.** Add a real editor with language support, keyboard instructions, indentation help, and a plain-text fallback. Keep controls usable at 200% zoom. Do not trap Tab unexpectedly. Add interactive block construction via a reviewed block editor when its semantics can be mapped accurately.

**P1.4 Lesson schema and validators.** Separate versioned content from UI. Require objectives, prerequisites, source records, hints, contracts, independent tasks, bugs, rubrics, and tests. Reject missing attribution, broken prerequisite links, invalid expected outputs, and unsupported visual claims.

**P1.5 First coherent course.** Author a compact, reviewed Python course covering variables through functions, lists/dicts, errors, tests, and one small project. A target lesson count is a planning estimate, not a quality metric. Do not generate hundreds of unreviewed pages just to fill the map.

Gate: a learner can complete one entire topic sequence, an unfamiliar variation, a delayed explanation, and a project step using real Python without a tutor doing the work for them.

## Milestone 2 — Accounts and durable evidence

**P2.1 Authentication and authorization.** Add supported login, authenticated APIs, organization scopes where needed, and cross-user denial tests. No anonymous writable shared database.

**P2.2 Progress synchronization and portability.** Persist attempts, hint use, lesson/runtime versions, explanations, and explicit consent. Support export, import with strict validation, and deletion. Preserve local-only mode.

**P2.3 Review scheduling.** Track independent versus assisted evidence, schedule related but not identical review tasks, and make recommendations understandable. A scheduling algorithm is not proof of learning improvement; evaluate it.

**P2.4 Authoring and review.** Add draft/review/publish status, version history, semantic tests, source records, and accessibility review. Publish the actual supported lesson count and coverage status.

Gate: progress survives devices; users cannot access one another’s private work; content can be revised without silently invalidating prior evidence.

## Milestone 3 — Interview preparation with real projects

**P3.1 Algorithms.** Add arrays/hash maps, two pointers, sliding windows, searching, stacks/queues, trees, graphs, recursion, and a carefully selected DP path. Include proofs, visual state, counterexamples, and varied difficulty.

**P3.2 SQL.** Isolated database workspaces, original datasets, query tests, NULL behavior, joins, indexes, transactions, and query plans. Keep the plan visualization faithful to the actual engine/version.

**P3.3 Java.** Versioned compiler/runtime integration, real test execution, language-specific lessons, and trace semantics. Start with a Java service project; do not present Python behavior as equivalent by renaming variables.

**P3.4 Portfolio track.** Build an application with requirements, Git history, tests, authorization, documentation, deployment, a failure investigation, and an honest case study. Integrate project evidence into interview practice.

**P3.5 Mock interviews.** Timed and untimed formats, visible rubrics, self/human/AI assessor distinctions, consented recordings, and feedback grounded in observed work. No fabricated hiring probabilities.

Gate: a target-role preparation path produces reproducible evidence, not just a streak and a list of solved examples.

## Milestone 4 — Source-grounded voice tutor

**P4.1 Provider adapter.** Implement one provider first with supported authentication, explicit billing, server-side secrets, short-lived browser credentials where available, cancellation, and budgets.

**P4.2 Private evidence retrieval.** Index only licensed original/approved materials. Apply permissions before retrieval. Maintain source and lesson versions; test deletion and stale data.

**P4.3 Evaluations.** Build a held-out set containing ordinary, ambiguous, misleading, and unsupported questions. Evaluate retrieval relevance separately from answer grounding and citation support. Add prompt-injection and cross-user access cases.

**P4.4 Conversation UX.** Turn-taking, interruptions, mute, captions, transcript review, typed fallback, consent controls, and progressive hints. Link feedback to actual code state when available.

Gate: observed lessons and approved sources support feedback; the tutor abstains when appropriate; session teardown stops charges; no long-lived secret appears in client artifacts.

## Milestone 5 — Systems and advanced specializations

Replace the toy models with carefully scoped, instrumented labs: API request flow, cache invalidation, queue retries, database isolation, load balancing, replication, and source-permission failures in RAG. Label simulations and assumptions explicitly.

Advanced paths include interpreters/compilers, database internals, distributed systems, performance, security, ML systems evaluation, and technical design reviews. Expertise requires open-ended work and maintained systems; no finite checkbox list certifies expertise in everything.

Gate: each lab ties an observation to a reproducible experiment, clear assumptions, and a trade-off explanation.

## Milestone 6 — Community, project events, and commercialization

Add optional code review, cooperative debugging, mentorship, project jams, and judged events only after moderation, anti-abuse, accessibility, contest rules, eligibility, and data-sharing controls exist. Discovery of third-party hackathons requires current event verification; do not silently register or submit on a user’s behalf.

Commercialization decisions include a useful free core, paid hosted compute or reviewed mentorship, and explicit provider usage limits. Do not promise unlimited voice without measured unit costs. Paid content and all imported assets need documented rights. Keep cancel/export/delete paths available.

Gate: measured learner value, transparent costs, safety/moderation readiness, reviewed terms, and a sustainable operating model—not just a polished landing page.

## Publication and deployment checklist

Create the new public repository with the included script or the GitHub UI. Review committed contents and CI. Resolve the working project name before a commercial launch. Configure an explicit static preview deployment without exposing private artifacts. No paid service should be activated until the owner approves provider, region, budget, and secret handling.

CI configuration is included, but no GitHub Actions run is claimed before a repository exists. Review current action versions and pin reviewed commit SHAs before enabling production workflows with broader permissions.
