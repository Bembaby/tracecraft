import { HOSTED_PROGRESS_LIMIT } from './postgres-store.mjs';
const routes=new Set(['/api/auth/email-otp/send-verification-otp','/api/auth/sign-in/email-otp','/api/auth/sign-out']);
const publicUser=user=>user?{id:user.id,login:user.name||user.email,email:user.email,emailVerified:user.emailVerified===true}:null;
const json=(status,data,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});

async function readBody(request,max=HOSTED_PROGRESS_LIMIT) {
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw Object.assign(new Error('Send JSON data.'),{status:400});
  const reader=request.body?.getReader();let length=0;const chunks=[];
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw Object.assign(new Error('Account requests must be smaller than 4 MB.'),{status:413});}chunks.push(Buffer.from(value));}
  try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw Object.assign(new Error('Send a valid JSON object.'),{status:400});}
}

export function createHostedHandler({auth,store,origin}) {
  return async request=>{
    const path=new URL(request.url).pathname,mutating=!['GET','HEAD'].includes(request.method);
    if(mutating && (request.headers.get('origin')!==origin || request.headers.get('x-tracecraft-sync')!=='1'))return json(403,{error:'Use a same-origin TraceCraft request.'});
    try {
      if(path==='/api/health'){await store.health?.();return json(200,{status:'ok',accounts:'email-code',content:'alpha'});}
      if(path.startsWith('/api/auth/')) {
        if(!routes.has(path)||request.method!=='POST')return json(404,{error:'Unknown sign-in endpoint.'});
        const body=await readBody(request,4096);
        if(path.endsWith('send-verification-otp'))body.type='sign-in';
        if('email' in body && (typeof body.email!=='string'||body.email.length>254))return json(400,{error:'Enter a valid email address.'});
        const next=new Request(request.url,{method:'POST',headers:request.headers,body:JSON.stringify(body)});
        const response=await auth.handler(next);
        // Better Auth manages cookies; opaque session tokens never enter browser JSON.
        const headers=new Headers({'Cache-Control':'no-store','Content-Type':'application/json'});
        for(const value of response.headers.getSetCookie())headers.append('Set-Cookie',value);
        const retry=response.headers.get('x-retry-after');if(retry)headers.set('Retry-After',retry);
        return new Response(JSON.stringify(response.ok?{ok:true}:{error:response.status===429?'Too many requests. Wait a minute before trying again.':'The code could not be sent or verified. Check your email and try again.'}),{status:response.status,headers});
      }
      const current=await auth.api.getSession({headers:request.headers});
      const user=current?.user?.emailVerified?current.user:null;
      if(path==='/api/session'&&request.method==='GET')return json(200,{enabled:true,authMethod:'email-code',maxProgressBytes:HOSTED_PROGRESS_LIMIT,user:publicUser(user)});
      if(!user)return json(401,{error:'Verify your email to access account progress. Local work is safe.'});
      if(path==='/api/progress'&&request.method==='GET')return json(200,await store.read(user.id));
      if(path==='/api/progress'&&request.method==='PUT') {
        const data=await readBody(request);
        if(data.expectedUserId!==undefined && data.expectedUserId!==String(user.id))return json(412,{error:'The signed-in account changed. Review progress before saving.'});
        const saved=await store.write(user.id,data.revision,data.snapshot);
        return saved?json(200,saved):json(409,{error:'Another browser saved a newer revision. Review both copies again.'});
      }
      if(path==='/api/account'&&request.method==='DELETE') {
        const data=await readBody(request,4096);if(data.confirm!=='DELETE')return json(400,{error:'Type DELETE to confirm deletion.'});
        await store.deleteAccount(user.id);return json(200,{ok:true});
      }
      return json(404,{error:'Unknown account endpoint.'});
    }catch(error){if(error.status)return json(error.status,{error:error.message});console.error('TraceCraft account request failed',{path,name:error.name});return json(503,{error:'Account service is unavailable. Your local work is safe. Try again shortly.'});}
  };
}
