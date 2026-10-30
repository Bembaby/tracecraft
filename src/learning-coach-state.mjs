import {COACH_REVISION,COACH_SKILLS,COACH_SKILL_BY_ID,COACH_TASK_BY_ID,SCENARIO_BY_ID,DIAGNOSTIC_STEPS,NOTEBOOK_TAGS,COACH_REASONS} from './learning-coach-content.mjs';
export const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
const timestamp=value=>typeof value==='string'&&value.length<41&&Number.isFinite(Date.parse(value));
const text=(value,max=2000)=>typeof value==='string'?value.slice(0,max):'';
const clamp=(value,min,max,fallback)=>Number.isFinite(value)?Math.max(min,Math.min(max,Math.floor(value))):fallback;
const modes=['learn','practice','interview'];
const helps=['independent','nudge','question','example','scaffold','solution','documentation'];
export const QUESTION_BUDGETS=[0,30,120,300];
const freshQuestionTimer=()=>({budget:0,remaining:0,runningSince:null});
function validatedQuestionTimer(timer){
  const budget=QUESTION_BUDGETS.includes(timer?.budget)?timer.budget:0;
  return {budget,remaining:clamp(timer?.remaining,0,budget,budget),runningSince:null};
}
export function freshCoach(){return {version:1,mode:'learn',profile:{roles:'',tools:'',project:'',goals:['python','sql','backend','interview'],minutes:120},session:1,timer:{minutes:120,remaining:7200,runningSince:null},diagnostic:{index:0,startedAt:null,steps:{}},responses:{},attempts:[],notebook:[],notebookDrafts:{},notebookTask:'',reasons:{},retention:{variations:2,sessions:2,delayDays:1,reviewCap:3}};}
export function validateCoach(raw){
  const state=freshCoach();if(!raw||raw.version!==1)return state;
  if(modes.includes(raw.mode))state.mode=raw.mode;
  for(const [key,max] of [['roles',200],['tools',300],['project',1200]])state.profile[key]=text(raw.profile?.[key],max);
  if(Array.isArray(raw.profile?.goals))state.profile.goals=[...new Set(raw.profile.goals.filter(id=>['python','sql','backend','interview','debugging','java'].includes(id)))];
  if([30,60,120].includes(raw.profile?.minutes))state.profile.minutes=raw.profile.minutes;
  state.session=clamp(raw.session,1,14,1);
  const minutes=[30,60,120].includes(raw.timer?.minutes)?raw.timer.minutes:120;
  state.timer={minutes,remaining:clamp(raw.timer?.remaining,0,minutes*60,minutes*60),runningSince:null};
  if(timestamp(raw.diagnostic?.startedAt))state.diagnostic.startedAt=raw.diagnostic.startedAt;
  state.diagnostic.index=clamp(raw.diagnostic?.index,0,DIAGNOSTIC_STEPS.length-1,0);
  for(const step of DIAGNOSTIC_STEPS){const entry=raw.diagnostic?.steps?.[step.id];if(entry&&['draft','attempted','skipped'].includes(entry.status))state.diagnostic.steps[step.id]={status:entry.status,note:text(entry.note),at:timestamp(entry.at)?entry.at:null};}
  for(const [id,scenario] of SCENARIO_BY_ID){
    const entry=raw.responses?.[id];if(!entry||typeof entry!=='object')continue;
    const criteria=(scenario.rubric?.technical?.length||0)+(scenario.rubric?.clarity?.length||0);
    state.responses[id]={text:text(entry.text),documentationUsed:entry.documentationUsed===true,selected:scenario.options.some(o=>o.id===entry.selected)?entry.selected:'',help:helps.includes(entry.help)?entry.help:'independent',requested:Array.isArray(entry.requested)?[...new Set(entry.requested.filter(n=>Number.isInteger(n)&&n>=0&&n<=4))]:[],observations:Array.isArray(entry.observations)?[...new Set(entry.observations.filter(known=>scenario.observations.some(o=>o.id===known)))]:[],confidence:clamp(entry.confidence,0,4,0),rubric:Array.isArray(entry.rubric)?[...new Set(entry.rubric.filter(n=>Number.isInteger(n)&&n>=0&&n<criteria))]:[],nonce:/^[a-zA-Z0-9:_-]{1,100}$/.test(entry.nonce)?entry.nonce:'',submitted:entry.submitted===true,timer:validatedQuestionTimer(entry.timer)};
  }
  if(Array.isArray(raw.attempts))for(const entry of raw.attempts.slice(-200)){
    const scenario=SCENARIO_BY_ID.get(entry?.exercise),option=scenario?.options.find(o=>o.id===entry.selected);
    if(!scenario||!option||!timestamp(entry.at)||!/^[a-zA-Z0-9:_-]{1,100}$/.test(entry.id))continue;
    if(state.attempts.some(a=>a.id===entry.id))continue;
    const current=entry.version===scenario.version;
    state.attempts.push({id:entry.id,exercise:scenario.id,version:text(entry.version,40),selected:option.id,text:text(entry.text),at:entry.at,mode:modes.includes(entry.mode)?entry.mode:'practice',help:helps.includes(entry.help)?entry.help:'solution',correct:current?option.correct===true:null,kind:'authored-choice',confidence:clamp(entry.confidence,0,4,0),documentationUsed:entry.documentationUsed===true,observations:Array.isArray(entry.observations)?[...new Set(entry.observations.filter(id=>scenario.observations.some(o=>o.id===id)))]:[]});
  }
  if(Array.isArray(raw.notebook))for(const entry of raw.notebook.slice(-80)){
    if(!entry||!/^[a-zA-Z0-9:_-]{1,100}$/.test(entry.id)||!timestamp(entry.at))continue;
    const taskKnown=COACH_TASK_BY_ID.has(entry.task)||SCENARIO_BY_ID.has(entry.task);
    if(!taskKnown||state.notebook.some(n=>n.id===entry.id))continue;
    state.notebook.push({id:entry.id,task:entry.task,at:entry.at,attemptAt:timestamp(entry.attemptAt)?entry.attemptAt:null,skill:COACH_SKILL_BY_ID.has(entry.skill)?entry.skill:'',tag:NOTEBOOK_TAGS.includes(entry.tag)?entry.tag:'syntax',assumption:text(entry.assumption,600),correction:text(entry.correction,600),example:text(entry.example,600),assistance:helps.includes(entry.assistance)?entry.assistance:'independent',variation:text(entry.variation,600),status:['open','dismissed','reviewed'].includes(entry.status)?entry.status:'open',due:datePattern.test(entry.due)?entry.due:localDay()});
  }
  const allTasks=[...COACH_TASK_BY_ID.keys(),...SCENARIO_BY_ID.keys()];
  if(allTasks.includes(raw.notebookTask))state.notebookTask=raw.notebookTask;
  for(const id of allTasks){const draft=raw.notebookDrafts?.[id];if(!draft||typeof draft!=='object')continue;const entry={};for(const field of ['assumption','correction','example','variation'])if(typeof draft[field]==='string')entry[field]=text(draft[field],600);if(draft.skill===''||COACH_SKILL_BY_ID.has(draft.skill))entry.skill=draft.skill;if(NOTEBOOK_TAGS.includes(draft.tag))entry.tag=draft.tag;if(helps.includes(draft.assistance))entry.assistance=draft.assistance;if(state.notebook.some(n=>n.id===draft.editingId&&n.task===id))entry.editingId=draft.editingId;state.notebookDrafts[id]=entry;}
  for(const skill of COACH_SKILLS)if(Object.hasOwn(COACH_REASONS,raw.reasons?.[skill.id]))state.reasons[skill.id]=raw.reasons[skill.id];
  for(const [key,min,max,defaultValue] of [['variations',2,5,2],['sessions',2,5,2],['delayDays',1,30,1],['reviewCap',1,5,3]])state.retention[key]=clamp(raw.retention?.[key],min,max,defaultValue);
  return state;
}
export function scenarioResponse(coach,id){
  if(!SCENARIO_BY_ID.has(id))throw new Error('Choose an available question.');
  const response=coach.responses[id]??={text:'',selected:'',documentationUsed:false,help:'independent',requested:[],observations:[],confidence:0,rubric:[],nonce:'',submitted:false,timer:freshQuestionTimer()};
  response.timer??=freshQuestionTimer();
  return response;
}
export function recordCoachHelp(coach,id,level){
  const response=scenarioResponse(coach,id);
  if(level==='documentation'){response.documentationUsed=true;if(response.help==='independent')response.help=level;return;}
  if(!Number.isInteger(level)||level<0||level>4)throw new Error('Choose a supported help level.');
  response.requested=[...new Set([...response.requested,level])];
  if(helps.indexOf(helps[level+1])>helps.indexOf(response.help)||response.help==='documentation')response.help=helps[level+1];
}
export function recordScenario(coach,id,now=new Date(),nonce=''){
  const scenario=SCENARIO_BY_ID.get(id),response=scenarioResponse(coach,id),option=scenario.options.find(o=>o.id===response.selected);
  if(!option)throw new Error('Choose an answer before requesting feedback.');
  response.nonce||=nonce||`attempt:${id}:${now.getTime()}`;
  const previous=coach.attempts.find(a=>a.id===response.nonce);if(previous)return previous;
  const attempt={id:response.nonce,exercise:id,version:scenario.version||COACH_REVISION,selected:option.id,text:response.text,at:now.toISOString(),mode:coach.mode,help:coach.mode==='learn'&&response.help==='independent'?'nudge':response.help,correct:option.correct===true,kind:'authored-choice',confidence:response.confidence,documentationUsed:response.documentationUsed===true,observations:[...response.observations]};
  coach.attempts.push(attempt);coach.attempts=coach.attempts.slice(-200);response.submitted=true;return attempt;
}
export const coachTimerRemaining=(timer,now=Date.now())=>Math.max(0,timer.remaining-(Number.isFinite(timer.runningSince)?Math.max(0,(now-timer.runningSince)/1000):0));
export function pauseCoachTimer(coach,now=Date.now()){coach.timer.remaining=coachTimerRemaining(coach.timer,now);coach.timer.runningSince=null;}
export function questionRemaining(timer,now=Date.now()){
  if(!QUESTION_BUDGETS.includes(timer?.budget)||timer.budget===0)return 0;
  const remaining=Number.isFinite(timer.remaining)?Math.max(0,Math.min(timer.budget,timer.remaining)):timer.budget;
  return Math.max(0,remaining-(Number.isFinite(timer.runningSince)?Math.max(0,(now-timer.runningSince)/1000):0));
}
export function pauseQuestionTimer(response,now=Date.now()){
  if(!response?.timer)return false;
  const wasRunning=Number.isFinite(response.timer.runningSince);
  response.timer.remaining=questionRemaining(response.timer,now);response.timer.runningSince=null;
  return wasRunning;
}
export function pauseQuestionTimers(coach,now=Date.now()){
  let changed=false;
  for(const response of Object.values(coach.responses||{}))if(pauseQuestionTimer(response,now))changed=true;
  return changed;
}
export function coachSnapshot(coach,now=Date.now()){
  const snapshot=structuredClone(coach);
  snapshot.timer={...coach.timer,remaining:coachTimerRemaining(coach.timer,now),runningSince:null};
  for(const response of Object.values(snapshot.responses||{})){
    const timer=response.timer;
    response.timer={...validatedQuestionTimer(timer),remaining:questionRemaining(timer,now),runningSince:null};
  }
  return snapshot;
}
export function retryScenario(coach,id){const response=scenarioResponse(coach,id);response.submitted=false;response.nonce='';response.selected='';response.text='';response.rubric=[];return response;}
export function diagnosticEvidence(training,step){
  const coach=training.coach||freshCoach(),status=coach.diagnostic.steps[step.id]?.status;
  if(status==='skipped')return {state:'Not assessed',kind:step.kind,passed:false};
  const since=coach.diagnostic.startedAt?Date.parse(coach.diagnostic.startedAt):Infinity;
  const task=step.kind==='runtime'?step.task():null;
  const attempts=step.kind==='runtime'?(training.attempts||[]).filter(a=>a.type===task?.type&&a.exercise===task?.id&&Date.parse(a.at)>=since):coach.attempts.filter(a=>a.exercise===step.scenario&&Date.parse(a.at)>=since);
  const last=attempts.at(-1),passed=last&&(step.kind==='runtime'?last.passed:last.correct);
  return {state:!last?'Not assessed':!passed?'Needs another attempt':last.help==='independent'?'Independent '+(step.kind==='runtime'?'runtime check':'scenario choice'):'Solved with recorded help',passed:passed===true,kind:step.kind,at:last?.at||null};
}
export function skillEvidence(training,skillId){
  const coach=training.coach||freshCoach(),skill=COACH_SKILL_BY_ID.get(skillId);if(!skill)return null;
  const runtime=(training.attempts||[]).filter(a=>skill.tasks.includes(a.exercise)&&COACH_TASK_BY_ID.get(a.exercise)?.type===a.type).map(a=>({...a,correct:a.passed,kind:'runtime'}));
  const scenarios=coach.attempts.filter(a=>skill.scenarios.includes(a.exercise));
  const evidence=[...runtime,...scenarios].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),last=evidence.at(-1);
  const independent=evidence.filter(a=>a.correct===true&&a.help==='independent'&&a.attemptKind!=='debug'),variations=new Set(independent.map(a=>a.exercise)),sessions=new Set(independent.map(a=>localDay(new Date(a.at))));
  const days=[...sessions].sort(),delay=days.length>1?(Date.parse(days.at(-1))-Date.parse(days[0]))/86400000:0;
  const retained=last?.correct===true&&last.help==='independent'&&variations.size>=coach.retention.variations&&sessions.size>=coach.retention.sessions&&delay>=coach.retention.delayDays;
  const state=!last?'Not assessed':!last.correct?'Learning':last.help!=='independent'?'Solves with help':retained?'Retained after review':'Solves independently';
  return {skill,state,kind:last?.kind||'none',retained,variations:variations.size,sessions:sessions.size,delay,evidence:evidence.slice(-8),latest:last,reason:coach.reasons[skillId]||'diagnostic-needed',transfer:retained&&variations.size>=3?'Independent work across three task contexts':'New-context evidence still needed'};
}
export function addMistake(coach,entry,now=new Date(),id=`mistake:${Date.now()}`){
  const task=COACH_TASK_BY_ID.get(entry.task)||SCENARIO_BY_ID.get(entry.task);if(!task)throw new Error('Choose the task related to this note.');
  if(!entry.assumption?.trim()||!entry.correction?.trim())throw new Error('Write the mistaken assumption and a concise correction.');
  const old=coach.notebook.find(n=>n.id===id),draft={...entry,id,at:old?.at||now.toISOString(),due:old?.due||localDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)),status:old?.status||'open'};
  const clean=validateCoach({...freshCoach(),notebook:[draft]}).notebook[0];if(!clean)throw new Error('This notebook entry is invalid.');
  if(old)coach.notebook[coach.notebook.indexOf(old)]=clean;else coach.notebook.push(clean);coach.notebook=coach.notebook.slice(-80);return clean;
}
export function coachReviews(training,today=localDay()){
  const coach=training.coach||freshCoach();
  const notes=coach.notebook.filter(n=>n.status==='open'&&n.due<=today).map(note=>({id:note.id,task:note.task,note,reason:'Mistake review due '+note.due,priority:2+coach.notebook.filter(n=>n.status==='open'&&n.tag===note.tag).length}));
  const labs=Object.entries(training.reviews||{}).filter(([,r])=>r.due<=today).map(([key,review])=>({id:key,task:key.split(':')[1],reason:'Checked-practice review due '+review.due,priority:1}));
  const unique=new Map();for(const item of [...notes,...labs].sort((a,b)=>b.priority-a.priority))if(!unique.has(item.task))unique.set(item.task,item);
  return [...unique.values()].slice(0,coach.retention.reviewCap).map(item=>{
    const task=COACH_TASK_BY_ID.get(item.task),skill=item.note?.skill&&task?.skills?.includes(item.note.skill)?item.note.skill:task?.skills?.[0];
    const alternative=task?.variants?.map(id=>COACH_TASK_BY_ID.get(id)).find(t=>t&&t.id!==task.id&&t.skills?.includes(skill))||COACH_SKILL_BY_ID.get(skill)?.tasks.map(id=>COACH_TASK_BY_ID.get(id)).find(t=>t&&t.id!==task.id&&t.skills?.includes(skill));
    return {...item,href:alternative?.href||task?.href||(SCENARIO_BY_ID.has(item.task)?'#coach/question/'+item.task:'#'+item.id.split(':')[0]+'/'+item.task+'/review'),variation:alternative?.id||null,variationLabel:alternative?'Changed reviewed task: '+alternative.title:'Original task retry. A new variation is not available for this task yet.'};
  });
}
