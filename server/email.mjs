import { randomUUID, createHmac } from 'node:crypto';

export async function takeEmailQuota(pool,key,limit,expiresAt) {
  const {rows}=await pool.query(`INSERT INTO tc_email_limits(key,count,expires_at) VALUES($1,1,$3)
    ON CONFLICT(key) DO UPDATE SET count=tc_email_limits.count+1 WHERE tc_email_limits.count<$2 RETURNING count`,[key,limit,expiresAt]);
  if(!rows.length)throw new Error('Verification email limit reached. Try again later.');
}

export function codeMessage(otp) {
  if(!/^\d{6}$/.test(otp))throw new Error('Invalid sign-in code.');
  return {subject:'Your TraceCraft sign-in code',text:`Your TraceCraft sign-in code is ${otp}.\n\nIt expires in 5 minutes and can only be used once. Enter it in the browser where you requested it.\n\nIf you did not request this code, ignore this email. Do not share this code with anyone.`,
    html:`<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;color:#18201b;background:#f5f7f1;padding:24px"><main style="max-width:520px;margin:auto"><h1 style="font-size:24px">Sign in to TraceCraft</h1><p style="font-size:16px;line-height:1.6">Enter this code in the browser where you requested it.</p><p style="font:32px monospace;letter-spacing:6px">${otp}</p><p style="font-size:16px;line-height:1.6">Expires in 5 minutes. This code works once.</p><p style="font-size:16px;line-height:1.6">If you did not request this email, ignore it. Do not share your code.</p></main></body></html>`};
}

export function emailSender(config,pool,{fetcher=fetch}={}) {
  return async({email,otp})=>{
    const now=new Date(), day=now.toISOString().slice(0,10), hour=now.toISOString().slice(0,13);
    const key=createHmac('sha256',config.secret).update(email.toLowerCase()).digest('hex');
    await pool.query('DELETE FROM tc_email_limits WHERE expires_at < now()');
    await takeEmailQuota(pool,`address:${key}:${hour}`,3,new Date(now.getTime()+2*3600000));
    await takeEmailQuota(pool,`daily:${day}`,50,new Date(now.getTime()+2*86400000));
    const id=randomUUID(),message=codeMessage(otp);
    for(let attempt=0;attempt<2;attempt++) {
      try {
        const response=await fetcher('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
          headers:{Authorization:'Bearer '+config.emailKey,'Content-Type':'application/json','Idempotency-Key':'tracecraft-code-'+id},
          body:JSON.stringify({from:config.emailFrom,to:[email],...message})});
        if(response.ok)return;
        if(response.status<500 && response.status!==429)throw Object.assign(new Error('Email delivery could not be started.'),{permanent:true});
      }catch(error){if(error.permanent || attempt===1)throw new Error('Email delivery is unavailable. Request a new code shortly.');}
      if(attempt===0)await new Promise(resolve=>setTimeout(resolve,500));
    }
    throw new Error('Email delivery is unavailable. Request a new code shortly.');
  };
}
