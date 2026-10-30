import test from 'node:test';
import assert from 'node:assert/strict';
import {runApiModel,validateModelInput,parseApiModelInput,freshRestWorld} from '../src/api-models.mjs';
import {API_LABS,API_LAB_BY_ID} from '../src/api-lab-content.mjs';
import {spawnSync} from 'node:child_process';
import {inspectLiveHealth} from '../src/api-live-http.mjs';
const get=(path='/notes/1',extra={})=>({method:'GET',path,actor:'learner',...extra});
const write=(method,body,extra={})=>({method,path:'/notes/1',actor:'learner',contentType:'application/json',body,...extra});

for(const lab of API_LABS)test(lab.id+': every authored starting, failure and edge case evaluates from actual input',()=>{
 for(const fixture of lab.presets){const input=structuredClone(fixture.input),before=structuredClone(input),result=runApiModel(lab.id,input);assert.equal(result.metric,fixture.expected,fixture.id);assert.deepEqual(input,before);assert.ok(result.steps.length>0);assert.ok(result.wireRequest);}
});
test('REST never leaks another owner, and anonymous reads need identity',()=>{
 assert.equal(runApiModel('rest',get('/notes/2')).status,404);
 assert.doesNotMatch(JSON.stringify(runApiModel('rest',get('/notes/2')).body),/Another notebook/);
 assert.equal(runApiModel('rest',get('/notes/1',{actor:'anonymous'})).status,401);
 assert.match(runApiModel('rest',get('/notes/1',{actor:'anonymous'})).headers['WWW-Authenticate'],/Bearer/);
 const body=runApiModel('rest',get('/notes')).body;assert.deepEqual(body.items.map(n=>n.id),[1]);
});
test('REST validates writable fields and content negotiation without coercion',()=>{
 for(const body of [{done:true},{title:' ' ,done:false},{title:'A',done:'false'},{title:'A',done:0},{title:'A',done:null}]){
  const request=write('POST',body,{path:'/notes'});assert.equal(runApiModel('rest',request).status,400);
 }
 assert.throws(()=>runApiModel('rest',write('POST',{title:'A',done:false,owner:'another'},{path:'/notes'})),/documented fields/);
 assert.equal(runApiModel('rest',write('PUT',{title:'A',done:false},{contentType:'text/plain'})).status,415);
 assert.equal(runApiModel('rest',get('/notes/1',{accept:'image/png'})).status,406);
 assert.equal(runApiModel('rest',get('/notes/1',{method:'get'})).status,405);
});
test('REST partial updates preserve missing fields, replacement requires them, and stale writes have no effect',()=>{
 const world=freshRestWorld(),before=structuredClone(world),patched=runApiModel('rest',write('PATCH',{done:true}),world);
 assert.equal(patched.body.title,'Practice APIs');assert.equal(patched.body.done,true);assert.equal(patched.headers.ETag,'"v2"');assert.deepEqual(world,before);
 const stale=runApiModel('rest',write('PATCH',{title:'Lost edit'},{ifMatch:'"v1"'}),patched.world);assert.equal(stale.status,412);assert.deepEqual(stale.world,patched.world);
 assert.equal(runApiModel('rest',write('PUT',{done:true})).status,400);
});
test('REST identical PUT/DELETE operations preserve intended idempotent state',()=>{
 const request=write('PUT',{title:'Replacement',done:true}),once=runApiModel('rest',request),twice=runApiModel('rest',request,once.world);
 assert.deepEqual(twice.world,once.world);assert.equal(twice.headers.ETag,once.headers.ETag);
 const removed=runApiModel('rest',get('/notes/1',{method:'DELETE'}),twice.world),again=runApiModel('rest',get('/notes/1',{method:'DELETE'}),removed.world);
 assert.equal(removed.status,204);assert.equal(again.status,404);assert.deepEqual(again.world,removed.world);
});
test('REST owner-scoped retry IDs replay an outcome and reject changed content',()=>{
 const request=write('POST',{title:'One effect',done:false},{path:'/notes',requestId:'same-key'}),first=runApiModel('rest',request),again=runApiModel('rest',request,first.world);
 assert.equal(first.status,201);assert.equal(again.status,201);assert.deepEqual(again.body,first.body);assert.equal(again.world.notes.length,3);
 const conflict=runApiModel('rest',{...request,body:{title:'Different',done:false}},again.world);assert.equal(conflict.status,409);assert.deepEqual(conflict.world,again.world);
 const another=runApiModel('rest',{...request,actor:'another'},again.world);assert.equal(another.status,201);assert.notEqual(another.body.id,first.body.id);
});
test('REST validators revalidate the correct representation without crossing owners',()=>{
 const response=runApiModel('rest',get()),cached=runApiModel('rest',get('/notes/1',{ifNoneMatch:response.headers.ETag}));
 assert.equal(cached.status,304);assert.equal(cached.body,null);assert.match(cached.headers['Cache-Control'],/private/);
 assert.equal(runApiModel('rest',get('/notes/1',{actor:'another',ifNoneMatch:'"v1"'})).status,404);
 assert.equal(runApiModel('rest',get('/notes/1',{method:'HEAD'})).body,null);
});
test('REST pagination has a strict boundary, stable order, bounded limits and empty edges',()=>{
 const world=freshRestWorld();world.notes=[...Array.from({length:9},(_,i)=>({id:i+1,owner:i%2?'another':'learner',title:'N'+i,done:false,version:1}))];world.nextId=10;
 assert.deepEqual(runApiModel('rest',get('/notes?limit=2&after=1'),world).body,{items:[{id:3,title:'N2',done:false},{id:5,title:'N4',done:false}],next:5});
 for(const query of ['limit=0','limit=6','limit=-1','limit=1.5','limit=','after=-1','limit=2&limit=3','unknown=1'])assert.equal(runApiModel('rest',get('/notes?'+query),world).status,400,query);
 assert.deepEqual(runApiModel('rest',get('/notes?after=99'),world).body,{items:[],next:null});
});
test('SOAP messages are real well-formed XML, with version/header/fault choices evaluated',()=>{
 const lab=API_LAB_BY_ID.get('soap'),values=lab.presets.map(p=>runApiModel('soap',p.input));
 assert.equal(values[0].status,200);assert.match(values[1].body,/VersionMismatch/);assert.match(values[2].body,/MustUnderstand/);assert.match(values[3].body,/Sender/);
 const escaped=runApiModel('soap',{...lab.presets[0].input,namespace:'urn:a&b"c'});assert.match(escaped.wireRequest,/a&amp;b&quot;c/);
 assert.throws(()=>runApiModel('soap',{...lab.presets[0].input,operation:'Bad Name'}));
 const result=spawnSync(process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3'),['-c','import sys,json,xml.etree.ElementTree as E\nfor text in json.load(sys.stdin): E.fromstring(text)'],{input:JSON.stringify([...values.flatMap(v=>[v.body,v.wireRequest]),escaped.body,escaped.wireRequest]),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});
test('gRPC patterns produce the right arities, ordering and caller-visible failures',()=>{
 const base=API_LAB_BY_ID.get('grpc').presets[0].input;
 for(let n=0;n<=8;n++){const messages=Array.from({length:n},(_,i)=>'m'+i);
  const collect=runApiModel('grpc',{...base,pattern:'client-stream',messages});assert.deepEqual(collect.body.messages,[{received:n}]);
  const bidi=runApiModel('grpc',{...base,pattern:'bidi',messages});assert.deepEqual(bidi.body.messages.map(v=>v.reply),messages.map(v=>v.toUpperCase()));
 }
 assert.equal(runApiModel('grpc',{...base,deadlineMs:0,workMs:0}).status,'OK');
 assert.equal(runApiModel('grpc',{...base,deadlineMs:0,workMs:1}).status,'DEADLINE_EXCEEDED');
 assert.equal(runApiModel('grpc',{...base,cancelled:true,workMs:200}).status,'CANCELLED');
 assert.equal(runApiModel('grpc',{...base,messages:[]}).status,'INVALID_ARGUMENT');
});
test('GraphQL validates before execution and preserves nullable partial data with error paths',()=>{
 const base=API_LAB_BY_ID.get('graphql').presets[0].input;
 const partial=runApiModel('graphql',{...base,failTitle:true});assert.equal(partial.status,200);assert.equal(partial.body.data.note.title,null);assert.equal(partial.body.data.note.id,'1');assert.deepEqual(partial.body.errors[0].path,['note','title']);
 const invalid=runApiModel('graphql',{...base,fields:['id','unknown']});assert.equal(invalid.status,400);assert.equal(Object.hasOwn(invalid.body,'data'),false);
 const notSelected=runApiModel('graphql',{...base,fields:['id'],failTitle:true});assert.deepEqual(notSelected.body,{data:{note:{id:'1'}}});
 const denied=runApiModel('graphql',{...base,id:2});assert.equal(denied.body.data.note,null);assert.doesNotMatch(JSON.stringify(denied.body),/Another notebook/);
});
test('webhook model independently counts valid unique events and rejects failed acceptance',()=>{
 for(let n=0;n<=8;n++){const deliveries=Array.from({length:n},(_,i)=>({id:'event-'+(i%3),verification:i%4===0?'invalid':'valid'})),valid=deliveries.filter(v=>v.verification==='valid');
  assert.equal(runApiModel('webhooks',{deliveries,deduplicate:true,storageAvailable:true}).body.applications,new Set(valid.map(v=>v.id)).size);
  assert.equal(runApiModel('webhooks',{deliveries,deduplicate:false,storageAvailable:true}).body.applications,valid.length);
  const failed=runApiModel('webhooks',{deliveries,deduplicate:true,storageAvailable:false});assert.equal(failed.body.applications,0);assert.deepEqual(failed.body.handled,[]);
 }
});
test('socket model rejects closed sends, caps pending work and never invents dropped replay',()=>{
 const run=(actions,pendingLimit=2)=>runApiModel('websockets',{actions,pendingLimit});
 assert.equal(run(['send','flush']).body.acknowledged,0);
 assert.equal(run(['connect','send','send','send','flush']).body.acknowledged,2);
 assert.equal(run(['connect','send','drop','reconnect','flush']).body.acknowledged,0);
 assert.equal(run(['connect','server-message','flush']).body.acknowledged,0);
 assert.equal(run(['connect','send','reconnect','flush']).body.acknowledged,1);
});
test('WebRTC route matrix separates signaling, capture permission, direct paths, TURN and SFU',()=>{
 const base=API_LAB_BY_ID.get('webrtc').presets[0].input;
 for(const signaling of [false,true])for(const direct of [false,true])for(const turn of [false,true])for(const topology of ['peer','sfu'])for(const channel of ['media','data'])for(const permission of ['granted','denied']){
  const expected=!signaling?'failed':channel==='media'&&permission==='denied'?'permission-denied':!direct&&!turn?'failed':topology==='sfu'?(direct?'sfu':'relay-sfu'):(direct?'direct':'relay');
  const result=runApiModel('webrtc',{...base,signaling,direct,turn,topology,channel,permission});assert.equal(result.metric,expected);if(expected==='relay')assert.deepEqual(result.nodes,['Browser A','TURN relay','Browser B']);
 }
});
test('SSE replay uses a strict cursor, identifies retention gaps and encodes multiline data safely',()=>{
 const data={events:[{id:5,data:'a\nid: injected\r\nb'}],lastEventId:4,retainedAfter:4};
 const result=runApiModel('sse',data);assert.equal(result.metric,'1');assert.equal(result.body,'id: 5\ndata: a\ndata: id: injected\ndata: b\n\n');
 assert.equal(runApiModel('sse',{...data,lastEventId:3}).metric,'resync');
 assert.equal(runApiModel('sse',{...data,lastEventId:5}).metric,'0');
 assert.throws(()=>runApiModel('sse',{...data,events:[{id:5,data:'a'},{id:5,data:'b'}]}));
});
test('all model inputs reject unknown credential fields, wrong scalar types and unbounded structures',()=>{
 for(const lab of API_LABS){const input=lab.presets[0].input;assert.throws(()=>validateModelInput(lab.id,{...input,apiKey:'not-a-real-key'}));assert.throws(()=>parseApiModelInput(lab.id,'not json'));assert.throws(()=>parseApiModelInput(lab.id,' '.repeat(8001)));}
 assert.throws(()=>validateModelInput('grpc',{pattern:'unary',messages:['x'],deadlineMs:true,workMs:1,cancelled:false}));
 assert.throws(()=>parseApiModelInput('rest','{"method":"GET","path":"/notes","actor":"learner","__proto__":{"polluted":true}}'));
 assert.equal({}.polluted,undefined);assert.throws(()=>validateModelInput('rest',get('https://external.example.test')));
});
test('live inspector makes only the explicit same-origin GET and reports actual response values',async()=>{
 const requests=[];const response=await inspectLiveHealth({fetcher:async(path,options)=>{requests.push({path,options});return new Response('{"status":"ok","observed":"synthetic fixture"}',{status:200,headers:{'content-type':'application/json','set-cookie':'not-exposed=fixture'}});}});
 assert.equal(requests.length,1);assert.equal(requests[0].path,'/api/health');assert.equal(requests[0].options.method,'GET');assert.equal(requests[0].options.credentials,'same-origin');assert.equal(response.body.observed,'synthetic fixture');assert.equal(Object.hasOwn(response.headers,'set-cookie'),false);
});
test('live inspector bounds responses and returns a useful timeout without background retries',async()=>{
 await assert.rejects(inspectLiveHealth({fetcher:async()=>new Response('x'.repeat(16001))}),/16,000/);
 let calls=0;await assert.rejects(inspectLiveHealth({timeoutMs:5,fetcher:(_path,{signal})=>{calls++;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));}}),/timed out/);assert.equal(calls,1);
});
