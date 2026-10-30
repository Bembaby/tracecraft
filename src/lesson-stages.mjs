import { signalMoment } from './game-fx.mjs';
// Step-by-step lesson play. Enhances already-rendered lesson articles (TCS,
// beginner and interview course) without changing their markup contracts:
// each direct <section> becomes a stage, one stage shows at a time, and a
// stage map plus Back/Continue move between them. "Show whole lesson" restores
// the full scrolling page. Nothing is locked and nothing here records progress.
const LESSONS='article.beginner-reading, article.course-reading';
const WHOLE_KEY='tracecraft:whole-lesson';
const GUIDE_SRC='public/images/arcade-guide-sm.png';
const memory=new Map(); // location.hash -> {index, seen:Set}
let observer=null,scheduled=false;

const readWhole=()=>{try{return localStorage.getItem(WHOLE_KEY)==='on';}catch{return false;}};
const writeWhole=on=>{try{localStorage.setItem(WHOLE_KEY,on?'on':'off');}catch{}};
const reducedMotion=()=>document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function kindOf(section){
  if(section.matches('.tcs-quiz')||section.querySelector('fieldset input[type="radio"]'))return 'check';
  if(section.querySelector('a.primary[href^="#python"],a.primary[href^="#sql"],a.primary[href^="#java"],.course-practice-list,.tcs-practice'))return 'practice';
  // A worked example often carries its own prediction box; the code decides.
  if(section.querySelector('pre'))return 'example';
  if(section.querySelector('textarea'))return 'write';
  return 'read';
}
const TIPS={
  read:'One idea at a time. Read it, then tell yourself the main point.',
  example:'Predict the output before you reveal it. Being wrong is useful.',
  check:'Pick the claim the example actually proves, then check it.',
  practice:'Run it for real. Fail, fix and check again.',
  write:'Say it in your own words. Short is fine.'
};

function groups(article){
  const out=[];
  for(const el of article.children){
    if(el.matches('section, aside.beginner-java-runtime'))out.push([el]);
    else if(out.length&&!el.matches('nav, .stage-progress, .stage-panel, .stage-controls'))out.at(-1).push(el); // trailing notes/details join the stage above
  }
  return out;
}
function labelOf(group,i){
  const heading=group[0].querySelector('h2, h3');
  return (heading?.textContent||`Stage ${i+1}`).trim().replace(/\s+/g,' ');
}

function build(article){
  const stages=groups(article);
  if(stages.length<2)return;
  const key=location.hash||'#';
  const mem=memory.get(key)||{index:0,seen:new Set([0])};memory.set(key,mem);
  // A repaint focuses feedback inside some stage; follow it there.
  const active=document.activeElement;
  const focusedStage=stages.findIndex(g=>g.some(el=>el.contains(active)));
  if(focusedStage>=0)mem.index=focusedStage;
  mem.index=Math.min(mem.index,stages.length-1);mem.seen.add(mem.index);

  article.dataset.stages='ready';
  article.parentElement?.classList.add('stage-host');
  stages.forEach((group,i)=>group.forEach(el=>{el.dataset.stage=i;}));
  stages.forEach((group,i)=>{const h=group[0].querySelector('h2, h3');if(h&&!h.hasAttribute('tabindex'))h.setAttribute('tabindex','-1');group[0].dataset.stageKind=kindOf(group[0]);});
  const labels=stages.map(labelOf);

  const progress=document.createElement('div');
  progress.className='stage-progress';
  progress.innerHTML=`<p class="stage-count" aria-live="polite"></p><ol class="stage-pips">${labels.map((label,i)=>`<li><button type="button" data-stage-go="${i}" aria-label="Stage ${i+1}: ${esc(label)}"></button></li>`).join('')}</ol>`;
  const header=article.querySelector(':scope > header');
  if(header)header.after(progress);else stages[0][0].before(progress);

  const panel=document.createElement('aside');
  panel.className='stage-panel';
  panel.setAttribute('aria-label','Lesson stages');
  panel.innerHTML=`<div class="stage-panel-inner"><div class="stage-guide" data-guide><img src="${GUIDE_SRC}" alt="" width="132" height="120"><p class="guide-say" data-guide-say></p></div><h2 class="stage-panel-title">Lesson map</h2><ol class="stage-map">${labels.map((label,i)=>`<li data-kind="${stages[i][0].dataset.stageKind}"><button type="button" data-stage-go="${i}"><span class="stage-node">${i+1}</span><span class="stage-name">${esc(label)}</span><span class="stage-state"></span></button></li>`).join('')}</ol><button type="button" class="stage-whole" data-stage-whole aria-pressed="false">Show whole lesson</button></div>`;
  article.append(panel);

  const controls=document.createElement('div');
  controls.className='stage-controls';
  controls.innerHTML=`<button type="button" class="stage-back" data-stage-step="-1">Back</button><button type="button" class="primary stage-next" data-stage-step="1"></button>`;

  article.addEventListener('click',event=>{
    const go=event.target.closest('[data-stage-go]'),step=event.target.closest('[data-stage-step]'),whole=event.target.closest('[data-stage-whole]');
    if(go){event.preventDefault();show(article,stages,labels,Number(go.dataset.stageGo),true);}
    else if(step){
      const next=mem.index+Number(step.dataset.stageStep);
      if(next>=stages.length){finish(article);return;}
      show(article,stages,labels,Math.max(0,next),true);
    }else if(whole){writeWhole(!readWhole());apply(article,stages,labels,controls);}
  });
  article._stageControls=controls;
  apply(article,stages,labels,controls);
}

