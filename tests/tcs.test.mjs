import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import initSqlJs from '../public/vendor/sqljs/sql-wasm.js';
import {checkSqlSolution} from '../src/sql-runtime.mjs';
import {PYTHON_HARNESS} from '../src/python-runtime.mjs';
import {TCS_LESSONS,TCS_BY_ID,TCS_REVIEW_IDS,TCS_REVISION} from '../src/tcs-content.mjs';
import {TCS_PYTHON_DRILLS,TCS_SQL_LABS} from '../src/tcs-lab-content.mjs';
import {freshTcs,validateTcs,chooseTcs,checkTcs,tcsChoiceEvidence,tcsTaskEvidence} from '../src/tcs-state.mjs';
import {freshTraining,validateTraining} from '../src/training-state.mjs';
import {validateProgress} from '../src/progress-contract.mjs';
import {validateTcsContent} from '../scripts/validate-tcs.mjs';
import {tcsView,mountTcs,unmountTcs} from '../src/tcs.mjs';
const python=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const available=spawnSync(python,['--version'],{encoding:'utf8',timeout:5000}).status===0;
function runPython(code,tests=''){
 const script=PYTHON_HARNESS+'\n_data=_tc_sys.stdin.read()\nprint(tracecraft_execute(_data))';
 const run=spawnSync(python,['-c',script],{input:JSON.stringify({code,tests,trace:false}),encoding:'utf8',timeout:10000,maxBuffer:2e6});
 assert.equal(run.status,0,run.stderr);return JSON.parse(run.stdout);
}
let SQL;before(async()=>{SQL=await initSqlJs({locateFile:n=>fileURLToPath(new URL('../public/vendor/sqljs/'+n,import.meta.url))});});
test('TCS covers every requested topic with original teaching and resolvable exercises',()=>{
 assert.deepEqual(validateTcsContent(),{lessons:25,python:8,sql:2});
 const required=['guards-and-return','functions-as-values','choose-a-deque','byte-formatting','objects-and-composition','mutual-recursion','extract-the-contract','sql-filter-order','sql-left-join-count','git-three-snapshots','resource-urls','http-error-contracts','http-cache-directives','fetch-response-stages','private-offline-cache','xss-safe-output','sql-parameter-binding','oauth-callback-binding','firebase-authorization','stratified-splits','regularization-and-validation','few-shot-versus-training','rag-evaluation','grounding-and-abstention','flow-termination'];
 assert.deepEqual(TCS_LESSONS.map(l=>l.id),required);
 for(const lesson of TCS_LESSONS){assert.ok(lesson.basics.split(' ').length>=45,lesson.id);assert.ok(lesson.worked.split(' ').length>=45,lesson.id);}
});
// Deliberately maintained independently of the content's answer fields.
const answerKey={'guards-and-return':'choice-0','functions-as-values':'choice-1','choose-a-deque':'choice-2','byte-formatting':'choice-1','objects-and-composition':'choice-2','mutual-recursion':'choice-0','extract-the-contract':'choice-1','sql-filter-order':'choice-2','sql-left-join-count':'choice-0','git-three-snapshots':'choice-2','resource-urls':'choice-1','http-error-contracts':'choice-2','http-cache-directives':'choice-0','fetch-response-stages':'choice-1','private-offline-cache':'choice-2','xss-safe-output':'choice-0','sql-parameter-binding':'choice-1','oauth-callback-binding':'choice-2','firebase-authorization':'choice-0','stratified-splits':'choice-1','regularization-and-validation':'choice-2','few-shot-versus-training':'choice-0','rag-evaluation':'choice-1','grounding-and-abstention':'choice-2','flow-termination':'choice-0'};
test('all TCS options agree with an independent answer key and answer positions vary',()=>{
 const positions=new Set();for(const l of TCS_LESSONS){assert.equal(l.answer,answerKey[l.id]);positions.add(l.options.findIndex(o=>o.id===l.answer));for(const o of l.options){const s=freshTcs();chooseTcs(s,l.id,o.id);checkTcs(s,l.id);assert.equal(tcsChoiceEvidence(s,l.id).correct,o.id===answerKey[l.id]);}}assert.ok(positions.size>1);
});
for(const lab of TCS_PYTHON_DRILLS)test(lab.id+': actual CPython accepts reference and rejects deliberate bug',{skip:available?false:'Local CPython unavailable.'},()=>{const good=runPython(lab.solution,lab.tests);assert.equal(good.passed,true,good.error);assert.equal(good.stdout,'');const bad=runPython(lab.bug,lab.tests);assert.equal(bad.passed,false,'Bug passed '+lab.id);});
test('every displayed Python fixture contains concrete, executable input and expected behavior',{skip:available?false:'Local CPython unavailable.'},()=>{for(const lab of TCS_PYTHON_DRILLS){for(const f of lab.fixtures){assert.ok(f.label);assert.match(f.assertion,/assert /);}const result=runPython(lab.solution,lab.fixtures.map(f=>f.assertion).join('\n'));assert.equal(result.passed,true,lab.id+': '+result.error);}});
for(const id of ['guards-and-return','functions-as-values','choose-a-deque','byte-formatting','objects-and-composition','mutual-recursion','flow-termination'])test(id+': the displayed Python example output matches CPython',{skip:available?false:'Local CPython unavailable.'},()=>{const l=TCS_BY_ID.get(id),result=runPython(l.code);assert.equal(result.error,null);assert.equal(result.stdout.trimEnd(),l.result);});
for(const lab of TCS_SQL_LABS)test(lab.id+': actual SQLite checks references, changed/empty fixtures and bugs',()=>{const result=checkSqlSolution(SQL,lab,lab.solution);assert.equal(result.passed,true,JSON.stringify(result));assert.equal(result.checks.length,4);assert.equal(checkSqlSolution(SQL,lab,lab.bug).passed,false);});
test('TCS SQL accepts equivalent answers and rejects a parent filter placed only in ON',()=>{
 const task=TCS_SQL_LABS[1];
 const equivalent='SELECT r.id AS room_id,r.label AS room_name,(SELECT COUNT(*) FROM bookings b WHERE b.room_id=r.id) AS total_bookings FROM rooms r WHERE r.active=1 ORDER BY total_bookings DESC,room_name,room_id;';
 assert.equal(checkSqlSolution(SQL,task,equivalent).passed,true);
 const wrong=task.solution.replace('ON b.room_id=r.id WHERE r.active=1','ON b.room_id=r.id AND r.active=1');
 assert.equal(checkSqlSolution(SQL,task,wrong).passed,false);
 assert.equal(checkSqlSolution(SQL,task,'CREATE TABLE extra(x); '+task.solution).passed,false);
 assert.equal(checkSqlSolution(SQL,task,task.solution.replace('room_id ASC','room_id DESC')).passed,false,'Identical name/count ties must test the final ID order.');
});
test('independent false-pass regressions reject constant lengths, raw-label sorting and ties-to-even rounding',{skip:available?false:'Local CPython unavailable.'},()=>{
 const objects=TCS_PYTHON_DRILLS.find(l=>l.id==='tcs-object-model');
 for(const code of [objects.solution.replace('return self.size','return 0'),objects.solution.replace('sorted(str(child) for child in self.children)','[str(child) for child in sorted(self.children, key=lambda item: item.label)]')])assert.equal(runPython(code,objects.tests).passed,false);
 const size=TCS_PYTHON_DRILLS.find(l=>l.id==='tcs-size-format');
 const floatRound='def format_bytes(size):\n    units = ["B", "KiB", "MiB", "GiB", "TiB"]\n    value, unit = size, 0\n    while unit < 4 and value >= 1024:\n        value /= 1024\n        unit += 1\n    return (str(int(value)) if value == int(value) else f"{value:.2f}") + units[unit]';
 assert.equal(runPython(floatRound,size.tests).passed,false);
});
test('independent changed Python inputs expose queue, guard, rounding and loop errors',{skip:available?false:'Local CPython unavailable.'},()=>{
 const checks={
 'tcs-loop-progress':'for start in range(10):\n for limit in range(10):\n  for step in range(5):\n   expected = 0 if start >= limit else None if step == 0 else (limit-start+step-1)//step\n   result = steps_to_limit(start, step, limit)\n   assert result == expected\n   assert result is None or type(result) is int',
 'tcs-size-format':'from decimal import Decimal, ROUND_HALF_UP\nfor size in [1, 1024, 2047, 2048, 91919, 1024**3-1, 1024**4+123456789, 1024**5-1]:\n unit = min(4, next((i-1 for i in range(1, 6) if size < 1024**i), 4))\n scale = 1024**unit\n value = Decimal(size) / Decimal(scale)\n text = str(size // scale) if size % scale == 0 else str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))\n assert format_bytes(size) == text + ["B", "KiB", "MiB", "GiB", "TiB"][unit]',
 'tcs-deque':'import random\nrng=random.Random(317)\nfor repeat in range(30):\n commands=[]\n remaining=[]\n removed=[]\n for i in range(40):\n  action=rng.choice(["left","right","take-left","take-right"])\n  value=rng.randrange(-5,6)\n  if action in ("left","right"):\n   commands.append((action,value))\n   remaining.insert(0 if action=="left" else len(remaining),value)\n  else:\n   commands.append((action,))\n   removed.append(remaining.pop(0 if action=="take-left" else -1) if remaining else None)\n assert process_queue(commands)=={"removed":removed,"remaining":remaining}'
 };for(const [id,tests] of Object.entries(checks)){const l=TCS_PYTHON_DRILLS.find(x=>x.id===id),r=runPython(l.solution,tests);assert.equal(r.passed,true,id+': '+r.error);}
});
test('TCS old backups default safely and new private progress survives complete backups',()=>{
 const t=freshTraining();delete t.tcs;assert.deepEqual(validateTraining(t).tcs,freshTcs());
 t.tcs=freshTcs();t.tcs.last='choose-a-deque';t.tcs.notes['choose-a-deque']='I confused front and back.';t.tcs.read=['choose-a-deque'];chooseTcs(t.tcs,'choose-a-deque','choice-2');checkTcs(t.tcs,'choose-a-deque');
 const copy=validateProgress({format:'tracecraft-progress',version:1,workspaces:{training:t}}).workspaces.training;
 assert.deepEqual(copy.tcs,t.tcs);assert.deepEqual(copy.attempts,[]);assert.deepEqual(copy.learning,t.learning);
});
test('TCS validation rejects invented evidence, unknown fields and obsolete recognition checks',()=>{
 const s=validateTcs({last:'made-up',read:['guards-and-return','guards-and-return','unknown'],notes:{unknown:'secret','guards-and-return':'x'.repeat(3000)},answers:{'guards-and-return':{choice:'choice-0',checked:true,passed:true,version:'old'}},apiKey:'secret'});
 assert.equal(s.last,null);assert.deepEqual(s.read,['guards-and-return']);assert.equal(s.notes['guards-and-return'].length,2000);assert.equal(s.apiKey,undefined);assert.equal(tcsChoiceEvidence(s,'guards-and-return').checked,false);
 assert.equal(chooseTcs(s,'guards-and-return','injected'),false);assert.equal(checkTcs(s,'unknown'),false);
});
test('editing a choice invalidates feedback and latest runtime failure supersedes a prior pass',()=>{
 const s=freshTcs();chooseTcs(s,'guards-and-return','choice-0');checkTcs(s,'guards-and-return');assert.equal(tcsChoiceEvidence(s,'guards-and-return').correct,true);chooseTcs(s,'guards-and-return','choice-1');assert.equal(tcsChoiceEvidence(s,'guards-and-return').checked,false);
 const t={attempts:[{type:'python',exercise:'tcs-deque',passed:true,help:'independent'},{type:'python',exercise:'tcs-deque',passed:false}]};assert.match(tcsTaskEvidence(t,'python','tcs-deque'),/did not pass/);
});
test('mixed review records stay separate from lesson checks and code attempts',()=>{
 const s=freshTcs(),id=TCS_REVIEW_IDS[0];chooseTcs(s,id,answerKey[id],true);checkTcs(s,id,true);assert.equal(tcsChoiceEvidence(s,id,true).correct,true);assert.equal(tcsChoiceEvidence(s,id).checked,false);assert.equal(s.answers[id],undefined);assert.equal(chooseTcs(s,'byte-formatting','choice-1',true),false);
});
test('TCS rendering escapes private notes and provides clear navigation and assessment labels',()=>{
 const old=globalThis.location;try{globalThis.location={hash:'#tcs/choose-a-deque'};const t=freshTraining();t.tcs.notes['choose-a-deque']='<script>bad()</script>';const view=tcsView(t);assert.ok(view.includes('&lt;script&gt;'));assert.ok(!view.includes('<script>bad'));assert.match(view,/All TCS lessons/);assert.match(view,/Reveal worked result/);assert.match(view,/No runtime check yet/);assert.doesNotMatch(view,/[\u2013\u2014]/);}finally{globalThis.location=old;}
});
test('TCS persistence failures stay visible across lesson, overview and mixed-review mounts',()=>{
 const old=globalThis.location,element={innerHTML:'',querySelectorAll:()=>[],addEventListener(){},removeEventListener(){}};
 try{for(const hash of ['#tcs/guards-and-return','#tcs','#tcs/review']){globalThis.location={hash};mountTcs(element,freshTraining(),()=>false,()=>{});assert.match(element.innerHTML,/could not save your TCS changes/);assert.doesNotMatch(element.innerHTML,/TCS notes and progress save on this device/);unmountTcs();}}
 finally{globalThis.location={hash:'#tcs'};mountTcs(element,freshTraining(),()=>true,()=>{});unmountTcs();globalThis.location=old;}
});
