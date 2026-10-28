import { CONTENT_REVISION, validateProgress, PROGRESS_LIMIT } from './progress-contract.mjs';

export const WORKSPACE_KEYS = {training:'tracecraft:training:v1',design:'tracecraft:system-design:v1',legacy:'tracecraft:v1'};
export const RECOVERY_KEY = 'tracecraft:sync:recovery:v1';
export const RESTORED_KEY = 'tracecraft:sync:restored:v1';

export function captureProgress(storage) {
  const workspaces=Object.fromEntries(Object.entries(WORKSPACE_KEYS).map(([name,key])=>{
    const saved=storage.getItem(key);
    return [name,saved===null?null:JSON.parse(saved)];
  }));
  return validateProgress({format:'tracecraft-progress',version:1,contentRevision:CONTENT_REVISION,workspaces});
}
export const workspaceFingerprint = storage => JSON.stringify(Object.values(WORKSPACE_KEYS).map(key=>storage.getItem(key)));

export function restoreProgress(storage,snapshot,expectedFingerprint) {
  if (workspaceFingerprint(storage)!==expectedFingerprint) throw new Error('Local work changed after this review. Review both copies again.');
  const next=validateProgress(snapshot);
  const old=Object.fromEntries(Object.values(WORKSPACE_KEYS).map(key=>[key,storage.getItem(key)]));
  // A quota failure here aborts before touching any existing workspace.
  storage.setItem(RECOVERY_KEY,JSON.stringify(captureProgress(storage)));
  try {
    for (const [name,key] of Object.entries(WORKSPACE_KEYS)) {
      if(next.workspaces[name]===null)storage.removeItem(key);else storage.setItem(key,JSON.stringify(next.workspaces[name]));
    }
    storage.setItem(RESTORED_KEY,String(Date.now())+Math.random());
  } catch(error) {
    let rollbackFailed=false;
    for(const [key,value] of Object.entries(old))try {if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{rollbackFailed=true;}
    throw new Error(rollbackFailed?'Browser storage failed. Export the local recovery copy before closing.':'Browser storage failed. Existing work was restored; export a backup before retrying.',{cause:error});
  }
  return next;
}

export async function progressRequest(path,{method='GET',data,fetcher=fetch}={}) {
  const response=await fetcher(path,{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(20000),
    headers:{'X-TraceCraft-Sync':'1',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
  let result;
  try {const text=await response.text();if(text.length>PROGRESS_LIMIT+1000)throw new Error();result=JSON.parse(text);}catch{throw new Error('Account sync is unavailable on this host. Your local work is safe.');}
  if(!response.ok){const error=new Error(result.error||'Sync failed. Your local work is safe.');error.status=response.status;throw error;}
  return result;
}
