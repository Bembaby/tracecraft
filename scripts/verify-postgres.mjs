// Explicit operator check. Uses disposable synthetic records and sends no email.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { databaseUrl } from '../server/database.mjs';
import { createEmailAuth } from '../server/auth.mjs';
import { createHostedHandler } from '../server/hosted-api.mjs';
import { PostgresProgressStore } from '../server/postgres-store.mjs';
import { takeEmailQuota } from '../server/email.mjs';
import { freshTraining } from '../src/training-state.mjs';
import { CONTENT_REVISION } from '../src/practice-versions.mjs';
if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL for an explicit database check.');
const pool=new pg.Pool({connectionString:databaseUrl(process.env.DATABASE_URL),max:3,connectionTimeoutMillis:8000});
const marker=randomUUID(),emails=[`qa-${marker}@example.test`,`qa-other-${marker}@example.test`],codes=new Map();
const origin='http://127.0.0.1:3109',secret=randomUUID()+randomUUID();
const auth=createEmailAuth({origin,secret,database:pool,rateLimitStorage:'memory',logger:{disabled:true},sendCode:async({email,otp})=>codes.set(email,otp)});
const store=new PostgresProgressStore(pool),handler=createHostedHandler({auth,store,origin});
const request=(path,{method='GET',body,cookie}={})=>handler(new Request(origin+path,{method,headers:{Origin:origin,'X-TraceCraft-Sync':'1','Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}));
const snapshot={format:'tracecraft-progress',version:1,contentRevision:CONTENT_REVISION,workspaces:{training:freshTraining(),design:null,legacy:null}};
async function signIn(email){
  // Unique IP keys avoid rate-limit collisions between the two synthetic users.
  const headers={Origin:origin,'X-TraceCraft-Sync':'1','Content-Type':'application/json','x-real-ip':email===emails[0]?'127.0.0.5':'127.0.0.6'};
  assert.equal((await handler(new Request(origin+'/api/auth/email-otp/send-verification-otp',{method:'POST',headers,body:JSON.stringify({email})}))).status,200);
  const verified=await handler(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers,body:JSON.stringify({email,otp:codes.get(email)})}));
  assert.equal(verified.status,200,await verified.clone().text());
  return verified.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
}
try{
  await store.health();
  const cookie=await signIn(emails[0]),other=await signIn(emails[1]);
  const {user}=await(await request('/api/session',{cookie})).json();assert.equal(user.emailVerified,true);
  assert.equal((await request('/api/progress',{cookie,method:'PUT',body:{revision:-1,snapshot}})).status,400);
  assert.equal((await request('/api/progress',{cookie,method:'PUT',body:{revision:0,snapshot:{}}})).status,400);
  const competing=await Promise.all([0,1].map(()=>request('/api/progress',{cookie,method:'PUT',body:{revision:0,snapshot}})));
  assert.deepEqual(competing.map(result=>result.status).sort(),[200,409]);
  const reopened=new PostgresProgressStore(pool);assert.equal((await reopened.read(user.id)).revision,1);
  assert.equal((await(await request('/api/progress?user_id='+user.id,{cookie:other})).json()).snapshot,null);
  const quota=await Promise.allSettled([0,1,2,3].map(()=>takeEmailQuota(pool,'qa:'+marker,2,new Date(Date.now()+60000))));
  assert.equal(quota.filter(item=>item.status==='fulfilled').length,2);
  assert.equal((await request('/api/account',{method:'DELETE',cookie,body:{confirm:'DELETE'}})).status,200);
  assert.equal((await request('/api/progress',{cookie})).status,401);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM session WHERE "userId"=$1',[user.id])).rows[0].n,0);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM tc_progress WHERE user_id=$1',[user.id])).rows[0].n,0);
  console.log('Postgres verified: email ownership, owner isolation, concurrent conflict, durable reads, quota atomicity, deletion cascade. No email sent.');
}finally{
  await pool.query('DELETE FROM "user" WHERE email=ANY($1::text[])',[emails]);
  await pool.query('DELETE FROM verification WHERE identifier LIKE $1',['%'+marker+'%']);
  await pool.query('DELETE FROM tc_email_limits WHERE key=$1',['qa:'+marker]);
  await pool.end();
}
