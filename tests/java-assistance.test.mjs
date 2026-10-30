import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTraining,recordHelp} from '../src/training-state.mjs';
import {javaDraftAssistance} from '../src/java-assistance.mjs';
test('known Java help follows a carried draft across midnight and reload until a later fresh start',()=>{
  const state=freshTraining();recordHelp(state,'java:java-start','solution','2026-10-29');
  assert.equal(javaDraftAssistance(state,'java-start','2026-10-30'),'solution');
  assert.equal(javaDraftAssistance(JSON.parse(JSON.stringify(state)),'java-start','2026-10-30'),'solution');
  state.fresh['java:java-start']='2026-10-29';assert.equal(javaDraftAssistance(state,'java-start','2026-10-30'),'solution');
  state.fresh['java:java-start']='2026-10-30';assert.equal(javaDraftAssistance(state,'java-start','2026-10-30'),'independent');
  recordHelp(state,'java:java-start','hint','2026-10-30');assert.equal(javaDraftAssistance(state,'java-start','2026-10-30'),'hint');
  assert.equal(javaDraftAssistance(state,'java-types','2026-10-30'),'independent');
});
