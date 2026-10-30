import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Worker} from 'node:worker_threads';
import {load} from '../public/vendor/java/runtime.mjs';
import {strictLoad} from '../src/java-program-policy.mjs';
import {JAVA_LABS} from '../src/java-content.mjs';

// These checks use the shipped browser compiler and generated WebAssembly.
// No installed JDK or native Java process participates in this suite.
let environment;
async function compilerEnvironment(){
  environment??=(async()=>{
    const directory=new URL('../public/vendor/java/',import.meta.url);
    const [wasm,sdk,classlib]=await Promise.all(['compiler.wasm','compile-classlib-teavm.bin','runtime-classlib-teavm.bin'].map(async name=>new Int8Array(await readFile(new URL(name,directory)))));
    const library=await load(wasm,{noAutoImports:true});
    const compiler=library.exports.createCompiler();compiler.setSdk(sdk);compiler.setTeaVMClasslib(classlib);
    const value={compiler,diagnostics:[]};
    compiler.onDiagnostic(d=>value.diagnostics.push({line:Number(d.lineNumber),column:Number(d.columnNumber),message:String(d.message)}));
    return value;
  })();
  return environment;
}
async function compile(source){
  const value=await compilerEnvironment(),{compiler}=value;value.diagnostics=[];
  compiler.clearSourceFiles();compiler.clearOutputFiles();compiler.addSourceFile('Main.java',source);
  if(!compiler.compile())return {diagnostics:value.diagnostics};
  if(!compiler.generateWebAssembly({outputName:'app',mainClass:'Main'}))return {diagnostics:value.diagnostics};
  return {wasm:new Uint8Array(compiler.getWebAssemblyOutputFile('app.wasm')).slice(),diagnostics:value.diagnostics};
}
async function execute(wasm,args=[]){
  let stdout='',stderr='';
  const app=await strictLoad(wasm,{stdout:code=>stdout+=String.fromCharCode(code),stderr:code=>stderr+=String.fromCharCode(code)});
  app.exports.main(args);return {stdout,stderr};
}
const main=body=>`public class Main { public static void main(String[] args) { ${body} } }`;

for(const lab of JAVA_LABS){
  test(`browser javac/TeaVM: ${lab.id} passes changed and edge fixtures and rejects its bug`,{timeout:30000},async()=>{
    const correct=await compile(lab.solution);assert.ok(correct.wasm,JSON.stringify(correct.diagnostics));
    for(const fixture of lab.fixtures){
      const result=await execute(correct.wasm,fixture.args);
      assert.equal(result.stdout,fixture.stdout,fixture.name);assert.equal(result.stderr,'',fixture.name);
    }
    const incorrect=await compile(lab.bug);assert.ok(incorrect.wasm,JSON.stringify(incorrect.diagnostics));
    let failures=0;
    for(const fixture of lab.fixtures){
      try{if((await execute(incorrect.wasm,fixture.args)).stdout!==fixture.stdout)failures++;}catch{failures++;}
    }
    assert.ok(failures>0,'The actual browser engine must reject at least one deliberate-bug fixture.');
  });
}

test('browser Java reports the edited source line, then recompiles the corrected program',{timeout:30000},async()=>{
  const broken=await compile('public class Main {\n public static void main(String[] args) {\n  System.out.println("first")\n }\n}');
  assert.equal(broken.wasm,undefined);
  assert.ok(broken.diagnostics.some(item=>item.line===3&&item.message.includes("';' expected")),JSON.stringify(broken.diagnostics));
  const first=await compile(main('System.out.println("first");'));
  const second=await compile(main('System.out.println("changed");'));
  assert.equal((await execute(first.wasm)).stdout,'first\n');
  assert.equal((await execute(second.wasm)).stdout,'changed\n');
});

test('fresh browser Java instances reset static state and preserve exact stdout/stderr',{timeout:30000},async()=>{
  const source='public class Main { static int count=0; public static void main(String[] args) { System.out.print(++count); System.out.println(" café"); System.err.print("details"); } }';
  const {wasm}=await compile(source);
  assert.deepEqual(await execute(wasm),{stdout:'1 café\n',stderr:'details'});
  assert.deepEqual(await execute(wasm),{stdout:'1 café\n',stderr:'details'});
});

