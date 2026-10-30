import {PRACTICAL_PYTHON_DRILLS} from '../src/practical-python-content.mjs';
import {FITNESS_SQL_LABS} from '../src/fitness-sql-content.mjs';
import {PRACTICAL_SCENARIOS} from '../src/practical-scenarios.mjs';
import {COACH_TASK_BY_ID,COACH_SKILL_BY_ID,SCENARIO_BY_ID,DIAGNOSTIC_STEPS} from '../src/learning-coach-content.mjs';
export function validatePracticalContent(){
  const tasks=[...PRACTICAL_PYTHON_DRILLS,...FITNESS_SQL_LABS,...PRACTICAL_SCENARIOS],ids=new Set(tasks.map(t=>t.id));
  if(ids.size!==tasks.length)throw new Error('Duplicate practical task ID.');
  for(const task of tasks){
    if(!task.version||!task.gradingMethod||!task.review||!Array.isArray(task.skills)||!task.skills.length||task.skills.some(id=>!COACH_SKILL_BY_ID.has(id)))throw new Error('Practical task needs versioned grading and known skills: '+task.id);
    if(!Number.isFinite(task.minutes)||task.minutes<=0||!task.difficulty)throw new Error('Practical task needs scope and suggested time: '+task.id);
    if(task.prerequisites?.some(id=>!COACH_TASK_BY_ID.has(id)&&!SCENARIO_BY_ID.has(id)))throw new Error('Unknown practical prerequisite: '+task.id);
    if((task.variants||[]).some(id=>id===task.id||!COACH_TASK_BY_ID.has(id)||!COACH_TASK_BY_ID.get(id).skills?.some(skill=>task.skills.includes(skill))))throw new Error('Review variation must cover a shared skill: '+task.id);
    if(task.variationId&&(!SCENARIO_BY_ID.has(task.variationId)||!SCENARIO_BY_ID.get(task.variationId).skills.some(id=>task.skills.includes(id))))throw new Error('Scenario variation must cover a shared skill: '+task.id);
    if(task.assistance&&['nudge','question','example','scaffold','solution'].some(level=>typeof task.assistance[level]!=='string'||!task.assistance[level].trim()))throw new Error('Practical task requires five scoped help levels: '+task.id);
    if(/[\u2013\u2014]/.test(JSON.stringify(task)))throw new Error('Authored practical copy contains a prohibited dash: '+task.id);
  }
  for(const step of DIAGNOSTIC_STEPS)if(step.kind==='runtime'?!step.task():!SCENARIO_BY_ID.has(step.scenario))throw new Error('Diagnostic points to an unavailable task.');
  return {python:PRACTICAL_PYTHON_DRILLS.length,sql:FITNESS_SQL_LABS.length,scenarios:PRACTICAL_SCENARIOS.length};
}
