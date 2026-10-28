# Start practicing with TraceCraft 0.3

This alpha combines real SQL/Python practice, a two-hour daily routine, and an interactive system design lab. It runs locally with Node.js 22 or newer. There are no npm packages to install.

## Your first three steps

1. Extract the source ZIP and open a terminal in its `tracecraft` folder. Run `npm start`, then open `http://127.0.0.1:3000`. Keep the terminal running while you practice.
2. Open **Daily session**, read the assignment, and start the timer. For SQL, write the schema/query yourself, predict the rows, run it, and check fresh fixtures. Use **Python lab** for actual classes, functions, collections, and source-linked traces.
3. Open **System design**. Run the starter, select its bottleneck, change one component or connection, and check the challenge's changed workloads. Save why your change helped and what the model does not prove. Start with the cache challenge or choose **Follow one request all the way through** for a smaller first diagram.

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

Progress stays in this browser and origin. There is no application account backend or cross-device synchronization yet.

- Export daily training and SQL/Python work from **Daily session**.
- Export diagrams and design notes from **System design**. Import shows a review before replacing that workspace.
- Export original visual/interview tools from **Settings**.

These are separate backups. Keep them private if they contain personal code or notes.

## Continue development in Codex

Read [CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md) for the code map, current boundaries, focused next tasks, and a pasteable starting prompt. The highest-value missing capability is authenticated, durable progress across devices.

```bash
npm run check
npm test
npm run build
```

Python contract tests use an available local Python interpreter; inspect explicit skips on machines without one. [QA.md](docs/QA.md) records actual verification. Publication and remote branch saving are separate from this runnable source package; consult the confirmed delivery status before assuming either has completed.

## Useful guides

- [Daily plan](docs/DAILY_PLAN.md) and [developer path](docs/DEVELOPER_PATH.md).
- [System design lab](docs/SYSTEM_DESIGN_LAB.md) and [model assumptions](docs/SIMULATION_MODEL.md).
- [SQL lab](docs/SQL_LAB.md) and [Python runtime](docs/PYTHON_RUNTIME.md).
