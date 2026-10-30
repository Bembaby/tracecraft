---
name: TraceCraft
description: A friendly coding arcade across every workspace, where lessons play as step-by-step levels.
colors:
  primary: "#c4f26d"
  guidance: "#c1aeff"
  reward: "#f4cf78"
  quest-rose: "#f3afce"
  quest-sky: "#a0d4ff"
  quest-apricot: "#ffc08e"
  quest-lime-ground: "#354929"
  quest-lavender-ground: "#43355b"
  quest-gold-ground: "#4b3d26"
  quest-rose-ground: "#4c3043"
  quest-sky-ground: "#293f59"
  quest-apricot-ground: "#4c382c"
  arcade-ground: "#141625"
  arcade-surface: "#1d1f33"
  arcade-raised: "#26283f"
  arcade-panel: "#202237"
  arcade-line: "#363955"
  arcade-well: "#10111f"
  arcade-shell: "#171828"
  arcade-text: "#f3f1ff"
  arcade-muted: "#b4b5cc"
  arcade-label: "#a9a6d6"
  selected-ground: "#2c2747"
  correct-ground: "#21321f"
  retry-ground: "#362a22"
typography:
  display:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "clamp(32px, 3.7vw, 48px)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "clamp(22px, 2.2vw, 28px)"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 850
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  reading:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.75
  body:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "0.01em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "15px"
    lineHeight: 1.75
rounded:
  field: "10px"
  action: "12px"
  surface: "14px"
  card: "18px"
  stage: "22px"
  quest: "23px"
  pill: "999px"
spacing:
  small: "8px"
  compact: "12px"
  regular: "16px"
  section: "24px"
  spacious: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#1d2610"
    typography: "{typography.body}"
    rounded: "{rounded.action}"
    padding: "11px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#d4ff8a"
    textColor: "#131c08"
  button-ghost:
    backgroundColor: "#2a2c46"
    textColor: "{colors.arcade-text}"
    rounded: "{rounded.action}"
    padding: "11px 18px"
  button-finish:
    backgroundColor: "{colors.reward}"
    textColor: "#2b1f05"
    rounded: "{rounded.action}"
    height: "52px"
  answer-card:
    backgroundColor: "{colors.arcade-panel}"
    textColor: "{colors.arcade-text}"
    rounded: "{rounded.surface}"
    padding: "14px 16px"
  answer-card-selected:
    backgroundColor: "{colors.selected-ground}"
    textColor: "#ffffff"
  stage-card:
    backgroundColor: "{colors.arcade-surface}"
    textColor: "{colors.arcade-text}"
    rounded: "{rounded.stage}"
    padding: "30px 32px"
  stage-node:
    backgroundColor: "{colors.quest-sky-ground}"
    textColor: "{colors.quest-sky}"
    rounded: "{rounded.field}"
    size: "34px"
  quest-tile:
    backgroundColor: "{colors.quest-lime-ground}"
    textColor: "{colors.primary}"
    rounded: "13px"
    size: "44px"
  hud:
    backgroundColor: "{colors.arcade-surface}"
    textColor: "{colors.arcade-text}"
    rounded: "{rounded.pill}"
    height: "36px"
  hud-level:
    backgroundColor: "{colors.guidance}"
    textColor: "#21182e"
    rounded: "{rounded.pill}"
  code-well:
    backgroundColor: "{colors.arcade-well}"
    textColor: "#ebe8ff"
    typography: "{typography.code}"
    rounded: "{rounded.surface}"
    padding: "16px 18px"
  guide-bubble:
    backgroundColor: "{colors.selected-ground}"
    textColor: "#f1ecff"
    rounded: "{rounded.surface}"
    padding: "11px 14px"
  input-field:
    backgroundColor: "#121325"
    textColor: "{colors.arcade-text}"
    rounded: "{rounded.field}"
    padding: "12px"
---

# Design System: TraceCraft

## Overview

**Creative North Star: "Every lesson is a level"**

TraceCraft is one friendly coding arcade from sign-in to the system design canvas. A quiet midnight-navy ground, lavender guidance, practice-lime actions and honey-gold rewards carry every workspace. Lessons play one stage at a time with a visible lesson map and a pixel robot guide who reacts to real answers. A heads-up display in the top bar shows level, practice XP toward the next level and the daily practice streak.

