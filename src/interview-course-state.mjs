import {INTERVIEW_UNITS,UNIT_BY_ID,MOCK_BY_ID,courseUnitsFor,INTERVIEW_COURSE_REVISION} from './interview-course-content.mjs';
export const freshCourse=()=>({version:1,target:'both',read:[],notes:{},selfChecks:{},active:null,history:[]});
const validDate=value=>typeof value==='string'&&value.length<=40&&Number.isFinite(Date.parse(value));
const text=value=>typeof value==='string'?value.slice(0,3000):'';
function validateMock(raw,history=false){
  const mock=MOCK_BY_ID.get(raw?.id);if(!mock||!validDate(raw.startedAt))return null;
  const entry={id:mock.id,startedAt:raw.startedAt,remaining:Number.isFinite(raw.remaining)?Math.max(0,Math.min(mock.minutes*60,raw.remaining)):mock.minutes*60,runningSince:null,responses:{},selfChecks:[]};
  for(let i=0;i<mock.prompts.length;i++)if(typeof raw.responses?.[i]==='string')entry.responses[i]=text(raw.responses[i]);
  if(Array.isArray(raw.selfChecks))entry.selfChecks=[...new Set(raw.selfChecks.filter(id=>mock.checks.some(([known])=>known===id)))];
  if(history){
    if(!validDate(raw.finishedAt))return null;entry.finishedAt=raw.finishedAt;
    entry.courseRevision=typeof raw.courseRevision==='string'?raw.courseRevision.slice(0,40):'historical';
    entry.evidence=mock.tasks.map(task=>{const saved=Array.isArray(raw.evidence)?raw.evidence.find(item=>item?.key===task.type+':'+task.id):null;const version=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,80}$/.test(value)?value:'historical-unversioned';return {key:task.type+':'+task.id,status:['independent','assisted','retry','unattempted'].includes(saved?.status)?saved.status:'unattempted',at:validDate(saved?.at)?saved.at:null,contentRevision:version(saved?.contentRevision),runtimeVersion:version(saved?.runtimeVersion)};});
  }
  return entry;
}
export function validateCourse(raw){
  const state=freshCourse();if(!raw||raw.version!==1)return state;
  if(['both','backend','fullstack'].includes(raw.target))state.target=raw.target;
  if(Array.isArray(raw.read))state.read=[...new Set(raw.read.filter(id=>UNIT_BY_ID.has(id)))];
  for(const unit of INTERVIEW_UNITS){
    if(typeof raw.notes?.[unit.id]==='string')state.notes[unit.id]=raw.notes[unit.id].slice(0,6000);
    if(Array.isArray(raw.selfChecks?.[unit.id]))state.selfChecks[unit.id]=[...new Set(raw.selfChecks[unit.id].filter(id=>unit.checks.some(([known])=>known===id)))];
  }
  state.active=validateMock(raw.active);
  if(Array.isArray(raw.history))state.history=raw.history.slice(-30).map(item=>validateMock(item,true)).filter(Boolean);
  return state;
}
export function exerciseEvidence(attempts,type,id,since=null){
  const minimum=since?Date.parse(since):-Infinity;
  const matching=attempts.filter(a=>a.type===type&&a.exercise===id&&Date.parse(a.at)>=minimum);
  const last=matching.at(-1);
  const status=!last?'unattempted':!last.passed?'retry':last.help==='independent'?'independent':'assisted';
  return {key:type+':'+id,status,at:last?.at||null,help:last?.help||null,contentRevision:last?.contentRevision||'historical-unversioned',runtimeVersion:last?.runtimeVersion||'historical-unversioned'};
}
export const mockEvidence=(training,active)=>MOCK_BY_ID.get(active.id).tasks.map(task=>exerciseEvidence(training.attempts,task.type,task.id,active.startedAt));
export function courseEvidence(training,target=training.course?.target||'both'){
  const course=training.course||freshCourse(),distinct=new Map();
  const units=courseUnitsFor(target).map(unit=>{
    const evidence=unit.practice.map(task=>{const item=exerciseEvidence(training.attempts,task.type,task.id);distinct.set(item.key,item);return item;});
    return {id:unit.id,evidence,read:course.read.includes(unit.id),noteSaved:!!course.notes[unit.id]?.trim(),selfChecks:(course.selfChecks[unit.id]||[]).length,totalSelfChecks:unit.checks.length};
  });
  const independent=[...distinct.values()].filter(item=>item.status==='independent').length;
  const delayed=[...distinct.keys()].filter(key=>{const [type,id]=key.split(':');return new Set(training.attempts.filter(a=>a.type===type&&a.exercise===id&&a.passed&&a.help==='independent').map(a=>{const date=new Date(a.at);return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;})).size>=2;}).length;
  return {units,independent,delayed,totalExercises:distinct.size};
}
export function startMock(course,id,now=new Date()){
  const mock=MOCK_BY_ID.get(id);if(!mock)throw new Error('Choose a supported rehearsal.');
  if(course.active)throw new Error('Save your current rehearsal before starting another.');
  course.active={id,startedAt:now.toISOString(),remaining:mock.minutes*60,runningSince:null,responses:{},selfChecks:[]};
  return course.active;
}
export function remainingMock(active,now=Date.now()){
  if(!active)return 0;
  return Math.max(0,active.remaining-(Number.isFinite(active.runningSince)?Math.max(0,(now-active.runningSince)/1000):0));
}
export function pauseMock(active,now=Date.now()){if(!active)return;active.remaining=remainingMock(active,now);active.runningSince=null;}
export function finishMock(training,now=new Date()){
  const active=training.course.active;if(!active)throw new Error('Start a rehearsal first.');
  pauseMock(active,now.getTime());
  const saved={...structuredClone(active),finishedAt:now.toISOString(),courseRevision:INTERVIEW_COURSE_REVISION,evidence:mockEvidence(training,active).map(({key,status,at,contentRevision,runtimeVersion})=>({key,status,at,contentRevision,runtimeVersion}))};
  training.course.history.push(saved);training.course.history=training.course.history.slice(-30);training.course.active=null;
  return saved;
}
