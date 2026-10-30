// Feedback moments for real results: a short chime (opt-in), a small burst of
// confetti, and the robot guide reacting. Modules report a checked result with
// signalResult(); nothing here decides correctness or stores progress.
const SOUND_KEY='tracecraft:sound';
const GUIDE_SRC='public/images/arcade-guide-sm.png';
const WIN_LINES=['Nice! That one is yours.','Correct. On to the next idea.','Yes! Your reasoning held up.','Clean work. Keep going.','That clicked. Try the next one.'];
const RETRY_LINES=['Close. Read the explanation, then try again.','Not yet. Mistakes are how this sticks.','Good attempt. Look at the feedback, then retry.','Almost. Compare your answer with the example.'];
const FINISH_LINES=['You reached the end of this lesson!','Lesson finished. Mark it read if it clicked.'];
const LEVEL_LINES=['Level up! Your practice record grew.'];
let audio=null,floatTimer=null,lineIndex=0;

export function signalResult(passed,source=''){
  globalThis.dispatchEvent?.(new CustomEvent('tracecraft:result',{detail:{passed:passed===true,source}}));
}
export function signalMoment(kind){
  globalThis.dispatchEvent?.(new CustomEvent('tracecraft:moment',{detail:{kind}}));
}

export function soundEnabled(){try{return localStorage.getItem(SOUND_KEY)==='on';}catch{return false;}}
function setSound(on){try{localStorage.setItem(SOUND_KEY,on?'on':'off');}catch{}}
const reducedMotion=()=>document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tiny synthesized tones; no audio files are downloaded.
function tone(kind){
  if(!soundEnabled())return;
  try{
    audio??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    const notes={win:[[659,0],[880,.09]],retry:[[330,0],[294,.11]],finish:[[523,0],[659,.1],[784,.2]],level:[[523,0],[659,.09],[784,.18],[1047,.3]],toggle:[[740,0]]}[kind]||[];
    const start=audio.currentTime+.01;
    for(const [freq,offset] of notes){
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type=kind==='retry'?'sine':'triangle';osc.frequency.value=freq;
      gain.gain.setValueAtTime(0,start+offset);
      gain.gain.linearRampToValueAtTime(kind==='retry'?.06:.09,start+offset+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,start+offset+(kind==='level'||kind==='finish'?.42:.24));
      osc.connect(gain).connect(audio.destination);osc.start(start+offset);osc.stop(start+offset+.5);
    }
  }catch{}
}

function originPoint(){
  const el=document.activeElement&&document.activeElement!==document.body&&document.querySelector('#main')?.contains(document.activeElement)?document.activeElement:null;
  const r=el?.getBoundingClientRect();
  if(r&&r.width&&r.bottom>0&&r.top<innerHeight)return {x:r.left+Math.min(r.width,420)/2,y:r.top+Math.min(r.height,60)/2};
  return {x:innerWidth/2,y:innerHeight*.42};
}

function confetti(count=22){
  if(reducedMotion())return;
  const {x,y}=originPoint(),layer=document.createElement('div');
  layer.className='fx-confetti';layer.setAttribute('aria-hidden','true');
  const colors=['#c4f26d','#c1aeff','#f4cf78','#f3afce','#a0d4ff','#ffc08e'];
  for(let i=0;i<count;i++){
    const bit=document.createElement('i'),angle=(Math.PI*2*i)/count+Math.random()*.5,dist=70+Math.random()*90;
    bit.style.cssText=`left:${x}px;top:${y}px;background:${colors[i%colors.length]};${i%3===0?'border-radius:50%;':''}`;
    layer.append(bit);
    bit.animate([
      {transform:'translate(-50%,-50%) scale(.6) rotate(0deg)',opacity:1},
      {transform:`translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${Math.sin(angle)*dist-30}px)) scale(1) rotate(${200+Math.random()*260}deg)`,opacity:1,offset:.55},
      {transform:`translate(calc(-50% + ${Math.cos(angle)*dist*1.15}px),calc(-50% + ${Math.sin(angle)*dist+60}px)) scale(.9) rotate(${380+Math.random()*200}deg)`,opacity:0}
    ],{duration:900+Math.random()*250,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
  }
  document.body.append(layer);setTimeout(()=>layer.remove(),1400);
}

function pick(lines){lineIndex=(lineIndex+1)%lines.length;return lines[lineIndex];}

// Prefer a guide already on the page (lesson side panel); otherwise pop in a
// small docked guide for a moment. Both are decorative: the module's own
// feedback text remains the announced result.
function react(mood,line){
  const guides=[...document.querySelectorAll('[data-guide]')].filter(g=>g.offsetParent!==null);
  if(guides.length){for(const guide of guides)setMood(guide,mood,line);return;}
  let dock=document.querySelector('.fx-guide-dock');
  if(!dock){
    dock=document.createElement('div');dock.className='fx-guide-dock';dock.setAttribute('aria-hidden','true');
    dock.innerHTML=`<p class="guide-say" data-guide-say></p><img src="${GUIDE_SRC}" alt="" width="96" height="88">`;
    document.body.append(dock);
  }
  setMood(dock,mood,line);dock.classList.add('show');
  clearTimeout(floatTimer);floatTimer=setTimeout(()=>dock.classList.remove('show'),2600);
}
function setMood(guide,mood,line){
  const say=guide.querySelector('[data-guide-say]');if(say)say.textContent=line;
  guide.classList.remove('guide-happy','guide-think');void guide.offsetWidth;
  guide.classList.add(mood==='happy'?'guide-happy':'guide-think');
}

// Results usually arrive right after a module repaints; wait one frame so the
// lesson panel (and the focused feedback) exist before reacting.
function onResult(event){
  const passed=event.detail?.passed;
  tone(passed?'win':'retry');
  requestAnimationFrame(()=>{if(passed)confetti();react(passed?'happy':'think',pick(passed?WIN_LINES:RETRY_LINES));});
}
function onMoment(event){
  const kind=event.detail?.kind;
  if(kind==='finish'){tone('finish');confetti(30);react('happy',pick(FINISH_LINES));}
  if(kind==='level'){tone('level');confetti(36);react('happy',pick(LEVEL_LINES));}
}
function onClick(event){
  const button=event.target.closest('[data-game-sound]');if(!button)return;
  const on=!soundEnabled();setSound(on);
  for(const b of document.querySelectorAll('[data-game-sound]')){b.setAttribute('aria-pressed',String(on));b.title=on?'Sound effects on':'Sound effects off';}
  if(on)tone('toggle');
}

let mounted=false;
export function mountGameFx(){
  if(mounted)return;mounted=true;
  addEventListener('tracecraft:result',onResult);
  addEventListener('tracecraft:moment',onMoment);
  document.addEventListener('click',onClick);
}
