import test from 'node:test';
import assert from 'node:assert/strict';
import {PRACTICAL_SCENARIOS,PRACTICAL_SCENARIO_BY_ID,evaluateScenario,SCENARIO_VERSION} from '../src/practical-scenarios.mjs';

// Handwritten from each semantic contract, independently of option flags and fixtures.
const acceptedAnswers = {
  'flow-signup':['validate-persist','trace-failure'],
  'flow-validation-conflict':['constraint-conflict','separate-errors'],
  'flow-ownership':['scope-query','test-isolation'],
  'flow-update-transaction':['rollback','verify-boundary'],
  'auth-logout':['still-valid','state-design'],
  'auth-instance':['shared-state','compare-path'],
  'auth-refresh':['atomic-rotate','test-reuse'],
  'auth-oauth':['roles','redirect-checks'],
  'auth-cookie-boundary':['separate-defenses','context'],
  'incident-latency':['span-breakdown','pool-hold'],
  'incident-tail':['segment','query-count'],
  'incident-dependency':['budget','measure'],
  'incident-auth-instance':['compare-key-config','correlate'],
  'incident-retry':['operation-boundary','race-test'],
  'incident-query-growth':['plan-experiment','check-cost'],
  'incident-pool':['hold-scope','db-limits'],
  'incident-cache-outage':['bound-fallback','coalesce'],
  'incident-stale-cache':['key-path','race-test'],
  'incident-route-deploy':['compare-config','route-check'],
  'project-workflow':['grounded','clarify'],
  'project-decision':['grounded','clarify'],
  'project-bug':['grounded','clarify'],
  'project-tradeoff':['grounded','clarify'],
  'project-verification':['grounded','clarify'],
  'project-next':['grounded','clarify'],
  'behavior-responsibility':['grounded','clarify'],
  'interview-recover':['grounded','clarify'],
  'java-placement':['key-contract','test-contract'],
  'testing-placement':['integration','regression'],
  'git-state':['local-only','verify-each'],
  'frontend-placement':['latest-request','states'],
  'deployment-placement':['compatibility','feature-check'],
  'mobile-placement':['stable-replay','state-test'],
  'ai-placement':['authorize-tool','evaluate-cases'],
  'patch-review-placement':['boundary-case','scope-review'],
};

test('the reviewed scenario pack has backend/auth coverage, all ten incident categories, eight explanation prompts and placement areas',()=>{
  assert.equal(PRACTICAL_SCENARIOS.filter(value=>['backend','authentication'].includes(value.track)).length,9);
  assert.equal(PRACTICAL_SCENARIOS.filter(value=>value.track==='debugging').length,10);
  assert.equal(PRACTICAL_SCENARIOS.filter(value=>value.track==='explanation').length,8);
  assert.equal(PRACTICAL_SCENARIOS.filter(value=>value.assessmentArea).length,8);
  assert.equal(PRACTICAL_SCENARIO_BY_ID.size,PRACTICAL_SCENARIOS.length);
  for(const id of ['flow-signup','flow-ownership','auth-logout','auth-instance','incident-latency','git-state','java-placement'])assert.ok(PRACTICAL_SCENARIO_BY_ID.has(id),id);
});

