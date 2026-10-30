import { arcadeStats, freshArcade } from './arcade-state.mjs';
import { dayKey, afterDays } from './training-state.mjs';
import {apiPracticeStats} from './api-course-state.mjs';
// Game HUD numbers. Everything here is derived from records the learner already
// produced; nothing is incremented by viewing a page or clicking through a lesson.
export const XP_PER_COMPLETION=10, COMPLETIONS_PER_LEVEL=6;

const keyOf=at=>{const time=Date.parse(at);return Number.isFinite(time)?dayKey(new Date(time)):null;};

// A day counts when it holds a checked runnable attempt (pass or fail), a first
// correct quick question, or a checked coach scenario. Read marks and notes do not.
export function practiceDays(training,extraDays=[]){
  const days=new Set(extraDays.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)));
  for(const attempt of training?.attempts||[]){const key=keyOf(attempt?.at);if(key)days.add(key);}
  for(const result of Object.values(training?.arcade?.completed||{})){const key=keyOf(result?.at);if(key)days.add(key);}
  for(const attempt of training?.coach?.attempts||[]){const key=keyOf(attempt?.at);if(key)days.add(key);}
  for(const field of ['answers','review'])for(const answer of Object.values(training?.apis?.[field]||{})){if(answer?.checked){const key=keyOf(answer.at);if(key)days.add(key);}}
  for(const attempt of training?.apis?.labAttempts||[]){const key=keyOf(attempt?.at);if(key)days.add(key);}
  return days;
}

// Consecutive practice days ending today. A streak stays alive through the
// current day: practising yesterday but not yet today still shows yesterday's run.
export function practiceStreak(days,today=dayKey()){
  let cursor=days.has(today)?today:afterDays(today,-1),count=0;
  while(days.has(cursor)){count++;cursor=afterDays(cursor,-1);}
  return count;
}

export function gameStats(training,extraDays=[],today=dayKey()){
  const stats=arcadeStats(training?.arcade||freshArcade()),api=apiPracticeStats(training?.apis),days=practiceDays(training,extraDays);
  const completed=stats.completed+api.completed,intoLevel=completed%COMPLETIONS_PER_LEVEL;
  return {
    xp:stats.xp+api.xp,level:1+Math.floor(completed/COMPLETIONS_PER_LEVEL),completed,
    levelProgress:intoLevel/COMPLETIONS_PER_LEVEL,
    xpToNext:(COMPLETIONS_PER_LEVEL-intoLevel)*XP_PER_COMPLETION,
    streak:practiceStreak(days,today),practicedToday:days.has(today)
  };
}
