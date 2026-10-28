import test from 'node:test';
import assert from 'node:assert/strict';
import {NODE_TYPES,DESIGN_LIMITS,validateDesign,simulateDesign,evaluateRequirements} from '../src/system-design-engine.mjs';
import {DESIGN_CHALLENGES,checkDesignChallenge} from '../src/system-design-content.mjs';

const node=(id,type,config={})=>({id,type,label:id,x:40,y:80,config});
const graph=(nodes,pairs)=>({nodes,edges:pairs.map(([from,to],i)=>({id:`e${i}`,from,to}))});
const line=(...nodes)=>graph(nodes,nodes.slice(1).map((n,i)=>[nodes[i].id,n.id]));
const base=()=>line(node('clients','client'),node('app','server',{capacity:500,latency:10}),node('db','database',{capacity:500,latency:8}));
const find=(r,id)=>r.nodes.find(n=>n.id===id);
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.00002,`${a} differs from ${b}`);
function conserved(result){
  assert.equal(result.valid,true,result.errors.join(' '));
  const s=result.summary;
  near(s.offeredRps,s.completedRps+s.failedRps+s.rejectedRps+s.queuedRps);
  for(const key of ['completedRps','failedRps','rejectedRps','queuedRps','acceptedAsyncRps','processedAsyncRps','backlogMessages'])assert.ok(Number.isFinite(s[key])&&s[key]>=0,`${key} is finite and nonnegative`);
  near(s.backlogMessages,s.queuedRps*result.settings.durationSeconds);
  assert.ok(s.processedAsyncRps<=s.acceptedAsyncRps+0.00002);
}

test('flow model uses connections and does not mutate input',()=>{
  const g=base(),original=structuredClone(g);
  Object.freeze(g.nodes[0].config);Object.freeze(g.nodes[0]);Object.freeze(g.nodes);Object.freeze(g.edges);Object.freeze(g);
  const result=simulateDesign(g,{rps:200,readPercent:60});conserved(result);
  assert.deepEqual(g,original);assert.equal(result.summary.completedRps,200);assert.equal(result.summary.estimatedMeanLatencyMs,18);
  assert.equal(find(result,'db').readRps,120);assert.equal(find(result,'db').writeRps,80);assert.deepEqual(result.edges.map(e=>e.rps),[200,200]);
});

test('server capacity produces attributed failure rather than disappearing requests',()=>{
  const g=base();g.nodes[1].config.capacity=60;
  const result=simulateDesign(g,{rps:200});conserved(result);
  assert.equal(result.summary.completedRps,60);assert.equal(result.summary.failedRps,140);assert.equal(find(result,'app').failedRps,140);assert.equal(find(result,'app').status,'overloaded');assert.equal(find(result,'db').incomingRps,60);
});

test('replicas multiply configured capacity',()=>{
  const g=base();g.nodes[1].config={capacity:60,replicas:4};
  const result=simulateDesign(g,{rps:200});conserved(result);assert.equal(result.summary.completedRps,200);near(find(result,'app').utilization,200/240);
});

test('zero capacity cannot complete requests',()=>{
  const g=base();g.nodes[2].config.capacity=0;
  const result=simulateDesign(g,{rps:50});conserved(result);assert.equal(result.summary.failedRps,50);assert.equal(result.summary.estimatedMeanLatencyMs,null);
});

test('cache hits only reads, preserves every write and weights path latency',()=>{
  const g=line(node('c','client'),node('app','server',{capacity:500,latency:10}),node('cache','cache',{capacity:500,latency:2,hitRate:75}),node('db','database',{capacity:500,latency:8}));
  const result=simulateDesign(g,{rps:100,readPercent:80});conserved(result);
  assert.equal(find(result,'cache').completedRps,60);assert.equal(find(result,'db').incomingRps,40);assert.equal(find(result,'db').writeRps,20);assert.equal(find(result,'db').readRps,20);assert.equal(result.summary.estimatedMeanLatencyMs,15.2);
});

test('100% cache hit configuration still sends all writes to storage',()=>{
  const g=line(node('c','client'),node('cache','cache',{hitRate:100}),node('db','database',{capacity:30}));
  const result=simulateDesign(g,{rps:100,readPercent:40});conserved(result);assert.equal(find(result,'db').incomingRps,60);assert.equal(result.summary.completedRps,70);assert.equal(result.summary.failedRps,30);
});

