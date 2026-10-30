import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTraining,recordAssistance,recordAttempt,draftAssistance} from '../src/training-state.mjs';
import {addMistake,scenarioResponse,validateCoach} from '../src/learning-coach-state.mjs';
import {SCENARIO_BY_ID} from '../src/learning-coach-content.mjs';
import {coachView,mountCoach,unmountCoach} from '../src/learning-coach.mjs';

function harness(hash,state=freshTraining(),save=()=>true){
  const previous=globalThis.location,events=new Map();let rendered='';
  globalThis.location={hash};
  const holder={set outerHTML(value){rendered=value;}};
  const element={addEventListener:(id,callback)=>events.set(id,callback),removeEventListener:id=>events.delete(id),querySelector:selector=>{
    if(selector==='[data-coach-root]')return holder;
    if(selector==='#notebook-task')return {value:state.coach.notebookTask||globalThis.location.hash.split('/')[2]};
    if(selector==='[data-question]'&&/\/(question|walking)\//.test(globalThis.location.hash))return {dataset:{question:globalThis.location.hash.split('/')[2]}};
    return null;
  }};
  mountCoach(element,state,save,()=>{});
  return {state,html:()=>rendered,click:(id,extra={})=>events.get('click')({target:{closest:()=>({dataset:{coach:id,...extra}})}}),change:target=>events.get('change')({target:{dataset:{},...target}}),close:()=>{unmountCoach();globalThis.location=previous;}};
}

test('Cancel editing exits notebook edit mode without changing the saved correction',()=>{
  const state=freshTraining(),task='fluency-dict-put';
  addMistake(state.coach,{task,skill:'python-dictionary-syntax',tag:'syntax',assumption:'I quoted the variable name.',correction:'Use the value as the key.',example:'result[user_id] = 1',variation:'Try another key.',assistance:'independent'},new Date('2026-10-29T12:00:00Z'),'note:cancel');
  const saved=structuredClone(state.coach.notebook[0]),ui=harness('#coach/notebook/'+task,state);
  try{
    ui.click('note-edit',{id:'note:cancel'});assert.match(ui.html(),/Save edited correction/);
    ui.click('note-cancel');assert.doesNotMatch(ui.html(),/Save edited correction/);assert.doesNotMatch(ui.html(),/Cancel editing/);
    assert.deepEqual(state.coach.notebook[0],saved);
  }finally{ui.close();}
});

test('an explicitly unclassified notebook draft stays unclassified through restore and redraw',()=>{
  const state=freshTraining(),task='fluency-dict-put';
  addMistake(state.coach,{task,skill:'python-dictionary-syntax',tag:'syntax',assumption:'I quoted the variable name.',correction:'Use the value as the key.',assistance:'independent'},new Date('2026-10-29T12:00:00Z'),'note:classification');
  const ui=harness('#coach/notebook/'+task,state);
  try{
    ui.click('note-edit',{id:'note:classification'});ui.change({id:'notebook-skill',value:''});
    state.coach=validateCoach(state.coach);
    assert.equal(state.coach.notebookDrafts[task].skill,'');
    assert.doesNotMatch(coachView(state),/<option value="python-dictionary-syntax" selected>/);
  }finally{ui.close();}
});

test('viewing Learn teaching remains recorded after switching to Practice before checking',()=>{
  const id='flow-signup',state=freshTraining(),ui=harness('#coach/question/'+id,state);
  try{
    assert.match(ui.html(),/Learn mode supplies teaching/);
    ui.change({id:'coach-mode',value:'practice'});
    scenarioResponse(state.coach,id).selected=SCENARIO_BY_ID.get(id).options.find(o=>o.correct).id;
    ui.click('answer');
    assert.notEqual(state.coach.attempts.at(-1).help,'independent');
    assert.equal(state.coach.attempts.at(-1).mode,'practice');
  }finally{ui.close();}
});

test('requesting a smaller runtime hint or documentation does not erase a disclosed scaffold',()=>{
  const state=freshTraining(),key='python:fluency-dict-put',now=new Date('2026-10-29T12:00:00Z');
  recordAssistance(state,key,'scaffold','2026-10-29');recordAssistance(state,key,'nudge','2026-10-29');
  recordAssistance(state,key,'documentation','2026-10-29');
  assert.equal(draftAssistance(state,key,'2026-10-29'),'scaffold');
  const attempt=recordAttempt(state,{type:'python',exercise:'fluency-dict-put',passed:true,code:'a learner answer'},now);
  assert.equal(attempt.assistance,'scaffold');assert.equal(attempt.documentationUsed,true);assert.notEqual(attempt.help,'independent');
});

test('a failed save does not regain a success status when the coach redraws',()=>{
  const ui=harness('#coach/question/flow-signup',freshTraining(),()=>false);
  try{
    ui.change({id:'coach-mode',value:'practice'});
    assert.match(ui.html(),/Browser saving failed/);
    assert.doesNotMatch(ui.html(),/<p data-coach-save role="status">Saved on this device/);
  }finally{ui.close();}
});
