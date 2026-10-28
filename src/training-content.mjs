import { PYTHON_BACKEND_DRILLS } from './backend-content.mjs';
// Original practice assignments. A checked box is self-reported evidence, not certification.
// Runtime-specific tasks identify their environment; the Mini-Python interpreter cannot run these Python drills.
export const SESSION_BLOCKS = [
  {id:'recall',title:'Recall without notes',minutes:10,purpose:'Find out what you can retrieve before seeing the answer.',action:'Rewrite yesterday’s query or function. Predict its output and mark exactly where you get stuck.'},
  {id:'learn',title:'Learn one small concept',minutes:15,purpose:'Give today’s attempt a clear target.',action:'Read the assigned primary source or teaching note. Close it and explain what, why, and how in three sentences.'},
  {id:'practice',title:'Write and test',minutes:45,purpose:'Turn understanding into code you can produce.',action:'Start with a blank editor. Attempt today’s SQL or Python task for 10 minutes before a hint; test normal, empty, and boundary inputs.'},
  {id:'break',title:'Take a break',minutes:10,purpose:'Make a two-hour routine sustainable.',action:'Step away from the screen. This is a break inside the 120-minute session, not coding time.'},
  {id:'build',title:'Build or investigate',minutes:25,purpose:'Connect the exercise to a real feature.',action:'Complete today’s small project step, or reproduce one failure and repair it. Save the code, query, test, or investigation notes.'},
  {id:'explain',title:'Explain your decision',minutes:10,purpose:'Practice the conversation an interviewer or teammate needs.',action:'Explain what your code does, why you chose it, how it behaves, an edge case, and one trade-off. Answer a follow-up without reading.'},
  {id:'journal',title:'Log evidence and next retry',minutes:5,purpose:'Let tomorrow’s session start with a concrete action.',action:'Record what you wrote independently, any hints or answer views, one corrected mistake, and a changed version to retry later.'}
];

const ref = (title,url) => ({title,url});
const mysqlTutorial = ref('MySQL tutorial','https://dev.mysql.com/doc/refman/8.4/en/tutorial.html');
const pythonIntro = ref('Python sequences and slicing','https://docs.python.org/3/tutorial/introduction.html');
const pythonData = ref('Python lists and dictionaries','https://docs.python.org/3/tutorial/datastructures.html');
const pythonClasses = ref('Python classes and instance state','https://docs.python.org/3/tutorial/classes.html');
const pythonErrors = ref('Python errors and exceptions','https://docs.python.org/3/tutorial/errors.html');
const sqlitePython = ref('Python sqlite3 and value parameters','https://docs.python.org/3/library/sqlite3.html');
const mysqlSetup = ref('Install local MySQL','https://dev.mysql.com/doc/refman/8.4/en/installing.html');
const transactions = ref('MySQL transactions','https://dev.mysql.com/doc/refman/8.4/en/commit.html');
const implicitCommit = ref('MySQL implicit-commit statements','https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html');
const locking = ref('InnoDB locking','https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html');
const plans = ref('MySQL EXPLAIN','https://dev.mysql.com/doc/refman/8.4/en/using-explain.html');
const backups = ref('MySQL SQL-format backups','https://dev.mysql.com/doc/refman/8.4/en/mysqldump-sql-format.html');
const restore = ref('Restore SQL-format backups','https://dev.mysql.com/doc/refman/8.4/en/reloading-sql-format-dumps.html');
const jdbc = ref('Spring JDBC data access','https://spring.io/guides/gs/relational-data-access/');
const webTests = ref('Spring web-layer testing','https://spring.io/guides/gs/testing-web/');
const authorization = ref('Spring request authorization','https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html');
const microservices = ref('Microservices architecture trade-offs','https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices');
const retry = ref('Retry pattern','https://learn.microsoft.com/en-us/azure/architecture/patterns/retry');
const breaker = ref('Circuit breaker pattern','https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker');
const cacheAside = ref('Cache-aside pattern','https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside');
const outbox = ref('Transactional outbox and duplicate delivery','https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html');
const day = (id,title,task,deliverable,route='#training') => ({id,title,task,deliverable,route});

