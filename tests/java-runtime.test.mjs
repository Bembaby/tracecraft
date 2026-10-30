import test from 'node:test';
import assert from 'node:assert/strict';
import {JavaRuntime,JAVA_LIMITS} from '../src/java-runtime.mjs';

class FakeWorker {
  constructor(url){this.url=String(url);this.messages=[];this.terminated=false;}
  postMessage(message){this.messages.push(message);}
  terminate(){this.terminated=true;}
  emit(message){this.onmessage?.({data:message});}
  fail(){this.onerror?.({message:'synthetic worker failure'});}
}
function harness(options={}){
  const workers=[];
  const runtime=new JavaRuntime({startupMs:100,compileMs:100,executionMs:30,...options,workerFactory:url=>{const worker=new FakeWorker(url);workers.push(worker);return worker;}});
  return {runtime,workers};
}
const compiled=(worker)=>worker.emit({id:worker.messages.at(-1).id,wasm:new Uint8Array([0])});
const result=(worker,stdout,error=null)=>worker.emit({id:worker.messages.at(-1).id,result:{stdout,stderr:'',truncated:false,error}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('Java is lazy and rejects oversized source or malformed arguments before creating a worker',async()=>{
  const {runtime,workers}=harness();assert.equal(workers.length,0);
  assert.match((await runtime.run('x'.repeat(JAVA_LIMITS.sourceCharacters+1))).error,/20,000/);
  assert.match((await runtime.run('class Main {}',{args:[null]})).error,/Invalid Java input/);
  assert.match((await runtime.run('class Main {}',{fixtures:[{args:[],stdout:3}]})).error,/Invalid Java input/);
  assert.equal(workers.length,0);
});

test('Java rejects malformed fixture entries as a normal validation result',async()=>{
  const {runtime,workers}=harness();
  assert.match((await runtime.run('class Main {}',{fixtures:[null]})).error,/Invalid Java input/);
  assert.equal(workers.length,0);
});

test('Java startup timeout terminates the cold compiler and a retry starts a fresh worker',async()=>{
  const {runtime,workers}=harness({startupMs:20});
  const first=await runtime.run('first');assert.equal(first.timedOut,true);assert.equal(first.phase,'load');assert.match(first.error,/finish loading/);assert.equal(workers[0].terminated,true);
  const pending=runtime.run('retry'),compiler=workers[1];compiled(compiler);result(workers[2],'ready\n');
  assert.equal((await pending).stdout,'ready\n');runtime.dispose();
});

test('the compiling phase switches to the compilation deadline and retains its failure context',async()=>{
  const {runtime,workers}=harness({startupMs:100,compileMs:20});
  const pending=runtime.run('class Main {}'),compiler=workers[0];
  compiler.emit({id:compiler.messages[0].id,phase:'compiling'});
  const value=await pending;assert.equal(value.timedOut,true);assert.equal(value.phase,'compile');assert.match(value.error,/compilation took too long/);assert.equal(compiler.terminated,true);
});

test('Java execution timeout terminates only the runner and the ready compiler can retry',async()=>{
  const {runtime,workers}=harness({executionMs:20});
  const pending=runtime.run('forever'),compiler=workers[0];compiled(compiler);
  const value=await pending;assert.equal(value.timedOut,true);assert.equal(value.phase,'execute');assert.match(value.error,/loop can finish/);assert.equal(workers[1].terminated,true);assert.equal(compiler.terminated,false);
  const retry=runtime.run('fixed');assert.equal(compiler.messages.length,2);compiled(compiler);result(workers[2],'done\n');
  assert.equal((await retry).stdout,'done\n');runtime.dispose();
});

test('each Java check fixture receives a fresh worker and exact changed inputs',async()=>{
  const {runtime,workers}=harness(),fixtures=[{name:'positive',args:['2'],stdout:'4\n'},{name:'zero',args:['0'],stdout:'0\n'},{name:'negative',args:['-2'],stdout:'-4\n'}];
  const pending=runtime.run('program',{fixtures});compiled(workers[0]);
  assert.deepEqual(workers[1].messages[0].args,['2']);result(workers[1],'4\n');await tick();
  assert.deepEqual(workers[2].messages[0].args,['0']);result(workers[2],'0\n');await tick();
  assert.deepEqual(workers[3].messages[0].args,['-2']);result(workers[3],'4\n');
  const value=await pending;assert.equal(value.passed,false);assert.deepEqual(value.checks.map(item=>item.passed),[true,true,false]);assert.equal(value.checks[2].expected,'-4\n');
  assert.ok(workers.slice(1).every(worker=>worker.terminated));runtime.dispose();
});

test('a truncated Java result cannot earn a passing check even when captured text matches',async()=>{
  const {runtime,workers}=harness();const pending=runtime.run('program',{fixtures:[{name:'output',args:[],stdout:'x'}]});compiled(workers[0]);
  workers[1].emit({id:workers[1].messages[0].id,result:{stdout:'x',stderr:'',truncated:true,error:null}});
  const value=await pending;assert.equal(value.passed,false);assert.equal(value.checks[0].passed,false);runtime.dispose();
});

test('cancelling Java compilation settles once and stale messages do not replace a retry',async()=>{
  const {runtime,workers}=harness();const stopped=runtime.run('old'),oldCompiler=workers[0];runtime.dispose();
  assert.equal((await stopped).cancelled,true);assert.equal(oldCompiler.terminated,true);
  const retry=runtime.run('new'),newCompiler=workers[1];
  oldCompiler.emit({id:oldCompiler.messages[0].id,wasm:new Uint8Array([9])});assert.equal(workers.length,2);
  compiled(newCompiler);result(workers[2],'new\n');assert.equal((await retry).stdout,'new\n');runtime.dispose();
});

test('an error arriving from a cancelled Java compiler cannot terminate a newer run',async()=>{
  const {runtime,workers}=harness();const stopped=runtime.run('old'),oldCompiler=workers[0];runtime.dispose();await stopped;
  const retry=runtime.run('new'),newCompiler=workers[1];oldCompiler.fail();
  assert.equal(newCompiler.terminated,false);assert.equal(runtime.compiler,newCompiler);
  compiled(newCompiler);result(workers[2],'new\n');assert.equal((await retry).stdout,'new\n');runtime.dispose();
});

test('cancelling Java execution preserves cancellation when its worker later responds',async()=>{
  const {runtime,workers}=harness();const stopped=runtime.run('old');compiled(workers[0]);const oldRunner=workers[1];runtime.dispose();
  assert.equal((await stopped).cancelled,true);assert.equal(oldRunner.terminated,true);
  const retry=runtime.run('new');result(oldRunner,'stale\n');compiled(workers[2]);result(workers[3],'current\n');
  assert.equal((await retry).stdout,'current\n');runtime.dispose();
});

test('a fatal Java compiler failure recreates its worker and preserves diagnostic details',async()=>{
  const {runtime,workers}=harness();const pending=runtime.run('invalid');
  workers[0].emit({id:workers[0].messages[0].id,fatal:true,error:'Unsupported browser conversion',phase:'compile',diagnostics:[{line:3,message:'Unknown class'}]});
  const failed=await pending;assert.equal(failed.phase,'compile');assert.equal(failed.diagnostics[0].line,3);assert.equal(workers[0].terminated,true);
  const retry=runtime.run('fixed');compiled(workers[1]);result(workers[2],'ok');assert.equal((await retry).stdout,'ok');runtime.dispose();
});
