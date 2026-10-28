import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLessons } from '../scripts/validate-content.mjs';
import { CURRICULUM_MODULES,validateCurriculum } from '../src/curriculum.mjs';
import { SQL_LABS } from '../src/sql-content.mjs';
import { PYTHON_DRILLS } from '../src/training-content.mjs';
import { freshTraining,validateTraining } from '../src/training-state.mjs';
const ids=new Set([...SQL_LABS.map(lesson=>'sql:'+lesson.id),...PYTHON_DRILLS.map(lesson=>'python:'+lesson.id)]);
test('every milestone links to runnable lessons and states environment, evidence and prerequisites',()=>{
  assert.deepEqual(validateLessons(),{sql:12,python:8,milestones:8});
  assert.equal(validateCurriculum(CURRICULUM_MODULES,ids),true);
});
test('authoring checks reject missing edge fixtures, solutions, broken links and cyclic prerequisites',()=>{
  const sql=structuredClone(SQL_LABS);sql[0].fixtures=[];assert.throws(()=>validateLessons(sql),/edge fixtures/);
  sql[0]=structuredClone(SQL_LABS[0]);sql[0].solution='';assert.throws(()=>validateLessons(sql),/solution/);
  const modules=structuredClone(CURRICULUM_MODULES);modules[0].lessons=[['sql','does-not-exist']];assert.throws(()=>validateCurriculum(modules,ids),/Unknown curriculum lesson/);
  modules[0]=structuredClone(CURRICULUM_MODULES[0]);modules[0].prerequisites=[8];assert.throws(()=>validateCurriculum(modules,ids),/earlier existing/);
});
test('milestone reflection survives backups while malformed and unknown checkpoints are rejected',()=>{
  const state=freshTraining();state.milestones.week1=['model','model','unknown'];state.milestones.week99=['model'];state.explanations['milestone:week-1']='A test and a limitation.';
  const clean=validateTraining(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(clean.milestones,{week1:['model']});assert.equal(clean.done.length,0);
  assert.equal(clean.explanations['milestone:week-1'],'A test and a limitation.');
  assert.deepEqual(validateTraining({version:1,milestones:{week1:{bad:true}}}).milestones,{});
});
