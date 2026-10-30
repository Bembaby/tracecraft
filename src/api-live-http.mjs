// The only real-network exercise is an explicit, same-origin read-only health GET.
export async function inspectLiveHealth({fetcher=fetch,timeoutMs=10000}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{const response=await fetcher('/api/health',{method:'GET',credentials:'same-origin',cache:'no-store',signal:controller.signal});const text=await response.text();if(text.length>16000)throw new Error('The response exceeds this inspector’s 16,000-character limit.');let body;try{body=JSON.parse(text);}catch{body=text;}return {status:response.status,headers:{'Content-Type':response.headers.get('content-type')||'(not supplied)'},body};}
 catch(error){if(controller.signal.aborted)throw new Error('The read timed out. Check the connection and try again.');throw error;}
 finally{clearTimeout(timer);}
}
