import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash } from 'node:crypto';
import { validateProgress } from '../src/progress-contract.mjs';

export const secret = () => randomBytes(32).toString('base64url');
export const hash = value => createHash('sha256').update(value).digest('base64url');
export class ProgressStore {
  constructor(path) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, login TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS oauth(state_hash TEXT PRIMARY KEY, browser_hash TEXT NOT NULL, verifier TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS progress(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, revision INTEGER NOT NULL, snapshot TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  }
  close() { this.db.close(); }
  prune(now=Date.now()) {
    this.db.prepare('DELETE FROM sessions WHERE expires <= ?').run(now);
    this.db.prepare('DELETE FROM oauth WHERE expires <= ?').run(now);
  }
  beginLogin() {
    this.prune();
    if (this.db.prepare('SELECT count(*) AS n FROM oauth').get().n >= 1000) throw new Error('Sign-in is busy. Try again later.');
    const state=secret(), browser=secret(), verifier=secret();
    this.db.prepare('INSERT INTO oauth VALUES(?,?,?,?)').run(hash(state),hash(browser),verifier,Date.now()+600000);
    return {state,browser,verifier};
  }
  consumeLogin(state,browser) {
    const row=this.db.prepare('DELETE FROM oauth WHERE state_hash=? AND browser_hash=? AND expires>? RETURNING verifier').get(hash(state),hash(browser),Date.now());
    return row?.verifier;
  }
  login(id,login) {
    this.prune();
    this.db.prepare('INSERT INTO users VALUES(?,?) ON CONFLICT(id) DO UPDATE SET login=excluded.login').run(id,login);
    const token=secret();
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),id,Date.now()+7*86400000);
    return token;
  }
  user(token) {
    return token ? this.db.prepare('SELECT users.id, users.login FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires>?').get(hash(token),Date.now()) : undefined;
  }
  logout(token) { this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token)); }
  read(id) {
    const row=this.db.prepare('SELECT revision,snapshot,updated_at FROM progress WHERE user_id=?').get(id);
    return row ? {revision:row.revision,snapshot:JSON.parse(row.snapshot),updatedAt:row.updated_at} : {revision:0,snapshot:null,updatedAt:null};
  }
  write(id,expectedRevision,raw) {
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision<0) throw new Error('A valid revision is required.');
    const snapshot=JSON.stringify(validateProgress(raw));
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (this.read(id).revision !== expectedRevision) { this.db.exec('ROLLBACK'); return null; }
      this.db.prepare(`INSERT INTO progress VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET revision=excluded.revision,snapshot=excluded.snapshot,updated_at=excluded.updated_at`)
        .run(id,expectedRevision+1,snapshot,new Date().toISOString());
      this.db.exec('COMMIT');
      return this.read(id);
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  deleteAccount(id) { this.db.prepare('DELETE FROM users WHERE id=?').run(id); }
}
