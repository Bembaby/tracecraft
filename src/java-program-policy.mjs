import {load} from '../public/vendor/java/runtime.mjs';
const allowedImports = new Set([
  'teavmJso.createClass','teavmJso.getProperty','teavmJso.defineFunction',
  'teavmJso.defineStaticMethod','teavmJso.unwrapInt','teavmJso.wrapInt',
  'teavmJso.unwrapJavaObject','teavmJso.wrapObject','teavmJso.javaObjectToJS',
  'teavmJso.createFunction1','teavmJso.callFunction1','teavmJso.isPrimitive',
  'teavmJso.isUndefined','teavm.takeStackTrace','teavm.decorateException',
  'teavmConsole.putcharStdout','teavmConsole.putcharStderr',
  'teavmJso.stringBuiltinsSupported','teavmDate.currentTimeMillis','teavmMemory.notifyHeapResized',
]);
export async function strictLoad(bytes,{stdout=()=>{},stderr=()=>{}}={}) {
  const module=await WebAssembly.compile(bytes,{builtins:['js-string']});
  for(const entry of WebAssembly.Module.imports(module)) {
    if(!((entry.kind==='memory'&&entry.module==='env'&&entry.name==='memory')||(entry.kind==='global'&&entry.module==='teavmMemory'&&['heapOffset','maxSize'].includes(entry.name))||(entry.kind==='function'&&allowedImports.has(entry.module+'.'+entry.name))))throw new Error('Unsupported Java runtime import: '+entry.module+'.'+entry.name);
  }
  const staticFunctions=new WeakSet();
  return load(bytes,{memory:{maxSize:64*1024*1024},noAutoImports:true,installImports(imports){
    const jso=imports.teavmJso;
    jso.getProperty=(target,key)=>{
      if(!Array.isArray(target))throw new Error('Browser object access is unavailable in Java practice.');
      if(key==='length')return target.length;
      if(typeof key==='number'&&Number.isSafeInteger(key)&&key>=0&&key<target.length)return target[key];
      if(typeof key==='string'&&/^(0|[1-9][0-9]*)$/.test(key)&&Number.isSafeInteger(Number(key))&&Number(key)<target.length)return target[Number(key)];
      throw new Error('Only Java argument array entries are accessible.');
    };
    jso.createFunction1=(parameter,body)=>{
      if(parameter!=='str'||body!=='return str;')throw new Error('JavaScript interop is unavailable in Java practice.');
      const fn=value=>value;staticFunctions.add(fn);return fn;
    };
    jso.callFunction1=(fn,value)=>{
      if(!staticFunctions.has(fn))throw new Error('Only the static Java string adapter can be called.');
      return fn(value);
    };
    imports.teavmConsole.putcharStdout=stdout;
    imports.teavmConsole.putcharStderr=stderr;
  }});
}
export {allowedImports};

