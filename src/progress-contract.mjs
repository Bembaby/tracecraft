import { validateTraining } from './training-state.mjs';
import { validateDesignWorkspace } from './system-design-state.mjs';

export const PROGRESS_LIMIT = 16_000_000;
export { CONTENT_REVISION } from './practice-versions.mjs';
const record = value => value && typeof value === 'object' && !Array.isArray(value);

// Only learner data crosses the persistence boundary. Unknown fields, including
// accidentally supplied provider tokens, are never copied into the account store.
function legacy(value) {
  if (!record(value) || value.version !== 1) throw new Error('Unsupported original-tools workspace.');
  const strings = (source, length) => Object.fromEntries(Object.entries(record(source) ? source : {})
    .filter(([key, text]) => /^[a-zA-Z0-9_-]{1,80}$/.test(key) && !['__proto__','constructor','prototype'].includes(key) && typeof text === 'string')
    .slice(0,100).map(([key,text]) => [key,text.slice(0,length)]));
  return {version:1, name:typeof value.name === 'string' ? value.name.slice(0,40) : 'Builder',
    completed:Array.isArray(value.completed) ? value.completed.filter(x=>typeof x==='string' && /^[a-z0-9-]{1,80}$/.test(x)).slice(0,100) : [],
    drafts:strings(value.drafts,12000), transcripts:strings(value.transcripts,15000),
    days:Array.isArray(value.days) ? value.days.filter(x=>typeof x==='string' && /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-730) : [],
    motion:value.motion !== false, session:{remaining:Number.isFinite(value.session?.remaining)?Math.max(0,Math.min(1800,value.session.remaining)):1800,started:null}};
}

export function validateProgress(raw) {
  if (!record(raw) || raw.format !== 'tracecraft-progress' || raw.version !== 1 || !record(raw.workspaces)) throw new Error('Unsupported progress snapshot.');
  const workspaces = {};
  for (const key of ['training','design','legacy']) {
    const value = raw.workspaces[key];
    workspaces[key] = value == null ? null : key === 'training' ? validateTraining(value) : key === 'design' ? validateDesignWorkspace(value) : legacy(value);
  }
  const result = {format:'tracecraft-progress',version:1,contentRevision:typeof raw.contentRevision==='string' ? raw.contentRevision.slice(0,80) : 'historical-unversioned',workspaces};
  if (JSON.stringify(result).length > PROGRESS_LIMIT) throw new Error('Progress exceeds the 16 MB limit. Export older attempts first.');
  return result;
}

export function progressSummary(snapshot) {
  const w = snapshot?.workspaces || {};
  return {apiQuestions:Object.keys(w.training?.apis?.completed||{}).length,apiNotes:Object.values(w.training?.apis?.notes||{}).filter(text=>text.trim()).length,apiModelChecks:w.training?.apis?.labAttempts?.length||0,tcsRead:w.training?.tcs?.read?.length||0,tcsChecks:Object.values(w.training?.tcs?.answers||{}).filter(a=>a.checked).length,notebook:w.training?.coach?.notebook?.length||0, scenarioChecks:w.training?.coach?.attempts?.length||0, diagnosticParts:Object.keys(w.training?.coach?.diagnostic?.steps||{}).length,privateProfile:Boolean(w.training?.coach?.profile?.project||w.training?.coach?.profile?.tools||w.training?.coach?.profile?.roles),days:w.training?.done?.length||0, checks:(w.training?.attempts?.length||0)+(w.design?.attempts?.length||0),
    beginnerRead:w.training?.learning?.read?.length||0,
    beginnerNotes:Object.values(w.training?.learning?.notes||{}).filter(text=>text.trim()).length,
    beginnerPredictions:Object.values(w.training?.learning?.predictions||{}).filter(text=>text.trim()).length,
    questions:Object.keys(w.training?.arcade?.completed||{}).length,
    courseNotes:Object.values(w.training?.course?.notes||{}).filter(text=>text.trim()).length,
    rehearsals:w.training?.course?.history?.length||0,
    drafts:Object.keys(w.training?.drafts||{}).length+Object.keys(w.design?.drafts||{}).length+Object.keys(w.legacy?.drafts||{}).length,
    explanations:Object.keys(w.training?.explanations||{}).length+Object.keys(w.legacy?.transcripts||{}).length,
    journal:Object.keys(w.training?.notes||{}).length};
}
