import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { getMigrations } from 'better-auth/db/migration';
import { createEmailAuth,hostedConfig } from '../server/auth.mjs';
import { createHostedHandler } from '../server/hosted-api.mjs';
import { codeMessage,emailSender } from '../server/email.mjs';
import { CONTENT_REVISION } from '../src/practice-versions.mjs';
import { freshTraining } from '../src/training-state.mjs';
const origin='http://127.0.0.1:3000',secret='a-test-secret-that-is-longer-than-thirty-two-characters';

async function fixture(){
  const database=new DatabaseSync(':memory:');database.exec('PRAGMA foreign_keys=ON');
  const emails=[],copies=new Map();
  const auth=createEmailAuth({origin,secret,database,logger:{disabled:true},sendCode:async data=>{emails.push(data);}});
  const migrations=await getMigrations({...auth.options,logger:{disabled:true}});await migrations.runMigrations();
  const store={async read(id){return copies.get(id)||{revision:0,snapshot:null,updatedAt:null};},
    async write(id,revision,snapshot){const old=await this.read(id);if(old.revision!==revision)return null;const value={revision:revision+1,snapshot,updatedAt:new Date().toISOString()};copies.set(id,value);return value;},
    async deleteAccount(id){copies.delete(id);database.prepare('DELETE FROM "user" WHERE id=?').run(id);}};
  const handler=createHostedHandler({auth,store,origin});
  const request=(path,{method='GET',data,cookie,ip='127.0.0.1',requestOrigin=origin,header=true}={})=>handler(new Request(origin+path,{method,
    headers:{...(cookie?{Cookie:cookie}:{}),'x-real-ip':ip,...(method!=='GET'?{Origin:requestOrigin}:{}),...(header?{'X-TraceCraft-Sync':'1'}:{}),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})}));
  const send=async(email,ip)=>request('/api/auth/email-otp/send-verification-otp',{method:'POST',data:{email,type:'sign-in'},ip});
  const verify=async(email,otp,ip)=>request('/api/auth/sign-in/email-otp',{method:'POST',data:{email,otp},ip});
  return {database,auth,emails,copies,request,send,verify};
}
const snapshot={format:'tracecraft-progress',version:1,contentRevision:CONTENT_REVISION,workspaces:{training:freshTraining(),design:null,legacy:null}};

test('hosted email configuration fails closed on incomplete, insecure, or short-secret settings',()=>{
  assert.equal(hostedConfig({}),null);assert.throws(()=>hostedConfig({DATABASE_URL:'test'}),/require/);
  const env={DATABASE_URL:'test',AUTH_SECRET:secret,AUTH_URL:'https://tracecraft.example',RESEND_API_KEY:'test',EMAIL_FROM:'TraceCraft <signin@example.test>'};
  assert.equal(hostedConfig(env).origin,env.AUTH_URL);
  assert.throws(()=>hostedConfig({...env,AUTH_URL:'http://example.test'}),/HTTPS/);
  assert.throws(()=>hostedConfig({...env,AUTH_SECRET:'short'}),/32 characters/);
});

