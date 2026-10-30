// A deterministic, owner-scoped HTTP teaching model. It sends no network traffic.
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const copy=v=>structuredClone(v);
const known=(value,keys)=>{if(!object(value)||Object.keys(value).some(k=>!keys.includes(k)))throw new Error('Use only the documented fields for this model.');};
export const freshRestWorld=()=>({nextId:3,notes:[{id:1,owner:'learner',title:'Practice APIs',done:false,version:1},{id:2,owner:'another',title:'Another notebook',done:false,version:1}],receipts:{}});
const tag=note=>'"v'+note.version+'"';
function payload(body,partial=false){
 known(body,['title','done']);
 if(!partial&&(!Object.hasOwn(body,'title')||!Object.hasOwn(body,'done')))throw new Error('This request requires title and done.');
 if(!Object.keys(body).length)throw new Error('Supply at least one writable field.');
 if(Object.hasOwn(body,'title')&&(typeof body.title!=='string'||!body.title.trim()||body.title.length>80))throw new Error('title must be a nonempty string of at most 80 characters.');
 if(Object.hasOwn(body,'done')&&typeof body.done!=='boolean')throw new Error('done must be a JSON boolean.');
 return copy(body);
}
export function validateRestInput(raw){
 known(raw,['method','path','actor','body','contentType','accept','ifMatch','ifNoneMatch','requestId']);
 if(typeof raw.method!=='string'||raw.method.length>16||typeof raw.path!=='string'||raw.path.length>240||!raw.path.startsWith('/')||raw.path.startsWith('//')||/[\r\n]/.test(raw.path))throw new Error('Use a method and a relative /notes target, not an external URL.');
 if(!['learner','another','anonymous'].includes(raw.actor))throw new Error('Choose a documented synthetic actor.');
 const result={method:raw.method,path:raw.path,actor:raw.actor};
 if(raw.body!==undefined){known(raw.body,['title','done']);result.body=copy(raw.body);}
 for(const field of ['contentType','accept','ifMatch','ifNoneMatch','requestId'])if(raw[field]!==undefined){if(typeof raw[field]!=='string'||raw[field].length>(field==='requestId'?40:100)||/[\r\n]/.test(raw[field]))throw new Error('A model field is outside its documented bounds.');result[field]=raw[field];}
 return result;
}
export function simulateRest(raw,initial=freshRestWorld()){
 const request=validateRestInput(raw),world=copy(initial),steps=[],headers={'Content-Type':'application/json'},method=request.method;
 const respond=(status,body=null,extra={})=>({kind:'rest',status,body:copy(body),headers:{...headers,...extra},world,steps:[...steps,{actor:'Model service',detail:'Return HTTP '+status}],metric:String(status),wireRequest:method+' '+request.path+' HTTP/1.1\n'+(request.contentType?'Content-Type: '+request.contentType+'\n':'')+(request.accept?'Accept: '+request.accept+'\n':'')+(request.ifMatch?'If-Match: '+request.ifMatch+'\n':'')+(request.ifNoneMatch?'If-None-Match: '+request.ifNoneMatch+'\n':'')+(request.requestId?'Idempotency-Key: '+request.requestId+'\n':'')+'\n'+(request.body===undefined?'':JSON.stringify(request.body,null,2))});
 const problem=(status,title,extra={})=>respond(status,{type:'about:blank',title,status},{'Content-Type':'application/problem+json','Cache-Control':'no-store',...extra});
 steps.push({actor:'Client',detail:method+' '+request.path});
 const allowed='GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
 if(!allowed.split(', ').includes(method))return problem(405,'Method not supported by this model',{Allow:allowed});
 const url=new URL(request.path,'https://notebook.example.test'),match=url.pathname.match(/^\/notes(?:\/(\d+))?$/);
 if(!match)return problem(404,'Target not found');
 if(request.actor==='anonymous')return problem(401,'A verified caller is required',{'WWW-Authenticate':'Bearer realm="notebook-model"'});
 steps.push({actor:'Authorization',detail:'Use the supplied synthetic actor: '+request.actor});
 if(method==='OPTIONS')return respond(204,null,{Allow:allowed});
 if(request.accept&&!['application/json','*/*'].includes(request.accept))return problem(406,'This model returns JSON representations');
 if(['POST','PUT','PATCH'].includes(method)&&request.contentType!=='application/json')return problem(415,'Use application/json for this model’s write body');
 const id=match[1]===undefined?null:Number(match[1]);
 if(id!==null&&(!Number.isSafeInteger(id)||id<1))return problem(404,'Note not found');
 if(id===null){
  if(['GET','HEAD'].includes(method)){
   const keys=[...url.searchParams.keys()];if(keys.some(k=>!['limit','after'].includes(k))||keys.length!==new Set(keys).size)return problem(400,'Use one limit and one after parameter at most');
   const limitText=url.searchParams.get('limit')??'2',afterText=url.searchParams.get('after')??'0';
   if(!/^\d+$/.test(limitText)||!/^\d+$/.test(afterText))return problem(400,'Use integer pagination values');
   const limit=Number(limitText),after=Number(afterText);if(!Number.isSafeInteger(limit)||limit<1||limit>5||!Number.isSafeInteger(after)||after<0)return problem(400,'limit must be 1 to 5 and after must be nonnegative');
   const items=world.notes.filter(n=>n.owner===request.actor&&n.id>after).sort((a,b)=>a.id-b.id),page=items.slice(0,limit);
   steps.push({actor:'Store',detail:'Filter by owner and ID > '+after+'; sort by ID; take at most '+limit});
   return respond(200,method==='HEAD'?null:{items:page.map(({id,title,done})=>({id,title,done})),next:items.length>limit?page.at(-1).id:null},{'Cache-Control':'private, max-age=60'});
  }
  if(method!=='POST')return problem(405,'Use GET or POST on the collection',{Allow:'GET, HEAD, POST, OPTIONS'});
  let data;try{data=payload(request.body);}catch(error){return problem(400,error.message);}
  const receiptKey=request.actor+':'+request.requestId,fingerprint=JSON.stringify([data.title,data.done]);
  if(request.requestId&&Object.hasOwn(world.receipts,receiptKey)){
   const previous=world.receipts[receiptKey];steps.push({actor:'Retry record',detail:'Compare the owner-scoped request ID with its first request body'});
   return previous.fingerprint===fingerprint?respond(201,previous.body,{Location:previous.location,'Idempotent-Replay':'true'}):problem(409,'This request ID already belongs to different content');
  }
  if(world.notes.length>=100)return problem(409,'Reset this bounded practice store before creating more notes');
  const note={id:world.nextId++,owner:request.actor,...data,version:1};world.notes.push(note);
  const body={id:note.id,title:note.title,done:note.done},location='/notes/'+note.id;
  if(request.requestId)world.receipts[receiptKey]={fingerprint,body:copy(body),location};
  steps.push({actor:'Store',detail:'Create one note for the supplied actor with ID '+note.id});
  return respond(201,body,{Location:location,ETag:tag(note),'Cache-Control':'no-store'});
 }
 if(url.search)return problem(400,'This model’s item target does not accept query parameters');
 const note=world.notes.find(n=>n.id===id&&n.owner===request.actor);
 if(!note){steps.push({actor:'Authorization',detail:'No note is available under this actor and ID'});return problem(404,'Note not found');}
 if(['GET','HEAD'].includes(method)){
  steps.push({actor:'Store',detail:'Read owned note '+id+' at validator '+tag(note)});
  if(request.ifNoneMatch===tag(note)||request.ifNoneMatch==='*')return respond(304,null,{ETag:tag(note),'Cache-Control':'private, max-age=60'});
  return respond(200,method==='HEAD'?null:{id:note.id,title:note.title,done:note.done},{ETag:tag(note),'Cache-Control':'private, max-age=60'});
 }
 if(method==='POST')return problem(405,'Create notes on the collection target',{Allow:'GET, HEAD, PUT, PATCH, DELETE, OPTIONS'});
 if(request.ifMatch&&request.ifMatch!=='*'&&request.ifMatch!==tag(note))return problem(412,'Version changed. Read current state before reconciling.');
 if(method==='DELETE'){world.notes=world.notes.filter(n=>n.id!==id);steps.push({actor:'Store',detail:'Remove owned note '+id});return respond(204,null,{'Cache-Control':'no-store'});}
 let data;try{data=payload(request.body,method==='PATCH');}catch(error){return problem(400,error.message);}
 const next={...note,...data};if(next.title!==note.title||next.done!==note.done){Object.assign(note,data);note.version++;}
 steps.push({actor:'Store',detail:(method==='PUT'?'Replace writable fields':'Apply the documented partial object update')+'; current validator '+tag(note)});
 return respond(200,{id:note.id,title:note.title,done:note.done},{ETag:tag(note),'Cache-Control':'no-store'});
}
