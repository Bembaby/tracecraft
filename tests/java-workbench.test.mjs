import test from 'node:test';
import assert from 'node:assert/strict';
import {parseJavaInputs,mountJava,unmountJava,javaView} from '../src/java-workbench.mjs';
import {freshTraining,dayKey} from '../src/training-state.mjs';
import {JAVA_LABS} from '../src/java-content.mjs';
test('Java Run preserves spaces, empty text, multiple arguments and no input distinctly',()=>{
  assert.deepEqual(parseJavaInputs(''),[]);
  assert.deepEqual(parseJavaInputs('',true),['']);
  assert.deepEqual(parseJavaInputs(' Amina Q \r\n0\n'),[' Amina Q ','0','']);
});
test('a due Java review archives the old answer and starts fresh only once per day',()=>{
  const previous=globalThis.location;globalThis.location={hash:'#java/java-start/review'};
  const state=freshTraining(),lab=JAVA_LABS[0],key='java:'+lab.id;
  state.drafts[key]=lab.solution;state.reviews[key]={due:'2000-01-01',stage:1};let saves=0;
  const element={addEventListener(){},removeEventListener(){},querySelector(){return null;}};
  try{
    mountJava(element,state,()=>saves++,()=>{});
    assert.equal(state.drafts[key],lab.starter);assert.equal(state.drafts['archive:'+key],lab.solution);assert.equal(state.fresh[key],dayKey());assert.equal(saves,1);
    unmountJava();state.drafts[key]='my new attempt';mountJava(element,state,()=>saves++,()=>{});
    assert.equal(state.drafts[key],'my new attempt');assert.equal(saves,1);
  }finally{unmountJava();globalThis.location=previous;}
});
test('Java workbench teaches supplied setup and lets each fixed example become Run input',()=>{
  const previous=globalThis.location;globalThis.location={hash:'#java/java-types'};
  try{const view=javaView(freshTraining());assert.match(view,/Understand the supplied Java setup/);assert.match(view,/one empty text value/);assert.match(view,/data-java-fixture="0"/);assert.match(view,/main\(String\[\] args\)/);assert.match(view,/starter compiles but contains a deliberate mistake/);}finally{globalThis.location=previous;}
});
