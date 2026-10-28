/* This is a classic Web Worker so the vendored UMD runtime can use importScripts.
   Only local files are loaded; user SQL never becomes JavaScript source. */
importScripts('../public/vendor/sqljs/sql-wasm.js');

let database = null;
let currentLabId = null;
let dependencies = null;
async function loadDependencies() {
  if (!dependencies) dependencies = Promise.all([
    initSqlJs({locateFile:filename => new URL('../public/vendor/sqljs/' + filename,self.location.href).href}),
    import('./sql-runtime.mjs'),
    import('./sql-content.mjs')
  ]);
  return dependencies;
}

self.onmessage = async event => {
  const {id,type,labId,sql} = event.data ?? {};
  try {
    const [SQL,engine,content] = await loadDependencies();
    let data;
    if (type === 'initialize') {
      const lab = content.sqlLab(labId);
      database?.close();
      database = engine.createSqlDatabase(SQL,lab.seedSql);
      currentLabId=lab.id;
      data={labId:lab.id,schema:engine.describeSqlSchema(database),results:[],sqliteVersion:database.exec('SELECT sqlite_version();')[0].values[0][0]};
    } else if (type === 'run') {
      if (!database) throw new Error('Initialize a SQL workspace first.');
      data={...engine.executeSql(database,sql),schema:engine.describeSqlSchema(database),labId:currentLabId,sqliteVersion:database.exec('SELECT sqlite_version();')[0].values[0][0]};
    } else if (type === 'check') {
      data=engine.checkSqlSolution(SQL,content.sqlLab(labId),sql);
    } else throw new Error('Unknown SQL operation.');
    self.postMessage({id,ok:true,data});
  } catch (error) {
    self.postMessage({id,ok:false,error:String(error.message ?? error).slice(0,1500)});
  }
};
