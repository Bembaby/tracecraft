import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {practicalLabGuide,practicalHelpPanel,practicalHelpText} from '../src/practical-lab.mjs';
import {PRACTICAL_PYTHON_DRILLS} from '../src/practical-python-content.mjs';
import {FITNESS_SQL_LABS} from '../src/fitness-sql-content.mjs';

const lab={curriculum:'practical',id:'sample-task',title:'A focused task',topic:'One useful operation',prediction:'Predict the result before running.',solution:'FULL_SOLUTION_SENTINEL',explanation:'FULL_EXPLANATION_SENTINEL',complexity:'FULL_COST_SENTINEL',assistance:{nudge:'NUDGE_SENTINEL',question:'QUESTION_SENTINEL',example:'EXAMPLE_SENTINEL',scaffold:'SCAFFOLD_SENTINEL',solution:'FULL_SOLUTION_SENTINEL'}};
const levels=['nudge','question','example','scaffold','solution'];
const escaped=value=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

test('existing labs retain their incumbent guide and help path',()=>{
  for(const old of [null,undefined,{}, {...lab,curriculum:'beginner'}, {...lab,curriculum:'course'}]){
    assert.equal(practicalLabGuide('python',old), '');
    assert.equal(practicalHelpPanel('python',old),null);
    assert.equal(practicalHelpText(old,'solution'),'');
  }
});

test('the practical guide names the task, return paths and exact mode selection',()=>{
  for(const mode of ['learn','practice','interview']){
    const output=practicalLabGuide('python',lab,{coach:{mode}});
    assert.ok(output.includes('<h1>A focused task</h1>'));
    assert.ok(output.includes('id="practical-lab-mode"'));
    assert.ok(output.includes(`<option value="${mode}" selected>`));
    assert.equal((output.match(/ selected>/g)||[]).length,1);
    assert.ok(output.includes('href="#coach"'));
    assert.ok(output.includes('href="#coach/notebook/sample-task"'));
    assert.equal(output.includes('Learn one small idea'),mode==='learn');
    assert.equal(output.includes(lab.assistance.nudge),mode==='learn');
    for(const hidden of [lab.solution,lab.explanation,lab.complexity,...Object.entries(lab.assistance).filter(([id])=>mode!=='learn'||id!=='nudge').map(([,value])=>value)])assert.ok(!output.includes(hidden));
  }
  assert.ok(practicalLabGuide('python',lab,{coach:{mode:'invalid'}}).includes('<option value="learn" selected>'));
});

test('a prediction belongs to this selected language and task and preserves its saved text',()=>{
  const saved='I expect <three> rows & "zero" for missing data.\nThen I will compare.';
  const training={explanations:{'prediction:sql:sample-task':saved,'prediction:python:sample-task':'WRONG_LANGUAGE','prediction:sql:another-task':'WRONG_TASK'}};
  const output=practicalLabGuide('sql',lab,training);
  assert.ok(output.includes('id="practical-prediction"'));
  assert.ok(output.includes('data-explanation="prediction:sql:sample-task"'));
  assert.ok(output.includes('maxlength="2000"'));
  assert.ok(output.includes('rows="4" required aria-describedby="practical-prediction-prompt practical-prediction-note"'));
  assert.ok(output.includes(escaped(saved)));
  assert.ok(output.includes(lab.prediction));
  assert.ok(output.includes('Your prediction (required before Run or Check)'));
  assert.ok(!output.includes('WRONG_LANGUAGE')&&!output.includes('WRONG_TASK'));
  assert.ok(!practicalLabGuide('sql',{...lab,prediction:''},training).includes('id="practical-prediction"'));
});

test('the guide describes browser checks with bounded evidence and no model claims',()=>{
  const python=practicalLabGuide('python',lab);
  const sql=practicalLabGuide('sql',lab);
  assert.match(python,/CPython assertions in your browser/);
  assert.match(sql,/disposable SQLite database/);
  for(const output of [python,sql]){
    assert.match(output,/Written predictions and explanations are self-assessed/);
    assert.match(output,/practice evidence for this task/);
    assert.doesNotMatch(output,/AI|mastered|interview.ready|hiring score/);
  }
});

