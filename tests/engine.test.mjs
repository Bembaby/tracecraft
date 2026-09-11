import test from 'node:test';
import assert from 'node:assert/strict';
import {runMiniPython,assess,LIMITS} from '../src/engine.mjs';
import {challenges,stages,retrieve,readings} from '../src/data.mjs';
const output=code=>runMiniPython(code).output.at(-1);
for(const challenge of challenges){
 for(const fixture of challenge.tests)test(`${challenge.id}: ${fixture.name}`,()=>{const r=runMiniPython(challenge.code,fixture.input);assert.equal(r.output.at(-1),fixture.expected);});
 test(`${challenge.id}: deliberate bug is caught`,()=>assert.ok(assess(challenge.bug,challenge).some(x=>!x.passed)));
}
test('operator precedence',()=>assert.equal(output('print(2 + 3 * 4)'), '14'));
test('parentheses and unary numbers',()=>assert.equal(output('print(-(2 + 3) * 4)'),'-20'));
test('floor division and negative modulo',()=>{assert.equal(output('print(-7 // 3)'),'-3');assert.equal(output('print(-7 % 3)'),'2');});
test('boolean numeric equality follows Python for the supported subset',()=>assert.equal(output('print(True == 1)'),'True'));
test('list equality',()=>assert.equal(output('print([1, True] == [1, 1])'),'True'));
test('negative indexing',()=>assert.equal(output('x = [2, 5, 7]\nprint(x[-1])'),'7'));
test('range direction and step',()=>assert.equal(output('print(range(5, 0, -2))'),'[5, 3, 1]'));
test('if/else and empty list truth',()=>assert.equal(output('x = []\nif x:\n    print(1)\nelse:\n    print(0)'),'0'));
test('nested loops',()=>assert.equal(output('x = 0\nfor i in range(3):\n    for j in range(2):\n        x += 1\nprint(x)'),'6'));
test('sum len min max',()=>assert.equal(output('x = [2, 4, 6]\nprint(sum(x) + len(x) + min(x) + max(x))'),'23'));
test('comments and blank lines',()=>assert.equal(output('# Note\nx = 3 # a value\n\nprint(x)'),'3'));
test('snapshots are independent',()=>{const r=runMiniPython('x = 1\nx = 2');assert.equal(r.frames[0].variables.x,1);assert.equal(r.frames[1].variables.x,2);r.frames[1].variables.x=7;assert.equal(r.frames[0].variables.x,1);});
test('trace has original source line numbers',()=>{const r=runMiniPython('# heading\n\nx = 2\nprint(x)');assert.deepEqual(r.frames.map(x=>x.line),[3,4]);});
test('input injection only replaces first assignment',()=>assert.equal(runMiniPython('x = 1\nx = 9\nprint(x)',{x:4}).output.at(-1),'9'));
test('prototype properties are not accessible',()=>assert.throws(()=>runMiniPython('print(constructor)')));
for(const [name,code] of [
 ['file import rejected','import os'],['JavaScript rejected','fetch("https://example.com")'],['unsupported while rejected','while True:\n    print(1)'],['wrong indentation rejected','for x in [1]:\n  print(x)'],['tabs rejected','\tprint(1)'],['division by zero rejected','print(1 / 0)'],['unknown variable rejected','print(missing)'],['invalid index rejected','print([1][2])'],['oversized range rejected','print(range(201))'],['zero-step range rejected','print(range(0, 5, 0))'],['oversized number rejected','print(1000000000001)'],['nested-list amplification rejected','a = [1]\na = [a, a]'],['chained comparisons explicitly rejected','print(1 < 2 < 3)'],['empty min rejected','print(min([]))'],['trace budget enforced','for i in range(200):\n    for j in range(200):\n        print(i)']
])test(name,()=>assert.throws(()=>runMiniPython(code)));
test('source budget enforced',()=>assert.throws(()=>runMiniPython('x'.repeat(LIMITS.source+1))));
test('fixture bounds validated',()=>assert.throws(()=>runMiniPython('x = 1',{x:[[1]]})));
test('no source mutation during assessment',()=>{const c=challenges[0],before=JSON.stringify(c);assess(c.code,c);assert.equal(JSON.stringify(c),before);});
test('retrieval ranks actual shared terms',()=>{assert.equal(retrieve('database index')[0].id,'L02');assert.ok(retrieve('database').every(d=>d.score>0));});
test('retrieval abstains when unsupported',()=>assert.deepEqual(retrieve('quantum flamingos'),[]));
test('retrieval empty query has no false evidence',()=>assert.deepEqual(retrieve(''),[]));
test('retrieval ignores repeated query terms',()=>assert.equal(retrieve('database database')[0].score,retrieve('database')[0].score));
test('curriculum prerequisites form a valid DAG',()=>{const seen=new Set(),visiting=new Set();const visit=s=>{assert.ok(s);if(seen.has(s.id))return;assert.ok(!visiting.has(s.id));visiting.add(s.id);s.prerequisites.forEach(id=>visit(stages.find(x=>x.id===id)));visiting.delete(s.id);seen.add(s.id);};stages.forEach(visit);});
test('curriculum challenge links exist',()=>stages.filter(s=>s.challenge).forEach(s=>assert.ok(challenges.some(c=>c.id===s.challenge))));
test('reading links are HTTPS',()=>readings.forEach(r=>assert.equal(new URL(r.url).protocol,'https:')));
test('exercise ids are unique',()=>assert.equal(new Set(challenges.map(x=>x.id)).size,challenges.length));
