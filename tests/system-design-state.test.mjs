import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeDesign,sanitizeSettings,freshDesignWorkspace,validateDesignWorkspace,designBackup,parseDesignBackup,DESIGN_BACKUP_FORMAT} from '../src/system-design-state.mjs';
import {validateDesign,simulateDesign} from '../src/system-design-engine.mjs';

const ids=['first-design','second-design'];
const graph=()=>({nodes:[{id:'clients',type:'client',label:'Clients',x:40,y:90,config:{}},{id:'api',type:'server',label:'API',x:300,y:90,config:{capacity:300,replicas:1}},{id:'db',type:'database',label:'Database',x:600,y:90,config:{capacity:500}}],edges:[{id:'e1',from:'clients',to:'api'},{id:'e2',from:'api',to:'db'}]});
const draft=(g=graph())=>({graph:g,settings:{rps:250,readPercent:40,durationSeconds:30,failedNodeIds:[]},notes:'Explain the write boundary.',helpLevel:'hint',updatedAt:'2026-10-28T12:00:00.000Z'});
const workspace=()=>({version:1,selectedChallenge:ids[0],drafts:{[ids[0]]:draft()},attempts:[]});
const attempt=(i=1)=>({challengeId:ids[0],at:`2026-10-28T12:00:${String(i%60).padStart(2,'0')}.000Z`,passed:i%2===0,passedChecks:i,totalChecks:150,helpLevel:'none',notes:`Attempt ${i}`,graph:graph(),settings:{rps:i,readPercent:20,durationSeconds:30,failedNodeIds:[]}});

test('design backup round trip preserves diagrams, settings, notes, and assistance',()=>{
  const raw=workspace();raw.attempts=[attempt(4)];
  const backup=designBackup(raw);assert.equal(backup.format,DESIGN_BACKUP_FORMAT);assert.equal(backup.version,1);assert.ok(Number.isFinite(Date.parse(backup.exportedAt)));
  const restored=parseDesignBackup(JSON.stringify(backup),ids);
  assert.deepEqual(restored,validateDesignWorkspace(raw,ids));
  assert.equal(restored.drafts[ids[0]].notes,'Explain the write boundary.');assert.equal(restored.drafts[ids[0]].helpLevel,'hint');assert.equal(restored.attempts[0].graph.nodes.length,3);
});

test('normalization copies data and keeps edits to restored drafts independent',()=>{
  const raw=workspace(),before=JSON.stringify(raw),clean=validateDesignWorkspace(raw,ids);
  clean.drafts[ids[0]].graph.nodes[1].config.capacity=17;clean.drafts[ids[0]].settings.failedNodeIds.push('api');
  assert.equal(JSON.stringify(raw),before);
});

test('incomplete disconnected drafts survive import and remain repairable',()=>{
  const raw=workspace();raw.drafts[ids[0]].graph.edges=[];
  const clean=parseDesignBackup(JSON.stringify(designBackup(raw)),ids);
  assert.equal(clean.drafts[ids[0]].graph.nodes.length,3);assert.equal(clean.drafts[ids[0]].graph.edges.length,0);
  const simulation=simulateDesign(clean.drafts[ids[0]].graph,{rps:100});assert.equal(simulation.summary.completedRps,0);assert.equal(simulation.summary.failedRps,100);
});

test('directed cycles remain draft data and fail the separate runtime validator',()=>{
  const raw=workspace();raw.drafts[ids[0]].graph.edges.push({id:'cycle',from:'db',to:'api'});
  const clean=parseDesignBackup(JSON.stringify(designBackup(raw)),ids);
  assert.equal(clean.drafts[ids[0]].graph.edges.length,3);assert.equal(validateDesign(clean.drafts[ids[0]].graph).valid,false);
});

test('finite but invalid component assumptions remain visible for correction',()=>{
  const g=graph();g.nodes[1].config.capacity=-7;
  const clean=sanitizeDesign(g);assert.equal(clean.nodes[1].config.capacity,-7);assert.equal(validateDesign(clean).valid,false);
});

