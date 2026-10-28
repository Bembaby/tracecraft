# System design lab

TraceCraft's system design lab is an editable, local teaching model. It follows the diagram you build, calculates flow through its actual connections, and checks your design against public workload variations. It does not start servers, benchmark a database, or automatically judge whether a production architecture is correct.

Open **System design** or the `#design` route after starting the app. A diagram, the numeric controls, and the results table describe the same model. No subscription or API key is needed.

## A useful practice loop

1. Read the requirement and its capacity budget. Before running anything, predict the first bottleneck and how much traffic will reach it.
2. Run the starter. Follow one request from its source to a cache hit, database completion, deliberate rejection, failure, or unfinished queued job.
3. Change one assumption or connection. State the expected effect, then run or inspect the updated result.
4. Check the challenge. Checks restore the authored baseline and changed workloads for evaluation; your exploratory traffic sliders do not make a difficult fixture disappear.
5. Explain the behavior in your own words. Name one guarantee the simulation does not provide. View a hint or example when useful, then return later for a fresh attempt.

The reference solution is one worked example. A passing result is evidence for the model's listed requirements, not a certification, production approval, or hiring score. The app records in-app help, but it cannot detect every outside source of assistance.

## Six original challenges

| Challenge | What you change | Evidence the checks require |
|---|---|---|
| Give the database room to breathe | Read-cache hit rate and the request path | All offered work completes within the fixed API/database budget, including a changed read/write mix |
| Lose a server. Keep the feature working. | Connections between a balancer, three API instances, and a database | Normal traffic and each single-server outage still complete |
| Reject overload deliberately | Admission limit before a bounded write database | Useful throughput is preserved; excess requests count as rejected, with no hidden overload losses |
| A queue is a promise to finish later | Worker replicas and finite queue space | Normal completion, ten-second outage acceptance, and bounded burst backlog remain distinct |
| A warm cache cannot complete your writes | Database capacity within an explicit budget | A write-heavy variation and a write-only fixture reach the database successfully |
| Follow one request all the way through | A missing connection and a simple path's service-time assumptions | Every write reaches the database and the authored latency budget is met |

Each challenge contains an exact contract, starter graph, reference graph, deliberate bug, hints, original reasoning, trade-offs, a complexity explanation, primary references, and changed fixtures. Reference graphs pass every listed fixture; deliberate bugs are checked to fail. See `tests/system-design.test.mjs` for the reproducible regression cases.

## Controls

- Select a component to edit its label, capacity, assumed service latency, replica count, and type-specific settings in the inspector. Only applicable settings appear.
- Move a focused component with the arrow keys in 10-unit increments; hold Shift for 30-unit increments. Dragging offers the same movement operation.
- Create a connection through the inspector's target selector and connection button. The connection table provides a named Remove action, so drawing is optional.
- Use the canvas or table view. The table includes input, completed, failed, and queued rates plus directed connections.
- Run with the button or Ctrl/Cmd + Enter. Escape cancels a connection selection. Undo/redo retains up to 40 edits during the current session.
- After the first run, changes to traffic, failure settings, configuration, and topology update the modeled result. A functional edit clears the old challenge result so a previous pass cannot masquerade as a check of the new design.

Animation is optional presentation of the computed flow. It is not a recording of real requests and does not supply a separate source of truth. Reduced-motion preferences must remain respected.

## Read the numbers honestly

The accounting identity is:

```text
offered requests/second
  = completed requests/second
  + deliberately rejected requests/second
  + failed requests/second
  + durably pending requests/second
```

“Completed” includes work finished downstream of a queue. “Accepted” includes both completed work and work still pending in the modeled durable queue. A rate limiter can protect the database while reducing the overall completion percentage. An empty worker pool can leave all jobs accepted and none completed.

For the constant-rate window used here:

```text
pending messages = pending requests/second × window duration
```

The queue starts empty for each simulation. Extending the window means a longer constant workload, not advancing an event log. A later run does not carry an earlier run's backlog forward.

The displayed estimated mean completion latency sums configured service times along completed paths and weights them by completed flow. It excludes congestion, queue waiting, jitter, distance, and latency percentiles. A number such as 36 ms is an arithmetic consequence of the settings, not a measured response time or a p99 promise. When nothing completes, there is no completed-path mean.

