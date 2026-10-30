import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTraining,recordAssistance,recordAttempt,validateTraining,draftAssistance,startFreshAttempt} from '../src/training-state.mjs';
test('runtime attempts preserve bounded real results and documentation alongside stronger assistance',()=>{
  const state=freshTraining(),date=new Date(2026,0,1,12),key='python:fluency-dict-put';
  recordAssistance(state,key,'solution','2026-01-01');recordAssistance(state,key,'documentation','2026-01-01');
  const attempt=recordAttempt(state,{type:'python',exercise:'fluency-dict-put',passed:true,code:'original code',result:{stdout:'x'.repeat(4000),error:'',checks:[{label:'changed',passed:true}]}},date);
  assert.equal(attempt.help,'solution');assert.equal(attempt.documentationUsed,true);assert.equal(attempt.execution.stdout.length,2000);assert.equal(attempt.execution.checks[0].passed,true);
  const restored=validateTraining(state).attempts[0];assert.deepEqual(restored,attempt);
  assert.equal(draftAssistance(state,key,'2026-01-02'),'solution');startFreshAttempt(state,key,'','2026-01-02');assert.equal(draftAssistance(state,key,'2026-01-02'),'independent');
});
test('legacy attempts do not acquire invented execution results',()=>{
  const state=validateTraining({version:1,attempts:[{type:'sql',exercise:'inner-join',at:'2026-01-01T12:00:00Z',passed:true,code:'SELECT 1'}]});
  assert.equal(Object.hasOwn(state.attempts[0],'execution'),false);assert.equal(Object.hasOwn(state.attempts[0],'documentationUsed'),false);
});