test('cache processing budget applies before hits',()=>{
  const g=line(node('c','client'),node('cache','cache',{capacity:50,hitRate:100}),node('db','database'));
  const result=simulateDesign(g,{rps:100,readPercent:100});conserved(result);assert.equal(result.summary.completedRps,50);assert.equal(result.summary.failedRps,50);assert.equal(find(result,'db').incomingRps,0);
});

test('serial CDN and cache hit rates apply to remaining reads',()=>{
  const g=line(node('c','client'),node('cdn','cdn',{hitRate:50}),node('cache','cache',{hitRate:50}),node('db','database'));
  const result=simulateDesign(g,{rps:100,readPercent:100});conserved(result);assert.equal(find(result,'cdn').completedRps,50);assert.equal(find(result,'cache').completedRps,25);assert.equal(find(result,'db').incomingRps,25);
});

function balanced(){return graph([node('c','client'),node('lb','load-balancer'),node('a','server',{capacity:100}),node('b','server',{capacity:100}),node('db','database',{capacity:500})],[['c','lb'],['lb','a'],['lb','b'],['a','db'],['b','db']]);}

test('load balancing divides rather than duplicates requests and merges conserve flow',()=>{
  const result=simulateDesign(balanced(),{rps:180});conserved(result);assert.equal(find(result,'a').incomingRps,90);assert.equal(find(result,'b').incomingRps,90);assert.equal(find(result,'db').incomingRps,180);assert.equal(result.summary.completedRps,180);
});

test('load balancer excludes a directly failed target and redistributes to survivors',()=>{
  const result=simulateDesign(balanced(),{rps:180,failedNodeIds:['a']});conserved(result);assert.equal(find(result,'a').incomingRps,0);assert.equal(find(result,'a').status,'failed');assert.equal(find(result,'b').incomingRps,180);assert.equal(result.summary.completedRps,100);assert.equal(result.summary.failedRps,80);
});

test('no healthy load-balancer target fails traffic explicitly',()=>{
  const result=simulateDesign(balanced(),{rps:180,failedNodeIds:['a','b']});conserved(result);assert.equal(find(result,'lb').failedRps,180);assert.equal(result.summary.completedRps,0);assert.match(find(result,'lb').reasons.join(' '),/No healthy/);
});

test('load balancer does not invent visibility into downstream failures',()=>{
  const g=balanced();g.nodes.push(node('db2','database'));g.edges.find(e=>e.from==='b'&&e.to==='db').to='db2';
  const result=simulateDesign(g,{rps:180,failedNodeIds:['db']});conserved(result);assert.equal(find(result,'a').incomingRps,90);assert.equal(result.summary.failedRps,90);assert.equal(result.summary.completedRps,90);
});

test('rate limiting is separate from capacity failure and completed work',()=>{
  const g=line(node('c','client'),node('limit','rate-limiter',{rateLimit:70}),node('db','database',{capacity:50}));
  const result=simulateDesign(g,{rps:100});conserved(result);assert.equal(result.summary.rejectedRps,30);assert.equal(result.summary.failedRps,20);assert.equal(result.summary.completedRps,50);assert.equal(result.summary.acceptedPercent,50);
});

test('unconnected components do not magically handle offered traffic',()=>{
  const g=base();g.nodes.push(node('extra','database'));
  const result=simulateDesign(g,{rps:100});conserved(result);assert.equal(find(result,'extra').incomingRps,0);assert.equal(find(result,'extra').status,'disconnected');assert.match(result.warnings.join(' '),/disconnected/);
});

test('dead ends fail requests unless they are actual cache hits',()=>{
  const dead=line(node('c','client'),node('app','server'));
  const a=simulateDesign(dead,{rps:100});conserved(a);assert.equal(a.summary.failedRps,100);
  const cache=line(node('c','client'),node('cache','cache',{hitRate:80}));
  const b=simulateDesign(cache,{rps:100,readPercent:100});conserved(b);assert.equal(b.summary.completedRps,80);assert.equal(b.summary.failedRps,20);
});

function queued(bufferCapacity=10000){return line(node('c','client'),node('q','queue',{bufferCapacity}),node('worker','worker',{capacity:40,latency:30}),node('db','database',{capacity:500,latency:8}));}

