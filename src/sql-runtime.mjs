// SQL is parsed and executed by SQLite WASM, never by JavaScript eval/Function.
// The exported engine helpers are shared with Node tests; browser execution
// happens only in sql-worker.js, in a disposable in-memory database.
export const SQL_LIMITS = Object.freeze({source:20000, statements:25, results:20, rows:200, columns:32, cell:2000, outputChars:200000, timeoutMs:5000, heapBytes:33554432});

export function createSqlDatabase(SQL, seedSql='') {
  const db = new SQL.Database();
  try {
    db.run(`PRAGMA foreign_keys = ON; PRAGMA hard_heap_limit = ${SQL_LIMITS.heapBytes}; PRAGMA max_page_count = 8192;`);
    if (seedSql) db.run(seedSql);
    return db;
  } catch (error) { db.close(); throw error; }
}

export function executeSql(db, sql) {
  if (typeof sql !== 'string' || !sql.trim()) throw new Error('Write a SQL statement before running.');
  if (sql.length > SQL_LIMITS.source) throw new Error(`Keep a practice script under ${SQL_LIMITS.source.toLocaleString()} characters.`);
  const before = db.exec('SELECT total_changes();')[0].values[0][0];
  const results = [];
  let statements = 0;
  let outputChars = 0;
  const iterator = db.iterateStatements(sql);
  try {
    for (const statement of iterator) {
      statements++;
      if (statements > SQL_LIMITS.statements) throw new Error(`Run at most ${SQL_LIMITS.statements} statements at a time.`);
      let columns = statement.getColumnNames();
      if (columns.length > SQL_LIMITS.columns) throw new Error(`Select at most ${SQL_LIMITS.columns} columns.`);
      columns = columns.map(name => String(name).slice(0,200));
      outputChars += JSON.stringify(columns).length;
      const values = [];
      let truncated = false;
      while (statement.step()) {
        if (values.length >= SQL_LIMITS.rows) { truncated = true; break; }
        const row = statement.get().map(value => {
          if (value instanceof Uint8Array) { truncated = true; return `[BLOB: ${value.length} bytes]`; }
          if (typeof value === 'string' && value.length > SQL_LIMITS.cell) { truncated = true; return value.slice(0,SQL_LIMITS.cell) + '…'; }
          return value;
        });
        const rowSize=JSON.stringify(row).length;
        if (outputChars+rowSize>SQL_LIMITS.outputChars) {truncated=true;break;}
        outputChars+=rowSize;
        values.push(row);
      }
      if (columns.length) {
        if (results.length >= SQL_LIMITS.results) throw new Error(`Return at most ${SQL_LIMITS.results} result tables.`);
        results.push({columns, values, truncated});
      }
    }
  } finally { iterator.return?.(); }
  if (!statements) throw new Error('Only comments were found. Write a SQL statement to run.');
  const changes = db.exec('SELECT total_changes();')[0].values[0][0] - before;
  return {results,changes,statements};
}

export function sameSqlResults(actual, expected, ordered=true) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return expected.every((table,index) => {
    const candidate = actual[index];
    if (candidate?.truncated || JSON.stringify(candidate?.columns) !== JSON.stringify(table.columns)) return false;
    if (!Array.isArray(candidate.values) || candidate.values.length !== table.values.length) return false;
    const a = candidate.values.map(row => JSON.stringify(row));
    const b = table.values.map(row => JSON.stringify(row));
    if (!ordered) { a.sort(); b.sort(); }
    return a.every((row,i) => row === b[i]);
  });
}

export function checkSqlSolution(SQL, lab, sql) {
  const checks = lab.fixtures.map(fixture => {
    let db;
    let actual = [];
    try {
      db = createSqlDatabase(SQL,fixture.seedSql ?? lab.seedSql);
      const run = executeSql(db,sql);
      if (fixture.postSql) executeSql(db,fixture.postSql);
      const output = fixture.inspectSql ? executeSql(db,fixture.inspectSql).results : run.results;
      actual = lab.allResults ? output : output.slice(-1);
      let passed = sameSqlResults(actual,fixture.expected,lab.ordered);
      const reasons = [];
      if (!passed) reasons.push('Returned columns or rows differ from the contract.');
      if (fixture.stateSql) {
        const state = executeSql(db,fixture.stateSql).results;
        if (!sameSqlResults(state,fixture.stateExpected,true)) {passed = false; reasons.push(lab.level==='beginner'?'The returned result alone is not enough: stored rows or the table structure changed. Use SELECT to read data. Reset restores the starting table and keeps your code draft.':'The database state after the script is incorrect.');}
      }
      // A savepoint isolates each intentionally invalid write. Rejection alone
      // is pedagogical evidence; the learner still explains the constraint.
      for (const rejection of fixture.rejects ?? []) {
        db.run('SAVEPOINT constraint_probe;');
        let rejected = false;
        try {db.run(rejection.sql);} catch {rejected = true;}
        finally {db.run('ROLLBACK TO constraint_probe; RELEASE constraint_probe;');}
        if (!rejected) {passed = false; reasons.push(rejection.message);}
      }
      return {label:fixture.label,passed,expected:fixture.expected,actual,...(reasons.length ? {error:reasons.join(' ')} : {})};
    } catch (error) {
      return {label:fixture.label,passed:false,expected:fixture.expected,actual,error:String(error.message ?? error).slice(0,1000)};
    } finally {db?.close();}
  });
  return {passed:checks.every(check => check.passed),checks};
}

