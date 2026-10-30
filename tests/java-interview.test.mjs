import test from 'node:test';
import assert from 'node:assert/strict';
import {JAVA_INTERVIEW_UNITS,JAVA_MOCK_INTERVIEW} from '../src/java-interview-content.mjs';
import {JAVA_LAB_BY_ID} from '../src/java-content.mjs';
import {freshTraining,recordAttempt,recordHelp} from '../src/training-state.mjs';
import {startMock,mockEvidence,finishMock,validateCourse,courseEvidence} from '../src/interview-course-state.mjs';
import {courseView} from '../src/interview-course.mjs';
test('the Java interview option links real checked tasks and keeps teaching and self-assessment distinct',()=>{
  for(const unit of JAVA_INTERVIEW_UNITS){assert.equal(unit.sections.length,3);for(const task of unit.practice){assert.equal(task.type,'java');assert.ok(JAVA_LAB_BY_ID.has(task.id));assert.equal(task.href,'#java/'+task.id);}}
  const training=freshTraining();training.course.read=JAVA_INTERVIEW_UNITS.map(u=>u.id);training.course.notes['java-fluency']='I read this.';
  const evidence=courseEvidence(training);assert.equal(evidence.independent,0);assert.equal(evidence.units.find(u=>u.id==='java-fluency').read,true);
  const previous=globalThis.location;globalThis.location={hash:'#developer-path/course/java-problem-solving'};
  try{const view=courseView(training);assert.match(view,/Java<\/span>/);assert.match(view,/#java\/java-first-match/);}finally{globalThis.location=previous;}
});
test('a Java rehearsal excludes older checks, keeps help visible and freezes real runtime versions',()=>{
  const training=freshTraining();const first=JAVA_MOCK_INTERVIEW.tasks[0],second=JAVA_MOCK_INTERVIEW.tasks[1];
  recordAttempt(training,{type:'java',exercise:first.id,passed:true,code:'old'},new Date('2026-10-28T12:00:00Z'));
  const active=startMock(training.course,'java-rehearsal',new Date('2026-10-29T12:00:00Z'));
  assert.deepEqual(mockEvidence(training,active).map(e=>e.status),['unattempted','unattempted']);
  recordAttempt(training,{type:'java',exercise:first.id,passed:true,code:'current'},new Date('2026-10-29T12:01:00Z'));
  recordHelp(training,'java:'+second.id,'solution','2026-10-29');
  recordAttempt(training,{type:'java',exercise:second.id,passed:true,code:'assisted'},new Date('2026-10-29T12:02:00Z'));
  const saved=finishMock(training,new Date('2026-10-29T12:10:00Z'));
  // Continuing yesterday's answer remains continued unless a fresh attempt was prepared.
  assert.equal(saved.evidence[0].status,'assisted');assert.equal(saved.evidence[1].status,'assisted');
  assert.match(saved.evidence[1].runtimeVersion,/teavm/);assert.deepEqual(validateCourse(training.course).history[0].evidence,saved.evidence);
  training.attempts.push({type:'java',exercise:second.id,passed:false,at:'2026-10-29T12:11:00Z'});
  assert.equal(saved.evidence[1].status,'assisted');
});
