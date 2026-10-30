import {BEGINNER_LESSONS,BEGINNER_LESSON_BY_ID} from './beginner-content.mjs';
import {ARCADE_QUEST_BY_ID} from './arcade-content.mjs';
export const freshLearning=()=>({version:1,lastLesson:null,read:[],notes:{},predictions:{}});
export function validateLearning(raw){
  const state=freshLearning();if(!raw||raw.version!==1)return state;
  if(BEGINNER_LESSON_BY_ID.has(raw.lastLesson))state.lastLesson=raw.lastLesson;
  if(Array.isArray(raw.read))state.read=[...new Set(raw.read.filter(id=>BEGINNER_LESSON_BY_ID.has(id)))];
  for(const lesson of BEGINNER_LESSONS)if(typeof raw.notes?.[lesson.id]==='string')state.notes[lesson.id]=raw.notes[lesson.id].slice(0,3000);
  for(const lesson of BEGINNER_LESSONS)if(typeof raw.predictions?.[lesson.id]==='string')state.predictions[lesson.id]=raw.predictions[lesson.id].slice(0,1500);
  return state;
}
export function beginnerTaskEvidence(training,lesson){
  const task=lesson.task;
  if(task.type==='play'){
    const quest=ARCADE_QUEST_BY_ID.get(task.id),done=quest?.questions.filter(q=>training.arcade?.completed?.[q.id]).length||0;
    return {attempted:done>0||Boolean(quest?.questions.some(q=>training.arcade?.answers?.[q.id])),passed:Boolean(quest)&&done===quest.questions.length,label:`${done}/${quest?.questions.length||0} reading answers recorded`,kind:'recognition'};
  }
  const last=training.attempts?.filter(item=>item.type===task.type&&item.exercise===task.id).at(-1);
  return {attempted:Boolean(last),passed:last?.passed===true,label:!last?'No code check yet':!last.passed?'Latest code check needs a retry':last.help==='independent'?'Latest code check passed without recorded in-app help':'Latest code check passed with help or a continued draft',kind:'runtime'};
}
export function nextBeginnerStep(training={},track='all'){
  const learning=validateLearning(training.learning),last=BEGINNER_LESSON_BY_ID.get(learning.lastLesson);
  const chosen=track==='all'?(last?.track||'python'):track;
  const selected=BEGINNER_LESSONS.filter(item=>item.track===chosen);
  const start=last?.track===chosen?selected.indexOf(last):0;
  const order=[...selected.slice(start),...selected.slice(0,start),...(track==='all'?BEGINNER_LESSONS.filter(item=>item.track!==chosen):[])];
  for(const lesson of order){
    // Checked work can advance the suggestion without inventing a read mark.
    const evidence=beginnerTaskEvidence(training,lesson);
    if(evidence.passed)continue;
    if(!evidence.attempted&&!learning.read.includes(lesson.id))return {lesson,href:'#beginner/'+lesson.id,label:learning.lastLesson?'Continue learning':'Start from zero',reason:lesson.id===last?.id?'Last opened lesson':'Suggested next lesson'};
    return {lesson,href:'#'+lesson.task.type+'/'+lesson.task.id,label:'Practice: '+lesson.title,reason:'Try the linked task'};
  }
  return {href:'#developer-path/course',label:'Continue to interview preparation',reason:'Review the next stage'};
}
