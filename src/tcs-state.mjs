import {TCS_BY_ID,TCS_LESSONS,TCS_REVISION,TCS_REVIEW_IDS} from './tcs-content.mjs';
export const freshTcs=()=>({version:1,last:null,read:[],notes:{},predictions:{},answers:{},review:{}});
export function validateTcs(raw){
 const result=freshTcs();if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 if(TCS_BY_ID.has(raw.last))result.last=raw.last;
 result.read=[...new Set(Array.isArray(raw.read)?raw.read.filter(id=>TCS_BY_ID.has(id)):[])];
 for(const field of ['notes','predictions'])for(const lesson of TCS_LESSONS){const text=raw[field]?.[lesson.id];if(typeof text==='string')result[field][lesson.id]=text.slice(0,2000);}
 for(const field of ['answers','review'])for(const lesson of TCS_LESSONS){
  if(field==='review'&&!TCS_REVIEW_IDS.includes(lesson.id))continue;
  const entry=raw[field]?.[lesson.id];if(!entry||!lesson.options.some(o=>o.id===entry.choice))continue;
  result[field][lesson.id]={choice:entry.choice,checked:entry.checked===true&&entry.version===TCS_REVISION,version:TCS_REVISION};
 }
 return result;
}
export function chooseTcs(state,id,choice,review=false){
 const lesson=TCS_BY_ID.get(id);if(!lesson?.options.some(o=>o.id===choice)||review&&!TCS_REVIEW_IDS.includes(id))return false;
 state[review?'review':'answers'][id]={choice,checked:false,version:TCS_REVISION};return true;
}
export function checkTcs(state,id,review=false){const entry=state[review?'review':'answers'][id];if(!entry||!TCS_BY_ID.has(id))return false;entry.checked=true;entry.version=TCS_REVISION;return true;}
export function tcsChoiceEvidence(state,id,review=false){
 const item=state?.[review?'review':'answers']?.[id],lesson=TCS_BY_ID.get(id);
 if(!lesson||!item?.checked||item.version!==TCS_REVISION)return {checked:false,correct:false,label:'Not checked'};
 const correct=item.choice===lesson.answer;return {checked:true,correct,label:correct?'Recognition check passed':'Revisit this claim'};
}
export function tcsTaskEvidence(training,type,id){
 const latest=(training.attempts||[]).findLast(a=>a.type===type&&a.exercise===id);
 if(!latest)return 'No runtime check yet';
 if(!latest.passed)return 'Latest runtime check did not pass';
 return latest.help==='independent'?'Latest runtime check passed without recorded in-app help':'Latest runtime check passed with recorded help';
}
export function nextTcsLesson(state){return TCS_LESSONS.find(l=>!tcsChoiceEvidence(state,l.id).correct)||TCS_LESSONS[0];}
