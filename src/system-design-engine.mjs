/**
 * TraceCraft's deterministic flow model. It is an educational capacity model,
 * not a benchmark, network emulator, availability forecast, or latency SLO tool.
 * Rates are fluid averages over a chosen window; no requests or code are sent.
 */
export const MODEL_VERSION = 1;
export const DESIGN_LIMITS = Object.freeze({nodes:24, edges:60, rps:1_000_000, durationSeconds:3600, capacity:1_000_000, replicas:16, bufferCapacity:100_000_000});

const type = (label, description, color, defaults) => Object.freeze({label, description, color, defaults:Object.freeze({replicas:1, ...defaults})});
export const NODE_TYPES = Object.freeze({
  client:type('Clients','The single source of the offered read and write traffic.','#8293ab',{capacity:1_000_000,latency:0}),
  cdn:type('CDN','Configured read hits finish here. Misses and every write continue.','#52c4dc',{capacity:10000,latency:4,hitRate:70}),
  gateway:type('API gateway','A routing boundary with an explicit processing budget.','#8c9eff',{capacity:5000,latency:5}),
  'rate-limiter':type('Rate limiter','Deliberately rejects requests above its configured allowance.','#e8bf67',{capacity:10000,latency:1,rateLimit:800}),
  'load-balancer':type('Load balancer','Splits requests equally among directly connected healthy targets.','#aa90ed',{capacity:10000,latency:2}),
  server:type('App server','Processes requests up to capacity; replicas multiply that capacity.','#769ef9',{capacity:250,latency:15}),
  cache:type('Cache','Read hits finish here; misses and writes continue to the next node.','#65d4ad',{capacity:5000,latency:2,hitRate:80}),
  database:type('Database','Finishes reads and commits writes within its capacity.','#e2a36f',{capacity:300,latency:12}),
  queue:type('Durable queue','Admits writes and buffers unfinished jobs within a finite window.','#bd92df',{capacity:5000,latency:3,bufferCapacity:10000}),
  worker:type('Worker','Processes queued jobs and sends results to its dependency.','#7dbdb5',{capacity:150,latency:30})
});

export const MODEL_ASSUMPTIONS = Object.freeze([
  'This is a deterministic teaching model. Component capacities and service times are assumptions you edit, not measured infrastructure performance.',
  'One traffic source, an acyclic graph, and at most one durable queue are supported. Only a load balancer can split a request stream. Splits are equal, not weighted by target capacity.',
  'A load balancer excludes directly failed targets. It cannot see a downstream failure, and there are no automatic retries or failover elsewhere.',
  'Cache and CDN hit rates apply only to reads. Every write continues downstream. Cache freshness, eviction, invalidation, and replication consistency are not simulated.',
  'A queue accepts writes only, begins empty, and retains unfinished jobs up to its buffer limit. Reads sent to it fail. Queued paths cannot merge with synchronous traffic. No durability is assumed after a queue node itself fails.',
  'Estimated mean completion latency sums the configured service times on completed paths. It excludes queue waiting, congestion delay, jitter, network distance, and tail percentiles.',
  'Rates are averages over the selected duration. Fractional requests per second are expected. Rejections, failures, completed work, and pending durable work remain separate.'
]);

const EPS = 1e-8;
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const has = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
const number = (value,fallback,min,max) => typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const round = value => Math.abs(value)<EPS?0:Number(value.toFixed(6));
const total = flow => flow.read+flow.write;
const emptyFlow = () => ({read:0,write:0,readMs:0,writeMs:0,async:false});
const scaled = (flow,factor) => ({read:flow.read*factor,write:flow.write*factor,readMs:flow.readMs*factor,writeMs:flow.writeMs*factor,async:flow.async});
const merge = (target,flow) => {target.read+=flow.read;target.write+=flow.write;target.readMs+=flow.readMs;target.writeMs+=flow.writeMs;target.async ||= flow.async;};
const fields = Object.freeze({capacity:[0,DESIGN_LIMITS.capacity],latency:[0,60000],hitRate:[0,100],replicas:[1,DESIGN_LIMITS.replicas],rateLimit:[0,DESIGN_LIMITS.capacity],bufferCapacity:[0,DESIGN_LIMITS.bufferCapacity]});

