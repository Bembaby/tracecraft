import test from 'node:test';
import assert from 'node:assert/strict';
import {API_REVISION,API_LESSONS,API_QUESTIONS,API_QUESTION_BY_ID,apiAnswerMatches} from '../src/api-course-content.mjs';
import {validateApiCourse} from '../scripts/validate-api-course.mjs';
import {freshApiProgress,validateApiProgress,chooseApiAnswer,checkApiAnswer,apiLessonPracticed,apiQuestionEvidence,apiPracticeStats,nextApiLesson,apiReviewQuestions,recordApiLabAttempt} from '../src/api-course-state.mjs';
import {freshTraining,validateTraining,trainingSnapshot} from '../src/training-state.mjs';
import {validateProgress,progressSummary} from '../src/progress-contract.mjs';
import {gameStats,practiceDays} from '../src/game-stats.mjs';
import {apiCourseView,mountApiCourse,unmountApiCourse} from '../src/api-course.mjs';
import {runApiModel} from '../src/api-models.mjs';
import {API_LAB_BY_ID} from '../src/api-lab-content.mjs';
const at=new Date('2026-10-29T12:00:00');

test('nine original API tracks have complete ordered lessons, exact question contracts and evaluated model fixtures',()=>{assert.deepEqual(validateApiCourse(),{tracks:9,lessons:46,questions:138,labs:8});for(const q of API_QUESTIONS){assert.equal(apiAnswerMatches(q,q.solution),true);assert.equal(apiAnswerMatches(q,q.bug),false);assert.equal(apiAnswerMatches(q,''),false);assert.equal(apiAnswerMatches(q,null),false);}});
test('independent API blank answer key covers every lesson, including protocol and vocabulary slots',()=>{
 const expected=['GET','Accept','204','title','https','GET','self','PUT','PATCH','key','404','id','If-Match','limit','Body','WSDL','Reason','status','stub','1','stream','deadline','numbers','!','title','$','errors','size','POST','before','ID','misleading','read','wss','OPEN','ID','bufferedAmount','snapshot','answer','ICE','TURN','stop','SFU','event-stream','ID','WebRTC'];
 assert.equal(expected.length,API_LESSONS.length);API_LESSONS.forEach((lesson,i)=>assert.equal(lesson.questions[1].answer,expected[i],lesson.id));
});
test('high-risk distinctions have independently maintained expected claims',()=>{
 const expected={'rest-resources:format':'No, REST does not require JSON','rest-constraints:state':'Yes, resource state can be stored','rest-retries:delete':'No, the intended final effect is unchanged','soap-reliability:guarantee':'Delivery and exactly-once effects are guaranteed','grpc-protobuf:speed':'gRPC is always a fixed multiple faster','grpc-deadlines:effects':'Rollback of the committed effect','graphql-partial-errors:partial':'Partial data with a field error','graphql-cost-subscriptions:security':'Resource authorization','webhook-verification:model':'Only the supplied model verdict, not real cryptographic verification','webhook-reconciliation:order':'All webhook events arrive exactly once and in global order','websocket-reconnect:replay':'No, the application protocol must define recovery','webrtc-turn:server':'A server is carrying traffic on that route','webrtc-media-permissions:data':'No','sse-resume:history':'Missing retained history'};
 for(const [id,answer] of Object.entries(expected))assert.equal(API_QUESTION_BY_ID.get(id).answer,answer,id);
});
test('authoring checks reject missing blanks, dangling prerequisites and broken expected model outcomes',()=>{
 const missing=structuredClone(API_LESSONS);missing[0].questions[1].code='no slot';assert.throws(()=>validateApiCourse(missing),/slot/);
 const cycle=structuredClone(API_LESSONS);cycle[0].prerequisites=['rest-resources'];assert.throws(()=>validateApiCourse(cycle),/earlier/);
});
test('first-correct XP is earned once and wrong-answer feedback remains recorded assistance',()=>{
 const state=freshApiProgress(),q=API_QUESTIONS[0];chooseApiAnswer(state,q.id,q.bug);assert.equal(checkApiAnswer(state,q.id,false,at).passed,false);assert.equal(apiPracticeStats(state).xp,0);chooseApiAnswer(state,q.id,q.answer);assert.equal(checkApiAnswer(state,q.id,false,at).earned,true);assert.equal(state.completed[q.id].help,'hint');assert.equal(apiPracticeStats(state).xp,10);assert.equal(checkApiAnswer(state,q.id,false,at).earned,false);assert.equal(apiPracticeStats(state).xp,10);
});
test('editing an answer invalidates current feedback without erasing its first-correct practice record',()=>{
 const state=freshApiProgress(),q=API_QUESTIONS[0];chooseApiAnswer(state,q.id,q.answer);checkApiAnswer(state,q.id,false,at);chooseApiAnswer(state,q.id,q.bug);assert.equal(apiQuestionEvidence(state,q.id).checked,false);assert.equal(apiPracticeStats(state).xp,10);checkApiAnswer(state,q.id,false,at);assert.equal(apiQuestionEvidence(state,q.id).passed,false);
});
test('read marks and reflections cannot establish a practiced question set or XP',()=>{
 const state=freshApiProgress(),lesson=API_LESSONS[0];state.read.push(lesson.id);state.notes[lesson.id]='An explanation.';assert.equal(apiLessonPracticed(state,lesson.id),false);assert.equal(apiPracticeStats(state).xp,0);for(const q of lesson.questions){chooseApiAnswer(state,q.id,q.answer);checkApiAnswer(state,q.id,false,at);}assert.equal(apiLessonPracticed(state,lesson.id),true);
});
test('resume respects the selected track and advances beyond a fully practiced lesson',()=>{
 const state=freshApiProgress(),lesson=API_LESSONS[0];state.lastLesson=lesson.id;state.stages[lesson.id]=4;assert.equal(nextApiLesson(state).id,lesson.id);for(const q of lesson.questions){chooseApiAnswer(state,q.id,q.answer);checkApiAnswer(state,q.id,false,at);}assert.notEqual(nextApiLesson(state).id,lesson.id);assert.equal(nextApiLesson(state,'rest').track,'rest');
});
test('known-question review is capped at five, prioritizes later-day recall and never adds completion XP',()=>{
 const state=freshApiProgress(),q=API_QUESTIONS[9];chooseApiAnswer(state,q.id,q.answer);checkApiAnswer(state,q.id,false,new Date('2026-10-28T12:00:00'));assert.equal(apiReviewQuestions(state,at)[0].id,q.id);assert.ok(apiReviewQuestions(freshApiProgress(),at).length<=5);chooseApiAnswer(state,q.id,q.answer,true);assert.equal(checkApiAnswer(state,q.id,true,at).earned,false);assert.equal(apiPracticeStats(state).xp,10);
});
test('API progress allowlists identities, clips notes, rechecks outcomes and removes credential fields',()=>{
 const raw=freshApiProgress(),q=API_QUESTIONS[0];raw.notes[q.lesson]='ignored';raw.notes[API_LESSONS[0].id]='x'.repeat(5000);raw.stages[API_LESSONS[0].id]=99;raw.answers[q.id]={value:q.bug,checked:true,version:API_REVISION,at:at.toISOString(),passed:true};raw.completed.unknown={at:at.toISOString()};raw.token='not-real';raw.labDrafts.rest={...API_LAB_BY_ID.get('rest').presets[0].input,apiKey:'not-real'};const state=validateApiProgress(raw);assert.equal(state.notes[API_LESSONS[0].id].length,2000);assert.equal(state.stages[API_LESSONS[0].id],5);assert.equal(apiQuestionEvidence(state,q.id).passed,false);assert.equal(Object.hasOwn(state,'token'),false);assert.equal(state.labDrafts.rest,undefined);assert.equal(state.completed.unknown,undefined);
});
test('old snapshots migrate safely and course records round-trip through the actual account validator',()=>{
 const training=freshTraining(),q=API_QUESTIONS[0];chooseApiAnswer(training.apis,q.id,q.answer);checkApiAnswer(training.apis,q.id,false,at);training.apis.notes[API_LESSONS[0].id]='Preserved reasoning.';training.apis.lastLesson=API_LESSONS[0].id;training.apis.stages[API_LESSONS[0].id]=4;training.apis.checkpoints.rest=['explain'];const snapshot=validateProgress({format:'tracecraft-progress',version:1,workspaces:{training:trainingSnapshot(training)}});assert.deepEqual(snapshot.workspaces.training.apis,training.apis);assert.equal(progressSummary(snapshot).apiQuestions,1);assert.equal(progressSummary(snapshot).apiNotes,1);assert.deepEqual(validateTraining({version:1}).apis,freshApiProgress());
});
test('HTTP and REST self-assessments stay independent even though their model lab is shared',()=>{
 const state=freshApiProgress();state.checkpoints.http=['explain'];state.checkpoints.rest=['change'];const restored=validateApiProgress(state);assert.deepEqual(restored.checkpoints.http,['explain']);assert.deepEqual(restored.checkpoints.rest,['change']);
});
test('model prediction records are bounded and never become submitted-code evidence',()=>{
 const state=freshApiProgress(),input=API_LAB_BY_ID.get('rest').presets[0].input,result=runApiModel('rest',input);for(let i=0;i<105;i++)recordApiLabAttempt(state,'rest','200',result,at);assert.equal(state.labAttempts.length,100);assert.equal(apiPracticeStats(state).xp,0);const raw=structuredClone(state);raw.labAttempts[0].passed=false;assert.equal(validateApiProgress(raw).labAttempts[0].passed,true);assert.equal(recordApiLabAttempt(state,'rest','not-status',result),null);
});
test('combined HUD uses distinct quick and API question records while model attempts only count practice days',()=>{
 const training=freshTraining();for(const q of API_QUESTIONS.slice(0,6)){chooseApiAnswer(training.apis,q.id,q.answer);checkApiAnswer(training.apis,q.id,false,at);}const stats=gameStats(training,[],'2026-10-29');assert.equal(stats.xp,60);assert.equal(stats.level,2);assert.equal(stats.streak,1);const before=stats.xp;training.apis.labAttempts.push({lab:'rest',at:at.toISOString()});assert.equal(gameStats(training,[],'2026-10-29').xp,before);assert.equal(practiceDays(training).size,1);
});
test('course HTML escapes saved notes and keeps model and external-project status labels truthful',()=>{
 const training=freshTraining();training.apis.notes[API_LESSONS[0].id]='<img src=x onerror=alert(1)>';training.apis.stages[API_LESSONS[0].id]=5;globalThis.location={hash:'#apis/lesson/'+API_LESSONS[0].id};const html=apiCourseView(training);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/self-assessment/);globalThis.location={hash:'#apis/checkpoint/rest'};assert.match(apiCourseView(training),/not automatically graded/);globalThis.location={hash:'#apis/lab/webrtc'};assert.match(apiCourseView(training),/deterministic teaching model/);
});


