import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { hostedConfig,createEmailAuth } from './auth.mjs';
import { emailSender } from './email.mjs';
import { PostgresProgressStore } from './postgres-store.mjs';
import { createHostedHandler } from './hosted-api.mjs';
import { databaseUrl } from './database.mjs';
let runtime;
export function getHostedRuntime(){
  if(runtime)return runtime;
  const config=hostedConfig();
  if(!config)throw new Error('Hosted database is not configured.');
  const pool=new pg.Pool({connectionString:databaseUrl(config.databaseUrl),max:3,idleTimeoutMillis:5000,connectionTimeoutMillis:8000,statement_timeout:10000});
  attachDatabasePool(pool);
  const auth=createEmailAuth({origin:config.origin,secret:config.secret,database:pool,sendCode:emailSender(config,pool)});
  runtime={pool,auth,handler:createHostedHandler({auth,store:new PostgresProgressStore(pool),origin:config.origin})};
  return runtime;
}
