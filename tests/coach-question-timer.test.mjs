import test from 'node:test';
import assert from 'node:assert/strict';
import {freshCoach,validateCoach,scenarioResponse,QUESTION_BUDGETS,questionRemaining,pauseQuestionTimer,pauseQuestionTimers,coachSnapshot,diagnosticEvidence} from '../src/learning-coach-state.mjs';
import {freshTraining,validateTraining,trainingSnapshot} from '../src/training-state.mjs';
import {DIAGNOSTIC_STEPS,COACH_TASK_BY_ID} from '../src/learning-coach-content.mjs';
import {coachView,mountCoach,unmountCoach,initializeCoach} from '../src/learning-coach.mjs';

test('each response starts untimed and keeps an independent optional clock',()=>{
  const coach=freshCoach(),first=scenarioResponse(coach,'project-workflow'),second=scenarioResponse(coach,'project-decision');
  assert.deepEqual(QUESTION_BUDGETS,[0,30,120,300]);
  assert.deepEqual(first.timer,{budget:0,remaining:0,runningSince:null});
  first.timer.budget=30;first.timer.remaining=30;
  assert.deepEqual(second.timer,{budget:0,remaining:0,runningSince:null});
  assert.equal(coach.timer.minutes,120);
});

test('question remaining time accounts for elapsed seconds without mutating state or going negative',()=>{
  const timer={budget:30,remaining:30,runningSince:1000},before=structuredClone(timer);
  assert.equal(questionRemaining(timer,11000),20);
  assert.equal(questionRemaining(timer,11500),19.5);
  assert.equal(questionRemaining(timer,0),30);
  assert.equal(questionRemaining(timer,999999),0);
  assert.equal(questionRemaining({budget:0,remaining:30,runningSince:0},2000),0);
  assert.equal(questionRemaining({budget:999,remaining:999,runningSince:0},2000),0);
  assert.equal(questionRemaining(null,2000),0);
  assert.deepEqual(timer,before);
});

test('pausing freezes all response clocks without altering answers or creating attempts',()=>{
  const coach=freshCoach(),first=scenarioResponse(coach,'project-workflow'),second=scenarioResponse(coach,'project-decision');
  first.text='Corrected before checking.';first.timer={budget:30,remaining:30,runningSince:1000};
  second.timer={budget:120,remaining:100,runningSince:1000};
  assert.equal(pauseQuestionTimer(first,11000),true);
  assert.equal(questionRemaining(first.timer,999999),20);
  assert.equal(pauseQuestionTimer(first,21000),false);
  assert.equal(pauseQuestionTimers(coach,21000),true);
  assert.equal(second.timer.remaining,80);
  assert.equal(pauseQuestionTimers(coach,999999),false);
  assert.equal(first.text,'Corrected before checking.');assert.equal(first.submitted,false);
  assert.equal(coach.attempts.length,0);
});

test('question clock import bounds budgets and remaining time and always restores paused',()=>{
  for(const budget of QUESTION_BUDGETS){
    const coach=freshCoach();scenarioResponse(coach,'project-workflow').timer={budget,remaining:budget+100,runningSince:1000,token:'discard'};
    const clean=validateCoach(coach).responses['project-workflow'].timer;
    assert.deepEqual(clean,{budget,remaining:budget,runningSince:null});
  }
  const coach=freshCoach(),response=scenarioResponse(coach,'project-workflow');
  response.timer={budget:5,remaining:100,runningSince:1000};
  assert.deepEqual(validateCoach(coach).responses['project-workflow'].timer,{budget:0,remaining:0,runningSince:null});
  response.timer={budget:30,remaining:-20,runningSince:1000};
  assert.equal(validateCoach(coach).responses['project-workflow'].timer.remaining,0);
  delete response.timer;
  assert.deepEqual(validateCoach(coach).responses['project-workflow'].timer,{budget:0,remaining:0,runningSince:null});
});

test('snapshots compute every elapsed clock and export paused copies without changing live state or evidence',()=>{
  const state=freshTraining(),coach=state.coach,first=scenarioResponse(coach,'project-workflow'),second=scenarioResponse(coach,'project-decision');
  first.timer={budget:30,remaining:30,runningSince:1000};first.text='My corrected draft.';
  second.timer={budget:300,remaining:300,runningSince:1000};
  coach.timer={minutes:30,remaining:600,runningSince:1000};
  const snapshot=trainingSnapshot(state,61000);
  assert.deepEqual(snapshot.coach.responses['project-workflow'].timer,{budget:30,remaining:0,runningSince:null});
  assert.deepEqual(snapshot.coach.responses['project-decision'].timer,{budget:300,remaining:240,runningSince:null});
  assert.deepEqual(snapshot.coach.timer,{minutes:30,remaining:540,runningSince:null});
  assert.equal(first.timer.runningSince,1000);assert.equal(second.timer.remaining,300);
  const restored=validateTraining(JSON.parse(JSON.stringify(snapshot)));
  assert.equal(questionRemaining(restored.coach.responses['project-decision'].timer,99999999),240);
  assert.equal(restored.coach.responses['project-workflow'].submitted,false);
  assert.equal(restored.coach.responses['project-workflow'].text,'My corrected draft.');
  assert.equal(restored.coach.attempts.length,0);assert.equal(restored.attempts.length,0);
  for(const step of DIAGNOSTIC_STEPS)assert.equal(diagnosticEvidence(restored,step).state,'Not assessed');
  first.text='Later draft.';second.timer.remaining=1;
  assert.equal(snapshot.coach.responses['project-workflow'].text,'My corrected draft.');
  assert.equal(snapshot.coach.responses['project-decision'].timer.remaining,240);
  assert.equal(coachSnapshot(coach,61000).responses['project-workflow'].timer.runningSince,null);
});

