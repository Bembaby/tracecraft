// Portable local evidence. Completion is self-reported; checks are practice evidence.
import { CONTENT_REVISION, RUNTIME_VERSIONS, attemptVersions } from './practice-versions.mjs';
export const TRAINING_KEY = 'tracecraft:training:v1';
export const SESSION_SECONDS = 120 * 60;
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function afterDays(key, count) {
  const [year, month, day] = key.split('-').map(Number);
  return dayKey(new Date(year, month - 1, day + count, 12));
}
export function freshTraining() {
  return {version:1, selectedDay:'w1d1', done:[], blocks:{}, drafts:{}, explanations:{}, help:{}, fresh:{}, attempts:[], reviews:{}, notes:{}, session:{date:dayKey(), remaining:SESSION_SECONDS}};
}
const safeKey = /^[a-zA-Z0-9:_-]{1,120}$/;
const dateKey = /^\d{4}-\d{2}-\d{2}$/;
function textMap(source, maxLength) {
  const result = {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return result;
  for (const [key,value] of Object.entries(source).slice(-600)) {
    if(safeKey.test(key) && !['__proto__','prototype','constructor'].includes(key) && typeof value === 'string') result[key]=value.slice(0,maxLength);
  }
  return result;
}
export function validateTraining(raw) {
  if(!raw || raw.version !== 1 || typeof raw !== 'object') throw new Error('This file is not a supported TraceCraft training backup.');
  const state = freshTraining();
  if(/^w[1-8]d[1-7]$/.test(raw.selectedDay)) state.selectedDay=raw.selectedDay;
  state.done=[...new Set(Array.isArray(raw.done)?raw.done.filter(id=>/^w[1-8]d[1-7]$/.test(id)):[])];
  state.drafts=textMap(raw.drafts,20000);
  state.explanations=textMap(raw.explanations,6000);
  state.notes=textMap(raw.notes,6000);
  state.fresh=Object.fromEntries(Object.entries(textMap(raw.fresh,10)).filter(([,date])=>dateKey.test(date)));
  state.help=Object.fromEntries(Object.entries(textMap(raw.help,20)).filter(([,value])=>['hint','solution'].includes(value)));
  if(raw.blocks && typeof raw.blocks==='object') {
    for(const [key,value] of Object.entries(raw.blocks).slice(-56)) if(/^w[1-8]d[1-7]$/.test(key)&&Array.isArray(value)) state.blocks[key]=[...new Set(value.filter(id=>typeof id==='string'&&safeKey.test(id)))].slice(0,7);
  }
  if(Array.isArray(raw.attempts)) state.attempts=raw.attempts.slice(-500).filter(a=>a&&['sql','python'].includes(a.type)&&typeof a.exercise==='string'&&safeKey.test(a.exercise)&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))).map(a=>({...attemptVersions(a),type:a.type,exercise:a.exercise,at:a.at,passed:a.passed===true,help:['hint','solution','continued'].includes(a.help)?a.help:'independent',code:typeof a.code==='string'?a.code.slice(0,20000):''}));
  if(raw.reviews&&typeof raw.reviews==='object') for(const [key,value] of Object.entries(raw.reviews).slice(0,100)) {
    if(safeKey.test(key)&&!['__proto__','constructor','prototype'].includes(key)&&value&&dateKey.test(value.due)) state.reviews[key]={due:value.due,stage:Math.max(0,Math.min(4,Math.floor(Number(value.stage)||0))),lastIndependentDay:dateKey.test(value.lastIndependentDay)?value.lastIndependentDay:null};
  }
  if(raw.session?.date===dayKey()&&Number.isFinite(raw.session.remaining)) state.session.remaining=Math.min(SESSION_SECONDS,Math.max(0,raw.session.remaining));
  return state;
}
export function helpFor(state,key,date=dayKey()) {return state.help[`${date}:${key}`] || 'independent';}
export function recordHelp(state,key,mode,date=dayKey()) {
  const id=`${date}:${key}`;
  if(state.help[id]!=='solution') state.help[id]=mode;
}
export function recordAttempt(state,{type,exercise,passed,code},now=new Date()) {
  const key=`${type}:${exercise}`,today=dayKey(now);
  let help=helpFor(state,key,today);
  const previousPass=state.attempts.some(a=>a.type===type&&a.exercise===exercise&&a.passed&&dayKey(new Date(a.at))!==today);
  if(help==='independent' && previousPass && state.fresh[key]!==today) help='continued';
  const attempt={type,exercise,passed:passed===true,code:code.slice(0,20000),at:now.toISOString(),help,contentRevision:CONTENT_REVISION,runtimeVersion:RUNTIME_VERSIONS[type]};
  state.attempts.push(attempt);state.attempts=state.attempts.slice(-500);
  const old=state.reviews[key];
  if(passed && help==='independent') {
    // Multiple presses on the same day cannot advance the review schedule.
    const stage=old?.lastIndependentDay===today||old?.due>today?Math.max(1,old.stage):Math.min(4,(old?.stage||0)+1);
    state.reviews[key]={stage,lastIndependentDay:today,due:afterDays(today,[1,1,3,7,14][stage])};
  } else state.reviews[key]={stage:0,lastIndependentDay:old?.lastIndependentDay||null,due:afterDays(today,1)};
  return attempt;
}
export function dueReviews(state,today=dayKey()) {return Object.entries(state.reviews).filter(([,r])=>r.due<=today).map(([key,r])=>({key,...r}));}

export function startFreshAttempt(state,key,starter='',today=dayKey()) {
  if(typeof state.drafts[key]==='string'&&state.drafts[key].trim()) state.drafts['archive:'+key]=state.drafts[key];
  state.drafts[key]=starter;
  state.fresh[key]=today;
}
