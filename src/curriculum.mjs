// Original project guidance. Milestones are self-assessment, not automatic grades.
export const CURRICULUM_REVISION='2026-10-28.2';
export const CURRICULUM_MODULES=[
  {week:1,phase:'Foundations',title:'Make the data and state visible',prerequisites:[],environment:'Browser SQL and full Python',
    overview:'Start by naming one row, one object, and one operation. Predict the result, run it, and explain the smallest counterexample. Independent recall develops through changed inputs and later retries.',
    concepts:['Row identity and foreign keys','One-to-many joins','Instance state and list mutation'],
    lessons:[['sql','schema-join'],['python','instance-state'],['python','list-slices']],
    evidence:['Schema and seed SQL written from a blank editor','A Python file proving two instances do not share mutable state','A saved failed attempt and a later correction'],
    checks:[['model','I can explain what one row and each key represent.'],['produce','I can write a join and a small function without the worked answer.'],['transfer','I repeated the task later with changed names and data.']],
    pitfalls:['A matching result does not prove a missing database constraint.','A saved solution is a useful draft, but repeating it is not a fresh recall attempt.'],
    gate:'Write the schema, join, class and slice again with answers hidden. Explain a missing parent, an empty list, and a shared-list bug.'},
  {week:2,phase:'Foundations',title:'Answer the right question with SQL',prerequisites:[1],environment:'Browser SQL, plus a local Python sqlite3 script',
    overview:'Define the result row before choosing a join. Add duplicates, missing children, NULL values and tied dates before trusting a query. Separate value parameters from allowlisted SQL identifiers.',
    concepts:['Cardinality and aggregation','NULL and absence','Deterministic ordering and cursor boundaries'],
    lessons:[['sql','left-join-count'],['sql','not-exists'],['sql','latest-order'],['sql','keyset-page']],
    evidence:['Queries with predicted and actual rows for changed fixtures','A NULL or duplicate counterexample for an incorrect query','A parameterized local query with an apostrophe in the value'],
    checks:[['cardinality','I can predict duplicate and zero-child results.'],['absence','I can distinguish NULL from an absent row.'],['ordering','My latest-row query and pagination use a tie breaker.']],
    pitfalls:['DISTINCT can hide an incorrect join.','A date alone is not a stable cursor when dates tie.'],
    gate:'Solve unfamiliar variations and explain every unexpected row. Keep the original attempt and assistance record.'},
  {week:3,phase:'Data ownership',title:'Operate a relational database',prerequisites:[2],environment:'Separate local MySQL 8.4 instance with synthetic data',
    overview:'A browser query check cannot prove a server backup or concurrent transaction. Reproduce each operation in two real connections where appropriate, and save commands plus observed results.',
    concepts:['Transactions and locks','Migrations and query plans','Backup and restore verification'],
    lessons:[['sql','rollback'],['sql','index-plan']],
    evidence:['Versioned migrations that build an empty practice database','Two-connection commands demonstrating blocking and release','A backup restored into a separate database with matching rows'],
    checks:[['transaction','I can demonstrate commit, rollback and a constraint failure.'],['plan','I inspected a real query plan before and after an index.'],['restore','I restored into a new database and compared the data.']],
    pitfalls:['MySQL DDL can implicitly commit.','A backup command exiting successfully does not establish a successful restore.'],
    gate:'Rebuild from migrations, observe a concurrent failure, and restore a backup. Attach reproducible evidence rather than checking a box by time spent.'},
  {week:4,phase:'Backend feature',title:'Deliver one complete API feature',prerequisites:[3],environment:'Local Java/Spring project and relational database',
    overview:'Keep the workout journal a modular monolith. Follow one request from input validation through authorization, a transaction and a parameterized query, then back to a documented response.',
    concepts:['HTTP contracts and validation','Owner-scoped authorization','Service transactions and integration tests'],
    lessons:[['python','validate-workout-payload'],['python','owner-scoped-read']],
    evidence:['A runnable workout endpoint with a documented request and response','A test that denies another user access to a known resource ID','An integration test that observes committed and rejected database state'],
    checks:[['contract','The request contract includes invalid and boundary inputs.'],['owner','The trusted session determines ownership, not request JSON.'],['end-to-end','A real API test follows the complete persistence path.']],
    pitfalls:['Input validation does not replace authorization.','A list-based Python check teaches a rule; it does not execute the Java API.'],
    gate:'Demonstrate create, read, a rejected invalid request and cross-user denial against the local API.'},
  {week:5,phase:'Backend feature',title:'Debug and verify a change',prerequisites:[4],environment:'Local backend project, test runner and debugger',
    overview:'Begin with a reproducible symptom. Reduce the input, inspect actual state, write a regression test and repair the cause. Keep a record of the failed hypothesis as well as the fix.',
    concepts:['Unit versus integration boundaries','Regression tests and logs','Error contracts and request correlation'],
    lessons:[['python','parse-duration'],['sql','safe-update']],
    evidence:['A minimal reproducer and a failing regression test','A root-cause note connected to observed state','A test run showing the fix and preserved surrounding behavior'],
    checks:[['reproduce','Another person can reproduce the failure from my notes.'],['diagnose','My explanation identifies a cause rather than restating the symptom.'],['regression','The test fails before the fix and passes after it.']],
    pitfalls:['A mock can hide the database or network behavior under investigation.','Logs should not include passwords, sign-in codes or private payloads.'],
    gate:'Investigate an unfamiliar failure and show the regression test, repair and limits of the evidence.'},
  {week:6,phase:'Reliability',title:'Make retries and failures deliberate',prerequisites:[5],environment:'Local backend and browser design model',
    overview:'Retry only when the operation has a safe replay policy. Separate accepted work from finished work. Use the deterministic design lab to test capacity assumptions, then explain what the model does not simulate.',
    concepts:['Idempotency and conflicting retries','Timeout budgets and bounded retries','Queue acceptance versus completion'],
    lessons:[['sql','retry-safe-insert']],
    evidence:['A duplicate-request test with one durable effect','A timeout or dependency failure experiment with bounded retry','A graph and explanation separating completed, rejected, failed and pending work'],
    checks:[['retry','Repeated delivery cannot silently duplicate the business effect.'],['failure','The retry policy has a deadline and a stopping rule.'],['model','I can explain the design simulator\'s assumptions and limits.']],
    pitfalls:['A warm read cache cannot complete writes.','A queue accepting a message does not mean a worker finished it.'],
    gate:'Demonstrate a duplicate, a dependency failure and recovery. Keep simulated estimates distinct from measured API behavior.'},
  {week:7,phase:'Reliability',title:'Own an operational rehearsal',prerequisites:[6],environment:'Local backend with a separate staging configuration',
    overview:'Rehearse deployment with synthetic records. Verify configuration, migrations, startup, authorization, logs and rollback. Operability is the ability to explain and recover the actual system.',
    concepts:['Environment boundaries and secrets','Compatibility and rollback','Restore drills and health checks'],
    lessons:[],
    evidence:['A startup and configuration checklist another developer can follow','A health check and smoke test against the running service','A rollback or restore rehearsal with a verified result'],
    checks:[['configuration','Secrets remain outside source and browser progress.'],['release','The running version and migration are identifiable.'],['recover','I practiced restoring service after a failed change.']],
    pitfalls:['A build success is different from a healthy deployment.','An ephemeral application filesystem is not durable progress storage.'],
    gate:'Release and recover a small change in a non-production environment, with commands and observed outcomes.'},
  {week:8,phase:'Independent delivery',title:'Defend the complete project',prerequisites:[7],environment:'Local project, repository, API tests and explanation',
    overview:'Present the working feature, not a collection of technology names. Trace a request, defend the schema and ownership rules, reproduce a failure, and identify the next limitation to address.',
    concepts:['Changed requirements and transfer','Architecture decisions','Evidence-led technical explanation'],
    lessons:[['sql','keyset-page'],['python','owner-scoped-read']],
    evidence:['A runnable repository with setup instructions and passing tests','A short architecture decision with a rejected alternative','A recorded changed-requirement attempt and an honest assistance log'],
    checks:[['demo','I can demonstrate the complete feature and a rejected request.'],['explain','I can justify the schema, boundary and failure behavior.'],['adapt','I can implement a changed requirement without copying the old answer.']],
    pitfalls:['Completing an eight-week calendar is not a certification.','Model checks and self-assessments do not predict a hiring outcome.'],
    gate:'Give a concise project walkthrough, make a small unfamiliar change, and explain what the tests prove and leave untested.'},
];

export function validateCurriculum(modules,lessonIds) {
  const weeks=new Set(modules.map(m=>m.week));
  if(weeks.size!==modules.length)throw new Error('Curriculum weeks must be unique.');
  for(const module of modules){
    for(const field of ['title','phase','environment','overview','gate'])if(typeof module[field]!=='string'||!module[field].trim())throw new Error(`Week ${module.week}: missing ${field}.`);
    if(module.prerequisites.some(week=>!weeks.has(week)||week>=module.week))throw new Error('Prerequisites must name an earlier existing week.');
    if(module.evidence.length<3||module.checks.length<3||module.pitfalls.length<2)throw new Error('Each milestone needs evidence, checkpoints and counterexamples.');
    if(new Set(module.checks.map(([id])=>id)).size!==module.checks.length)throw new Error('Checkpoint identifiers must be unique within a week.');
    for(const [type,id] of module.lessons)if(!lessonIds.has(`${type}:${id}`))throw new Error(`Unknown curriculum lesson ${type}:${id}.`);
  }
  return true;
}