export const TRAINING_WEEKS = [
  {
    id:'week-1',week:1,title:'Start from a blank editor',
    goal:'Produce a small join and basic Python independently; practice recovering when you cannot recall a detail.',
    gate:'On separate days, create two related tables with valid rows and write a correct join in 15 minutes. Write a Python class and a slice without the model answer, then explain both.',
    resources:[mysqlTutorial,pythonIntro,pythonClasses,pythonData],
    days:[
      day('w1d1','Two tables and one join','In the SQL lab, create two related tables, insert a parent with no children and another with two children, and write an INNER JOIN. Predict every result row before running. During the project block, draw users → workouts and write the key names.','Saved SQL, predicted rows, actual rows, and a one-minute explanation of the join.','#sql'),
      day('w1d2','Objects, lists, and slices','Use a real Python 3 interpreter for the instance-state and slicing drills. Create two separate workout objects, append to one, and prove the other is unchanged. Then rewrite yesterday’s join with new table names.','A Python file with assertions and a fresh join written from memory.','#python'),
      day('w1d3','Include the missing parent','Write an INNER JOIN and a LEFT JOIN over the same data. Add a user with no workouts. Explain NULL and count workouts correctly with COUNT(workout_id). Rebuild the schema without copying day 1.','Two result tables and the reason a user appears in only one of them.','#sql'),
      day('w1d4','Functions you can test','Complete the dictionary-summary and function-boundary Python drills. Include empty input and a value exactly on the threshold. Write a new test before fixing a deliberate bug.','A function, a failing test, the fix, and a short complexity explanation.','#python'),
      day('w1d5','Ask a question of grouped data','Find each user’s workout count and total minutes. Use GROUP BY, then HAVING to keep only users over a target. Explain the difference between filtering rows and filtering groups.','Two queries that still work after the fixture data changes.','#sql'),
      day('w1d6','A small interview rehearsal','With answers hidden, spend 15 minutes on a fresh two-table SQL example and 20 minutes on a small Python function. Explain why a small workout app can remain a modular monolith. On a blank, state the smallest next step and write it.','An unedited first attempt, assistance notes, and a three-minute spoken explanation.','#studio'),
      day('w1d7','Retry the weakest skill','Choose the weakest attempt from this week. Change the data, names, or boundary and solve it again. Review the answer only after saving the attempt. If the gate still fails, repeat this week’s relevant tasks.','A delayed attempt and one specific target for the next session.')
    ]
  },
  {
    id:'week-2',week:2,title:'Reason about relational data',
    goal:'Choose a schema deliberately and answer questions without losing or duplicating rows.',
    gate:'Solve at least 8 of 10 unfamiliar query variations and explain every unexpected row. Include NULL, a zero-child parent, a duplicate, and a three-table relationship.',
    resources:[mysqlTutorial,plans,pythonData,sqlitePython],
    days:[
      day('w2d1','Model a workout journal','Define users, workouts, exercises, and workout_sets. State one row’s meaning in each table. Add primary keys, foreign keys, NOT NULL, and appropriate CHECK or UNIQUE constraints. Keep this in the disposable practice database.','A schema diagram, CREATE statements, and the reason for each constraint.','#sql'),
      day('w2d2','Catch invalid data','Attempt an orphan workout, duplicate unique value, missing required value, and invalid duration. Record which constraint rejects each. For optional values, compare IS NULL with an equality comparison.','Four rejected inserts with explanations and one valid optional-value example.','#sql'),
      day('w2d3','Join three tables safely','Report exercises used by each user. Predict how multiple workouts and sets multiply rows. Decide whether the question wants sets, workouts, exercises, or distinct users before adding DISTINCT.','A three-table query and a deliberately duplicated fixture that exposes a wrong answer.','#sql'),
      day('w2d4','Find what did not happen','Find users with no workouts using NOT EXISTS, then a LEFT JOIN. Add a nullable value to a separate fixture and inspect how it changes NOT IN. Explain absence separately from an unknown value.','Two equivalent absence queries and a NULL counterexample.','#sql'),
      day('w2d5','Latest workout per user','Choose a deterministic rule for tied timestamps. Implement a latest-per-user query with a window function, and explain PARTITION BY and the tie-breaker. Keep users with no workouts only if the requirement asks for them.','Query, tied-time fixture, and an explicit tie policy.','#sql'),
      day('w2d6','Parameterized data access','In a local Python script using sqlite3, run a parameterized SELECT with user input. Try an apostrophe in a name. Compare a value parameter with an allowlisted sort-column choice. Keep the database throwaway.','A tested script that treats user values as data and explains why column names need a separate allowlist.','#python'),
      day('w2d7','Query transfer check','Ask a peer or tutor for ten small variations using unfamiliar table names. Attempt them with no solutions visible. For each wrong result, identify the faulty assumption before rewriting SQL.','Score by actual results, error categories, and a scheduled retry for each miss.','#sql')
    ]
  },
  {
    id:'week-3',week:3,title:'Own a real database',
    goal:'Move from browser SQL practice to managing a local MySQL database with synthetic data.',
    gate:'Create a database from migrations, demonstrate rollback and a constraint failure, inspect an execution plan, and restore a backup into a separate database with matching rows.',
    resources:[mysqlSetup,transactions,implicitCommit,locking,plans,backups,restore],
    days:[
      day('w3d1','Run MySQL locally','Install or start a local MySQL 8.4 development instance using the official instructions for your OS. Connect with the CLI, record SELECT VERSION(), create a dedicated practice database, and apply your schema. The browser lab uses SQLite and does not complete this task.','A reproducible local setup note and a successful schema migration.'),
      day('w3d2','Commit and roll back','Using InnoDB tables, update two related rows inside START TRANSACTION. Inspect the state, ROLLBACK, and verify original values. Repeat with COMMIT. Keep schema changes out of this transaction exercise; MySQL DDL can implicitly commit.','Before/after queries for rollback and commit, plus an atomicity explanation.'),
      day('w3d3','Observe concurrent sessions','Open two local connections. Update the same row inside an uncommitted transaction, then attempt a conflicting update from the other connection. Observe waiting and release it with rollback. Use a short local lock-wait timeout.','A sequence of commands, observed waiting, and an explanation of the lock’s purpose.'),
      day('w3d4','Measure an index','Generate representative synthetic workouts. Run EXPLAIN for a user-and-date query before and after a suitable composite index. Measure repeated runs, keep result correctness constant, and explain the index’s storage/write cost.','Actual query plans and timings, including if the optimizer chose not to use the index.'),
      day('w3d5','Change a schema safely','Add an optional workout note in a numbered migration. Rebuild a fresh database through all migrations. Plan how a required field would need a compatible rollout and backfill. Do not treat ROLLBACK as a universal DDL undo command.','Migration files, clean-database replay, and a rollback or forward-repair plan.'),
      day('w3d6','Prove a backup restores','Dump the synthetic database with the appropriate mysqldump options for your setup. Restore into a separately named practice database. Compare table counts, sample joined rows, and constraints. Never use the original as the restore target.','Backup file kept locally and a restore checklist with verified comparisons.'),
      day('w3d7','Operate without the recipe','Repeat setup, migration, rollback, index inspection, and restore using only your own short runbook. Create a limited application database account and demonstrate its allowed and denied operations. Documentation is allowed for exact administrative flags.','A runbook another developer can follow and the observed DB-ownership gate.')
    ]
  },
  {
    id:'week-4',week:4,title:'Build one complete backend feature',
    goal:'Carry a workout-journal requirement through Java/Spring, SQL, tests, and a usable HTTP endpoint.',
    gate:'Demonstrate one endpoint from request to stored row, one read query, invalid input, missing data, and database failure. Explain the SQL without an ORM hiding it.',
    resources:[jdbc,webTests,transactions],
    days:[
      day('w4d1','Define the feature before coding','Write acceptance examples for creating a workout and viewing a user’s recent workouts. Specify request fields, response shape, ownership, invalid input, and missing-user behavior. Use a separate learning project and synthetic users.','An API contract and five concrete acceptance examples.'),
      day('w4d2','Practice Java’s building blocks','Write a Workout value type, a list of workouts, a summary function, and tests. Explain List versus ArrayList, reference equality versus value equality, exceptions, and constructor initialization. Keep the work in Java rather than translating the Python mini interpreter.','Compiling Java code and tests for empty input, multiple users, and a duration boundary.'),
      day('w4d3','Write the persistence layer','Create a small Spring project and a JDBC repository. Write parameterized INSERT and SELECT statements yourself. Map rows to Java values, handle an empty result, and keep credentials out of source control.','A repository operation tested against your local MySQL schema.'),
      day('w4d4','Create and validate a workout','Implement POST /workouts with validated fields and a clear error response. Persist through the repository. Test a valid request, negative duration, missing field, and nonexistent user.','An HTTP example for each case and meaningful automated assertions.'),
      day('w4d5','Read with filtering and pagination','Implement a user’s workout list with a documented limit, deterministic ordering, and parameterized filters. Add a tie-breaking ID to timestamp ordering. Test an empty list and a user with more than one page.','A GET endpoint, its SQL, and tests that expose skipped or repeated rows.'),
      day('w4d6','Trace one request','Follow a request through routing, validation, service logic, SQL, commit, and response. Add a request ID to useful logs without logging credentials or personal payloads. Stop the local DB and inspect the error path.','A request-flow sketch and a database-failure response that you can explain.'),
      day('w4d7','Rebuild a small slice','Implement a small second feature, such as updating a workout note, from acceptance examples. Use documentation for APIs after a first attempt. Explain every line of the SQL and the transaction boundary.','A complete change with tests and an independent three-minute walkthrough.')
    ]
  },
  {
    id:'week-5',week:5,title:'Make the feature dependable',
    goal:'Test the boundaries users and operations will exercise, then run the application reproducibly.',
    gate:'Show a regression caught by a test, cross-user access denied, a repeatable start command, and a failure investigation supported by observed evidence.',
    resources:[webTests,jdbc,authorization,plans],
    days:[
      day('w5d1','Test behavior at the right boundary','Separate pure calculation tests, repository tests against real MySQL, and HTTP contract tests. Introduce a deliberate off-by-one duration bug and verify a test fails before repairing it.','A test map and one regression test that fails for the intended reason.'),
      day('w5d2','Authorize the owner','Add supported authentication in the local project, or use a clearly labeled test principal while building the authorization rule. Verify user A cannot read or update user B’s workout by changing an ID. Never trust a client-supplied owner ID alone.','Two-user denial tests and a short distinction between authentication and authorization.'),
      day('w5d3','Make errors useful','Map validation, not-found, conflict, and unexpected failures to documented responses. Keep internal exceptions out of client responses. Reproduce a database constraint violation and link it to its request ID.','An error contract, representative tests, and a traceable failure log.'),
      day('w5d4','Debug a slow request','Seed enough synthetic rows to reproduce a slow list endpoint. Inspect the query count and plans. Compare one targeted change with the baseline; retain correctness tests and state measurement limitations.','A before/after investigation with measured observations and a reproducible command.'),
      day('w5d5','Run from a clean checkout','Document prerequisites, configuration names, migrations, start, and test commands. Use a separate working copy and fresh practice database to follow those steps. Add a health check that matches its stated purpose.','A working setup runbook and a list of missing assumptions you repaired.'),
      day('w5d6','Rehearse deployment and rollback','Package the app and run it in a separate local environment. Apply a compatible migration, run smoke checks, and roll back the application version. Use an existing approved hosting setup only if available; this task does not require buying infrastructure.','A release checklist, observed checks, and a realistic rollback boundary.'),
      day('w5d7','Own a small incident','Have someone introduce a documented fault in the local project, such as a wrong DB port or missing migration. Record symptoms, hypothesis, evidence, fix, and prevention. Keep SQL and Python recall in the first session block.','A one-page incident note and a passing end-to-end feature demonstration.')
    ]
  },
  {
    id:'week-6',week:6,title:'Reason about systems under failure',
    goal:'Connect latency, caching, timeouts, retries, and background work to observable behavior.',
    gate:'Explain a dependency timeout and a duplicate request, then demonstrate one safe recovery in your local application.',
    resources:[retry,breaker,cacheAside,outbox],
    days:[
      day('w6d1','Draw the request and its waits','Diagram browser → API → database and identify network, queueing, and processing time. Time a real local request and explain what the measurement includes. Distinguish latency from throughput.','A request diagram and a measured latency with its limits.','#architecture'),
      day('w6d2','Choose a cache boundary','Complete the stale-summary architecture drill. Implement a tiny local cache only for the experiment, state its key and expiry, then update underlying data and inspect the stale result. Remove or fix it deliberately.','A stale-data reproduction and a justified invalidation strategy.','#architecture'),
      day('w6d3','Handle a dependency that stalls','Use a local stub that delays a response. Add a request timeout and bounded error handling. State whether the caller can retry safely and what happens when all attempts fail.','A timing test and a user-visible failure behavior.','#architecture'),
      day('w6d4','Make a retry safe','Complete the duplicate-workout drill. Store an idempotency key with a unique constraint and the associated request fingerprint/result where appropriate. Replay the request and test a reused key with a different payload.','Tests showing one logical operation despite repeated delivery.','#architecture'),
      day('w6d5','Move optional work off the request','Write down which work must finish before acknowledging a workout save and which can happen later. Simulate a reporting worker and retry a failed job. State the retry limit and where failed work is visible.','A job-state model and a reproducible retry experiment.','#architecture'),
      day('w6d6','Observe rather than guess','Add a small set of logs or counters for request duration, errors, and retries. Trigger a timeout and trace one operation through the evidence. Explain how you would notice a growing backlog.','An investigation using request IDs and actual recorded events.'),
      day('w6d7','Explain the failure cases','Answer the architecture prompts without notes. For each design, name a failure and what remains correct. Rewrite one previous SQL and Python exercise from memory before reviewing your explanation.','Two three-minute explanations and a delayed independent coding attempt.','#architecture')
    ]
  },
  {
    id:'week-7',week:7,title:'Understand service boundaries',
    goal:'Justify a modular monolith or a small service split using ownership, deployment, and failure requirements.',
    gate:'Present a reasoned architecture choice and handle follow-ups about data ownership, contract changes, partial failure, retries, and duplicate events.',
    resources:[microservices,outbox,retry,breaker],
    days:[
      day('w7d1','Name the business boundaries','Map workout recording, reporting, and notifications as modules. State which data and business rules each owns. Keep one deployment first and explain what would justify changing that.','A module map and an explicit reason to keep or split each boundary.','#architecture'),
      day('w7d2','Write a service contract','Design a reporting API or workout-recorded event with identifiers and a versioning policy. Add contract examples. Explain why a producer cannot silently rename a required field just because it deploys independently.','A contract, compatibility test, and example change plan.','#architecture'),
      day('w7d3','Separate one process as an experiment','Run a small reporting worker separately from the main API in a local-only learning experiment. Give it a defined communication boundary. Compare start-up, deployment, and debugging work with the in-process module.','A two-process experiment and an honest cost/benefit comparison.'),
      day('w7d4','Avoid a lost event','Complete the dual-write drill. In the local project, save a workout and an outbox record in the same database transaction. Simulate failure before delivery and resume the publisher.','An experiment showing the pending event survives the application failure.','#architecture'),
      day('w7d5','Handle duplicate and late events','Replay an event twice against a consumer. Track a stable event ID and make its state change idempotent. Add a late event and state how ordering or version checks should work for the chosen business rule.','Duplicate-delivery test and a written ordering assumption.','#architecture'),
      day('w7d6','Contain a dependency outage','Stop the reporting worker or make its API fail. Show which primary workflow continues and what becomes delayed. Add bounded retries or a circuit-breaker experiment only where the failure model warrants it.','A failure drill with recovery evidence and no claim of guaranteed availability.','#architecture'),
      day('w7d7','Defend the simpler design','Present both the modular monolith and service experiment. Use measured or observed constraints to choose one. Explain the cases in which you would reverse that choice.','A short decision record with benefits, costs, assumptions, and a reconsideration trigger.','#architecture')
    ]
  },
  {
    id:'week-8',week:8,title:'Demonstrate independent ownership',
    goal:'Turn the work into reproducible evidence and practice explaining it under interview conditions.',
    gate:'Complete two mock sessions on separate days, rebuild a small feature without generated implementation, and walk through a database restore and a system failure.',
    resources:[mysqlTutorial,webTests,microservices],
    days:[
      day('w8d1','Retest the foundations cold','Use unfamiliar table names and new data for a two-table schema and join. Write a Python function and class from blank files. Save attempts before reading old work and record exact assistance.','A fresh baseline compared with the first week’s evidence.','#sql'),
      day('w8d2','Build an unfamiliar variation','Add a weekly workout-goal feature from a brief requirement. Write the schema change, query, API behavior, and tests. Clarify ambiguous requirements before implementing.','A complete vertical slice and the reason for each design choice.'),
      day('w8d3','Rehearse database recovery','Use your runbook to restore a synthetic backup into a new database. Verify the application reads expected records. Explain what data would be missing if the backup were older.','A verified restore and an explanation of recovery-point and recovery-time goals.'),
      day('w8d4','Mock interview one','Run a 45-minute mock: SQL, one language task, and an architecture follow-up. Use no answer assistance. When stuck, restate the requirement, make a tiny example, and implement one correct step.','A first attempt, review rubric, and two concrete corrections.','#studio'),
      day('w8d5','Repair the evidence','Turn the mock’s weakest area into a changed task and fix it. Write a project walkthrough covering requirement, schema, request flow, test, deployment, and one failure you actually observed.','A revised task and a concise, truthful project case study.'),
      day('w8d6','Mock interview two','Use new tasks and a different follow-up. Ask for clarification when appropriate and state uncertainty precisely. Compare independent completion and recovery behavior, not just confidence.','A second mock with an honest comparison against the first.','#studio'),
      day('w8d7','Choose the next loop','Review the competency gates. Repeat failed gates with new variations; choose the next topic from observed gaps or target job requirements. Maintain two SQL/code recall sessions and one mock each week.','A next-cycle plan backed by code, tests, explanations, and specific gaps.')
    ]
  }
];

