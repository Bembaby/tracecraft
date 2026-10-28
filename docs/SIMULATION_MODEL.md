# System design model: exact behavior and limits

The System Design Lab runs an original deterministic flow model over the diagram the learner has actually edited. It does not execute infrastructure, contact cloud providers, send network traffic, or measure a real service. All capacities, service times, cache hit rates, and failures are authored assumptions.

The component animation is a view of the calculated edge flow. Simulation results come from `src/system-design-engine.mjs`; changing the graph, settings, or failures changes those results. The module is dependency-free, accepts data only, and does not use `eval` or `Function`.

## Units and outcomes

Traffic is a continuous average in requests per second. Reads and writes are tracked separately, including their accumulated service time. Fractional rates are expected. The chosen duration converts unfinished rates into a count of pending messages; it does not create a discrete-event timeline.

Every offered request is accounted for in exactly one final category:

```text
offeredRps = completedRps + rejectedRps + failedRps + queuedRps
```

| Field | Meaning |
|---|---|
| `completedRps` | Requests finished by a database or valid modeled read hit, including queued jobs finished downstream |
| `rejectedRps` | Synchronous requests deliberately rejected by a rate limiter |
| `failedRps` | Requests lost before durable queue acceptance because of capacity, a failed node, a broken path, unsupported queue reads, or a full buffer |
| `queuedRps` | Accepted writes still pending after downstream processing; this is unfinished work, not a success response proving processing completed |
| `acceptedAsyncRps` | Writes admitted to the queue, including both finished and pending jobs |
| `processedAsyncRps` | Admitted queued jobs that finished at the downstream terminal |
| `backlogMessages` | `queuedRps × durationSeconds` |
| `completionPercent` | Percentage of offered requests that finish |
| `acceptedPercent` | Percentage that finish or remain durably pending under the model's queue assumption |
| `failurePercent` | Percentage lost as failures; deliberate rejections are counted separately |
| `estimatedMeanLatencyMs` | Weighted configured service time on completed paths; `null` when no requests finish |

At zero offered load, completion and acceptance percentages are 100% by convention, with zero completed requests and no latency estimate. This represents no unsatisfied demand, not observed work.

The model deliberately does not report p95/p99 latency, uptime, CPU utilization, cloud cost, or production throughput predictions. A node's `utilization` is its processed rate divided by configured processing capacity, bounded between zero and one. It is not measured CPU usage. `demandRatio` can exceed one when offered work exceeds capacity.

## Component semantics

| Component | Implemented behavior |
|---|---|
| Clients | The single source of the selected offered rate and read/write mix; client capacity is not a processing bottleneck |
| CDN and cache | Apply processing capacity first, then complete the configured fraction of reads; all writes and remaining reads continue |
| API gateway and app server | Apply processing capacity and add configured service latency, then forward the surviving flow |
| Rate limiter | Applies its processing capacity, then deliberately rejects synchronous traffic above `rateLimit`; the limit is a steady aggregate cap, not a token-bucket implementation |
| Load balancer | Splits flow equally among directly connected targets that are not explicitly failed; one request is sent to one target, not copied to every target |
| Database | Applies capacity, completes reads, and commits writes; databases are terminal components |
| Durable queue | Accepts writes, changes their state to queued work, forwards jobs for processing, and retains unfinished jobs up to `bufferCapacity` during the selected window |
| Worker | Applies processing capacity and forwards jobs to its dependency; a worker with no terminal path does not automatically mark jobs finished |

Processing capacity is `config.capacity × config.replicas`. A failed node makes every replica represented by that node unavailable. Distinct nodes are necessary when modeling independent failures. Rate limit and queue buffer remain aggregate values rather than multiplying with replicas.

Only the load balancer detects directly failed targets. A failed database further downstream is not automatically detected by the balancer. There are no hidden retries, circuit breakers, automatic scaling, or alternate-route recovery. Real provider load balancers have specific health-check timing and fail-open policies; those must be studied separately.

Cache hit rates are assumptions, not values derived from request keys or cache contents. There is no eviction, warm-up, stale-read behavior, invalidation, write-back caching, or replication-consistency model. Every write continues to the downstream database. A cache can therefore relieve a read-heavy database while doing little for a write-heavy workload.

## Queues and finite buffers

The queue begins empty. At most one queue is allowed. Its descendants cannot merge with a synchronous branch, which keeps the model's processing and admission accounting explicit. Reads routed through the queue fail with a visible warning because the modeled contract is an asynchronous write-job API.

The engine first computes the downstream service rate under unrestricted queue admission. If unfinished work would exceed the configured buffer during the selected window, a second pass bounds admission to:

```text
completed downstream jobs/second + bufferCapacity / durationSeconds
```

