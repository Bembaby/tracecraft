# Contributing

Start with a small issue that has observable acceptance criteria. A contribution should improve understanding, not just add screens.

Use Node 22+, run `npm test`, and build with `npm run build`. No npm dependency install is needed for the current core. Browser tests require Python Playwright and Chromium; see tests/browser_smoke.py.

For an exercise, supply: original prompt; prerequisites; input/output contract; worked explanation; an invariant where relevant; trace interpretation; at least one revealing edge case; deliberate failing implementation; reference implementation; complexity; explanation rubric; source links and license status. All public tests must pass on the reference and at least one must fail on the deliberate bug.

For a visualization, specify what each position, color, label, and motion means. Provide equivalent text and controls operable by keyboard. Avoid using 3D when a two-dimensional table communicates better. Test zoom and reduced motion.

Do not submit copied interview questions or textbook excerpts without documented redistribution rights. A public URL or a paid subscription does not by itself grant permission. Do not include secrets or personal progress exports.

Before merging, attach test output, screenshots for visible changes, and an explicit list of untested behavior. No implied quality certification. Architecture changes need a short decision record explaining the alternatives and the trade-off.
