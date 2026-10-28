import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ProgressStore, hash } from './progress-store.mjs';
import { PROGRESS_LIMIT } from '../src/progress-contract.mjs';

export function progressConfig(env=process.env) {
  const values=[env.TRACECRAFT_ORIGIN,env.GITHUB_CLIENT_ID,env.GITHUB_CLIENT_SECRET];
  if (values.every(x=>!x)) return null;
  if (!values.every(Boolean)) throw new Error('Configure TRACECRAFT_ORIGIN, GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET together.');
  const url=new URL(env.TRACECRAFT_ORIGIN);
  if (url.origin!==env.TRACECRAFT_ORIGIN || url.username || url.password || (url.protocol!=='https:' && !(url.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(url.hostname)))) throw new Error('TRACECRAFT_ORIGIN must be an HTTPS origin, or HTTP loopback for development.');
  return {origin:url.origin,clientId:env.GITHUB_CLIENT_ID,clientSecret:env.GITHUB_CLIENT_SECRET,database:resolve(env.TRACECRAFT_DB||'.tracecraft/progress.sqlite')};
}

export async function createProgressApi(config,{fetchProvider=fetch,store}={}) {
  if (config && !store) { await mkdir(dirname(config.database),{recursive:true}); store=new ProgressStore(config.database); }
  const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  const cookie=(name,value,age)=>`${name}=${value}; Path=/api; HttpOnly; SameSite=Lax; Max-Age=${age}${config.origin.startsWith('https:')?'; Secure':''}`;
  const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')).filter(x=>x.length===2));
  const redirect=(res,url)=>{res.writeHead(303,{Location:url,'Cache-Control':'no-store'});res.end();};
  const provider=async(url,options)=>{
    const response=await fetchProvider(url,{...options,redirect:'error',signal:AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('GitHub sign-in is unavailable.');
    return response.json();
  };
  async function body(req) {
    if (req.headers['content-type']?.split(';')[0]!=='application/json') throw new Error('Send JSON progress data.');
    let length=0;const chunks=[];
    for await (const chunk of req) {length+=chunk.length;if(length>PROGRESS_LIMIT){const error=new Error('Progress exceeds the 16 MB limit.');error.status=413;throw error;}chunks.push(chunk);}
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  const handler=async(req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if (!url.pathname.startsWith('/api/')) return false;
    res.setHeader('Cache-Control','no-store');
    if (url.pathname==='/api/session' && req.method==='GET') {json(res,200,{enabled:Boolean(config),user:config?store.user(cookies(req).tc_session)||null:null});return true;}
    if (!config) {json(res,503,{error:'Account sync is not configured on this host. Local practice still works.'});return true;}
    const mutating=!['GET','HEAD'].includes(req.method);
    if (mutating && req.headers.origin!==config.origin) {json(res,403,{error:'A same-origin request is required.'});return true;}
    try {
      if (url.pathname==='/api/auth/github/start' && req.method==='POST') {
        const flow=store.beginLogin();
        res.setHeader('Set-Cookie',cookie('tc_oauth',flow.browser,600));
        const auth=new URL('https://github.com/login/oauth/authorize');
        auth.search=new URLSearchParams({client_id:config.clientId,redirect_uri:config.origin+'/api/auth/github/callback',scope:'',state:flow.state,code_challenge:hash(flow.verifier),code_challenge_method:'S256'}).toString();
        redirect(res,auth.href);return true;
      }
      if (url.pathname==='/api/auth/github/callback' && req.method==='GET') {
        const verifier=store.consumeLogin(url.searchParams.get('state')||'',cookies(req).tc_oauth||'');
        res.setHeader('Set-Cookie',cookie('tc_oauth','',0));
        if (!verifier || !url.searchParams.get('code') || url.searchParams.has('error')) {redirect(res,config.origin+'/#progress/signin-failed');return true;}
        try {
          const token=await provider('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,code:url.searchParams.get('code'),redirect_uri:config.origin+'/api/auth/github/callback',code_verifier:verifier})});
          if (typeof token.access_token!=='string' || token.error) throw new Error('Token exchange failed.');
          const identity=await provider('https://api.github.com/user',{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token.access_token,'User-Agent':'TraceCraft'}});
          if (!Number.isSafeInteger(identity.id) || identity.id<=0 || typeof identity.login!=='string' || !/^[a-zA-Z0-9-]{1,39}$/.test(identity.login)) throw new Error('Invalid GitHub identity.');
          // Never persist the provider token. The session holds only a GitHub ID.
          const old=cookies(req).tc_session;if(old)store.logout(old);
          const session=store.login(String(identity.id),identity.login);
          res.setHeader('Set-Cookie',[cookie('tc_oauth','',0),cookie('tc_session',session,7*86400)]);
          redirect(res,config.origin+'/#progress');
        } catch {redirect(res,config.origin+'/#progress/signin-failed');}
        return true;
      }
      const user=store.user(cookies(req).tc_session);
      if (!user) {json(res,401,{error:'Sign in again to synchronize progress. Your local work is safe.'});return true;}
      if (mutating && req.headers['x-tracecraft-sync']!=='1') {json(res,403,{error:'A TraceCraft request header is required.'});return true;}
      if (url.pathname==='/api/logout' && req.method==='POST') {store.logout(cookies(req).tc_session);res.setHeader('Set-Cookie',cookie('tc_session','',0));json(res,200,{ok:true});return true;}
      if (url.pathname==='/api/progress' && req.method==='GET') {json(res,200,store.read(user.id));return true;}
      if (url.pathname==='/api/progress' && req.method==='PUT') {
        const data=await body(req);const result=store.write(user.id,data.revision,data.snapshot);
        json(res,result?200:409,result||{error:'Another device saved a newer revision. Review both copies again.'});return true;
      }
      if (url.pathname==='/api/account' && req.method==='DELETE') {
        const data=await body(req);
        if(data.confirm!=='DELETE')throw new Error('Type DELETE to confirm account-data deletion.');
        store.deleteAccount(user.id);res.setHeader('Set-Cookie',cookie('tc_session','',0));json(res,200,{ok:true});return true;
      }
      json(res,404,{error:'Unknown account endpoint.'});
    } catch(error) {json(res,error.status||400,{error:error.status===413?error.message:'The request could not be saved. Check the backup format and try again.'});}
    return true;
  };
  return {handler,close:()=>store?.close()};
}