test('graph sanitizer drops arbitrary properties and safely retains opaque label text',()=>{
  const g=graph();g.nodes[1].label='<script>do not execute</script>';g.nodes[1].secret='drop';g.nodes[1].config.apiKey='drop';g.nodes[1].config.hitRate=90;g.nodes[1].config.bufferCapacity=1000;g.nodes[1].config.capacity=Infinity;g.edges[0].code='drop';
  const clean=sanitizeDesign(g);
  assert.equal(clean.nodes[1].secret,undefined);assert.equal(clean.nodes[1].config.apiKey,undefined);assert.equal(clean.nodes[1].config.hitRate,undefined);assert.equal(clean.nodes[1].config.bufferCapacity,undefined);assert.equal(clean.nodes[1].config.capacity,undefined);assert.equal(clean.edges[0].code,undefined);assert.equal(clean.nodes[1].label,'<script>do not execute</script>');
});

test('graphs with duplicate identities, bad endpoints, or unsupported types are rejected',()=>{
  const duplicate=graph();duplicate.nodes.push({...duplicate.nodes[0]});assert.equal(sanitizeDesign(duplicate),null);
  const endpoint=graph();endpoint.edges[0].to='missing';assert.equal(sanitizeDesign(endpoint),null);
  const edgeId=graph();edgeId.edges[1].id=edgeId.edges[0].id;assert.equal(sanitizeDesign(edgeId),null);
  const badType=graph();badType.nodes[0].type='script';assert.equal(sanitizeDesign(badType),null);
  assert.equal(sanitizeDesign(null),null);assert.equal(sanitizeDesign({nodes:{},edges:[]}),null);
});

test('node and connection caps prevent oversized imported workspaces',()=>{
  const many=graph();many.nodes=Array.from({length:25},(_,i)=>({id:`node-${i}`,type:'server',config:{}}));many.edges=[];assert.equal(sanitizeDesign(many),null);
  const edges=graph();edges.edges=Array.from({length:61},(_,i)=>({id:`edge-${i}`,from:'clients',to:'api'}));assert.equal(sanitizeDesign(edges),null);
});

test('imported coordinates, labels, and unknown field types stay bounded',()=>{
  const g=graph();g.nodes[0].x=1e100;g.nodes[0].y=-100;g.nodes[0].label='x'.repeat(200);g.nodes[1].x={valueOf:null,toString:null};
  const clean=sanitizeDesign(g);assert.equal(clean.nodes[0].x,840);assert.equal(clean.nodes[0].y,16);assert.equal(clean.nodes[0].label.length,40);assert.equal(clean.nodes[1].x,40);
});

test('null and non-object settings fall back without aborting the backup',()=>{
  for(const value of [null,[],true,'bad'])assert.deepEqual(sanitizeSettings(value),sanitizeSettings());
  const raw=workspace();raw.drafts[ids[0]].settings=null;raw.attempts=[{...attempt(),settings:null}];
  const clean=parseDesignBackup(JSON.stringify(designBackup(raw)),ids);
  assert.equal(clean.drafts[ids[0]].settings.rps,300);assert.equal(clean.attempts[0].settings.durationSeconds,30);
});

test('numeric settings bound input without invoking object coercion hooks',()=>{
  const settings=sanitizeSettings({rps:{valueOf:null,toString:null},readPercent:200,durationSeconds:-10,failedNodeIds:[]});
  assert.equal(settings.rps,300);assert.equal(settings.readPercent,100);assert.equal(settings.durationSeconds,1);
  assert.equal(sanitizeSettings({rps:' 725 ',readPercent:'25',durationSeconds:'120'}).rps,725);
  assert.equal(sanitizeSettings({rps:Infinity}).rps,300);assert.equal(sanitizeSettings({rps:1e100}).rps,20000);
});

test('fault list is bounded, deduplicated, and contains only safe identifiers',()=>{
  const settings=sanitizeSettings({failedNodeIds:['api','api','<script>','__proto__','constructor',null,...Array.from({length:40},(_,i)=>`node-${i}`)]});
  assert.equal(settings.failedNodeIds.length,24);assert.equal(settings.failedNodeIds[0],'api');assert.equal(new Set(settings.failedNodeIds).size,24);assert.ok(!settings.failedNodeIds.includes('constructor'));
});

