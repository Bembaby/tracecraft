import {validateTcsContent} from './validate-tcs.mjs';
import {JAVA_LABS} from '../src/java-content.mjs';
import {validatePracticalContent} from './validate-practical.mjs';
import { SQL_LABS } from '../src/sql-content.mjs';
import { PYTHON_DRILLS } from '../src/training-content.mjs';
import { CURRICULUM_MODULES, validateCurriculum } from '../src/curriculum.mjs';
import { ARCADE_QUESTS, isCorrectAnswer } from '../src/arcade-content.mjs';
import {INTERVIEW_UNITS,MOCK_INTERVIEWS} from '../src/interview-course-content.mjs';
import {FRONTEND_EXERCISES} from '../src/frontend-course-content.mjs';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';
import {JAVA_PROGRAMS} from '../src/java-programs.mjs';

export function validateLessons(sql=SQL_LABS,python=PYTHON_DRILLS,modules=CURRICULUM_MODULES){
  const ids=new Set();
  for(const [type,lessons] of [['sql',sql],['python',python]])for(const lesson of lessons){
    const key=type+':'+lesson.id;
    if(ids.has(key)||!(/^[a-z0-9-]+$/.test(lesson.id)))throw new Error('Duplicate or invalid lesson identifier.');
    ids.add(key);
    for(const field of ['title','prompt','contract','starter','solution','bug','explanation','complexity'])if(typeof lesson[field]!=='string'||!lesson[field].trim())throw new Error(`${key}: missing ${field}.`);
    if(lesson.solution===lesson.bug)throw new Error(`${key}: the deliberate bug must differ from the solution.`);
    if(!Array.isArray(lesson.fixtures)||lesson.fixtures.length<2)throw new Error(`${key}: include normal and edge fixtures.`);
    if(!Array.isArray(lesson.sources)||!lesson.sources.length||lesson.sources.some(source=>!/^https:\/\//.test(source.url)))throw new Error(`${key}: primary source links are required.`);
    if(type==='python'&&(!lesson.tests||!lesson.tests.includes('assert ')))throw new Error(`${key}: executable assertions are required.`);
  }
  validateJavaLabs();
  validatePracticalContent();
  validateTcsContent();
  for(const lab of JAVA_LABS)ids.add('java:'+lab.id);
  validateCurriculum(modules,ids);
  validateArcadeLessons();
  validateBeginnerLessons(BEGINNER_LESSONS,JAVA_PROGRAMS,ids);
  validateInterviewCourse(INTERVIEW_UNITS,MOCK_INTERVIEWS,ids);
  return {sql:sql.length,python:python.length,milestones:modules.length};
}
export function validateJavaLabs(labs=JAVA_LABS){
  const ids=new Set();
  for(const lab of labs){
    if(!/^[a-z0-9-]+$/.test(lab.id)||ids.has(lab.id))throw new Error('Duplicate or invalid Java lab.');ids.add(lab.id);
    for(const field of ['title','goal','starter','solution','bug','explanation','complexity'])if(typeof lab[field]!=='string'||!lab[field].trim())throw new Error('Java lab missing '+field);
    for(const field of ['input','output','edgeCases','mutation'])if(typeof lab.contract?.[field]!=='string'||!lab.contract[field].trim())throw new Error('Java input contract missing '+field);
    if(lab.bug===lab.solution)throw new Error('Java deliberate bug must differ from its solution.');
    if(!Array.isArray(lab.hints)||!lab.hints.length||lab.hints.some(value=>typeof value!=='string'||!value.trim()))throw new Error('Java lab needs teaching hints.');
    if(!Array.isArray(lab.fixtures)||lab.fixtures.length<3||new Set(lab.fixtures.map(f=>JSON.stringify(f.args))).size<3)throw new Error('Java lab needs normal, changed and edge fixtures.');
    const names=new Set();
    for(const fixture of lab.fixtures){
      if(typeof fixture.name!=='string'||!fixture.name.trim()||names.has(fixture.name)||!Array.isArray(fixture.args)||fixture.args.length>100||fixture.args.some(value=>typeof value!=='string'||value.length>1000)||typeof fixture.stdout!=='string'||fixture.stdout.length>12000)throw new Error('Java fixture must have a unique name, string arguments and exact bounded output.');
      names.add(fixture.name);
    }
  }
  return {java:ids.size};
}
export function validateBeginnerLessons(lessons=BEGINNER_LESSONS,programs=JAVA_PROGRAMS,ids=new Set([...SQL_LABS.map(item=>'sql:'+item.id),...PYTHON_DRILLS.map(item=>'python:'+item.id),...JAVA_LABS.map(item=>'java:'+item.id)])){
  const seen=new Set(),quests=new Set(ARCADE_QUESTS.map(item=>item.id));
  for(const lesson of lessons){
    if(!lesson.id||seen.has(lesson.id))throw new Error('Duplicate beginner lesson.');seen.add(lesson.id);
    if(!['python','sql','java'].includes(lesson.track))throw new Error('Unknown beginner track.');
    for(const field of ['title','outcome','why','practice','recap'])if(typeof lesson[field]!=='string'||!lesson[field].trim())throw new Error('Beginner lesson missing '+field);
    if(lesson.sections.length<3||lesson.sections.some(section=>['title','body','code','result'].some(field=>typeof section[field]!=='string'||!section[field].trim())))throw new Error('Beginner lesson needs teaching, examples, and results.');
    if(lesson.terms.length<3||lesson.terms.some(pair=>pair.length!==2||pair.some(text=>typeof text!=='string'||!text.trim())))throw new Error('Beginner vocabulary is incomplete.');
    const task=lesson.task;if(!task||(task.type==='play'?!quests.has(task.id):!ids.has(task.type+':'+task.id)))throw new Error('Unknown beginner practice link.');
    if(lesson.track==='java'&&(!programs[lesson.id]?.code||typeof programs[lesson.id]?.output!=='string'))throw new Error('Java lesson needs a complete teaching example.');
  }
  return {lessons:seen.size};
}
export function validateInterviewCourse(units=INTERVIEW_UNITS,mocks=MOCK_INTERVIEWS,lessonIds=new Set([...SQL_LABS.map(item=>'sql:'+item.id),...PYTHON_DRILLS.map(item=>'python:'+item.id),...JAVA_LABS.map(item=>'java:'+item.id)])){
  const earlier=new Set(),quests=new Set(ARCADE_QUESTS.map(item=>item.id));
  for(const unit of units){
    if(earlier.has(unit.id)||!unit.id)throw new Error('Duplicate course unit.');
    for(const field of ['title','phase','outcome','reflect','followUp'])if(typeof unit[field]!=='string'||!unit[field].trim())throw new Error('Incomplete course lesson: '+field);
    if(!Array.isArray(unit.sections)||unit.sections.length<3||unit.sections.some(section=>['title','body','example','pitfall'].some(field=>typeof section[field]!=='string'||!section[field].trim())))throw new Error('Course lessons need original sections, examples and counterexamples.');
    if(unit.prerequisites.some(id=>!earlier.has(id)))throw new Error('Course prerequisites must reference an earlier lesson.');
    if(unit.checks.length<3||new Set(unit.checks.map(([id])=>id)).size!==unit.checks.length)throw new Error('Course self-checks must be complete and unique.');
    for(const task of unit.practice)if(!lessonIds.has(task.type+':'+task.id))throw new Error('Unknown course exercise '+task.id);
    for(const id of unit.arcade||[])if(!quests.has(id))throw new Error('Unknown course arcade link '+id);
    earlier.add(unit.id);
  }
  const mockIds=new Set();for(const mock of mocks){
    if(mockIds.has(mock.id))throw new Error('Duplicate rehearsal.');mockIds.add(mock.id);
    if(mock.phases.reduce((sum,[,minutes])=>sum+minutes,0)!==mock.minutes)throw new Error('Rehearsal phase budgets must sum to its duration.');
    if(mock.prompts.length<3||mock.checks.length<3)throw new Error('A rehearsal needs reflection and self-assessment.');
    for(const task of mock.tasks)if(!lessonIds.has(task.type+':'+task.id))throw new Error('Unknown rehearsal exercise.');
  }
  for(const exercise of FRONTEND_EXERCISES){
    if(typeof exercise.reference!=='function'||typeof exercise.deliberateBug!=='function'||exercise.fixtures.length<3)throw new Error('Frontend examples need executable authored references, bugs and edge fixtures.');
  }
  return {units:units.length,mocks:mocks.length};
}
export function validateArcadeLessons(quests=ARCADE_QUESTS){
  const ids=new Set();
  for(const quest of quests){
    for(const field of ['id','title','lesson','contract','solution','bug','complexity'])if(typeof quest[field]!=='string'||!quest[field].trim())throw new Error(`Arcade quest missing ${field}.`);
    if(quest.solution===quest.bug||!Array.isArray(quest.fixtures)||quest.fixtures.length<2)throw new Error('Arcade quests need a deliberate bug and changed fixtures.');
    for(const question of quest.questions){
      if(ids.has(question.id))throw new Error('Duplicate arcade question.');ids.add(question.id);
      if(!['choice','blank'].includes(question.kind)||!question.explanation||!question.hint||question.options.filter(value=>isCorrectAnswer(question,value)).length!==1)throw new Error('Arcade questions need one correct answer, a hint and an explanation.');
      if(question.kind==='blank'&&question.code.split('___').length!==2)throw new Error('Arcade fill questions need one blank.');
    }
  }
  return {quests:quests.length,questions:ids.size};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/validate-content.mjs'))console.log('Content contracts verified:',validateLessons());