test('queue admission, processing, and unfinished durable work are distinct',()=>{
  const result=simulateDesign(queued(),{rps:100,readPercent:0,durationSeconds:30});conserved(result);
  assert.equal(result.summary.acceptedAsyncRps,100);assert.equal(result.summary.processedAsyncRps,40);assert.equal(result.summary.completedRps,40);assert.equal(result.summary.queuedRps,60);assert.equal(result.summary.backlogMessages,1800);assert.equal(result.summary.failedRps,0);assert.equal(result.summary.completionPercent,40);assert.equal(result.summary.acceptedPercent,100);
});

test('finite queue buffer rejects excess admission as failures',()=>{
  const result=simulateDesign(queued(300),{rps:100,readPercent:0,durationSeconds:30});conserved(result);
  assert.equal(result.summary.acceptedAsyncRps,50);assert.equal(result.summary.processedAsyncRps,40);assert.equal(result.summary.queuedRps,10);assert.equal(result.summary.failedRps,50);assert.equal(result.summary.backlogMessages,300);assert.equal(find(result,'q').failedRps,50);assert.equal(find(result,'worker').incomingRps,50);
});

test('zero queue buffer permits only immediately processed work',()=>{
  const result=simulateDesign(queued(0),{rps:100,readPercent:0,durationSeconds:30});conserved(result);assert.equal(result.summary.acceptedAsyncRps,40);assert.equal(result.summary.queuedRps,0);assert.equal(result.summary.failedRps,60);
});

test('worker outage accumulates pending work only up to finite buffer',()=>{
  const result=simulateDesign(queued(900),{rps:100,readPercent:0,durationSeconds:30,failedNodeIds:['worker']});conserved(result);
  assert.equal(result.summary.completedRps,0);assert.equal(result.summary.acceptedAsyncRps,30);assert.equal(result.summary.queuedRps,30);assert.equal(result.summary.backlogMessages,900);assert.equal(result.summary.failedRps,70);
});

test('failure of queue itself is not durable acceptance',()=>{
  const result=simulateDesign(queued(),{rps:100,readPercent:0,failedNodeIds:['q']});conserved(result);assert.equal(result.summary.failedRps,100);assert.equal(result.summary.acceptedAsyncRps,0);assert.equal(result.summary.queuedRps,0);
});

test('reads sent to write queue fail with an explicit warning',()=>{
  const result=simulateDesign(queued(),{rps:100,readPercent:60});conserved(result);assert.equal(result.summary.failedRps,60);assert.equal(result.summary.acceptedAsyncRps,40);assert.equal(result.summary.completedRps,40);assert.match(result.warnings.join(' '),/reads/);
});

test('post-queue downstream database limit preserves jobs as backlog',()=>{
  const g=queued();g.nodes[3].config.capacity=10;
  const result=simulateDesign(g,{rps:100,readPercent:0,durationSeconds:30});conserved(result);assert.equal(result.summary.completedRps,10);assert.equal(result.summary.queuedRps,90);assert.equal(result.summary.failedRps,0);assert.equal(find(result,'db').queuedRps,30);assert.equal(find(result,'worker').queuedRps,60);
});

test('finite buffer stays bounded when equally split workers have unequal capacities',()=>{
  const g=graph([node('c','client'),node('q','queue',{bufferCapacity:300}),node('lb','load-balancer'),node('slow','worker',{capacity:10}),node('fast','worker',{capacity:100}),node('db','database',{capacity:500})],[['c','q'],['q','lb'],['lb','slow'],['lb','fast'],['slow','db'],['fast','db']]);
  const result=simulateDesign(g,{rps:100,readPercent:0,durationSeconds:30});conserved(result);
  near(result.summary.acceptedAsyncRps,40);near(result.summary.processedAsyncRps,30);near(result.summary.queuedRps,10);near(result.summary.failedRps,60);near(result.summary.backlogMessages,300);
  assert.ok(result.summary.backlogMessages<=300.00001);
  assert.equal(find(result,'fast').incomingRps,20,'Equal balancing does not reweight the fast worker to absorb all spare work');
});