for(const scenario of PRACTICAL_SCENARIOS){
  test(`${scenario.id}: exact authored options, help, fixtures, rubric and changed context remain consistent`,()=>{
    assert.match(scenario.id,/^[a-z0-9-]+$/);assert.equal(scenario.version,SCENARIO_VERSION);
    for(const key of ['title','lesson','prompt','contract','solution','bug','complexity','followUp','gradingMethod'])assert.ok(typeof scenario[key]==='string'&&scenario[key].length>20,`${scenario.id}: ${key}`);
    assert.notEqual(scenario.solution,scenario.bug);
    assert.ok(scenario.skills.length);assert.ok(scenario.observations.length>=2);
    assert.equal(new Set(scenario.observations.map(value=>value.id)).size,scenario.observations.length);
    assert.equal(scenario.hints.length,5);assert.equal(scenario.hints[4],scenario.solution);
    assert.ok(!scenario.hints.slice(0,4).includes(scenario.solution));
    assert.ok(scenario.options.some(value=>value.correct));assert.ok(scenario.options.some(value=>!value.correct));
    assert.equal(new Set(scenario.options.map(value=>value.id)).size,scenario.options.length);
    assert.ok(scenario.options.every(value=>value.feedback.length>50));
    const expected=new Set(acceptedAnswers[scenario.id]);
    assert.equal(expected.size,2,`${scenario.id}: independently reviewed answer key`);
    for(const candidate of scenario.options){
      assert.equal(candidate.correct,expected.has(candidate.id),`${scenario.id}: ${candidate.id} metadata`);
      assert.equal(evaluateScenario(scenario,candidate.id).correct,expected.has(candidate.id),`${scenario.id}: ${candidate.id} evaluator`);
    }
    for(const answer of expected)assert.ok(scenario.options.some(value=>value.id===answer),`${scenario.id}: expected option ${answer} exists`);
    for(const fixture of scenario.fixtures){
      assert.equal(fixture.expectedCorrect,expected.has(fixture.answerId),`${scenario.id}: independent fixture expectation ${fixture.label}`);
      assert.equal(evaluateScenario(scenario,fixture.answerId).correct,expected.has(fixture.answerId),fixture.label);
    }
    assert.ok(scenario.rubric.technical.length>=3);assert.ok(scenario.rubric.clarity.length>=3);
    assert.ok(scenario.sources.every(value=>/^https:\/\//.test(value.url)));
    if(scenario.variationId!==null){
      const variation=PRACTICAL_SCENARIO_BY_ID.get(scenario.variationId);
      assert.ok(variation);assert.notEqual(scenario.variationId,scenario.id);
      assert.ok(variation.skills.some(skill=>scenario.skills.includes(skill)),`${scenario.id}: variation practices a shared skill`);
    }
    assert.match(scenario.gradingMethod,/self-review/);
    assert.doesNotMatch(JSON.stringify(scenario),/[\u2013\u2014]/);
    assert.doesNotMatch(JSON.stringify(scenario),/Belal|NJIT|FitTrack/i);
  });
}

test('unknown choices, wrong types and unknown scenarios fail closed without grading private text',()=>{
  for(const answer of [undefined,null,1,{},[],false,'constructor','__proto__','a free-form explanation']){
    const result=evaluateScenario('flow-ownership',answer);assert.equal(result.correct,false);assert.equal(result.writtenAssessment,'Not automatically graded');
  }
  assert.equal(evaluateScenario('missing','scope-query').correct,false);
  assert.equal(evaluateScenario(null,'scope-query').correct,false);
});

test('the independent answer key covers exactly the authored scenarios',()=>{
  assert.deepEqual(Object.keys(acceptedAnswers).sort(),PRACTICAL_SCENARIOS.map(value=>value.id).sort());
});

test('stable answer positions prevent passing every scenario by selecting one fixed position',()=>{
  const rejectedPositions=new Set();
  for(const scenario of PRACTICAL_SCENARIOS){
    for(let index=0;index<scenario.options.length;index++){
      if(!acceptedAnswers[scenario.id].includes(scenario.options[index].id))rejectedPositions.add(index);
    }
  }
  assert.deepEqual([...rejectedPositions].sort(),[0,1,2]);
  for(let position=0;position<3;position++){
    const results=PRACTICAL_SCENARIOS.map(scenario=>evaluateScenario(scenario,scenario.options[position].id).correct);
    assert.ok(results.includes(false),`fixed answer position ${position} must sometimes fail`);
    assert.ok(results.includes(true),`fixed answer position ${position} must sometimes be defensible`);
  }
});

test('object inputs resolve only authored options and cannot inject a passing answer or feedback',()=>{
  for(const scenario of PRACTICAL_SCENARIOS){
    const rejected=scenario.options.find(value=>!acceptedAnswers[scenario.id].includes(value.id));
    const injected={id:scenario.id,options:[{id:rejected.id,correct:true,feedback:'Fabricated success'},{id:'fabricated',correct:true,feedback:'Fabricated success'}]};
    assert.deepEqual(evaluateScenario(injected,rejected.id),evaluateScenario(scenario.id,rejected.id));
    assert.equal(evaluateScenario(injected,'fabricated').correct,false);
    const accepted=acceptedAnswers[scenario.id][0];
    assert.deepEqual(evaluateScenario({id:scenario.id},accepted),evaluateScenario(scenario.id,accepted));
  }
  assert.equal(evaluateScenario({id:'invented',options:[{id:'fabricated',correct:true}]},'fabricated').correct,false);
});

test('project explanations identify absent boundaries instead of inventing them',()=>{
  const workflow=PRACTICAL_SCENARIO_BY_ID.get('project-workflow');
  const grounded=workflow.options.find(value=>value.id==='grounded');
  assert.match(grounded.label,/only where they exist/);
  assert.match(grounded.label,/explicitly name absent boundaries/);
  assert.match(workflow.solution,/local calculator may have no request, ownership check or persistence/);
  for(const id of ['java-placement','frontend-placement','git-state','ai-placement','behavior-responsibility','interview-recover']){
    assert.equal(PRACTICAL_SCENARIO_BY_ID.get(id).variationId,null,`${id}: no authored same-skill variation available`);
  }
});

test('incidents are explicitly simulated and accept more than one defensible investigation path',()=>{
  for(const value of PRACTICAL_SCENARIOS.filter(item=>item.track==='debugging')){
    assert.match(value.lesson,/SIMULATED incident/);assert.match(value.lesson,/not production measurements/);
    assert.ok(value.options.filter(option=>option.correct).length>=2,value.id);
  }
  const cache=PRACTICAL_SCENARIO_BY_ID.get('incident-cache-outage');
  assert.match(cache.observations[0].text,/200 requests per second.*90%/);
  assert.match(cache.observations[1].text,/200 requests.*another 100/);
  assert.match(cache.observations[2].text,/120 reads per second/);
  assert.equal(200*(1-0.9)<120,true);assert.equal(200+100>120,true);
});

test('security feedback separates token acceptance, trusted ownership and rotation state',()=>{
  assert.equal(evaluateScenario('auth-logout','still-valid').correct,true);
  assert.equal(evaluateScenario('auth-logout','always-invalid').correct,false);
  assert.equal(evaluateScenario('flow-ownership','trust-body').correct,false);
  assert.equal(evaluateScenario('auth-refresh','both-issue').correct,false);
  assert.equal(evaluateScenario('auth-oauth','id-as-api').correct,false);
  assert.equal(evaluateScenario('auth-cookie-boundary','no-more-checks').correct,false);
  assert.match(PRACTICAL_SCENARIO_BY_ID.get('flow-ownership').solution,/validated session/);
});

test('placement assesses a particular demonstration without prelabeling a whole technology as weak',()=>{
  for(const value of PRACTICAL_SCENARIOS.filter(item=>item.assessmentArea)){
    assert.equal(value.difficulty,'placement');assert.ok(value.skills.length<=2);assert.doesNotMatch(value.lesson,/you are weak|your weakness|failed developer/i);
  }
  assert.equal(evaluateScenario('git-state','local-only').correct,true);
  assert.equal(evaluateScenario('git-state','live').correct,false);
});

test('small assistance stays scoped to the selected concept instead of revealing every scenario solution',()=>{
  const logout=PRACTICAL_SCENARIO_BY_ID.get('auth-logout'),git=PRACTICAL_SCENARIO_BY_ID.get('git-state'),ownership=PRACTICAL_SCENARIO_BY_ID.get('flow-ownership');
  assert.match(logout.hints[0],/server acceptance/);assert.match(git.hints[0],/local, remote and deployed/);assert.match(ownership.hints[0],/permission/);
  assert.notEqual(logout.hints[0],git.hints[0]);
  for(const scenario of PRACTICAL_SCENARIOS)assert.ok(scenario.hints.slice(0,4).every(hint=>hint!==scenario.solution));
});
