import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import initSqlJs from '../public/vendor/sqljs/sql-wasm.js';
import {FITNESS_SQL_LABS,FITNESS_SCHEMA_SQL,FITNESS_SEED_SQL,FITNESS_SQL_BY_ID} from '../src/fitness-sql-content.mjs';
import {createSqlDatabase,executeSql,checkSqlSolution} from '../src/sql-runtime.mjs';

let SQL;
before(async()=>{SQL=await initSqlJs({locateFile:name=>fileURLToPath(new URL('../public/vendor/sqljs/'+name,import.meta.url))});});

test('fitness SQL authoring covers a consistent five-table schema and complete contracts',()=>{
  assert.equal(FITNESS_SQL_LABS.length,15);assert.equal(FITNESS_SQL_BY_ID.size,15);
  for(const lab of FITNESS_SQL_LABS){
    assert.match(lab.id,/^fitness-/);assert.equal(lab.track,'sql');assert.equal(lab.version,'2026-10-29.2');
    for(const field of ['title','topic','prompt','contract','starter','solution','bug','explanation','complexity','prediction','gradingMethod'])assert.ok(typeof lab[field]==='string'&&lab[field].trim(),lab.id+' '+field);
    assert.notEqual(lab.solution,lab.bug);assert.ok(lab.fixtures.length>=2);assert.ok(lab.hints.length>=2);assert.ok(lab.skills.length>0);
    for(const level of ['nudge','question','example','scaffold','solution'])assert.ok(lab.assistance[level].trim(),lab.id+' '+level);
    assert.equal(lab.assistance.solution,lab.solution);assert.ok(lab.sources.every(s=>s.url.startsWith('https://sqlite.org/')));
    assert.doesNotMatch(JSON.stringify(lab),/[\u2013\u2014]/);
    for(const id of lab.prerequisites)assert.ok(FITNESS_SQL_BY_ID.has(id),lab.id+' prerequisite '+id);
  }
  assert.match(FITNESS_SCHEMA_SQL,/workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises\(id\)/);
});

for(const lab of FITNESS_SQL_LABS){
  test(`${lab.id}: actual SQLite accepts every reference fixture and rejects its deliberate bug`,()=>{
    const result=checkSqlSolution(SQL,lab,lab.solution);assert.equal(result.passed,true,JSON.stringify(result));
    assert.equal(result.checks.length,lab.fixtures.length);
    const incorrect=checkSqlSolution(SQL,lab,lab.bug);assert.equal(incorrect.passed,false,'Bug was not exposed: '+lab.id);
  });
}

test('equivalent correct SQL is accepted across normal, changed, empty and zero-child fixtures',()=>{
  const equivalent={
    'fitness-user-counts':'SELECT u.id AS user_id,u.name,(SELECT COUNT(*) FROM workouts w WHERE w.user_id=u.id) AS workout_count FROM users u ORDER BY u.id;',
    'fitness-left-filter':"WITH selected AS (SELECT * FROM workouts WHERE started_at >= '2026-03-02T00:00:00Z' AND started_at < '2026-03-09T00:00:00Z') SELECT u.id AS user_id,COUNT(s.id) AS week_count FROM users u LEFT JOIN selected s ON s.user_id=u.id GROUP BY u.id ORDER BY u.id;",
    'fitness-weekly-totals':"WITH weekly AS (SELECT user_id,SUM(duration_minutes) AS total_minutes FROM workouts WHERE started_at >= '2026-03-02T00:00:00Z' AND started_at < '2026-03-09T00:00:00Z' GROUP BY user_id) SELECT user_id,total_minutes FROM weekly WHERE total_minutes>30 ORDER BY user_id;",
    'fitness-no-workouts':"SELECT u.id AS user_id,u.name FROM users u LEFT JOIN workouts w ON w.user_id=u.id AND w.started_at >= '2026-03-02T00:00:00Z' AND w.started_at < '2026-03-09T00:00:00Z' WHERE w.id IS NULL ORDER BY u.id;"
  };
  for(const [id,query] of Object.entries(equivalent)){const assessed=checkSqlSolution(SQL,FITNESS_SQL_BY_ID.get(id),query);assert.equal(assessed.passed,true,id+' '+JSON.stringify(assessed));}
});