function normalizeConfig(node, errors) {
  const defaults=NODE_TYPES[node.type].defaults, config={...defaults};
  if (node.config!==undefined&&!record(node.config)) errors.push(`Configuration for ${node.id} must be an object.`);
  if(record(node.config))for(const key of Object.keys(defaults))if(has(node.config,key)){
    const value=node.config[key], [min,max]=fields[key];
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(key==='replicas'&&!Number.isInteger(value))) {
      errors.push(`${node.id}: ${key} must be ${key==='replicas'?'an integer':'a number'} from ${min} to ${max}.`);
    } else config[key]=value;
  }
  return config;
}

/** Validate and return a bounded copy. Unknown properties are deliberately dropped. */
export function validateDesign(input) {
  const errors=[],warnings=[],graph={nodes:[],edges:[]};
  if(!record(input)||!Array.isArray(input.nodes)||!Array.isArray(input.edges))return {valid:false,errors:['A design must contain nodes and edges arrays.'],warnings,graph};
  if(input.nodes.length>DESIGN_LIMITS.nodes)errors.push(`Use at most ${DESIGN_LIMITS.nodes} components.`);
  if(input.edges.length>DESIGN_LIMITS.edges)errors.push(`Use at most ${DESIGN_LIMITS.edges} connections.`);
  const ids=new Set();
  for(const raw of input.nodes.slice(0,DESIGN_LIMITS.nodes)){
    if(!record(raw)||typeof raw.id!=='string'||!ID.test(raw.id)||typeof raw.type!=='string'||!has(NODE_TYPES,raw.type)) {errors.push('Each component needs a supported type and a unique, short alphanumeric ID.');continue;}
    if(ids.has(raw.id)){errors.push(`Duplicate component ID: ${raw.id}.`);continue;}
    ids.add(raw.id);
    graph.nodes.push({id:raw.id,type:raw.type,label:typeof raw.label==='string'?raw.label.slice(0,60):NODE_TYPES[raw.type].label,x:number(raw.x,80,0,1000),y:number(raw.y,80,0,600),config:normalizeConfig(raw,errors)});
  }
  const edgeIds=new Set(),pairs=new Set();
  for(const raw of input.edges.slice(0,DESIGN_LIMITS.edges)){
    if(!record(raw)||typeof raw.id!=='string'||!ID.test(raw.id)||!ids.has(raw.from)||!ids.has(raw.to)){errors.push('Every connection needs a unique ID and two existing component IDs.');continue;}
    if(edgeIds.has(raw.id)){errors.push(`Duplicate connection ID: ${raw.id}.`);continue;}
    if(raw.from===raw.to){errors.push('A component cannot connect to itself.');continue;}
    const pair=`${raw.from}\0${raw.to}`;
    if(pairs.has(pair)){errors.push(`Duplicate connection from ${raw.from} to ${raw.to}.`);continue;}
    edgeIds.add(raw.id);pairs.add(pair);graph.edges.push({id:raw.id,from:raw.from,to:raw.to});
  }
  const clients=graph.nodes.filter(n=>n.type==='client'),queues=graph.nodes.filter(n=>n.type==='queue');
  if(clients.length!==1)errors.push('Add exactly one Clients component as the traffic source.');
  if(queues.length>1)errors.push('This teaching model supports at most one durable queue.');
  const outgoing=new Map(graph.nodes.map(n=>[n.id,[]])),incoming=new Map(graph.nodes.map(n=>[n.id,[]]));
  for(const edge of graph.edges){outgoing.get(edge.from).push(edge);incoming.get(edge.to).push(edge);}
  for(const n of graph.nodes){
    if(n.type==='client'&&incoming.get(n.id).length)errors.push('Clients are a source and cannot receive a connection.');
    if(n.type==='database'&&outgoing.get(n.id).length)errors.push(`${n.label} is a terminal database; remove its outgoing connections.`);
    if(n.type!=='load-balancer'&&outgoing.get(n.id).length>1)errors.push(`${n.label} has multiple outgoing paths. Use a load balancer to split traffic without duplicating it.`);
  }
  const degree=new Map(graph.nodes.map(n=>[n.id,incoming.get(n.id).length])),ready=graph.nodes.filter(n=>degree.get(n.id)===0).map(n=>n.id),order=[];
  for(let i=0;i<ready.length;i++){const id=ready[i];order.push(id);for(const e of outgoing.get(id)){degree.set(e.to,degree.get(e.to)-1);if(degree.get(e.to)===0)ready.push(e.to);}}
  if(order.length!==graph.nodes.length)errors.push('Cycles are not supported. Follow a request forward to a terminal database or a cache hit.');
  if(clients.length===1){
    const reachable=new Set([clients[0].id]),todo=[clients[0].id];
    for(let i=0;i<todo.length;i++)for(const e of outgoing.get(todo[i]))if(!reachable.has(e.to)){reachable.add(e.to);todo.push(e.to);}
    for(const n of graph.nodes)if(!reachable.has(n.id))warnings.push(`${n.label} is disconnected from Clients and receives no traffic.`);
  }
  if(queues.length===1){
    const q=queues[0],downstream=new Set(),todo=[q.id];
    for(let i=0;i<todo.length;i++)for(const e of outgoing.get(todo[i]))if(!downstream.has(e.to)){downstream.add(e.to);todo.push(e.to);}
    for(const id of downstream)for(const e of incoming.get(id))if(e.from!==q.id&&!downstream.has(e.from))errors.push('A queued-work branch cannot merge with synchronous traffic in this model. Use a separate dependency for the queued branch.');
  }
  return {valid:errors.length===0,errors:[...new Set(errors)].slice(0,40),warnings:[...new Set(warnings)],graph};
}

