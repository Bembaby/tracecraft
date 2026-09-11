/**
 * TraceCraft Mini-Python. A deliberately small, bounded learning interpreter.
 * This is NOT CPython and is NOT a general-purpose Python judge.
 * No eval(), Function(), imports, file access, network access, or user JS.
 */
export const LIMITS = Object.freeze({ source: 12000, lines: 160, steps: 500, ops: 50000, collection: 200 });
const clone = x => JSON.parse(JSON.stringify(x));
const truthy = x => Array.isArray(x) ? x.length > 0 : Boolean(x);
const format = x => Array.isArray(x) ? `[${x.map(format).join(', ')}]` : typeof x === 'boolean' ? (x ? 'True' : 'False') : String(x);
export { format };

export function runMiniPython(source, overrides = {}) {
  if (typeof source !== 'string' || source.length > LIMITS.source) throw new Error('Keep your program below 12,000 characters.');
  const raw = source.replace(/\r/g, '').split('\n');
  if (raw.length > LIMITS.lines) throw new Error('Keep your program below 160 lines.');
  const lines = raw.map((text, i) => {
    if (/\t/.test(text)) throw new Error(`Line ${i + 1}: use spaces, not tabs.`);
    const clean = text.split('#')[0].trimEnd();
    return { text: clean.trim(), indent: clean.length - clean.trimStart().length, line: i + 1 };
  }).filter(x => x.text);
  let pos = 0;
  function block(indent = 0) {
    const nodes = [];
    while (pos < lines.length) {
      const l = lines[pos];
      if (l.indent < indent || (l.indent === indent && l.text === 'else:')) break;
      if (l.indent !== indent) throw new Error(`Line ${l.line}: expected ${indent} spaces of indentation.`);
      pos++;
      let m;
      if ((m = l.text.match(/^for ([a-zA-Z]\w*) in (.+):$/))) {
        if (!lines[pos] || lines[pos].indent !== indent + 4) throw new Error(`Line ${l.line}: indent your loop body by four spaces.`);
        nodes.push({ kind: 'for', name: m[1], expr: m[2], body: block(indent + 4), line: l.line });
      } else if ((m = l.text.match(/^if (.+):$/))) {
        if (!lines[pos] || lines[pos].indent !== indent + 4) throw new Error(`Line ${l.line}: indent the if body by four spaces.`);
        const body = block(indent + 4); let alternative = [];
        if (lines[pos]?.indent === indent && lines[pos]?.text === 'else:') {
          pos++;
          if (!lines[pos] || lines[pos].indent !== indent + 4) throw new Error('Indent the else body by four spaces.');
          alternative = block(indent + 4);
        }
        nodes.push({ kind: 'if', expr: m[1], body, alternative, line: l.line });
      } else if ((m = l.text.match(/^print\((.+)\)$/))) {
        nodes.push({ kind: 'print', expr: m[1], line: l.line });
      } else if ((m = l.text.match(/^([a-zA-Z]\w*)\s*(\+=|-=|\*=|=)\s*(.+)$/))) {
        if (['True','False','for','if','else','print','range','len','sum','min','max'].includes(m[1])) throw new Error(`Line ${l.line}: ${m[1]} is reserved.`);
        nodes.push({ kind: 'assign', name: m[1], op: m[2], expr: m[3], line: l.line });
      } else throw new Error(`Line ${l.line}: Mini-Python supports numeric assignments, lists, for, if/else and print. Full Python needs the optional runtime.`);
    }
    return nodes;
  }
  const ast = block();
  if (pos !== lines.length) throw new Error(`Line ${lines[pos].line}: unexpected indentation or else.`);
  const env = Object.create(null), output = [], frames = [], injected = new Set();
  let operations = 0;
  const tick = () => { if (++operations > LIMITS.ops) throw new Error('Operation limit reached. Reduce the size of your input.'); };
  const number = x => { if (typeof x !== 'number' && typeof x !== 'boolean') throw new Error('This operation needs a number.'); return Number(x); };
  const bounded = x => { if (!Number.isFinite(x) || Math.abs(x) > 1e12) throw new Error('Number outside the learning runtime limits (±1e12).'); return x; };
  function expression(text) {
    let at = 0, i = 0; const tokens = [];
    const rx = /\s*(\d+(?:\.\d+)?|[a-zA-Z]\w*|==|!=|<=|>=|\/\/|[+\-*\/%<>()\[\],])/y;
    while (at < text.length) {
      if (!text.slice(at).trim()) break;
      rx.lastIndex = at; const m = rx.exec(text);
      if (!m) throw new Error(`Unsupported expression near: ${text.slice(at, at + 24)}`);
      tokens.push(m[1]); at = rx.lastIndex;
    }
    const take = t => { if (tokens[i] !== t) throw new Error(`Expected '${t}', got '${tokens[i] ?? 'end of expression'}'.`); i++; };
    const prec = { '==': 1, '!=': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, '+': 2, '-': 2, '*': 3, '/': 3, '//': 3, '%': 3 };
    function atom() {
      tick(); const t = tokens[i++]; let value;
      if (t === '-' || t === '+') value = bounded((t === '-' ? -1 : 1) * number(atom()));
      else if (t === '(') { value = expr(0); take(')'); }
      else if (t === '[') {
        value = [];
        while (tokens[i] !== ']') {
          if (value.length >= LIMITS.collection) throw new Error('List limit: 200 elements.');
          const item = expr(0); if (Array.isArray(item)) throw new Error('Mini-Python supports flat lists only.'); value.push(item); if (tokens[i] !== ',') break; i++;
        }
        take(']');
      } else if (/^\d/.test(t ?? '')) value = bounded(Number(t));
      else if (t === 'True' || t === 'False') value = t === 'True';
      else if (/^[a-zA-Z]\w*$/.test(t ?? '')) {
        if (tokens[i] === '(') {
          i++; const args = [];
          while (tokens[i] !== ')') { args.push(expr(0)); if (tokens[i] !== ',') break; i++; }
          take(')');
          if (t === 'range') {
            if (args.length < 1 || args.length > 3 || args.some(x => !Number.isInteger(x))) throw new Error('range expects one to three integers.');
            const [start, end, step] = args.length === 1 ? [0, args[0], 1] : [args[0], args[1], args[2] ?? 1];
            if (!step) throw new Error('range step cannot be zero.');
            value = [];
            for (let n = start; step > 0 ? n < end : n > end; n += step) {
              tick(); if (value.length >= LIMITS.collection) throw new Error('range limit: 200 elements.'); value.push(n);
            }
          } else if (['len', 'sum', 'min', 'max'].includes(t)) {
            if (args.length !== 1 || !Array.isArray(args[0])) throw new Error(`${t} expects one list in Mini-Python.`);
            const a = args[0];
            if (t === 'len') value = a.length;
            else if (t === 'sum') value = bounded(a.reduce((s, n) => bounded(s + number(n)), 0));
            else { if (!a.length) throw new Error(`${t} needs a non-empty list.`); value = Math[t](...a.map(number)); }
          } else throw new Error(`Function '${t}' is not available in Mini-Python.`);
        } else {
          if (!Object.hasOwn(env, t)) throw new Error(`'${t}' has not been assigned yet.`); value = env[t];
        }
      } else throw new Error(`Unexpected token '${t ?? 'end'}'.`);
      while (tokens[i] === '[') {
        i++; let index = expr(0); take(']');
        if (!Array.isArray(value) || !Number.isInteger(index)) throw new Error('Indexing needs a list and an integer.');
        if (index < 0) index += value.length;
        if (index < 0 || index >= value.length) throw new Error('List index out of range.');
        value = value[index];
      }
      return value;
    }
    function expr(minimum) {
      let left = atom(); let compared = false;
      while (prec[tokens[i]] >= minimum) {
        const op = tokens[i++], p = prec[op];
        if (p === 1 && compared) throw new Error('Use one comparison at a time in Mini-Python.');
        const right = expr(p + 1); tick();
        if (p === 1) {
          compared = true;
          const equal = (a,b) => Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v,j)=>equal(v,b[j])) : (typeof a === 'number' || typeof a === 'boolean') && (typeof b === 'number' || typeof b === 'boolean') ? Number(a) === Number(b) : a === b;
          if (op === '==') left = equal(left, right);
          else if (op === '!=') left = !equal(left, right);
          else { const a = number(left), b = number(right); left = op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b; }
        } else if (op === '+' && Array.isArray(left) && Array.isArray(right)) {
          left = [...left, ...right]; if (left.length > LIMITS.collection) throw new Error('List limit: 200 elements.');
        } else {
          const a = number(left), b = number(right);
          if (['/', '//', '%'].includes(op) && b === 0) throw new Error('Cannot divide by zero.');
          left = bounded(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : op === '//' ? Math.floor(a / b) : a - Math.floor(a / b) * b);
        }
      }
      return left;
    }
    if (!tokens.length) throw new Error('Expected an expression.');
    const result = expr(0); if (i !== tokens.length) throw new Error(`Unexpected token '${tokens[i]}'.`); return result;
  }
  const snapshot = (node, note) => {
    if (frames.length >= LIMITS.steps) throw new Error('Trace limit: 500 steps. Try a smaller input.');
    frames.push({ line: node.line, variables: clone(env), output: [...output], note });
  };
  function execute(nodes) {
    for (const node of nodes) {
      tick();
      try {
        if (node.kind === 'assign') {
          let value;
          if (node.op === '=' && Object.hasOwn(overrides, node.name) && !injected.has(node.name)) {
            const fixture = overrides[node.name];
            const valid = x => (typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= 1e12) || typeof x === 'boolean';
            if (!(valid(fixture) || (Array.isArray(fixture) && fixture.length <= LIMITS.collection && fixture.every(valid)))) throw new Error('Invalid test fixture: use bounded numbers or a flat list.');
            value = clone(fixture); injected.add(node.name);
          } else if (node.op === '=') value = expression(node.expr);
          else value = expression(`${node.name} ${node.op[0]} (${node.expr})`);
          env[node.name] = value;
          snapshot(node, `${node.name} now holds ${format(value)}.`);
        } else if (node.kind === 'print') {
          const value = expression(node.expr); output.push(format(value)); snapshot(node, `Send ${format(value)} to the output.`);
        } else if (node.kind === 'for') {
          const items = expression(node.expr);
          if (!Array.isArray(items)) throw new Error('for needs a list or range.');
          if (!items.length) snapshot(node, 'The list is empty, so skip the loop body.');
          for (const item of items) { env[node.name] = item; snapshot(node, `Next iteration: ${node.name} = ${format(item)}.`); execute(node.body); }
        } else {
          const condition = truthy(expression(node.expr));
          snapshot(node, `The condition is ${condition ? 'True' : 'False'}.`); execute(condition ? node.body : node.alternative);
        }
      } catch (error) { if (!/^Line \d+:/.test(error.message)) error.message = `Line ${node.line}: ${error.message}`; throw error; }
    }
  }
  execute(ast); return { frames, output, variables: clone(env), operations };
}

export function assess(source, challenge) {
  return challenge.tests.map(test => {
    try {
      const result = runMiniPython(source, test.input);
      const actual = result.output.at(-1) ?? '';
      return { name: test.name, passed: actual === test.expected, expected: test.expected, actual };
    } catch (error) { return { name: test.name, passed: false, expected: test.expected, actual: error.message }; }
  });
}
