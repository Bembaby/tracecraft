import { gameStats } from './game-stats.mjs';
import { signalMoment, soundEnabled } from './game-fx.mjs';
// Shell heads-up display: level, XP toward the next level and the practice streak.
// Numbers come from game-stats.mjs; the link opens quick questions, where XP is earned.
const flame='<svg class="hud-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 22c4 0 7-2.8 7-6.8 0-3.1-1.8-5.3-3.4-7.1-.4 1.6-1.3 2.7-2.4 3.2.3-3.3-1-6.4-3.7-8.3.2 3-1.5 5-3.2 7C4.9 11.6 5 13.3 5 15.2 5 19.2 8 22 12 22Z"/><path d="M12 22c-1.8 0-3-1.3-3-3 0-1.6 1-2.7 2-3.7.3 1 .9 1.6 1.6 1.8 0-1 .4-2 1.2-2.8.9 1.2 2.2 2.6 2.2 4.6 0 1.8-1.6 3.1-4 3.1Z"/></svg>';
const star='<svg class="hud-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z"/></svg>';
const speaker='<svg class="hud-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="hud-waves" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/><path class="hud-mute" d="m16 9 6 6m0-6-6 6"/></svg>';
let lastLevel=null,source=()=>({training:null,days:[]});

export function hudView(stats){
  const label=`Level ${stats.level}, ${stats.xp} practice XP, ${stats.xpToNext} XP to level ${stats.level+1}, ${stats.streak} day practice streak. Open quick questions. API question XP is included.`;
  return `<a class="game-hud" href="#play" data-game-hud aria-label="${label}">${hudInner(stats)}</a>`;
}
function hudInner(stats){
  return `<span class="hud-level">Lv <strong>${stats.level}</strong></span><span class="hud-meter" aria-hidden="true"><span style="width:${Math.round(stats.levelProgress*100)}%"></span></span><span class="hud-xp">${star}<strong>${stats.xp}</strong> XP</span><span class="hud-streak${stats.practicedToday?' lit':''}" title="${stats.streak} day practice streak${stats.practicedToday?'':'. Check one answer today to keep it going.'}">${flame}<strong>${stats.streak}</strong></span>`;
}
export function soundToggleView(){
  const on=soundEnabled();
  return `<button class="hud-sound" type="button" data-game-sound aria-pressed="${on}" title="Sound effects ${on?'on':'off'}">${speaker}<span class="sr-only">Sound effects</span></button>`;
}
export function currentGameStats(){const {training,days}=source();return gameStats(training,days);}

function refresh(){
  const stats=currentGameStats();
  for(const hud of document.querySelectorAll('[data-game-hud]')){
    hud.innerHTML=hudInner(stats);
    hud.setAttribute('aria-label',`Level ${stats.level}, ${stats.xp} practice XP, ${stats.xpToNext} XP to level ${stats.level+1}, ${stats.streak} day practice streak. Open quick questions. API question XP is included.`);
  }
  // Let the answer's own celebration land first, then the level-up fanfare.
  if(lastLevel!==null&&stats.level>lastLevel)setTimeout(()=>signalMoment('level'),750);
  lastLevel=stats.level;
}
export function mountHud(read){
  source=read;lastLevel=currentGameStats().level;
  addEventListener('tracecraft:progress-changed',refresh);
}
