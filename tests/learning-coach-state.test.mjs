import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshCoach,validateCoach,scenarioResponse,recordCoachHelp,recordScenario,retryScenario,
  diagnosticEvidence,skillEvidence,addMistake,coachReviews,localDay,
  coachTimerRemaining,pauseCoachTimer,coachSnapshot
} from '../src/learning-coach-state.mjs';
import {
  COACH_SKILLS,COACH_SKILL_BY_ID,COACH_TASK_BY_ID,SCENARIO_BY_ID,DIAGNOSTIC_STEPS
} from '../src/learning-coach-content.mjs';
import {freshTraining,validateTraining,trainingSnapshot} from '../src/training-state.mjs';
import {captureProgress,restoreProgress,workspaceFingerprint,WORKSPACE_KEYS} from '../src/progress-client.mjs';

const date=day=>new Date(2026,0,day,12,0,0);
const stamp=day=>date(day).toISOString();
const runtime=(id,day,{passed=true,help='independent',type=COACH_TASK_BY_ID.get(id).type}={})=>({type,exercise:id,at:stamp(day),passed,help,code:'original learner draft',contentRevision:'2026-10-29.2',runtimeVersion:'test-runtime'});
const memoryStorage=()=>{const entries=new Map();return {getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,String(value)),removeItem:key=>entries.delete(key)};};
const scenarioId='flow-signup';

test('documentation use remains a separate fact after a stronger scaffold or solution',()=>{
  const coach=freshCoach();coach.mode='practice';const scenario=SCENARIO_BY_ID.get(scenarioId),response=scenarioResponse(coach,scenarioId);
  response.selected=scenario.options.find(o=>o.correct).id;recordCoachHelp(coach,scenarioId,4);recordCoachHelp(coach,scenarioId,'documentation');
  const attempt=recordScenario(coach,scenarioId,date(1),'documentation:after-solution');
  assert.equal(attempt.help,'solution');assert.equal(attempt.documentationUsed,true);assert.equal(validateCoach(coach).attempts[0].documentationUsed,true);
});
const scenario=()=>SCENARIO_BY_ID.get(scenarioId);
const notebookEntry=(overrides={})=>({task:'fluency-dict-put',skill:'python-dictionary-syntax',tag:'syntax',assumption:'I used the quoted variable name as a key.',correction:'Square brackets evaluate the key variable.',example:'result[user_id] = minutes',variation:'Try an empty key.',assistance:'nudge',attemptAt:stamp(10),...overrides});

test('old training backups gain an empty private coach while preserving established work',()=>{
  const old=freshTraining();delete old.coach;
  old.drafts['python:hello-output']='print("kept")';old.learning.notes['what-is-code']='My existing note.';
  old.attempts.push(runtime('fluency-dict-put',10));
  const migrated=validateTraining(old);
  assert.equal(migrated.drafts['python:hello-output'],old.drafts['python:hello-output']);
  assert.equal(migrated.learning.notes['what-is-code'],'My existing note.');
  assert.deepEqual(migrated.attempts,old.attempts);
  assert.equal(migrated.coach.profile.roles,'');assert.equal(migrated.coach.profile.tools,'');assert.equal(migrated.coach.profile.project,'');
  assert.equal(migrated.coach.attempts.length,0);assert.equal(migrated.coach.notebook.length,0);
  for(const skill of COACH_SKILLS)assert.equal(skillEvidence(migrated,skill.id).state,skill.tasks.includes('fluency-dict-put')?'Solves independently':'Not assessed');
});

