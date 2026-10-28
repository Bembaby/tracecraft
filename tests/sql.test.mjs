import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from '../public/vendor/sqljs/sql-wasm.js';
import {SQL_LABS, SQL_SEED, sqlLab} from '../src/sql-content.mjs';
import {SQL_LIMITS, createSqlDatabase, executeSql, checkSqlSolution, sameSqlResults, SqlRuntime} from '../src/sql-runtime.mjs';

let SQL;
before(async () => { SQL = await initSqlJs({locateFile:filename => new URL('../public/vendor/sqljs/'+filename,import.meta.url).pathname}); });

test('SQL curriculum has complete original lesson contracts and variant fixtures', () => {
  assert.equal(new Set(SQL_LABS.map(lab=>lab.id)).size,SQL_LABS.length);
  for (const lab of SQL_LABS) {
    for (const key of ['id','title','topic','prompt','contract','starter','solution','bug','explanation','complexity']) assert.equal(typeof lab[key],'string',lab.id+' '+key);
    assert.ok(lab.hints.length>=2);
    assert.ok(lab.sources.every(source=>/^https:\/\/(sqlite\.org|sql\.js\.org)\//.test(source.url)));
    assert.ok(lab.fixtures.length>=2);
  }
  assert.throws(()=>sqlLab('missing'),/Unknown SQL/);
});

for (const lab of SQL_LABS) {
  test(`${lab.title}: the reference solution meets every fixture`, () => {
    const assessed=checkSqlSolution(SQL,lab,lab.solution);
    assert.equal(assessed.passed,true,JSON.stringify(assessed));
    assert.equal(assessed.checks.length,lab.fixtures.length);
  });
  test(`${lab.title}: the deliberate misconception is caught`, () => {
    const assessed=checkSqlSolution(SQL,lab,lab.bug);
    assert.equal(assessed.passed,false);
    assert.ok(assessed.checks.some(check=>!check.passed));
  });
}

test('foreign keys are active before the first seed or learner statement', () => {
  const db=createSqlDatabase(SQL,SQL_SEED);
  try {
    assert.deepEqual(db.exec('PRAGMA foreign_keys;')[0].values,[[1]]);
    assert.throws(()=>executeSql(db,"INSERT INTO orders VALUES (999, 999, 10, 'paid', '2026-01-01');"),/FOREIGN KEY/);
    assert.equal(executeSql(db,"INSERT INTO orders VALUES (999, NULL, 10, 'paid', '2026-01-01');").changes,1);
  } finally {db.close();}
});

test('SQL syntax with a semicolon inside a string is parsed by SQLite', () => {
  const db=createSqlDatabase(SQL);
  try {
    const run=executeSql(db,"CREATE TABLE notes (message TEXT); INSERT INTO notes VALUES ('one; two'); SELECT message FROM notes;");
    assert.equal(run.statements,3);
    assert.equal(run.changes,1);
    assert.deepEqual(run.results,[{columns:['message'],values:[['one; two']],truncated:false}]);
  } finally {db.close();}
});

test('an empty SELECT retains column names and SQL NULL stays null', () => {
  const db=createSqlDatabase(SQL,SQL_SEED);
  try {
    const outputs=executeSql(db,'SELECT customer_id FROM customers WHERE 0; SELECT NULL AS value;').results;
    assert.deepEqual(outputs,[{columns:['customer_id'],values:[],truncated:false},{columns:['value'],values:[[null]],truncated:false}]);
  } finally {db.close();}
});

test('comparison ignores order only when allowed and preserves duplicate counts', () => {
  const expected=[{columns:['n'],values:[[1],[1],[2]]}];
  assert.equal(sameSqlResults([{columns:['n'],values:[[2],[1],[1]]}],expected,false),true);
  assert.equal(sameSqlResults([{columns:['n'],values:[[2],[1],[1]]}],expected,true),false);
  assert.equal(sameSqlResults([{columns:['n'],values:[[2],[1]]}],expected,false),false);
  assert.equal(sameSqlResults([{columns:['wrong_alias'],values:[[1],[1],[2]]}],expected,false),false);
});

test('hardcoding the displayed example fails changed-data fixtures', () => {
  const sql='SELECT 103 AS order_id, 2 AS customer_id, 5000 AS amount_cents UNION ALL SELECT 105, 4, 5000;';
  const assessment=checkSqlSolution(SQL,sqlLab('paid-orders'),sql);
  assert.equal(assessment.checks[0].passed,true);
  assert.equal(assessment.passed,false);
  assert.equal(assessment.checks[1].passed,false);
  assert.equal(assessment.checks[2].passed,false);
});

test('mutation checks inspect database state rather than trusting a claimed SELECT', () => {
  const sql="SELECT 101 AS order_id, 'paid' AS status UNION ALL SELECT 102, 'cancelled' UNION ALL SELECT 103, 'paid' UNION ALL SELECT 104, 'cancelled' UNION ALL SELECT 105, 'paid' UNION ALL SELECT 106, 'paid';";
  assert.equal(checkSqlSolution(SQL,sqlLab('safe-update'),sql).passed,false);
});

test('checking a submission never mutates an already-open practice database', () => {
  const db=createSqlDatabase(SQL,SQL_SEED);
  try {
    const lab=sqlLab('safe-update');
    assert.equal(checkSqlSolution(SQL,lab,lab.solution).passed,true);
    assert.deepEqual(db.exec('SELECT status FROM orders WHERE order_id=102;')[0].values,[['pending']]);
  } finally {db.close();}
});

test('large results are visibly truncated and cannot earn a passing comparison', () => {
  const db=createSqlDatabase(SQL);
  try {
    const out=executeSql(db,'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<500) SELECT x FROM n;').results;
    assert.equal(out[0].values.length,SQL_LIMITS.rows);
    assert.equal(out[0].truncated,true);
    assert.equal(sameSqlResults(out,[{columns:['x'],values:out[0].values}],true),false);
    const long=executeSql(db,"SELECT printf('%3000s', 'x') AS text;").results[0];
    assert.equal(long.truncated,true);
    assert.equal(long.values[0][0].length,SQL_LIMITS.cell+1);
  } finally {db.close();}
});

test('source, statement, result-table, and column limits are enforced', () => {
  const db=createSqlDatabase(SQL);
  try {
    assert.throws(()=>executeSql(db,' '.repeat(SQL_LIMITS.source)+'SELECT 1;'),/characters/);
    assert.throws(()=>executeSql(db,'CREATE TABLE IF NOT EXISTS t(n);'.repeat(SQL_LIMITS.statements+1)),/statements/);
    assert.throws(()=>executeSql(db,'SELECT 1;'.repeat(SQL_LIMITS.results+1)),/result tables/);
    assert.throws(()=>executeSql(db,'SELECT '+Array.from({length:SQL_LIMITS.columns+1},(_,i)=>`${i} AS c${i}`).join(',')+';'),/columns/);
    assert.throws(()=>executeSql(db,'-- only a comment'),/Only comments/);
  } finally {db.close();}
});

test('one shared output budget bounds wide result tables across statements', () => {
  const db=createSqlDatabase(SQL);
  try {
    const query="WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<200) SELECT printf('%1900s','x') AS a, printf('%1900s','y') AS b FROM n;";
    const output=executeSql(db,query+query).results;
    assert.equal(output.length,2);
    assert.ok(output.every(table=>table.truncated));
    assert.ok(JSON.stringify(output).length<SQL_LIMITS.outputChars+1000);
  } finally {db.close();}
});

class FakeWorker {
  constructor() {this.terminated=false;this.messages=[];}
  postMessage(message) {this.messages.push(message);}
  reply(data={}) {const message=this.messages.at(-1);this.onmessage({data:{id:message.id,ok:true,data}});}
  terminate() {this.terminated=true;}
}

test('a timed-out SQL worker is terminated and must be reset', async () => {
  const worker=new FakeWorker();
  const runtime=new SqlRuntime({timeoutMs:15,workerFactory:()=>worker});
  const ready=runtime.initialize('inner-join');worker.reply({labId:'inner-join'});await ready;
  await assert.rejects(runtime.run('runaway SQL'),/exceeded.*limit/);
  assert.equal(worker.terminated,true);
  assert.equal(runtime.initialized,false);
  await assert.rejects(runtime.run('SELECT 1;'),/Reset/);
});

test('reset cancels the pending request and starts a fresh worker', async () => {
  const workers=[];
  const runtime=new SqlRuntime({workerFactory:()=>{const w=new FakeWorker();workers.push(w);return w;}});
  const initial=runtime.initialize('inner-join');workers[0].reply();await initial;
  const running=runtime.run('SELECT 1;');
  const rejected=assert.rejects(running,/cancelled/);
  const reset=runtime.reset();workers[1].reply();await reset;await rejected;
  assert.equal(workers[0].terminated,true);
  assert.equal(runtime.initialized,true);
  runtime.dispose();
});

test('overlapping initialization does not dispose the newer worker', async () => {
  const workers=[];
  const runtime=new SqlRuntime({workerFactory:()=>{const w=new FakeWorker();workers.push(w);return w;}});
  const first=runtime.initialize('inner-join');const rejection=assert.rejects(first,/cancelled/);
  const second=runtime.initialize('left-join-count');workers[1].reply();await second;await rejection;
  assert.equal(workers[1].terminated,false);
  assert.equal(runtime.initialized,true);
  runtime.dispose();
});

test('the SQL index lesson returns a real explain plan, not a canned animation', () => {
  const db=createSqlDatabase(SQL,SQL_SEED);
  try {
    const result=executeSql(db,sqlLab('index-plan').solution).results.at(-1);
    assert.ok(result.columns.includes('detail'));
    assert.ok(result.values.some(row=>row.some(value=>typeof value==='string' && value.includes('idx_orders_customer_date'))));
  } finally {db.close();}
});
