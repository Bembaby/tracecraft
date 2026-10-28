# A practical path to independent backend development

Use this route to practice producing code, operating a relational database, building a complete feature, and explaining engineering decisions. The order follows dependencies: schema and queries, language fluency, database ownership, a tested API, then distributed-system trade-offs. It does not require mastering every framework or converting a small app into microservices.

## Pace and evidence

Eight suggested weeks at two hours per day total 112 scheduled hours, including breaks. Repeat a gate when needed; finishing a date does not establish mastery.

Use the [two-hour session](DAILY_PLAN.md) each day. The first week prioritizes a SQL query from a blank editor and a compact Python refresher. The longer project uses Java/Spring and a local MySQL database; keeping one familiar backend stack limits unnecessary context switching. For a Python-oriented opportunity, continue practicing the six Python drills alongside that project instead of changing every tool at once.

The capstone is a small workout journal with synthetic users, workouts, and summaries. It is a separate learning project. Requirements and tests come before implementation. Working examples are teaching aids; save an attempt before viewing them, and mark assistance honestly.

## Competency gates

| Area | Evidence required |
|---|---|
| Blank-editor SQL | Create related tables, valid data, and a join in 15 minutes on separate days with changed names and inputs. Explain why rows appear or disappear. |
| Query transfer | Solve unfamiliar variations covering joins, grouping, NULL, absence, and deterministic ordering; inspect actual results. |
| Database ownership | Rebuild from migrations, show a constraint violation and rollback, inspect a plan, and restore a backup into a separate database. Documentation is allowed for operational commands. |
| Language fluency | Write a small collection task, a class, and meaningful tests without generated implementation; explain state, mutation, and boundaries. |
| Backend ownership | Carry a requirement through a schema, validated API, persistence, and tests, including a failure path. |
| Systems reasoning | Justify a modular monolith or service boundary and explain timeout, duplicate-delivery, and consistency behavior. |
| Interview recovery | When uncertain, state a small example and make a useful next step; complete two mocks on separate days without answer assistance. |

These are proposed practice targets. They are not validated hiring thresholds or certifications. A self-reported completion is not an observed code test, and a passing fixture is not proof of complete mastery.

## First three sessions when a coding round may be close

1. Create two related tables, insert valid rows, and write an INNER JOIN. Predict the result. Then change to a LEFT JOIN and include a parent with no children.
2. In full Python, write a class with independent instance state, append to a list, slice a sequence, and test empty and boundary inputs. Recreate yesterday’s join with new names.
3. Attempt a 15-minute SQL task, a 20-minute Python task, and a three-minute architecture explanation. Save the unedited attempts, then use the rest of the session to repair the weakest part.

Keep scope focused while an imminent round is unresolved. A distant infrastructure topic should not displace practice of the basic tasks likely to be asked now.

## Weekly assignments

### Week 1: Start from a blank editor

Produce a small join and basic Python independently; practice recovering when you cannot recall a detail.

**Gate:** On separate days, create two related tables with valid rows and write a correct join in 15 minutes. Write a Python class and a slice without the model answer, then explain both.

**Day 1: Two tables and one join.** In the SQL lab, create two related tables, insert a parent with no children and another with two children, and write an INNER JOIN. Predict every result row before running. During the project block, draw users → workouts and write the key names.

Evidence: Saved SQL, predicted rows, actual rows, and a one-minute explanation of the join.

**Day 2: Objects, lists, and slices.** Use a real Python 3 interpreter for the instance-state and slicing drills. Create two separate workout objects, append to one, and prove the other is unchanged. Then rewrite yesterday’s join with new table names.

Evidence: A Python file with assertions and a fresh join written from memory.

**Day 3: Include the missing parent.** Write an INNER JOIN and a LEFT JOIN over the same data. Add a user with no workouts. Explain NULL and count workouts correctly with COUNT(workout_id). Rebuild the schema without copying day 1.

Evidence: Two result tables and the reason a user appears in only one of them.

**Day 4: Functions you can test.** Complete the dictionary-summary and function-boundary Python drills. Include empty input and a value exactly on the threshold. Write a new test before fixing a deliberate bug.

Evidence: A function, a failing test, the fix, and a short complexity explanation.

