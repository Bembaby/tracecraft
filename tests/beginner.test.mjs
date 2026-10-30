import {JAVA_LABS} from '../src/java-content.mjs';
import {PYTHON_DRILLS} from '../src/training-content.mjs';
import {SQL_LABS} from '../src/sql-content.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {indentCode} from '../src/editor-indent.mjs';
import {BEGINNER_LESSONS,BEGINNER_PYTHON_DRILLS,BEGINNER_SQL_LABS} from '../src/beginner-content.mjs';
import {spawnSync} from 'node:child_process';
import {PYTHON_HARNESS} from '../src/python-runtime.mjs';
import {freshTraining,validateTraining} from '../src/training-state.mjs';
import {validateLearning,nextBeginnerStep,beginnerTaskEvidence} from '../src/beginner-state.mjs';
import {captureProgress,restoreProgress,workspaceFingerprint,WORKSPACE_KEYS} from '../src/progress-client.mjs';
import {pythonErrorGuide,sqlErrorGuide} from '../src/practice-feedback.mjs';
import {validateBeginnerLessons} from '../scripts/validate-content.mjs';

const python=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const pythonAvailable=spawnSync(python,['--version'],{encoding:'utf8'}).status===0;
test('indent controls handle a caret, complete lines, and partial indentation',()=>{
  assert.equal(indentCode('if ready:\nprint(1)',10,10).source,'if ready:\n    print(1)');
  assert.equal(indentCode('a\nb\nc',0,4).source,'    a\n    b\nc');
  assert.equal(indentCode('  a\n    b',0,9,true).source,'a\nb');
  assert.equal(indentCode('',0,0).source,'    ');
  assert.equal(indentCode('\nnext',0,0).source,'    \nnext');
});
test('beginner authoring rejects broken task links and missing Java programs',()=>{
  assert.deepEqual(validateBeginnerLessons(),{lessons:25});
  const lessons=structuredClone(BEGINNER_LESSONS);lessons[0].task.id='missing';assert.throws(()=>validateBeginnerLessons(lessons),/practice link/);
  assert.throws(()=>validateBeginnerLessons(BEGINNER_LESSONS,{}),/teaching example/);
});
test('beginner error guidance provides a concrete recovery step',()=>{
  assert.match(pythonErrorGuide('IndentationError: expected a block'),/Indent 4 spaces/);
  assert.match(pythonErrorGuide('SyntaxError: unterminated string'),/quotation marks/);
  assert.match(pythonErrorGuide('NameError: x is not defined'),/spelling/);
  assert.match(pythonErrorGuide('AssertionError: expected 5'),/expected answer/);
  assert.match(sqlErrorGuide('no such column: titlee'),/column names/);
  assert.match(sqlErrorGuide('syntax error near WHERE'),/SELECT, FROM/);
});
test('beginner note saves report storage failures instead of claiming success',()=>{
  const script=`globalThis.localStorage={getItem:()=>null,setItem(){throw new Error('full');}};
    globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.dispatchEvent=()=>{};globalThis.setInterval=()=>0;
    globalThis.document={addEventListener(){}};
    const training=await import('./src/training.mjs');
    if(training.saveBeginnerNote('what-is-code','Keep this note')!==false)throw new Error('False save success');
    if(training.trainingStorageAvailable()!==false)throw new Error('False storage availability');
    if(training.readTrainingProgress().learning.notes['what-is-code']!=='Keep this note')throw new Error('In-memory note lost');`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',timeout:5000});assert.equal(result.status,0,result.stderr);
});
test('beginner resume separates read marks, latest checked work and Java runtime answers',()=>{
  const state=freshTraining();assert.equal(nextBeginnerStep(state).href,'#beginner/what-is-code');
  state.learning.read.push('what-is-code');assert.equal(nextBeginnerStep(state).href,'#python/hello-output');
  state.attempts.push({type:'python',exercise:'hello-output',passed:true,help:'hint'});state.learning.read=[];assert.equal(nextBeginnerStep(state).href,'#beginner/values-and-variables');
  state.attempts.push({type:'python',exercise:'hello-output',passed:false,help:'independent'});assert.equal(nextBeginnerStep(state).href,'#python/hello-output');
  state.learning.lastLesson='java-types';assert.equal(nextBeginnerStep(state).href,'#beginner/java-types');
  const java=BEGINNER_LESSONS.find(item=>item.id==='java-start');assert.equal(beginnerTaskEvidence(state,java).kind,'runtime');assert.equal(beginnerTaskEvidence(state,java).passed,false);
});
test('beginner records reject unknown IDs and survive complete backup restoration',()=>{
  const clean=validateLearning({version:1,lastLesson:'fake',read:['what-is-code','fake','what-is-code'],notes:{'what-is-code':'x'.repeat(4000),constructor:'bad'},token:'never'});
  assert.deepEqual(clean.read,['what-is-code']);assert.equal(clean.lastLesson,null);assert.equal(clean.notes['what-is-code'].length,3000);assert.equal(clean.token,undefined);assert.equal(Object.hasOwn(clean.notes,'constructor'),false);
  const state=freshTraining();state.learning={version:1,lastLesson:'why-sql',read:['what-is-code'],notes:{'why-sql':'A row is one record.'},predictions:{}};
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(state));const snapshot=captureProgress(storage);storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));restoreProgress(storage,snapshot,workspaceFingerprint(storage));
  assert.deepEqual(validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training))).learning,state.learning);
});
test('reusable beginner checks reject wrong types and extra printed output',{skip:pythonAvailable?false:'Local CPython unavailable'},()=>{
  const bad=[['first-function','def add_bonus(energy):\n    return energy + 2.0'],['greeting-function','def greet(name):\n    print(name)\n    return "Hello, " + name + "!"'],['sum-function','def sum_values(values):\n    return float(sum(values))']];
  const payload=bad.map(([id,code])=>({code,tests:BEGINNER_PYTHON_DRILLS.find(item=>item.id===id).tests,trace:false}));
  const script=PYTHON_HARNESS+'\nfor payload in _tc_json.loads(_tc_sys.stdin.read()):\n    print(tracecraft_execute(_tc_json.dumps(payload)))';
  const result=spawnSync(python,['-c',script],{encoding:'utf8',input:JSON.stringify(payload),timeout:5000});
  assert.equal(result.status,0,result.stderr);for(const line of result.stdout.trim().split('\n'))assert.equal(JSON.parse(line).passed,false);
});
test('beginner lesson links resolve and contain teaching before practice',()=>{
  const ids=new Set();
  for(const lesson of BEGINNER_LESSONS){
    assert.ok(!ids.has(lesson.id));ids.add(lesson.id);
    assert.ok(lesson.why.length>60);assert.ok(lesson.terms.length>=3);assert.ok(lesson.sections.length>=3);
    if(lesson.task?.type==='sql')assert.ok(SQL_LABS.some(drill=>drill.id===lesson.task.id));
    if(lesson.task?.type==='python')assert.ok(PYTHON_DRILLS.some(drill=>drill.id===lesson.task.id));
    if(lesson.task?.type==='java')assert.ok(JAVA_LABS.some(drill=>drill.id===lesson.task.id));
  }
});
