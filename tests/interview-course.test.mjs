import test from 'node:test';
import assert from 'node:assert/strict';
import {INTERVIEW_UNITS,MOCK_INTERVIEWS,UNIT_BY_ID,MOCK_BY_ID,courseUnitsFor} from '../src/interview-course-content.mjs';
import {FRONTEND_EXERCISES} from '../src/frontend-course-content.mjs';
import {freshCourse,validateCourse,courseEvidence,exerciseEvidence,mockEvidence,startMock,remainingMock,pauseMock,finishMock} from '../src/interview-course-state.mjs';
import {freshTraining,validateTraining,trainingSnapshot,recordAttempt,recordHelp,startFreshAttempt,dayKey} from '../src/training-state.mjs';
import {validateInterviewCourse} from '../scripts/validate-content.mjs';
import {PYTHON_DRILLS} from '../src/training-content.mjs';
import {SQL_LABS} from '../src/sql-content.mjs';
import {captureProgress,restoreProgress,workspaceFingerprint,WORKSPACE_KEYS} from '../src/progress-client.mjs';

test('the course covers the original interview drills and validates both preparation paths',()=>{
  assert.deepEqual(validateInterviewCourse(),{units:23,mocks:4});
  const covered=new Set(INTERVIEW_UNITS.flatMap(unit=>unit.practice.map(task=>task.type+':'+task.id)));
  for(const [type,lessons] of [['python',PYTHON_DRILLS],['sql',SQL_LABS]])for(const lesson of lessons.filter(item=>item.level!=='beginner'&&item.curriculum!=='practical'))assert.ok(covered.has(type+':'+lesson.id),lesson.id);
  assert.equal(courseUnitsFor('both').length,23);assert.equal(courseUnitsFor('backend').length,18);assert.equal(courseUnitsFor('fullstack').length,23);
  for(const unit of INTERVIEW_UNITS){assert.ok(unit.sections.every(section=>section.body.length>180));assert.equal(unit.checks.length,3);}
});
test('course authoring rejects broken links, cyclic prerequisites and unbalanced mock budgets',()=>{
  const units=structuredClone(INTERVIEW_UNITS);units[0].practice[0].id='missing';assert.throws(()=>validateInterviewCourse(units),/Unknown course exercise/);
  units[0]=structuredClone(INTERVIEW_UNITS[0]);units[0].prerequisites=['delivery'];assert.throws(()=>validateInterviewCourse(units),/earlier lesson/);
  const mocks=structuredClone(MOCK_INTERVIEWS);mocks[0].minutes++;assert.throws(()=>validateInterviewCourse(INTERVIEW_UNITS,mocks),/sum/);
});
for(const exercise of FRONTEND_EXERCISES){
  test(`${exercise.id}: authored JavaScript reference passes edge fixtures and deliberate bug fails`,()=>{
    let bugCaught=false;
    for(const fixture of exercise.fixtures){
      const args=structuredClone(fixture.args),before=structuredClone(args);
      assert.deepEqual(exercise.reference(...args),fixture.expected,fixture.label);assert.deepEqual(args,before,'reference mutated input');
      const wrongArgs=structuredClone(fixture.args);
      try{const wrong=exercise.deliberateBug(...wrongArgs);if(JSON.stringify(wrong)!==JSON.stringify(fixture.expected)||JSON.stringify(wrongArgs)!==JSON.stringify(fixture.args))bugCaught=true;}catch{bugCaught=true;}
    }
    assert.equal(bugCaught,true,'bug unexpectedly passed all fixtures');
  });
}
test('accepted search results copy their array while a stale result preserves state identity',()=>{
  const run=FRONTEND_EXERCISES.find(item=>item.id==='latest-request').reference,state={requestId:2,status:'loading',items:[]},response={requestId:2,items:['new']};
  const result=run(state,response);assert.notEqual(result,state);assert.notEqual(result.items,response.items);result.items.push('extra');assert.deepEqual(response.items,['new']);
  assert.equal(run(state,{requestId:1,items:['old']}),state);
});
test('read markers, reflection and self-checks never create code passes',()=>{
  const state=freshTraining();state.course.read=INTERVIEW_UNITS.map(unit=>unit.id);for(const unit of INTERVIEW_UNITS){state.course.notes[unit.id]='I have a note.';state.course.selfChecks[unit.id]=unit.checks.map(([id])=>id);}
  const evidence=courseEvidence(state);assert.equal(evidence.independent,0);assert.equal(evidence.delayed,0);assert.equal(state.attempts.length,0);
});
test('latest failed or assisted checks do not retain a misleading independent status',()=>{
  const state=freshTraining(),now=new Date(2026,9,28,12);recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'first'},now);
  assert.equal(exerciseEvidence(state.attempts,'python','stable-unique').status,'independent');
  recordAttempt(state,{type:'python',exercise:'stable-unique',passed:false,code:'broken'},new Date(now.getTime()+1000));assert.equal(exerciseEvidence(state.attempts,'python','stable-unique').status,'retry');
  recordHelp(state,'python:stable-unique','hint',dayKey(now));recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'helped'},new Date(now.getTime()+2000));assert.equal(exerciseEvidence(state.attempts,'python','stable-unique').status,'assisted');
});
test('delayed evidence requires independent work on different days, not repeated button presses',()=>{
  const state=freshTraining(),first=new Date(2026,9,27,12);recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'x'},first);recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'x'},first);
  assert.equal(courseEvidence(state).delayed,0);
  startFreshAttempt(state,'python:stable-unique','', '2026-10-28');recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'fresh'},new Date(2026,9,28,12));assert.equal(courseEvidence(state).delayed,1);
});
test('mock evidence excludes earlier checks and preserves assisted status',()=>{
  const state=freshTraining(),before=new Date(2026,9,28,11),now=new Date(2026,9,28,12);recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'old'},before);
  const active=startMock(state.course,'coding-rehearsal',now);assert.equal(mockEvidence(state,active)[0].status,'unattempted');
  recordHelp(state,'python:stable-unique','solution',dayKey(now));recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'seen'},new Date(now.getTime()+1000));assert.equal(mockEvidence(state,active)[0].status,'assisted');
  assert.throws(()=>startMock(state.course,'backend-rehearsal'),/current rehearsal/);
});
test('mock clocks pause, serialize elapsed work, and do not count a closed tab',()=>{
  const state=freshTraining(),now=new Date(2026,9,28,12),active=startMock(state.course,'coding-rehearsal',now);active.runningSince=now.getTime();
  assert.equal(remainingMock(active,now.getTime()+65000),35*60-65);
  const snapshot=trainingSnapshot(state,now.getTime()+65000);assert.equal(snapshot.course.active.remaining,35*60-65);assert.equal(snapshot.course.active.runningSince,null);assert.equal(active.runningSince,now.getTime());
  const restored=validateTraining(JSON.parse(JSON.stringify(snapshot)));assert.equal(restored.course.active.runningSince,null);assert.equal(remainingMock(restored.course.active,now.getTime()+9999999),35*60-65);
  pauseMock(active,now.getTime()+66000);assert.equal(active.runningSince,null);assert.equal(active.remaining,35*60-66);
});
test('a saved unfinished rehearsal records gaps and freezes reflection and source versions',()=>{
  const state=freshTraining(),start=new Date(2026,9,28,12);const active=startMock(state.course,'coding-rehearsal',start);active.responses[0]='I clarified ordering.';
  recordAttempt(state,{type:'python',exercise:'stable-unique',passed:true,code:'checked'},new Date(start.getTime()+1000));
  const saved=finishMock(state,new Date(start.getTime()+2000));assert.equal(state.course.active,null);assert.equal(saved.evidence[0].status,'independent');assert.equal(saved.evidence[1].status,'unattempted');assert.ok(saved.evidence[0].contentRevision);assert.ok(saved.evidence[0].runtimeVersion);
  active.responses[0]='Changed later';assert.equal(saved.responses[0],'I clarified ordering.');
});
test('course backups allowlist fields, bound history, and preserve owner-independent learner data',()=>{
  const state=freshTraining();state.course.notes.javascript='<script>not executed</script>';state.course.selfChecks.javascript=['reference','unknown','reference'];state.course.read=['javascript','constructor'];state.course.token='never copy';
  const now=new Date(2026,9,28,12);startMock(state.course,'fullstack-rehearsal',now);finishMock(state,new Date(now.getTime()+1000));state.course.history=Array.from({length:40},()=>state.course.history[0]);
  const cleaned=validateTraining(JSON.parse(JSON.stringify(state)));assert.equal(cleaned.course.history.length,30);assert.deepEqual(cleaned.course.selfChecks.javascript,['reference']);assert.deepEqual(cleaned.course.read,['javascript']);assert.equal(cleaned.course.token,undefined);assert.equal(cleaned.course.notes.javascript,'<script>not executed</script>');
  assert.deepEqual(validateTraining({version:1}).course,freshCourse());assert.equal(validateCourse({version:1,active:{id:'unknown'}}).active,null);
});
test('course reflections, rehearsals and an active paused clock round-trip through complete account backups',()=>{
  const map=new Map(),storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)};
  const state=freshTraining();state.course.notes['problem-solving']='An invariant and counterexample.';startMock(state.course,'coding-rehearsal');finishMock(state);startMock(state.course,'fullstack-rehearsal');
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(trainingSnapshot(state)));const backup=captureProgress(storage);
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));restoreProgress(storage,backup,workspaceFingerprint(storage));const restored=JSON.parse(storage.getItem(WORKSPACE_KEYS.training));
  assert.equal(restored.course.notes['problem-solving'],'An invariant and counterexample.');assert.equal(restored.course.history.length,1);assert.equal(restored.course.active.id,'fullstack-rehearsal');assert.equal(restored.course.active.runningSince,null);
});
