import {load} from '../public/vendor/java/runtime.mjs';
let compiler,loading,diagnostics=[];
async function initialize(){
  const base=new URL('../public/vendor/java/',import.meta.url);
  const names=['compiler.wasm','compile-classlib-teavm.bin','runtime-classlib-teavm.bin'];
  const [wasm,sdk,classlib]=await Promise.all(names.map(async name=>{const response=await fetch(new URL(name,base));if(!response.ok)throw new Error('Java runtime asset unavailable: '+name);return new Int8Array(await response.arrayBuffer());}));
  const library=await load(wasm,{noAutoImports:true});
  compiler=library.exports.createCompiler();compiler.setSdk(sdk);compiler.setTeaVMClasslib(classlib);
  compiler.onDiagnostic(d=>{if(diagnostics.length<30)diagnostics.push({type:String(d.type),line:Number(d.lineNumber)||0,column:Number(d.columnNumber)||0,message:String(d.message).slice(0,2000)});});
}
self.onmessage=async({data})=>{
  const {id,code}=data||{};
  try {
    if(typeof code!=='string'||code.length>20000)throw new Error('Java source is limited to 20,000 characters.');
    loading??=initialize();await loading;
    self.postMessage({id,phase:'compiling'});diagnostics=[];compiler.clearSourceFiles();compiler.clearOutputFiles();
    compiler.addSourceFile('Main.java',code);
    if(!compiler.compile()){self.postMessage({id,phase:'compile',error:'Java found a compile error. Read the line details below and edit your code.',diagnostics});return;}
    if(!compiler.generateWebAssembly({outputName:'app',mainClass:'Main'})){self.postMessage({id,phase:'compile',error:'This program could not be converted for the browser. Use a public Main class and public static void main(String[] args). Desktop-only libraries are unavailable.',diagnostics});return;}
    const wasm=new Uint8Array(compiler.getWebAssemblyOutputFile('app.wasm')).slice();
    self.postMessage({id,wasm},[wasm.buffer]);
  } catch(error){self.postMessage({id,phase:compiler?'compile':'load',fatal:true,error:String(error.message||error).slice(0,4000),diagnostics});}
};