export const ARCHITECTURE_DRILLS = [
  {
    id:'monolith-or-services',title:'Does this app need microservices?',
    scenario:'A small team owns a workout app with profiles, workout recording, and weekly reports. It deploys once a week and has no measured scaling problem.',
    questions:['What would you deploy first, and why?','What concrete change would justify a separate service?','Can an independently deployed service still break another service?'],
    modelAnswer:'Start with a modular monolith and explicit boundaries for workouts and reporting. One deployment and local transactions keep operations manageable. A separate service becomes useful when a business capability needs independent ownership, release cadence, or scaling that outweighs the extra operational work. Separate deployment does not remove coupling: changing an API or event contract can still break consumers. Define compatibility rules and tests before splitting.',
    rubric:['Names a business boundary rather than only code size.','Connects the choice to team and operational constraints.','Explains both independent deployment and compatible contracts.','Names a concrete reason to reconsider the choice.'],
    failureDrill:'Imagine reporting traffic increases sharply. Explain how you would measure the bottleneck before choosing an index, worker, cache, or service split.',
    sources:[microservices]
  },
  {
    id:'dependency-timeout',title:'A dependency stops responding',
    scenario:'Saving a workout calls a recommendation service. That service sometimes takes 30 seconds, while users expect the save request to finish promptly.',
    questions:['Does a workout need a recommendation before it can be saved?','Where do you set a deadline?','Which failures should be retried, and how many times?'],
    modelAnswer:'First decide whether the recommendation is required for correctness. If it is optional, save the workout and fetch or compute the recommendation later. Bound network calls with timeouts. Retry selected transient failures only when the operation is safe to repeat, with a limited budget and backoff; do not repeatedly retry invalid requests. If failures persist, a circuit breaker can temporarily stop attempts and later probe recovery. Define a clear pending or unavailable response.',
    rubric:['Separates required work from optional work.','Defines a timeout and total retry budget.','Checks whether the operation is safe to repeat.','Describes failure and recovery behavior visible to the caller.'],
    failureDrill:'Make a local stub delay its response. Measure how long the caller waits, then restore the dependency and show recovery.',
    sources:[retry,breaker]
  },
  {
    id:'duplicate-request',title:'The same workout is saved twice',
    scenario:'A phone sends POST /workouts. The server commits, but the response is lost. The phone retries because it cannot tell whether the first request succeeded.',
    questions:['Why does a client timeout not prove the operation failed?','How can the server recognize the same logical operation?','What if the same key arrives with a different payload?'],
    modelAnswer:'The response may be lost after a successful commit. Use a stable idempotency key scoped to the authenticated caller and operation. Enforce uniqueness in the database, and tie the key, a request fingerprint, and the operation result to the write so concurrent duplicates cannot create two records. A replay of the same request returns the prior result; a conflicting payload under the same key is rejected according to the API contract. Retention and retry windows must be specified.',
    rubric:['Explains the ambiguous outcome after a timeout.','Uses a persistent unique key rather than an in-memory flag.','Addresses concurrent duplicates and atomic storage.','Defines the behavior for a reused key with a changed request.'],
    failureDrill:'Send the same logical request twice, including concurrently, and prove exactly one workout row is created in the local test.',
    sources:[retry,outbox]
  },
  {
    id:'database-and-event',title:'The database write succeeds but the event is lost',
    scenario:'A workout is committed, then the API publishes workout.recorded for a reporting worker. The process crashes between those two operations.',
    questions:['What state does each system have after the crash?','How could you avoid silently losing the event?','Can the worker still receive a duplicate?'],
    modelAnswer:'Two independent writes leave a failure gap. Store the workout and an outbox event in the same local database transaction. A separate publisher retries unsent outbox records. Delivery can still duplicate an event, so the consumer uses an event ID and an atomic deduplication/state change. The reporting view becomes eventually consistent; expose delay honestly. This does not create a single cross-service transaction or prove exactly-once execution everywhere.',
    rubric:['Identifies the dual-write failure gap.','Places the business row and outbox row in one local transaction.','Handles duplicate delivery at the consumer.','Explains delayed consistency and the pattern’s limits.'],
    failureDrill:'Stop the publisher after the transaction commits. Restart it and verify the event is eventually handled; replay the event and verify the report is not incremented twice.',
    sources:[outbox]
  },
  {
    id:'stale-summary',title:'The summary disagrees with the database',
    scenario:'A weekly workout total is cached for five minutes. A user adds a workout and immediately sees the old total.',
    questions:['What is the source of truth?','How stale may this particular screen be?','What happens when the cache is unavailable?'],
    modelAnswer:'State the freshness requirement before choosing a cache. The database remains authoritative. A cache-aside read loads on a miss; a write can invalidate the relevant cached summary after a successful commit, with an expiry as a bound on stale entries. Races and invalidation failure still need consideration. If the cache is unavailable, a controlled database fallback may be appropriate if capacity allows it. Authorization must apply to cached data as well as database reads.',
    rubric:['Names the source of truth and freshness requirement.','Uses a user-scoped key and preserves access control.','Explains invalidation, expiry, and an important race.','Considers failure without overwhelming the database.'],
    failureDrill:'Cache a result, modify a workout, and inspect the next read. Then disable the cache and observe both correctness and database load.',
    sources:[cacheAside]
  },
  {
    id:'service-data-ownership',title:'Two services share one table',
    scenario:'Workouts and reporting are separate deployments, but both directly update the workouts table. One service renames a column.',
    questions:['How independent are these services in practice?','Who owns the schema and business rules?','How would you roll out a compatible change?'],
    modelAnswer:'Shared writes couple releases and make ownership unclear. Give the workout capability ownership of its write model. Reporting can consume an API or events into a suitable read model, with explicit freshness and reconciliation rules. If a split adds more cost than value, retain modules in one application. For a contract change, add a compatible field, migrate consumers, and remove the old contract only after verifying it is unused.',
    rubric:['Recognizes coupling despite separate processes.','Assigns responsibility for data and invariants.','Discusses a read API or events and their consistency cost.','Proposes a staged compatible change and considers keeping one application.'],
    failureDrill:'Change a contract in a local experiment and run the old consumer’s test. Repair the rollout so both old and new consumers work during migration.',
    sources:[microservices]
  }
];

