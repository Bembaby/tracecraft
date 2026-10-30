import test from 'node:test';
import assert from 'node:assert/strict';
import {javaErrorGuide,javaLineRange} from '../src/java-feedback.mjs';
test('Java errors give concrete beginner recovery without hiding actual diagnostics',()=>{
  assert.match(javaErrorGuide("';' expected"),/semicolon/);
  assert.match(javaErrorGuide('cannot find symbol: energyy'),/spelling/);
  assert.match(javaErrorGuide('incompatible types: String cannot be converted to int'),/wrong type/);
  assert.match(javaErrorGuide('ArrayIndexOutOfBoundsException: Index 1 out of bounds'),/first position is 0/);
  assert.match(javaErrorGuide('NumberFormatException: For input string: bad'),/whole number/);
  assert.match(javaErrorGuide('Java took too long'),/loop condition/);
  assert.match(javaErrorGuide('unfamiliar message'),/exact message/);
  assert.match(javaErrorGuide('Java took too long',{phase:'load'}),/connection/);
  assert.match(javaErrorGuide('Java took too long',{phase:'compile',timedOut:true}),/before your program ran/);
});
test('compiler line navigation selects exactly the requested authored line',()=>{
  assert.deepEqual(javaLineRange('one\n  two\nthree',2),{start:4,end:9});
  assert.deepEqual(javaLineRange('one\n',2),{start:4,end:4});
  for(const invalid of [0,-1,4,NaN,1.5])assert.equal(javaLineRange('one\ntwo',invalid),null);
});
