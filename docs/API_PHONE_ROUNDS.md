# API phone review cycles

October 29, 2026. The user requested at least 30 repeated phone simulations. This ledger records 52 actual browser review cycles: 46 passed (45 at phone widths and one desktop check), with six initial failures. Four failures were expected-wording mistakes in the test helper, corrected against observed UI. Two exposed application defects: guided inputs could retain an older model value during focus changes, and the shared toolbar overflowed at 320 pixels. Both were fixed and retested. This is not a claim that 30 distinct bugs were found.

The browser viewport overrides were 390x844, 320x568 and 1440x1000. The browser's scrollbar reduced client width to 375, 305 and 1425 respectively. Captured screenshot dimensions also reflect browser chrome/scrollbar behavior. Each cycle inspected the rendered accessibility state plus client/scroll width; actions used the browser, not native computer control. Synthetic learner progress only. The loopback harness used real verified-email authentication, the actual snapshot validator and a disposable in-memory progress store. It did not send external mail.

| Cycle | Scenario | Result | Client / document width | Finding |
|---:|---|---|---|---|
| 1 | 01. Phone entry and all nine track choices | Pass | 375 / 375 | No horizontal overflow at 390x844. Every requested family has a separate entry. |
| 2 | 02. Start from zero and optional step navigation | Pass | 375 / 375 | The first lesson starts with roles and a contract; no prerequisite lock. |
| 3 | 03. Wrong choice, explanation and corrected attempt | Initial failure | 375 / 375 | Wrong answer gives a reason; correcting earns first-correct XP once. Initial test expected a generic Correct label; actual truthful feedback is That fits the contract. Retested against observed wording. |
| 4 | 03b. Corrected choice feedback and help retained | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 5 | 04. Tap blank piece and submit with keyboard | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 6 | 05. Exact-case blank rejection | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 7 | 06. Whitespace repair without repeat XP | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 8 | 07. Resume, Unicode notes and separate read evidence | Initial failure | 375 / 375 | Test expected a notification after reload; persistent evidence is the pressed Undo read mark control. No app defect. |
| 9 | 07b. Persisted read control and literal notes | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 10 | 08. Next lesson respects track sequence | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 11 | 09. Nine deeper REST lessons | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 12 | 10. Missing prediction recovery | Initial failure | 375 / 375 | Expected string omitted your. Actual focus moves to prediction and live status explains requirement. |
| 13 | 10b. Missing prediction focus and prompt | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 14 | 11. Live model GET with generated steps | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 15 | 12. Changed target computes a different response | Initial failure | 375 / 375 | Initial assertion failed; see the immediately following correction/retest. |
| 16 | 12b. Edited path applies before focus change | Pass | 375 / 375 | Fixed guided inputs to update and validate during input, without replacing the focused field. |
| 17 | 13. Retry creation replays one result | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 18 | 14. Retry ID conflicts with changed body | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 19 | 15. Invalid JSON disables run and removes old output | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 20 | 16. Preset restores validity and stale write is rejected | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 21 | 17. Generated SOAP envelope stays readable text | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 22 | 18. Changed SOAP version produces a fault | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 23 | 19. Empty numeric field cannot silently become zero | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 24 | 20. Zero deadline is computed before run | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 25 | 21. Streaming result and synthetic timing boundary | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 26 | 22. Nullable GraphQL failure retains partial data | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 27 | 23. Unselected failed field has no resolver failure | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 28 | 24. Schema error is separate from partial execution | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 29 | 25. Webhook retry applies an event once | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 30 | 26. Disabling deduplication changes effects | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 31 | 27. Empty delivery list explains empty result | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 32 | 28. WebSocket reconnect does not invent replay | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 33 | 29. TURN path has matching optional diagram and text | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 34 | 30. Data channel does not require capture permission | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 35 | 31. Media permission fails without device prompts | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 36 | 32. SSE retention gap asks for resync | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 37 | 33. Multiline SSE retains correct framing | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 38 | 34. Five-question review separates review credit | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 39 | 35. Reviewing a correct answer adds no XP | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 40 | 36. HTTP and REST self-assessments remain separate | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 41 | 37. Reviewed account snapshot includes API evidence | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 42 | 38. Account restore retains lesson position and note | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 43 | 39. Account restore retains edited lab draft | Pass | 375 / 375 | Observed expected rendered state and no horizontal overflow. |
| 44 | 40. Small-phone lesson navigation at 320 pixels | Initial failure | 305 / 352 | Initial assertion failed; see the immediately following correction/retest. |
| 45 | 40b. Small-phone toolbar wraps without horizontal scroll | Pass | 305 / 305 | Fixed shared toolbar and 44-pixel touch targets at 320px. |
| 46 | 41. Whole lesson remains contained on smallest phone | Pass | 305 / 305 | Observed expected rendered state and no horizontal overflow. |
| 47 | 42. Unknown API page recovers to track choices | Pass | 305 / 305 | Observed expected rendered state and no horizontal overflow. |
| 48 | 43. Reduced-motion preference and keyboard access | Pass | 305 / 305 | Observed expected rendered state and no horizontal overflow. |
| 49 | 44. Desktop track overview and navigation | Pass | 1425 / 1425 | Observed expected rendered state and no horizontal overflow. |

| 50 | 45. Reviewer regression: another control cannot bypass empty numeric input | Initial failure | 305 / 305 | Empty deadline remains invalid after toggling cancellation; previous valid saved draft is kept separately. Test expected a field name in a general validation error. Actual disabled state is correct. |
| 51 | 45b. Empty numeric stays blocked across unrelated edits | Pass | 305 / 305 | Observed expected rendered state and no horizontal overflow. |
| 52 | 46. Corrected numeric input recovers current cancellation | Pass | 305 / 305 | Observed expected rendered state and no horizontal overflow. |

## Independent review correction

The fresh reviewer found one further material edge case: clearing a numeric field and editing another guided control could restore the previous number. Invalid in-memory numeric input is now retained separately from the last valid saved draft. A controller regression and actual 320-pixel interaction show Run stays disabled across the unrelated edit, then recovers to the current CANCELLED outcome after entering 25 ms. The two final passing cycles record that exact retest.

## Additional authoring corrections

Before the phone loop, authoring validation found 15 fill-blank exercises whose code lacked a visible blank slot. They now render the actual missing slot. Model tests added empty-delivery explanations, XML operation-name validation and explicit empty/edge fixtures. HTTP and REST checkpoints now have distinct records despite sharing a request lab. Unsupported palette names, a nonexistent CSS variable and undersized inline blank targets were corrected. Model case labels distinguish saved/edited input from the original preset. These are authoring and automated-test findings, not invented phone cycles.

## Evidence limits

The source-level DOM startup test is separate from rendered browser QA. Protocol models are not real service integrations. Full snapshot validation and loopback reviewed save/restore cover API records; live production account infrastructure is verified separately in QA. No physical phone, mobile keyboard device or screen reader was available for this increment. Reduced decorative motion and visible keyboard focus were checked in the browser. Saved notes containing Unicode and literal HTML remained text after reload and account restore.

Final captures: [desktop overview](screenshots/api-adventure-desktop.png), [phone lesson](screenshots/api-adventure-phone.png), [phone answer state](screenshots/api-answer-phone.png), [small-phone lab](screenshots/api-lab-small-phone.png). Browser screenshots returned JPEG bytes; these were decoded and saved as actual PNG without altering the visual content. Only valid final captures were passed to the independent reviewer.
