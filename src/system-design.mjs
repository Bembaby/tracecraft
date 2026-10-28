import { CONTENT_REVISION, RUNTIME_VERSIONS } from './practice-versions.mjs';
import { NODE_TYPES, simulateDesign } from './system-design-engine.mjs';
import { DESIGN_CHALLENGES, checkDesignChallenge } from './system-design-content.mjs';
import { DESIGN_STORAGE_KEY, freshDesignWorkspace, validateDesignWorkspace, sanitizeDesign, sanitizeSettings, designBackup, parseDesignBackup } from './system-design-state.mjs';

const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = value => JSON.parse(JSON.stringify(value));
const number = (value, digits = 0) => Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: digits }) : 'N/A';
const copy = value => (Array.isArray(value) ? value : [value]).filter(Boolean).map(p => `<p>${html(p)}</p>`).join('');
const paths = {
  client:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
  cdn:'<path d="M7 17a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 0 9H7Z"/>',
  gateway:'<path d="M4 20V4h16v16M8 20v-9h8v9M8 7h8"/>',
  'rate-limiter':'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z M8 12h8"/>',
  'load-balancer':'<rect x="9" y="2" width="6" height="5" rx="1"/><path d="M12 7v5H4v5m8-5h8v5m-8-5v5"/><path d="M1 17h6v5H1zM9 17h6v5H9zM17 17h6v5h-6z"/>',
  server:'<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  cache:'<path d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  queue:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 10v4M12 10v4M17 10v4"/>',
  worker:'<path d="m9 4 3-2 3 2 1 3 4 1 2 3-2 3-4 1-1 4-3 2-3-2-1-4-4-1-2-3 2-3 4-1 1-3Z"/><circle cx="12" cy="11" r="3"/>',
  play:'<path d="m7 4 13 8-13 8V4Z"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  undo:'<path d="m8 3-5 5 5 5M3 8h10a7 7 0 0 1 0 14"/>',
  connect:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="M5 8v5h14v3"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" class="design-icon">${paths[name] || paths.server}</svg>`;
const button = (action, label, attributes = '', className = 'ghost') => `<button class="${className}" data-design="${action}" ${attributes}>${label}</button>`;
let workspace;
try { workspace = validateDesignWorkspace(JSON.parse(localStorage.getItem(DESIGN_STORAGE_KEY)), DESIGN_CHALLENGES.map(c => c.id)); }
catch { workspace = freshDesignWorkspace(); }
let root = null, notify = () => {}, selectedNode = null, connecting = null, simulation = null, check = null;
let tab = 'canvas', hintCount = 0, showSolution = false, animating = false, drag = null, suppressClick = false;
let undo = [], redo = [], cleanup = null, storageWarning = false, pendingImport = null, staleCheck = false, sliderSnapshot = null, configSnapshot = null;

const challenge = () => DESIGN_CHALLENGES.find(c => c.id === workspace.selectedChallenge) || DESIGN_CHALLENGES[0];
function entry() {
  const c = challenge();
  if (!workspace.drafts[c.id]) workspace.drafts[c.id] = { graph: clone(c.starter), settings: sanitizeSettings(c.settings), notes: '', helpLevel: 'none', updatedAt: '' };
  return workspace.drafts[c.id];
}
function persist() {
  entry().updatedAt = new Date().toISOString();
  try { localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(workspace)); storageWarning = false; }
  catch { if (!storageWarning) notify('Browser storage is unavailable. Export your design before closing.'); storageWarning = true; }
}
function selectFromRoute() {
  const id = location.hash.split('/')[1];
  if (DESIGN_CHALLENGES.some(c => c.id === id)) workspace.selectedChallenge = id;
  if (!DESIGN_CHALLENGES.some(c => c.id === workspace.selectedChallenge)) workspace.selectedChallenge = DESIGN_CHALLENGES[0].id;
  entry();
}
function remember() { undo.push(clone({graph: entry().graph, settings: entry().settings})); if (undo.length > 40) undo.shift(); redo = []; }
function changed({ layoutOnly = false } = {}) {
  if (!layoutOnly) {
    if (check) staleCheck = true;
    check = null;
    if (simulation) simulation = simulateDesign(entry().graph, entry().settings);
  }
  persist();
}
function assist(level) {
  const ranks = {none:0, bug:1, hint:2, solution:3};
  if (ranks[level] > ranks[entry().helpLevel]) entry().helpLevel = level;
  persist();
  const checkRegion = root?.querySelector('#design-checks');
  if (checkRegion) checkRegion.innerHTML = checksView();
}
function statFor(id) { return simulation?.nodes?.find(n => n.id === id); }
function nodeName(id) { return entry().graph.nodes.find(n => n.id === id)?.label || id; }
function statusText(status) { return String(status || 'ready').replace(/-/g, ' '); }
function statusClass(status) {
  return ['failed','overloaded','blocked','error','saturated'].includes(status) ? 'danger' : ['warning','degraded','queued','bottleneck'].includes(status) ? 'warning' : ['healthy','active','complete'].includes(status) ? 'healthy' : 'idle';
}
function edgePath(edge) {
  const a = entry().graph.nodes.find(n => n.id === edge.from), b = entry().graph.nodes.find(n => n.id === edge.to);
  if (!a || !b) return '';
  if (b.x > a.x + 75) { const x1 = a.x + 144, y1 = a.y + 41, x2 = b.x, y2 = b.y + 41, bend = Math.max(35, (x2-x1)/2); return `M${x1},${y1} C${x1+bend},${y1} ${x2-bend},${y2} ${x2},${y2}`; }
  const x1 = a.x + 72, y1 = a.y + 82, x2 = b.x + 72, y2 = b.y;
  return `M${x1},${y1} C${x1},${y1+55} ${x2},${y2-55} ${x2},${y2}`;
}
function edgesView() {
  return `<defs><marker id="design-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7Z" fill="currentColor"/></marker></defs>${entry().graph.edges.map(e => {
    const flow = simulation?.edges?.find(x => x.id === e.id)?.rps || 0;
    return `<path class="design-edge ${flow>0?'has-flow':''}" d="${edgePath(e)}" marker-end="url(#design-arrow)" data-edge-id="${html(e.id)}"/>${animating&&flow>0?`<path class="design-flow" d="${edgePath(e)}"/>`:''}`;
  }).join('')}`;
}
function nodesView() {
  return entry().graph.nodes.map(n => {
    const stat = statFor(n.id), failed = entry().settings.failedNodeIds.includes(n.id), status = failed ? 'failed' : stat?.status || 'ready';
    const metric = failed ? 'Offline' : stat ? `${number(stat.incomingRps,1)} req/s` : NODE_TYPES[n.type]?.label || n.type;
    return `<button class="design-node node-${html(n.type)} ${selectedNode===n.id?'selected':''} ${statusClass(status)} ${connecting===n.id?'connecting':''}" data-design="node" data-node="${html(n.id)}" style="left:${n.x/10}%;top:${n.y/5.6}%;" aria-label="${html(n.label)}. ${html(statusText(status))}. ${html(metric)}. Select to configure; arrow keys move it." aria-pressed="${selectedNode===n.id}"><span class="design-node-top">${icon(n.type)}<span class="design-dot" aria-hidden="true"></span></span><strong>${html(n.label)}</strong><span class="design-node-metric">${html(metric)}</span></button>`;
  }).join('');
}
function canvasView() {
  return `<div class="design-canvas-top"><span><span class="design-status-dot ${simulation?.valid?'is-live':''}"></span>${simulation?'LIVE MODEL':'DESIGN CANVAS'}</span><span>${entry().graph.nodes.length} components · ${entry().graph.edges.length} connections</span></div><div class="design-board-viewport"><div class="design-board ${animating?'is-running':''}"><svg class="design-edges" viewBox="0 0 1000 560" aria-hidden="true">${edgesView()}</svg><div class="design-nodes">${nodesView()}</div>${!entry().graph.nodes.length?'<div class="design-empty-board">Add a client, an API service, and a database to start.</div>':''}</div></div><div class="design-canvas-footer"><span>${connecting?`Connecting from <strong>${html(nodeName(connecting))}</strong>. Select a destination, or press Escape.`:'Drag to arrange · Select to configure · Arrow keys move a focused component'}</span>${button('motion',animating?'Pause flow':'Animate flow','', 'text-btn')}</div>`;
}
function tableView() {
  return `<div class="design-table-wrap"><table class="design-data-table"><caption>Component state · all rates are model estimates</caption><thead><tr><th>Component</th><th>State</th><th>Incoming / s</th><th>Completed / s</th><th>Failed / s</th><th>Pending / s</th><th>Configure</th></tr></thead><tbody>${entry().graph.nodes.map(n => {const s=statFor(n.id);return `<tr><th scope="row">${html(n.label)}<small>${html(NODE_TYPES[n.type].label)}</small></th><td>${html(statusText(s?.status))}</td><td>${number(s?.incomingRps,1)}</td><td>${number(s?.completedRps,1)}</td><td>${number(s?.failedRps,1)}</td><td>${number(s?.queuedRps,1)}</td><td>${button('node','Edit',`data-node="${html(n.id)}" aria-label="Edit ${html(n.label)}"`,'text-btn')}</td></tr>`;}).join('')}</tbody></table></div><div class="design-connections-list"><h3>Directed connections</h3>${entry().graph.edges.length?entry().graph.edges.map(e=>`<div><span>${html(nodeName(e.from))} <span aria-hidden="true">→</span><span class="sr-only">to</span> ${html(nodeName(e.to))}</span><span>${simulation?`${number(simulation.edges?.find(s=>s.id===e.id)?.rps||0,1)} req/s`:''}</span>${button('remove-edge','Remove',`data-edge="${html(e.id)}"`,'text-btn')}</div>`).join(''):'<p>No connections. Select a component and choose its destination in the inspector.</p>'}</div>`;
}
function metricsView() {
  const s = simulation?.valid ? simulation.summary : null;
  const complete = s && s.offeredRps > 0 ? s.completedRps / s.offeredRps * 100 : 0;
  return `<div class="design-metric"><span>Incoming traffic</span><strong>${s?number(s.offeredRps):number(entry().settings.rps)}<small>req/s</small></strong><em>Offered to your design</em></div><div class="design-metric"><span>Completed</span><strong class="${s&&complete>=99?'design-good':''}">${s?number(complete,1):'Pending'}<small>${s?'%':''}</small></strong><em>${s?number(s.completedRps,1)+' req/s finished':'Run to inspect outcomes'}</em></div><div class="design-metric"><span>Rejected / failed</span><strong class="${s&&(s.failedRps>0||s.rejectedRps>0)?'design-warn':''}">${s?number(s.rejectedRps,1)+' / '+number(s.failedRps,1):'Pending'}<small>${s?'req/s':''}</small></strong><em>Admission limit / errors</em></div><div class="design-metric"><span>Waiting in queue</span><strong class="${s&&s.backlogMessages>0?'design-warn':''}">${s?number(s.backlogMessages):'Pending'}<small>${s?'jobs':''}</small></strong><em>After ${number(entry().settings.durationSeconds)} seconds</em></div>`;
}
const fields = [
  ['capacity','Capacity per replica','req/s',0,1000000,1], ['replicas','Replicas','',1,16,1], ['latency','Service time','ms',0,60000,1],
  ['hitRate','Read cache hit rate','%',0,100,1], ['rateLimit','Admission limit','req/s',0,1000000,1], ['bufferCapacity','Queue buffer','jobs',0,100000000,1],
];
function inspectorView() {
  const node = entry().graph.nodes.find(n=>n.id===selectedNode);
  if (!node) return `<div class="design-inspector-empty">${icon('connect')}<h3>Every component has a job.</h3><p>Select one to change its capacity, introduce a failure, or connect it to the next step.</p><div class="design-inspector-tip"><strong>Start with one request.</strong><p>Where does it enter? What reads or writes data? What happens if that dependency is unavailable?</p></div></div>`;
  const meta=NODE_TYPES[node.type], stat=statFor(node.id), targets=entry().graph.nodes.filter(n=>n.id!==node.id);
  const defaults=meta.defaults||{}, configuration={...defaults,...node.config};
  return `<div class="design-inspector-head"><span class="design-type-icon node-${html(node.type)}">${icon(node.type)}</span><div><span class="eyebrow">COMPONENT</span><h3>${html(meta.label)}</h3></div>${button('deselect','×','aria-label="Close component inspector"','text-btn design-inspector-close')}</div><p class="design-description">${html(meta.description)}</p><label class="design-field">Name<input id="design-node-name" data-node-label="${html(node.id)}" value="${html(node.label)}" maxlength="40"></label>${fields.filter(([key])=>node.type!=='client'&&Object.hasOwn(defaults,key)).map(([key,label,unit,min,max,step])=>`<label class="design-field">${label}<span class="design-input-unit"><input type="number" id="design-config-${key}" data-node-config="${key}" min="${min}" max="${max}" step="${step}" value="${configuration[key]}" inputmode="decimal"><span>${unit}</span></span></label>`).join('')}${node.type!=='client'?`<label class="design-failure-switch"><span><strong>Simulate failure</strong><small>Take this component offline</small></span><input type="checkbox" id="design-node-failed" ${entry().settings.failedNodeIds.includes(node.id)?'checked':''}></label>`:''}${stat?`<div class="design-node-observation"><span class="design-dot ${statusClass(stat.status)}"></span><strong>${html(statusText(stat.status))}</strong><p>${number(stat.incomingRps,1)} req/s in · ${number(stat.outgoingRps,1)} req/s out</p>${Number.isFinite(stat.utilization)?`<p>Capacity used: ${number(stat.utilization*100,1)}%</p>`:''}</div>`:''}<div class="design-inspector-connect"><label for="design-connect-target">Connect to</label><div><select id="design-connect-target"><option value="">Choose destination</option>${targets.map(n=>`<option value="${html(n.id)}">${html(n.label)}</option>`).join('')}</select>${button('connect-selected',icon('plus'),'aria-label="Add connection"')}</div></div><div class="design-inspector-links">${entry().graph.edges.filter(e=>e.from===node.id).map(e=>`<div><span>→ ${html(nodeName(e.to))}</span>${button('remove-edge','×',`data-edge="${html(e.id)}" aria-label="Remove connection to ${html(nodeName(e.to))}"`,'text-btn')}</div>`).join('')}</div>${button('delete-node','Remove component',`data-node="${html(node.id)}"`,'text-btn danger')}`;
}
function feedbackView() {
  if (!simulation) return '<div class="design-feedback-idle"><strong>Your design, under pressure.</strong><span>Run a simulation, then increase traffic or take a component offline.</span></div>';
  if (!simulation.valid) return `<div class="design-feedback-errors" role="status"><strong>The graph needs a repair before it can run.</strong><ul>${(simulation.errors||[]).map(e=>`<li>${html(typeof e==='string'?e:e.message||JSON.stringify(e))}</li>`).join('')}</ul></div>`;
  const s=simulation.summary;
  return `<div class="design-run-summary"><span class="design-run-label">MODEL OBSERVATIONS</span><p>${number(s.completedRps,1)} of ${number(s.offeredRps,1)} requests per second completed. ${s.failedRps>0?`${number(s.failedRps,1)} failed before completion. `:''}${s.rejectedRps>0?`${number(s.rejectedRps,1)} were intentionally rejected. `:''}${s.backlogMessages>0?`${number(s.backlogMessages)} jobs remain pending at the end of this ${entry().settings.durationSeconds}-second window. `:''}</p>${s.acceptedAsyncRps>0?`<p>${number(s.acceptedAsyncRps,1)} jobs/s accepted into the asynchronous path; ${number(s.processedAsyncRps,1)} jobs/s completed. Acceptance is not completion.</p>`:''}<span class="design-latency">${s.estimatedMeanLatencyMs!=null?`${number(s.estimatedMeanLatencyMs,1)} ms modeled service time on completed paths`:'No completed path to estimate service time'} · excludes waiting and network variability</span>${simulation.warnings?.length?`<ul class="design-warning-list">${simulation.warnings.map(w=>`<li>${html(typeof w==='string'?w:w.message||JSON.stringify(w))}</li>`).join('')}</ul>`:''}</div>`;
}
function checksView() {
  if (!check) return `<div class="design-checks-empty"><p>${staleCheck?'Your design changed. Run the challenge checks again to assess this version.':'Check your design against the baseline and changed conditions. Custom traffic controls are for experiments; checks use the published fixtures.'}</p></div>`;
  const checks=check.checks||[], passed=checks.filter(x=>x.passed).length;
  const observed=value=>Array.isArray(value)?value.map(v=>number(v,2)).join(', '):typeof value==='number'?number(value,2):String(value);
  const expected=value=>typeof value==='object'&&value!==null?value.min===value.max?String(value.min):[value.min!=null?'at least '+value.min:'',value.max!=null?'at most '+value.max:''].filter(Boolean).join(', '):String(value);
  return `<div class="design-check-summary ${check.passed?'passed':'needs-work'}" role="status"><strong>${check.passed?'All modeled checks pass':'Keep iterating'}</strong><span>${passed} / ${checks.length} checks passed</span></div><div class="design-check-list">${check.fixtures.map(f=>`<details class="design-check-fixture" ${!f.passed?'open':''}><summary><span class="${f.passed?'design-good':'design-warn'}">${f.passed?'✓':'×'}</span> ${html(f.label)} <small>${f.checks.filter(c=>c.passed).length}/${f.checks.length}</small></summary>${f.checks.map(c=>`<div class="design-check-item"><span class="${c.passed?'design-good':'design-warn'}" aria-label="${c.passed?'Pass':'Fail'}">${c.passed?'✓':'×'}</span><div><strong>${html(c.label||'Requirement')}</strong>${c.actual!=null?`<small>Observed: ${html(observed(c.actual))}${c.expected!=null?` · Expected: ${html(expected(c.expected))}`:''}</small>`:''}</div></div>`).join('')}</details>`).join('')}</div><p class="design-small">Checks cover the model requirements. Your explanation is self-assessed. ${entry().helpLevel==='none'?'No in-app help is recorded for this draft.':`This draft records ${html(entry().helpLevel)} assistance.`}</p>`;
}
function helpView() {
  const c=challenge();
  return `<div class="design-learning-head"><div><span class="eyebrow">UNDERSTAND THE TRADE-OFF</span><h2>Make a decision. Explain the cost.</h2></div><div class="design-help-actions">${button('hint','Get a hint')}${button('load-bug','Debug a broken design','','text-btn')}${button('show-solution',showSolution?'Hide walkthrough':'Study a solution','','text-btn')}</div></div>${hintCount?`<div class="design-hints">${(c.hints||[]).slice(0,hintCount).map((h,i)=>`<p><strong>Hint ${i+1}</strong> ${html(h)}</p>`).join('')}</div>`:''}${showSolution?`<section class="design-walkthrough"><h3>One defensible design</h3>${copy(c.explanation)}<h4>What you give up</h4>${copy(c.tradeoffs)}${c.complexity?`<p>${html(c.complexity)}</p>`:''}${button('load-solution','Load the worked design','','ghost')}<p class="design-small">Loading or studying the example is recorded as assistance. The previous diagram remains available with Undo.</p></section>`:''}<label class="design-explanation-label" for="design-notes">Your reasoning</label><textarea id="design-notes" maxlength="6000" placeholder="I chose this design because…\nThe bottleneck is…\nIf this component fails…\nThe cost of this decision is…">${html(entry().notes)}</textarea><div class="design-notes-footer"><span>Saved in this browser · Explanation is self-assessed</span><a href="#architecture">Practice the interview explanation ${icon('arrow')}</a></div><details class="design-assumptions"><summary>How the model works & further reading</summary><p>A deterministic flow model, not a real load test. It estimates rates over one fixed window from your connections and declared capacities. It cannot establish real latency, availability, cost, or production readiness.</p>${copy(simulation?.assumptions||['One client, directed acyclic paths, and at most one queue. Only load balancers split traffic. A database is a terminal destination. Cache hits apply to reads; writes must continue to the data store.'])}<div class="design-sources">${(c.sources||[]).map(s=>/^https:\/\//.test(s.url)?`<a href="${html(s.url)}" target="_blank" rel="noopener noreferrer">${html(s.title)} ↗</a>`:'').join('')}</div></details>`;
}
function historyView() {
  const attempts=workspace.attempts.filter(a=>a.challengeId===challenge().id).slice(-5).reverse();
  return attempts.length?`<details class="design-history"><summary>Recent attempts <span>${attempts.length}</span></summary>${attempts.map(a=>`<div><span>${html(new Date(a.at).toLocaleString())}</span><strong>${a.passed?'Checks passed':`${a.passedChecks}/${a.totalChecks} checks`}</strong><span>${a.helpLevel==='none'?'No in-app help':html(a.helpLevel)+' used'}</span></div>`).join('')}</details>`:'';
}
function pageView() {
  const c=challenge(), current=DESIGN_CHALLENGES.indexOf(c), complete=new Set(workspace.attempts.filter(a=>a.passed).map(a=>a.challengeId));
  return `<header class="design-page-heading"><div><div class="eyebrow">THE SYSTEMS WORKBENCH</div><h1>Build it. Then break it.</h1><p>Connect a system, put it under load, and understand every trade-off.</p></div><span class="design-alpha-label"><span></span>Interactive model · alpha</span></header>
  ${storageWarning?'<div class="notice danger" role="alert">Progress cannot be saved. Export a backup before closing.</div>':''}
  <section class="design-challenge-bar"><div class="design-challenge-index">${String(current+1).padStart(2,'0')}<span>/ ${String(DESIGN_CHALLENGES.length).padStart(2,'0')}</span></div><div class="design-challenge-choice"><label for="design-challenge">CHALLENGE</label><select id="design-challenge">${DESIGN_CHALLENGES.map(x=>`<option value="${html(x.id)}" ${x.id===c.id?'selected':''}>${html(x.title)}${complete.has(x.id)?' · practiced':''}</option>`).join('')}</select></div><div class="design-challenge-meta"><span>${html(c.level)}</span><span>${c.minutes} min</span></div><div class="design-primary-actions">${button('check','Check design','','ghost')}${button('run',`${icon('play')} Run simulation`,'','primary')}</div></section>
  <div class="design-brief"><p>${html(c.prompt)}</p><details><summary>Goal, constraints & test conditions</summary>${copy(c.contract)}<ul>${(c.fixtures||[]).map(f=>`<li><strong>${html(f.label)}</strong>${f.settings?` · ${f.settings.rps!=null?number(f.settings.rps)+' req/s':''}${f.settings.readPercent!=null?' · '+f.settings.readPercent+'% reads':''}${f.settings.failedNodeIds?.length?' · Offline: '+f.settings.failedNodeIds.map(html).join(', '):''}`:''}</li>`).join('')}</ul></details></div>
  <section class="design-workspace"><div class="design-controls"><div class="design-view-tabs" role="group" aria-label="Diagram view">${button('view-canvas','Canvas',`aria-pressed="${tab==='canvas'}"`,tab==='canvas'?'selected':'')}${button('view-table','Connections & data',`aria-pressed="${tab==='table'}"`,tab==='table'?'selected':'')}</div><div class="design-toolbar-tools">${button('undo',icon('undo'),`aria-label="Undo diagram edit" ${!undo.length?'disabled':''}`)}${button('redo',icon('undo'),`aria-label="Redo diagram edit" ${!redo.length?'disabled':''}`,'ghost design-redo')}${button('connect',`${icon('connect')} Connect`,`${!selectedNode?'disabled':''} aria-pressed="${Boolean(connecting)}"`)}${button('reset','Reset starter','','text-btn')}</div></div>
  <div class="design-palette" aria-label="Add components"><span>ADD</span>${Object.entries(NODE_TYPES).map(([type,meta])=>button('add',`${icon(type)}<span>${html(meta.label)}</span>`,`data-type="${html(type)}" title="Add ${html(meta.label)}"`,'design-palette-item')).join('')}</div>
  <div class="design-stage"><div class="design-stage-main" id="design-stage-main">${tab==='canvas'?canvasView():tableView()}</div><aside class="design-inspector" id="design-inspector" aria-label="Component inspector">${inspectorView()}</aside></div>
  <div class="design-load-controls"><label for="design-rps"><span>Traffic <strong id="design-rps-value">${number(entry().settings.rps)} req/s</strong></span><input id="design-rps" type="range" min="0" max="${Math.max(5000,Math.ceil(entry().settings.rps/1000)*1000)}" step="10" value="${entry().settings.rps}"></label><label for="design-read"><span>Read requests <strong id="design-read-value">${entry().settings.readPercent}%</strong></span><input id="design-read" type="range" min="0" max="100" value="${entry().settings.readPercent}"></label><label class="design-window-label" for="design-duration">Simulation window<select id="design-duration">${[...new Set([10,30,60,120,300,entry().settings.durationSeconds])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${entry().settings.durationSeconds===n?'selected':''}>${n} seconds</option>`).join('')}</select></label>${button('restore-load','Restore challenge load','','text-btn')}</div>
  <div class="design-metrics" id="design-metrics">${metricsView()}</div><div class="design-feedback" id="design-feedback" aria-live="polite">${feedbackView()}</div></section>
  <div class="design-bottom-grid"><section class="design-learning" id="design-learning">${helpView()}</section><section class="design-checks-panel"><div class="design-checks-title"><span class="eyebrow">TEST THE DESIGN</span><h2>Requirements & evidence</h2><p>Can the same design survive a changed assumption?</p></div><div id="design-checks">${checksView()}</div>${button('check','Run challenge checks','','primary')}<div id="design-history">${historyView()}</div></section></div>
  <footer class="design-backup"><div><strong>Your diagrams stay yours.</strong><p>Saved locally with the latest 100 checked attempts. Export to move devices.</p></div><div>${button('export','Export designs')}${button('import','Import backup','','text-btn')}<input type="file" id="design-import" class="sr-only" accept="application/json,.json" aria-label="Import system design backup"></div></footer>
  ${pendingImport?`<section class="design-import-confirm" role="region" aria-label="Review backup import"><strong>Replace this system design workspace?</strong><p>The file contains ${Object.keys(pendingImport.drafts).length} diagrams and ${pendingImport.attempts.length} attempts. Daily SQL/Python progress is separate.</p>${button('confirm-import','Replace with this backup','','primary')}${button('cancel-import','Cancel')}</section>`:''}`;
}

export function designView() { selectFromRoute(); return `<div class="design-lab" data-design-root>${pageView()}</div>`; }
function redraw(focusId) {
  const el=root?.querySelector('[data-design-root]'); if (!el) return;
  el.innerHTML=pageView(); if(focusId) document.getElementById(focusId)?.focus({preventScroll:true});
}
function paint({ inspector = false } = {}) {
  const focusedNode = document.activeElement?.matches?.('.design-node') ? document.activeElement.dataset.node : null;
  const focusedId = document.activeElement?.id;
  const replace=(id,value)=>{const el=root?.querySelector('#'+id);if(el)el.innerHTML=value;};
  replace('design-stage-main',tab==='canvas'?canvasView():tableView());
  replace('design-metrics',metricsView()); replace('design-feedback',feedbackView()); replace('design-checks',checksView());
  if(inspector) replace('design-inspector',inspectorView());
  else {
    const observation=root?.querySelector('.design-node-observation'), stat=statFor(selectedNode);
    if(observation&&stat)observation.innerHTML=`<span class="design-dot ${statusClass(stat.status)}"></span><strong>${html(statusText(stat.status))}</strong><p>${number(stat.incomingRps,1)} req/s in · ${number(stat.outgoingRps,1)} req/s out</p><p>Capacity used: ${number(stat.utilization*100,1)}%</p>`;
  }
  root?.querySelector('[data-design="undo"]')?.toggleAttribute('disabled',!undo.length);
  root?.querySelector('[data-design="redo"]')?.toggleAttribute('disabled',!redo.length);
  root?.querySelector('[data-design="connect"]')?.toggleAttribute('disabled',!selectedNode);
  root?.querySelector('[data-design="connect"]')?.setAttribute('aria-pressed',String(Boolean(connecting)));
  if (focusedNode) root?.querySelector(`.design-node[data-node="${focusedNode}"]`)?.focus({preventScroll:true});
  else if(inspector&&focusedId)root?.querySelector('#'+focusedId)?.focus({preventScroll:true});
}
function linkNodes(from,to) {
  if(!from||!to||from===to) return notify('Choose two different components.');
  if(entry().graph.edges.some(e=>e.from===from&&e.to===to)) return notify('That connection already exists.');
  if(entry().graph.edges.length>=60) return notify('This teaching canvas supports up to 60 connections.');
  remember(); entry().graph.edges.push({id:`edge-${Date.now().toString(36)}-${entry().graph.edges.length}`,from,to});connecting=null;changed();paint({inspector:true});
}
function replaceGraph(graph,settings) {
  remember(); entry().graph=clone(graph); entry().settings=sanitizeSettings(settings); selectedNode=null; connecting=null; changed(); redraw();
}
function addComponent(type) {
  if(!Object.hasOwn(NODE_TYPES,type))return;
  if(entry().graph.nodes.length>=24)return notify('Keep the model within 24 components.');
  remember();let count=entry().graph.nodes.filter(n=>n.type===type).length+1,id=`${type}-${count}`;
  while(entry().graph.nodes.some(n=>n.id===id))id=`${type}-${++count}`;
  const slots=entry().graph.nodes.length;
  const missing=challenge().starter.nodes.find(n=>n.type===type&&!entry().graph.nodes.some(existing=>existing.id===n.id));
  const node=missing?clone(missing):{id,type,label:`${NODE_TYPES[type].label}${count>1?' '+count:''}`,x:40+(slots%4)*220,y:50+Math.floor(slots/4)%3*160,config:{...NODE_TYPES[type].defaults}};
  entry().graph.nodes.push(node);selectedNode=node.id;changed();paint({inspector:true});notify(`${node.label} added. Connect it to the request path.`);
}
function runCheck() {
  staleCheck=false;
  check=checkDesignChallenge(entry().graph,challenge());
  simulation=simulateDesign(entry().graph,entry().settings);
  workspace.attempts.push({challengeId:challenge().id,at:new Date().toISOString(),passed:check.passed,contentRevision:CONTENT_REVISION,runtimeVersion:RUNTIME_VERSIONS.design,
    passedChecks:check.checks.filter(c=>c.passed).length,totalChecks:check.checks.length,helpLevel:entry().helpLevel,
    graph:clone(entry().graph),settings:clone(entry().settings),notes:entry().notes});
  workspace.attempts=workspace.attempts.slice(-100);persist();paint({inspector:true});
  const history=root.querySelector('#design-history');if(history)history.innerHTML=historyView();
  notify(check.passed?'Challenge model checks pass. Now explain the trade-offs.':'The checks found something to improve. See Requirements & evidence.');
}
function download() {
  const blob=new Blob([JSON.stringify(designBackup(workspace),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`tracecraft-system-design-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notify('System design backup downloaded. It contains your diagrams and notes.');
}
function onClick(event) {
  const target=event.target.closest('[data-design]');if(!target||!root.contains(target))return;
  const action=target.dataset.design;
  if(suppressClick&&action==='node'){suppressClick=false;return;}
  if(action==='node'){const id=target.dataset.node;if(connecting&&connecting!==id){linkNodes(connecting,id);return;}selectedNode=id;paint({inspector:true});return;}
  if(action==='deselect'){selectedNode=null;connecting=null;paint({inspector:true});return;}
  if(action==='run'){simulation=simulateDesign(entry().graph,entry().settings);paint({inspector:true});notify(simulation.valid?'Simulation updated. Change the load or fail a component to explore.':'Repair the graph errors shown below the canvas.');return;}
  if(action==='check'){runCheck();return;}
  if(action==='add'){addComponent(target.dataset.type);return;}
  if(action==='connect'){connecting=connecting?null:selectedNode;paint();return;}
  if(action==='connect-selected'){linkNodes(selectedNode,root.querySelector('#design-connect-target')?.value);return;}
  if(action==='remove-edge'){remember();entry().graph.edges=entry().graph.edges.filter(e=>e.id!==target.dataset.edge);changed();paint({inspector:true});return;}
  if(action==='delete-node'){const id=target.dataset.node;remember();entry().graph.nodes=entry().graph.nodes.filter(n=>n.id!==id);entry().graph.edges=entry().graph.edges.filter(e=>e.from!==id&&e.to!==id);entry().settings.failedNodeIds=entry().settings.failedNodeIds.filter(n=>n!==id);selectedNode=null;connecting=null;changed();paint({inspector:true});return;}
  if(action==='view-canvas'||action==='view-table'){tab=action==='view-canvas'?'canvas':'table';redraw();return;}
  if(action==='motion'){animating=!animating;paint();return;}
  if(action==='undo'||action==='redo'){
    const from=action==='undo'?undo:redo,to=action==='undo'?redo:undo;if(!from.length)return;
    to.push(clone({graph:entry().graph,settings:entry().settings}));const previous=from.pop();entry().graph=previous.graph;entry().settings=previous.settings;
    if(!entry().graph.nodes.some(n=>n.id===selectedNode))selectedNode=null;connecting=null;changed();redraw();return;
  }
  if(action==='reset'){replaceGraph(challenge().starter,challenge().settings);notify('Starter restored. Undo brings back your previous diagram.');return;}
  if(action==='restore-load'){remember();entry().settings=sanitizeSettings(challenge().settings);changed();redraw();return;}
  if(action==='hint'){assist('hint');hintCount=Math.min(hintCount+1,challenge().hints.length);root.querySelector('#design-learning').innerHTML=helpView();return;}
  if(action==='show-solution'){if(!showSolution)assist('solution');showSolution=!showSolution;root.querySelector('#design-learning').innerHTML=helpView();return;}
  if(action==='load-solution'){assist('solution');replaceGraph(challenge().solution,challenge().settings);notify('Worked design loaded. Run the checks, then change a requirement.');return;}
  if(action==='load-bug'){assist('bug');replaceGraph(challenge().bug,challenge().settings);return;}
  if(action==='export'){download();return;}
  if(action==='import'){root.querySelector('#design-import').click();return;}
  if(action==='cancel-import'){pendingImport=null;redraw();return;}
  if(action==='confirm-import'&&pendingImport){workspace=pendingImport;pendingImport=null;selectedNode=null;simulation=null;check=null;undo=[];redo=[];entry();persist();location.hash=`#design/${workspace.selectedChallenge||challenge().id}`;redraw();notify('System design workspace restored from the backup.');}
}
function onInput(event) {
  const el=event.target;
  if(el.dataset.nodeConfig){
    const node=entry().graph.nodes.find(n=>n.id===selectedNode),value=Number(el.value);
    if(!node||el.value===''||!Number.isFinite(value)||value<Number(el.min)||value>Number(el.max)||(el.dataset.nodeConfig==='replicas'&&!Number.isInteger(value)))return;
    if(configSnapshot!==el.id){remember();configSnapshot=el.id;}
    node.config[el.dataset.nodeConfig]=value;changed();paint();return;
  }
  if(el.id==='design-notes'){entry().notes=el.value.slice(0,6000);persist();return;}
  if(el.dataset.nodeLabel){const node=entry().graph.nodes.find(n=>n.id===el.dataset.nodeLabel);if(node){node.label=el.value.slice(0,40);changed({layoutOnly:true});paint();}return;}
  if(el.id==='design-rps'||el.id==='design-read'){
    if (!sliderSnapshot) { remember(); sliderSnapshot=el.id; }
    const key=el.id==='design-rps'?'rps':'readPercent';entry().settings[key]=Number(el.value);changed();
    root.querySelector('#'+el.id+'-value').textContent=key==='rps'?`${number(entry().settings.rps)} req/s`:`${entry().settings.readPercent}%`;paint();return;
  }
}
async function onChange(event) {
  const el=event.target;
  if(el.id==='design-rps'||el.id==='design-read'){sliderSnapshot=null;return;}
  if(el.id==='design-challenge'){workspace.selectedChallenge=el.value;persist();location.hash=`#design/${el.value}`;return;}
  if(el.dataset.nodeConfig){const n=entry().graph.nodes.find(n=>n.id===selectedNode);if(!n)return;const value=Number(el.value);configSnapshot=null;if(el.value===''||!Number.isFinite(value)||value<Number(el.min)||value>Number(el.max)||(el.dataset.nodeConfig==='replicas'&&!Number.isInteger(value))){notify(`Use ${el.dataset.nodeConfig==='replicas'?'a whole number':'a value'} between ${el.min} and ${el.max}.`);el.value=n.config[el.dataset.nodeConfig]??NODE_TYPES[n.type].defaults[el.dataset.nodeConfig];return;}if(n.config[el.dataset.nodeConfig]!==value){remember();n.config[el.dataset.nodeConfig]=value;changed();paint();}return;}
  if(el.id==='design-node-failed'){remember();const ids=new Set(entry().settings.failedNodeIds);el.checked?ids.add(selectedNode):ids.delete(selectedNode);entry().settings.failedNodeIds=[...ids];changed();paint({inspector:true});return;}
  if(el.id==='design-duration'){remember();entry().settings.durationSeconds=Number(el.value);changed();paint();return;}
  if(el.id==='design-import'){
    const file=el.files?.[0];if(!file)return;
    if(file.size>2_000_000){notify('Choose a JSON backup smaller than 2 MB.');return;}
    try{pendingImport=parseDesignBackup(await file.text(),DESIGN_CHALLENGES.map(c=>c.id));redraw();root.querySelector('.design-import-confirm')?.scrollIntoView({block:'center'});}
    catch(error){notify(error.message);}
  }
}
function onKey(event) {
  if(event.key==='Escape'){if(connecting){connecting=null;paint();}else{selectedNode=null;paint({inspector:true});}return;}
  if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();simulation=simulateDesign(entry().graph,entry().settings);paint({inspector:true});return;}
  const el=event.target.closest('[data-design="node"]');if(!el)return;
  const node=entry().graph.nodes.find(n=>n.id===el.dataset.node);if(!node)return;
  const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!direction)return;
  event.preventDefault();remember();const step=event.shiftKey?30:10;node.x=Math.max(16,Math.min(840,node.x+direction[0]*step));node.y=Math.max(16,Math.min(460,node.y+direction[1]*step));changed({layoutOnly:true});paint();root.querySelector(`[data-node="${node.id}"]`)?.focus({preventScroll:true});
}
function onPointerDown(event) {
  if(event.button!==0||connecting)return;
  const el=event.target.closest('.design-node');if(!el)return;
  const node=entry().graph.nodes.find(n=>n.id===el.dataset.node),board=root.querySelector('.design-board');if(!node||!board)return;
  drag={id:node.id,startX:event.clientX,startY:event.clientY,x:node.x,y:node.y,rect:board.getBoundingClientRect(),moved:false,before:clone({graph:entry().graph,settings:entry().settings}),el};
  el.setPointerCapture(event.pointerId);
}
function onPointerMove(event) {
  if(!drag)return;const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;drag.moved=true;
  const n=entry().graph.nodes.find(n=>n.id===drag.id);if(!n)return;
  n.x=Math.max(16,Math.min(840,drag.x+dx*1000/drag.rect.width));n.y=Math.max(16,Math.min(460,drag.y+dy*560/drag.rect.height));
  drag.el.style.left=`${n.x/10}%`;drag.el.style.top=`${n.y/5.6}%`;
  root.querySelector('.design-edges').innerHTML=edgesView();
}
function onPointerUp() {
  if(!drag)return;const moved=drag.moved,id=drag.id;
  if(moved){undo.push(drag.before);if(undo.length>40)undo.shift();redo=[];selectedNode=id;suppressClick=true;setTimeout(()=>{suppressClick=false;},0);changed({layoutOnly:true});}
  drag=null;if(moved)paint({inspector:true});
}
export function mountDesign(element,onNotify) {
  root=element;notify=onNotify;selectFromRoute();
  const handlers={click:onClick,input:onInput,change:onChange,focusout:()=>{configSnapshot=null;sliderSnapshot=null;},keydown:onKey,pointerdown:onPointerDown,pointermove:onPointerMove,pointerup:onPointerUp,pointercancel:onPointerUp};
  for(const [event,handler]of Object.entries(handlers))root.addEventListener(event,handler);
  cleanup=()=>{for(const [event,handler]of Object.entries(handlers))element.removeEventListener(event,handler);};
  persist();
}
export function unmountDesign() { cleanup?.();cleanup=null;root=null;selectedNode=null;connecting=null;simulation=null;check=null;hintCount=0;showSolution=false;drag=null;undo=[];redo=[];pendingImport=null;suppressClick=false;animating=false;staleCheck=false;sliderSnapshot=null;configSnapshot=null; }
export function designSearchItems() { return DESIGN_CHALLENGES.map(c=>({title:c.title,detail:`System design · ${c.level} · ${c.prompt}`,hash:`#design/${c.id}`})); }
