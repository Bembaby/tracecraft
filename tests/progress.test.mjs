import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import http from 'node:http';
import { ProgressStore, hash } from '../scripts/progress-store.mjs';
import { createProgressApi, progressConfig } from '../scripts/progress-api.mjs';
import { captureProgress, restoreProgress, workspaceFingerprint, WORKSPACE_KEYS, RECOVERY_KEY, progressRequest } from '../src/progress-client.mjs';
import { validateProgress, PROGRESS_LIMIT } from '../src/progress-contract.mjs';
import { freshTraining, recordAttempt } from '../src/training-state.mjs';
import { freshDesignWorkspace } from '../src/system-design-state.mjs';
import { CONTENT_REVISION, RUNTIME_VERSIONS } from '../src/practice-versions.mjs';

const snapshot=(note='Saved journal')=>({format:'tracecraft-progress',version:1,contentRevision:CONTENT_REVISION,workspaces:{training:{...freshTraining(),notes:{w1d1:note}},design:freshDesignWorkspace(),legacy:{version:1}}});
class Storage {
  values=new Map();
  getItem(key){return this.values.get(key)??null;}
  setItem(key,value){this.values.set(key,value);}
  removeItem(key){this.values.delete(key);}
}
test('progress configuration is opt-in, complete, and HTTPS except loopback',()=>{
  assert.equal(progressConfig({}),null);
  assert.throws(()=>progressConfig({GITHUB_CLIENT_ID:'test'}),/together/);
  const config={GITHUB_CLIENT_ID:'id',GITHUB_CLIENT_SECRET:'secret',TRACECRAFT_ORIGIN:'http://127.0.0.1:3000'};
  assert.equal(progressConfig(config).origin,config.TRACECRAFT_ORIGIN);
  for(const origin of ['http://example.com','https://example.com/path','https://user:pass@example.com','https://example.com/'])assert.throws(()=>progressConfig({...config,TRACECRAFT_ORIGIN:origin}));
  assert.equal(progressConfig({...config,TRACECRAFT_ORIGIN:'https://example.com'}).origin,'https://example.com');
});
test('account snapshot round-trips separated workspaces and allowlists data',()=>{
  const data=snapshot();data.apiKey='do-not-save';data.workspaces.legacy.token='do-not-save';
  const a=recordAttempt(data.workspaces.training,{type:'sql',exercise:'keyset-page',code:'SELECT 1;',passed:true});
  const clean=validateProgress(JSON.parse(JSON.stringify(data)));
  assert.equal(clean.apiKey,undefined);assert.equal(clean.workspaces.legacy.token,undefined);
  assert.equal(clean.workspaces.training.notes.w1d1,'Saved journal');
  assert.equal(clean.workspaces.training.attempts[0].runtimeVersion,RUNTIME_VERSIONS.sql);
  assert.equal(a.contentRevision,CONTENT_REVISION);
  delete a.runtimeVersion;delete a.contentRevision;
  assert.equal(validateProgress(data).workspaces.training.attempts[0].runtimeVersion,'historical-unversioned');
  assert.throws(()=>validateProgress({format:'wrong',version:1,workspaces:{}}));
  data.workspaces.design.version=99;assert.throws(()=>validateProgress(data));
});
test('restore preserves a complete recovery copy and refuses changed local work',()=>{
  const storage=new Storage();storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(snapshot('before').workspaces.training));
  const fingerprint=workspaceFingerprint(storage);
  restoreProgress(storage,snapshot('after'),fingerprint);
  assert.equal(captureProgress(storage).workspaces.training.notes.w1d1,'after');
  assert.equal(JSON.parse(storage.getItem(RECOVERY_KEY)).workspaces.training.notes.w1d1,'before');
  assert.throws(()=>restoreProgress(storage,snapshot(),fingerprint),/Local work changed/);
});
test('quota failures abort or roll back restoration without losing local work',()=>{
  const storage=new Storage();storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(snapshot('before').workspaces.training));
  const old=workspaceFingerprint(storage),set=storage.setItem.bind(storage);
  storage.setItem=(key,value)=>{if(key===RECOVERY_KEY)throw new Error('quota');set(key,value);};
  assert.throws(()=>restoreProgress(storage,snapshot(),old),/quota/);assert.equal(workspaceFingerprint(storage),old);
  let failed=false;storage.setItem=(key,value)=>{if(key===WORKSPACE_KEYS.design&&!failed){failed=true;throw new Error('quota');}set(key,value);};
  assert.throws(()=>restoreProgress(storage,snapshot(),old),/Existing work was restored/);assert.equal(workspaceFingerprint(storage),old);
  assert.equal(JSON.parse(storage.getItem(RECOVERY_KEY)).workspaces.training.notes.w1d1,'before');
});
test('SQLite progress survives reopen, enforces ownership, and rejects stale revisions',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'tracecraft-sync-'));let store;
  try {
    const path=join(dir,'progress.sqlite');store=new ProgressStore(path);
    const alice=store.login('1','alice'),bob=store.login('2','bob');
    assert.equal(store.user(alice).id,'1');assert.equal(store.user(bob).id,'2');
    assert.equal(store.write('1',0,snapshot('one')).revision,1);
    assert.equal(store.write('1',0,snapshot('stale')),null);
    assert.equal(store.read('2').snapshot,null);
    store.close();store=new ProgressStore(path);
    assert.equal(store.user(alice).id,'1');assert.equal(store.read('1').snapshot.workspaces.training.notes.w1d1,'one');
    store.deleteAccount('1');assert.equal(store.user(alice),undefined);assert.equal(store.read('1').snapshot,null);assert.equal(store.user(bob).id,'2');
  } finally {store?.close();await rm(dir,{recursive:true,force:true});}
});
test('OAuth state is browser-bound, single-use, expiring and tokens are hashed',()=>{
  const store=new ProgressStore(':memory:');try {
    const flow=store.beginLogin();assert.equal(store.consumeLogin(flow.state,'wrong'),undefined);
    assert.equal(store.consumeLogin(flow.state,flow.browser),flow.verifier);assert.equal(store.consumeLogin(flow.state,flow.browser),undefined);
    const expired=store.beginLogin();store.db.exec('UPDATE oauth SET expires=0');assert.equal(store.consumeLogin(expired.state,expired.browser),undefined);
    const session=store.login('1','alice');assert.equal(store.db.prepare('SELECT token_hash FROM sessions').get().token_hash,hash(session));
    store.db.exec('UPDATE sessions SET expires=0');assert.equal(store.user(session),undefined);
  }finally{store.close();}
});