function normalizeSettings(input={}, graph) {
  const warnings=[];
  if(!record(input))input={};
  const settings={rps:number(input.rps,300,0,DESIGN_LIMITS.rps),readPercent:number(input.readPercent,80,0,100),durationSeconds:number(input.durationSeconds,30,1,DESIGN_LIMITS.durationSeconds),failedNodeIds:[]};
  for(const key of ['rps','readPercent','durationSeconds'])if(has(input,key)&&settings[key]!==input[key])warnings.push(`${key} was reset or bounded to the supported model range.`);
  const ids=new Set(graph.nodes.map(n=>n.id));
  if(Array.isArray(input.failedNodeIds))settings.failedNodeIds=[...new Set(input.failedNodeIds.slice(0,DESIGN_LIMITS.nodes).filter(id=>typeof id==='string'&&ids.has(id)))];
  return {settings,warnings};
}

function freshSummary(rps) {return {offeredRps:rps,completedRps:0,rejectedRps:0,failedRps:0,queuedRps:0,acceptedAsyncRps:0,processedAsyncRps:0,backlogMessages:0,completionPercent:0,acceptedPercent:0,failurePercent:0,estimatedMeanLatencyMs:null};}

function flowPass(graph, settings, queueAdmissionCap=Infinity) {
  const summary=freshSummary(settings.rps),warnings=[],flows=new Map(graph.nodes.map(n=>[n.id,emptyFlow()]));
  const byId=new Map(graph.nodes.map(n=>[n.id,n])),faults=new Set(settings.failedNodeIds);
  const outgoing=new Map(graph.nodes.map(n=>[n.id,[]])),degrees=new Map(graph.nodes.map(n=>[n.id,0]));
  const edges=graph.edges.map(e=>({...e,rps:0,readRps:0,writeRps:0,async:false}));
  for(const edge of edges){outgoing.get(edge.from).push(edge);degrees.set(edge.to,degrees.get(edge.to)+1);}
  const order=graph.nodes.filter(n=>degrees.get(n.id)===0).map(n=>n.id);
  for(let i=0;i<order.length;i++)for(const e of outgoing.get(order[i])){degrees.set(e.to,degrees.get(e.to)-1);if(degrees.get(e.to)===0)order.push(e.to);}
  const source=graph.nodes.find(n=>n.type==='client');
  flows.set(source.id,{read:settings.rps*settings.readPercent/100,write:settings.rps*(1-settings.readPercent/100),readMs:0,writeMs:0,async:false});
  const stats=new Map(graph.nodes.map(n=>[n.id,{id:n.id,type:n.type,label:n.label,incomingRps:0,readRps:0,writeRps:0,processedRps:0,outgoingRps:0,completedRps:0,rejectedRps:0,failedRps:0,queuedRps:0,acceptedAsyncRps:0,utilization:0,demandRatio:0,latencyMs:n.config.latency,status:'disconnected',reasons:[]}]));
  let completionMass=0;
  function stop(flow,s,reason,deliberate=false){
    const count=total(flow);if(count<EPS)return;
    if(flow.async){summary.queuedRps+=count;s.queuedRps+=count;s.reasons.push(`${reason} Queued jobs remain pending.`);}
    else if(deliberate){summary.rejectedRps+=count;s.rejectedRps+=count;s.reasons.push(reason);}
    else {summary.failedRps+=count;s.failedRps+=count;s.reasons.push(reason);}
  }
  function finish(flow,s){
    const count=total(flow);summary.completedRps+=count;s.completedRps+=count;completionMass+=flow.readMs+flow.writeMs;
    if(flow.async)summary.processedAsyncRps+=count;
  }
  for(const id of order){
    const node=byId.get(id),s=stats.get(id),initial=flows.get(id);let flow={...initial};
    s.incomingRps=total(flow);s.readRps=flow.read;s.writeRps=flow.write;
    if(faults.has(id)){s.status='failed';stop(flow,s,'Component is unavailable.');continue;}
    if(total(flow)<EPS){s.status='idle';continue;}
    s.status='healthy';
    const capacity=node.type==='client'?Infinity:node.config.capacity*node.config.replicas;
    s.demandRatio=capacity===Infinity?0:capacity===0?1:s.incomingRps/capacity;
    if(total(flow)>capacity){const fraction=capacity/total(flow);stop(scaled(flow,1-fraction),s,'Processing capacity is exhausted.');flow=scaled(flow,fraction);}
    s.processedRps=total(flow);s.utilization=capacity===Infinity||capacity===0?0:Math.min(1,total(flow)/capacity);
    flow.readMs+=flow.read*node.config.latency;flow.writeMs+=flow.write*node.config.latency;
    if(node.type==='rate-limiter'&&total(flow)>node.config.rateLimit){
      const fraction=node.config.rateLimit/total(flow);stop(scaled(flow,1-fraction),s,'The configured request limit rejected this traffic.',true);flow=scaled(flow,fraction);
    }
    if(node.type==='cdn'||node.type==='cache'){
      const fraction=node.config.hitRate/100,hit={read:flow.read*fraction,write:0,readMs:flow.readMs*fraction,writeMs:0,async:flow.async};
      finish(hit,s);flow.read-=hit.read;flow.readMs-=hit.readMs;
    }
    if(node.type==='database'){finish(flow,s);flow=emptyFlow();}
    if(node.type==='queue'){
      if(flow.read>EPS){stop({read:flow.read,write:0,readMs:flow.readMs,writeMs:0,async:false},s,'Read requests cannot complete through a write-job queue.');warnings.push(`${node.label} received reads. This model supports asynchronous writes only.`);flow.read=0;flow.readMs=0;}
      if(total(flow)>queueAdmissionCap){const fraction=queueAdmissionCap/total(flow);stop(scaled(flow,1-fraction),s,'The queue buffer is full during this window.');flow=scaled(flow,fraction);}
      summary.acceptedAsyncRps+=total(flow);s.acceptedAsyncRps=total(flow);flow.async=true;
    }
    if(total(flow)>EPS){
      const destinations=outgoing.get(id).filter(e=>node.type!=='load-balancer'||!faults.has(e.to));
      if(!destinations.length){stop(flow,s,outgoing.get(id).length?'No healthy load-balancer target is available.':'This path has no downstream component.');}
      else for(const edge of destinations){const part=scaled(flow,1/destinations.length);merge(flows.get(edge.to),part);edge.rps=total(part);edge.readRps=part.read;edge.writeRps=part.write;edge.async=part.async;s.outgoingRps+=total(part);}
    }
    if(s.failedRps>EPS||s.queuedRps>EPS)s.status='overloaded';
    else if(s.rejectedRps>EPS||s.demandRatio>=0.9)s.status='warning';
  }
  // Restore disconnected state separately from reachable but idle components.
  const reachable=new Set([source.id]),todo=[source.id];
  for(let i=0;i<todo.length;i++)for(const e of outgoing.get(todo[i]))if(!reachable.has(e.to)){reachable.add(e.to);todo.push(e.to);}
  for(const s of stats.values())if(!reachable.has(s.id)&&!faults.has(s.id))s.status='disconnected';
  summary.backlogMessages=summary.queuedRps*settings.durationSeconds;
  summary.completionPercent=settings.rps?summary.completedRps/settings.rps*100:100;
  summary.acceptedPercent=settings.rps?(summary.completedRps+summary.queuedRps)/settings.rps*100:100;
  summary.failurePercent=settings.rps?summary.failedRps/settings.rps*100:0;
  summary.estimatedMeanLatencyMs=summary.completedRps>EPS?completionMass/summary.completedRps:null;
  return {summary,nodes:[...stats.values()],edges,warnings};
}