test('the actual browser Java engine throws an unhandled program exception',{timeout:30000},async()=>{
  const {wasm}=await compile(main('throw new IllegalArgumentException("quantity must be positive");'));
  await assert.rejects(execute(wasm),/quantity must be positive/);
});

function unsigned(value){const bytes=[];do{let next=value&127;value>>>=7;if(value)next|=128;bytes.push(next);}while(value);return bytes;}
function text(value){const bytes=[...new TextEncoder().encode(value)];return [...unsigned(bytes.length),...bytes];}
function section(id,data){return [id,...unsigned(data.length),...data];}
function bridgeModule(module,name){return new Uint8Array([0,97,115,109,1,0,0,0,
  ...section(1,[1,0x60,2,0x6f,0x6f,1,0x6f]),
  ...section(2,[1,...text(module),...text(name),0,0]),
  ...section(7,[1,...text('test'),0,0])]);}

test('generated-program imports cannot request browser APIs or traverse JavaScript prototypes',async()=>{
  for(const [module,name]of [['teavmJso','global'],['teavmJso','callMethod1'],['window','fetch'],['teavmMemory','unknown']]){
    await assert.rejects(strictLoad(bridgeModule(module,name)),/Unsupported Java runtime import/);
  }
  const property=(await strictLoad(bridgeModule('teavmJso','getProperty'))).instance.exports.test;
  assert.equal(property(['Amina'],'length'),1);assert.equal(property(['Amina'],0),'Amina');
  for(const [target,key]of [[null,'globalThis'],[null,'self'],[null,'fetch'],[{},'constructor'],[[],'constructor'],[[],'__proto__'],[[],'prototype'],[[],'map']])assert.throws(()=>property(target,key));
  const create=(await strictLoad(bridgeModule('teavmJso','createFunction1'))).instance.exports.test;
  assert.equal(create('str','return str;')('text'),'text');
  for(const body of ['return self;','return globalThis;','return fetch;','return str.constructor;'])assert.throws(()=>create('str',body));
  const call=(await strictLoad(bridgeModule('teavmJso','callFunction1'))).instance.exports.test;
  let invoked=false;assert.throws(()=>call(()=>{invoked=true;},null));assert.equal(invoked,false);
});

test('the browser Java linear-memory import has a finite 64 MiB maximum',async()=>{
  const bytes=new Uint8Array([0,97,115,109,1,0,0,0,
    ...section(2,[1,...text('env'),...text('memory'),2,1,1,...unsigned(1024)]),
    ...section(7,[1,...text('memory'),2,0])]);
  const app=await strictLoad(bytes),memory=app.instance.exports.memory;
  assert.equal(memory.buffer.byteLength,65536);
  assert.throws(()=>memory.grow(1024),RangeError);
});

// A small Node host shim exercises the actual browser worker module. Browser CSP
// and rendering remain separate browser observations, not claims of this test.
function programWorker(wasm,args){
  const url=new URL('../src/java-run-worker.mjs',import.meta.url).href;
  const code=`import {parentPort,workerData} from 'node:worker_threads';globalThis.self={postMessage:value=>parentPort.postMessage(value)};await import(workerData.url);parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({ready:true});`;
  const worker=new Worker(new URL('data:text/javascript,'+encodeURIComponent(code)),{workerData:{url}});
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{worker.terminate();reject(new Error('Actual Java program worker did not finish.'));},10000);
    worker.on('error',error=>{clearTimeout(timer);worker.terminate();reject(error);});
    worker.on('message',message=>{if(message.ready){worker.postMessage({id:1,wasm,args});return;}clearTimeout(timer);worker.terminate();resolve(message.result);});
  });
}
test('the actual Java program worker bounds output and reports the limit',{timeout:30000},async()=>{
  const {wasm}=await compile(main('for(int i=0;i<13000;i++){ System.out.print("x"); }'));
  const result=await programWorker(wasm,[]);
  assert.equal(result.stdout.length,12000);assert.equal(result.truncated,true);assert.match(result.error,/12,000-character limit/);
});
