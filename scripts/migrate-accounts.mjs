import pg from 'pg';
import { getMigrations } from 'better-auth/db/migration';
import { createEmailAuth } from '../server/auth.mjs';
import { databaseUrl } from '../server/database.mjs';
for(const key of ['DATABASE_URL','AUTH_SECRET','AUTH_URL'])if(!process.env[key])throw new Error('Configure '+key+' before migration.');
const config={origin:process.env.AUTH_URL,secret:process.env.AUTH_SECRET};
const pool=new pg.Pool({connectionString:databaseUrl(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL),max:1});
try {
  const auth=createEmailAuth({origin:config.origin,secret:config.secret,database:pool,sendCode:async()=>{throw new Error('Migration does not send email.');}});
  const changes=await getMigrations(auth.options);
  if(changes.schemaProblems.length)throw new Error('Existing account schema needs review before migration.');
  await changes.runMigrations();
  await pool.query(`CREATE TABLE IF NOT EXISTS tc_progress(user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,revision INTEGER NOT NULL CHECK(revision>0),snapshot JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS tc_email_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at TIMESTAMPTZ NOT NULL);`);
  console.log('Verified-email account and progress schemas are ready.');
}finally{await pool.end();}
