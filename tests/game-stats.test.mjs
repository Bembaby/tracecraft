import test from 'node:test';
import assert from 'node:assert/strict';
import { gameStats, practiceDays, practiceStreak } from '../src/game-stats.mjs';
import { freshTraining } from '../src/training-state.mjs';
import { ARCADE_QUESTS } from '../src/arcade-content.mjs';

const at=(day,hour=12)=>new Date(`${day}T${String(hour).padStart(2,'0')}:00:00`).toISOString();
const questionIds=ARCADE_QUESTS.flatMap(q=>q.questions.map(item=>item.id));

test('a fresh learner starts at level 1 with no XP and no streak',()=>{
  assert.deepEqual(gameStats(freshTraining(),[],'2026-10-29'),{xp:0,level:1,completed:0,levelProgress:0,xpToNext:60,streak:0,practicedToday:false});
});

test('XP and level come only from distinct first-correct quick questions',()=>{
  const training=freshTraining();
  for(const id of questionIds.slice(0,8))training.arcade.completed[id]={help:'solo',at:at('2026-10-29')};
  training.arcade.answers[questionIds[9]]='typed but never checked';
  const stats=gameStats(training,[],'2026-10-29');
  assert.equal(stats.xp,80);
  assert.equal(stats.level,2);
  assert.equal(stats.completed,8);
  assert.equal(stats.xpToNext,40);
  assert.ok(Math.abs(stats.levelProgress-2/6)<1e-9);
});

test('streak counts consecutive days with checked practice, alive through today',()=>{
  const training=freshTraining();
  training.attempts.push({type:'sql',exercise:'x',passed:false,at:at('2026-10-27')});
  training.arcade.completed[questionIds[0]]={help:'hint',at:at('2026-10-28')};
  training.coach.attempts.push({exercise:'s',correct:true,at:at('2026-10-29',9)});
  assert.equal(gameStats(training,[],'2026-10-29').streak,3);
  assert.equal(gameStats(training,[],'2026-10-29').practicedToday,true);
  // Not practised yet on the 30th: yesterday's run still shows.
  assert.equal(gameStats(training,[],'2026-10-30').streak,3);
  // A gap ends the run.
  assert.equal(gameStats(training,[],'2026-10-31').streak,0);
});

test('read marks, notes and malformed timestamps never create practice days',()=>{
  const training=freshTraining();
  training.tcs.read.push('guards-and-return');
  training.attempts.push({type:'python',exercise:'x',passed:true,at:'not a date'});
  assert.equal(practiceDays(training).size,0);
  assert.equal(practiceStreak(practiceDays(training,['2026-10-29','bad']),'2026-10-29'),1);
});
