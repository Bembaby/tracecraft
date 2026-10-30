const html=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const modes=[['learn','Learn'],['practice','Practice'],['interview','Interview']];
const levels=[['nudge','Small nudge'],['question','Guiding question'],['example','Small example'],['scaffold','Partial scaffold'],['solution','Full solution']];
const paragraphs=value=>String(value??'').split('\n').filter(line=>line.trim()).map(line=>`<p>${html(line)}</p>`).join('');
const practical=lab=>lab?.curriculum==='practical';

export function practicalLabGuide(type,lab,training={}){
  if(!practical(lab))return '';
  const mode=modes.some(([id])=>id===training?.coach?.mode)?training.coach.mode:'learn';
  const predictionKey=`prediction:${type}:${lab.id}`;
  const prediction=typeof lab.prediction==='string'&&lab.prediction.trim()?lab.prediction:'';
  const saved=typeof training?.explanations?.[predictionKey]==='string'?training.explanations[predictionKey]:'';
  const scope=type==='sql'?'Write SQL against prepared synthetic records in a disposable SQLite database. Checks compare the stated result and database-state fixtures.':'Write a small Python function and check its behavior with CPython assertions in your browser. Checks cover the stated input contract and fixtures.';
  const instructions={learn:'Read the topic and input contract, then try the starter. Choose a help level when you need it.',practice:'Try your own answer, then compare its behavior with the changed inputs. Request only the help you need.',interview:'Attempt the task independently, then explain your result and one edge case. Any requested help remains part of the attempt record.'};
  return `<header class="section-intro coach-lab-context"><h1>${html(lab.title)}</h1><p>${scope}</p><div class="training-actions"><label for="practical-lab-mode">Practice mode</label><select id="practical-lab-mode">${modes.map(([id,label])=>`<option value="${id}"${mode===id?' selected':''}>${label}</option>`).join('')}</select>${lab.id.startsWith('tcs-')?'<a href="#tcs">Return to TCS path</a>':''}<a href="#coach">Back to practical learning</a><a href="#coach/notebook/${html(encodeURIComponent(String(lab.id??'')))}">Add a correction to your notebook</a></div><p>${instructions[mode]}</p>${mode==='learn'?`<section class="notice"><h2>Learn one small idea</h2><p>${html(lab.assistance?.nudge||lab.topic)}</p><small>This conceptual guidance is recorded as assistance. Switch to Practice for an attempt-first flow.</small></section>`:''}<p class="training-muted">Written predictions and explanations are self-assessed. Passing these checks is practice evidence for this task.</p></header>${prediction?`<section class="panel practical-prediction"><h2>Predict before you run</h2><p id="practical-prediction-prompt">${html(prediction)}</p><label for="practical-prediction">Your prediction (required before Run or Check)</label><textarea id="practical-prediction" data-explanation="${html(predictionKey)}" maxlength="2000" rows="4" required aria-describedby="practical-prediction-prompt practical-prediction-note">${html(saved)}</textarea><p id="practical-prediction-note" class="training-muted">Write your best guess for this task before running or checking. You can revise it after comparing the result. Your note saves with your practice progress; it is not graded.</p></section>`:''}`;
}

export function practicalHelpText(lab,level){
  if(!practical(lab)||!levels.some(([id])=>id===level))return '';
  const value=lab.assistance?.[level];
  return typeof value==='string'?value:'';
}

export function practicalHelpPanel(type,lab,{level=null,helpLabel='independent'}={}){
  if(!practical(lab))return null;
  const selected=levels.find(([id])=>id===level);
  const text=practicalHelpText(lab,level);
  const content=selected?`<h3>${selected[1]}</h3>${text?(level==='scaffold'||level==='solution'?`<pre class="code-output" tabindex="0" role="region" aria-label="${selected[1]}">${html(text)}</pre>`:paragraphs(text)):'<p>This help level is unavailable for this task. Try another level.</p>'}${level==='solution'&&text?`${paragraphs(lab.explanation)}${lab.complexity?`<p><strong>Cost and trade-off:</strong> ${html(lab.complexity)}</p>`:''}`:''}`:'';
  return `<section class="panel training-help practical-help" aria-labelledby="practical-help-title"><div class="panel-head"><h2 id="practical-help-title">Choose the help you need</h2><span class="chip">Help recorded: ${html(helpLabel)}</span></div><p>Each button shows only that level. Requesting help records assistance for this task.</p><div class="training-actions">${levels.map(([id,label])=>`<button type="button" class="ghost" data-training="practical-help" data-level="${id}" data-type="${html(type)}" aria-pressed="${level===id}" aria-controls="practical-help-content">${label}</button>`).join('')}<button type="button" class="text-btn" data-training="practical-documentation" data-type="${html(type)}">I used documentation</button><button type="button" class="text-btn" data-training="practical-stop" data-type="${html(type)}">Hide help and let me try</button></div><div id="practical-help-content" aria-live="polite" aria-atomic="true">${content}</div><small>Hiding help keeps its recorded use. The full solution appears only when you request Full solution.</small></section>`;
}
