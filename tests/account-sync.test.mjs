import test from 'node:test';
import assert from 'node:assert/strict';
import { AccountSync, AUTOSAVE_KEY } from '../src/account-sync.mjs';
import { freshTraining } from '../src/training-state.mjs';
import { WORKSPACE_KEYS, captureProgress } from '../src/progress-client.mjs';

function fixture(){
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));
  const state={user:{id:'owner'},remote:{revision:0,snapshot:null},calls:[],fail:null};
  const request=async(path,options={})=>{state.calls.push({path,...options});if(state.fail)throw state.fail;if(path==='/api/session')return {enabled:true,user:state.user};if(options.method==='PUT'){assert.equal(options.data.expectedUserId,'owner');state.remote={revision:state.remote.revision+1,snapshot:options.data.snapshot};return {revision:state.remote.revision};}return state.remote;};
  const sync=new AccountSync({storage,request});
  const edit=()=>{const training=JSON.parse(storage.getItem(WORKSPACE_KEYS.training));training.notes.w1d1='new progress';storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(training));};
  return {storage,state,sync,edit};
}
test('sign-in alone never uploads progress; saving requires an owner-bound reviewed opt-in',async()=>{
  const f=fixture();await f.sync.refresh();f.edit();await f.sync.tick();assert.equal(f.sync.status,'review');assert.equal(f.state.calls.filter(c=>c.method==='PUT').length,0);
});
test('autosave uploads changed work once, persists the revision, and resumes a saved session',async()=>{
  const f=fixture();f.sync.enable(f.state.user,0);await f.sync.tick();assert.equal(f.state.calls.length,0);f.edit();await f.sync.tick();
  assert.equal(f.sync.status,'saved');assert.equal(f.state.remote.snapshot.workspaces.training.notes.w1d1,'new progress');assert.equal(JSON.parse(f.storage.getItem(AUTOSAVE_KEY)).revision,1);
  await f.sync.tick();assert.equal(f.state.calls.filter(c=>c.method==='PUT').length,1);
  const resumed=new AccountSync({storage:f.storage,request:f.sync.request});await resumed.refresh();await resumed.tick();assert.equal(resumed.status,'saved');assert.equal(f.state.calls.filter(c=>c.method==='PUT').length,1);
});
test('reload preserves pending local work after an offline interval',async()=>{
  const f=fixture();f.state.remote={revision:2,snapshot:captureProgress(f.storage)};f.sync.enable(f.state.user,2);f.edit();await f.sync.refresh();await f.sync.tick();assert.equal(f.state.remote.revision,3);assert.equal(f.sync.status,'saved');
});
test('the initial reviewed save queues edits that arrived before enabling autosave',async()=>{
  const f=fixture(),confirmed=captureProgress(f.storage);f.state.remote={revision:1,snapshot:confirmed};f.edit();f.sync.enable(f.state.user,1,confirmed);
  assert.equal(f.sync.status,'ready');await f.sync.tick();assert.equal(f.state.remote.snapshot.workspaces.training.notes.w1d1,'new progress');assert.equal(f.sync.status,'saved');
});
test('another browser revision requires review and never silently overwrites',async()=>{
  const f=fixture();f.sync.enable(f.state.user,0);f.state.remote.revision=4;f.edit();await f.sync.refresh();await f.sync.tick();assert.equal(f.sync.status,'conflict');assert.equal(f.state.calls.filter(c=>c.method==='PUT').length,0);
});
test('an account switch or expired session stops autosave before any write',async()=>{
  for(const user of [{id:'someone-else'},null]){const f=fixture();f.sync.enable(f.state.user,0);f.edit();f.state.user=user;await f.sync.tick();assert.equal(f.sync.config,null);assert.equal(f.state.calls.filter(c=>c.method==='PUT').length,0);}
});
test('conflicts, network errors, and quota failures leave local progress intact',async()=>{
  for(const status of [409,401,412,503]){const f=fixture();f.sync.enable(f.state.user,0);f.edit();f.state.fail=Object.assign(new Error('failed'),{status});await f.sync.tick();assert.equal(f.sync.config,null);assert.equal(JSON.parse(f.storage.getItem(WORKSPACE_KEYS.training)).notes.w1d1,'new progress');assert.notEqual(f.sync.status,'saved');}
  const f=fixture();f.storage.setItem=()=>{throw new Error('quota');};f.sync.enable(f.state.user,0);assert.equal(f.sync.status,'storage');assert.equal(f.sync.config,null);
});
test('logout, revoked sessions and changed accounts immediately remove gate access',async()=>{
  const f=fixture();f.sync.enable(f.state.user,0);f.sync.clearSession();assert.equal(f.sync.user,null);assert.equal(f.sync.status,'signed-out');assert.equal(f.sync.config,null);
  for(const status of [401,412]){const g=fixture();g.sync.enable(g.state.user,0);g.edit();g.state.fail=Object.assign(new Error('session ended'),{status});await g.sync.tick();assert.equal(g.sync.user,null);assert.equal(g.sync.status,'signed-out');}
});
test('edits made during an in-flight save remain pending for the next save',async()=>{
  const f=fixture(),original=f.sync.request;let release;f.sync.enable(f.state.user,0);f.edit();
  f.sync.request=async(path,options)=>{if(options?.method==='PUT')await new Promise(resolve=>release=resolve);return original(path,options);};
  const task=f.sync.tick();while(!release)await new Promise(resolve=>setTimeout(resolve,0));
  const training=JSON.parse(f.storage.getItem(WORKSPACE_KEYS.training));training.notes.w1d1='edited during save';f.storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(training));release();await task;
  assert.equal(f.sync.status,'ready');assert.equal(f.state.remote.snapshot.workspaces.training.notes.w1d1,'new progress');
  f.sync.request=original;await f.sync.tick();assert.equal(f.state.remote.snapshot.workspaces.training.notes.w1d1,'edited during save');assert.equal(f.sync.status,'saved');
});
