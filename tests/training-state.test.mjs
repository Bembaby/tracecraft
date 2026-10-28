import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTraining,validateTraining,recordAttempt,recordHelp,helpFor,dueReviews,afterDays,dayKey,startFreshAttempt} from '../src/training-state.mjs';
test('assistance persists today, independent repeats advance only on another day',()=>{
 const state=freshTraining(),now=new Date(2026,9,28,12),key='sql:join';
 recordHelp(state,key,'solution',dayKey(now));recordHelp(state,key,'hint',dayKey(now));
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},now);
 assert.equal(state.attempts[0].help,'solution');assert.equal(state.reviews[key].stage,0);
 const tomorrow=new Date(2026,9,29,12);
 assert.equal(helpFor(state,key,dayKey(tomorrow)),'independent');
 startFreshAttempt(state,key,'',dayKey(tomorrow));
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},tomorrow);
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},tomorrow);
 assert.equal(state.reviews[key].stage,1);
 startFreshAttempt(state,key,'','2026-10-30');
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},new Date(2026,9,30,12));
 assert.equal(state.reviews[key].stage,2);assert.equal(state.reviews[key].due,'2026-11-02');
 assert.equal(dueReviews(state,'2026-11-01').length,0);assert.equal(dueReviews(state,'2026-11-02').length,1);
});
test('backup validation bounds data and does not copy arbitrary object keys',()=>{
 const raw=JSON.parse('{"version":1,"selectedDay":"w99d0","done":["w1d1","w1d1","w12d4"],"drafts":{"sql:join":"safe","__proto__":"bad","constructor":"bad"},"attempts":[{"type":"sql","exercise":"join","at":"not-a-date"}],"session":{"date":"2000-01-01","remaining":0}}');
 const clean=validateTraining(raw);assert.equal(clean.selectedDay,'w1d1');assert.deepEqual(clean.done,['w1d1']);assert.deepEqual(clean.drafts,{'sql:join':'safe'});assert.equal(clean.attempts.length,0);assert.equal(clean.session.remaining,7200);assert.equal(Object.getPrototypeOf(clean.drafts),Object.prototype);
 assert.throws(()=>validateTraining({version:99}));
});
test('calendar scheduling crosses month and daylight-saving boundaries using local dates',()=>{
 assert.equal(afterDays('2026-10-31',1),'2026-11-01');assert.equal(afterDays('2026-12-31',1),'2027-01-01');assert.equal(afterDays('2028-02-28',1),'2028-02-29');
});

test('rechecking a saved answer on a later day does not earn independent review credit',()=>{
 const state=freshTraining();
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},new Date(2026,9,28,12));
 recordAttempt(state,{type:'sql',exercise:'join',passed:true,code:'SELECT 1;'},new Date(2026,9,29,12));
 assert.equal(state.attempts.at(-1).help,'continued');assert.equal(state.reviews['sql:join'].stage,0);
 state.drafts['sql:join']='SELECT 1;';startFreshAttempt(state,'sql:join','-- try again','2026-10-30');
 assert.equal(state.drafts['archive:sql:join'],'SELECT 1;');assert.equal(state.drafts['sql:join'],'-- try again');
});