test('only explanation questions and interview mode offer the optional clock and keep text editable',()=>{
  const previous=globalThis.location;
  try{
    const state=freshTraining();globalThis.location={hash:'#coach/question/project-workflow'};
    let view=coachView(state);
    assert.match(view,/Untimed \(default\)/);assert.match(view,/>30 seconds</);assert.match(view,/>2 minutes</);assert.match(view,/>5 minutes</);
    assert.match(view,/The clock never grades or submits your answer/);
    assert.match(view,/Accent, pauses and speaking speed carry no penalty/);
    assert.match(view,/<textarea id="coach-response"[^>]*>/);
    assert.doesNotMatch(view,/<textarea id="coach-response"[^>]*(?:disabled|readonly)/);
    globalThis.location.hash='#coach/question/flow-ownership';
    assert.doesNotMatch(coachView(state),/id="coach-question-budget"/);
    state.coach.mode='interview';view=coachView(state);
    assert.match(view,/id="coach-question-budget"/);
    assert.match(view,/data-coach="question-start"/);assert.match(view,/data-coach="question-pause"/);assert.match(view,/data-coach="question-reset"/);
  }finally{globalThis.location=previous;}
});

test('the existing single interval updates question clocks and pauses on visibility, route, unload and unmount',()=>{
  const previous={location:globalThis.location,document:globalThis.document,window:globalThis.window,setInterval:globalThis.setInterval,now:Date.now};
  const documentEvents=new Map(),windowEvents=new Map(),events=new Map(),display={textContent:''},status={textContent:''},start={disabled:false},pause={disabled:true};
  const state=freshTraining();let now=1000,interval,timerCount=0,saves=0,redraws=0;
  const response=()=>scenarioResponse(state.coach,'project-workflow');
  try{
    globalThis.location={hash:'#coach/question/project-workflow'};
    globalThis.document={hidden:false,body:{classList:{contains:()=>false}},addEventListener:(name,callback)=>documentEvents.set(name,callback)};
    globalThis.window={addEventListener:(name,callback)=>windowEvents.set(name,callback)};
    globalThis.setInterval=(callback,milliseconds)=>{timerCount++;assert.equal(milliseconds,1000);interval=callback;return 1;};
    Date.now=()=>now;
    const element={
      addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name),
      querySelector:selector=>{
        if(selector==='[data-coach-root]'){redraws++;return null;}
        if(selector==='[data-question]')return {dataset:{question:globalThis.location.hash.split('/')[2]}};
        if(selector==='[data-coach-question-clock]')return display;
        if(selector==='[data-coach-question-clock-status]')return status;
        if(selector==='[data-coach="question-start"]')return start;
        if(selector==='[data-coach="question-pause"]')return pause;
        return null;
      }
    };
    mountCoach(element,state,()=>{saves++;return true;},()=>{});
    initializeCoach(()=>state,()=>{saves++;});
    const click=id=>events.get('click')({target:{closest:()=>({dataset:{coach:id}})}});
    events.get('change')({target:{id:'coach-question-budget',value:'30',dataset:{}}});
    events.get('input')({target:{id:'coach-response',value:'My corrected transcript before feedback.',dataset:{}}});
    assert.equal(response().timer.runningSince,null);click('question-start');
    now=11000;interval();assert.equal(display.textContent,'0:20');
    assert.equal(response().text,'My corrected transcript before feedback.');assert.equal(response().submitted,false);
    click('question-pause');assert.equal(response().timer.remaining,20);
    now=21000;interval();assert.equal(questionRemaining(response().timer,now),20);
    click('question-start');now=26000;globalThis.document.hidden=true;documentEvents.get('visibilitychange')();
    assert.deepEqual(response().timer,{budget:30,remaining:15,runningSince:null});
    assert.equal(start.disabled,false);assert.equal(pause.disabled,true);
    globalThis.document.hidden=false;now=31000;click('question-start');now=36000;
    globalThis.location.hash='#coach/question/flow-ownership';windowEvents.get('hashchange')();
    assert.deepEqual(response().timer,{budget:30,remaining:10,runningSince:null});
    globalThis.location.hash='#coach/question/project-workflow';click('question-reset');assert.equal(response().timer.remaining,30);
    now=40000;click('question-start');now=71000;const beforeExpiry=redraws;interval();
    assert.equal(redraws,beforeExpiry,'expiry must not replace the textarea or move focus');
    assert.deepEqual(response().timer,{budget:30,remaining:0,runningSince:null});
    assert.equal(status.textContent,'Suggested time elapsed. Continue when ready.');
    assert.match(coachView(state),/Suggested time elapsed\. Continue when ready\./);
    assert.equal(state.coach.attempts.length,0);assert.equal(response().submitted,false);
    state.coach.timer={minutes:30,remaining:600,runningSince:71000};click('question-reset');click('question-start');
    now=81000;interval();assert.equal(display.textContent,'0:20');
    windowEvents.get('hashchange')();assert.equal(state.coach.timer.runningSince,71000);
    click('question-start');now=91000;windowEvents.get('pagehide')();
    assert.deepEqual(response().timer,{budget:30,remaining:10,runningSince:null});
    assert.deepEqual(state.coach.timer,{minutes:30,remaining:580,runningSince:null});
    click('question-start');now=96000;unmountCoach();
    assert.deepEqual(response().timer,{budget:30,remaining:5,runningSince:null});
    assert.equal(timerCount,1);assert.ok(saves>0);assert.equal(state.coach.attempts.length,0);
  }finally{
    unmountCoach();Date.now=previous.now;
    for(const key of ['location','document','window','setInterval'])globalThis[key]=previous[key];
  }
});

