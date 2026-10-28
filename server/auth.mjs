import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins/email-otp';

export function hostedConfig(env=process.env) {
  if (!env.DATABASE_URL) return null;
  const required=['AUTH_SECRET','AUTH_URL','RESEND_API_KEY','EMAIL_FROM'];
  if(required.some(key=>!env[key]))throw new Error('Email accounts require AUTH_SECRET, AUTH_URL, RESEND_API_KEY and EMAIL_FROM.');
  const origin=new URL(env.AUTH_URL);
  if(origin.origin!==env.AUTH_URL || (origin.protocol!=='https:' && !['localhost','127.0.0.1'].includes(origin.hostname)))throw new Error('AUTH_URL must be an exact HTTPS origin, or HTTP loopback for development.');
  if(env.AUTH_SECRET.length<32)throw new Error('AUTH_SECRET must contain at least 32 characters.');
  return {origin:origin.origin,secret:env.AUTH_SECRET,databaseUrl:env.DATABASE_URL,emailKey:env.RESEND_API_KEY,emailFrom:env.EMAIL_FROM};
}

export function createEmailAuth({origin,secret,database,sendCode,rateLimitStorage='database',logger={level:'error'}}) {
  return betterAuth({
    appName:'TraceCraft',baseURL:origin,basePath:'/api/auth',secret,database,
    trustedOrigins:[origin],
    emailAndPassword:{enabled:false},
    session:{expiresIn:7*86400,updateAge:86400,cookieCache:{enabled:false}},
    advanced:{useSecureCookies:origin.startsWith('https:'),ipAddress:{ipAddressHeaders:['x-real-ip']}},
    rateLimit:{enabled:true,storage:rateLimitStorage,window:60,max:30,
      customRules:{'/email-otp/send-verification-otp':{window:60,max:1},'/sign-in/email-otp':{window:300,max:5}}},
    plugins:[emailOTP({otpLength:6,expiresIn:300,allowedAttempts:3,storeOTP:'hashed',
      async sendVerificationOTP({email,otp,type}) {
        if(type!=='sign-in')throw new Error('Only verified email sign-in is enabled.');
        await sendCode({email,otp});
      }})],
    logger,
  });
}
