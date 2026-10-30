/** Browser-only javac/TeaVM controller. No runtime loads before Run or Check. */
export const JAVA_VERSION = 'teavm-0.16.0-javac-208d4c9';
export const JAVA_LIMITS = Object.freeze({sourceCharacters:20000, outputCharacters:12000, startupMs:90000, compileMs:60000, executionMs:5000, fixtures:12});
const failure = (error, extra={}) => ({stdout:'',stderr:'',error,passed:false,...extra});

export class JavaRuntime {
  constructor({workerFactory=(url)=>new Worker(url,{type:'module'}),startupMs=JAVA_LIMITS.startupMs,compileMs=JAVA_LIMITS.compileMs,executionMs=JAVA_LIMITS.executionMs}={}) {
    this.workerFactory=workerFactory;this.startupMs=startupMs;this.compileMs=compileMs;this.executionMs=executionMs;
    this.compiler=null;this.runner=null;this.pending=null;this.sequence=0;
  }
  async run(code,{args=[],fixtures=null,onStatus=()=>{}}={}) {
    if(this.pending)return failure('Java is already running. Stop it before starting another run.');
    if(typeof code!=='string'||code.length>JAVA_LIMITS.sourceCharacters)return failure('Java source is limited to 20,000 characters.');
    const validArgs=value=>Array.isArray(value)&&value.length<=100&&value.every(s=>typeof s==='string'&&s.length<=1000);
    if(!validArgs(args)||fixtures&&(!Array.isArray(fixtures)||!fixtures.length||fixtures.length>JAVA_LIMITS.fixtures||fixtures.some(f=>!validArgs(f?.args)||typeof f?.stdout!=='string')))return failure('Invalid Java input examples. Reload the exercise and try again.');
    const id=++this.sequence;
    return new Promise(resolve=>{
      const finish=result=>{if(this.pending?.id!==id)return;clearTimeout(this.pending.timer);this.runner?.terminate();this.runner=null;this.pending=null;resolve(result);};
      const deadline=(ms,message,phase)=>{if(this.pending?.id!==id)return;clearTimeout(this.pending.timer);this.pending.timer=setTimeout(()=>{this.compiler?.terminate();this.compiler=null;finish(failure(message,{timedOut:true,phase}));},ms);};
      this.pending={id,finish,timer:null};
      const execute=async wasm=>{
        const checks=[];let last;
        try {
          for(const fixture of fixtures||[{args}]) {
            if(this.pending?.id!==id)return;
            onStatus(fixtures?`Checking example ${checks.length+1} of ${fixtures.length}…`:'Running your program…');
            last=await new Promise(done=>{
              const runner=this.runner=this.workerFactory(new URL('./java-run-worker.mjs',import.meta.url));
              let settled=false;
              const complete=result=>{if(settled)return;settled=true;clearTimeout(timer);runner.terminate();if(this.runner===runner)this.runner=null;done(result);};
              const timer=setTimeout(()=>complete(failure('Java took too long. Check whether a loop can finish, then run again.',{timedOut:true,phase:'execute'})),this.executionMs);
              // Cancellation resolves the outer request; this worker is terminated by dispose().
              runner.onmessage=event=>{if(event.data?.id===id)complete(event.data.result);};
              runner.onerror=()=>complete(failure('The Java program worker stopped unexpectedly. Your draft is preserved. Retry a smaller input.'));
              runner.postMessage({id,wasm,args:fixture.args});
            });
            if(this.pending?.id!==id)return;
            if(fixtures)checks.push({name:fixture.name,args:fixture.args,expected:fixture.stdout,actual:last.stdout,passed:!last.error&&!last.truncated&&last.stdout===fixture.stdout,error:last.error||''});
            if(last.timedOut)break;
          }
          finish({...last,...(fixtures?{checks,passed:checks.length===fixtures.length&&checks.every(c=>c.passed)}:{passed:null})});
        } catch(error){finish(failure('Could not start Java execution: '+error.message));}
      };
      try {
        if(!this.compiler){this.compiler=this.workerFactory(new URL('./java-compile-worker.mjs',import.meta.url));}
        this.compiler.onmessage=event=>{
          const data=event.data;if(data?.id!==id||this.pending?.id!==id)return;
          if(data.phase==='compiling'){deadline(this.compileMs,'Java compilation took too long. Try a smaller program or reload the runtime.','compile');onStatus('Compiling your Java…');return;}
          if(data.error){if(data.fatal){this.compiler?.terminate();this.compiler=null;}finish(failure(data.error,{diagnostics:data.diagnostics||[],phase:data.phase||'compile'}));return;}
          if(data.wasm){clearTimeout(this.pending.timer);execute(data.wasm);}
        };
        const activeCompiler=this.compiler;
        this.compiler.onerror=()=>{if(this.pending?.id!==id||this.compiler!==activeCompiler)return;activeCompiler.terminate();this.compiler=null;finish(failure('The Java compiler could not load. A current browser with WebAssembly GC support is required. Check your connection and retry.',{phase:'load'}));};
        deadline(this.startupMs,'The Java compiler did not finish loading. Check your connection and retry. Your draft is preserved.','load');
        onStatus('Loading the browser Java compiler…');
        this.compiler.postMessage({id,code});
      } catch(error){this.compiler?.terminate();this.compiler=null;finish(failure('Java could not start in this browser. '+error.message));}
    });
  }
  dispose(){this.compiler?.terminate();this.runner?.terminate();this.compiler=null;this.runner=null;this.pending?.finish(failure('Java run stopped. Your draft is preserved.',{cancelled:true}));}
}