export function describeSqlSchema(db) {
  const statement = db.prepare("SELECT name, sql FROM sqlite_schema WHERE type IN ('table','index') AND name NOT LIKE 'sqlite_%' ORDER BY type DESC, name;");
  const schema = [];
  try {
    while (statement.step() && schema.length < 30) {
      const [name,sql] = statement.get();
      schema.push({name:String(name).slice(0,200),sql:String(sql ?? '').slice(0,4000)});
    }
  } finally {statement.free();}
  return schema;
}

export class SqlRuntime {
  constructor({timeoutMs=SQL_LIMITS.timeoutMs,workerFactory}={}) {
    this.timeoutMs=timeoutMs;
    this.workerFactory=workerFactory ?? (() => {
      if (typeof Worker === 'undefined') throw new Error('This browser does not support the SQL worker. Try a current desktop browser.');
      if (globalThis.location?.protocol === 'file:') throw new Error('Open TraceCraft through npm start or its hosted address to load SQLite. A file preview cannot load the SQL worker.');
      return new Worker(new URL('src/sql-worker.js',document.baseURI),{name:'tracecraft-sql'});
    });
    this.worker=null; this.pending=null; this.nextId=1; this.labId=null; this.initialized=false;
  }
  async initialize(labId) {
    this.dispose();
    this.worker=this.workerFactory();
    const initializingWorker=this.worker;
    this.labId=labId;
    this.worker.onmessage=event => {
      const response=event.data;
      if (!this.pending || response.id !== this.pending.id) return;
      const request=this.pending; this.pending=null; clearTimeout(request.timer);
      if (response.ok) request.resolve(response.data);
      else request.reject(new Error(response.error || 'SQLite could not complete the request.'));
    };
    this.worker.onerror=event => {
      event.preventDefault?.();
      this._abort('SQLite could not load or stopped unexpectedly. Reset the workspace and try again.');
    };
    // Initial module/WASM loading has a separate network allowance. Execution
    // requests below retain the five-second limit.
    try {
      const response=await this._request('initialize',{labId},20000);
      this.initialized=true;
      return response;
    } catch(error) {if(this.worker===initializingWorker)this.dispose(); throw error;}
  }
  reset(labId=this.labId) {return this.initialize(labId);}
  run(sql) {
    if (!this.initialized) return Promise.reject(new Error('Reset the SQL workspace before running.'));
    return this._request('run',{sql});
  }
  check(sql,labId=this.labId) {
    if (!this.initialized) return Promise.reject(new Error('Reset the SQL workspace before checking.'));
    return this._request('check',{sql,labId});
  }
  _request(type,payload,timeoutMs=this.timeoutMs) {
    if (this.pending) return Promise.reject(new Error('A SQL request is already running. Wait for it or reset the workspace.'));
    if (!this.worker) return Promise.reject(new Error('Reset the SQL workspace first.'));
    return new Promise((resolve,reject) => {
      const id=this.nextId++;
      const timer=setTimeout(() => this._abort(type==='initialize'
        ? 'SQLite did not load within 20 seconds. Reset to retry.'
        : 'SQL exceeded the five-second limit. The worker was stopped and its database discarded. Reset the workspace to continue.'),timeoutMs);
      this.pending={id,resolve,reject,timer};
      this.worker.postMessage({id,type,...payload});
    });
  }
  _abort(message) {
    const request=this.pending;
    this.pending=null; this.initialized=false;
    this.worker?.terminate(); this.worker=null;
    if (request) {clearTimeout(request.timer);request.reject(new Error(message));}
  }
  dispose() {this._abort('SQL request cancelled. Reset the workspace to start again.');}
}
