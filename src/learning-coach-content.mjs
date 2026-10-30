import {PRACTICAL_PYTHON_DRILLS} from './practical-python-content.mjs';
import {FITNESS_SQL_LABS} from './fitness-sql-content.mjs';
import {PRACTICAL_SCENARIOS} from './practical-scenarios.mjs';
import {PYTHON_DRILLS} from './training-content.mjs';
import {SQL_LABS} from './sql-content.mjs';
import {JAVA_LABS} from './java-content.mjs';
export const COACH_REVISION='2026-10-29.2';
const existingSkills={'label-counts':['python-dictionary-syntax','python-grouping'],'group-totals':['python-dictionary-syntax','python-grouping'],'budget-pair':['python-membership','python-value-index'],'stable-unique':['python-membership'],'list-slices':['python-mutability'],'schema-join':['sql-constraints','sql-joins'],'left-join-count':['sql-joins','sql-null'],'group-having':['sql-grouping'],'not-exists':['sql-joins','sql-null'],'rollback':['sql-transactions'],'index-plan':['sql-indexes']};
const typed=(tasks,type)=>tasks.map(task=>({...task,type,href:'#'+type+'/'+task.id,skills:task.skills||existingSkills[task.id]||[]}));
export const COACH_TASKS=[...typed(PRACTICAL_PYTHON_DRILLS,'python'),...typed(FITNESS_SQL_LABS,'sql'),...typed(PYTHON_DRILLS.filter(t=>!PRACTICAL_PYTHON_DRILLS.some(p=>p.id===t.id)),'python'),...typed(SQL_LABS.filter(t=>!FITNESS_SQL_LABS.some(p=>p.id===t.id)),'sql'),...typed(JAVA_LABS,'java')];
export const COACH_TASK_BY_ID=new Map(COACH_TASKS.map(task=>[task.id,task]));
export const SCENARIO_BY_ID=new Map(PRACTICAL_SCENARIOS.map(task=>[task.id,task]));
const labels={
  'python-dictionary-syntax':'Python dictionary assignment', 'python-membership':'Python membership', 'python-dictionary-update':'Python dictionary updates',
  'python-value-index':'Values and indices', 'python-unpacking':'Tuple unpacking', 'python-chunking':'String chunks', 'python-loop-boundary':'Loop boundaries',
  'python-integer-division':'Integer division', 'python-mutability':'Copies and mutable defaults', 'python-dictionary-views':'Dictionary views',
  'python-record-validation':'Record validation', 'python-grouping':'Grouping records', 'sql-select':'SQL selection and ordering','sql-null':'SQL NULL behavior',
  'sql-joins':'SQL joins and zero children','sql-grouping':'SQL aggregation','sql-constraints':'Relational constraints','sql-transactions':'Transaction boundaries','sql-indexes':'Index and query-plan reasoning'
};
const skillIds=[...new Set([...COACH_TASKS,...PRACTICAL_SCENARIOS].flatMap(task=>task.skills||[]))];
export const COACH_SKILLS=skillIds.map(id=>({id,label:labels[id]||id.replaceAll('-',' '),tasks:COACH_TASKS.filter(task=>task.skills?.includes(id)).map(task=>task.id),scenarios:PRACTICAL_SCENARIOS.filter(task=>task.skills?.includes(id)).map(task=>task.id)}));
export const COACH_SKILL_BY_ID=new Map(COACH_SKILLS.map(skill=>[skill.id,skill]));
export const DIAGNOSTIC_STEPS=[
  {id:'dictionary',title:'One dictionary operation',kind:'runtime',task:()=>COACH_TASKS.find(task=>task.skills?.includes('python-dictionary-syntax')),prompt:'Try a small dictionary update from the starter. Explain what the keys and values represent. Syntax evidence and your reasoning stay separate.'},
  {id:'mapping',title:'A small value-to-index problem',kind:'runtime',task:()=>COACH_TASKS.find(task=>task.skills?.includes('python-value-index')),prompt:'Keep values separate from their positions. Try a changed input and describe which duplicate index you should retain.'},
  {id:'join',title:'A join with a zero-child case',kind:'runtime',task:()=>COACH_TASK_BY_ID.get('fitness-user-counts'),prompt:'Write a query that keeps users who have no workouts. Predict their count before running.'},
  {id:'flow',title:'A complete request path',kind:'scenario',scenario:'flow-signup',prompt:'Follow a request through the client, validation, business logic, persistence and response. Name which parts actually ran.'},
  {id:'auth',title:'A precise logout design',kind:'scenario',scenario:'auth-logout',prompt:'Say which credential or session remains valid after logout, what is checked, and what state is maintained.'},
  {id:'incident',title:'Choose a useful measurement',kind:'scenario',scenario:'incident-latency',prompt:'State the symptom and scope, then choose an observation that can distinguish plausible causes.'}
];
export const OPENING_SESSIONS=[
  ['Diagnostic and dictionary operations','Capture a baseline and one exact operation.','diagnostic'],
  ['Select, filter and sort','Predict rows, then compare normal and changed records.','fitness-filter-workouts'],
  ['Values, indices and mappings','Explain a first-index rule and inspect a real source trace.','python-value-index'],
  ['Keys, relationships and joins','Keep users with zero workouts in the query result.','fitness-user-counts'],
  ['Chunks and loop boundaries','Test a final partial chunk and fixed advancement.','python-chunking'],
  ['Aggregation and NULL','Explain the result grain before grouping.','fitness-weekly-totals'],
  ['Delayed review and a short mock','Use a changed task and explain the correction.','reviews'],
  ['Form submission to persistence','Trace one success path without skipping a layer.','flow-signup'],
  ['Validation, constraints and errors','Separate invalid input from a uniqueness conflict.','flow-signup'],
  ['Authentication and ownership','Identify the trusted actor and reject a cross-owner request.','flow-ownership'],
  ['Query plans and indexes','Explain what the actual SQLite plan establishes.','fitness-index-plan'],
  ['Latency and retries','Predict the meaning of a dependency measurement.','incident-latency'],
  ['A small fitness-data feature','Combine validation, grouping and malformed-record reporting.','python-record-validation'],
  ['Mixed assessment','Compare distinct evidence and choose one next priority.','skills']
].map(([title,objective,target],i)=>({id:i+1,title,objective,target}));
export function coachTarget(target){
  if(['diagnostic','reviews','skills'].includes(target))return '#coach/'+target;
  const task=COACH_TASK_BY_ID.get(target)||COACH_TASKS.find(item=>item.skills?.includes(target));
  return task?.href||(SCENARIO_BY_ID.has(target)?'#coach/question/'+target:'#coach/diagnostic');
}
export const COACH_REASONS={'diagnostic-needed':'Diagnostic needed','user-goal':'User-selected goal','observed-mistake':'Observed mistake selected by you'};
export const NOTEBOOK_TAGS=['syntax','variable naming','index versus value','boundary','query semantics','missing constraint','debugging process','unclear explanation'];