test('help starts hidden with all five direct choices and explicit documentation and hide actions',()=>{
  const output=practicalHelpPanel('sql',lab);
  for(const level of levels){
    assert.ok(output.includes(`data-training="practical-help" data-level="${level}" data-type="sql"`));
    assert.ok(!output.includes(lab.assistance[level]));
  }
  assert.equal((output.match(/data-training="practical-help"/g)||[]).length,5);
  assert.ok(output.includes('data-training="practical-documentation" data-type="sql"'));
  assert.ok(output.includes('data-training="practical-stop" data-type="sql"'));
  assert.ok(output.includes('Help recorded: independent'));
  assert.ok(output.includes('aria-live="polite"'));
  assert.ok(!output.includes(lab.explanation)&&!output.includes(lab.complexity));
});

for(const selected of levels){
  test(`${selected} displays exactly the requested authored help level`,()=>{
    const output=practicalHelpPanel('python',lab,{level:selected,helpLabel:selected});
    assert.equal(practicalHelpText(lab,selected),lab.assistance[selected]);
    assert.ok(output.includes(lab.assistance[selected]));
    assert.ok(output.includes(`data-level="${selected}" data-type="python" aria-pressed="true"`));
    assert.equal((output.match(/aria-pressed="true"/g)||[]).length,1);
    for(const hidden of levels.filter(level=>level!==selected))assert.ok(!output.includes(lab.assistance[hidden]));
    assert.equal(output.includes(lab.explanation),selected==='solution');
    assert.equal(output.includes(lab.complexity),selected==='solution');
  });
}

test('missing or unrecognized help never falls back to a worked solution',()=>{
  for(const level of [null,undefined,'documentation','unknown','constructor','toString',0]){
    assert.equal(practicalHelpText(lab,level),'');
    const output=practicalHelpPanel('python',lab,{level});
    assert.ok(!output.includes(lab.solution));
    assert.ok(!output.includes(lab.explanation));
  }
  assert.equal(practicalHelpText({...lab,assistance:{}},'nudge'),'');
  assert.ok(!practicalHelpPanel('python',{...lab,assistance:{}},{level:'nudge'}).includes(lab.solution));
});

test('all interpolated lab, saved response, type, help and label text is HTML escaped',()=>{
  const hostile='</textarea><img src=x onerror="alert(1)"> & \'danger\'';
  const value={...lab,id:'id" onmouseover="bad',title:hostile,topic:hostile,prediction:hostile,explanation:hostile,complexity:hostile,assistance:Object.fromEntries(levels.map(level=>[level,hostile]))};
  const type='sql" onclick="bad';
  const output=practicalLabGuide(type,value,{explanations:{[`prediction:${type}:${value.id}`]:hostile}})+practicalHelpPanel(type,value,{level:'solution',helpLabel:hostile});
  assert.ok(output.includes(escaped(hostile)));
  assert.ok(output.includes('data-type="sql&quot; onclick=&quot;bad"'));
  assert.ok(output.includes('href="#coach/notebook/id%22%20onmouseover%3D%22bad"'));
  assert.doesNotMatch(output,/<img|<script|data-type="sql" onclick=|<\/textarea><img/);
});

test('real Python and SQL tasks show no full solution in their guide or smaller hints',()=>{
  for(const [type,tasks] of [['python',PRACTICAL_PYTHON_DRILLS],['sql',FITNESS_SQL_LABS]]){
    for(const original of tasks){
      const task={...original,curriculum:'practical'};
      const full=escaped(task.assistance.solution);
      for(const mode of ['learn','practice','interview'])assert.ok(!practicalLabGuide(type,task,{coach:{mode}}).includes(full),`${task.id}: ${mode}`);
      for(const level of [null,'nudge','question','example','scaffold'])assert.ok(!practicalHelpPanel(type,task,{level}).includes(full),`${task.id}: ${level}`);
      assert.ok(practicalHelpPanel(type,task,{level:'solution'}).includes(full),task.id);
      assert.ok(practicalLabGuide(type,task).includes(escaped(task.prediction)),task.id);
    }
  }
});

test('authored helper source and rendered text avoid prohibited dash characters',()=>{
  assert.doesNotMatch(readFileSync(new URL('../src/practical-lab.mjs',import.meta.url),'utf8'),/[\u2013\u2014]/);
  assert.doesNotMatch(practicalLabGuide('python',lab)+practicalHelpPanel('python',lab),/[\u2013\u2014]/);
});