The second pass recalculates node and edge flow using that admitted rate. Unequally sized worker branches behind an equal-split balancer can lose some effective completion capacity when admission falls. In that case, a bounded binary search finds the largest admission rate whose unfinished work still fits the buffer. It does not silently change the balancing algorithm to favor a faster worker. Remaining requests fail at queue admission; retained unfinished jobs remain `queuedRps`. Downstream worker overload, a downstream failed component, or a missing downstream connection leaves already accepted jobs pending rather than silently losing them.

For example, an empty queue receiving 100 writes/second with workers finishing 40, a 30-second window, and 300 buffer slots admits an average 50 writes/second. It completes 40, retains 10 per second for 300 pending messages, and fails 50 at admission. These are window-average rates, not a claim that a real queue starts rejecting exactly half of each second's arrivals from the first instant.

Failure of the queue itself fails new traffic rather than claiming durable acceptance. The model does not prove persistence, replication, broker failover, redelivery, retry fairness, poison-message handling, or exactly-once effects. It also does not model a pre-existing backlog or a recovery drain timeline.

## Latency

Each visited component adds its configured service time to the surviving read or write flow. Completed-flow latency is weighted across paths. For example, if 60 requests finish at a cache after 12 ms of configured service and 40 finish at a database after 20 ms, the reported estimated mean is `(60 × 12 + 40 × 20) / 100 = 15.2 ms`.

This excludes congestion and queue waiting, detection time, retries, network distance, serialization, locks, jitter, and cold starts. It has no latency distribution and cannot produce tail percentiles. In particular, a graph passing a service-time requirement at 100% utilization has no modeled safety margin; a learner should explain why real queueing and variability matter.

## Graph, import, and runtime bounds

Validation creates a normalized copy and never mutates the submitted graph. Unknown properties are dropped. Invalid entries are reported; safe normalized draft data is still returned so an editor can preserve and repair incomplete designs.

- At most 24 nodes and 60 edges.
- Exactly one Clients source, no incoming edges to Clients, and no outgoing edges from a database.
- No self-loops, duplicate edges, duplicate IDs, missing endpoints, or directed cycles.
- Only load balancers may have more than one outgoing edge.
- At most one queue; queued descendants cannot merge with synchronous traffic.
- IDs are 1-64 ASCII letters, numbers, underscores, or hyphens; labels are bounded to 60 characters and must be escaped by the UI.
- Capacity and rate limit: 0-1,000,000 per second. Replicas: integer 1-16. Service latency: 0-60,000 ms. Hit rate: 0-100%. Queue buffer: 0-100,000,000 messages.
- Offered load: 0-1,000,000 requests/second. Duration: 1-3,600 seconds. Coordinates are bounded data, not executable content.

The simulator traverses a directed acyclic graph using topological flow propagation. A full queue needs a second pass and, only when uneven downstream branches require it, at most 52 binary-search passes. It does not materialize individual requests, so load magnitude does not determine loop count. Validation and reachability are bounded by the small graph limits.

Disconnected components are allowed as draft state and receive no traffic. A reachable dead end loses synchronous traffic or retains already queued jobs; adding an unconnected component does not improve results. Invalid graphs return validation errors and cannot pass challenge checks.

## Public challenge checks

`evaluateRequirements(graph, simulation, requirements)` supports numerical summary and node metrics, component counts, fixed-node/type configuration budgets, maximum component count, and path reachability. Missing nodes, missing metrics, nonfinite values, unsupported checks, and invalid graphs fail. Requirements are public client-side feedback, not a secure grading service.

`checkDesignChallenge` in the content module simulates the submitted graph under a baseline and changed fixtures. A reference design must pass every fixture. Deliberate bugs include designs that pass the baseline but fail an outage or a changed read/write mix. Tests verify these authored contracts and request conservation.

Passing a challenge establishes that a diagram meets those visible model assumptions. It does not certify production architecture, system-design interview skill, or correctness of authentication, transactions, service boundaries, idempotency, or data ownership. The written explanation and a real backend experiment remain separate learning work.

## API

```js
import {
  NODE_TYPES, validateDesign, simulateDesign, evaluateRequirements,
} from '../src/system-design-engine.mjs';

const validation = validateDesign({ nodes, edges });
const result = simulateDesign(validation.graph, {
  rps: 600, readPercent: 80, durationSeconds: 30,
  failedNodeIds: ['app-a'],
});
const checks = evaluateRequirements(validation.graph, result, [
  { id: 'completion', label: 'Complete the workload',
    kind: 'metric', metric: 'completionPercent', min: 99.9 },
]);
```

Before presenting a check result after edits, the UI must invalidate or re-run it. Only the checked graph and settings support that result. Persist graph drafts and assistance records separately from computed observations.