test('guided input is committed before blur and the first run evaluates the visible path',async()=>{
 const previous=globalThis.location,t=freshTraining(),handlers=new Map(),nodes=new Map(),messages=[];
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{textContent:'',value:'',disabled:false,remove(){},matches:()=>true,focus(){},scrollIntoView(){}});return nodes.get(selector);};
 const element={innerHTML:'',contains:()=>true,querySelector:node,querySelectorAll:()=>[],addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener(){}};
 try{
  globalThis.location={hash:'#apis/lab/rest'};mountApiCourse(element,t,()=>true,msg=>messages.push(msg));
  handlers.get('input')({target:{dataset:{apiKnob:'path'},type:'text',value:'/notes/999'}});
  assert.equal(t.apis.labDrafts.rest.path,'/notes/999','No blur event has occurred.');
  handlers.get('change')({target:{dataset:{},id:'api-prediction',value:'404'}});
  const button={dataset:{api:'run-model'}};await handlers.get('click')({target:{closest:()=>button}});
  assert.match(element.innerHTML,/Model result: 404/);assert.match(element.innerHTML,/GET \/notes\/999/);assert.equal(t.apis.labAttempts.at(-1).passed,true);
  handlers.get('input')({target:{dataset:{},id:'api-model-input',value:'{'}});
  assert.equal(node('[data-api="run-model"]').disabled,true);
  handlers.get('input')({target:{dataset:{},id:'api-model-input',value:'{"method":"GET","path":"/notes/1","actor":"learner"}'}});
  assert.equal(node('[data-api="run-model"]').disabled,false);assert.equal(t.apis.labDrafts.rest.path,'/notes/1');
  assert.ok(messages.some(m=>m.startsWith('Prediction checked.')));
 }finally{unmountApiCourse();globalThis.location=previous;}
});