**Day 5: Ask a question of grouped data.** Find each user’s workout count and total minutes. Use GROUP BY, then HAVING to keep only users over a target. Explain the difference between filtering rows and filtering groups.

Evidence: Two queries that still work after the fixture data changes.

**Day 6: A small interview rehearsal.** With answers hidden, spend 15 minutes on a fresh two-table SQL example and 20 minutes on a small Python function. Explain why a small workout app can remain a modular monolith. On a blank, state the smallest next step and write it.

Evidence: An unedited first attempt, assistance notes, and a three-minute spoken explanation.

**Day 7: Retry the weakest skill.** Choose the weakest attempt from this week. Change the data, names, or boundary and solve it again. Review the answer only after saving the attempt. If the gate still fails, repeat this week’s relevant tasks.

Evidence: A delayed attempt and one specific target for the next session.

Primary references: [MySQL tutorial](https://dev.mysql.com/doc/refman/8.4/en/tutorial.html) · [Python sequences and slicing](https://docs.python.org/3/tutorial/introduction.html) · [Python classes and instance state](https://docs.python.org/3/tutorial/classes.html) · [Python lists and dictionaries](https://docs.python.org/3/tutorial/datastructures.html)

### Week 2: Reason about relational data

Choose a schema deliberately and answer questions without losing or duplicating rows.

**Gate:** Solve at least 8 of 10 unfamiliar query variations and explain every unexpected row. Include NULL, a zero-child parent, a duplicate, and a three-table relationship.

**Day 1: Model a workout journal.** Define users, workouts, exercises, and workout_sets. State one row’s meaning in each table. Add primary keys, foreign keys, NOT NULL, and appropriate CHECK or UNIQUE constraints. Keep this in the disposable practice database.

Evidence: A schema diagram, CREATE statements, and the reason for each constraint.

**Day 2: Catch invalid data.** Attempt an orphan workout, duplicate unique value, missing required value, and invalid duration. Record which constraint rejects each. For optional values, compare IS NULL with an equality comparison.

Evidence: Four rejected inserts with explanations and one valid optional-value example.

**Day 3: Join three tables safely.** Report exercises used by each user. Predict how multiple workouts and sets multiply rows. Decide whether the question wants sets, workouts, exercises, or distinct users before adding DISTINCT.

Evidence: A three-table query and a deliberately duplicated fixture that exposes a wrong answer.

**Day 4: Find what did not happen.** Find users with no workouts using NOT EXISTS, then a LEFT JOIN. Add a nullable value to a separate fixture and inspect how it changes NOT IN. Explain absence separately from an unknown value.

Evidence: Two equivalent absence queries and a NULL counterexample.

**Day 5: Latest workout per user.** Choose a deterministic rule for tied timestamps. Implement a latest-per-user query with a window function, and explain PARTITION BY and the tie-breaker. Keep users with no workouts only if the requirement asks for them.

Evidence: Query, tied-time fixture, and an explicit tie policy.

**Day 6: Parameterized data access.** In a local Python script using sqlite3, run a parameterized SELECT with user input. Try an apostrophe in a name. Compare a value parameter with an allowlisted sort-column choice. Keep the database throwaway.

Evidence: A tested script that treats user values as data and explains why column names need a separate allowlist.

**Day 7: Query transfer check.** Ask a peer or tutor for ten small variations using unfamiliar table names. Attempt them with no solutions visible. For each wrong result, identify the faulty assumption before rewriting SQL.

Evidence: Score by actual results, error categories, and a scheduled retry for each miss.

Primary references: [MySQL tutorial](https://dev.mysql.com/doc/refman/8.4/en/tutorial.html) · [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/using-explain.html) · [Python lists and dictionaries](https://docs.python.org/3/tutorial/datastructures.html) · [Python sqlite3 and value parameters](https://docs.python.org/3/library/sqlite3.html)

### Week 3: Own a real database

Move from browser SQL practice to managing a local MySQL database with synthetic data.

**Gate:** Create a database from migrations, demonstrate rollback and a constraint failure, inspect an execution plan, and restore a backup into a separate database with matching rows.

**Day 1: Run MySQL locally.** Install or start a local MySQL 8.4 development instance using the official instructions for your OS. Connect with the CLI, record SELECT VERSION(), create a dedicated practice database, and apply your schema. The browser lab uses SQLite and does not complete this task.

Evidence: A reproducible local setup note and a successful schema migration.

**Day 2: Commit and roll back.** Using InnoDB tables, update two related rows inside START TRANSACTION. Inspect the state, ROLLBACK, and verify original values. Repeat with COMMIT. Keep schema changes out of this transaction exercise; MySQL DDL can implicitly commit.

Evidence: Before/after queries for rollback and commit, plus an atomicity explanation.

**Day 3: Observe concurrent sessions.** Open two local connections. Update the same row inside an uncommitted transaction, then attempt a conflicting update from the other connection. Observe waiting and release it with rollback. Use a short local lock-wait timeout.

Evidence: A sequence of commands, observed waiting, and an explanation of the lock’s purpose.

**Day 4: Measure an index.** Generate representative synthetic workouts. Run EXPLAIN for a user-and-date query before and after a suitable composite index. Measure repeated runs, keep result correctness constant, and explain the index’s storage/write cost.

Evidence: Actual query plans and timings, including if the optimizer chose not to use the index.

**Day 5: Change a schema safely.** Add an optional workout note in a numbered migration. Rebuild a fresh database through all migrations. Plan how a required field would need a compatible rollout and backfill. Do not treat ROLLBACK as a universal DDL undo command.

Evidence: Migration files, clean-database replay, and a rollback or forward-repair plan.

**Day 6: Prove a backup restores.** Dump the synthetic database with the appropriate mysqldump options for your setup. Restore into a separately named practice database. Compare table counts, sample joined rows, and constraints. Never use the original as the restore target.

Evidence: Backup file kept locally and a restore checklist with verified comparisons.

**Day 7: Operate without the recipe.** Repeat setup, migration, rollback, index inspection, and restore using only your own short runbook. Create a limited application database account and demonstrate its allowed and denied operations. Documentation is allowed for exact administrative flags.

Evidence: A runbook another developer can follow and the observed DB-ownership gate.

Primary references: [Install local MySQL](https://dev.mysql.com/doc/refman/8.4/en/installing.html) · [MySQL transactions](https://dev.mysql.com/doc/refman/8.4/en/commit.html) · [MySQL implicit-commit statements](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html) · [InnoDB locking](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html) · [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/using-explain.html) · [MySQL SQL-format backups](https://dev.mysql.com/doc/refman/8.4/en/mysqldump-sql-format.html) · [Restore SQL-format backups](https://dev.mysql.com/doc/refman/8.4/en/reloading-sql-format-dumps.html)

### Week 4: Build one complete backend feature

Carry a workout-journal requirement through Java/Spring, SQL, tests, and a usable HTTP endpoint.

**Gate:** Demonstrate one endpoint from request to stored row, one read query, invalid input, missing data, and database failure. Explain the SQL without an ORM hiding it.

**Day 1: Define the feature before coding.** Write acceptance examples for creating a workout and viewing a user’s recent workouts. Specify request fields, response shape, ownership, invalid input, and missing-user behavior. Use a separate learning project and synthetic users.

Evidence: An API contract and five concrete acceptance examples.

**Day 2: Practice Java’s building blocks.** Write a Workout value type, a list of workouts, a summary function, and tests. Explain List versus ArrayList, reference equality versus value equality, exceptions, and constructor initialization. Keep the work in Java rather than translating the Python mini interpreter.

Evidence: Compiling Java code and tests for empty input, multiple users, and a duration boundary.

**Day 3: Write the persistence layer.** Create a small Spring project and a JDBC repository. Write parameterized INSERT and SELECT statements yourself. Map rows to Java values, handle an empty result, and keep credentials out of source control.

Evidence: A repository operation tested against your local MySQL schema.

**Day 4: Create and validate a workout.** Implement POST /workouts with validated fields and a clear error response. Persist through the repository. Test a valid request, negative duration, missing field, and nonexistent user.

Evidence: An HTTP example for each case and meaningful automated assertions.

**Day 5: Read with filtering and pagination.** Implement a user’s workout list with a documented limit, deterministic ordering, and parameterized filters. Add a tie-breaking ID to timestamp ordering. Test an empty list and a user with more than one page.

Evidence: A GET endpoint, its SQL, and tests that expose skipped or repeated rows.

**Day 6: Trace one request.** Follow a request through routing, validation, service logic, SQL, commit, and response. Add a request ID to useful logs without logging credentials or personal payloads. Stop the local DB and inspect the error path.

Evidence: A request-flow sketch and a database-failure response that you can explain.

**Day 7: Rebuild a small slice.** Implement a small second feature, such as updating a workout note, from acceptance examples. Use documentation for APIs after a first attempt. Explain every line of the SQL and the transaction boundary.

Evidence: A complete change with tests and an independent three-minute walkthrough.

Primary references: [Spring JDBC data access](https://spring.io/guides/gs/relational-data-access/) · [Spring web-layer testing](https://spring.io/guides/gs/testing-web/) · [MySQL transactions](https://dev.mysql.com/doc/refman/8.4/en/commit.html)

### Week 5: Make the feature dependable

Test the boundaries users and operations will exercise, then run the application reproducibly.

**Gate:** Show a regression caught by a test, cross-user access denied, a repeatable start command, and a failure investigation supported by observed evidence.

**Day 1: Test behavior at the right boundary.** Separate pure calculation tests, repository tests against real MySQL, and HTTP contract tests. Introduce a deliberate off-by-one duration bug and verify a test fails before repairing it.

Evidence: A test map and one regression test that fails for the intended reason.

**Day 2: Authorize the owner.** Add supported authentication in the local project, or use a clearly labeled test principal while building the authorization rule. Verify user A cannot read or update user B’s workout by changing an ID. Never trust a client-supplied owner ID alone.

Evidence: Two-user denial tests and a short distinction between authentication and authorization.

**Day 3: Make errors useful.** Map validation, not-found, conflict, and unexpected failures to documented responses. Keep internal exceptions out of client responses. Reproduce a database constraint violation and link it to its request ID.

Evidence: An error contract, representative tests, and a traceable failure log.

**Day 4: Debug a slow request.** Seed enough synthetic rows to reproduce a slow list endpoint. Inspect the query count and plans. Compare one targeted change with the baseline; retain correctness tests and state measurement limitations.

Evidence: A before/after investigation with measured observations and a reproducible command.

**Day 5: Run from a clean checkout.** Document prerequisites, configuration names, migrations, start, and test commands. Use a separate working copy and fresh practice database to follow those steps. Add a health check that matches its stated purpose.

Evidence: A working setup runbook and a list of missing assumptions you repaired.

**Day 6: Rehearse deployment and rollback.** Package the app and run it in a separate local environment. Apply a compatible migration, run smoke checks, and roll back the application version. Use an existing approved hosting setup only if available; this task does not require buying infrastructure.

Evidence: A release checklist, observed checks, and a realistic rollback boundary.

**Day 7: Own a small incident.** Have someone introduce a documented fault in the local project, such as a wrong DB port or missing migration. Record symptoms, hypothesis, evidence, fix, and prevention. Keep SQL and Python recall in the first session block.

Evidence: A one-page incident note and a passing end-to-end feature demonstration.

Primary references: [Spring web-layer testing](https://spring.io/guides/gs/testing-web/) · [Spring JDBC data access](https://spring.io/guides/gs/relational-data-access/) · [Spring request authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html) · [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/using-explain.html)

### Week 6: Reason about systems under failure

Connect latency, caching, timeouts, retries, and background work to observable behavior.

**Gate:** Explain a dependency timeout and a duplicate request, then demonstrate one safe recovery in your local application.

**Day 1: Draw the request and its waits.** Diagram browser → API → database and identify network, queueing, and processing time. Time a real local request and explain what the measurement includes. Distinguish latency from throughput.

Evidence: A request diagram and a measured latency with its limits.

**Day 2: Choose a cache boundary.** Complete the stale-summary architecture drill. Implement a tiny local cache only for the experiment, state its key and expiry, then update underlying data and inspect the stale result. Remove or fix it deliberately.

Evidence: A stale-data reproduction and a justified invalidation strategy.

**Day 3: Handle a dependency that stalls.** Use a local stub that delays a response. Add a request timeout and bounded error handling. State whether the caller can retry safely and what happens when all attempts fail.

Evidence: A timing test and a user-visible failure behavior.

**Day 4: Make a retry safe.** Complete the duplicate-workout drill. Store an idempotency key with a unique constraint and the associated request fingerprint/result where appropriate. Replay the request and test a reused key with a different payload.

Evidence: Tests showing one logical operation despite repeated delivery.

**Day 5: Move optional work off the request.** Write down which work must finish before acknowledging a workout save and which can happen later. Simulate a reporting worker and retry a failed job. State the retry limit and where failed work is visible.

Evidence: A job-state model and a reproducible retry experiment.

**Day 6: Observe rather than guess.** Add a small set of logs or counters for request duration, errors, and retries. Trigger a timeout and trace one operation through the evidence. Explain how you would notice a growing backlog.

Evidence: An investigation using request IDs and actual recorded events.

**Day 7: Explain the failure cases.** Answer the architecture prompts without notes. For each design, name a failure and what remains correct. Rewrite one previous SQL and Python exercise from memory before reviewing your explanation.

Evidence: Two three-minute explanations and a delayed independent coding attempt.

Primary references: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) · [Circuit breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) · [Cache-aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) · [Transactional outbox and duplicate delivery](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

### Week 7: Understand service boundaries

Justify a modular monolith or a small service split using ownership, deployment, and failure requirements.

**Gate:** Present a reasoned architecture choice and handle follow-ups about data ownership, contract changes, partial failure, retries, and duplicate events.

**Day 1: Name the business boundaries.** Map workout recording, reporting, and notifications as modules. State which data and business rules each owns. Keep one deployment first and explain what would justify changing that.

Evidence: A module map and an explicit reason to keep or split each boundary.

**Day 2: Write a service contract.** Design a reporting API or workout-recorded event with identifiers and a versioning policy. Add contract examples. Explain why a producer cannot silently rename a required field just because it deploys independently.

Evidence: A contract, compatibility test, and example change plan.

**Day 3: Separate one process as an experiment.** Run a small reporting worker separately from the main API in a local-only learning experiment. Give it a defined communication boundary. Compare start-up, deployment, and debugging work with the in-process module.

Evidence: A two-process experiment and an honest cost/benefit comparison.

**Day 4: Avoid a lost event.** Complete the dual-write drill. In the local project, save a workout and an outbox record in the same database transaction. Simulate failure before delivery and resume the publisher.

Evidence: An experiment showing the pending event survives the application failure.

**Day 5: Handle duplicate and late events.** Replay an event twice against a consumer. Track a stable event ID and make its state change idempotent. Add a late event and state how ordering or version checks should work for the chosen business rule.

Evidence: Duplicate-delivery test and a written ordering assumption.

**Day 6: Contain a dependency outage.** Stop the reporting worker or make its API fail. Show which primary workflow continues and what becomes delayed. Add bounded retries or a circuit-breaker experiment only where the failure model warrants it.

Evidence: A failure drill with recovery evidence and no claim of guaranteed availability.

**Day 7: Defend the simpler design.** Present both the modular monolith and service experiment. Use measured or observed constraints to choose one. Explain the cases in which you would reverse that choice.

Evidence: A short decision record with benefits, costs, assumptions, and a reconsideration trigger.

Primary references: [Microservices architecture trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices) · [Transactional outbox and duplicate delivery](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) · [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) · [Circuit breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)

### Week 8: Demonstrate independent ownership

Turn the work into reproducible evidence and practice explaining it under interview conditions.

**Gate:** Complete two mock sessions on separate days, rebuild a small feature without generated implementation, and walk through a database restore and a system failure.

**Day 1: Retest the foundations cold.** Use unfamiliar table names and new data for a two-table schema and join. Write a Python function and class from blank files. Save attempts before reading old work and record exact assistance.

Evidence: A fresh baseline compared with the first week’s evidence.

**Day 2: Build an unfamiliar variation.** Add a weekly workout-goal feature from a brief requirement. Write the schema change, query, API behavior, and tests. Clarify ambiguous requirements before implementing.

Evidence: A complete vertical slice and the reason for each design choice.

**Day 3: Rehearse database recovery.** Use your runbook to restore a synthetic backup into a new database. Verify the application reads expected records. Explain what data would be missing if the backup were older.

Evidence: A verified restore and an explanation of recovery-point and recovery-time goals.

**Day 4: Mock interview one.** Run a 45-minute mock: SQL, one language task, and an architecture follow-up. Use no answer assistance. When stuck, restate the requirement, make a tiny example, and implement one correct step.

Evidence: A first attempt, review rubric, and two concrete corrections.

**Day 5: Repair the evidence.** Turn the mock’s weakest area into a changed task and fix it. Write a project walkthrough covering requirement, schema, request flow, test, deployment, and one failure you actually observed.

Evidence: A revised task and a concise, truthful project case study.

**Day 6: Mock interview two.** Use new tasks and a different follow-up. Ask for clarification when appropriate and state uncertainty precisely. Compare independent completion and recovery behavior, not just confidence.

Evidence: A second mock with an honest comparison against the first.

**Day 7: Choose the next loop.** Review the competency gates. Repeat failed gates with new variations; choose the next topic from observed gaps or target job requirements. Maintain two SQL/code recall sessions and one mock each week.

Evidence: A next-cycle plan backed by code, tests, explanations, and specific gaps.

Primary references: [MySQL tutorial](https://dev.mysql.com/doc/refman/8.4/en/tutorial.html) · [Spring web-layer testing](https://spring.io/guides/gs/testing-web/) · [Microservices architecture trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)

## System design experiments alongside the path

The new [System design lab](SYSTEM_DESIGN_LAB.md) supports the systems assignments with editable graphs and deterministic flow checks. Use one experiment in the 25-minute project/debug block, then explain the result in the normal ten-minute explanation block. Longer exercises can span sessions. The two-hour routine does not need to grow.

| Path focus | Lab challenge | Evidence to carry back to the project |
|---|---|---|
| Week 4: one complete feature | Follow one request all the way through | Trace a request through the actual API, service, transaction, and committed row |
| Week 6: caches and workload | Give the database room to breathe; A warm cache cannot complete your writes | Predict read misses and write load, then compare with a real workload and a freshness test |
| Week 6: overload and failures | Reject overload deliberately; Lose a server. Keep the feature working. | Separate rejected requests from failures and demonstrate the chosen recovery behavior |
| Week 7: asynchronous boundaries | A queue is a promise to finish later | Explain acceptance, completion, pending jobs, duplicate delivery, and ownership |

The graph checks verify their published numerical assumptions. They do not execute a real service, guarantee database durability, or establish that a service split is appropriate. Keep the written architecture drills and the local backend implementation as separate evidence.

## Python practice coverage

The six original drills include a defined input contract, editable starter, correct solution, deliberate bug, assertion tests, edge fixtures, explanation, and complexity notes. Run them in full Python 3; the original Mini-Python interpreter is not a substitute. Public tests support learning and can be inspected, so they are not a secure competitive judge.

- **Initialize two independent workouts:** Define Workout(name). Each instance stores its name and its own empty minutes list. add_minutes(value) appends a nonnegative integer; total_minutes() returns the sum. Prove that changing one instance does not affect another.
- **Copy a window without changing the input:** Write middle_window(values) that returns elements at indices 1 through 3 inclusive as a new list. Short inputs return the available elements. Then write reversed_copy(values) that returns a reversed new list. Neither function may mutate values.
- **Append one value and return the list:** Write record_duration(durations, value). Append value to the supplied list and return that same list object. Explain what append itself returns.
- **Group minutes with a dictionary:** Write totals_by_user(entries). Each entry is a two-item tuple (user_id, minutes). Return a dictionary of each user’s total minutes. Preserve all users present in the input, including one whose total is zero.
- **Choose the correct boundary:** Write qualifying_minutes(values, minimum). Return a new list of values greater than or equal to minimum, in their original order. Preserve duplicates and leave the input unchanged.
- **Handle one expected exception:** Write parse_duration(text). Strip surrounding whitespace and parse a base-10 integer. Return None if parsing fails or the integer is negative; otherwise return the integer, including zero. Avoid catching unrelated programming errors.

## Architecture conversation practice

Write or say an answer before opening the comparison answer. Use the rubric as a self-assessment. The scenario is an exercise; the failure drill must be performed in a local learning environment before claiming it as project evidence.

### Does this app need microservices?

A small team owns a workout app with profiles, workout recording, and weekly reports. It deploys once a week and has no measured scaling problem.

- What would you deploy first, and why?
- What concrete change would justify a separate service?
- Can an independently deployed service still break another service?

**Failure drill:** Imagine reporting traffic increases sharply. Explain how you would measure the bottleneck before choosing an index, worker, cache, or service split.

Reference: [Microservices architecture trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)

### A dependency stops responding

Saving a workout calls a recommendation service. That service sometimes takes 30 seconds, while users expect the save request to finish promptly.

- Does a workout need a recommendation before it can be saved?
- Where do you set a deadline?
- Which failures should be retried, and how many times?

**Failure drill:** Make a local stub delay its response. Measure how long the caller waits, then restore the dependency and show recovery.

Reference: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) · [Circuit breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)

### The same workout is saved twice

A phone sends POST /workouts. The server commits, but the response is lost. The phone retries because it cannot tell whether the first request succeeded.

- Why does a client timeout not prove the operation failed?
- How can the server recognize the same logical operation?
- What if the same key arrives with a different payload?

**Failure drill:** Send the same logical request twice, including concurrently, and prove exactly one workout row is created in the local test.

Reference: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) · [Transactional outbox and duplicate delivery](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

### The database write succeeds but the event is lost

A workout is committed, then the API publishes workout.recorded for a reporting worker. The process crashes between those two operations.

- What state does each system have after the crash?
- How could you avoid silently losing the event?
- Can the worker still receive a duplicate?

**Failure drill:** Stop the publisher after the transaction commits. Restart it and verify the event is eventually handled; replay the event and verify the report is not incremented twice.

Reference: [Transactional outbox and duplicate delivery](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

### The summary disagrees with the database

A weekly workout total is cached for five minutes. A user adds a workout and immediately sees the old total.

- What is the source of truth?
- How stale may this particular screen be?
- What happens when the cache is unavailable?

**Failure drill:** Cache a result, modify a workout, and inspect the next read. Then disable the cache and observe both correctness and database load.

Reference: [Cache-aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

### Two services share one table

Workouts and reporting are separate deployments, but both directly update the workouts table. One service renames a column.

- How independent are these services in practice?
- Who owns the schema and business rules?
- How would you roll out a compatible change?

**Failure drill:** Change a contract in a local experiment and run the old consumer’s test. Repair the rollout so both old and new consumers work during migration.

Reference: [Microservices architecture trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)

## What counts as database management

A browser SQL engine lets you test statements and inspect results. A separate database process adds operational responsibilities: connections, accounts, configuration, migration history, concurrency, monitoring, backup, and recovery. The MySQL tasks explicitly exercise that boundary. Record the installed version and observed behavior; do not assume SQLite syntax, locking, query plans, or DDL rollback behavior transfer unchanged.

Use synthetic records in a dedicated development database. Restore into a new database name and compare both schema and data. A dump file that has never been restored does not demonstrate that your recovery procedure works. MySQL statements can have implicit-commit behavior, so inspect the documentation before assuming a schema migration can be rolled back as ordinary DML.

References: [MySQL implicit commits](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html) · [SQL-format backups](https://dev.mysql.com/doc/refman/8.4/en/mysqldump-sql-format.html) · [Restoring backups](https://dev.mysql.com/doc/refman/8.4/en/reloading-sql-format-dumps.html)

## A useful project walkthrough

Explain the requirement, the schema and invariants, the HTTP contract, the request’s path through the code, a test that catches a real mistake, the deployment/run procedure, and one failure you reproduced and repaired. State which work you wrote independently, which documentation or tools helped, and what remains unverified. You should be able to edit the feature and diagnose a changed requirement, not only recite the finished design.

## Keep the plan honest

Practice evidence and self-assessment; not a certification or hiring prediction.

SQL exercises use browser-local SQLite. Database operations use a separate local MySQL instance. Python drills require full Python 3; the original Mini-Python lab does not support functions, classes, or strings. Java/Spring tasks run in your local project.

Save a first attempt before viewing a hint or answer. Mark assisted work honestly. An independent retry on changed data is separate evidence.

The linked sources are primary language and platform documentation. Assignments, scenarios, rubrics, and pacing are original coaching decisions. No paid service, additional account, public sharing, or production infrastructure is required by this learning plan.
