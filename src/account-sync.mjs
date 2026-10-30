import { captureProgress, progressRequest } from './progress-client.mjs';
import { validateProgress } from './progress-contract.mjs';

// A preference and revision, never an authentication token. The session stays HttpOnly.
export const AUTOSAVE_KEY='tracecraft:autosave:v1';
export class AccountSync {
  constructor({storage,request=progressRequest,onStatus=()=>{}}){this.storage=storage;this.request=request;this.onStatus=onStatus;this.user=null;this.config=null;this.last='';this.busy=false;this.status='checking';this.configured=false;this.authMethod=null;this.generation=0;}
  statusChanged(status){this.status=status;this.onStatus({status,user:this.user,enabled:!!this.config,configured:this.configured,authMethod:this.authMethod});}
  async refresh(){
    if(this.busy)return;
    const gen=++this.generation;
    try {
      const session=await this.request('/api/session');if(gen!==this.generation)return;
      this.user=session.user||null;this.configured=session.enabled===true;this.authMethod=session.authMethod;this.config=null;
      if(!this.user){this.statusChanged(session.enabled?'signed-out':'local');return;}
      let saved;try{saved=JSON.parse(this.storage.getItem(AUTOSAVE_KEY));}catch{}
      if(!saved || saved.userId!==String(this.user.id) || !Number.isSafeInteger(saved.revision) || saved.revision<0){this.statusChanged('review');return;}
      const remote=await this.request('/api/progress');if(gen!==this.generation)return;
      if(remote.revision!==saved.revision){this.statusChanged('conflict');return;}
      this.config=saved;
      this.last=remote.snapshot?JSON.stringify(captureProgressFromSnapshot(remote.snapshot)):'';
      this.statusChanged('ready');
    }catch{if(gen===this.generation){this.config=null;this.user=null;this.statusChanged('offline');}}
  }
  enable(user,revision,confirmedSnapshot=captureProgress(this.storage)){
    if(!user || !Number.isSafeInteger(revision) || revision<0)throw new Error('Review account progress first.');
    ++this.generation;this.user=user;this.config={userId:String(user.id),revision};
    this.last=JSON.stringify(validateProgress(confirmedSnapshot));
    try{this.storage.setItem(AUTOSAVE_KEY,JSON.stringify(this.config));}catch{this.config=null;this.statusChanged('storage');return;}
    this.statusChanged(JSON.stringify(captureProgress(this.storage))===this.last?'saved':'ready');
  }
  disable(){++this.generation;this.config=null;try{this.storage.removeItem(AUTOSAVE_KEY);}catch{}this.statusChanged(this.user?'review':'signed-out');}
  clearSession(){this.user=null;this.disable();}
  async tick(){
    if(this.busy || !this.config)return;
    let snapshot;
    try{snapshot=captureProgress(this.storage);}catch{this.statusChanged('storage');return;}
    const fingerprint=JSON.stringify(snapshot);
    if(fingerprint===this.last){if(this.status==='ready')this.statusChanged('saved');return;}
    const config=this.config,gen=this.generation;this.busy=true;this.statusChanged('saving');
    try {
      const session=await this.request('/api/session');if(gen!==this.generation)return;
      if(String(session.user?.id)!==config.userId){this.clearSession();return;}
      const result=await this.request('/api/progress',{method:'PUT',data:{revision:config.revision,snapshot,expectedUserId:config.userId}});if(gen!==this.generation)return;
      if(!Number.isSafeInteger(result.revision))throw new Error('Invalid save response.');
      this.config={...config,revision:result.revision};this.storage.setItem(AUTOSAVE_KEY,JSON.stringify(this.config));this.last=fingerprint;
      this.statusChanged(JSON.stringify(captureProgress(this.storage))===fingerprint?'saved':'ready');
    }catch(error){if(gen===this.generation){
      if([401,409,412].includes(error.status)){if(error.status!==409)this.clearSession();else{this.config=null;this.statusChanged('conflict');}}
      else {this.config=null;this.statusChanged('offline');}
    }}finally{this.busy=false;}
  }
}

// Normalize restored older snapshots before comparing them with the current browser.
const captureProgressFromSnapshot=snapshot=>validateProgress(snapshot);
let instance;
export function accountSync(){return instance;}
export function startAccountSync(onStatus){
  instance=new AccountSync({storage:localStorage,onStatus});
  instance.refresh();
  setInterval(()=>{if(!document.hidden)instance.tick();},2500);
  setInterval(()=>{if(!document.hidden)instance.refresh();},60000);
  window.addEventListener('online',()=>instance.refresh());
  window.addEventListener('storage',event=>{if(event.key===AUTOSAVE_KEY)instance.refresh();});
  window.addEventListener('tracecraft:progress-changed',()=>{if(instance.config&&!instance.busy)instance.statusChanged('ready');});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)instance.refresh();});
  return instance;
}
