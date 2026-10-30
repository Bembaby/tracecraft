import {simulateRest,validateRestInput} from './api-rest-model.mjs';
export const API_MODEL_VERSION='api-model-v1';
export {freshRestWorld} from './api-rest-model.mjs';
const copy=v=>structuredClone(v);
const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
const text=(v,n=120)=>typeof v==='string'&&v.length<=n;
const integer=(v,lo,hi)=>Number.isSafeInteger(v)&&v>=lo&&v<=hi;
const xml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const boolean=v=>typeof v==='boolean';
const keys={soap:['version','namespace','operation','id','requiredHeader','understoodHeader'],grpc:['pattern','messages','deadlineMs','workMs','cancelled'],graphql:['fields','id','actor','failTitle'],webhooks:['deliveries','deduplicate','storageAvailable'],websockets:['actions','pendingLimit'],webrtc:['signaling','direct','turn','topology','channel','permission'],sse:['events','lastEventId','retainedAfter']};
export function validateModelInput(kind,raw){
 if(kind==='rest')return validateRestInput(raw);
 if(!keys[kind]||!record(raw)||Object.keys(raw).some(k=>!keys[kind].includes(k)))throw new Error('Use only documented fields for this model.');
 let valid=false;
 if(kind==='soap')valid=['1.1','1.2'].includes(raw.version)&&text(raw.namespace)&&typeof raw.operation==='string'&&/^[A-Za-z_][A-Za-z0-9_.-]{0,39}$/.test(raw.operation)&&integer(raw.id,0,999)&&boolean(raw.requiredHeader)&&boolean(raw.understoodHeader);
 if(kind==='grpc')valid=['unary','server-stream','client-stream','bidi'].includes(raw.pattern)&&Array.isArray(raw.messages)&&raw.messages.length<=8&&raw.messages.every(v=>text(v,80))&&integer(raw.deadlineMs,0,10000)&&integer(raw.workMs,0,10000)&&boolean(raw.cancelled);
 if(kind==='graphql')valid=Array.isArray(raw.fields)&&raw.fields.length>0&&raw.fields.length<=6&&new Set(raw.fields).size===raw.fields.length&&raw.fields.every(v=>text(v,40))&&integer(raw.id,0,999)&&['learner','another','anonymous'].includes(raw.actor)&&boolean(raw.failTitle);
 if(kind==='webhooks')valid=Array.isArray(raw.deliveries)&&raw.deliveries.length<=8&&raw.deliveries.every(d=>record(d)&&Object.keys(d).every(k=>['id','verification'].includes(k))&&text(d.id,40)&&d.id.length>0&&['valid','invalid','expired'].includes(d.verification))&&boolean(raw.deduplicate)&&boolean(raw.storageAvailable);
 if(kind==='websockets')valid=Array.isArray(raw.actions)&&raw.actions.length<=12&&raw.actions.every(v=>['connect','send','flush','drop','reconnect','server-message'].includes(v))&&integer(raw.pendingLimit,1,5);
 if(kind==='webrtc')valid=boolean(raw.signaling)&&boolean(raw.direct)&&boolean(raw.turn)&&['peer','sfu'].includes(raw.topology)&&['media','data'].includes(raw.channel)&&['granted','denied'].includes(raw.permission);
 if(kind==='sse')valid=Array.isArray(raw.events)&&raw.events.length<=8&&raw.events.every(e=>record(e)&&Object.keys(e).every(k=>['id','data'].includes(k))&&integer(e.id,1,10000)&&text(e.data,200))&&raw.events.every((e,i)=>i===0||e.id>raw.events[i-1].id)&&integer(raw.lastEventId,0,10000)&&integer(raw.retainedAfter,0,10000)&&raw.events.every(e=>e.id>raw.retainedAfter);
 if(!valid)throw new Error('The input does not match this model’s types, choices or bounds. Read its contract and use a preset to recover.');
 return copy(raw);
}
function soap(v){
 const ns='http://www.w3.org/2003/05/soap-envelope',steps=[{actor:'Client',detail:'Generate the selected version, namespace, operation and ID'}];
 let fault=null,reason='',status=200;
 if(v.version!=='1.2'){fault='VersionMismatch';reason='This model supports SOAP 1.2 only';status=500;}
 else if(v.requiredHeader&&!v.understoodHeader){fault='MustUnderstand';reason='The required targeted header is not understood';status=500;}
 else if(v.namespace!=='urn:tracecraft:notes'||v.operation!=='GetNote'){fault='Sender';reason='Unknown application operation or namespace';status=400;}
 else if(v.id!==1){fault='Sender';reason='No note under this fixed one-note contract';status=400;}
 const wrap=body=>`<env:Envelope xmlns:env="${ns}"><env:Body>${body}</env:Body></env:Envelope>`;
 const body=fault?`<env:Fault><env:Code><env:Value>env:${fault}</env:Value></env:Code><env:Reason><env:Text xml:lang="en">${xml(reason)}</env:Text></env:Reason></env:Fault>`:'<n:GetNoteResponse xmlns:n="urn:tracecraft:notes"><n:title>Practice APIs</n:title></n:GetNoteResponse>';
 steps.push({actor:'SOAP model',detail:fault?'Return '+fault+' fault':'Return the requested note representation'});
 const requestNamespace=v.version==='1.2'?ns:'http://schemas.xmlsoap.org/soap/envelope/';
 const header=v.requiredHeader?'<env:Header><m:Policy xmlns:m="urn:tracecraft:policy" env:mustUnderstand="'+(v.version==='1.2'?'true':'1')+'"/></env:Header>':'';
 return {kind:'soap',status,headers:{'Content-Type':'application/soap+xml'},body:wrap(body),metric:String(status),steps,wireRequest:`<env:Envelope xmlns:env="${requestNamespace}">${header}<env:Body><n:${xml(v.operation)} xmlns:n="${xml(v.namespace)}"><n:id>${v.id}</n:id></n:${xml(v.operation)}></env:Body></env:Envelope>`};
}
function grpc(v){
 const steps=[{actor:'Client stub model',detail:'Select '+v.pattern+' with '+v.messages.length+' supplied messages'}];let status='OK',messages=[];
 if(v.cancelled)status='CANCELLED';else if(v.workMs>v.deadlineMs)status='DEADLINE_EXCEEDED';else if(['unary','server-stream'].includes(v.pattern)&&v.messages.length!==1)status='INVALID_ARGUMENT';
 else if(v.pattern==='unary')messages=[{reply:v.messages[0].toUpperCase()}];
 else if(v.pattern==='server-stream')messages=[1,2,3].map(sequence=>({sequence,reply:v.messages[0].toUpperCase()}));
 else if(v.pattern==='client-stream')messages=[{received:v.messages.length}];
 else messages=v.messages.map((message,i)=>({sequence:i+1,reply:message.toUpperCase()}));
 steps.push({actor:'Service model',detail:status==='OK'?'Produce '+messages.length+' response message(s) under the declared pattern':'Caller-visible result '+status+'; this does not prove rollback of a real server effect'});
 const declarations={unary:'rpc Echo(Message) returns (Message);','server-stream':'rpc Watch(Message) returns (stream Message);','client-stream':'rpc Collect(stream Message) returns (Summary);',bidi:'rpc Chat(stream Message) returns (stream Message);'};
 return {kind:'grpc',status,headers:{'grpc-status':({OK:0,CANCELLED:1,INVALID_ARGUMENT:3,DEADLINE_EXCEEDED:4})[status]},body:{messages},metric:status,steps,wireRequest:declarations[v.pattern]+'\nAuthored input messages (not encoded protobuf bytes):\n'+JSON.stringify(v.messages,null,2)};
}
function graphql(v){
 const steps=[{actor:'Client',detail:'Select fields: '+v.fields.join(', ')}],supported=['id','title','done'],errors=[];let body,status=200,outcome='complete';
 if(v.fields.some(f=>!supported.includes(f))){body={errors:[{message:'Unknown field in the fixed Note schema'}]};status=400;outcome='request-error';}
 else if(v.actor==='anonymous'||v.actor!=='learner'&&v.id===1||v.actor!=='another'&&v.id===2){body={data:{note:null},errors:[{message:'Note unavailable for this actor',path:['note']}]};outcome='partial';}
 else if(![1,2].includes(v.id)){body={data:{note:null}};outcome='missing';}
 else{
  const note={id:String(v.id),title:v.id===1?'Practice APIs':'Another notebook',done:false},selected={};
  for(const field of v.fields){if(field==='title'&&v.failTitle){selected.title=null;errors.push({message:'Title unavailable',path:['note','title']});}else selected[field]=note[field];}
  body={data:{note:selected}};if(errors.length){body.errors=errors;outcome='partial';}
 }
 steps.push({actor:'Execution model',detail:status===400?'Reject selection before execution':'Produce '+outcome+' response under the fixed nullable-title schema'});
 return {kind:'graphql',status,headers:{'Content-Type':'application/graphql-response+json'},body,metric:outcome,steps,wireRequest:'query { note(id: "'+v.id+'") { '+v.fields.join(' ')+' } }'};
}
function webhooks(v){
 const seen=new Set(),steps=[],responses=[];let applications=0;
 if(!v.deliveries.length)steps.push({actor:'Receiver model',detail:'No deliveries supplied. No event is accepted or applied.'});
 for(const event of v.deliveries){
  let status,decision;if(event.verification!=='valid'){status=400;decision='Reject supplied '+event.verification+' verification verdict';}
  else if(!v.storageAvailable){status=503;decision='No durable acceptance; do not apply or mark handled';}
  else if(v.deduplicate&&seen.has(event.id)){status=200;decision='Acknowledge duplicate without applying again';}
  else{seen.add(event.id);applications++;status=200;decision='Model durable acceptance and one application';}
  responses.push({id:event.id,status});steps.push({actor:event.id,detail:decision+'; response '+status});
 }
 return {kind:'webhooks',status:'Delivery decisions',headers:{},body:{applications,responses,handled:[...seen]},metric:String(applications),steps,wireRequest:'Authored delivery inputs; verification is supplied, not cryptographically performed:\n'+JSON.stringify(v.deliveries,null,2)};
}
function websockets(v){
 let state='CLOSED',pending=0,delivered=0;const steps=[];
 for(const action of v.actions){let detail='';
  if(action==='connect'||action==='reconnect'){if(state==='OPEN')detail='Already OPEN; do not replace the active channel';else{state='OPEN';detail='Modeled handshake completes. Prior dropped messages are not automatically replayed.';}}
  if(action==='send'){if(state!=='OPEN')detail='Reject send: channel is not OPEN';else if(pending>=v.pendingLimit)detail='Reject send: pending-message bound reached';else{pending++;detail='Queue one modeled application message';}}
  if(action==='flush'){if(state==='OPEN'){delivered+=pending;detail='Model application acknowledgement for '+pending+' pending message(s)';pending=0;}else detail='No OPEN channel to acknowledge pending work';}
  if(action==='drop'){detail='Connection lost; discard '+pending+' volatile pending message(s) in this declared model';state='CLOSED';pending=0;}
  if(action==='server-message')detail=state==='OPEN'?'Receive a server-to-client message':'No live channel for this server message';
  steps.push({actor:action,detail:detail+' State='+state+', pending='+pending+', acknowledged='+delivered});
 }
 return {kind:'websockets',status:state,headers:{},body:{state,pending,acknowledged:delivered},metric:String(delivered),steps,wireRequest:'Modeled action sequence (no actual socket):\n'+v.actions.join(' -> ')};
}
function webrtc(v){
 const steps=[{actor:'Signaling',detail:v.signaling?'Offer, answer and candidates are exchanged in the model':'Signaling unavailable'}];let route='failed',nodes=[];
 if(!v.signaling)steps.push({actor:'Connection',detail:'No negotiated peer path'});
 else if(v.channel==='media'&&v.permission==='denied'){route='permission-denied';steps.push({actor:'Capture',detail:'Media capture denied. No real permission prompt was requested.'});}
 else if(!v.direct&&!v.turn)steps.push({actor:'ICE model',detail:'Direct path blocked and no relay path available'});
 else{
  route=v.topology==='sfu'?(v.direct?'sfu':'relay-sfu'):(v.direct?'direct':'relay');
  nodes=['Browser A',...(!v.direct?['TURN relay']:[]),...(v.topology==='sfu'?['SFU']:[]),'Browser B'];
  steps.push({actor:'Selected '+v.channel+' path',detail:nodes.join(' -> ')});
 }
 return {kind:'webrtc',status:['failed','permission-denied'].includes(route)?'Not established':'Established in model',headers:{},body:{route,nodes,channel:v.channel,signalingUsesService:v.signaling},metric:route,steps,wireRequest:JSON.stringify(v,null,2),nodes};
}
function sse(v){
 const gap=v.lastEventId<v.retainedAfter,replayed=gap?[]:v.events.filter(event=>event.id>v.lastEventId),steps=[{actor:'Client',detail:'Reconnect with Last-Event-ID '+v.lastEventId},{actor:'Retention',detail:gap?'History does not cover this boundary. Resynchronize from a snapshot.':'Replay '+replayed.length+' retained event(s) after the boundary'}];
 const wire=replayed.map(event=>'id: '+event.id+'\n'+event.data.replace(/\r\n?/g,'\n').split('\n').map(line=>'data: '+line).join('\n')+'\n\n').join('');
 return {kind:'sse',status:gap?'Resynchronization required':'Modeled event stream',headers:{'Content-Type':'text/event-stream'},body:gap?{resync:true}:wire,metric:gap?'resync':String(replayed.length),steps,wireRequest:'GET /events\nAccept: text/event-stream\nLast-Event-ID: '+v.lastEventId};
}
const models={soap,grpc,graphql,webhooks,websockets,webrtc,sse};
export function runApiModel(kind,raw,world){const input=validateModelInput(kind,raw);return kind==='rest'?simulateRest(input,world):models[kind](input);}
export function parseApiModelInput(kind,raw){if(typeof raw!=='string'||raw.length>8000)throw new Error('Use at most 8,000 characters of model JSON.');let parsed;try{parsed=JSON.parse(raw);}catch{throw new Error('The model input must be valid JSON. Restore a preset or correct the syntax.');}return validateModelInput(kind,parsed);}
