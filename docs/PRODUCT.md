# Product brief: one connected learning experience

Research date: September 8, 2026. Product decisions below are proposals, not measured superiority claims. See RESEARCH.md for the primary-source landscape.

## The job to be done

A learner can often recognize a familiar solution but struggles to produce or explain it under a new constraint. TraceCraft should help the learner build a mental model, use it to write code, test it against a counterexample, and communicate its limits. The product should serve both a beginner asking what assignment does and an engineer explaining a retrieval failure—but not pretend those needs are the same lesson.

The initial audience is a Python-first learner preparing for entry-level software/backend interviews. Java is a second language track, not a parallel prerequisite on day one. The full map supports web, database, systems, and AI specialties later. A role selector should narrow the map rather than dump every technology into today’s to-do list.

## Core learning loop

1. **Predict:** identify the input, expected output, and a likely edge case before running.
2. **Learn:** read a short original explanation with optional primary-source depth.
3. **Construct:** write code or reorder a small set of code blocks.
4. **Observe:** advance the trace while the source line, variables, memory, and output agree.
5. **Challenge:** run revealing tests, repair a bug, and solve a changed-input variant.
6. **Explain:** give an invariant or causal explanation, discuss complexity, and justify a design trade-off.
7. **Revisit:** return later to a related but nonidentical task without copying the prior answer.

The current alpha implements the core interaction, but prediction capture, scheduling, independent variants, and external assessment are future work. Its working examples are study material; they are not secretly graded as independent achievements.

## Information architecture

**Today** answers “what should I do next?” with one primary action and a 30-minute routine. **Learning path** provides a prerequisite map and explicit content status. **Practice lab** pairs code with execution. **Systems lab** exposes assumptions and data flow. **Reading room** preserves source identity. **Interview studio** pairs prompt and reflection. **Settings** owns data controls and transparent provider capabilities.

A future portfolio area should show an actual repo, tests, architecture decision, walkthrough, and retrospective. It should not produce unverifiable skill badges. A future arena should offer cooperative debugging, code review, design defense, and judged project events alongside timed algorithms. Competition is optional; speed alone is not understanding.

## Visual language

The alpha uses graphite/forest surfaces, lime for primary action, mint for state/output, and lavender for conceptual guidance. Status also uses words and icons; color alone must not carry meaning. The dashboard is quiet and spacious, while the lab favors legible source and concrete state over decoration.

Three.js is reserved for relationships that genuinely benefit from spatial structure: graph traversal, distributed topology, memory reference graphs, and retrieval neighborhoods. Anime.js should animate a value moving or a dependency resolving, not delay the learner with ceremonial transitions. Pause, step, replay, reduced motion, and static equivalents remain available.

The implemented hero is an optional 3D enhancement over an original SVG network, not an execution trace. The actual practice trace is deterministic text and memory UI generated from the entered program. These must never be confused.

The production visualizer should synchronize source spans, environment snapshots, active call frames, object identity, output, and explanation annotations. For Python, show references and mutation honestly; for Java, distinguish primitive values, references, object identity, stack frames, and garbage collection at the appropriate level. Do not label a pedagogical rectangle as literal hardware memory without qualification.

## Game design without deceptive mastery

Practice XP rewards one completed exercise once. It should not inflate with repeated button clicks. A missed day should not erase accumulated work. Optional quests can award a new visualization theme, a completed project map, or a collaboration challenge.

Independent mastery requires distinct evidence: a previously unseen variant, a delayed retrieval attempt, a sound explanation, and a project decision. Track `studied`, `assisted`, `practiced`, and `independent` separately. Show help usage without shame. Offer private progress and cooperative goals; never pressure learners to disclose voice recordings or compete publicly.

An interview-readiness report should be a transparent collection of evidence and gaps, scoped to a target role. It must not claim a scientifically calibrated hiring probability without an actual validation study.

## Usability and product evaluation plan

These are proposed release criteria, not observed results:

- A first-time learner can start, run, step, and explain one example without facilitator rescue.
- Editing code changes both the trace and tests. No hard-coded animation is allowed to contradict execution.
- A keyboard-only learner can complete the same core task; 200% zoom and a narrow viewport retain controls and readable content.
- Reduced motion removes decorative movement without removing information. Screen-reader testing verifies labels, state announcements, focus order, and code access.
- In a pilot, compare a read-only lesson against the same lesson with prediction, tracing, and explanation. Use an unseen transfer problem and delayed recall, not only satisfaction or click-through.
- Report consented, aggregate evidence: attempts, completion, time to a correct mental model, transfer errors, explanation rubric agreement, and follow-up retention. Do not fabricate a baseline, sample size, or effect.

Recruit a small mix of beginners and interview-preparing learners before expanding the catalog. Revise the lesson that causes confusion rather than adding more surface area.

## Scope discipline

The shortest route to usefulness is a reliable learning loop plus a coherent Python/SQL/project track. Shipping every language, every textbook, every contest mode, and every provider at once would multiply authoring, correctness, security, accessibility, and support work. The larger map remains visible; implementation proceeds through complete vertical slices.
