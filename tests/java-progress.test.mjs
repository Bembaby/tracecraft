import test from 'node:test';
import assert from 'node:assert/strict';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';
import {JAVA_LABS} from '../src/java-content.mjs';
import {freshTraining,recordAttempt,recordHelp,validateTraining} from '../src/training-state.mjs';
import {beginnerTaskEvidence,nextBeginnerStep} from '../src/beginner-state.mjs';
import {captureProgress,restoreProgress,workspaceFingerprint,WORKSPACE_KEYS} from '../src/progress-client.mjs';
import {validateJavaLabs} from '../scripts/validate-content.mjs';
import {beginnerView} from '../src/beginner.mjs';
import {learningPathView,practiceLibraryView} from '../src/learning-path.mjs';

test('Java input values validate, preserve empty text and survive complete backups',()=>{
  const state=freshTraining();state.javaInputs={'java-types':{text:'',emptyArgument:true},'java-arrays':{text:'4\n-2\n4',emptyArgument:false},unknown:{text:'ignored',emptyArgument:true}};
  const validated=validateTraining(state);assert.deepEqual(Object.keys(validated.javaInputs),['java-types','java-arrays']);assert.deepEqual(validated.javaInputs['java-types'],{text:'',emptyArgument:true});
  const storageData=new Map(),storage={getItem:k=>storageData.get(k)??null,setItem:(k,v)=>storageData.set(k,v),removeItem:k=>storageData.delete(k)};
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(validated));const snapshot=captureProgress(storage);storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));restoreProgress(storage,snapshot,workspaceFingerprint(storage));
  assert.deepEqual(validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training))).javaInputs,validated.javaInputs);
  state.javaInputs['java-types'].text='x'.repeat(12000);assert.equal(validateTraining(state).javaInputs['java-types'].text.length,10000);
});

test('Java beginner links use runnable tasks and keep recognition practice separate',()=>{
  for(const lesson of BEGINNER_LESSONS.filter(item=>item.track==='java')){
    assert.deepEqual(lesson.task,{type:'java',id:lesson.id});
    assert.equal(lesson.readingTask.type,'play');
    assert.ok(JAVA_LABS.some(item=>item.id===lesson.task.id));
  }
});

test('Java checks advance beginner suggestions without inventing read marks',()=>{
  const state=freshTraining(),lesson=BEGINNER_LESSONS.find(item=>item.id==='java-start');
  state.learning.lastLesson=lesson.id;
  state.learning.read.push(lesson.id);
  assert.equal(nextBeginnerStep(state,'java').href,'#java/java-start');
  recordHelp(state,'java:java-start','hint');
  recordAttempt(state,{type:'java',exercise:lesson.id,passed:true,code:JAVA_LABS[0].solution});
  const evidence=beginnerTaskEvidence(state,lesson);
  assert.equal(evidence.kind,'runtime');assert.equal(evidence.passed,true);assert.match(evidence.label,/with help/);
  assert.equal(nextBeginnerStep(state,'java').href,'#beginner/java-types');
  recordAttempt(state,{type:'java',exercise:lesson.id,passed:false,code:JAVA_LABS[0].bug});
  assert.equal(beginnerTaskEvidence(state,lesson).passed,false);
  assert.equal(nextBeginnerStep(state,'java').href,'#java/java-start');
});

test('complete progress backups preserve Java drafts, runtime versions, assistance and review',()=>{
  const state=freshTraining();
  state.drafts['java:java-start']=JAVA_LABS[0].solution;
  state.explanations['java:java-start']='The addition reads the old energy before storing the new value.';
  state.learning.lastLesson='java-start';
  const attempt=recordAttempt(state,{type:'java',exercise:'java-start',passed:true,code:JAVA_LABS[0].solution});
  assert.match(attempt.runtimeVersion,/teavm/);
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(state));
  const snapshot=captureProgress(storage);
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));
  restoreProgress(storage,snapshot,workspaceFingerprint(storage));
  const restored=validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training)));
  assert.deepEqual(restored.attempts,state.attempts);
  assert.deepEqual(restored.reviews,state.reviews);
  assert.equal(restored.drafts['java:java-start'],state.drafts['java:java-start']);
  assert.equal(restored.explanations['java:java-start'],state.explanations['java:java-start']);
  assert.equal(nextBeginnerStep(restored,'java').href,'#beginner/java-types');
});

test('Java lesson and library rendering explain browser practice without a setup prerequisite',()=>{
  const previous=globalThis.location;
  try{
    globalThis.location={hash:'#beginner/java-start'};
    const lesson=beginnerView(freshTraining());
    assert.match(lesson,/href="#java\/java-start"/);
    assert.match(lesson,/No JDK installation, terminal commands, or file download is required/);
    assert.doesNotMatch(lesson,/data-action="download-java"|does not compile submitted|save the first example as Main.java/);
    assert.match(lesson,/Run my code shows the output/);
    globalThis.location={hash:'#beginner/java-next-tools'};
    assert.match(beginnerView(freshTraining()),/The object form of int/);
    globalThis.location={hash:'#beginner/java'};
    assert.match(beginnerView(freshTraining()),/no JDK installation or file setup/);
    assert.match(practiceLibraryView(),/href="#java"/);
    const state=freshTraining();state.learning.lastLesson='java-types';
    assert.match(learningPathView(state),/no JDK installation or file setup/);
  }finally{globalThis.location=previous;}
});

test('Java author validation rejects missing input contracts and duplicate fixture names',()=>{
  assert.deepEqual(validateJavaLabs(),{java:10});
  const missing=structuredClone(JAVA_LABS);delete missing[0].contract.input;
  assert.throws(()=>validateJavaLabs(missing),/input contract/);
  const duplicate=structuredClone(JAVA_LABS);duplicate[0].fixtures[1].name=duplicate[0].fixtures[0].name;
  assert.throws(()=>validateJavaLabs(duplicate),/unique name/);
});
