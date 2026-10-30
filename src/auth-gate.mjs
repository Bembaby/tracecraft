import { emailSigninView } from './email-signin.mjs';
import { progressRequest } from './progress-client.mjs';

export const OTP_LIFETIME_MS=300000;
export const canEnterWorkspace=session=>!!(session?.configured&&session.authMethod==='email-code'&&session.user?.emailVerified===true);
const html=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let root=null,email='',sent=false,busy=false,message='',resendAt=0,expiresAt=0,timer=null,generation=0,sessionState={},onVerified=()=>{};
export function authGateView(session={}){
  const ready=session.configured&&session.authMethod==='email-code';
  return `<main id="main" class="auth-gate" tabindex="-1"><a class="auth-brand" href="#play"><span class="brand-mark">t</span>tracecraft <small>alpha</small></a><div class="auth-gate-layout"><section class="auth-welcome"><img src="public/images/arcade-guide-sm.png" alt="" width="210" height="210"><h1>Your coding adventure awaits.</h1><p>Little lessons. Unlimited retries. Progress that follows you.</p><ul><li>Choose an answer or fill in the missing code.</li><li>Collect practice XP, one small win at a time.</li><li>Keep your quests and coding progress in your account.</li></ul></section><section class="auth-card" aria-label="Sign in to TraceCraft">${ready?emailSigninView({email,sent,busy,cooldown:Math.max(0,Math.ceil((resendAt-Date.now())/1000)),expired:sent&&Date.now()>=expiresAt}):`<h2>${session.status==='checking'?'Getting your adventure ready…':'Sign-in is currently unavailable.'}</h2><p>${session.status==='checking'?'Checking the secure account connection.':'This host needs the email account service before you can sign in. Your progress on this device is still here. Try the connection again shortly.'}</p><button class="arcade-primary" data-auth="retry" ${session.status==='checking'?'disabled':''}>Check connection</button>`}<p class="auth-code-expiry" data-auth-expiry ${!sent?'hidden':''}></p><p class="auth-message" role="status" aria-live="polite">${html(message)}</p><p class="auth-session-note">Sign-in is required. A code expires after 5 minutes and works once. Your secure session is remembered for up to 7 days, with renewal while active.</p></section></div><p class="auth-footer">TraceCraft is an alpha. XP records practice, not certification or hiring readiness.</p></main>`;
}
function paint(){if(!root)return;root.innerHTML=authGateView(sessionState);paintTime();}
function paintTime(){
  if(!root||!sent)return;
  const remaining=Math.max(0,Math.ceil((expiresAt-Date.now())/1000)),cooldown=Math.max(0,Math.ceil((resendAt-Date.now())/1000));
  const expiry=root.querySelector('[data-auth-expiry]');if(expiry)expiry.textContent=remaining?`Code expires in ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}.`:'This code expired. Send a new code to continue.';
  const resend=root.querySelector('[data-progress="resend-code"]');if(resend){resend.disabled=busy||cooldown>0;resend.textContent=cooldown?`Resend in ${cooldown}s`:'Send a new code';}
  if(!remaining){const input=root.querySelector('#signin-code');if(input&&!input.disabled){input.disabled=true;input.value='';message='This code expired. Send a new code to continue.';const status=root.querySelector('.auth-message');if(status)status.textContent=message;}const verify=root.querySelector('[data-progress-form="verify-code"] button[type="submit"]');if(verify)verify.disabled=true;}
}
async function send(){
  const gen=generation;busy=true;message='Sending your sign-in code…';paint();
  try{await progressRequest('/api/auth/email-otp/send-verification-otp',{method:'POST',data:{email,type:'sign-in'}});if(gen!==generation)return;sent=true;resendAt=Date.now()+60000;expiresAt=Date.now()+OTP_LIFETIME_MS;message='Check your inbox and spam folder. Use the newest code.';}
  catch(error){if(gen===generation)message=error.message;}
  finally{if(gen===generation){busy=false;paint();root?.querySelector(sent?'#signin-code':'#signin-email')?.focus();}}
}
async function onSubmit(event){
  const form=event.target.closest('[data-progress-form]');if(!form)return;event.preventDefault();if(busy)return;
  const data=new FormData(form);
  if(form.dataset.progressForm==='send-code'){email=String(data.get('email')||'').trim().toLowerCase();await send();return;}
  if(Date.now()>=expiresAt){paintTime();return;}
  const otp=String(data.get('otp')||''),gen=generation;busy=true;message='Verifying your code…';paint();
  try{await progressRequest('/api/auth/sign-in/email-otp',{method:'POST',data:{email,otp}});if(gen!==generation)return;sent=false;email='';message='Signed in. Loading your workspace…';const entered=await onVerified();if(!entered)throw new Error('The session could not be started. Allow cookies and check your connection, then request a new code.');}
  catch(error){if(gen===generation)message=error.message;}
  finally{if(gen===generation){busy=false;paint();root?.querySelector('#signin-code')?.focus();}}
}
async function onClick(event){
  const button=event.target.closest('[data-progress],[data-auth]');if(!button||busy)return;
  if(button.dataset.progress==='change-email'){sent=false;message='';paint();root.querySelector('#signin-email')?.focus();return;}
  if(button.dataset.progress==='resend-code'&&Date.now()>=resendAt){await send();return;}
  if(button.dataset.auth==='retry')await onVerified();
}
export function mountAuthGate(element,session,verified){root=element;sessionState=session;onVerified=verified;root.addEventListener('submit',onSubmit);root.addEventListener('click',onClick);timer=setInterval(paintTime,1000);paint();}
export function unmountAuthGate(){root?.removeEventListener('submit',onSubmit);root?.removeEventListener('click',onClick);clearInterval(timer);root=null;generation++;busy=false;}
