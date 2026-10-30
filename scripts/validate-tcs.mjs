import {TCS_LESSONS,TCS_BY_ID,TCS_UNITS,TCS_SOURCES,TCS_REVIEW_IDS} from '../src/tcs-content.mjs';
import {TCS_PYTHON_DRILLS,TCS_SQL_LABS} from '../src/tcs-lab-content.mjs';
export function validateTcsContent(){
 const seen=new Set(),labs=new Set([...TCS_PYTHON_DRILLS.map(l=>'python:'+l.id),...TCS_SQL_LABS.map(l=>'sql:'+l.id)]);
 if(TCS_LESSONS.length!==25)throw Error('TCS requires all 25 topic lessons.');
 for(const lesson of TCS_LESSONS){
  if(seen.has(lesson.id)||!/^[a-z-]+$/.test(lesson.id))throw Error('Invalid TCS lesson ID.');seen.add(lesson.id);
  for(const field of ['title','goal','basics','worked','code','result','pitfall','question','contract','solution','bug','complexity','followUp'])if(typeof lesson[field]!=='string'||!lesson[field].trim())throw Error('TCS lesson missing '+field);
  if(!TCS_UNITS[lesson.unit]||lesson.terms.length<2||lesson.sources.length<1||lesson.sources.some(key=>!/^https:\/\//.test(TCS_SOURCES[key]||'')))throw Error('TCS lesson needs teaching and primary references.');
  if(lesson.options.length!==3||lesson.options.filter(o=>o.id===lesson.answer).length!==1||lesson.solution===lesson.bug||lesson.fixtures.length!==3)throw Error('Invalid TCS recognition contract.');
  for(const [type,id] of lesson.tasks)if(!labs.has(type+':'+id))throw Error('TCS link does not resolve: '+id);
 }
 for(const id of TCS_REVIEW_IDS)if(!TCS_BY_ID.has(id))throw Error('Invalid TCS review link.');
 for(const lab of [...TCS_PYTHON_DRILLS,...TCS_SQL_LABS]){
  for(const field of ['title','prompt','contract','starter','solution','bug','explanation','complexity','prediction'])if(!lab[field])throw Error('Incomplete TCS exercise: '+field);
  if(lab.fixtures.length<3||lab.solution===lab.bug||Object.keys(lab.assistance).length!==5)throw Error('TCS exercise needs edge checks and scoped help.');
  if(lab.track==='python'&&lab.fixtures.some(f=>!f.label||!f.assertion))throw Error('TCS Python fixtures must render their label and assertion.');
 }
 if(/[\u2013\u2014]/.test(JSON.stringify([TCS_LESSONS,TCS_PYTHON_DRILLS,TCS_SQL_LABS])))throw Error('TCS authored content contains a prohibited dash.');
 return {lessons:seen.size,python:TCS_PYTHON_DRILLS.length,sql:TCS_SQL_LABS.length};
}