test('coach import accepts only bounded known fields and never prototype or credential fields',()=>{
  const raw=JSON.parse('{"version":1,"profile":{"roles":"","tools":"","project":"","password":"discard","__proto__":{"polluted":true}},"responses":{"__proto__":{"polluted":true}},"reasons":{"constructor":"user-goal"},"sessionCookie":"discard","apiKey":"discard"}');
  raw.profile.roles='r'.repeat(250);raw.profile.tools='t'.repeat(350);raw.profile.project='p'.repeat(1300);
  raw.retention={variations:0,sessions:99,delayDays:-5,reviewCap:100};raw.session=999;
  const item=scenario();const maxRubric=item.rubric.technical.length+item.rubric.clarity.length;
  raw.responses[scenarioId]={text:'x'.repeat(2500),selected:'not-an-option',help:'invented',requested:[0,0,4,5,-1],observations:[item.observations[0].id,item.observations[0].id,'unknown'],rubric:[0,0,maxRubric-1,maxRubric,19,19],confidence:99,nonce:'bad nonce',submitted:'yes'};
  raw.attempts=[{id:'record:1',exercise:scenarioId,version:item.version,selected:item.options[0].id,at:stamp(10),text:'x'.repeat(2500),observations:Array(500).fill(item.observations[0].id),help:'invented',correct:true}];
  const clean=validateCoach(raw);
  assert.equal(clean.profile.roles.length,200);assert.equal(clean.profile.tools.length,300);assert.equal(clean.profile.project.length,1200);
  assert.equal(clean.profile.password,undefined);assert.equal(clean.sessionCookie,undefined);assert.equal(clean.apiKey,undefined);assert.equal({}.polluted,undefined);
  assert.equal(Object.hasOwn(clean.responses,'__proto__'),false);assert.equal(Object.hasOwn(clean.reasons,'constructor'),false);
  assert.deepEqual(clean.retention,{variations:2,sessions:5,delayDays:1,reviewCap:5});assert.equal(clean.session,14);
  const response=clean.responses[scenarioId];assert.equal(response.text.length,2000);assert.equal(response.selected,'');assert.equal(response.nonce,'');assert.equal(response.confidence,4);assert.equal(response.submitted,false);
  assert.deepEqual(response.requested,[0,4]);assert.equal(response.observations.length,1);
  assert.deepEqual(response.rubric,[0,maxRubric-1]);
  assert.equal(clean.attempts[0].observations.length,1);assert.equal(clean.attempts[0].text.length,2000);assert.equal(clean.attempts[0].help,'solution');
});

test('coach validation and complete backups detach private records and preserve their evidence types',()=>{
  const state=freshTraining();state.coach.profile.project='Private project notes for this learner.';
  state.coach.mode='practice';const response=scenarioResponse(state.coach,scenarioId);
  response.selected=scenario().options.find(option=>option.correct).id;response.text='My explanation needs self-review.';
  recordScenario(state.coach,scenarioId,date(10),'scenario:backup');
  addMistake(state.coach,notebookEntry(),date(10),'mistake:backup');
  state.coach.diagnostic.startedAt=stamp(9);state.coach.diagnostic.steps.dictionary={status:'skipped',note:'Return later.',at:stamp(10)};
  const storage=memoryStorage();storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(state));
  const snapshot=captureProgress(storage);storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));
  restoreProgress(storage,snapshot,workspaceFingerprint(storage));
  const restored=validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training)));
  assert.deepEqual(restored.coach,state.coach);assert.equal(restored.coach.attempts[0].kind,'authored-choice');
  restored.coach.profile.project='Changed after restore';restored.coach.responses[scenarioId].text='Changed text';restored.coach.notebook[0].correction='Changed correction';
  assert.equal(state.coach.profile.project,'Private project notes for this learner.');assert.equal(snapshot.workspaces.training.coach.profile.project,'Private project notes for this learner.');
  assert.equal(state.coach.responses[scenarioId].text,'My explanation needs self-review.');assert.equal(state.coach.notebook[0].correction,notebookEntry().correction);
});

test('all six diagnostic parts ignore old evidence and skipped parts remain explicitly unassessed',()=>{
  assert.equal(DIAGNOSTIC_STEPS.length,6);
  for(const step of DIAGNOSTIC_STEPS){
    const state=freshTraining(),item=step.kind==='runtime'?step.task():SCENARIO_BY_ID.get(step.scenario);
    if(step.kind==='runtime')state.attempts.push(runtime(item.id,9));
    else state.coach.attempts.push({id:'old:'+item.id,exercise:item.id,version:item.version,selected:item.options.find(o=>o.correct).id,at:stamp(9),correct:true,help:'independent',kind:'authored-choice'});
    assert.equal(diagnosticEvidence(state,step).state,'Not assessed');
    state.coach.diagnostic.startedAt=stamp(10);state.coach.diagnostic.steps[step.id]={status:'attempted',note:'I opened it.',at:stamp(10)};
    assert.equal(diagnosticEvidence(state,step).state,'Not assessed','opening or marking attempted cannot create practice evidence');
    if(step.kind==='runtime')state.attempts.push(runtime(item.id,11));
    else state.coach.attempts.push({id:'new:'+item.id,exercise:item.id,version:item.version,selected:item.options.find(o=>o.correct).id,at:stamp(11),correct:true,help:'independent',kind:'authored-choice'});
    const evidence=diagnosticEvidence(state,step);assert.equal(evidence.passed,true);assert.equal(evidence.kind,step.kind);assert.match(evidence.state,new RegExp(step.kind==='runtime'?'runtime check':'scenario choice'));
    state.coach.diagnostic.steps[step.id].status='skipped';assert.equal(diagnosticEvidence(state,step).state,'Not assessed');
  }
});