The arcade world replaced the earlier split between a navy beginner arcade and a charcoal workbench on October 29, 2026, at the owner's request ("Arcade everywhere"). Code editors keep monospace and their density; everything around them speaks the arcade voice. `src/game.css` is the final stylesheet layer that carries the world; older layers had their charcoal neutrals remapped to the navy family at equal OKLCH lightness.

**Key Characteristics:**

- One stage on screen at a time, with Back, Continue and a clickable lesson map. Nothing is locked.
- Lime means "your next action"; lavender means "selected or guiding"; gold means "reward or finish".
- Quest colors (lime, lavender, gold, rose, sky, apricot) distinguish topics and stage kinds, never correctness or skill.
- Every game number is computed from real records: XP and level from first-correct quick questions, streak from days with checked practice.
- Celebrations are short, opt-in for sound, and absent under reduced motion.

## Colors

The palette is a full arcade set on a navy foundation. Exact values in the frontmatter are normative; sidecar tonal ramps are inspection aids.

### Primary

- **Practice Lime** (`primary`): primary actions, the current stage node, the HUD XP meter, focus rings, correct-answer headings. Actions use dark ink `#1d2610`.
- **Lavender Guidance** (`guidance`): selected answers and formats, active navigation, the HUD level badge, links in reading surfaces, the robot's speech bubble border.

### Secondary

- **Honey Gold** (`reward`): XP star, the "Finish lesson" action, the gold quest.
- **Rose**, **Sky**, **Apricot** and their `*-ground` partners: topic identity for quests, TCS units and stage kinds (read uses sky, example apricot, check lavender, practice lime, write gold).

### Neutral

- **Midnight Navy** (`arcade-ground`): every page background.
- **Shell Navy** (`arcade-shell`): sidebar, top bar, mobile action bars.
- **Twilight Surface / Raised / Panel** (`arcade-surface`, `arcade-raised`, `arcade-panel`): stage cards, panels, answer cards.
- **Slate Violet Line** (`arcade-line`): one-pixel borders and separators.
- **Code Well** (`arcade-well`): recessed code examples and editors.
- **Soft White**, **Lavender Gray**, **Label Lavender** (`arcade-text`, `arcade-muted`, `arcade-label`): text, secondary copy, small labels.
- **Feedback grounds** (`selected-ground`, `correct-ground`, `retry-ground`): selected answer, supported claim, and "revisit" feedback. Each state also has a written heading.

**The State Has Words Rule.** Color supports a state that also has a label, number, icon, or native control state. Quest color alone never means completed or correct.

## Typography

**Display, body and labels:** Nunito (bundled variable font, weights 200 to 900, swap loading) everywhere, with Segoe UI and sans-serif fallbacks.
**Code:** ui-monospace, SFMono-Regular, Consolas.

**Character:** Rounded, heavy headings invite a short attempt; reading copy is open and roomy; labels are small, bold and sentence case. Code keeps a stable monospace rhythm.

### Hierarchy

- **Display** (`display`): page and lesson titles.
- **Headline** (`headline`): the heading of the current stage card.
- **Title** (`title`): quest and lesson card titles.
- **Reading** (`reading`): lesson prose, capped at 56ch (about 75 characters in Nunito).
- **Body** (`body`): app UI copy; the global body size.
- **Label** (`label`): small labels, stage state ("Now", "Seen"), HUD numerals use tabular figures.
- **Code** (`code`): examples in code wells.

**The Type Floor Rule.** No interface text below 12px. Older workbench sizes of 9 to 11px were raised; dense system design canvas labels keep a 11px minimum.

**The Code Stays Code Rule.** Monospace only for source, output and measured data, never as a "technical" costume.

## Layout

The shell is a 240px sidebar (190px between 761 and 1080px) and a sticky top bar holding the HUD, sound toggle, search and account link. Content is bounded at 1480px.

Lessons (TCS, beginner and interview course articles) become levels. At 1280px and wider, TCS and beginner lessons reserve a 296px right gutter for a sticky panel: robot guide with a speech bubble, the lesson map, and "Show whole lesson". The interview course shows the panel from 1600px, beside its own lesson list. Below those widths a progress strip (stage count and pips) leads the stage. On phones the strip sticks to the top and Back/Continue stick above the five-item bottom dock with safe-area clearance.