test('pending window is explicit: longer overload exhausts fixed buffer',()=>{
  const short=simulateDesign(queued(600),{rps:100,readPercent:0,durationSeconds:10});
  const long=simulateDesign(queued(600),{rps:100,readPercent:0,durationSeconds:30});
  conserved(short);conserved(long);assert.equal(short.summary.failedRps,0);assert.equal(long.summary.failedRps,40);assert.equal(long.summary.backlogMessages,600);
});

test('zero offered load has no NaN latency or fictional traffic',()=>{
  const result=simulateDesign(base(),{rps:0});conserved(result);assert.equal(result.summary.completedRps,0);assert.equal(result.summary.completionPercent,100);assert.equal(result.summary.estimatedMeanLatencyMs,null);
});

test('cycles and self-loops are rejected without running or hanging',()=>{
  const g=line(node('c','client'),node('a','server'),node('b','cache'));g.edges.push({id:'loop',from:'b',to:'a'});
  assert.equal(validateDesign(g).valid,false);assert.match(validateDesign(g).errors.join(' '),/Cycles/);assert.equal(simulateDesign(g).valid,false);
  const self=base();self.edges.push({id:'self',from:'app',to:'app'});assert.match(validateDesign(self).errors.join(' '),/itself/);
});

test('non-balancer fan-out cannot duplicate work',()=>{
  const g=base();g.nodes.push(node('db2','database'));g.edges.push({id:'other',from:'app',to:'db2'});
  const validation=validateDesign(g);assert.equal(validation.valid,false);assert.match(validation.errors.join(' '),/load balancer/);
});

test('queue branch merging into synchronous flow is outside supported model',()=>{
  const g=graph([node('c','client'),node('lb','load-balancer'),node('q','queue'),node('a','server'),node('db','database')],[['c','lb'],['lb','q'],['lb','a'],['q','db'],['a','db']]);
  const validation=validateDesign(g);assert.equal(validation.valid,false);assert.match(validation.errors.join(' '),/merge with synchronous/);
});

test('multiple sources, queues, terminal DB edges and missing endpoints fail validation',()=>{
  const duplicate=base();duplicate.nodes.push(node('c2','client'));assert.equal(validateDesign(duplicate).valid,false);
  const queues=line(node('c','client'),node('q','queue'),node('q2','queue'));assert.match(validateDesign(queues).errors.join(' '),/at most one/);
  const terminal=base();terminal.edges.push({id:'out',from:'db',to:'app'});assert.match(validateDesign(terminal).errors.join(' '),/terminal database/);
  const missing=base();missing.edges.push({id:'bad',from:'app',to:'missing'});assert.equal(validateDesign(missing).valid,false);
});

test('unsafe and malformed imports are bounded normalized data, not executable configuration',()=>{
  const g=JSON.parse('{"nodes":[{"id":"c","type":"client","label":"<img src=x>","config":{"__proto__":{"polluted":true},"capacity":1000},"secret":"discard"},{"id":"db","type":"database","config":{"capacity":1e99}}],"edges":[{"id":"e","from":"c","to":"db","code":"alert(1)"}],"__proto__":{"polluted":true}}');
  const r=validateDesign(g);assert.equal(r.valid,false);assert.equal({}.polluted,undefined);assert.equal(r.graph.nodes[0].secret,undefined);assert.equal(r.graph.edges[0].code,undefined);assert.equal(r.graph.nodes[0].config.polluted,undefined);assert.equal(r.graph.nodes[1].config.capacity,NODE_TYPES.database.defaults.capacity);assert.equal(r.graph.nodes[0].label,'<img src=x>');
  assert.equal(validateDesign(null).valid,false);assert.equal(validateDesign({nodes:{},edges:[]}).valid,false);
});

test('config numeric bounds, identity collisions and graph limits are enforced',()=>{
  for(const config of [{replicas:1.5},{capacity:-1},{hitRate:101},{latency:Infinity}]){const g=line(node('c','client'),node('x','cache',config));assert.equal(validateDesign(g).valid,false);}
  const duplicate=base();duplicate.nodes.push(node('app','server'));assert.match(validateDesign(duplicate).errors.join(' '),/Duplicate component/);
  const tooBig={nodes:Array.from({length:DESIGN_LIMITS.nodes+3},(_,i)=>node(`n${i}`,i?'database':'client')),edges:[]};const r=validateDesign(tooBig);assert.equal(r.valid,false);assert.equal(r.graph.nodes.length,DESIGN_LIMITS.nodes);
});

