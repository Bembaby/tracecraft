import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import initSqlJs from '../public/vendor/sqljs/sql-wasm.js';
import { ARCADE_QUESTS, ARCADE_QUESTIONS, isCorrectAnswer, questionsFor } from '../src/arcade-content.mjs';
import { freshArcade, validateArcade, completeQuestion, arcadeStats, checkArcadeAnswer } from '../src/arcade-state.mjs';
import { freshTraining, validateTraining } from '../src/training-state.mjs';
import { captureProgress, restoreProgress, workspaceFingerprint, WORKSPACE_KEYS } from '../src/progress-client.mjs';

test('arcade has complete original contracts and unambiguous questions across all collections',()=>{
  assert.ok(ARCADE_QUESTS.length>=18);assert.equal(ARCADE_QUESTIONS.length,ARCADE_QUESTS.length*3);
  assert.equal(new Set(ARCADE_QUESTIONS.map(q=>q.id)).size,ARCADE_QUESTIONS.length);
  for(const quest of ARCADE_QUESTS){
    for(const field of ['id','title','lesson','contract','solution','bug','complexity'])assert.ok(quest[field]?.length>0,quest.id+' '+field);
    assert.notEqual(quest.solution,quest.bug);assert.ok(quest.fixtures.length>=3);
    assert.equal(questionsFor(quest,'blank').length,1);assert.equal(questionsFor(quest,'choice').length,2);
    for(const question of quest.questions){
      assert.equal(question.options.filter(option=>isCorrectAnswer(question,option)).length,1);
      assert.equal(isCorrectAnswer(question,' '+question.answer+' '),true);
      assert.equal(isCorrectAnswer(question,null),false);
      assert.ok(question.explanation.length>40);assert.ok(question.hint.length>20);
      if(question.kind==='blank')assert.equal(question.code.split('___').length,2);
    }
  }
});

const python=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const available=spawnSync(python,['--version'],{encoding:'utf8'}).status===0;
for(const quest of ARCADE_QUESTS.filter(q=>q.language==='Python')){
  test(`${quest.id}: CPython verifies reference, changed inputs, boundaries and deliberate bug`,{skip:available?false:'Local CPython unavailable'},()=>{
    // Author-controlled sources only. No submitted programs run in an application API.
    const script='import json, sys\ncase=json.load(sys.stdin)\nns={}\nexec(case["code"], ns)\nresults=[]\nfor fixture in case["fixtures"]:\n    try:\n        results.append(ns["solve"](fixture["input"]) == fixture["expected"])\n    except Exception:\n        results.append(False)\nprint(json.dumps(results))';
    const run=code=>{const result=spawnSync(python,['-c',script],{input:JSON.stringify({code,fixtures:quest.fixtures}),encoding:'utf8',timeout:5000});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);};
    assert.ok(run(quest.solution).every(Boolean));assert.ok(run(quest.bug).some(result=>!result));
  });
}
test('SQL arcade examples agree with actual SQLite, including NULL and empty tables',async()=>{
  const SQL=await initSqlJs({locateFile:name=>fileURLToPath(new URL('../public/vendor/sqljs/'+name,import.meta.url))});
  for(const quest of ARCADE_QUESTS.filter(q=>q.language==='SQL')){
    const run=(code,fixture)=>{const db=new SQL.Database();try{db.run(quest.schema);for(const row of fixture.input)db.run(`INSERT INTO ${quest.id==='find-the-potions'?'potions':'loot'} VALUES (?,?)`,row);return db.exec(code)[0]?.values||[];}finally{db.close();}};
    for(const fixture of quest.fixtures)assert.deepEqual(run(quest.solution,fixture),fixture.expected);
    assert.ok(quest.fixtures.some(fixture=>JSON.stringify(run(quest.bug,fixture))!==JSON.stringify(fixture.expected)));
  }
});
test('XP is earned only once and hint assistance remains visible after retries',()=>{
  const state=freshArcade();state.hints.push('variable-read');
  assert.equal(completeQuestion(state,'variable-read'),true);
  assert.equal(completeQuestion(state,'variable-read'),false);
  assert.equal(state.completed['variable-read'].help,'hint');
  assert.equal(arcadeStats(state).xp,10);
  for(const item of ARCADE_QUESTS[0].questions)completeQuestion(state,item.id);
  assert.deepEqual(arcadeStats(state),{completed:3,xp:30,level:1,quests:1});
  assert.throws(()=>completeQuestion(state,'unknown'),/Unknown/);
});
test('old backups default safely and malformed or injected arcade state is discarded',()=>{
  assert.deepEqual(validateTraining({version:1}).arcade,freshArcade());
  const raw=JSON.parse('{"version":1,"xp":99999,"mode":"unknown","hints":["variable-read","variable-read","fake"],"answers":{"variable-fill":"energy + 2","constructor":"bad"},"completed":{"variable-read":{"help":"hint","at":"2026-10-28T12:00:00Z","token":"secret"},"fake":{"help":"solo","at":"2026-10-28T12:00:00Z"}}}');
  const clean=validateArcade(raw);assert.equal(clean.mode,'all');assert.equal(clean.xp,undefined);assert.equal(clean.completed['variable-read'].token,undefined);assert.equal(Object.hasOwn(clean.answers,'constructor'),false);assert.equal(arcadeStats(clean).xp,10);assert.deepEqual(clean.hints,['variable-read']);
});
test('retry feedback records its hint before a later correct completion',()=>{
  const state=freshArcade();assert.equal(checkArcadeAnswer(state,'variable-read').passed,false);assert.equal(state.hints.length,0);
  state.answers['variable-read']='2';assert.equal(checkArcadeAnswer(state,'variable-read').passed,false);assert.deepEqual(state.hints,['variable-read']);
  state.answers['variable-read']='5';assert.equal(checkArcadeAnswer(state,'variable-read').earned,true);assert.equal(state.completed['variable-read'].help,'hint');assert.equal(checkArcadeAnswer(state,'variable-read').earned,false);
});
test('arcade answers, mode, XP and assistance survive the complete backup and account contract',()=>{
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  const training=freshTraining();training.arcade.mode='blank';training.arcade.answers['variable-fill']='energy + 2';training.arcade.hints=['variable-fill'];completeQuestion(training.arcade,'variable-fill');
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(training));const snapshot=captureProgress(storage);
  storage.setItem(WORKSPACE_KEYS.training,JSON.stringify(freshTraining()));restoreProgress(storage,snapshot,workspaceFingerprint(storage));
  const restored=validateTraining(JSON.parse(storage.getItem(WORKSPACE_KEYS.training))).arcade;
  assert.equal(restored.mode,'blank');assert.equal(restored.answers['variable-fill'],'energy + 2');assert.equal(restored.completed['variable-fill'].help,'hint');assert.equal(arcadeStats(restored).xp,10);
});
