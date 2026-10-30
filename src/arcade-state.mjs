import { ARCADE_QUESTS, ARCADE_QUESTION_BY_ID, isCorrectAnswer } from './arcade-content.mjs';
export const freshArcade = () => ({version:1,mode:'all',track:'all',answers:{},completed:{},hints:[]});
export function validateArcade(raw) {
  const state=freshArcade();
  if(!raw || raw.version!==1)return state;
  if(['all','choice','blank'].includes(raw.mode))state.mode=raw.mode;
  if(['all','foundations','patterns','frontend','java'].includes(raw.track))state.track=raw.track;
  for(const [id,q] of ARCADE_QUESTION_BY_ID) {
    if(typeof raw.answers?.[id]==='string')state.answers[id]=raw.answers[id].slice(0,120);
    const result=raw.completed?.[id];
    if(result && ['solo','hint'].includes(result.help) && typeof result.at==='string' && Number.isFinite(Date.parse(result.at)))state.completed[id]={help:result.help,at:result.at};
  }
  if(Array.isArray(raw.hints))state.hints=[...new Set(raw.hints.filter(id=>ARCADE_QUESTION_BY_ID.has(id)))];
  return state;
}
export function completeQuestion(state,id,now=new Date()) {
  if(!ARCADE_QUESTION_BY_ID.has(id))throw new Error('Unknown practice question.');
  if(state.completed[id])return false;
  state.completed[id]={help:state.hints.includes(id)?'hint':'solo',at:now.toISOString()};
  return true;
}
export function checkArcadeAnswer(state,id) {
  const question=ARCADE_QUESTION_BY_ID.get(id);
  if(!question)throw new Error('Unknown practice question.');
  const answer=state.answers[id]||'',passed=isCorrectAnswer(question,answer);
  // The retry explanation exposes the authored hint, so preserve that assistance.
  if(!passed&&answer.trim()&&!state.hints.includes(id))state.hints.push(id);
  return {passed,earned:passed&&completeQuestion(state,id)};
}
export function arcadeStats(state) {
  const completed=Object.keys(state.completed).filter(id=>ARCADE_QUESTION_BY_ID.has(id)).length;
  return {completed,xp:completed*10,level:1+Math.floor(completed/6),quests:ARCADE_QUESTS.filter(q=>q.questions.every(item=>state.completed[item.id])).length};
}
