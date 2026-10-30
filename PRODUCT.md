# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the repository and not yet confirmed in an interview: self-directed learners who start from zero and work toward developer interviews, including the owner's own TCS preparation path. They study in short sessions on a laptop or a phone, often one lesson or one quick question at a time.

## Product Purpose

TraceCraft is a developer-practice alpha: original lessons, quick recognition questions, and real Python, SQL and Java that runs in browser workers, plus an interactive system design lab. The learning loop is attempt, run, inspect, explain, retry. Success means a learner keeps returning, attempts work independently, and can explain why it works.

## Positioning

Code the learner edits is really executed in the browser, and traces come from that code, never from a prerecorded answer. Progress keeps separate records for a self-reported read mark, a recognition answer, and a checked runnable attempt, and records when help was used.

## Operating Context

Required verified email-code sign-in. Drafts save on the device and can autosave to the learner's account after review. Paths: Start here, Beginner lessons (Python, SQL, Java), TCS path (25 lessons), Quick questions (arcade quests), Interview preparation course and mock interviews, Personal practice coach, Daily session, and full Python, SQL, Java and system design labs.

## Capabilities and Constraints

- Learner programs never run in the application API process; no eval or Function for user code.
- No API credentials, session cookies or passwords stored in the browser.
- The Mini-Python interpreter is a teaching subset, not full Python; the keyword retrieval demo is not a full RAG system.
- Visualization stays optional: every graphical fact needs a text or table equivalent, keyboard controls and reduced-motion behavior.
- Learners may skip ahead or repeat any topic; nothing is locked behind earlier lessons.
- Practice XP is 10 per first correct quick-question answer (including with a hint), and a level is every 6 completions. Streaks and levels must be computed from real records only.

## Brand Commitments

- Name: TraceCraft, shown as lowercase "tracecraft" with an "alpha" mark. Truthful status labels (alpha, prototype, planned, self-assessment) stay visible.
- Confirmed by the owner on 2026-10-29: the whole product should feel like a fun, interactive learning game, using the existing arcade world (navy, lavender, lime, quest tiles, pixel robot guide) everywhere, including labs. Lessons play as step-by-step levels. Wanted game elements: celebrations with optional sound, a daily streak, a level and XP bar in the shell, and a robot guide that reacts to answers.
- Asset on hand: `public/images/arcade-guide.png` (pixel robot, single pose).

## Evidence on Hand

No usage, retention, learning-effectiveness or job-placement data exists. Never invent metrics, testimonials or hiring claims. A pass badge is practice evidence, not a hiring score.

## Product Principles

1. Practice evidence over claims: celebrate real attempts, never imply mastery or certification.
2. One small win at a time: a single idea, a prediction, a check, a reaction.
3. The learner stays in control: skip, repeat, show the whole lesson, mute, reduce motion.
4. Honest records: read marks, recognition answers and runnable checks stay separate.

## Accessibility & Inclusion

Keyboard operability, visible focus, reduced-motion behavior and text equivalents for every graphical fact are required. Native form controls are preserved. Phone layouts respect safe areas and the bottom dock.
