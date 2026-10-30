# Start the API adventure

Sign in at [tracecraft.dev/#apis](https://tracecraft.dev/#apis) and choose **HTTP from zero**. Each lesson gives one idea, a worked example, a choice, a blank, a debugging question and your explanation. Then try **REST and resource APIs**. The other seven families remain available at any time. Use **Daily review** for five recall questions and **Request labs** to change a message and inspect the computed result. Complete the separate real-project checkpoint when you are ready. Account & sync lets you review the saved copy before enabling autosave. See [the complete map](docs/API_ADVENTURE.md).

# Begin with the new learning path

After verified sign-in, open **Start here**. If you have never written code, choose **Beginner lessons**, then Python lesson 1. It explains code, running a program and output before the first task. You can also choose SQL or Java from the language selector.

Read, try the linked task, use a hint if needed, and explain one thing you learned. **Run** shows behavior; **Check my answer** compares it with the requirement. Python, SQL and Java run here in browser workers. Java lab prepares Main.java and the compiler, so no JDK installation or file download is needed. Short Java reading questions remain optional. Read marks and checked code remain separate. **Practice library** explains the other tools, **Interview preparation** follows the basics, and **Mock interviews** rehearses the whole conversation.

Choose **Personal practice** for one recommended next task, the six-part diagnostic, a focused opening sequence, your private mistake notebook, and delayed reviews. You can choose Learn, Practice or Interview mode and request only the help level you want. Use **Walking** for one question with optional browser read-aloud and editable text. Writing and speaking remain self-assessment; no transcription or AI grading is implied. Your private profile, diagnostic and corrections use the existing reviewed account backups.

The older working notes below remain useful for the daily/project tools.

**TCS path** is available in the main navigation and Start here. Follow its 25 lessons to study the requested coding, SQL, Git, HTTP, security, AI and flow-tracing topics. Read one explanation, predict the example, check a claim and attempt its linked runnable task. Your notes and place save with existing progress and reviewed backups. Use the beginner links whenever a prerequisite is unfamiliar.

# Start practicing with TraceCraft 0.3

This alpha combines a beginner arcade, an interview course, real SQL/Python practice, a two-hour routine and an interactive system design lab. The hosted edition requires an expiring email sign-in code and remembers your session. Local development requires Node.js 22.13 or newer and `npm ci`.

## Your first three steps

1. Open [tracecraft.dev](https://tracecraft.dev), enter your email and use the single-use code within five minutes. In **Account & sync**, review which copy to continue and enable autosave. For local development, run `npm ci` and `npm start`; the configured same-origin email account service is also required. See [account setup](docs/PROGRESS_SYNC.md).
2. Start with **Play & learn** if the ideas are new, then open **Interview course**. The default covers backend and frontend/full-stack. Read one lesson, predict an example, attempt a linked Python or SQL drill, check its edge fixtures and save your explanation. Reading and recognition are separate from writing a passing program.
3. Use **Daily session** to sustain the routine. Open **System design** during systems work, edit a component or connection and check changed workloads. After independent coding practice, try a mock interview and save the unfinished gaps as well as successes.

If port 3000 is busy, use `npm start -- --port 3001` and open that port instead. Opening the HTML through `file://` is unsupported; serve the whole directory. SQL assets ship with the app. The first enabled Python run downloads its pinned runtime from jsDelivr.

## Keep the daily routine simple

| Minutes | Work |
|---|---|
| 10 | Recall without notes |
| 15 | Learn one small concept |
| 45 | Write and test |
| 10 | Break |
| 25 | Build a project step or investigate a failure |
| 10 | Explain the decision and a trade-off |
| 5 | Save evidence and tomorrow's exact starting task |

The session totals 120 minutes including the break. The timer pauses when the page is hidden; elapsed time alone does not complete an assignment. Use the system design lab in the project/debug block during systems practice, while continuing to write SQL and code independently.

**SQL lab executes SQL. System design calculates a teaching model.** Its graph controls start no real servers, and its capacities/timings are assumptions. Later MySQL administration and Java/Spring assignments run in your own local project. The original **Visual debugger** remains a separate Mini-Python teaching subset.

## Back up your work

Drafts stay in this browser and origin. After explicit starting-copy review, account autosave carries a complete snapshot between signed-in browsers and stops for conflicts. Download a private backup as well.

- Export all three workspaces together from **Account & sync**.
- Export daily training, course reflections, rehearsals and SQL/Python work from **Daily session**.
- Export diagrams and design notes from **System design**. Import shows a review before replacing that workspace.
- Export original visual/interview tools from **Settings**.

The workspace-specific exports are separate backups. Keep all backups private if they contain personal code or notes.

## Continue development in Codex

Read [CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md) for the code map, current boundaries and next verification tasks. Preserve required email authentication and durable user-owned progress.

```bash
npm run check
npm test
npm run build
```

Python contract tests use an available local Python interpreter; inspect explicit skips on machines without one. [QA.md](docs/QA.md) records actual verification. Publication and remote branch saving are separate from this runnable source package; consult the confirmed delivery status before assuming either has completed.

## Useful guides

- [Daily plan](docs/DAILY_PLAN.md) and [developer path](docs/DEVELOPER_PATH.md).
- [Interview course](docs/INTERVIEW_COURSE.md), with coverage, rehearsals and project evidence boundaries.
- [System design lab](docs/SYSTEM_DESIGN_LAB.md) and [model assumptions](docs/SIMULATION_MODEL.md).
- [SQL lab](docs/SQL_LAB.md) and [Python runtime](docs/PYTHON_RUNTIME.md).
