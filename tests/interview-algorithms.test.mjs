import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {INTERVIEW_PYTHON_DRILLS} from '../src/interview-python-content.mjs';
import {PYTHON_HARNESS} from '../src/python-runtime.mjs';
const command=process.env.TRACECRAFT_PYTHON||(process.platform==='win32'?'python':'python3');
const available=spawnSync(command,['--version'],{encoding:'utf8'}).status===0;
test('interview algorithms agree with independent small-input oracles across deterministic variations',{skip:available?false:'Local CPython unavailable'},()=>{
  const source=INTERVIEW_PYTHON_DRILLS.map(item=>item.solution).join('\n');
  const checks=String.raw`
import random
from collections import Counter, deque
from itertools import product
rng = random.Random(1947)
for trial in range(120):
    labels = [rng.choice(["a", "b", "", "猫"]) for _ in range(rng.randrange(10))]
    assert label_counts(labels) == dict(Counter(labels))
    assert stable_unique(labels) == list(dict.fromkeys(labels))
    k = rng.randrange(7)
    counts = Counter(labels)
    assert top_labels(labels, k) == sorted(counts, key=lambda label: (-counts[label], label))[:k]
    values = [rng.randrange(-4, 5) for _ in range(rng.randrange(10))]
    target = rng.randrange(-6, 7)
    expected = next(([left, right] for right in range(len(values)) for left in range(right) if values[left] + values[right] == target), None)
    assert budget_pair(values, target) == expected
    assert smallest_events(values, k) == sorted(values)[:k]
    ordered = sorted(values)
    assert first_at_least(ordered, target) == next((i for i, value in enumerate(ordered) if value >= target), len(ordered))
    other = sorted(rng.randrange(-4, 5) for _ in range(rng.randrange(8)))
    assert merge_checkpoints(ordered, other) == sorted(ordered + other)
    best = 0
    for left in range(len(labels)):
        for right in range(left, len(labels)):
            segment = labels[left:right + 1]
            if len(set(segment)) == len(segment):
                best = max(best, len(segment))
    assert longest_unique_segment(labels) == best
    markers = "".join(rng.choice("()[]{}") for _ in range(rng.randrange(12)))
    reduced = markers
    while True:
        after = reduced.replace("()", "").replace("[]", "").replace("{}", "")
        if after == reduced:
            break
        reduced = after
    assert balanced_route(markers) == (reduced == "")
    sizes = [rng.randrange(1, 7) for _ in range(rng.randrange(5))]
    target = rng.randrange(16)
    distances = {0: 0}
    queue = deque([0])
    while queue:
        value = queue.popleft()
        for size in sizes:
            following = value + size
            if following <= target and following not in distances:
                distances[following] = distances[value] + 1
                queue.append(following)
    assert fewest_cells(sizes, target) == distances.get(target)
    nodes = [str(i) for i in range(rng.randrange(1, 6))]
    graph = {node: [other for other in nodes if rng.random() < .25] for node in nodes}
    distance = {(a, b): (0 if a == b else 1 if b in graph[a] else 999) for a in nodes for b in nodes}
    for middle in nodes:
        for a in nodes:
            for b in nodes:
                distance[a, b] = min(distance[a, b], distance[a, middle] + distance[middle, b])
    for a in nodes:
        for b in nodes:
            expected = distance[a, b] if distance[a, b] < 999 else None
            assert shortest_link_hops(graph, a, b) == expected
    bookings = []
    for _ in range(rng.randrange(7)):
        start = rng.randrange(-3, 6)
        bookings.append([start, start + rng.randrange(1, 5)])
    groups = [{i} for i in range(len(bookings))]
    changed = True
    while changed:
        changed = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                if any(max(bookings[a][0], bookings[b][0]) < min(bookings[a][1], bookings[b][1]) for a in groups[i] for b in groups[j]):
                    groups[i] |= groups[j]
                    groups.pop(j)
                    changed = True
                    break
            if changed:
                break
    expected = sorted([min(bookings[i][0] for i in group), max(bookings[i][1] for i in group)] for group in groups)
    assert merge_bookings(bookings) == expected
def make_tree(depth):
    if depth == 0 or rng.random() < .3:
        return None
    return [rng.randrange(10), make_tree(depth - 1), make_tree(depth - 1)]
for _ in range(40):
    tree = make_tree(5)
    queue = deque([(tree, 0)])
    deepest = 0
    while queue:
        node, depth = queue.popleft()
        if node is not None:
            deepest = max(deepest, depth + 1)
            queue.append((node[1], depth + 1))
            queue.append((node[2], depth + 1))
    assert tree_depth(tree) == deepest
`;
  const script=PYTHON_HARNESS+'\nprint(tracecraft_execute(_tc_sys.stdin.read()))';
  const result=spawnSync(command,['-c',script],{input:JSON.stringify({code:source,tests:checks,trace:false}),encoding:'utf8',timeout:10000,maxBuffer:1000000});
  assert.equal(result.status,0,result.stderr);const output=JSON.parse(result.stdout);assert.equal(output.passed,true,output.error||output.stderr);
});