test('real HTTP boundary: GitHub exchange, two browsers, conflicts, cross-user denial, export and deletion',async()=>{
  const store=new ProgressStore(':memory:');let api;let tokenRequests=0;let githubIdentity=1;
  const config={origin:'http://127.0.0.1',clientId:'test-id',clientSecret:'test-secret'};
  api=await createProgressApi(config,{store,fetchProvider:async(url,options)=>{
    if(url==='https://github.com/login/oauth/access_token'){
      tokenRequests++;assert.equal(options.body.get('client_secret'),'test-secret');assert.ok(options.body.get('code_verifier'));
      return Response.json({access_token:'provider-token'});
    }
    assert.equal(url,'https://api.github.com/user');assert.equal(options.headers.Authorization,'Bearer provider-token');return Response.json({id:githubIdentity,login:githubIdentity===1?'alice':'bob'});
  }});
  const server=http.createServer((req,res)=>api.handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  config.origin='http://127.0.0.1:'+server.address().port;
  const request=(path,{cookie,method='GET',data,origin=config.origin,header=true}={})=>fetch(config.origin+path,{method,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:origin}:{}),...(header?{'X-TraceCraft-Sync':'1'}:{}),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
  const signIn=async()=>{
    const begin=await request('/api/auth/github/start',{method:'POST'});assert.equal(begin.status,303);
    const authorization=new URL(begin.headers.get('location'));assert.equal(authorization.origin,'https://github.com');assert.equal(authorization.searchParams.get('code_challenge_method'),'S256');assert.equal(authorization.searchParams.get('scope'),'');
    const oauthCookie=begin.headers.getSetCookie()[0].split(';')[0];
    const callback='/api/auth/github/callback?code=test-code&state='+authorization.searchParams.get('state');
    const bad=await request(callback,{cookie:'tc_oauth=wrong'});assert.match(bad.headers.get('location'),/signin-failed/);
    const finish=await request(callback,{cookie:oauthCookie});assert.equal(finish.status,303);
    const cookies=finish.headers.getSetCookie();assert.ok(cookies.every(value=>value.includes('HttpOnly')&&value.includes('SameSite=Lax')));
    const cookie=cookies.find(value=>value.startsWith('tc_session=')).split(';')[0];
    const replay=await request(callback,{cookie:oauthCookie});assert.match(replay.headers.get('location'),/signin-failed/);
    return cookie;
  };
  try {
    assert.equal((await request('/api/progress')).status,401);
    assert.equal((await request('/api/auth/github/start',{method:'POST',origin:'https://attacker.test'})).status,403);
    const first=await signIn(),second=await signIn();githubIdentity=2;const bob=await signIn();assert.equal(tokenRequests,3);
    const malformed=await fetch(config.origin+'/api/progress',{method:'PUT',headers:{Cookie:first,Origin:config.origin,'X-TraceCraft-Sync':'1','Content-Type':'application/json'},body:'{broken'});assert.equal(malformed.status,400);
    assert.equal((await request('/api/progress',{cookie:first,method:'PUT',data:{revision:0,snapshot:{format:'invalid'}}})).status,400);
    const tooLarge=await fetch(config.origin+'/api/progress',{method:'PUT',headers:{Cookie:first,Origin:config.origin,'X-TraceCraft-Sync':'1','Content-Type':'application/json'},body:' '.repeat(PROGRESS_LIMIT+1)});assert.equal(tooLarge.status,413);
    assert.equal((await request('/api/progress',{cookie:first,method:'PUT',data:{revision:0,snapshot:snapshot()},origin:'https://attacker.test'})).status,403);
    assert.equal((await request('/api/progress',{cookie:first,method:'PUT',data:{revision:0,snapshot:snapshot()},header:false})).status,403);
    const save=await request('/api/progress',{cookie:first,method:'PUT',data:{revision:0,snapshot:snapshot('device one')}});assert.equal(save.status,200);
    const recovered=await (await request('/api/progress',{cookie:second})).json();assert.equal(recovered.snapshot.workspaces.training.notes.w1d1,'device one');
    assert.equal((await request('/api/progress',{cookie:second,method:'PUT',data:{revision:0,snapshot:snapshot('outdated')}})).status,409);
    assert.equal((await (await request('/api/progress?user_id=1',{cookie:bob})).json()).snapshot,null);
    assert.equal((await request('/api/progress/1',{cookie:bob})).status,404);
    assert.equal((await request('/api/progress',{cookie:bob,method:'PUT',data:{revision:0,snapshot:snapshot('bob')}})).status,200);
    const exported=JSON.stringify(recovered);assert.ok(!exported.includes('provider-token'));assert.ok(!exported.includes('test-secret'));
    assert.equal((await request('/api/account',{cookie:first,method:'DELETE',data:{confirm:'wrong'}})).status,400);
    assert.equal((await request('/api/account',{cookie:first,method:'DELETE',data:{confirm:'DELETE'}})).status,200);
    assert.equal((await request('/api/progress',{cookie:second})).status,401);
    assert.equal((await (await request('/api/progress',{cookie:bob})).json()).snapshot.workspaces.training.notes.w1d1,'bob');
    assert.equal((await request('/api/logout',{cookie:bob,method:'POST'})).status,200);assert.equal((await request('/api/progress',{cookie:bob})).status,401);
  }finally{await new Promise(resolve=>server.close(resolve));api.close();}
});
test('HTTPS sign-in cookies are Secure and provider errors cannot create a session',async()=>{
  const store=new ProgressStore(':memory:');
  const api=await createProgressApi({origin:'https://practice.example',clientId:'id',clientSecret:'secret'},{store,fetchProvider:async()=>Response.json({error:'provider_failure'},{status:500})});
  const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers={}){this.status=status;Object.assign(this.headers,headers);},end(){}});
  try {
    const start=response();await api.handler({url:'/api/auth/github/start',method:'POST',headers:{origin:'https://practice.example'}},start);
    assert.match(start.headers['Set-Cookie'],/; Secure/);assert.match(start.headers['Set-Cookie'],/HttpOnly/);
    const state=new URL(start.headers.Location).searchParams.get('state');
    const end=response();await api.handler({url:'/api/auth/github/callback?code=test&state='+state,method:'GET',headers:{cookie:start.headers['Set-Cookie'].split(';')[0]}},end);
    assert.match(end.headers.Location,/signin-failed/);assert.equal(store.db.prepare('SELECT count(*) AS n FROM sessions').get().n,0);
  }finally{api.close();}
});
test('unconfigured API reports local mode and client tolerates static hosts and offline errors',async()=>{
  const api=await createProgressApi(null);const server=http.createServer((req,res)=>api.handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{const url='http://127.0.0.1:'+server.address().port;assert.deepEqual(await(await fetch(url+'/api/session')).json(),{enabled:false,user:null});assert.equal((await fetch(url+'/api/progress')).status,503);}finally{await new Promise(resolve=>server.close(resolve));}
  await assert.rejects(progressRequest('/api/session',{fetcher:async()=>new Response('not JSON',{status:404})}),/unavailable/);
  await assert.rejects(progressRequest('/api/progress',{fetcher:async()=>Response.json({error:'Another device saved'},{status:409})}),error=>error.status===409);
});