test('invalid workload numbers are reset and bounded with visible warnings',()=>{
  const r=simulateDesign(base(),{rps:Infinity,readPercent:300,durationSeconds:-100,failedNodeIds:['unknown','app','app']});conserved(r);assert.equal(r.settings.rps,300);assert.equal(r.settings.readPercent,100);assert.equal(r.settings.durationSeconds,1);assert.deepEqual(r.settings.failedNodeIds,['app']);assert.equal(r.warnings.filter(w=>/bounded/.test(w)).length,3);
});

test('public requirements inspect actual normalized topology, config, and result',()=>{
  const g=base(),s=simulateDesign(g,{rps:200});
  const requirements=[{kind:'metric',metric:'completionPercent',min:100},{kind:'node-metric',nodeId:'db',metric:'writeRps',min:40,max:40},{kind:'type-count',type:'server',min:1,max:1},{kind:'node-config',nodeId:'app',field:'capacity',min:500,max:500},{kind:'type-config',type:'database',field:'replicas',max:1},{kind:'max-nodes',value:3},{kind:'path',from:'c lient',to:'db'}];
  const bad=evaluateRequirements(g,s,requirements);assert.equal(bad.passed,false);assert.equal(bad.checks.at(-1).passed,false);
  requirements.at(-1).from='clients';assert.equal(evaluateRequirements(g,s,requirements).passed,true);
  requirements[0].min=101;assert.equal(evaluateRequirements(g,s,requirements).passed,false);
});

test('missing requirements, missing metrics, invalid graphs and unknown checks cannot pass',()=>{
  const g=base(),s=simulateDesign(g);
  assert.equal(evaluateRequirements(g,s,[]).passed,false);
  for(const requirement of [{kind:'metric',metric:'madeUp',max:100},{kind:'node-config',nodeId:'missing',field:'capacity',max:100},{kind:'type-config',type:'cache',field:'hitRate',max:100},{kind:'imaginary'}])assert.equal(evaluateRequirements(g,s,[requirement]).passed,false);
  const invalid=base();invalid.edges.push({id:'extra',from:'clients',to:'db'});assert.equal(evaluateRequirements(invalid,s,[{kind:'max-nodes',value:20}]).passed,false);
});

test('many changed loads, hits, capacities and failures preserve rates',()=>{
  let seed=731;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
  for(let i=0;i<120;i++){
    const g=balanced();g.nodes.splice(1,0,node('cache','cache',{capacity:100+random()*1000,hitRate:random()*100}));g.edges[0].to='cache';g.edges.push({id:'cache-lb',from:'cache',to:'lb'});
    g.nodes.find(n=>n.id==='a').config.capacity=random()*500;g.nodes.find(n=>n.id==='b').config.capacity=random()*500;g.nodes.find(n=>n.id==='db').config.capacity=random()*700;
    conserved(simulateDesign(g,{rps:random()*2000,readPercent:random()*100,durationSeconds:1+random()*300,failedNodeIds:i%3===0?['a']:[]}));
  }
});

for(const challenge of DESIGN_CHALLENGES){
  test(`authored design ${challenge.id}: reference satisfies baseline and changed fixtures`,()=>{
    const before=structuredClone(challenge.solution),result=checkDesignChallenge(challenge.solution,challenge);
    assert.equal(result.passed,true,result.checks.filter(c=>!c.passed).map(c=>`${c.label}: ${JSON.stringify(c.actual)}`).join('\n'));
    assert.deepEqual(challenge.solution,before);
    for(const fixture of result.fixtures)conserved(fixture.simulation);
    assert.ok(result.fixtures.length>=2,'A changed workload is required');
  });
  test(`authored design ${challenge.id}: deliberate bug is rejected`,()=>{
    const result=checkDesignChallenge(challenge.bug,challenge);
    assert.equal(result.passed,false);assert.ok(result.fixtures.some(f=>!f.passed));
    for(const fixture of result.fixtures)if(fixture.simulation.valid)conserved(fixture.simulation);
  });
  test(`authored design ${challenge.id}: incomplete starter requires work`,()=>{
    const result=checkDesignChallenge(challenge.starter,challenge);
    assert.equal(result.passed,false);
  });
}