test('scenario results are authored choices, idempotent per submission, and keep assistance after retry',()=>{
  const c=freshCoach();c.mode='practice';const r=scenarioResponse(c,scenarioId);
  assert.throws(()=>recordScenario(c,scenarioId,date(10),'choice:1'),/Choose an answer/);
  r.selected=scenario().options.find(o=>o.correct).id;r.text='This text is not automatically graded.';
  recordCoachHelp(c,scenarioId,4);recordCoachHelp(c,scenarioId,0);recordCoachHelp(c,scenarioId,'documentation');
  const first=recordScenario(c,scenarioId,date(10),'choice:1');
  assert.equal(first.help,'solution');assert.equal(first.kind,'authored-choice');assert.equal(first.correct,true);
  assert.equal(recordScenario(c,scenarioId,date(11),'choice:2'),first);assert.equal(c.attempts.length,1);
  retryScenario(c,scenarioId);assert.equal(r.selected,'');assert.equal(r.text,'');assert.equal(r.help,'solution');
  r.selected=scenario().options.find(o=>!o.correct).id;const second=recordScenario(c,scenarioId,date(11),'choice:2');
  assert.equal(second.correct,false);assert.equal(c.attempts.length,2);assert.equal(first.correct,true);
});

test('imported scenario correctness is recomputed and old versions cannot claim a current pass',()=>{
  const c=freshCoach(),item=scenario(),wrong=item.options.find(o=>!o.correct),right=item.options.find(o=>o.correct);
  c.attempts=[{id:'choice:wrong',exercise:item.id,version:item.version,selected:wrong.id,correct:true,at:stamp(10),help:'independent'},{id:'choice:old',exercise:item.id,version:'old-version',selected:right.id,correct:true,at:stamp(11),help:'independent'}];
  const clean=validateCoach(c);assert.equal(clean.attempts[0].correct,false);assert.equal(clean.attempts[1].correct,null);
  const state=freshTraining();state.coach=clean;assert.equal(skillEvidence(state,'request-flow').retained,false);
});

test('skill retention requires different tasks, different local days and the configured delay',()=>{
  const state=freshTraining(),skill=COACH_SKILL_BY_ID.get('python-dictionary-syntax'),[first,second]=skill.tasks;
  state.attempts=[runtime(first,10),runtime(first,11),runtime(first,12)];
  assert.equal(skillEvidence(state,skill.id).retained,false);assert.equal(skillEvidence(state,skill.id).variations,1);
  state.attempts=[runtime(first,10),runtime(second,10)];assert.equal(skillEvidence(state,skill.id).retained,false);
  state.attempts=[runtime(first,10),runtime(second,11)];let evidence=skillEvidence(state,skill.id);
  assert.equal(evidence.retained,true);assert.equal(evidence.kind,'runtime');assert.equal(evidence.state,'Retained after review');
  state.coach.retention.delayDays=3;assert.equal(skillEvidence(state,skill.id).retained,false);
  state.attempts.push(runtime(second,13));assert.equal(skillEvidence(state,skill.id).retained,true);
  assert.equal(localDay(date(10)),'2026-01-10');
});

test('a latest failure or assisted result overrides earlier retained evidence without erasing history',()=>{
  const state=freshTraining(),skill=COACH_SKILL_BY_ID.get('python-dictionary-syntax'),[first,second]=skill.tasks;
  state.attempts=[runtime(first,10),runtime(second,11),runtime(second,12,{passed:false})];
  let evidence=skillEvidence(state,skill.id);assert.equal(evidence.retained,false);assert.equal(evidence.state,'Learning');assert.equal(evidence.variations,2);
  state.attempts.push(runtime(second,13,{help:'hint'}));evidence=skillEvidence(state,skill.id);
  assert.equal(evidence.retained,false);assert.equal(evidence.state,'Solves with help');assert.equal(evidence.evidence.length,4);
  state.attempts.push(runtime(first,14,{type:'sql'}));assert.equal(skillEvidence(state,skill.id).latest.at,stamp(13),'wrong runtime type cannot count for a Python skill');
});

