import {API_REVISION,API_LESSONS,API_QUESTIONS,API_TRACK_BY_ID,API_LESSON_BY_ID,API_QUESTION_BY_ID,apiLessonsFor,apiAnswerMatches} from './api-course-content.mjs';
import {API_LAB_BY_ID} from './api-lab-content.mjs';
import {validateModelInput,API_MODEL_VERSION} from './api-models.mjs';
const validDate=v=>typeof v==='string'&&v.length<=40&&Number.isFinite(Date.parse(v));
export const freshApiProgress=()=>({version:1,track:'http',lastLesson:null,stages:{},read:[],notes:{},answers:{},review:{},hints:[],completed:{},labDrafts:{},labAttempts:[],checkpoints:{}});
export function validateApiProgress(raw){
 const out=freshApiProgress();if(!raw||raw.version!==1||typeof raw!=='object'||Array.isArray(raw))return out;
 if(API_TRACK_BY_ID.has(raw.track))out.track=raw.track;if(API_LESSON_BY_ID.has(raw.lastLesson))out.lastLesson=raw.lastLesson;
 out.read=[...new Set(Array.isArray(raw.read)?raw.read.filter(id=>API_LESSON_BY_ID.has(id)):[])];
 out.hints=[...new Set(Array.isArray(raw.hints)?raw.hints.filter(id=>API_QUESTION_BY_ID.has(id)):[])];
 for(const lesson of API_LESSONS){if(Number.isInteger(raw.stages?.[lesson.id]))out.stages[lesson.id]=Math.max(0,Math.min(5,raw.stages[lesson.id]));if(typeof raw.notes?.[lesson.id]==='string')out.notes[lesson.id]=raw.notes[lesson.id].slice(0,2000);}
 for(const question of API_QUESTIONS){
  for(const field of ['answers','review']){const item=raw[field]?.[question.id];if(!item||typeof item.value!=='string'||item.value.length>300||question.kind==='choice'&&!question.options.includes(item.value))continue;out[field][question.id]={value:item.value,checked:item.checked===true&&item.version===API_REVISION,version:API_REVISION,at:validDate(item.at)?item.at:null};}
  const item=raw.completed?.[question.id];if(item&&validDate(item.at))out.completed[question.id]={at:item.at,help:['hint','retry'].includes(item.help)?item.help:'none',version:typeof item.version==='string'?item.version.slice(0,40):'historical'};
 }
 for(const [id] of API_LAB_BY_ID){try{if(raw.labDrafts?.[id])out.labDrafts[id]=validateModelInput(id,raw.labDrafts[id]);}catch{}}
 for(const [id] of API_TRACK_BY_ID){const flags=raw.checkpoints?.[id];if(Array.isArray(flags))out.checkpoints[id]=[...new Set(flags.filter(v=>['explain','change','project'].includes(v)))];}
 if(Array.isArray(raw.labAttempts))out.labAttempts=raw.labAttempts.slice(-100).filter(a=>API_LAB_BY_ID.has(a?.lab)&&validDate(a.at)&&API_LAB_BY_ID.get(a.lab).options.includes(a.prediction)&&API_LAB_BY_ID.get(a.lab).options.includes(a.metric)).map(a=>({lab:a.lab,at:a.at,prediction:a.prediction,metric:a.metric,passed:a.prediction===a.metric,version:typeof a.version==='string'&&/^[a-zA-Z0-9._-]{1,80}$/.test(a.version)?a.version:'historical',runtimeVersion:typeof a.runtimeVersion==='string'&&/^[a-zA-Z0-9._-]{1,80}$/.test(a.runtimeVersion)?a.runtimeVersion:'historical-unversioned'}));
 return out;
}
export function chooseApiAnswer(state,id,value,review=false){const q=API_QUESTION_BY_ID.get(id);if(!q||typeof value!=='string'||value.length>300||q.kind==='choice'&&!q.options.includes(value))return false;state[review?'review':'answers'][id]={value,checked:false,version:API_REVISION,at:null};return true;}
export function checkApiAnswer(state,id,review=false,now=new Date()){
 const q=API_QUESTION_BY_ID.get(id),item=state[review?'review':'answers'][id];if(!q||!item?.value.trim())return null;
 item.checked=true;item.at=now.toISOString();item.version=API_REVISION;
 const passed=apiAnswerMatches(q,item.value),earned=passed&&!review&&!Object.hasOwn(state.completed,id);
 if(!passed&&!state.hints.includes(id))state.hints.push(id);
 if(earned)state.completed[id]={at:item.at,help:state.hints.includes(id)?'hint':'none',version:API_REVISION};
 return {passed,earned,help:state.hints.includes(id),explanation:q.explanation};
}
export function apiQuestionEvidence(state,id,review=false){const q=API_QUESTION_BY_ID.get(id),entry=state?.[review?'review':'answers']?.[id];return {checked:!!q&&entry?.checked===true&&entry.version===API_REVISION,passed:!!q&&entry?.checked===true&&entry.version===API_REVISION&&apiAnswerMatches(q,entry.value),help:state?.hints?.includes(id)||false};}
export const apiLessonPracticed=(state,id)=>API_LESSON_BY_ID.get(id)?.questions.every(q=>apiQuestionEvidence(state,q.id).passed)||false;
export function nextApiLesson(state,track=state.track){const items=apiLessonsFor(API_TRACK_BY_ID.has(track)?track:'http');const last=API_LESSON_BY_ID.get(state.lastLesson);return last?.track===track&&!apiLessonPracticed(state,last.id)?last:items.find(l=>!apiLessonPracticed(state,l.id))||items[0];}
export function apiPracticeStats(state){const completed=API_QUESTIONS.filter(q=>validDate(state?.completed?.[q.id]?.at)).length;return {completed,xp:completed*10,total:API_QUESTIONS.length,practicedLessons:API_LESSONS.filter(l=>apiLessonPracticed(state,l.id)).length};}
export function apiReviewQuestions(state,now=new Date()){
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 const due=API_QUESTIONS.filter(q=>{const at=Date.parse(state.completed[q.id]?.at);return Number.isFinite(at)&&at<today;}).sort((a,b)=>Date.parse(state.completed[a.id].at)-Date.parse(state.completed[b.id].at));
 return (due.length?due:API_QUESTIONS).slice(0,5);
}
export function recordApiLabAttempt(state,lab,prediction,result,now=new Date()){
 if(!API_LAB_BY_ID.has(lab)||typeof prediction!=='string'||!API_LAB_BY_ID.get(lab).options.includes(prediction))return null;
 const attempt={lab,prediction,metric:String(result.metric),passed:prediction===String(result.metric),at:now.toISOString(),version:API_REVISION,runtimeVersion:API_MODEL_VERSION};state.labAttempts.push(attempt);state.labAttempts=state.labAttempts.slice(-100);return attempt;
}
