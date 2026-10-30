import { simulateDesign, evaluateRequirements } from './system-design-engine.mjs';

// Original teaching cases. Numbers are deliberately authored inputs, never benchmarks.
const node = (id, type, label, x, y, config) => ({ id, type, label, x, y, config });
const edges = (...pairs) => pairs.map(([from, to], index) => ({ id: `edge-${index + 1}`, from, to }));
const metric = (id, label, name, min, max) => ({ id, label, kind: 'metric', metric: name, ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }) });
const config = (id, field, min, max, label = `${id}: ${field} stays within the exercise budget`) => ({ id: `${id}-${field}`, label, kind: 'node-config', nodeId: id, field, ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }) });
const count = (type, min, max = min) => ({ id: `count-${type}`, label: `${type}: ${min === max ? min : `${min}-${max}`} component${max === 1 ? '' : 's'}`, kind: 'type-count', type, min, max });
const path = (from, to) => ({ id: `path-${from}-${to}`, label: `Connected route from ${from} to ${to}`, kind: 'path', from, to });
const maxNodes = value => ({ id: 'component-budget', label: `At most ${value} components`, kind: 'max-nodes', value });
const cleanFlow = [metric('no-failures', 'No requests are lost to overload or a broken route', 'failurePercent', 0, 0.001), metric('no-pending', 'No synchronous work is left in a queue', 'backlogMessages', 0, 0.001)];
const fullCompletion = metric('all-complete', 'At least 99.9% of offered requests complete', 'completionPercent', 99.9);
const source = (title, url) => ({ title, url });
const cacheSource = source('Microsoft: Cache-aside pattern', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside');
const lbSource = source('AWS: Application Load Balancer health checks', 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html');
const queueSource = source('Microsoft: Queue-based load leveling', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling');
const duplicateSource = source('AWS: At-least-once delivery and idempotency', 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html');
const microservicesSource = source('Microsoft: Microservices architecture trade-offs', 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices');
const limiterSource = source('Microsoft: Rate limiting pattern', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern');

function catalogGraph(hitRate = 0, appCapacity = 1200) {
  return {
    nodes: [
      node('client', 'client', 'Catalog visitors', 30, 230, { capacity: 3000, latency: 0, replicas: 1 }),
      node('gateway', 'gateway', 'API gateway', 220, 230, { capacity: 2000, latency: 4, replicas: 1 }),
      node('app', 'server', 'Catalog API', 410, 230, { capacity: appCapacity, latency: 12, replicas: 1 }),
      node('cache', 'cache', 'Product cache', 600, 230, { capacity: 1200, latency: 2, hitRate, replicas: 1 }),
      node('db', 'database', 'Catalog database', 790, 230, { capacity: 300, latency: 18, replicas: 1 }),
    ],
    edges: edges(['client', 'gateway'], ['gateway', 'app'], ['app', 'cache'], ['cache', 'db']),
  };
}
const catalogBudget = [maxNodes(5), count('cache', 1), count('server', 1), count('database', 1), count('queue', 0), count('rate-limiter', 0), config('db', 'capacity', 1, 300), config('db', 'replicas', 1, 1), config('app', 'capacity', 1, 1200), config('app', 'replicas', 1, 1), config('cache', 'capacity', 1, 1200), config('cache', 'replicas', 1, 1), config('cache', 'hitRate', 0, 80), path('client', 'app'), path('app', 'cache'), path('cache', 'db')];

function failoverGraph(connected = 1) {
  return {
    nodes: [
      node('client', 'client', 'Workout clients', 20, 240, { capacity: 2000, latency: 0, replicas: 1 }),
      node('gateway', 'gateway', 'API gateway', 200, 240, { capacity: 1200, latency: 4, replicas: 1 }),
      node('balancer', 'load-balancer', 'Healthy targets', 380, 240, { capacity: 1200, latency: 2, replicas: 1 }),
      node('app-a', 'server', 'API · A', 570, 70, { capacity: 300, latency: 15, replicas: 1 }),
      node('app-b', 'server', 'API · B', 570, 240, { capacity: 300, latency: 15, replicas: 1 }),
      node('app-c', 'server', 'API · C', 570, 410, { capacity: 300, latency: 15, replicas: 1 }),
      node('db', 'database', 'Workout database', 790, 240, { capacity: 900, latency: 12, replicas: 1 }),
    ],
    edges: edges(['client', 'gateway'], ['gateway', 'balancer'], ...['app-a', 'app-b', 'app-c'].slice(0, connected).flatMap(id => [['balancer', id], [id, 'db']])),
  };
}
const failoverBudget = [maxNodes(7), count('server', 3), count('database', 1), count('load-balancer', 1), count('cache', 0), count('cdn', 0), count('queue', 0), count('rate-limiter', 0), { id: 'server-size', label: 'Each API server stays at or below 300 requests/second', kind: 'type-config', type: 'server', field: 'capacity', min: 1, max: 300 }, { id: 'one-instance-per-node', label: 'Each server node is one independently failed instance', kind: 'type-config', type: 'server', field: 'replicas', min: 1, max: 1 }, config('db', 'capacity', 1, 900), config('db', 'replicas', 1, 1), ...['app-a', 'app-b', 'app-c'].flatMap(id => [path('balancer', id), path(id, 'db')])];

function protectedGraph(rateLimit = 800) {
  return {
    nodes: [
      node('client', 'client', 'Import clients', 30, 230, { capacity: 3000, latency: 0, replicas: 1 }),
      node('gateway', 'gateway', 'Import gateway', 220, 230, { capacity: 2000, latency: 4, replicas: 1 }),
      node('limiter', 'rate-limiter', 'Admission limit', 410, 230, { capacity: 2000, rateLimit, latency: 1, replicas: 1 }),
      node('app', 'server', 'Import API', 600, 230, { capacity: 600, latency: 12, replicas: 1 }),
      node('db', 'database', 'Write database', 790, 230, { capacity: 400, latency: 16, replicas: 1 }),
    ],
    edges: edges(['client', 'gateway'], ['gateway', 'limiter'], ['limiter', 'app'], ['app', 'db']),
  };
}
const protectedBudget = [maxNodes(5), count('rate-limiter', 1), count('database', 1), count('server', 1), count('cache', 0), count('cdn', 0), count('queue', 0), config('db', 'capacity', 1, 400), config('db', 'replicas', 1, 1), config('app', 'capacity', 1, 600), config('app', 'replicas', 1, 1), path('client', 'gateway'), path('gateway', 'limiter'), path('limiter', 'app'), path('app', 'db')];

function jobsGraph(workerReplicas = 1, bufferCapacity = 6000) {
  return {
    nodes: [
      node('client', 'client', 'Export requests', 30, 230, { capacity: 2000, latency: 0, replicas: 1 }),
      node('app', 'server', 'Export API', 220, 230, { capacity: 700, latency: 8, replicas: 1 }),
      node('queue', 'queue', 'Export job queue', 410, 230, { capacity: 700, bufferCapacity, latency: 2, replicas: 1 }),
      node('worker', 'worker', 'Export workers', 600, 230, { capacity: 180, replicas: workerReplicas, latency: 40 }),
      node('db', 'database', 'Result store', 790, 230, { capacity: 700, latency: 10, replicas: 1 }),
    ],
    edges: edges(['client', 'app'], ['app', 'queue'], ['queue', 'worker'], ['worker', 'db']),
  };
}
const jobsBudget = [maxNodes(5), count('queue', 1), count('worker', 1), count('database', 1), count('rate-limiter', 0), count('cache', 0), count('cdn', 0), config('queue', 'capacity', 1, 700), config('queue', 'bufferCapacity', 1, 6000), config('worker', 'capacity', 1, 180), config('worker', 'replicas', 1, 3), config('db', 'capacity', 1, 700), config('db', 'replicas', 1, 1), path('client', 'queue'), path('queue', 'worker'), path('worker', 'db')];

function mixedGraph(dbCapacity = 200, hitRate = 90) {
  return {
    nodes: [
      node('client', 'client', 'Session traffic', 30, 230, { capacity: 2000, latency: 0, replicas: 1 }),
      node('gateway', 'gateway', 'API gateway', 220, 230, { capacity: 1200, latency: 4, replicas: 1 }),
      node('app', 'server', 'Journal API', 410, 230, { capacity: 900, latency: 12, replicas: 1 }),
      node('cache', 'cache', 'Read cache', 600, 230, { capacity: 900, latency: 2, hitRate, replicas: 1 }),
      node('db', 'database', 'Journal database', 790, 230, { capacity: dbCapacity, latency: 18, replicas: 1 }),
    ],
    edges: edges(['client', 'gateway'], ['gateway', 'app'], ['app', 'cache'], ['cache', 'db']),
  };
}
const mixedBudget = [maxNodes(5), count('cache', 1), count('database', 1), count('server', 1), count('queue', 0), count('rate-limiter', 0), config('db', 'capacity', 1, 550), config('db', 'replicas', 1, 1), config('app', 'capacity', 1, 900), config('app', 'replicas', 1, 1), config('cache', 'hitRate', 0, 90), config('cache', 'replicas', 1, 1), path('app', 'cache'), path('cache', 'db')];

function simpleGraph(connected = false, appLatency = 18) {
  return {
    nodes: [
      node('client', 'client', 'Workout client', 70, 230, { capacity: 1000, latency: 0, replicas: 1 }),
      node('gateway', 'gateway', 'API gateway', 300, 230, { capacity: 600, latency: 6, replicas: 1 }),
      node('app', 'server', 'Workout monolith', 530, 230, { capacity: 250, latency: appLatency, replicas: 1 }),
      node('db', 'database', 'Workout database', 760, 230, { capacity: 300, latency: 12, replicas: 1 }),
    ],
    edges: edges(['client', 'gateway'], ['gateway', 'app'], ...(connected ? [['app', 'db']] : [])),
  };
}
const simpleBudget = [maxNodes(4), count('server', 1), count('database', 1), count('cache', 0), count('cdn', 0), count('queue', 0), count('rate-limiter', 0), config('app', 'capacity', 1, 250), config('app', 'replicas', 1, 1), config('db', 'capacity', 1, 300), config('db', 'replicas', 1, 1), path('client', 'gateway'), path('gateway', 'app'), path('app', 'db')];

export const DESIGN_CHALLENGES = [
  {
    id: 'catalog-cache', title: 'Give the database room to breathe', level: 'Foundation', minutes: 25,
    prompt: 'Your product catalog receives 1,000 requests each second. Nine in ten are reads. The API can handle the traffic, but the database can complete only 300 requests each second. Use the existing read cache to reduce database work without dropping requests.',
    contract: 'Keep the named client, app, cache, and db components and their directed request path. One API instance may handle at most 1,200 requests/second; one database instance at most 300. The cache may serve at most 80% of incoming reads as hits. Writes and read misses must reach the database. At least 99.9% of requests must complete for the baseline and changed traffic. No queue or rate limiter is allowed; rejecting work does not satisfy this requirement.',
    settings: { rps: 1000, readPercent: 90, durationSeconds: 30, failedNodeIds: [] },
    starter: catalogGraph(), solution: catalogGraph(80), bug: catalogGraph(80, 200),
    requirements: [fullCompletion, ...cleanFlow, ...catalogBudget],
    fixtures: [
      { id: 'all-reads', label: 'All requests are reads', settings: { rps: 1000, readPercent: 100 } },
      { id: 'half-traffic', label: 'Lower traffic, more writes', settings: { rps: 500, readPercent: 60 } },
    ],
    hints: ['Split the load into reads and writes before changing anything: 900 reads and 100 writes each second.', 'An 80% hit rate applies to the 900 reads, not to all 1,000 requests. What remains for the database?', 'The database receives 900 × 0.20 + 100 = 280 requests/second. Keep the application capable of handling all 1,000 requests because the cache sits after it.'],
    explanation: 'With an 80% read hit rate, 720 requests/second finish at the cache. The remaining 180 read misses and 100 writes reach the database, so its modeled load is 280/300. Moving a cache into the diagram does nothing until requests actually pass through it. The deliberate bug shrinks the API to 200 requests/second: the cache cannot rescue traffic already lost upstream.',
    tradeoffs: 'A real cache needs a freshness policy, invalidation behavior, and safe handling of private data. This model assumes hits are valid and does not simulate those guarantees. Explain what a catalog reader may see immediately after a price update. Do not infer a safe TTL from the simulated throughput.',
    complexity: 'Capacity calculation is constant work for this path: database rate = offered rate × ((1 − read fraction) + read fraction × (1 − hit fraction)). The graph engine follows the directed topology; the numeric capacities are exercise assumptions.',
    questions: ['Which component still sees all 1,000 requests?', 'What fails if the cache becomes cold?', 'How would a product update invalidate a cached result?'],
    sources: [cacheSource],
  },
  {
    id: 'survive-a-server', title: 'Lose a server. Keep the feature working.', level: 'Intermediate', minutes: 30,
    prompt: 'A workout API must complete 600 writes per second even when one API server is unavailable. You have three independently failed server nodes, each limited to 300 requests/second, and a database with room for 900. Wire the load balancer so one failure is survivable.',
    contract: 'Use exactly the three named server nodes app-a, app-b, and app-c, each with one replica and capacity at most 300. Keep db at one replica and capacity at most 900. The balancer must reach every server and every server must reach db. Complete at least 99.9% under normal operation and each single-server failure fixture. Up to seven nodes; no cache, CDN, queue, or rate limiter.',
    settings: { rps: 600, readPercent: 0, durationSeconds: 30, failedNodeIds: [] },
    starter: failoverGraph(1), solution: failoverGraph(3), bug: failoverGraph(2),
    requirements: [fullCompletion, ...cleanFlow, ...failoverBudget],
    fixtures: [
      { id: 'a-unavailable', label: 'API A is unavailable', settings: { failedNodeIds: ['app-a'] } },
      { id: 'b-unavailable', label: 'API B is unavailable', settings: { failedNodeIds: ['app-b'] } },
      { id: 'c-unavailable', label: 'API C is unavailable', settings: { failedNodeIds: ['app-c'] } },
    ],
    hints: ['At 600 requests/second, two healthy 300-request/second instances have enough total capacity. You need a third instance if one may fail.', 'Only load balancers split one request stream across outgoing paths. Give each healthy target its own path back to the database.', 'Test with A unavailable, then B, then C. A green baseline alone is not evidence of failover.'],
    explanation: 'Normally the balancer sends 200 writes/second to each server. When one is marked unavailable, the two remaining direct targets each receive 300. The database still sees 600 writes/second. The deliberate bug connects only two servers: it appears adequate until one of those targets fails, and it also leaves the third target disconnected.',
    tradeoffs: 'Health detection is instantaneous in this teaching model. Real systems have detection delays, in-flight requests, connection draining, and provider-specific behavior when every target is unhealthy. The database and balancer are still single modeled failure points. Three API boxes are replicas of one capability, not proof that the application is a microservices architecture.',
    complexity: 'Equal sharing gives per-target load = incoming rate / healthy direct target count. With n targets, counting healthy targets and allocating flow is O(n). Real load balancers may use different algorithms and connection behavior.',
    questions: ['What happens if two API nodes fail?', 'What still breaks when the database fails?', 'Why are these replicas rather than three business services?'],
    sources: [lbSource, microservicesSource],
  },
  {
    id: 'protect-database', title: 'Reject overload deliberately', level: 'Intermediate', minutes: 25,
    prompt: 'An import endpoint receives a burst of 1,200 writes per second. The database can safely complete 400, and a queue is out of scope for this synchronous endpoint. Protect the database with an admission limit while preserving useful throughput and counting rejected requests honestly.',
    contract: 'Keep a directed client → gateway → limiter → app → db route. The single database stays at or below 400 requests/second and the single API instance at or below 600. At baseline, complete at least 399.9 requests/second, reject no more than 800.1, and lose none to overload. At 1,000 offered requests/second, complete at least 399.9; at 150, complete all and reject none. Up to five nodes; no cache, CDN, or queue.',
    settings: { rps: 1200, readPercent: 0, durationSeconds: 30, failedNodeIds: [] },
    starter: protectedGraph(), solution: protectedGraph(400), bug: protectedGraph(200),
    requirements: [metric('useful-throughput', 'At least 399.9 writes/second complete', 'completedRps', 399.9), metric('bounded-rejection', 'At most 800.1 writes/second are deliberately rejected', 'rejectedRps', 0, 800.1), ...cleanFlow, ...protectedBudget],
    fixtures: [
      { id: 'smaller-burst', label: 'A 1,000-request/second burst', settings: { rps: 1000 }, requirements: [metric('useful-throughput', 'At least 399.9 writes/second complete', 'completedRps', 399.9), metric('bounded-rejection', 'At most 600.1 writes/second are rejected', 'rejectedRps', 0, 600.1), ...cleanFlow, ...protectedBudget] },
      { id: 'quiet-hour', label: 'A quiet 150-request/second interval', settings: { rps: 150 }, requirements: [fullCompletion, metric('no-unneeded-rejection', 'No quiet-hour requests are rejected', 'rejectedRps', 0, 0.001), ...cleanFlow, ...protectedBudget] },
    ],
    hints: ['A limit of 800 still overwhelms the 400-request/second database. Find the narrowest downstream capacity.', 'A very low limit avoids overload but throws away useful capacity. Both safety and throughput are checked.', 'Admit 400 requests/second. At the 1,200-request/second baseline, that means 400 completed and 800 deliberately rejected.'],
    explanation: 'A 400-request/second admission limit matches the database budget. The baseline has 400 completed and 800 rejected requests per second, with no overload failures. That is a 33.3% completion rate, not 100% success. The deliberate bug limits admission to 200: the database is protected, but half of its useful capacity is wasted.',
    tradeoffs: 'A real product must choose fairness rules, communicate throttling to callers, and bound retries. This model has a steady rate cap; it does not implement a token bucket, per-user quotas, burst windows, or retry timing. Discuss whether the product should accept jobs asynchronously instead of rejecting them.',
    complexity: 'For one rate limiter, admitted rate = min(offered rate, rate limit); deliberate rejection is the difference. Evaluating that arithmetic is O(1), while a production distributed limiter also has coordination and storage costs.',
    questions: ['What should the client do after a rejection?', 'Why is a 0% failure rate not the same as 100% completion?', 'When would an asynchronous job API be a better contract?'],
    sources: [limiterSource, queueSource],
  },
  {
    id: 'background-jobs', title: 'A queue is a promise to finish later', level: 'Intermediate', minutes: 35,
    prompt: 'The journal app accepts export jobs asynchronously. Normal traffic is 500 jobs per second. Each worker replica can finish 180, and you may use at most three. Keep normal work moving, absorb a ten-second worker outage, and show the unfinished work explicitly.',
    contract: 'Use client → app → queue → worker → db. The named queue admits at most 700 jobs/second and buffers at most 6,000 messages. The worker node has at most three replicas, each at most 180 jobs/second. Normal traffic must finish at least 99.9%. During a ten-second whole-worker-node outage, accept all jobs, report zero finished work and 5,000 pending messages. During a ten-second 600-job/second burst, complete at least 89.9% and keep backlog at or below 1,000. No cache, CDN, or limiter.',
    settings: { rps: 500, readPercent: 0, durationSeconds: 10, failedNodeIds: [] },
    starter: jobsGraph(), solution: jobsGraph(3), bug: jobsGraph(3, 500),
    requirements: [fullCompletion, metric('accepted', 'All jobs complete or remain durably pending in the model', 'acceptedPercent', 99.9), metric('no-job-loss', 'No jobs are lost', 'failurePercent', 0, 0.001), metric('no-job-rejection', 'No jobs are deliberately rejected', 'rejectedRps', 0, 0.001), metric('normal-backlog', 'No normal-workload backlog remains', 'backlogMessages', 0, 0.001), ...jobsBudget],
    fixtures: [
      { id: 'workers-down', label: 'All worker replicas unavailable for ten seconds', settings: { failedNodeIds: ['worker'], durationSeconds: 10 }, requirements: [metric('accepted', 'All outage jobs remain accepted', 'acceptedPercent', 99.9), metric('none-finished', 'No outage jobs are marked finished', 'completedRps', 0, 0.001), metric('five-thousand-pending', '5,000 jobs remain pending after ten seconds', 'backlogMessages', 4999.9, 5000.1), metric('no-job-loss', 'No outage jobs are lost', 'failurePercent', 0, 0.001), ...jobsBudget] },
      { id: 'short-burst', label: 'A ten-second 600-job/second burst', settings: { rps: 600, durationSeconds: 10 }, requirements: [metric('accepted', 'All burst jobs remain accepted', 'acceptedPercent', 99.9), metric('burst-completion', 'At least 89.9% of burst jobs finish', 'completionPercent', 89.9), metric('bounded-backlog', 'At most 1,000 messages remain pending', 'backlogMessages', 0, 1000), metric('no-job-loss', 'No burst jobs are lost', 'failurePercent', 0, 0.001), ...jobsBudget] },
    ],
    hints: ['One worker can finish only 180 of the 500 arriving jobs each second. How many replicas are needed to keep up?', 'An outage at 500 jobs/second for ten seconds requires room for 5,000 pending jobs, even though normal traffic leaves no backlog.', 'Three workers provide 540 jobs/second. At 600 arrivals, 60 jobs/second remain pending: 600 messages after ten seconds.'],
    explanation: 'Three 180-job/second workers provide 540 modeled completions/second, enough for the normal load of 500. With the worker node unavailable, the queue retains 500 × 10 = 5,000 jobs. At the 600-job/second burst, 540 finish each second and the queue gains 600 messages over ten seconds. The deliberate bug has only 500 buffer slots, so it cannot honor the outage acceptance contract.',
    tradeoffs: 'Acceptance and completion are different promises. The model treats pending messages as durable, but it does not prove broker durability, exactly-once effects, retry safety, or poison-message handling. Explain how the API returns a job identifier, how callers observe status, and how an idempotent worker prevents duplicate effects.',
    complexity: 'In this constant-rate window, backlog = max(0, arrival rate − completed rate) × duration, bounded by the buffer. This is O(1) arithmetic per modeled queue, not a discrete-event simulation or a prediction of queue waiting-time percentiles.',
    questions: ['How long would an outage have to last before the 6,000-slot queue fills?', 'What happens when a job is delivered twice?', 'How would you measure and drain a backlog after recovery?'],
    sources: [queueSource, duplicateSource],
  },
  {
    id: 'write-heavy-turn', title: 'A warm cache cannot complete your writes', level: 'Intermediate', minutes: 30,
    prompt: 'A journal API looks healthy while most traffic is reading old sessions. After a group workout, traffic shifts toward new writes. Keep the same small topology, size the database for the changed request mix, and prove that write-only traffic still reaches durable storage.',
    contract: 'Baseline: 800 requests/second, 90% reads. Changed workload: 800 requests/second, 40% reads. Write-only fixture: 500 requests/second, 0% reads. Complete at least 99.9% in every fixture. Keep one database at capacity no greater than 550, one API instance no greater than 900, and one cache with hit rate no greater than 90%. The write-only fixture must complete at least 499.9 requests/second at the database itself. Up to five nodes; no limiter or queue.',
    settings: { rps: 800, readPercent: 90, durationSeconds: 30, failedNodeIds: [] },
    starter: mixedGraph(), solution: mixedGraph(550), bug: mixedGraph(200),
    requirements: [fullCompletion, ...cleanFlow, ...mixedBudget],
    fixtures: [
      { id: 'after-workout', label: 'The traffic mix shifts to 60% writes', settings: { rps: 800, readPercent: 40 } },
      { id: 'all-writes', label: '500 writes/second, with no reads to cache', settings: { rps: 500, readPercent: 0 }, requirements: [fullCompletion, ...cleanFlow, ...mixedBudget, { id: 'writes-commit', label: 'The database itself completes at least 499.9 writes/second', kind: 'node-metric', nodeId: 'db', metric: 'completedRps', min: 499.9 }] },
    ],
    hints: ['At the baseline, database load is 800 × (0.10 + 0.90 × 0.10) = 152 requests/second. That explains the misleading green result.', 'With 40% reads, the database receives 480 writes plus 32 read misses each second.', 'The changed mix requires capacity for 512 database operations/second. A 550-operation/second database fits the budget; cached reads never count as committed writes.'],
    explanation: 'The 200-operation/second starter passes the read-heavy baseline because only 152 operations reach the database. It fails when writes increase: 512 operations/second need the database. Raising the assumed database capacity to 550 satisfies the authored budget, including the 500-write/second fixture. The deliberate bug is the apparently healthy read-heavy design checked without considering a changed mix.',
    tradeoffs: 'Changing a capacity field is an experiment with an assumption, not a real database upgrade. In a backend project, demonstrate any improvement with a query plan, workload measurement, schema/index change, or measured infrastructure change. Transactions, authorization, isolation, cache invalidation, and read-after-write guarantees still need implementation and tests.',
    complexity: 'The required database rate is the write rate plus read misses. This O(1) workload calculation should happen before choosing an optimization. The app makes no claim about the asymptotic cost of your real queries.',
    questions: ['Why did the original design pass the baseline?', 'What evidence would justify a real capacity increase?', 'Which read-after-write guarantee does the product actually need?'],
    sources: [cacheSource, source('MySQL: Optimizing database structure', 'https://dev.mysql.com/doc/refman/8.4/en/optimizing-database-structure.html')],
  },
  {
    id: 'request-path', title: 'Follow one request all the way through', level: 'Starter', minutes: 20,
    prompt: 'A small workout journal has one API application and one relational database. The UI sends a save request, but the application route ends before durable storage. Repair the path and keep the design small enough to explain without hiding behind extra components.',
    contract: 'Use the named client → gateway → app → db route, with one server and one database, and at most four nodes. The API instance handles at most 250 requests/second; the database handles at most 300. Complete at least 99.9% at 200 requests/second and at a 250-request/second boundary. Keep the model’s estimated completed-path mean latency at or below 60 ms. No cache, CDN, limiter, or queue. These are steady-state authored assumptions, not measured endpoint timings.',
    settings: { rps: 200, readPercent: 0, durationSeconds: 30, failedNodeIds: [] },
    starter: simpleGraph(), solution: simpleGraph(true), bug: simpleGraph(true, 120),
    requirements: [fullCompletion, ...cleanFlow, metric('latency-budget', 'Estimated completed-path mean stays at or below 60 ms', 'estimatedMeanLatencyMs', 0, 60), ...simpleBudget],
    fixtures: [
      { id: 'capacity-boundary', label: 'At the 250-request/second API boundary', settings: { rps: 250 } },
      { id: 'quiet-path', label: 'One request per second', settings: { rps: 1 } },
    ],
    hints: ['A server node is not a durable terminal in this model. Look for a missing outgoing connection.', 'Trace the request from client to gateway to application. Which node must confirm the save?', 'Connect app to db. The reference path contributes 6 + 18 + 12 = 36 ms of modeled service latency.'],
    explanation: 'The repaired path delivers every write to the database. At the 250-request/second boundary the API is fully utilized, so the model passes with no safety margin; explain why that would deserve a more cautious production target. The deliberate bug preserves the route but sets the application’s assumed processing latency to 120 ms, breaching the 60 ms exercise budget.',
    tradeoffs: 'A small application can start as a modular monolith. Extra service boundaries add calls and operational work; they should follow a concrete need such as independent ownership or deployment. This diagram does not model authentication, validation, SQL transactions, business boundaries, or actual network latency. Explain those responsibilities separately.',
    complexity: 'For this fixed chain, throughput is limited by its smallest capacity and modeled completed-path latency sums the per-node service assumptions. Both calculations are linear in the number of nodes on the path. Real queuing delay is outside this model.',
    questions: ['Who validates and authorizes a workout save?', 'When is the API allowed to report success?', 'What concrete reason would justify splitting a service out?'],
    sources: [microservicesSource],
  },
];

export function getDesignChallenge(id) {
  return DESIGN_CHALLENGES.find(challenge => challenge.id === id) ?? DESIGN_CHALLENGES[0];
}

/** Check the exact draft against public, changed workload fixtures; never mutate it. */
export function checkDesignChallenge(graph, challengeOrId) {
  const challenge = typeof challengeOrId === 'string' ? DESIGN_CHALLENGES.find(item => item.id === challengeOrId) : challengeOrId;
  if (!challenge || !Array.isArray(challenge.requirements)) throw new TypeError('Unknown design challenge.');
  const cases = [{ id: 'baseline', label: 'Baseline workload', settings: challenge.settings, requirements: challenge.requirements }, ...challenge.fixtures.map(fixture => ({ ...fixture, settings: { ...challenge.settings, ...fixture.settings }, requirements: fixture.requirements ?? challenge.requirements }))];
  const fixtures = cases.map(fixture => {
    const simulation = simulateDesign(graph, fixture.settings);
    const result = evaluateRequirements(graph, simulation, fixture.requirements);
    return { id: fixture.id, label: fixture.label, settings: fixture.settings, simulation, passed: simulation.valid && result.passed, checks: result.checks };
  });
  return {
    passed: fixtures.every(fixture => fixture.passed),
    checks: fixtures.flatMap(fixture => fixture.checks.map(check => ({ ...check, id: `${fixture.id}:${check.id}`, label: `${fixture.label}: ${check.label}`, fixtureId: fixture.id }))),
    fixtures,
  };
}

export const DESIGN_MODEL_NOTE = 'Educational estimates from your current graph and chosen assumptions. No real servers are started. This is not a benchmark, a production sizing recommendation, or an automatic assessment of architectural correctness.';
