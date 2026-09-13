# TraceCraft
### Don’t just code. See it happen.

A local-first visual learning and interview-practice **alpha**, designed around one useful loop:

**Predict → learn → code → visualize → test → explain → revisit.**

The ambition is a beginner-to-specialist curriculum that connects programming, algorithms, databases, infrastructure, and AI systems. The current implementation is a small, working starting point—not a complete LeetCode replacement or a guarantee of employment.

The next increment focuses on real Python execution and tracing, plus a verified lesson-authoring contract.

## Start in one command

Requires Node.js 22 or newer. There are **no npm dependencies to download**.

```bash
npm start
```

Open `http://127.0.0.1:3000`. Then try **Practice lab → Run & trace → Repair a bug → Check tests → Explain it**.

```bash
npm run check   # JavaScript syntax checks
npm test        # Node test suite, including all exercise fixtures
npm run build   # Static dist/ plus a portable single-file HTML preview
```

The portable `dist/tracecraft-preview.html` can be opened in a browser. Some file viewers, browser privacy settings, speech APIs, and local-storage policies may restrict features; localhost is the recommended development path. Mobile attachment previews may show a static preview instead of running JavaScript.

## What actually works

| Area | Included in this alpha |
|---|---|
| Practice | 8 original exercises, 29 public input fixtures, deliberately broken variants, hints, original teaching notes |
| Execution | Bounded Mini-Python interpreter; editable code; source-line stepping; memory snapshots; output; replay |
| Code blocks | Keyboard-operable line reordering with indentation preserved; not full Blockly |
| Learning map | 13 stages with prerequisites, topics, outcomes, and project gates; future content explicitly marked planned |
| Systems | Original five-passage keyword retrieval demo; toy cache/capacity calculator; local row-filtering concept demo |
| Interview studio | 4 prompts, typed explanations, self-assessment; optional browser dictation and text-to-speech |
| Daily practice | 30-minute focus timer, local practice days, one-time practice XP, saved drafts, progress export |
| Reading | 12 source links; no scraped textbooks or copied question banks |
| Visual design | Responsive dark interface, original SVG illustration, visible focus states, reduced-motion preferences |
| Optional enhancement | Three.js scene and Anime.js entrance animation, loaded from a pinned CDN only after consent |

### What is deliberately not claimed

Mini-Python is **not CPython**. It supports bounded numbers/booleans, flat lists, assignments, arithmetic, comparisons, `for`, `if/else`, and selected built-ins. It has no imports, strings, functions, classes, real Python packages, or arbitrary JavaScript execution. Numbers use JavaScript’s numeric representation, and the teaching runtime materializes `range`. Trace memory is not the real Python heap.

Tests are public pedagogical examples. Passing them earns **practice** credit, not a verified mastery score; the working example is intentionally available. The roadmap is a specification, not hundreds of finished lessons. The RAG demo is **keyword retrieval without generation**. The SQL-looking example is a visualization, not an SQL engine. The studio does not grade with AI or predict interview outcomes.

There is no account system, synchronization, production backend, real code judge, Java runtime, subscription billing, provider-backed AI voice, multiplayer arena, hackathon marketplace, or live deployment yet. Three.js/Anime.js and actual microphone services require a connected environment and device-specific verification. See [QA](docs/QA.md).

## Public GitHub repository

This project is published at [github.com/Bembaby/tracecraft](https://github.com/Bembaby/tracecraft). The repository is public and the default branch is `main`.

To publish a fork or a new copy under another authenticated GitHub account:

On your own computer, install and authenticate GitHub CLI, then run:

```bash
gh auth login
npm run publish:github
```

The script creates `YOUR_AUTHENTICATED_ACCOUNT/tracecraft` with `--public`, runs checks first, and stops if that repository or an `origin` remote already exists. To choose another repository name:

```bash
bash scripts/publish-github.sh my-project-name
```

Inspect the files before publishing. Do not add exported personal progress, credentials, customer data, or private documents. Git must have an author configured to make a commit. The package's `"private": true` setting prevents accidental **npm package publication**; it does not make the GitHub repository private.

No paid hosting or AI account is provisioned. A static build can be hosted after publication. Choose deployment settings explicitly; CI currently checks source, tests, and build only.

## Repository guide

- [Research and competitive synthesis](docs/RESEARCH.md): 28 public-source platform reviews, design opportunities, limitations.
- [Product brief](docs/PRODUCT.md): learning loop, information architecture, visual direction, success criteria.
- [Curriculum](docs/CURRICULUM.md): stages, prerequisite graph, project outcomes, graduation rubrics.
- [Architecture](docs/ARCHITECTURE.md): prototype boundaries, production data model, execution isolation, trace protocol.
- [Voice and providers](docs/VOICE.md): legitimate integration paths, billing distinctions, privacy, cost controls.
- [Content and licensing](docs/CONTENT_POLICY.md): original lessons, source registry, reading rights, private uploads.
- [Build roadmap](docs/ROADMAP.md): phased implementation backlog with acceptance criteria.
- [30-minute learning plan](docs/DAILY_PLAN.md): a Python-first route toward demonstrable interview skills.
- [Quality report](docs/QA.md): completed checks and explicit untested areas.

## Technology decisions

The alpha is intentionally small: ES modules, semantic HTML, CSS, a hand-written teaching interpreter, and Node’s built-in server/test runner. Its core works without installing a framework. This makes the repository inspectable and useful immediately.

The production plan adds TypeScript, a component-based application (Next.js is a candidate), an accessible code editor, real Python/Java runtimes, PostgreSQL, queues, isolated execution, authenticated progress, and approved model-provider adapters. It does not introduce every dependency before the first learning loop is validated.

## Privacy, accessibility, and licenses

No analytics or tracking scripts are installed. Progress is local browser storage, not encrypted cloud storage. Optional browser recognition may send audio to the browser vendor’s service; transcripts are saved only by explicit action. Optional visual libraries contact jsDelivr. The app never asks for API keys, passwords, or session cookies.

Keyboard use, readable text, small-screen layouts, and reduced-motion fallbacks are design requirements. The current tests are not a WCAG certification or a security audit.

Original code, examples, instructional notes, and design assets in this repository are under the [MIT license](LICENSE), unless explicitly stated otherwise. External resources retain their own copyrights and licenses; links are not a grant to redistribute. No affiliation with named learning platforms is implied. “TraceCraft” is a working name; availability and trademark clearance have not been established.