test('scenario-choice skill evidence stays distinct from runtime evidence and empty placement areas',()=>{
  const state=freshTraining();state.coach.mode='practice';
  const r=scenarioResponse(state.coach,scenarioId);r.selected=scenario().options.find(o=>o.correct).id;
  recordScenario(state.coach,scenarioId,date(10),'choice:independent');
  const evidence=skillEvidence(state,'request-flow');assert.equal(evidence.kind,'authored-choice');assert.equal(evidence.state,'Solves independently');assert.equal(evidence.retained,false);
  assert.equal(skillEvidence(state,'python-dictionary-syntax').state,'Not assessed');
  assert.equal(skillEvidence(state,'invented-skill'),null);
});

test('review suggestions respect the cap and use a real different task covering the selected notebook skill',()=>{
  const state=freshTraining();state.coach.retention.reviewCap=1;
  addMistake(state.coach,notebookEntry({task:'fitness-atomic-workout',skill:'sql-constraints',tag:'missing constraint'}),date(10),'mistake:constraint');
  for(const [key]of [...COACH_TASK_BY_ID].slice(0,8)){const task=COACH_TASK_BY_ID.get(key);state.reviews[task.type+':'+key]={due:'2026-01-01',stage:0};}
  const queue=coachReviews(state,'2026-01-20');assert.equal(queue.length,1);assert.equal(queue[0].task,'fitness-atomic-workout');
  assert.ok(queue[0].variation);assert.notEqual(queue[0].variation,queue[0].task);
  const variation=COACH_TASK_BY_ID.get(queue[0].variation);assert.ok(variation);assert.ok(variation.skills.includes('sql-constraints'));assert.equal(queue[0].href,variation.href);
  state.coach.retention.reviewCap=5;assert.ok(coachReviews(state,'2026-01-20').length<=5);
});

test('editing a dismissed correction preserves its review decision and does not create skill evidence',()=>{
  const state=freshTraining(),c=state.coach;
  const note=addMistake(c,notebookEntry(),date(10),'mistake:editable');note.status='dismissed';const due=note.due;
  const edited=addMistake(c,notebookEntry({correction:'Use the variable value as the dictionary key.'}),date(15),'mistake:editable');
  assert.equal(c.notebook.length,1);assert.equal(edited.at,stamp(10));assert.equal(edited.status,'dismissed');assert.equal(edited.due,due);
  assert.equal(coachReviews(state,'2026-01-20').some(item=>item.id===note.id),false);
  assert.equal(skillEvidence(state,'python-dictionary-syntax').state,'Not assessed');
  edited.status='open';assert.equal(coachReviews(state,'2026-01-20').some(item=>item.id===note.id),true);
});

test('timer pause and snapshots never create assessed evidence or continue running after restore',()=>{
  const state=freshTraining(),c=state.coach;c.timer={minutes:30,remaining:600,runningSince:1000};
  assert.equal(coachTimerRemaining(c.timer,61000),540);assert.equal(coachTimerRemaining(c.timer,0),600);
  const snapshot=trainingSnapshot(state,61000);assert.equal(snapshot.coach.timer.remaining,540);assert.equal(snapshot.coach.timer.runningSince,null);assert.equal(c.timer.runningSince,1000);
  pauseCoachTimer(c,61000);assert.equal(c.timer.remaining,540);pauseCoachTimer(c,121000);assert.equal(c.timer.remaining,540);
  assert.equal(validateTraining(snapshot).coach.timer.runningSince,null);
  assert.equal(c.attempts.length,0);assert.equal(state.attempts.length,0);
  for(const step of DIAGNOSTIC_STEPS)assert.equal(diagnosticEvidence(state,step).state,'Not assessed');
});

test('held coach snapshots are detached from later profile, response and notebook edits',()=>{
  const c=freshCoach();c.profile.project='Original private project note.';
  scenarioResponse(c,scenarioId).text='Original explanation.';addMistake(c,notebookEntry(),date(10),'mistake:snapshot');
  const snapshot=coachSnapshot(c,Date.now());
  c.profile.project='Later edit.';c.responses[scenarioId].text='Later response.';c.notebook[0].correction='Later correction.';
  assert.equal(snapshot.profile.project,'Original private project note.');assert.equal(snapshot.responses[scenarioId].text,'Original explanation.');assert.equal(snapshot.notebook[0].correction,notebookEntry().correction);
});
