import assert from 'node:assert/strict';
import {strictLoad} from '../src/java-program-policy.mjs';
const text = value => {const bytes = [...new TextEncoder().encode(value)];return [bytes.length,...bytes];};
const section = (id,data) => [id,data.length,...data];
const bridgeModule = (module,name) => new Uint8Array([
  0,97,115,109,1,0,0,0,
  ...section(1,[1,0x60,2,0x6f,0x6f,1,0x6f]),
  ...section(2,[1,...text(module),...text(name),0,0]),
  ...section(7,[1,...text('test'),0,0]),
]);
await assert.rejects(strictLoad(bridgeModule('teavmJso','global')), /Unsupported Java runtime import/);
await assert.rejects(strictLoad(bridgeModule('window','fetch')), /Unsupported Java runtime import/);
await assert.rejects(strictLoad(bridgeModule('teavmJso','callMethod1')), /Unsupported Java runtime import/);
const property=(await strictLoad(bridgeModule('teavmJso','getProperty'))).instance.exports.test;
assert.equal(property(['Amina'],'length'),1);
assert.equal(property(['Amina'],0),'Amina');
for(const [target,key]of [[null,'globalThis'],[null,'self'],[null,'fetch'],[{},'constructor'],[[],'constructor'],[[],'__proto__'],[[],'prototype'],[[],'map']])assert.throws(()=>property(target,key));
const create=(await strictLoad(bridgeModule('teavmJso','createFunction1'))).instance.exports.test;
assert.equal(create('str','return str;')('works'),'works');
for(const body of ['return self;','return globalThis;','return fetch;','return str.constructor;','return Function("return this")();'])assert.throws(()=>create('str',body));
const call=(await strictLoad(bridgeModule('teavmJso','callFunction1'))).instance.exports.test;
let called=false;assert.throws(()=>call(()=>{called=true;},null));assert.equal(called,false);
console.log('Java import/global/prototype/dynamic-body/call guard refusal proofs passed.');
