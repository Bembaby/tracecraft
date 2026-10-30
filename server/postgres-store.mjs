import { validateProgress } from '../src/progress-contract.mjs';
export const HOSTED_PROGRESS_LIMIT=4_000_000;

const result=row=>row?{revision:row.revision,snapshot:row.snapshot,updatedAt:new Date(row.updated_at).toISOString()}:{revision:0,snapshot:null,updatedAt:null};
export class PostgresProgressStore {
  constructor(pool){this.pool=pool;}
  async health(){await this.pool.query('SELECT 1 FROM "user" LIMIT 1');await this.pool.query('SELECT 1 FROM tc_progress LIMIT 1');}
  async read(userId){return result((await this.pool.query('SELECT revision,snapshot,updated_at FROM tc_progress WHERE user_id=$1',[userId])).rows[0]);}
  async write(userId,revision,raw) {
    if(!Number.isSafeInteger(revision)||revision<0)throw Object.assign(new Error('A valid revision is required.'),{status:400});
    let snapshot;
    try{snapshot=JSON.stringify(validateProgress(raw));}catch{throw Object.assign(new Error('Send a supported complete progress snapshot.'),{status:400});}
    if(Buffer.byteLength(snapshot,'utf8')>HOSTED_PROGRESS_LIMIT)throw Object.assign(new Error('Account snapshots are limited to 4 MB. Export older attempts before syncing.'),{status:413});
    const sql=revision===0?`INSERT INTO tc_progress(user_id,revision,snapshot,updated_at) VALUES($1,1,$2::jsonb,now()) ON CONFLICT(user_id) DO NOTHING RETURNING revision,snapshot,updated_at`
      :`UPDATE tc_progress SET revision=revision+1,snapshot=$2::jsonb,updated_at=now() WHERE user_id=$1 AND revision=$3 RETURNING revision,snapshot,updated_at`;
    const {rows}=await this.pool.query(sql,revision===0?[userId,snapshot]:[userId,snapshot,revision]);
    return rows.length?result(rows[0]):null;
  }
  async deleteAccount(userId){await this.pool.query('DELETE FROM "user" WHERE id=$1',[userId]);}
}
