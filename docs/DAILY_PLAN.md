# A 30-minute path toward interview-ready evidence

This is a suggested routine, not an employment forecast. At 30 minutes each day, seven days add up to 3.5 hours; 90 days add up to 45 hours. That is meaningful practice time, but not a promise to become an expert across every topic or get hired within a deadline.

## Each session

| Minutes | Activity | Evidence |
|---|---|---|
| 0–3 | Recall yesterday without notes | One prediction or definition written from memory |
| 3–10 | Read one small concept and predict an example | Expected output plus a reason |
| 10–22 | Write or repair code; trace; test a boundary | A saved attempt and one revealing test |
| 22–27 | Explain aloud or in text | Input, state/invariant, edge case, complexity or trade-off |
| 27–30 | Reflect and choose tomorrow | One misconception corrected and a next action |

On a difficult day, do a smaller complete loop rather than pretend a rushed hour of passive reading is equivalent. Do not use a timer or streak to conceal whether you understood anything.

## First seven sessions: use the shipped alpha

**Day 1 — Variables.** Open “Price the tickets.” Predict the output before tracing. Change an input. Explain why assigning a value does not create a live spreadsheet formula.

**Day 2 — Accumulation.** Open “The running total.” Predict the value after each iteration. Load the deliberate bug and explain why it loses earlier values. Test empty input.

**Day 3 — Conditions.** Open “Count the alerts.” Focus on the exact threshold boundary. Write a test that distinguishes `>` from `>=`.

**Day 4 — Invariants.** Open “Find the highest reading.” Use all-negative input. Explain why initialization is part of correctness and why the non-empty contract matters.

**Day 5 — Indexing.** Open “Weight the scores.” Explain how positions connect two lists and what validation a production program needs. Distinguish the miniature `range` implementation from real Python.

**Day 6 — A changed problem.** Open “Keep every running total.” Explain the output list and the cost of repeated list concatenation. The example is intentionally not the optimal real-Python `append` implementation.

**Day 7 — Explain and reflect.** Use the loop prompt in Interview studio. Save an explanation, identify one gap, and revise it. Compare your explanation to the actual trace rather than reading the solution aloud.

Other available exercises—parity and capacity checks—are useful variants, not a mandate to finish every item in a fixed week.

## The next learning route

These phases are ordered by dependency, not promised completion dates. Most of this curriculum is not implemented yet; use the linked primary sources and real local projects while it is built.

**Phase A: real Python foundations.** Functions, strings, dictionaries, sets, exceptions, files, modules, environments, tests, and debugging. Deliver a command-line application with original requirements and a reproducible test command. Keep a short explanation of one failed design and its repair.

**Phase B: interview patterns.** Arrays/hash maps, two pointers, sliding windows, binary search, stacks/queues, trees, graph traversal, recursion, and selected dynamic programming. Learn a pattern by proving an invariant and handling a changed constraint, not recognizing a title. Mix delayed attempts with new tasks. The current mini interpreter is not sufficient for this entire phase.

**Phase C: SQL and an API.** Model a small domain, use keys and constraints, write joins/aggregations, explain an index, implement CRUD with authorization and validation, and add API tests. Build a job-application tracker or learning journal. Document error behavior, setup, and one trade-off.

**Phase D: deployment and infrastructure.** Follow one real request from browser to API to database. Add structured logging, a health check, basic load testing, a queue when needed, and a simple failure drill. Explain where secrets belong and why code execution needs isolation.

**Phase E: relevant specialty.** For Java-oriented roles, implement a tested service and explain types, equality, collections, exceptions, and JVM basics. For AI/backend roles, build a permission-aware retrieval project with source citations, a keyword baseline, held-out evaluation questions, and an explicit unsupported-answer policy. Do not merely wrap a chatbot and claim a measured RAG system.

**Phase F: interviews and applications alongside learning.** Practice a project walkthrough, a coding explanation, a system trade-off, and a behavioral story grounded in your actual work. Apply to suitable roles when you can demonstrate relevant foundations and a project; do not wait to master every advanced branch. Tailor evidence honestly and reflect on feedback after each interview.

## Weekly review

Select one unseen variation, one previous error, and one explanation. Ask: Can I solve this without reading the old answer? Can I state the input contract? Does my test distinguish correct from incorrect behavior? Can I explain a meaningful trade-off? What artifact would show another engineer that I actually did this work?

A useful portfolio case study contains a problem statement, repository, setup instructions, tests, a architecture sketch, a decision record, an observed result with a reproducible measurement, and a limitation. Building TraceCraft can itself become such a project—but understand and maintain the generated code rather than presenting it as work you have not reviewed.
