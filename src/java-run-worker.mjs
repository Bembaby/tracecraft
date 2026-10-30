import {strictLoad} from './java-program-policy.mjs';
self.onmessage=async({data})=>{
  const {id,wasm,args}=data||{};let stdout='',stderr='',truncated=false;
  const capture=type=>code=>{if(stdout.length+stderr.length>=12000){truncated=true;throw new Error('Java output reached its 12,000-character limit.');}if(type==='stdout')stdout+=String.fromCharCode(code);else stderr+=String.fromCharCode(code);};
  try {
    if(!(wasm instanceof Uint8Array)||wasm.byteLength>10000000||!Array.isArray(args)||args.length>100||args.some(s=>typeof s!=='string'||s.length>1000))throw new Error('Invalid Java program or input.');
    const app=await strictLoad(wasm,{stdout:capture('stdout'),stderr:capture('stderr')});
    app.exports.main(args);
    self.postMessage({id,result:{stdout,stderr,truncated,error:null}});
  } catch(error){self.postMessage({id,result:{stdout,stderr,truncated,error:String(error.message||error).slice(0,4000)}});}
};
