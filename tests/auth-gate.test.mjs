import test from 'node:test';
import assert from 'node:assert/strict';
import { authGateView, canEnterWorkspace, OTP_LIFETIME_MS } from '../src/auth-gate.mjs';
import { emailSigninView } from '../src/email-signin.mjs';
import { spawnSync } from 'node:child_process';

test('the workspace requires a server-confirmed verified email-code session',()=>{
  const session={configured:true,authMethod:'email-code',user:{id:'owner',emailVerified:true}};
  assert.equal(canEnterWorkspace(session),true);
  for(const value of [null,{}, {...session,configured:false}, {...session,authMethod:'github'}, {...session,user:null}, {...session,user:{id:'owner',emailVerified:false}}])assert.equal(canEnterWorkspace(value),false);
});
test('unconfigured and checking hosts cannot expose a guest workspace or local progress',()=>{
  for(const status of ['checking','local','offline']){
    const view=authGateView({status,configured:false});assert.doesNotMatch(view,/arcade-path|workbench-code|Continue as guest|data-progress-form/);assert.match(view,/Sign-in is required/);
  }
  assert.match(authGateView({configured:true,authMethod:'email-code',status:'signed-out'}),/data-progress-form="send-code"/);
});
test('OTP entry supports mobile autofill, and expired codes cannot be submitted',()=>{
  assert.equal(OTP_LIFETIME_MS,300000);
  const view=emailSigninView({sent:true,expired:true,email:'<unsafe>@example.test'});
  assert.match(view,/autocomplete="one-time-code"/);assert.match(view,/inputmode="numeric"/);assert.match(view,/pattern="\[0-9\]\{6\}"/);assert.match(view,/type="submit" disabled>Code expired/);assert.match(view,/&lt;unsafe&gt;/);assert.doesNotMatch(view,/<unsafe>/);
});
test('actual application modules initialize behind the gate before opening a verified workspace',()=>{
  // A source-level DOM double catches initialization errors. This is not rendered browser QA.
  for(const [verified,route,expected] of [[false,'#play',null],[true,'#play','Your quest path'],[true,'#developer-path/course','Your learning sequence'],[true,'#developer-path/course/mocks','Practice the whole conversation.'],[true,'#apis','HTTP from zero'],[true,'#apis/lesson/api-first-conversation','Two programs, one agreed conversation'],[true,'#apis/lab/rest','Notebook request lab']]){
    const script=`
      import assert from 'node:assert/strict';
      const elements=new Map(),storage=new Map();
      const get=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},removeEventListener(){},querySelector:get,querySelectorAll:()=>[],focus(){},setAttribute(){}});return elements.get(key);};
      globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
      globalThis.document={querySelector:get,querySelectorAll:()=>[],addEventListener(){},hidden:false,body:get('body')};
      globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.dispatchEvent=()=>{};globalThis.scrollTo=()=>{};globalThis.setInterval=()=>0;globalThis.clearInterval=()=>{};
      globalThis.location={hash:${JSON.stringify(route)},reload(){}};
      globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({enabled:true,authMethod:'email-code',user:${verified?"{id:'owner',emailVerified:true}":'null'}})});
      await import('./src/app.mjs');
      await new Promise(resolve=>setTimeout(resolve,10));
      ${verified?`assert.ok(get('${route==='#play'?'[data-arcade-view]':'#app'}').innerHTML.includes(${JSON.stringify(expected)}));assert.match(get('#app').innerHTML,/Main navigation/);`:"assert.match(get('#app').innerHTML,/Sign-in is required/);assert.doesNotMatch(get('#app').innerHTML,/Main navigation/);"}
    `;
    const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',timeout:5000});assert.equal(result.status,0,result.stderr);
  }
});