Overview pages use the width: TCS units and beginner lessons are responsive quest boards (`repeat(auto-fill, minmax(340px, 1fr))`), and start cards place the robot on the right.

**The Room To Play Rule.** Wide screens get a second column of useful game state (map, guide), never an empty margin around a narrow text column.

## Elevation & Depth

Depth is tonal: navy ground, lighter surfaces, a darker recessed code well. Pressable things carry a **pressable lower edge**, an inset 2 to 3px shadow in a darker shade of their own fill, and move down 2px when pressed. Quest tiles and stage nodes use the same edge. Cards and panels have no drop shadow; the floating guide's bubble alone has a soft ambient shadow.

**The Pressable Edge Rule.** The lower edge marks something you can press or a tile in a quest path. It is never a colored stripe on a card's side.

## Shapes

Friendly rounded rectangles: fields 10px, actions 12px, surfaces and answer cards 14px, cards 18px, stage cards 22px, quest tiles 13 to 23px. Pills (`999px`) are reserved for small controls: the HUD, its level badge, chips and the runtime tag.

## Components

### Buttons

- **Primary:** lime, dark ink, Nunito 850, 12px corners, pressable lower edge, 44px minimum (52px for stage Continue).
- **Ghost:** slate violet fill with a one-pixel line and a subtle lower edge.
- **Finish lesson:** the last stage's Continue turns honey gold.
- **Focus and disabled:** a lime 2px outline with 3px offset; disabled keeps native semantics.

### Lesson stages

`src/lesson-stages.mjs` enhances rendered lesson articles without changing their markup contracts. Each direct `<section>` is a stage; trailing details join the stage above. The current stage shows as a stage card; the rest are hidden in step mode. "Show whole lesson" restores the scrolling page and is remembered per viewer. On Continue, focus moves to the new stage heading; the progress text is a polite live region. Finishing moves focus to "Mark lesson read" (never marks it automatically). Seen stages are UI memory only, not progress records.

### Answer cards and feedback

Recognition choices are native radios inside 14px answer cards; the selected card turns lavender with a written check. Feedback cards state "This claim is supported" or "Revisit this claim" on green or warm grounds.

### HUD

`src/game-hud.mjs` renders level badge, an XP meter toward the next level, XP with a gold star, and a flame streak (lit apricot when today already has practice). It links to Quick questions and has a full spoken label. A level increase plays a fanfare after the answer's own celebration.

### Robot guide and celebrations

`src/game-fx.mjs` reacts to `tracecraft:result` events that modules emit only where correctness is already decided (TCS checks, quick questions, SQL/Python/Java checks, coach scenarios). A correct result plays a short two-note chime (sound is off by default, toggled in the top bar), a 22-piece confetti burst from the focused feedback, and a robot hop with an encouraging line. A retry plays a soft low tone and a robot tilt. The lesson panel's guide reacts in place; elsewhere a small docked guide pops in for 2.6 seconds. The guide is decorative (`aria-hidden`); the module's own feedback remains the announced result.

### Quest boards and tiles

TCS units carry a quest color (cycling six identities) on 44px numbered tiles; beginner lesson numbers sit on sky tiles. The whole card is the link target.

### Navigation

Sidebar groups use sentence-case group labels; the active item is a lavender pill. Phones keep the grouped menu and labeled bottom dock with `aria-current`.

## Do's and Don'ts

### Do:

- **Do** use lime for the next action, lavender for selection and guidance, gold for reward and finish.
- **Do** compute every XP, level and streak number from real records, and describe XP as practice.
- **Do** keep "Show whole lesson", keyboard operation, visible focus and reduced-motion behavior for every game element.
- **Do** pair every color state with words, numbers or a native control state.
- **Do** keep code in recessed monospace wells with contained horizontal scrolling.

### Don't:

- **Don't** lock lessons or stages; learners skip and repeat freely.
- **Don't** auto-mark lessons read, or award XP for viewing, scrolling or clicking Continue.
- **Don't** put uppercase tracked kickers above headings; small labels are sentence case and sit beside or below what they describe.
- **Don't** play sound unless the learner turned it on, or animate confetti and the guide under reduced motion.
- **Don't** turn practice XP, levels or streaks into claims of mastery, certification or hiring readiness.