test('a sample-only latest result fails changed rows and read tasks reject mutations',()=>{
  const latest=FITNESS_SQL_BY_ID.get('fitness-latest-seven');
  const hardcoded="SELECT 104 AS workout_id,'2026-03-03T12:00:00Z' AS started_at,10 AS duration_minutes UNION ALL SELECT 102,'2026-03-03T12:00:00Z',30 UNION ALL SELECT 101,'2026-03-02T07:00:00Z',20;";
  const assessment=checkSqlSolution(SQL,latest,hardcoded);assert.equal(assessment.checks[0].passed,true);assert.equal(assessment.passed,false);
  const filter=FITNESS_SQL_BY_ID.get('fitness-filter-workouts');
  assert.equal(checkSqlSolution(SQL,filter,'UPDATE users SET name=\'Changed\' WHERE id=1;'+filter.solution).passed,false);
});

test('every read task rejects new schema objects and legacy schema or record changes',()=>{
  const readIds=['fitness-filter-workouts','fitness-latest-seven','fitness-user-counts','fitness-no-workouts','fitness-weekly-totals','fitness-set-volume','fitness-legacy-emails','fitness-left-filter'];
  const mutations=[
    'CREATE TABLE scratch (id INTEGER);',
    'CREATE TABLE sqlitehelper (id INTEGER);',
    'CREATE TEMP TABLE scratch (id INTEGER);',
    'CREATE VIEW scratch AS SELECT 1 AS id;',
    'CREATE INDEX scratch ON workouts(user_id);',
    'CREATE TRIGGER scratch AFTER INSERT ON users BEGIN SELECT 1; END;',
    'ALTER TABLE users ADD COLUMN scratch INTEGER;'
  ];
  for(const id of readIds){
    const lab=FITNESS_SQL_BY_ID.get(id);
    for(const mutation of mutations){
      const assessed=checkSqlSolution(SQL,lab,mutation+lab.solution);
      assert.equal(assessed.passed,false,id+' accepted '+mutation);
      assert.ok(assessed.checks.every(check=>!check.passed),id+' did not reject the mutation in every fixture: '+mutation);
    }
  }
  const legacy=FITNESS_SQL_BY_ID.get('fitness-legacy-emails');
  for(const mutation of ['ALTER TABLE legacy_users ADD COLUMN leaked TEXT;',"INSERT INTO legacy_users VALUES(900,'single-new-address@example.test');"]){
    const assessed=checkSqlSolution(SQL,legacy,mutation+legacy.solution);
    assert.equal(assessed.passed,false,'The import audit accepted '+mutation);
    assert.ok(assessed.checks.every(check=>!check.passed));
  }
});

test('schema-note requires primary-key metadata while accepting equivalent table-level constraints',()=>{
  const lab=FITNESS_SQL_BY_ID.get('fitness-schema-note');
  const uniqueOnly='CREATE TABLE workout_exercise_notes (workout_exercise_id INTEGER NOT NULL UNIQUE REFERENCES workout_exercises(id) ON DELETE CASCADE, note TEXT NOT NULL CHECK(length(trim(note)) > 0));';
  const rejected=checkSqlSolution(SQL,lab,uniqueOnly);
  assert.equal(rejected.passed,false,'A UNIQUE reference does not satisfy the required primary key.');
  assert.ok(rejected.checks.every(check=>!check.passed));
  const equivalent='CREATE TABLE workout_exercise_notes (workout_exercise_id INTEGER NOT NULL, note TEXT NOT NULL, PRIMARY KEY(workout_exercise_id), FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE, CHECK(length(trim(note)) > 0));';
  const accepted=checkSqlSolution(SQL,lab,equivalent);
  assert.equal(accepted.passed,true,JSON.stringify(accepted));
});

