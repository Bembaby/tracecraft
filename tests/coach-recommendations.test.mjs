import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTraining} from '../src/training-state.mjs';
import {recommendPractice} from '../src/coach-recommendations.mjs';
import {DIAGNOSTIC_STEPS,COACH_TASKS} from '../src/learning-coach-content.mjs';
const skipBaseline=state=>{for(const step of DIAGNOSTIC_STEPS)state.coach.diagnostic.steps[step.id]={status:'skipped',note:'',at:null};};
test('a baseline is resumable and skipping does not invent runtime evidence',()=>{
  const state=freshTraining();assert.equal(recommendPractice(state).href,'#coach/diagnostic/dictionary');
  state.coach.diagnostic.steps.dictionary={status:'skipped'};assert.equal(recommendPractice(state).href,'#coach/diagnostic/mapping');assert.equal(state.attempts.length,0);
});
test('selected priorities and actual failures determine the next task without broad weakness labels',()=>{
  const state=freshTraining();skipBaseline(state);state.coach.profile.goals=['sql'];
  assert.match(recommendPractice(state).href,/^#sql\/fitness-/);
  const task=COACH_TASKS.find(t=>t.type==='sql'&&t.id.startsWith('fitness-'));
  state.attempts.push({exercise:task.id,type:'sql',passed:false,at:'2026-01-01T12:00:00Z'});
  assert.equal(recommendPractice(state).kind,'failed-check');assert.equal(recommendPractice(state).href,task.href);
  state.coach.profile.goals=['python'];assert.match(recommendPractice(state).href,/^#python\//);
});
