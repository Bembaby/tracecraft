import { SQL_LABS } from '../src/sql-content.mjs';
import { PYTHON_DRILLS } from '../src/training-content.mjs';
import { CURRICULUM_MODULES, validateCurriculum } from '../src/curriculum.mjs';

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
  validateCurriculum(modules,ids);
  return {sql:sql.length,python:python.length,milestones:modules.length};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/validate-content.mjs'))console.log('Content contracts verified:',validateLessons());