/** Simulate the actual connections without mutating a submitted design. */
export function simulateDesign(input, options={}) {
  const validation=validateDesign(input), {graph}=validation, normalized=normalizeSettings(options,graph),{settings}=normalized;
  const warnings=[...validation.warnings,...normalized.warnings];
  if(!validation.valid){const summary=freshSummary(settings.rps);summary.failedRps=settings.rps;summary.failurePercent=settings.rps?100:0;return {...validation,warnings,settings,summary,nodes:[],edges:[],assumptions:[...MODEL_ASSUMPTIONS]};}
  let result=flowPass(graph,settings);
  const queue=graph.nodes.find(n=>n.type==='queue');
  if(queue&&result.summary.backlogMessages>queue.config.bufferCapacity+EPS){
    // The queued branch cannot merge with a synchronous branch, so reducing its
    // admission to completed service + available buffer cannot steal capacity.
    const admission=result.summary.processedAsyncRps+queue.config.bufferCapacity/settings.durationSeconds;
    result=flowPass(graph,settings,admission);
    // With equally split but differently sized worker branches, reducing input
    // can also reduce total completion: the faster branch is not reweighted.
    // Find the largest admissible rate instead of assuming completion is fixed.
    const pendingLimit=queue.config.bufferCapacity/settings.durationSeconds;
    if(result.summary.queuedRps>pendingLimit+EPS){
      let low=0,high=admission,safe=flowPass(graph,settings,0);
      for(let step=0;step<52;step++){
        const middle=(low+high)/2,candidate=flowPass(graph,settings,middle);
        if(candidate.summary.queuedRps<=pendingLimit){low=middle;safe=candidate;}else high=middle;
      }
      result=safe;
    }
  }
  warnings.push(...result.warnings);
  if(result.summary.failedRps>EPS)warnings.push('Some offered requests fail before durable acceptance. Inspect red or overloaded components.');
  if(result.summary.queuedRps>EPS)warnings.push('Accepted work is still pending. Queue acceptance is not completed processing.');
  if(result.summary.rejectedRps>EPS)warnings.push('Rate-limited traffic is rejected deliberately; it is not counted as completed work.');
  for(const [key,value] of Object.entries(result.summary))if(typeof value==='number')result.summary[key]=round(value);
  for(const stat of result.nodes)for(const [key,value] of Object.entries(stat))if(typeof value==='number')stat[key]=round(value);
  for(const edge of result.edges)for(const key of ['rps','readRps','writeRps'])edge[key]=round(edge[key]);
  return {valid:true,errors:[],graph,settings,...result,warnings:[...new Set(warnings)],assumptions:[...MODEL_ASSUMPTIONS]};
}

