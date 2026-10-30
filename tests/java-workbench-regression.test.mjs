import test from 'node:test';
import assert from 'node:assert/strict';
import {mountJava,unmountJava,hideJavaHelp} from '../src/java-workbench.mjs';
import {freshTraining} from '../src/training-state.mjs';
import {JAVA_LABS} from '../src/java-content.mjs';

// Exercise the mounted UI handlers and controller boundary. The fake workers
// isolate assistance and input routing; actual javac/WASM has its own suite.
async function withWorkbench(run){
  const previous={Date:globalThis.Date,location:globalThis.location,Worker:globalThis.Worker};
  const RealDate=previous.Date;let current='2026-10-29T12:00:00';const calls=[];
  globalThis.Date=class extends RealDate{
    constructor(...args){super(...(args.length?args:[current]));}
    static now(){return new RealDate(current).getTime();}
  };
  globalThis.location={hash:'#java/java-start'};
  globalThis.Worker=class {
    constructor(url){this.compiler=String(url).includes('compile');this.stopped=false;}
    terminate(){this.stopped=true;}
    postMessage(data){
      calls.push({compiler:this.compiler,args:data.args});
      queueMicrotask(()=>{
        if(this.stopped)return;
        const response=this.compiler?{id:data.id,wasm:new Uint8Array([1])}:{id:data.id,result:{stdout:String((data.args.length?Number(data.args[0]):3)+2)+'\n',stderr:'',error:null}};
        this.onmessage?.({data:response});
      });
    }
  };
  const handlers={},field={outerHTML:'',textContent:'',focus(){}};
  const root={addEventListener(type,handler){handlers[type]=handler;},removeEventListener(){},querySelector(){return field;}};
  const state=freshTraining();state.drafts['java:java-start']=JAVA_LABS[0].solution;
  hideJavaHelp('java-start');mountJava(root,state,()=>true,()=>{});
  const click=action=>handlers.click({target:{closest:selector=>selector==='[data-java]'?{dataset:{java:action}}:null}});
  const checked=async()=>{click('check');for(let i=0;i<20&&!state.attempts.length;i++)await new Promise(resolve=>setImmediate(resolve));assert.equal(state.attempts.length,1);return state.attempts[0];};
  try{click('enable');await run({state,calls,click,checked,setDate:value=>{current=value;}});}
  finally{unmountJava();hideJavaHelp('java-start');globalThis.Date=previous.Date;globalThis.location=previous.location;globalThis.Worker=previous.Worker;}
}

test('a visible Java worked solution stays assisted when a checked attempt crosses midnight',async()=>{
  await withWorkbench(async({state,click,checked,setDate})=>{
    click('solution');assert.equal(state.help['2026-10-29:java:java-start'],'solution');
    setDate('2026-10-30T12:00:00');const attempt=await checked();
    assert.equal(attempt.passed,true);assert.equal(attempt.help,'solution');
    assert.equal(state.help['2026-10-30:java:java-start'],'solution');
  });
});

test('Java Check uses fixed fixtures even when the custom Run input exceeds its per-value limit',async()=>{
  await withWorkbench(async({state,calls,checked})=>{
    state.javaInputs['java-start']={text:'x'.repeat(1001),emptyArgument:false};
    const attempt=await checked();assert.equal(attempt.passed,true);
    assert.deepEqual(calls.filter(call=>!call.compiler).map(call=>call.args),JAVA_LABS[0].fixtures.map(fixture=>fixture.args));
    assert.equal(state.javaInputs['java-start'].text.length,1001,'checking must not replace the custom input');
  });
});
