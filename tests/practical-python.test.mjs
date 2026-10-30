import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {PRACTICAL_PYTHON_DRILLS} from '../src/practical-python-content.mjs';
import {PYTHON_HARNESS} from '../src/python-runtime.mjs';

const python=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const available=spawnSync(python,['--version'],{encoding:'utf8',timeout:5000}).status===0;
function execute(runs){
  const script=PYTHON_HARNESS+'\n_runs = _tc_json.loads(_tc_sys.stdin.read())\nprint(_tc_json.dumps([_tc_json.loads(tracecraft_execute(_tc_json.dumps(run))) for run in _runs]))';
  const result=spawnSync(python,['-c',script],{encoding:'utf8',env:{...process.env,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'},input:JSON.stringify(runs),timeout:10000,maxBuffer:2*1024*1024});
  assert.equal(result.status,0,result.stderr||result.error?.message);return JSON.parse(result.stdout);
}

test('twelve practical Python tasks carry complete scoped authoring and assistance contracts',()=>{
  assert.equal(PRACTICAL_PYTHON_DRILLS.length,12);
  const seen=new Set();
  for(const item of PRACTICAL_PYTHON_DRILLS){
    assert.match(item.id,/^fluency-[a-z-]+$/);assert.ok(!seen.has(item.id));seen.add(item.id);
    for(const field of ['title','topic','prompt','contract','starter','solution','bug','explanation','complexity','prediction','gradingMethod'])assert.ok(typeof item[field]==='string'&&item[field].trim(),item.id+':'+field);
    assert.notEqual(item.solution,item.bug);assert.equal(item.version,'2026-10-29.2');assert.equal(item.track,'python');
    assert.ok(item.skills.length);assert.ok(Array.isArray(item.variants));assert.ok(item.fixtures.length>=3);assert.ok(item.sources.every(source=>source.url.startsWith('https://docs.python.org/3.14/')));
    assert.deepEqual(Object.keys(item.assistance),['nudge','question','example','scaffold','solution']);
    assert.equal(item.assistance.solution,item.solution);assert.notEqual(item.assistance.nudge,item.solution);assert.notEqual(item.assistance.scaffold,item.solution);
    assert.ok(item.tests.includes('assert '));assert.ok(item.review.requireChangedInput);
    assert.doesNotMatch(JSON.stringify(item),/[\u2013\u2014]/);
    assert.doesNotMatch(JSON.stringify(item),/Belal|NJIT|FitTrack/);
  }
});

test('review variations resolve to another new task sharing a proven target skill',()=>{
  const byId=new Map(PRACTICAL_PYTHON_DRILLS.map(item=>[item.id,item]));
  for(const item of PRACTICAL_PYTHON_DRILLS){
    assert.equal(new Set(item.variants).size,item.variants.length,item.id);
    for(const id of item.variants){
      assert.notEqual(id,item.id,'A changed task must be a distinct exercise.');
      const variant=byId.get(id);
      assert.ok(variant,`${item.id} references unavailable variation ${id}`);
      assert.ok(item.skills.some(skill=>variant.skills.includes(skill)),`${item.id} and ${id} must share a tested skill`);
    }
  }
  assert.deepEqual(byId.get('fluency-divide-count').variants,[],'Do not claim an integer-division variation without another task that tests it.');
});

for(const item of PRACTICAL_PYTHON_DRILLS){
  test(`${item.id}: actual CPython accepts the solution and rejects its deliberate bug`,{skip:available?false:'Local CPython unavailable; set TRACECRAFT_PYTHON.'},()=>{
    const [correct,bug]=execute([{code:item.solution,tests:item.tests,trace:false},{code:item.bug,tests:item.tests,trace:false}]);
    assert.equal(correct.passed,true,correct.error);assert.equal(correct.stdout,'');assert.equal(bug.passed,false,'Deliberate bug unexpectedly passed.');
  });
}

const floatRegressions=[
  {id:'fluency-dict-put',field:'totals',code:'def with_total(totals, user_id, minutes):\n    result = {key: float(value) for key, value in totals.items()}\n    result[user_id] = float(minutes)\n    return result\n'},
  {id:'fluency-dict-merge',field:'totals',code:'def merge_totals(base, changes):\n    result = base.copy()\n    result.update(changes)\n    return {key: float(value) for key, value in result.items()}\n'},
  {id:'fluency-value-index',field:'positions',name:'first_positions',conversion:'return {key: float(index) for key, index in result.items()}'},
  {id:'fluency-pair-unpack',field:'sum',name:'sum_pair_minutes',conversion:'return float(result)'},
  {id:'fluency-chunk-advance',field:'positions',name:'chunk_starts',conversion:'return [float(start) for start in result]'},
  {id:'fluency-divide-count',field:'batch positions',name:'plan_batches',conversion:'result["batches"] = [float(batch) for batch in result["batches"]]\n    return result'},
  {id:'fluency-divide-count',field:'remainder',name:'plan_batches',conversion:'result["remainder"] = float(result["remainder"])\n    return result'},
  {id:'fluency-dictionary-views',field:'minutes',name:'describe_totals',conversion:'result["minutes"] = [float(minutes) for minutes in result["minutes"]]\n    return result'},
  {id:'fluency-dictionary-views',field:'active minutes',name:'describe_totals',conversion:'result["active"] = [(user, float(minutes)) for user, minutes in result["active"]]\n    return result'},
  {id:'fluency-workout-parser',field:'totals',name:'summarize_records',conversion:'result["totals"] = {user: float(total) for user, total in result["totals"].items()}\n    return result'},
  {id:'fluency-workout-parser',field:'invalid positions',name:'summarize_records',conversion:'result["invalid"] = [float(index) for index in result["invalid"]]\n    return result'},
  {id:'fluency-log-lines',field:'totals',name:'summarize_lines',conversion:'result["totals"] = {user: float(total) for user, total in result["totals"].items()}\n    return result'},
  {id:'fluency-log-lines',field:'invalid positions',name:'summarize_lines',conversion:'result["invalid"] = [float(index) for index in result["invalid"]]\n    return result'}
];
for(const regression of floatRegressions){
  test(`${regression.id}: rejects float ${regression.field} despite numeric equality`,{skip:available?false:'Local CPython unavailable; set TRACECRAFT_PYTHON.'},()=>{
    const item=PRACTICAL_PYTHON_DRILLS.find(task=>task.id===regression.id);
    const code=regression.code||`${item.solution}\n_integer_contract_solution = ${regression.name}\ndef ${regression.name}(*args, **kwargs):\n    result = _integer_contract_solution(*args, **kwargs)\n    ${regression.conversion}\n`;
    const [result]=execute([{code,tests:item.tests,trace:false}]);
    assert.equal(result.passed,false,`Float ${regression.field} unexpectedly satisfied the integer contract.`);
    assert.match(result.error,/AssertionError/,'The regression must fail a contract assertion, not a program error.');
  });
}

test('fluency functions handle independent changed data across chunk, map and parser contracts',{skip:available?false:'Local CPython unavailable; set TRACECRAFT_PYTHON.'},()=>{
  const byId=new Map(PRACTICAL_PYTHON_DRILLS.map(item=>[item.id,item]));
  const runs=[
    {id:'fluency-chunk-text',tests:'for size in range(1, 8):\n    for length in range(25):\n        text = "wxyz" * (length // 4) + "wxyz"[:length % 4]\n        result = split_chunks(text, size)\n        assert "".join(result) == text\n        assert all(1 <= len(piece) <= size for piece in result)\n        assert all(len(piece) == size for piece in result[:-1])\n        assert len(result) == (length + size - 1) // size'},
    {id:'fluency-chunk-advance',tests:'for length in range(30):\n    for size in range(1, 9):\n        expected = [index for index in range(length) if index % size == 0]\n        assert chunk_starts(length, size) == expected'},
    {id:'fluency-value-index',tests:'import random\nrng = random.Random(614)\nfor count in range(25):\n    labels = [rng.choice(["a", "", "b", "c"]) for _ in range(count)]\n    result = first_positions(labels)\n    assert set(result) == set(labels)\n    for label, index in result.items():\n        assert labels[index] == label\n        assert label not in labels[:index]'},
    {id:'fluency-workout-parser',tests:'records = [{"user": "aa", "minutes": i} for i in range(8)] + [{"user": " bb ", "minutes": 0}, {"user": "aa", "minutes": False}]\nassert summarize_records(records) == {"totals": {"aa": 28, "bb": 0}, "invalid": [9]}\nassert list(summarize_records(records)["totals"]) == ["aa", "bb"]'},
    {id:'fluency-log-lines',tests:'lines = ["aa|" + str(i) for i in range(8)] + [" bb |0", "aa|False"]\nassert summarize_lines(lines) == {"totals": {"aa": 28, "bb": 0}, "invalid": [9]}\nassert summarize_lines(["a|+04", "a| 2 ", "a|4.0"]) == {"totals": {"a": 6}, "invalid": [2]}'}
  ].map(item=>({code:byId.get(item.id).solution,tests:item.tests,trace:false}));
  for(const result of execute(runs))assert.equal(result.passed,true,result.error);
});