function comparison(actual, requirement) {
  if(typeof actual!=='number'||!Number.isFinite(actual))return false;
  if(requirement.min!==undefined&&(typeof requirement.min!=='number'||!Number.isFinite(requirement.min)||actual+EPS<requirement.min))return false;
  if(requirement.max!==undefined&&(typeof requirement.max!=='number'||!Number.isFinite(requirement.max)||actual-EPS>requirement.max))return false;
  return requirement.min!==undefined||requirement.max!==undefined;
}

function pathExists(graph,from,to) {
  if(!graph.nodes.some(n=>n.id===from)||!graph.nodes.some(n=>n.id===to))return false;
  const seen=new Set([from]),pending=[from];
  for(let i=0;i<pending.length;i++)for(const e of graph.edges)if(e.from===pending[i]&&!seen.has(e.to)){seen.add(e.to);pending.push(e.to);}
  return seen.has(to);
}

/** Public, inspectable requirements. This is feedback, not a secure grader. */
export function evaluateRequirements(input, simulation, requirements=[]) {
  const validation=validateDesign(input),graph=validation.graph;
  if(!Array.isArray(requirements))return {passed:false,checks:[{id:'requirements',label:'Requirements must be an array',passed:false,actual:null,expected:'array'}]};
  const checks=requirements.slice(0,100).map((raw,index)=>{
    const r=record(raw)?raw:{},id=typeof r.id==='string'?r.id:`requirement-${index+1}`,label=typeof r.label==='string'?r.label:'Design requirement';let actual=null,passed=false,expected={min:r.min,max:r.max};
    if(r.kind==='metric'){actual=simulation?.summary?.[r.metric];passed=comparison(actual,r);}
    else if(r.kind==='node-metric'){actual=simulation?.nodes?.find(n=>n.id===r.nodeId)?.[r.metric];passed=comparison(actual,r);}
    else if(r.kind==='type-count'){actual=graph.nodes.filter(n=>n.type===r.type).length;passed=comparison(actual,r);}
    else if(r.kind==='node-config'){actual=graph.nodes.find(n=>n.id===r.nodeId)?.config?.[r.field];passed=comparison(actual,r);}
    else if(r.kind==='type-config'){actual=graph.nodes.filter(n=>n.type===r.type).map(n=>n.config?.[r.field]);passed=actual.length>0&&actual.every(value=>comparison(value,r));}
    else if(r.kind==='max-nodes'){actual=graph.nodes.length;expected={max:r.value};passed=comparison(actual,{max:r.value});}
    else if(r.kind==='path'){actual=pathExists(graph,r.from,r.to);expected=`A path from ${r.from} to ${r.to}`;passed=actual;}
    else if(r.kind==='min-completion-percent'){actual=simulation?.summary?.completionPercent;expected={min:r.value};passed=comparison(actual,{min:r.value});}
    else if(r.kind==='max-failure-percent'){actual=simulation?.summary?.failurePercent;expected={max:r.value};passed=comparison(actual,{max:r.value});}
    else if(r.kind==='max-backlog'){actual=simulation?.summary?.backlogMessages;expected={max:r.value};passed=comparison(actual,{max:r.value});}
    else if(r.kind==='max-latency'){actual=simulation?.summary?.estimatedMeanLatencyMs;expected={max:r.value};passed=comparison(actual,{max:r.value});}
    else expected='A supported requirement kind';
    return {id,label,passed:Boolean(validation.valid&&simulation?.valid&&passed),actual:actual??null,expected};
  });
  if(!validation.valid||!simulation?.valid)checks.unshift({id:'valid-design',label:'A valid, runnable design',passed:false,actual:validation.errors.join(' ')||simulation?.errors?.join(' ')||'No simulation',expected:'Valid connected request flow'});
  if(requirements.length>100)checks.push({id:'requirement-limit',label:'Bounded requirement list',passed:false,actual:requirements.length,expected:'At most 100'});
  return {passed:checks.length>0&&checks.every(c=>c.passed),checks};
}
