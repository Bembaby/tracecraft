---
version: 1
slug: "src-lesson-stages-mjs"
primary_target: "src/lesson-stages.mjs"
related_targets: ["src/game.css","src/game-hud.mjs","src/game-fx.mjs"]
---

## Scope

Whole app shell plus lesson surfaces (TCS, beginner and interview course lessons), labs and overviews. Mode: Operate and Read, played as a game per the owner's brief. Code-led (no image generation available).

## Audience and job

Self-directed learners (including the owner preparing for TCS interviews) studying in short sessions; the job is to understand one idea, predict, check, and keep going.

## Constraints

Truthful records (read marks, recognition, runnable checks stay separate); nothing locked; XP, level and streak only from real records; visualization optional with text equivalents, keyboard and reduced motion.

## Direction contract

THESIS: Every lesson is a level. One stage on screen, a clickable lesson map and a robot guide that reacts to real answers; refuses the docs-page default of a narrow centered text column inside empty margins.

OWN-WORLD: Midnight navy ground #141625, twilight surfaces, slate-violet lines; practice-lime actions, lavender selection, honey-gold rewards; six quest identity colors on numbered tiles with a pressable lower edge; heavy rounded Nunito; recessed monospace code wells; the pixel robot sprite.

STORY: The learner sees where they are (lesson n of 25, stage n of m), reads one bite, predicts, checks a claim, hears a chime and sees the robot react, continues, and watches the HUD level and streak grow from real practice.

FIRST VIEWPORT: Lesson at 1440 wide: location line and display title across the main column; progress strip with stage count and pips; stage card below; Continue at the card foot, right-aligned; right 296px column with robot plus speech bubble above the colored lesson map and "Show whole lesson". HUD (level, XP meter, streak) and sound toggle in the top bar.

FORM: Owner-pinned expansion of the incumbent arcade world ("Arcade everywhere"); first on the list by the owner's choice. seed: none (owner-pinned incumbent world; no concept roll ran).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

Answering a check correctly: the feedback card turns green, confetti bursts from it, the robot in the lesson map hops and says something encouraging, and the optional chime plays.
