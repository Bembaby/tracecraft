import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';
import {freshLearning,validateLearning,beginnerTaskEvidence,nextBeginnerStep} from '../src/beginner-state.mjs';
import {freshTraining,validateTraining} from '../src/training-state.mjs';
import {beginnerView} from '../src/beginner.mjs';
import {captureProgress,restoreProgress,workspaceFingerprint,WORKSPACE_KEYS} from '../src/progress-client.mjs';

test('prediction journals migrate old learning data without changing its read marks or notes',()=>{
  const old={version:1,lastLesson:'what-is-code',read:['what-is-code'],notes:{'what-is-code':'Output appears below the code.'}};
  const migrated=validateLearning(old);
  assert.deepEqual(migrated,{...old,predictions:{}});
  assert.deepEqual(freshLearning().predictions,{});
  assert.deepEqual(validateLearning(null).predictions,{});
});

test('prediction journals accept only known lesson IDs and bounded text',()=>{
  const state=validateLearning({version:1,predictions:{'what-is-code':'x'.repeat(1600),'why-sql':'A list of rows.','fake-lesson':'bad',constructor:'bad','java-start':42}});
  assert.equal(state.predictions['what-is-code'].length,1500);
  assert.equal(state.predictions['why-sql'],'A list of rows.');
  assert.deepEqual(Object.keys(state.predictions).sort(),['what-is-code','why-sql']);
  assert.equal(Object.hasOwn(state.predictions,'constructor'),false);
});

test('complete account-compatible backups restore predictions without inventing practice evidence',()=>{
  const state=freshTraining(),lesson=BEGINNER_LESSONS[0];
  state.learning.predictions[lesson.id]='I expect a greeting on one line.';
  state.learning.notes[lesson.id]='The quotes are not displayed.';
  const before=nextBeginnerStep(state),data=new Map();
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(state));
  const backup=captureProgress(storage);storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));
  restoreProgress(storage,backup,workspaceFingerprint(storage));
  const restored=validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training)));
  assert.deepEqual(restored.learning.predictions,state.learning.predictions);
  assert.deepEqual(restored.learning.notes,state.learning.notes);
  assert.equal(restored.attempts.length,0);assert.equal(restored.learning.read.length,0);
  assert.equal(beginnerTaskEvidence(restored,lesson).passed,false);
  assert.equal(nextBeginnerStep(restored).href,before.href);
});

test('each language shows one optional saved prediction before a closed result disclosure',()=>{
  const previous=globalThis.location;
  try{
    for(const track of ['python','sql','java']){
      const lesson=BEGINNER_LESSONS.find(item=>item.track===track),state=freshTraining();
      state.learning.predictions[lesson.id]='</textarea><script>not executable</script>';
      globalThis.location={hash:'#beginner/'+lesson.id};
      const view=beginnerView(state);
      assert.equal((view.match(/id="beginner-prediction"/g)||[]).length,1);
      assert.match(view,/<details class="beginner-prediction-result"><summary>Reveal worked example result<\/summary>/);
      assert.match(view,/&lt;\/textarea&gt;&lt;script&gt;not executable&lt;\/script&gt;/);
      assert.ok(view.indexOf('id="beginner-prediction"')<view.indexOf('class="beginner-prediction-result"'));
      assert.match(view,/does not record a code check or a pass/);
      assert.match(view,/Compare this with your prediction/);
      assert.doesNotMatch(view,/<details class="beginner-prediction-result" open/);
    }
  }finally{globalThis.location=previous;}
});

test('prediction saves report storage failure and preserve the in-memory text',()=>{
  const script=`globalThis.localStorage={getItem:()=>null,setItem(){throw new Error('full');}};
    globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.dispatchEvent=()=>{};globalThis.setInterval=()=>0;
    globalThis.document={addEventListener(){}};
    const training=await import('./src/training.mjs');
    if(training.saveBeginnerPrediction('what-is-code','Keep this prediction')!==false)throw new Error('False save success');
    if(training.trainingStorageAvailable()!==false)throw new Error('False storage availability');
    if(training.readTrainingProgress().learning.predictions['what-is-code']!=='Keep this prediction')throw new Error('In-memory prediction lost');
    if(training.saveBeginnerPrediction('fake-lesson','bad')!==false)throw new Error('Unknown lesson accepted');`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stderr);
});