function apply(article,stages,labels,controls){
  const whole=readWhole();
  article.dataset.stageMode=whole?'all':'step';
  const toggle=article.querySelector('[data-stage-whole]');
  toggle.setAttribute('aria-pressed',String(whole));
  toggle.textContent=whole?'Play step by step':'Show whole lesson';
  if(whole)controls.remove();
  show(article,stages,labels,memory.get(location.hash||'#').index,false);
}

function show(article,stages,labels,index,moveFocus){
  const mem=memory.get(location.hash||'#');
  const whole=article.dataset.stageMode==='all';
  mem.index=index;mem.seen.add(index);
  stages.forEach((group,i)=>group.forEach(el=>el.classList.toggle('stage-current',i===index)));
  article.dataset.stageAt=index;
  article.dataset.stageLast=String(index===stages.length-1);
  for(const button of article.querySelectorAll('[data-stage-go]')){
    const i=Number(button.dataset.stageGo),li=button.closest('li');
    if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    li.classList.toggle('seen',mem.seen.has(i)&&i!==index);
    const state=button.querySelector('.stage-state');if(state)state.textContent=i===index?'Now':mem.seen.has(i)?'Seen':'';
  }
  const count=article.querySelector('.stage-count');
  if(count)count.textContent=whole?`${stages.length} stages · whole lesson`:`Stage ${index+1} of ${stages.length} · ${labels[index]}`;
  const say=article.querySelector('.stage-guide [data-guide-say]');
  if(say)say.textContent=TIPS[stages[index][0].dataset.stageKind]||TIPS.read;

  const controls=article._stageControls;
  if(!whole&&controls){
    stages[index].at(-1).after(controls);
    controls.querySelector('.stage-back').disabled=index===0;
    const next=controls.querySelector('.stage-next'),last=index===stages.length-1;
    next.innerHTML=last?'Finish lesson':`Continue<span class="stage-next-name">: ${esc(labels[index+1])}</span>`;
  }
  fitPanel(article);
  if(whole&&moveFocus){
    stages[index][0].scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
    stages[index][0].querySelector('h2, h3')?.focus({preventScroll:true});
    return;
  }
  if(moveFocus){
    const heading=stages[index][0].querySelector('h2, h3');
    heading?.focus({preventScroll:true});
    const top=article.querySelector('.stage-progress')?.getBoundingClientRect().top??0;
    if(top<0||top>innerHeight*.5)article.querySelector('.stage-progress')?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
    if(!reducedMotion())stages[index][0].animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  }
}

// The side panel is absolutely placed beside the stage; keep the article tall
// enough that the sticky map never runs into the footer.
function fitPanel(article){
  const panel=article.querySelector('.stage-panel'),inner=panel?.firstElementChild;
  article.style.minHeight=panel&&inner&&getComputedStyle(panel).display!=='none'?`${inner.offsetHeight+24}px`:'';
}

function finish(article){
  article.dataset.stageFinished='true';
  signalMoment('finish');
  const next=article.querySelector('.beginner-bottom a:last-child, .course-main-actions a');
  const read=article.querySelector('[data-tcs="read"][aria-pressed="false"], [data-action="beginner-read"][aria-pressed="false"]');
  (read||next)?.focus();
  (read||next)?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'});
}

function enhance(){
  scheduled=false;
  for(const article of document.querySelectorAll(LESSONS))if(!article.dataset.stages)build(article);
}
export function mountLessonStages(root=document.getElementById('app')){
  // Without MutationObserver the lessons simply stay full scrolling pages.
  if(observer||!root||typeof MutationObserver!=='function')return;
  observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(enhance);}});
  observer.observe(root,{childList:true,subtree:true});
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>document.querySelectorAll('article[data-stages]').forEach(fitPanel),120);});
  enhance();
}
