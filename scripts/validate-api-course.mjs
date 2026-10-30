import {API_TRACKS,API_LESSONS,API_QUESTIONS,API_SOURCES,apiAnswerMatches} from '../src/api-course-content.mjs';
import {API_LABS,apiLabForTrack} from '../src/api-lab-content.mjs';
import {runApiModel} from '../src/api-models.mjs';
export function validateApiCourse(lessons=API_LESSONS,tracks=API_TRACKS,labs=API_LABS){
 const trackIds=new Set(tracks.map(t=>t.id)),seen=new Set(),questions=new Set();
 if(trackIds.size!==tracks.length)throw new Error('Duplicate API track.');
 for(const l of lessons){
  if(!trackIds.has(l.track)||seen.has(l.id))throw new Error('Unknown track or duplicate API lesson.');
  for(const key of ['title','goal','learn','pitfall','followUp'])if(typeof l[key]!=='string'||!l[key].trim())throw new Error('API lesson missing '+key);
  if(l.prerequisites.some(id=>!seen.has(id)))throw new Error('API prerequisites must refer to earlier lessons.');
  if(!l.example?.code||!l.example?.result||!l.example?.why||l.terms.length<2||!l.sources.length||l.sources.some(key=>!API_SOURCES[key]))throw new Error('Incomplete API teaching example, terms or sources.');
  if(l.questions.length!==3||l.questions.map(q=>q.kind).join(',')!=='choice,blank,choice')throw new Error('Each API lesson needs prediction, code blank and deliberate-mistake recognition.');
  for(const q of l.questions){
   if(questions.has(q.id)||!q.explanation||!q.hint||!q.contract||!q.solution||!q.bug||!q.complexity||q.solution===q.bug)throw new Error('Incomplete or duplicate API question.');
   if(q.kind==='blank'&&q.code.split('___').length!==2)throw new Error('An API code blank must have exactly one slot.');
   if(q.options.filter(value=>apiAnswerMatches(q,value)).length!==1||q.fixtures.length<5)throw new Error('API question needs one supported answer and edge fixtures.');
   for(const f of q.fixtures)if(apiAnswerMatches(q,f.value)!==f.passed)throw new Error('API recognition fixture disagrees with its contract.');
   questions.add(q.id);
  }
  seen.add(l.id);
 }
 for(const t of tracks)if(!lessons.some(l=>l.track===t.id)||!apiLabForTrack(t.id))throw new Error('Every API track needs lessons and a model lab.');
 const labIds=new Set();for(const lab of labs){if(labIds.has(lab.id)||!lab.contract||!lab.solution||!lab.bug||!lab.project||!lab.complexity||lab.presets.length<3)throw new Error('Incomplete API model exercise.');labIds.add(lab.id);for(const fixture of lab.presets){const result=runApiModel(lab.id,fixture.input);if(result.metric!==fixture.expected)throw new Error('API model fixture failed: '+lab.id+'/'+fixture.id);}}
 return {tracks:tracks.length,lessons:lessons.length,questions:questions.size,labs:labs.length};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/validate-api-course.mjs'))console.log(validateApiCourse());