test('the daily objective follows adaptive evidence while retaining the selectable opening sequence',()=>{
  const previous=globalThis.location;
  try{
    globalThis.location={hash:'#coach/daily'};const state=freshTraining();
    let view=coachView(state);assert.ok(view.includes('href="#coach/diagnostic/'+DIAGNOSTIC_STEPS[0].id+'"'));
    for(const step of DIAGNOSTIC_STEPS)state.coach.diagnostic.steps[step.id]={status:'skipped',note:'',at:null};
    state.attempts.push({type:'python',exercise:'fluency-dict-put',passed:false,at:'2026-10-29T12:00:00.000Z'});
    const task=COACH_TASK_BY_ID.get('fluency-dict-put');view=coachView(state);
    const objective=view.split('<section class="coach-objective">')[1].split('</section>')[0];
    assert.ok(objective.includes(task.title));assert.ok(objective.includes('href="'+task.href+'"'));
    assert.match(objective,/latest recorded check/);assert.match(objective,/Start this practice/);
    assert.match(view,/id="coach-session"/);assert.match(view,/Your 120-minute session/);
  }finally{globalThis.location=previous;}
});

test('diagnostic deep links select the requested part once and opening a task begins neutral practice',()=>{
  const previous=globalThis.location,events=new Map(),state=freshTraining();let saves=0;
  const element={addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name),querySelector:()=>null};
  try{
    globalThis.location={hash:'#coach/diagnostic/'+DIAGNOSTIC_STEPS[4].id};
    mountCoach(element,state,()=>{saves++;return true;},()=>{});
    assert.equal(state.coach.diagnostic.index,4);const startedAt=state.coach.diagnostic.startedAt;
    assert.ok(startedAt);assert.match(coachView(state),/data-coach="diagnostic-open"/);
    let prevented=false;
    events.get('click')({target:{closest:()=>({dataset:{coach:'diagnostic-open'}})},preventDefault:()=>{prevented=true;}});
    assert.equal(state.coach.mode,'practice');assert.equal(prevented,false);assert.equal(state.coach.attempts.length,0);
    unmountCoach();globalThis.location.hash='#coach/diagnostic/'+DIAGNOSTIC_STEPS[2].id;
    mountCoach(element,state,()=>{saves++;return true;},()=>{});
    assert.equal(state.coach.diagnostic.index,2);assert.equal(state.coach.diagnostic.startedAt,startedAt);
    assert.ok(saves>=2);
  }finally{unmountCoach();globalThis.location=previous;}
});

test('notebook assistance drafts survive both input and change saving through validation',()=>{
  const previous=globalThis.location,events=new Map(),state=freshTraining(),task='fluency-dict-put';
  const element={addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:name=>events.delete(name),querySelector:selector=>selector==='#notebook-task'?{value:task}:null};
  try{
    globalThis.location={hash:'#coach/notebook/'+task};mountCoach(element,state,()=>true,()=>{});
    for(const [name,assistance] of [['input','nudge'],['change','documentation']]){
      events.get(name)({target:{id:'notebook-help',value:assistance,dataset:{}}});
      const draft=validateCoach(state.coach).notebookDrafts[task];
      assert.equal(draft.assistance,assistance);assert.equal(draft.help,undefined);
    }
  }finally{unmountCoach();globalThis.location=previous;}
});