test('reserved prototype keys cannot become workspace identities even without an allowlist',()=>{
  const raw=JSON.parse('{"version":1,"selectedChallenge":"constructor","drafts":{"constructor":{},"prototype":{},"__proto__":{}},"attempts":[]}');
  for(const key of ['constructor','prototype','__proto__'])raw.drafts[key]=draft();
  const clean=validateDesignWorkspace(raw);
  assert.equal(clean.selectedChallenge,'');assert.deepEqual(Object.keys(clean.drafts),[]);assert.equal(Object.getPrototypeOf(clean.drafts),Object.prototype);assert.equal({}.polluted,undefined);
  for(const id of ['__proto__','prototype','constructor']){const g=graph();g.nodes[0].id=id;g.edges[0].from=id;assert.equal(sanitizeDesign(g),null);}
});

test('unknown challenge records are excluded by the declared allowlist',()=>{
  const raw=workspace();raw.selectedChallenge='unknown';raw.drafts.unknown=draft();raw.attempts=[{...attempt(),challengeId:'unknown'}];
  const clean=validateDesignWorkspace(raw,ids);assert.equal(clean.selectedChallenge,'');assert.deepEqual(Object.keys(clean.drafts),[ids[0]]);assert.equal(clean.attempts.length,0);
});

test('invalid drafts do not erase other recoverable diagrams',()=>{
  const raw=workspace();raw.drafts[ids[1]]={...draft(),graph:{nodes:'bad',edges:[]}};
  const clean=parseDesignBackup(JSON.stringify(designBackup(raw)),ids);assert.deepEqual(Object.keys(clean.drafts),[ids[0]]);
});

test('attempt retention uses the latest 100 records and preserves each graph snapshot',()=>{
  const raw=workspace();raw.attempts=Array.from({length:140},(_,i)=>attempt(i));
  const clean=validateDesignWorkspace(raw,ids);assert.equal(clean.attempts.length,100);assert.equal(clean.attempts[0].notes,'Attempt 40');assert.equal(clean.attempts.at(-1).notes,'Attempt 139');
  clean.drafts[ids[0]].graph.nodes[1].config.capacity=1;assert.equal(clean.attempts.at(-1).graph.nodes[1].config.capacity,300);
});

test('attempt field validation excludes malformed scores and bounds retained text',()=>{
  const raw=workspace();raw.attempts=[null,{...attempt(),passed:'yes'},{...attempt(),challengeId:'unknown'},{...attempt(),passedChecks:1e9,totalChecks:-3,notes:'x'.repeat(9000),at:'x'.repeat(90),helpLevel:'invented'}];
  const clean=validateDesignWorkspace(raw,ids);assert.equal(clean.attempts.length,1);const a=clean.attempts[0];assert.equal(a.passedChecks,500);assert.equal(a.totalChecks,0);assert.equal(a.notes.length,6000);assert.equal(a.at.length,40);assert.equal(a.helpLevel,'none');
});

test('draft help records and notes survive while unsupported metadata is dropped',()=>{
  const raw=workspace();raw.drafts[ids[0]].helpLevel='solution';raw.drafts[ids[0]].notes='n'.repeat(7000);raw.drafts[ids[0]].secret='drop';raw.secret='drop';
  const clean=validateDesignWorkspace(raw,ids);assert.equal(clean.drafts[ids[0]].helpLevel,'solution');assert.equal(clean.drafts[ids[0]].notes.length,6000);assert.equal(clean.drafts[ids[0]].secret,undefined);assert.equal(clean.secret,undefined);
});

test('backup parser rejects wrong formats, unsupported versions, malformed JSON, and huge files',()=>{
  assert.throws(()=>parseDesignBackup('{',ids),/valid JSON/);
  assert.throws(()=>parseDesignBackup(JSON.stringify({format:'tracecraft-training',version:1,data:workspace()}),ids),/separate import/);
  assert.throws(()=>parseDesignBackup(JSON.stringify({format:DESIGN_BACKUP_FORMAT,version:2,data:workspace()}),ids),/TraceCraft/);
  assert.throws(()=>parseDesignBackup(JSON.stringify({format:DESIGN_BACKUP_FORMAT,version:1,data:{version:99}}),ids),/supported/);
  assert.throws(()=>parseDesignBackup(' '.repeat(2_000_001),ids),/smaller than 2 MB/);
  assert.throws(()=>parseDesignBackup(null,ids),/smaller than 2 MB/);
});

test('fresh workspace instances do not share mutable drafts or attempt history',()=>{
  const a=freshDesignWorkspace(),b=freshDesignWorkspace();a.drafts.first=draft();a.attempts.push(attempt());
  assert.deepEqual(b,{version:1,selectedChallenge:'',drafts:{},attempts:[]});
});