test('weekly totals count repeated durations in both output and threshold selection',()=>{
  const lab=FITNESS_SQL_BY_ID.get('fitness-weekly-totals');
  const reference=checkSqlSolution(SQL,lab,lab.solution);
  assert.equal(reference.passed,true,JSON.stringify(reference));
  assert.ok(reference.checks[1].actual[0].values.some(row=>row[0]===4&&row[1]===40),'Two separate 20-minute workouts must total 40 and qualify.');
  const variants=[
    lab.solution.replaceAll('SUM(duration_minutes)','SUM(DISTINCT duration_minutes)'),
    lab.solution.replace('SUM(duration_minutes) AS','SUM(DISTINCT duration_minutes) AS'),
    lab.solution.replace('HAVING SUM(duration_minutes)','HAVING SUM(DISTINCT duration_minutes)')
  ];
  for(const query of variants){
    const assessed=checkSqlSolution(SQL,lab,query);
    assert.equal(assessed.checks[0].passed,true,'The baseline has no repeated duration within a user group.');
    assert.equal(assessed.checks[1].passed,false,'Changed records must expose duration deduplication.');
    assert.equal(assessed.passed,false);
  }
});

test('the fixture graph connects a set to an occurrence and enforces relationship constraints',()=>{
  const db=createSqlDatabase(SQL,FITNESS_SEED_SQL);
  try{
    assert.deepEqual(db.exec('PRAGMA foreign_keys;')[0].values,[[1]]);
    assert.throws(()=>db.run('INSERT INTO workout_sets VALUES(9999,101,1,1,1);'),/FOREIGN KEY/);
    assert.throws(()=>db.run('INSERT INTO workout_sets VALUES(9999,1001,1,1,1);'),/UNIQUE/);
    assert.throws(()=>db.run('INSERT INTO workout_sets VALUES(9999,1001,3,-1,1);'),/CHECK/);
    const actual=executeSql(db,FITNESS_SQL_BY_ID.get('fitness-set-volume').solution).results[0].values;
    assert.deepEqual(actual.find(row=>row[0]===101),[101,3,176]);
    assert.deepEqual(actual.find(row=>row[0]===104),[104,0,0]);
    assert.deepEqual(actual.find(row=>row[0]===105),[105,0,0]);
  }finally{db.close();}
});

test('an intentional integrity failure leaves earlier writes pending until real rollback',()=>{
  const db=createSqlDatabase(SQL,FITNESS_SEED_SQL);
  try{
    const before=JSON.stringify(db.exec('SELECT * FROM workouts ORDER BY id; SELECT * FROM workout_exercises ORDER BY id; SELECT * FROM workout_sets ORDER BY id;'));
    db.run("BEGIN;INSERT INTO workouts VALUES(900,1,'Pending','2026-03-05T08:00:00Z',15);INSERT INTO workout_exercises VALUES(9001,900,1,1);");
    assert.throws(()=>db.run('INSERT INTO workout_sets VALUES(9901,99999,1,5,10);'),/FOREIGN KEY/);
    assert.deepEqual(db.exec('SELECT id FROM workouts WHERE id=900;')[0].values,[[900]],'A failed statement did not automatically erase the earlier parent insert.');
    db.run('ROLLBACK;');
    assert.equal(JSON.stringify(db.exec('SELECT * FROM workouts ORDER BY id; SELECT * FROM workout_exercises ORDER BY id; SELECT * FROM workout_sets ORDER BY id;')),before);
  }finally{db.close();}
});

test('the index task inspects real SQLite access paths without inventing timings',()=>{
  const db=createSqlDatabase(SQL,FITNESS_SEED_SQL);
  try{
    const query='EXPLAIN QUERY PLAN SELECT id,started_at FROM workouts WHERE user_id=1 ORDER BY started_at DESC,id DESC LIMIT 7;';
    const before=db.exec(query)[0].values.map(row=>row[3]).join('\n');assert.match(before,/SCAN workouts/);
    db.run('CREATE INDEX fitness_workout_time ON workouts(user_id,started_at DESC,id DESC);');
    const after=db.exec(query)[0].values.map(row=>row[3]).join('\n');assert.match(after,/SEARCH workouts USING COVERING INDEX fitness_workout_time/);assert.doesNotMatch(after,/TEMP B-TREE FOR ORDER BY/);
    assert.deepEqual(db.exec("SELECT name,desc FROM pragma_index_xinfo('fitness_workout_time') WHERE key=1 ORDER BY seqno;")[0].values,[['user_id',0],['started_at',1],['id',1]]);
  }finally{db.close();}
});