test('API device-save failure remains visible through every route mount',()=>{
 const old=globalThis.location,element={innerHTML:'',querySelectorAll:()=>[],addEventListener(){},removeEventListener(){}};
 try{for(const hash of ['#apis','#apis/lesson/api-first-conversation','#apis/lab/rest','#apis/review']){globalThis.location={hash};mountApiCourse(element,freshTraining(),()=>false,()=>{});assert.match(element.innerHTML,/could not be saved on this device/);assert.match(element.innerHTML,/Changes remain in memory/);unmountApiCourse();}}
 finally{globalThis.location={hash:'#apis'};mountApiCourse(element,freshTraining(),()=>true,()=>{});unmountApiCourse();globalThis.location=old;}
});


test('empty numeric model input stays invalid through unrelated control changes',()=>{
 const previous=globalThis.location,t=freshTraining(),handlers=new Map(),nodes=new Map();
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{textContent:'',value:'',disabled:false,remove(){}});return nodes.get(selector);};
 const element={innerHTML:'',querySelector:node,querySelectorAll:()=>[],addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener(){}};
 try{
  globalThis.location={hash:'#apis/lab/grpc'};mountApiCourse(element,t,()=>true,()=>{});
  const edit=(key,type,value,checked=false)=>handlers.get('input')({target:{dataset:{apiKnob:key},type,value,checked}});
  edit('deadlineMs','number','');assert.equal(node('[data-api="run-model"]').disabled,true);
  edit('cancelled','checkbox','on',true);assert.equal(node('[data-api="run-model"]').disabled,true);assert.equal(t.apis.labDrafts.grpc,undefined,'Invalid draft cannot replace the saved input.');
  edit('deadlineMs','number','25');assert.equal(node('[data-api="run-model"]').disabled,false);assert.equal(t.apis.labDrafts.grpc.deadlineMs,25);assert.equal(t.apis.labDrafts.grpc.cancelled,true);
 }finally{unmountApiCourse();globalThis.location=previous;}
});