The precise engine behavior, supported graph shapes, validation bounds, and API are documented in [SIMULATION_MODEL.md](SIMULATION_MODEL.md).

## What to explain beyond the graph

A cache's modeled hit rate does not establish freshness. Discuss invalidation, private data, and what a user sees after a write. The [cache-aside reference](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) is a starting point for that separate design question.

Replicated API instances are not automatically independent business services. For a small workout product, explain the application's modules, ownership, and transaction boundaries before arguing for a service split. The [microservices architecture reference](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices) describes boundaries and operating costs that a flow graph does not certify.

Queue acceptance also needs a real delivery contract. The [queue load-leveling reference](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling) and [SQS duplicate-delivery reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html) support follow-up questions about durability, duplicates, and idempotent effects. Those mechanisms are discussion prompts here, not simulated implementations.

Use the existing **Design discussions** section for deeper written answers about service boundaries, timeouts, retries, outbox delivery, stale data, and ownership. Its rubric remains self-assessed.

## Fit this into the two-hour routine

During the systems weeks, use the 25-minute project/debug block for one focused graph experiment:

| Minutes | Work |
|---|---|
| 0–5 | State the requirement and predict the baseline bottleneck |
| 5–15 | Change one design decision and inspect a failure case |
| 15–20 | Check the authored fixtures; repair one failed requirement |
| 20–25 | Save an explanation and a question to test in real code |

Use the existing ten-minute explanation block to defend the decision aloud. Keep the SQL/Python writing block in the routine when those fundamentals still need practice. A diagram is additional practice; it does not replace writing and debugging working code.

For a longer 30–35 minute challenge, spread it across two sessions or explicitly reallocate part of the main practice block. The daily plan still totals 120 minutes, including the ten-minute break.

## Bridge the model to a real backend

Pick one modeled assumption and produce evidence in a local Java/Spring and MySQL learning project. For example:

- Replace an assumed database capacity change with an actual query, an `EXPLAIN` plan, and a measured before/after workload.
- Replace an assumed completed write with a transaction, constraint tests, and a verified committed row.
- Replace assumed cache correctness with a write-then-read test that asserts the product's freshness rule.
- Replace assumed queue durability with job status, retry handling, and a test proving duplicate delivery does not duplicate a business effect.

These are local project tasks, not actions performed by clicking Run in the browser lab.

## Saved work and backups

System design state is stored under `tracecraft:system-design:v1`. It retains per-challenge draft graphs, exploratory settings, notes, help records, and the latest 100 checks. It does not synchronize across browsers or devices.

Use the lab's own export/import controls. Backups use format `tracecraft-system-design`, version 1, and a 2 MB import limit. Import validates the file and displays a concrete review before replacing the design workspace. Notes and graphs may contain personal information; keep backups private unless you choose to share them.

This store is separate from both `tracecraft:training:v1` and the original `tracecraft:v1`. Exporting the daily-learning workspace does not automatically export system design work. Undo/redo history is session-only and is not a durable backup.

## Authoring contract

`src/system-design-content.mjs` exports `DESIGN_CHALLENGES`, `getDesignChallenge(id)`, and `checkDesignChallenge(graph, challengeOrId)`. A challenge defines:

- Identity and presentation: `id`, `title`, `level`, `minutes`, `prompt`.
- Exact evaluation: `contract`, `settings`, `requirements`, `fixtures`.
- Graphs: `starter`, `solution`, `bug`.
- Teaching: `hints`, `explanation`, `tradeoffs`, `complexity`, `questions`, `sources`.

Fixture `settings` override the challenge settings. Omitted fixture requirements reuse the baseline requirements; supplied requirements replace them completely. `checkDesignChallenge` evaluates the baseline plus every fixture, returning aggregate `passed`, flattened labeled `checks`, and each fixture's result and simulation. It does not mutate the submitted graph.

Keep new content original. Avoid encoding a single preferred picture when several designs satisfy the requirement. Use numerical behavior checks and only the topology/configuration constraints needed to preserve the scenario's stated budget and semantics. Test that the reference passes and that the deliberate bug fails for the intended reason, including changed workloads.
