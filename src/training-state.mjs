import {freshTcs,validateTcs} from './tcs-state.mjs';
import {freshApiProgress,validateApiProgress} from './api-course-state.mjs';
import {freshCoach,validateCoach,coachSnapshot} from './learning-coach-state.mjs';
import { CURRICULUM_MODULES } from './curriculum.mjs';
import {JAVA_LABS} from './java-content.mjs';
import {freshLearning,validateLearning} from './beginner-state.mjs';
import { freshArcade, validateArcade } from './arcade-state.mjs';
import { freshCourse, validateCourse, remainingMock } from './interview-course-state.mjs';
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
  return {version:1, apis:freshApiProgress(), tcs:freshTcs(), coach:freshCoach(), selectedDay:'w1d1', done:[], blocks:{}, drafts:{}, practiceKinds:{}, javaInputs:{}, explanations:{}, milestones:{}, help:{}, helpDetails:{}, documentationUse:{}, fresh:{}, attempts:[], reviews:{}, notes:{}, learning:freshLearning(), arcade:freshArcade(), course:freshCourse(), session:{date:dayKey(), remaining:SESSION_SECONDS}};
}
export function trainingSnapshot(state,now=Date.now()){
  const active=state.course?.active;
  return {...state,coach:coachSnapshot(state.coach||freshCoach(),now),course:{...state.course,active:active?{...active,remaining:remainingMock(active,now),runningSince:null}:null}};
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
export function executionSummary(value){
  if(!value||typeof value!=='object')return undefined;
  const text=(v,max)=>typeof v==='string'?v.slice(0,max):'';
  const tables=items=>Array.isArray(items)?items.slice(0,2).map(t=>({columns:Array.isArray(t.columns)?t.columns.slice(0,8).map(c=>text(c,80)):[],values:Array.isArray(t.values)?t.values.slice(0,5).map(row=>Array.isArray(row)?row.slice(0,8).map(v=>v===null||typeof v==='number'||typeof v==='boolean'?v:text(v,100)):[]):[]})):[];
  return {stdout:text(value.stdout,2000),stderr:text(value.stderr,1000),error:text(value.error,1500),phase:text(value.phase,30),checks:Array.isArray(value.checks)?value.checks.slice(0,12).map(c=>({label:text(c.label||c.name,100),passed:c.passed===true,error:text(c.error,400),expected:tables(c.expected),actual:tables(c.actual)})):[]};
}
const assistanceLevels=['nudge','question','example','scaffold','solution','documentation'];
const assistanceRank={independent:-1,documentation:0,nudge:1,question:2,example:3,scaffold:4,solution:5};
export function validateTraining(raw) {
  if(!raw || raw.version !== 1 || typeof raw !== 'object') throw new Error('This file is not a supported TraceCraft training backup.');
  const state = freshTraining();
  state.apis=validateApiProgress(raw.apis);
  state.coach=validateCoach(raw.coach);
  state.tcs=validateTcs(raw.tcs);
  state.learning=validateLearning(raw.learning);
  state.arcade=validateArcade(raw.arcade);
  state.course=validateCourse(raw.course);
  if(/^w[1-8]d[1-7]$/.test(raw.selectedDay)) state.selectedDay=raw.selectedDay;
  state.done=[...new Set(Array.isArray(raw.done)?raw.done.filter(id=>/^w[1-8]d[1-7]$/.test(id)):[])];
  state.drafts=textMap(raw.drafts,20000);
  state.practiceKinds=Object.fromEntries(Object.entries(textMap(raw.practiceKinds,20)).filter(([,value])=>['blank','starter','debug'].includes(value)));
  state.explanations=textMap(raw.explanations,6000);
  state.notes=textMap(raw.notes,6000);
  for(const lab of JAVA_LABS){const input=raw.javaInputs?.[lab.id];if(input&&typeof input.text==='string')state.javaInputs[lab.id]={text:input.text.slice(0,10000),emptyArgument:input.emptyArgument===true};}
  state.fresh=Object.fromEntries(Object.entries(textMap(raw.fresh,10)).filter(([,date])=>dateKey.test(date)));
  if(raw.milestones && typeof raw.milestones==='object')for(const module of CURRICULUM_MODULES){const key='week'+module.week,checks=raw.milestones[key];if(Array.isArray(checks))state.milestones[key]=[...new Set(checks.filter(id=>module.checks.some(([known])=>id===known)))];}
  state.help=Object.fromEntries(Object.entries(textMap(raw.help,20)).filter(([,value])=>['hint','solution'].includes(value)));
  state.documentationUse=Object.fromEntries(Object.entries(textMap(raw.documentationUse,10)).filter(([,value])=>value==='used'));
  state.helpDetails=Object.fromEntries(Object.entries(textMap(raw.helpDetails,30)).filter(([,value])=>assistanceLevels.includes(value)));
  if(raw.blocks && typeof raw.blocks==='object') {
    for(const [key,value] of Object.entries(raw.blocks).slice(-56)) if(/^w[1-8]d[1-7]$/.test(key)&&Array.isArray(value)) state.blocks[key]=[...new Set(value.filter(id=>typeof id==='string'&&safeKey.test(id)))].slice(0,7);
  }
  if(Array.isArray(raw.attempts)) state.attempts=raw.attempts.slice(-500).filter(a=>a&&['sql','python','java'].includes(a.type)&&typeof a.exercise==='string'&&safeKey.test(a.exercise)&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))).map(a=>({...attemptVersions(a),type:a.type,exercise:a.exercise,at:a.at,passed:a.passed===true,help:['hint','solution','continued'].includes(a.help)?a.help:'independent',code:typeof a.code==='string'?a.code.slice(0,20000):'',...(['blank','starter','debug'].includes(a.attemptKind)?{attemptKind:a.attemptKind}:{}),...(a.documentationUsed===true?{documentationUsed:true}:{}),...(assistanceLevels.includes(a.assistance)?{assistance:a.assistance}:{}),...(a.execution?{execution:executionSummary(a.execution)}:{})}));
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
export function recordAssistance(state,key,level,date=dayKey()){
  if(!assistanceLevels.includes(level))throw new Error('Choose a supported assistance level.');
  const id=`${date}:${key}`,previous=state.helpDetails?.[id]||(state.help[id]==='solution'?'solution':state.help[id]==='hint'?'nudge':'independent');
  recordHelp(state,key,level==='solution'?'solution':'hint',date);
  if(level==='documentation'){state.documentationUse??={};state.documentationUse[`${date}:${key}`]='used';}
  state.helpDetails??={};
  if(state.help[id]==='solution')state.helpDetails[id]='solution';else state.helpDetails[id]=assistanceRank[previous]>assistanceRank[level]?previous:level;
}
export function draftAssistance(state,key,today=dayKey()){
  let level='independent';const fresh=state.fresh[key]||'';
  for(const [id,mode] of Object.entries(state.help)){
    const date=id.slice(0,10);if(!dateKey.test(date)||date>today||fresh>date||!id.endsWith(':'+key))continue;
    if(mode==='solution')return 'solution';
    const candidate=state.helpDetails?.[id]||'nudge';if(assistanceRank[candidate]>assistanceRank[level])level=candidate;
  }
  return level;
}
export function recordAttempt(state,{type,exercise,passed,code,result},now=new Date()) {
  const key=`${type}:${exercise}`,today=dayKey(now);
  let help=helpFor(state,key,today);
  const assistance=draftAssistance(state,key,today);
  if(assistance!=='independent'){recordAssistance(state,key,assistance,today);help=helpFor(state,key,today);}
  const previousPass=state.attempts.some(a=>a.type===type&&a.exercise===exercise&&a.passed&&dayKey(new Date(a.at))!==today);
  if(help==='independent' && previousPass && state.fresh[key]!==today) help='continued';
  const attempt={type,exercise,passed:passed===true,code:code.slice(0,20000),at:now.toISOString(),help,contentRevision:CONTENT_REVISION,runtimeVersion:RUNTIME_VERSIONS[type]};
  if(assistance!=='independent')attempt.assistance=assistance;
  if(state.practiceKinds?.[key])attempt.attemptKind=state.practiceKinds[key];
  if(Object.keys(state.documentationUse||{}).some(id=>id.endsWith(':'+key)&&id.slice(0,10)<=today&&(state.fresh[key]||'')<=id.slice(0,10)))attempt.documentationUsed=true;
  if(result)attempt.execution=executionSummary(result);
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
  state.practiceKinds??={};state.practiceKinds[key]=starter===''?'blank':'starter';
  state.fresh[key]=today;
}
