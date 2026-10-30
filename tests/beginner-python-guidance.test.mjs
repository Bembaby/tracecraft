import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';
import {PYTHON_GUIDANCE_SECTIONS,enrichPythonLessons} from '../src/beginner-python-guidance.mjs';

const python=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const pythonAvailable=spawnSync(python,['--version'],{encoding:'utf8',timeout:5000}).status===0;

test('Python guidance extends all twelve existing lessons and preserves their tasks',()=>{
  assert.equal(Object.keys(PYTHON_GUIDANCE_SECTIONS).length,12);
  const original=BEGINNER_LESSONS.map(lesson=>({...lesson,sections:lesson.sections.filter(section=>section.title!==PYTHON_GUIDANCE_SECTIONS[lesson.id]?.title)}));
  const enriched=enrichPythonLessons(original);
  for(const [index,lesson] of original.entries()){
    assert.equal(enriched[index].id,lesson.id);
    assert.equal(enriched[index].task,lesson.task);
    assert.deepEqual(enriched[index].terms,lesson.terms);
    if(lesson.track==='python'){
      assert.equal(enriched[index].sections.length,lesson.sections.length+1,lesson.id);
      assert.equal(enriched[index].sections.at(-1),PYTHON_GUIDANCE_SECTIONS[lesson.id]);
    }else assert.equal(enriched[index],lesson);
  }
  assert.deepEqual(enrichPythonLessons(enriched),enriched,'repeated aggregation does not duplicate the teaching');
});

for(const [id,section] of Object.entries(PYTHON_GUIDANCE_SECTIONS)){
  test(`Python worked guidance ${id} displays its stated result`,{skip:pythonAvailable?false:'Local CPython is unavailable; set TRACECRAFT_PYTHON for author verification.'},()=>{
    for(const key of ['title','body','code','result'])assert.ok(typeof section[key]==='string'&&section[key].trim());
    assert.match(section.body,/Predict|predict/,'each section invites a prediction before the answer');
    assert.match(section.body,/Why|why|Which|what should|What would/,'each section asks for a reason or counterexample');
    assert.doesNotMatch(Object.values(section).join('\n'),/\u2014/);
    const result=spawnSync(python,['-I','-c',section.code],{encoding:'utf8',timeout:5000});
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stderr,'');
    assert.equal(result.stdout.replaceAll('\r\n','\n'),section.result+'\n');
  });
}