test('real Better Auth email code verifies ownership, keeps tokens out of JSON, and permits owner-scoped progress',async()=>{
  const f=await fixture();try{
    assert.equal((await f.request('/api/progress')).status,401);
    assert.equal((await f.send('learner@example.test')).status,200);assert.equal(f.emails.length,1);
    assert.equal(f.database.prepare('SELECT count(*) AS n FROM "user"').get().n,0);
    const record=f.database.prepare('SELECT value FROM verification').get();assert.ok(!record.value.includes(f.emails[0].otp));
    const verified=await f.verify('learner@example.test',f.emails[0].otp);assert.equal(verified.status,200,await verified.clone().text());
    assert.deepEqual(await verified.json(),{ok:true});
    const cookie=verified.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');assert.match(verified.headers.get('set-cookie'),/HttpOnly/);
    assert.match(verified.headers.get('set-cookie'),/Max-Age=604800/i);
    const session=await(await f.request('/api/session',{cookie})).json();assert.equal(session.user.emailVerified,true);assert.equal(session.user.email,'learner@example.test');assert.equal(session.user.token,undefined);
    assert.equal((await f.request('/api/progress',{method:'PUT',cookie,data:{revision:0,snapshot}})).status,200);
    assert.equal((await f.request('/api/progress',{method:'PUT',cookie,data:{revision:0,snapshot}})).status,409);
    assert.equal((await f.verify('learner@example.test',f.emails[0].otp)).status,400);
    assert.equal((await f.send('other@example.test','127.0.0.2')).status,200);const other=await f.verify('other@example.test',f.emails[1].otp,'127.0.0.2');
    const otherCookie=other.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
    assert.equal((await(await f.request('/api/progress?user_id='+session.user.id,{cookie:otherCookie})).json()).snapshot,null);
    assert.equal((await f.request('/api/progress',{method:'PUT',cookie:otherCookie,data:{revision:0,snapshot,expectedUserId:session.user.id}})).status,412);
    assert.equal((await(await f.request('/api/progress',{cookie:otherCookie})).json()).snapshot,null);
    assert.equal((await f.request('/api/account',{method:'DELETE',cookie,data:{confirm:'DELETE'}})).status,200);
    assert.equal((await f.request('/api/progress',{cookie})).status,401);
    assert.equal((await f.request('/api/session',{cookie:otherCookie})).status,200);
  }finally{f.database.close();}
});

test('codes expire, wrong guesses invalidate them, resend is throttled, and unverified accounts cannot read progress',async()=>{
  const f=await fixture();try{
    await f.send('expired@example.test');const expired=f.emails[0].otp;
    f.database.prepare('UPDATE verification SET expiresAt=?').run('2000-01-01T00:00:00.000Z');
    assert.equal((await f.verify('expired@example.test',expired)).status,400);
    await f.send('guesses@example.test','127.0.0.3');const code=f.emails[1].otp;
    const wrong=code==='000000'?'111111':'000000';
    for(let i=0;i<3;i++)assert.equal((await f.verify('guesses@example.test',wrong,'127.0.0.3')).status,400);
    assert.equal((await f.verify('guesses@example.test',code,'127.0.0.3')).status,403);
    assert.equal((await f.send('another@example.test','127.0.0.3')).status,429);
    await f.send('unverified@example.test','127.0.0.4');const verified=await f.verify('unverified@example.test',f.emails[2].otp,'127.0.0.4');
    const cookie=verified.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
    f.database.prepare('UPDATE "user" SET emailVerified=0 WHERE email=?').run('unverified@example.test');
    assert.equal((await f.request('/api/progress',{cookie})).status,401);
  }finally{f.database.close();}
});

test('public auth gateway denies foreign origins, absent headers, and unused auth endpoints',async()=>{
  const f=await fixture();try{
    assert.equal((await f.request('/api/auth/email-otp/send-verification-otp',{method:'POST',data:{email:'a@example.test'},requestOrigin:'https://attacker.test'})).status,403);
    assert.equal((await f.request('/api/auth/sign-in/email-otp',{method:'POST',data:{email:'a@example.test',otp:'123456'},header:false})).status,403);
    for(const path of ['/api/auth/email-otp/get-verification-otp','/api/auth/sign-up/email','/api/auth/sign-in/email','/api/auth/update-user'])assert.equal((await f.request(path,{method:'POST',data:{}})).status,404);
    assert.equal(f.emails.length,0);
  }finally{f.database.close();}
});

test('transactional sender uses one idempotency key across retries and never puts the code in the subject',async()=>{
  const message=codeMessage('123456');assert.ok(!message.subject.includes('123456'));assert.match(message.text,/5 minutes/);assert.throws(()=>codeMessage('<svg>'),/Invalid/);
  const calls=[],pool={async query(sql){return {rows:sql.startsWith('INSERT')?[{count:1}]:[]};}};
  const send=emailSender({secret,emailKey:'server-only',emailFrom:'TraceCraft <signin@example.test>'},pool,{fetcher:async(url,options)=>{calls.push({url,options});return new Response('',{status:calls.length===1?503:200});}});
  await send({email:'learner@example.test',otp:'123456'});assert.equal(calls.length,2);assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
  assert.equal(calls[0].url,'https://api.resend.com/emails');assert.ok(JSON.parse(calls[0].options.body).text.includes('123456'));
});
