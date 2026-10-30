import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';

// Adapt only the runtime emitted by the pinned TeaVM 0.16.0 build. Unknown
// generated layouts fail closed rather than leaving dynamic source execution.
const [inputPath,outputPath]=process.argv.slice(2);
if(!inputPath||!outputPath)throw new Error('Usage: node scripts/java-runtime-patch.mjs input-runtime.js output-runtime.mjs');
let source=await readFile(resolve(inputPath),'utf8');
function replaceRange(start,end,replacement){
  const from=source.indexOf(start),to=source.indexOf(end,from);
  if(from<0||to<0)throw new Error('Unrecognized pinned TeaVM runtime layout: '+start);
  source=source.slice(0,from)+replacement+source.slice(to);
}
replaceRange('function D(e){','function x(e,t,n){',`const tracecraftGlobals=Object.freeze({Object,Array,ArrayBuffer,Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array,DataView,String,Number,Boolean,BigInt,Math,Date,RegExp,Map,Set,WeakMap,WeakSet,WeakRef,FinalizationRegistry,Promise,Reflect,JSON,Error,TypeError,RangeError,Symbol,parseInt,parseFloat,isNaN,NaN,Infinity,undefined});
function D(name){if(!Object.hasOwn(tracecraftGlobals,name))throw new Error('Unsupported Java bridge global: '+name);return tracecraftGlobals[name]}
function O(){throw new Error('Java bridge cannot assign browser globals')}
`);
replaceRange('function S(t,e){','function W(e,t){',`function S(fn,varargs){return function(...args){try{if(varargs){const fixed=fn.length-1;args=[...args.slice(0,fixed),args.slice(fixed)]}return fn(...args)}catch(error){j(error)}}}
`);
replaceRange('function W(e,t){','t.teavmJso=',`function W(name,ctor){return function(...args){return ctor.apply(this,args)}}
`);
replaceRange('defineMethod(e,t,n,r){','defineStaticMethod(',`defineMethod(e,t,n,varargs){e.prototype[t]=function(...args){try{if(varargs){const fixed=n.length-2;args=[...args.slice(0,fixed),args.slice(fixed)]}return n(this,...args)}catch(error){j(error)}}},`);
replaceRange('for(let e=0;e<32;++e){','}function e(e){',`for(let index=0;index<32;index++){
t.teavmJso['createFunction'+index]=(...args)=>tracecraftStaticBody(args);
t.teavmJso['bindFunction'+index]=(fn,...args)=>fn.bind(null,...args);
t.teavmJso['callFunction'+index]=(fn,...args)=>{try{return fn(...args)}catch(error){x(error)}};
t.teavmJso['callMethod'+index]=(object,name,...args)=>{try{return object!==null?object[name](...args):D(name)(...args)}catch(error){x(error)}};
t.teavmJso['construct'+index]=(ctor,...args)=>{try{return Reflect.construct(ctor,args)}catch(error){x(error)}};
t.teavmJso['arrayOf'+index]=(...args)=>args;
}`);
const prefix=`/* TeaVM runtime, Apache-2.0, copyright its contributors.
 * Modified by TraceCraft: replace generated JavaScript constructors with static
 * closures and a finite list of trusted compiler adapters for strict CSP.
 * Learner modules additionally require java-program-policy.mjs restrictions.
 */
const tracecraftStaticBodies=new Map([
['return Object.create(null);',()=>Object.create(null)],
['return __this__;',value=>value],
['return array;',value=>value],
['return str;',value=>value],
['return number;',value=>value],
['return value;',value=>value],
['return new Array(size);',size=>new Array(size)],
]);
function tracecraftStaticBody(args){const fn=tracecraftStaticBodies.get(args.at(-1));if(!fn)throw new Error('Unsupported static Java bridge: '+JSON.stringify(args));return fn}
`;
source=prefix+source;
if(/new\s+Function\s*\(|\beval\s*\(/.test(source))throw new Error('Dynamic JavaScript source execution remained after runtime patch');
await mkdir(dirname(resolve(outputPath)),{recursive:true});
await writeFile(resolve(outputPath),source);
console.log('Prepared static TeaVM runtime: '+outputPath);
