import {COACH_TASKS,COACH_TASK_BY_ID,SCENARIO_BY_ID,DIAGNOSTIC_STEPS,OPENING_SESSIONS,coachTarget} from './learning-coach-content.mjs';
import {coachReviews,skillEvidence} from './learning-coach-state.mjs';
export function recommendPractice(training){
  const coach=training.coach,review=coachReviews(training)[0];
  if(review)return {href:review.href,title:COACH_TASK_BY_ID.get(review.variation||review.task)?.title||SCENARIO_BY_ID.get(review.task)?.title||'Review a corrected assumption',reason:review.reason,kind:'review'};
  const pending=DIAGNOSTIC_STEPS.find(step=>!coach.diagnostic.steps[step.id]||coach.diagnostic.steps[step.id].status==='draft');
  if(pending)return {href:'#coach/diagnostic/'+pending.id,title:pending.title,reason:'This practical baseline has not been recorded. You can skip it explicitly or split it across sessions.',kind:'diagnostic'};
  const interests=new Set(coach.profile.goals);
  const relevant=task=>interests.has(task.type)||task.skills?.some(id=>interests.has(id.split('-')[0]));
  const failed=COACH_TASKS.filter(relevant).map(task=>({task,last:(training.attempts||[]).filter(a=>a.exercise===task.id&&a.type===task.type).at(-1)})).filter(item=>item.last&&!item.last.passed).sort((a,b)=>Date.parse(b.last.at)-Date.parse(a.last.at))[0];
  if(failed)return {href:failed.task.href,title:failed.task.title,reason:'The latest recorded check for this task needs a retry. Find a small failing case, then use only the help you need.',kind:'failed-check'};
  const session=OPENING_SESSIONS[coach.session-1];
  if(coach.session>1)return {href:coachTarget(session.target),title:session.title,reason:'Your selected opening focus. It is a planning aid, not a promised mastery date.',kind:'selected-session'};
  const unassessed=COACH_TASKS.find(task=>task.curriculum!=='legacy'&&task.version&&relevant(task)&&!training.attempts.some(a=>a.exercise===task.id&&a.type===task.type));
  if(unassessed)return {href:unassessed.href,title:unassessed.title,reason:'No executed check is recorded for this selected priority. Begin with one small task, without assuming a whole subject is weak.',kind:'selected-goal'};
  const scenario=[...SCENARIO_BY_ID.values()].find(item=>interests.has(item.track)||interests.has('interview')&&item.track==='explanation');
  if(scenario)return {href:'#coach/question/'+scenario.id,title:scenario.title,reason:'Practice explanation or recall separately from implementation. Written quality uses your explicit rubric review.',kind:'explanation'};
  return {href:'#coach/skills',title:'Review the evidence and choose a goal',reason:'No automatic assignment is needed. Choose a placement area or a changed task without inventing a readiness score.',kind:'evidence-review'};
}