export const PYTHON_DRILLS = [
  {
    id:'instance-state',title:'Initialize two independent workouts',
    prompt:'Define Workout(name). Each instance stores its name and its own empty minutes list. add_minutes(value) appends a nonnegative integer; total_minutes() returns the sum. Prove that changing one instance does not affect another.',
    contract:'name is a string; values passed to add_minutes are nonnegative integers. Each new instance must own a distinct list. No validation of inputs outside this contract is required.',
    starter:'# Write class Workout and its methods here.\n',
    solution:'class Workout:\n    def __init__(self, name):\n        self.name = name\n        self.minutes = []\n\n    def add_minutes(self, value):\n        self.minutes.append(value)\n\n    def total_minutes(self):\n        return sum(self.minutes)\n',
    bug:'class Workout:\n    minutes = []\n\n    def __init__(self, name):\n        self.name = name\n\n    def add_minutes(self, value):\n        self.minutes.append(value)\n\n    def total_minutes(self):\n        return sum(self.minutes)\n',
    tests:"a = Workout(\"walk\")\nb = Workout(\"ride\")\nassert a.name == \"walk\" and b.name == \"ride\", \"Expected: a.name == \\\"walk\\\" and b.name == \\\"ride\\\"\"\nassert a.total_minutes() == 0 and b.total_minutes() == 0, \"Expected: a.total_minutes() == 0 and b.total_minutes() == 0\"\na.add_minutes(20)\na.add_minutes(0)\na.add_minutes(15)\nassert a.total_minutes() == 35, \"Expected: a.total_minutes() == 35\"\nassert b.total_minutes() == 0, \"Expected: b.total_minutes() == 0\"\nassert a.minutes is not b.minutes, \"Expected: a.minutes is not b.minutes\"\nb.add_minutes(7)\nassert a.total_minutes() == 35 and b.total_minutes() == 7, \"Expected: a.total_minutes() == 35 and b.total_minutes() == 7\"\n",
    explanation:'__init__ initializes an instance’s state during construction. self refers to the instance receiving the method call. Creating the list inside __init__ gives each workout a separate list. A class-level list is shared, which makes the deliberate bug visible when a second workout is created. This is object initialization, not the program entry point.',
    complexity:'Construction is O(1). Each append is amortized O(1) in CPython. total_minutes is O(n) for n recorded entries; each instance uses O(n) list space.',
    fixtures:[{label:'Empty instance',assertion:'A new workout totals 0.'},{label:'Separate state',assertion:'Adding to a does not change b.'},{label:'Boundary',assertion:'Adding 0 preserves the total.'}],
    sources:[pythonClasses,pythonData]
  },
  {
    id:'list-slices',title:'Copy a window without changing the input',
    prompt:'Write middle_window(values) that returns elements at indices 1 through 3 inclusive as a new list. Short inputs return the available elements. Then write reversed_copy(values) that returns a reversed new list. Neither function may mutate values.',
    contract:'values is a Python list of integers of any length, including empty. Return lists; keep the original list unchanged.',
    starter:'# Write middle_window(values) and reversed_copy(values).\n',
    solution:'def middle_window(values):\n    return values[1:4]\n\ndef reversed_copy(values):\n    return values[::-1]\n',
    bug:'def middle_window(values):\n    return values[1:3]\n\ndef reversed_copy(values):\n    values.reverse()\n    return values\n',
    tests:"values = [10, 20, 30, 40, 50]\nassert middle_window(values) == [20, 30, 40], \"Expected: middle_window(values) == [20, 30, 40]\"\nassert middle_window([]) == [], \"Expected: middle_window([]) == []\"\nassert middle_window([7]) == [], \"Expected: middle_window([7]) == []\"\nassert middle_window([7, 8]) == [8], \"Expected: middle_window([7, 8]) == [8]\"\nassert reversed_copy(values) == [50, 40, 30, 20, 10], \"Expected: reversed_copy(values) == [50, 40, 30, 20, 10]\"\nassert reversed_copy([]) == [], \"Expected: reversed_copy([]) == []\"\nassert values == [10, 20, 30, 40, 50], \"Expected: values == [10, 20, 30, 40, 50]\"\nresult = middle_window(values)\nresult.append(99)\nassert values == [10, 20, 30, 40, 50], \"Expected: values == [10, 20, 30, 40, 50]\"\nassert reversed_copy(values) is not values, \"Expected: reversed_copy(values) is not values\"\n",
    explanation:'The slice stop is excluded, so indices 1, 2, and 3 require [1:4]. A step of -1 reads in reverse order. Reading a list slice creates a new shallow list; nested mutable elements would still be shared. By contrast, list.reverse() changes the original and returns None. Splitting a string by a separator is a different operation.',
    complexity:'A slice takes O(k) time and new-list space for k returned elements. middle_window returns at most three elements, so its work is bounded; reversed_copy uses O(n) time and space.',
    fixtures:[{label:'Exclusive stop',assertion:'A five-item input returns indices 1, 2, 3.'},{label:'Short input',assertion:'Empty and one-item inputs return [].'},{label:'No mutation',assertion:'The input is unchanged after both calls.'}],
    sources:[pythonIntro,pythonData]
  },
  {
    id:'append-and-return',title:'Append one value and return the list',
    prompt:'Write record_duration(durations, value). Append value to the supplied list and return that same list object. Explain what append itself returns.',
    contract:'durations is a list of integers; value is an integer. Mutation is required here. The result must be the same object as durations, not a copy.',
    starter:'# Write record_duration(durations, value).\n',
    solution:'def record_duration(durations, value):\n    durations.append(value)\n    return durations\n',
    bug:'def record_duration(durations, value):\n    return durations.append(value)\n',
    tests:"values = [10, 20, 30]\nresult = record_duration(values, 40)\nassert result == [10, 20, 30, 40], \"Expected: result == [10, 20, 30, 40]\"\nassert result is values, \"Expected: result is values\"\nempty = []\nassert record_duration(empty, 0) is empty, \"Expected: record_duration(empty, 0) is empty\"\nassert empty == [0], \"Expected: empty == [0]\"\nassert record_duration(empty, 0) == [0, 0], \"Expected: record_duration(empty, 0) == [0, 0]\"\n",
    explanation:'append changes the existing list and returns None. Returning durations after the append gives callers the list object requested by this contract. Always read the contract: a different exercise may require preserving the input instead of mutating it.',
    complexity:'One append is amortized O(1) in CPython. A resize can require O(n) work and capacity; repeated appends have amortized constant cost.',
    fixtures:[{label:'Ordinary list',assertion:'The new integer appears at the end.'},{label:'Empty list',assertion:'[] becomes [0].'},{label:'Identity',assertion:'The return value is the supplied list object.'}],
    sources:[pythonData]
  },
  {
    id:'group-totals',title:'Group minutes with a dictionary',
    prompt:'Write totals_by_user(entries). Each entry is a two-item tuple (user_id, minutes). Return a dictionary of each user’s total minutes. Preserve all users present in the input, including one whose total is zero.',
    contract:'entries is a list of (string, nonnegative integer) tuples. Repeated users are allowed. Empty input returns {}. Do not modify the input.',
    starter:'# Write totals_by_user(entries).\n',
    solution:'def totals_by_user(entries):\n    totals = {}\n    for user_id, minutes in entries:\n        totals[user_id] = totals.get(user_id, 0) + minutes\n    return totals\n',
    bug:'def totals_by_user(entries):\n    totals = {}\n    for user_id, minutes in entries:\n        totals[user_id] = minutes\n    return totals\n',
    tests:"entries = [(\"u1\", 20), (\"u2\", 10), (\"u1\", 15), (\"u3\", 0)]\nassert totals_by_user(entries) == {\"u1\": 35, \"u2\": 10, \"u3\": 0}, \"Expected: totals_by_user(entries) == {\\\"u1\\\": 35, \\\"u2\\\": 10, \\\"u3\\\": 0}\"\nassert totals_by_user([]) == {}, \"Expected: totals_by_user([]) == {}\"\nassert totals_by_user([(\"x\", 0), (\"x\", 0)]) == {\"x\": 0}, \"Expected: totals_by_user([(\\\"x\\\", 0), (\\\"x\\\", 0)]) == {\\\"x\\\": 0}\"\nassert entries == [(\"u1\", 20), (\"u2\", 10), (\"u1\", 15), (\"u3\", 0)], \"Expected: entries == [(\\\"u1\\\", 20), (\\\"u2\\\", 10), (\\\"u1\\\", 15), (\\\"u3\\\", 0)]\"\nassert totals_by_user([(\"u2\", 3), (\"u1\", 2)]) == {\"u2\": 3, \"u1\": 2}, \"Expected: totals_by_user([(\\\"u2\\\", 3), (\\\"u1\\\", 2)]) == {\\\"u2\\\": 3, \\\"u1\\\": 2}\"\n",
    explanation:'The dictionary carries the running total for each key. get(user_id, 0) provides the initial value only when that key is absent. Assigning minutes directly would overwrite earlier contributions. Connect this loop to SQL GROUP BY with SUM: both group records before combining their values.',
    complexity:'Expected O(n) time for n entries with average-case dictionary access, and O(u) extra space for u distinct users. This is not a worst-case guarantee for all hash behavior.',
    fixtures:[{label:'Repeated key',assertion:'Two u1 entries contribute to the same total.'},{label:'Empty input',assertion:'No entries returns {}.'},{label:'Zero total',assertion:'A present user with zero minutes remains in the result.'}],
    sources:[pythonData]
  },
  {
    id:'threshold-function',title:'Choose the correct boundary',
    prompt:'Write qualifying_minutes(values, minimum). Return a new list of values greater than or equal to minimum, in their original order. Preserve duplicates and leave the input unchanged.',
    contract:'values is a list of integers and minimum is an integer. Negative values, duplicates, and empty input are allowed.',
    starter:'# Write qualifying_minutes(values, minimum).\n',
    solution:'def qualifying_minutes(values, minimum):\n    result = []\n    for value in values:\n        if value >= minimum:\n            result.append(value)\n    return result\n',
    bug:'def qualifying_minutes(values, minimum):\n    return [value for value in values if value > minimum]\n',
    tests:"values = [9, 10, 10, 12]\nassert qualifying_minutes(values, 10) == [10, 10, 12], \"Expected: qualifying_minutes(values, 10) == [10, 10, 12]\"\nassert qualifying_minutes([], 5) == [], \"Expected: qualifying_minutes([], 5) == []\"\nassert qualifying_minutes([-5, -2, 0], -2) == [-2, 0], \"Expected: qualifying_minutes([-5, -2, 0], -2) == [-2, 0]\"\nassert qualifying_minutes([1, 2], 3) == [], \"Expected: qualifying_minutes([1, 2], 3) == []\"\nassert values == [9, 10, 10, 12], \"Expected: values == [9, 10, 10, 12]\"\nassert qualifying_minutes(values, 10) is not values, \"Expected: qualifying_minutes(values, 10) is not values\"\n",
    explanation:'Translate “at least” into >= before coding. The equality case distinguishes the correct implementation from the deliberate bug. The result list preserves the order and duplicates because each qualifying value is appended once.',
    complexity:'O(n) time for n input values and O(k) extra space for k qualifying values.',
    fixtures:[{label:'Exact boundary',assertion:'A value equal to minimum is included.'},{label:'Duplicates',assertion:'Both occurrences of 10 remain.'},{label:'Empty and negative',assertion:'Empty and negative inputs follow the same rule.'}],
    sources:[pythonIntro,pythonData]
  },
  {
    id:'parse-duration',title:'Handle one expected exception',
    prompt:'Write parse_duration(text). Strip surrounding whitespace and parse a base-10 integer. Return None if parsing fails or the integer is negative; otherwise return the integer, including zero. Avoid catching unrelated programming errors.',
    contract:'text is always a Python string. Use the parsing behavior of int(text.strip(), 10), so a leading sign is permitted. Out-of-contract non-string inputs do not need handling.',
    starter:'# Write parse_duration(text).\n',
    solution:'def parse_duration(text):\n    try:\n        value = int(text.strip(), 10)\n    except ValueError:\n        return None\n    if value < 0:\n        return None\n    return value\n',
    bug:'def parse_duration(text):\n    try:\n        value = int(text.strip(), 10)\n    except ValueError:\n        return None\n    if value <= 0:\n        return None\n    return value\n',
    tests:"assert parse_duration(\" 25 \") == 25, \"Expected: parse_duration(\\\" 25 \\\") == 25\"\nassert parse_duration(\"0\") == 0, \"Expected: parse_duration(\\\"0\\\") == 0\"\nassert parse_duration(\"+7\") == 7, \"Expected: parse_duration(\\\"+7\\\") == 7\"\nassert parse_duration(\"-3\") is None, \"Expected: parse_duration(\\\"-3\\\") is None\"\nassert parse_duration(\"2.5\") is None, \"Expected: parse_duration(\\\"2.5\\\") is None\"\nassert parse_duration(\"abc\") is None, \"Expected: parse_duration(\\\"abc\\\") is None\"\nassert parse_duration(\"\") is None, \"Expected: parse_duration(\\\"\\\") is None\"\n",
    explanation:'The conversion can raise ValueError for invalid text. Catch that expected error close to the operation, then separately validate the business rule for negative values. A bare except would also hide failures unrelated to parsing. Zero is allowed by the contract and catches the deliberate <= bug.',
    complexity:'Parsing cost grows with the length and magnitude of the number; stripping also scans text. For ordinary short duration input this is small, but the algorithm is not constant-time for unbounded strings. Python may reject extremely long integer strings according to its configured limits.',
    fixtures:[{label:'Whitespace and sign',assertion:'" 25 " and "+7" parse successfully.'},{label:'Zero boundary',assertion:'"0" returns 0, not None.'},{label:'Invalid text',assertion:'Empty, decimal, and nonnumeric text return None.'}],
    sources:[pythonErrors]
  },
  ...PYTHON_BACKEND_DRILLS
];

export const TRAINING_LIMITS = {
  status:'Practice evidence and self-assessment; not a certification or hiring prediction.',
  pace:'Eight suggested weeks at two hours per day total 112 scheduled hours, including breaks. Repeat a gate when needed; finishing a date does not establish mastery.',
  environments:'SQL exercises use browser-local SQLite. Database operations use a separate local MySQL instance. Python drills require full Python 3; the original Mini-Python lab does not support functions, classes, or strings. Java/Spring tasks run in your local project.',
  assistance:'Save a first attempt before viewing a hint or answer. Mark assisted work honestly. An independent retry on changed data is separate evidence.'
};
