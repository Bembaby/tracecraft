export const challenges = [
  {
    id:'running-total', title:'The running total', topic:'Loops & state', level:'Foundation', minutes:12,
    description:'A delivery team logs packages for each stop. Add every count into total, then print the final total. Empty input must produce zero.',
    code:'packages = [3, 1, 4, 2]\ntotal = 0\nfor count in packages:\n    total = total + count\nprint(total)',
    bug:'packages = [3, 1, 4, 2]\ntotal = 0\nfor count in packages:\n    total = count\nprint(total)',
    hint:'A running total must keep its old value and add the current item. What happens when you overwrite total instead?',
    explain:'Explain why total starts at zero, what changes on each iteration, and the time and extra-space complexity. What happens with an empty list?',
    complexity:'O(n) time · O(1) auxiliary space (excluding the teaching trace)',
    lesson:[
      ['The idea','An accumulator remembers a result while a loop moves through a collection. Here, packages is the input list, count is the current item, and total is the accumulated result. Those three roles are different.'],
      ['Read the state','Before the loop, total is zero. After processing 3, it is 3. After 1, it is 4. After 4, it is 8. After 2, it is 10. The visualizer shows the state AFTER the highlighted operation.'],
      ['Why it works','The invariant is: after k iterations, total equals the sum of the first k items. It is true for zero items because the empty sum is zero. Each iteration adds exactly the next item, preserving the invariant.'],
      ['From code to interview','State the invariant in plain English before discussing complexity. We visit each of n items once. The algorithm keeps only a running number and a current item; the input list and visual trace are not part of auxiliary algorithm space.'],
      ['Try a counterexample','Change total = total + count to total = count. Predict the result before running. Then use an empty list and a list containing negative values. A solution that only works for the displayed example is not yet general.']
    ],
    tests:[{name:'Normal route',input:{packages:[3,1,4,2]},expected:'10'},{name:'No stops',input:{packages:[]},expected:'0'},{name:'One stop',input:{packages:[7]},expected:'7'},{name:'Corrections',input:{packages:[4,-2,6]},expected:'8'}]
  },
  {
    id:'ticket-cost',title:'Price the tickets',topic:'Variables & expressions',level:'First steps',minutes:8,
    description:'Compute total cost for quantity tickets at price each. Print the result. The input names price and quantity are replaced in each test.',
    code:'price = 12\nquantity = 3\ntotal = price * quantity\nprint(total)',
    bug:'price = 12\nquantity = 3\ntotal = price + quantity\nprint(total)',
    hint:'One ticket costs price. Two tickets cost price + price. Which operation repeats that addition quantity times?',
    explain:'What is the difference between a variable name, its value, and an expression? Why do we multiply price and quantity?',
    complexity:'O(1) operations in this bounded numeric model',
    lesson:[['Names and values','A variable name refers to a value. Assigning price = 12 makes that name available to later expressions. The equals sign in an assignment means “evaluate the right side, then bind the left name.”'],['Evaluation order','When total = price * quantity runs, look up price and quantity, multiply their values, then bind total to the result. This is not a live spreadsheet formula: changing price later does not automatically recompute total.'],['A useful mental model','Picture names as labels and values as things those labels point to. A box is a useful introductory drawing, but real Python has objects, references, and mutable collections. This introductory runtime only models numbers and lists.'],['Check your understanding','Try quantity = 0. Try price = 5 and quantity = 4. Explain what value total has at every step without pressing Run.']],
    tests:[{name:'Three tickets',input:{price:12,quantity:3},expected:'36'},{name:'Zero tickets',input:{price:12,quantity:0},expected:'0'},{name:'Four tickets',input:{price:5,quantity:4},expected:'20'}]
  },
  {
    id:'count-alerts',title:'Count the alerts',topic:'Conditions & loops',level:'Foundation',minutes:12,
    description:'Count readings strictly above threshold. Print the count, not the sum of the readings. A reading equal to threshold is not an alert.',
    code:'readings = [18, 32, 21, 45]\nthreshold = 30\nalerts = 0\nfor reading in readings:\n    if reading > threshold:\n        alerts = alerts + 1\nprint(alerts)',
    bug:'readings = [18, 32, 21, 45]\nthreshold = 30\nalerts = 0\nfor reading in readings:\n    if reading >= threshold:\n        alerts = alerts + 1\nprint(alerts)',
    hint:'Check the exact boundary in the prompt. Should a reading equal to threshold count?',
    explain:'Walk through the branch decisions. Distinguish counting matching elements from adding their values. Describe an important boundary test.',
    complexity:'O(n) time · O(1) auxiliary space',
    lesson:[['Decisions inside repetition','A loop visits each reading. The if statement decides whether this particular reading should affect the answer. Indentation identifies which operation belongs to the condition.'],['Strict boundaries','“Above” means greater than, not greater than or equal to. The distinction matters exactly at the boundary. Testing only values far from the threshold hides this bug.'],['Counting versus summing','alerts increases by one because it counts events. Adding reading instead would measure a different quantity. Naming variables after what they mean helps catch this mistake.'],['Explain the invariant','After k readings, alerts equals the number of the first k readings that exceed threshold. The next comparison either adds one matching event or leaves that count unchanged.']],
    tests:[{name:'Mixed readings',input:{readings:[18,32,21,45],threshold:30},expected:'2'},{name:'Exact boundary',input:{readings:[30,30,31],threshold:30},expected:'1'},{name:'Empty sensor log',input:{readings:[],threshold:10},expected:'0'},{name:'Negative threshold',input:{readings:[-8,-1,2],threshold:-2},expected:'2'}]
  },
  {
    id:'largest-reading',title:'Find the highest reading',topic:'Loop invariants',level:'Foundation',minutes:12,
    description:'Print the largest value in a non-empty readings list. Values may all be negative. You may assume at least one reading exists.',
    code:'readings = [8, 3, 12, 5]\nbest = readings[0]\nfor reading in readings:\n    if reading > best:\n        best = reading\nprint(best)',
    bug:'readings = [8, 3, 12, 5]\nbest = 0\nfor reading in readings:\n    if reading > best:\n        best = reading\nprint(best)',
    hint:'Zero is not necessarily in the input. Initialize best using a value that actually exists in the list.',
    explain:'Why is zero an unsafe initial maximum? State the input contract and explain what would need to change to allow empty lists.',
    complexity:'O(n) time · O(1) auxiliary space',
    lesson:[['A candidate answer','Keep a candidate called best. After each comparison it should be the largest reading processed so far. Start with the first input value so your candidate is valid even when every reading is negative.'],['Contracts matter','This exercise explicitly promises a non-empty list. A general API still needs an empty-input policy, such as returning None or raising an exception. Do not silently invent a maximum of zero.'],['Redundant but clear','The beginner version also compares the first element with itself. That extra comparison is harmless and preserves linear complexity. Simpler reasoning is often more valuable than removing one constant-time operation.'],['An interview explanation','Separate the proof from the implementation detail: a better candidate replaces best; otherwise the existing candidate remains correct. Include a test with only negative values.']],
    tests:[{name:'Mixed input',input:{readings:[8,3,12,5]},expected:'12'},{name:'All negative',input:{readings:[-9,-2,-5]},expected:'-2'},{name:'Single reading',input:{readings:[6]},expected:'6'},{name:'Duplicates',input:{readings:[7,7,7]},expected:'7'}]
  },
  {
    id:'weighted-score',title:'Weight the scores',topic:'Indexing & parallel lists',level:'Practice',minutes:14,
    description:'Multiply each score by its matching weight and add those products. Print the weighted sum. Lists have equal lengths, and may be empty.',
    code:'scores = [5, 8, 4]\nweights = [2, 1, 3]\ntotal = 0\nfor i in range(len(scores)):\n    total = total + scores[i] * weights[i]\nprint(total)',
    bug:'scores = [5, 8, 4]\nweights = [2, 1, 3]\ntotal = 0\nfor i in range(len(scores)):\n    total = total + scores[i] + weights[i]\nprint(total)',
    hint:'The contribution of one item is a product. Then combine contributions with addition.',
    explain:'How does the index connect two lists? What input validation would a production implementation require?',
    complexity:'O(n) time · O(1) auxiliary algorithm space; Mini-Python materializes range',
    lesson:[['Position carries meaning','scores[i] and weights[i] describe the same item. The index is the connection between the collections. Accidentally shifting one index corrupts that relationship.'],['Break down the expression','First multiply one score and its weight. Then add that contribution to total. Multiplication has higher precedence, but parentheses can make the intent even clearer.'],['Input contract','Equal lengths are guaranteed here. In a production API, validate the contract or choose a data structure that stores each score with its weight. Empty lists naturally produce zero.'],['Runtime versus algorithm','Real Python range is not a materialized list. This small teaching interpreter materializes ranges with a strict limit. Do not infer Python implementation details from this miniature runtime.']],
    tests:[{name:'Sample weights',input:{scores:[5,8,4],weights:[2,1,3]},expected:'30'},{name:'No items',input:{scores:[],weights:[]},expected:'0'},{name:'Zero weights',input:{scores:[9,8],weights:[0,0]},expected:'0'},{name:'One item',input:{scores:[7],weights:[3]},expected:'21'}]
  },
  {
    id:'count-evens',title:'Find the even counts',topic:'Remainders & conditions',level:'Practice',minutes:10,
    description:'Count how many values in counts are even, including zero and negative even numbers. Print the count.',
    code:'counts = [3, 4, 0, 7, 8]\neven = 0\nfor count in counts:\n    if count % 2 == 0:\n        even = even + 1\nprint(even)',
    bug:'counts = [3, 4, 0, 7, 8]\neven = 0\nfor count in counts:\n    if count % 2 != 0:\n        even = even + 1\nprint(even)',
    hint:'An even integer leaves a remainder of zero when divided by two.',
    explain:'Explain what modulo measures and why zero qualifies as even. Show how your tests distinguish even from odd.',
    complexity:'O(n) time · O(1) auxiliary space',
    lesson:[['Remainders as a test','The expression count % 2 is the remainder when dividing by two. An even integer has no remainder. This turns a mathematical property into a Boolean branch.'],['Count the events','The algorithm adds one for each even value; it does not add the value itself. Zero is divisible by two, so it belongs in the count. Negative even values also qualify.'],['Find revealing tests','A list with the same number of even and odd items can hide an inverted condition. Include all-even, all-odd, empty, and mixed-sign inputs.']],
    tests:[{name:'Includes zero',input:{counts:[3,4,0,7,8]},expected:'3'},{name:'All even',input:{counts:[2,4,6]},expected:'3'},{name:'Negative values',input:{counts:[-4,-3,-2]},expected:'2'},{name:'Empty list',input:{counts:[]},expected:'0'}]
  },
  {
    id:'prefix-totals',title:'Keep every running total',topic:'Lists & transformations',level:'Practice',minutes:14,
    description:'Build a list containing the running sum after each input item. Print the list. This learning runtime supports list concatenation with +.',
    code:'values = [2, 5, 1]\ntotal = 0\nprefix = []\nfor value in values:\n    total = total + value\n    prefix = prefix + [total]\nprint(prefix)',
    bug:'values = [2, 5, 1]\ntotal = 0\nprefix = []\nfor value in values:\n    total = total + value\n    prefix = prefix + [value]\nprint(prefix)',
    hint:'Store the accumulated total, not just the current input value.',
    explain:'How does a prefix sum differ from one final sum? Why is repeatedly concatenating lists less efficient than append in real Python?',
    complexity:'This concatenation implementation: O(n²) copying · O(n) output space',
    lesson:[['Remember intermediate results','A final sum compresses the whole input into one number. A prefix sum keeps the accumulated result at every position. For [2, 5, 1], the results are [2, 7, 8].'],['Choose what to store','After updating total, add that total to the result list. Adding value would merely copy the original input, which is a different transformation.'],['Notice the hidden cost','prefix + [total] creates a new list each iteration and copies the existing prefix. The total amount of copying grows quadratically. In real Python, appending to a list gives amortized constant-time growth per item.'],['Where this leads','A prefix array can answer range-sum queries without resumming every element. The later algorithms track will derive that relationship, its indexing convention, and the empty-prefix sentinel.']],
    tests:[{name:'Three values',input:{values:[2,5,1]},expected:'[2, 7, 8]'},{name:'Empty list',input:{values:[]},expected:'[]'},{name:'Corrections',input:{values:[3,-1,4]},expected:'[3, 2, 6]'}]
  },
  {
    id:'capacity-check',title:'Respect the capacity',topic:'If / else',level:'First steps',minutes:8,
    description:'Print 1 when requested seats fit within capacity, otherwise print 0. Equal capacity is allowed.',
    code:'requested = 6\ncapacity = 8\nif requested <= capacity:\n    allowed = 1\nelse:\n    allowed = 0\nprint(allowed)',
    bug:'requested = 6\ncapacity = 8\nif requested < capacity:\n    allowed = 1\nelse:\n    allowed = 0\nprint(allowed)',
    hint:'Filling the last available seat is still allowed. Include equality in the comparison.',
    explain:'Explain how the two branches cover the input cases. Which test exposes an off-by-one comparison mistake?',
    complexity:'O(1) time · O(1) space',
    lesson:[['Two possible paths','An if/else chooses exactly one branch. When requested fits, allowed becomes one. Otherwise it becomes zero. The print after the branches runs in both cases.'],['Translate the rule precisely','“Within capacity” includes equality. A strict less-than condition rejects a completely full but valid booking. Convert the wording into an explicit mathematical condition.'],['Test the edge','Use requested one below, exactly equal to, and one above capacity. These three cases tell you more about the boundary than many random examples. Negative inputs are outside this exercise’s contract.']],
    tests:[{name:'Seats available',input:{requested:6,capacity:8},expected:'1'},{name:'Exactly full',input:{requested:8,capacity:8},expected:'1'},{name:'Overbooked',input:{requested:9,capacity:8},expected:'0'}]
  }
];

export const stages = [
  {id:'start',title:'Think like a programmer',label:'01',tier:'Beginner',status:'Starter lessons',topics:['Inputs and outputs','Values and types','Variables and assignment','Expressions','Boolean logic','Conditions','Loops','Trace tables','Debugging','Reading error messages'],outcome:'Predict a short program, explain each state change, and fix a boundary error.',project:'A ticket calculator and sensor-alert counter',challenge:'ticket-cost',prerequisites:[]},
  {id:'python',title:'Build with Python',label:'02',tier:'Beginner',status:'Starter lessons',topics:['Lists and strings','Dictionaries and sets','Functions and scope','Mutability and references','Exceptions','Modules and packages','File I/O','Virtual environments','Type hints','Unit tests'],outcome:'Build a tested command-line application without copying a tutorial.',project:'A searchable personal learning journal',challenge:'running-total',prerequisites:['start']},
  {id:'tools',title:'Work like an engineer',label:'03',tier:'Beginner',status:'Planned',topics:['Terminal and filesystem','Git commits','Branches and pull requests','HTTP basics','JSON','Environment variables','Dependency management','Debuggers','Test design','Documentation'],outcome:'Reproduce a bug, write a failing test, fix it, and submit a clear pull request.',project:'A small open-source bug fix with a regression test',prerequisites:['python']},
  {id:'dsa',title:'Solve with data structures',label:'04',tier:'Intermediate',status:'Starter lessons',topics:['Big-O and input size','Arrays and linked lists','Hash tables','Stacks and queues','Two pointers','Sliding windows','Binary search','Trees and heaps','Graphs and traversals','Recursion','Backtracking','Dynamic programming'],outcome:'Solve unfamiliar variants, justify invariants, and explain time/space trade-offs.',project:'A route planner with tests and algorithm benchmarks',challenge:'prefix-totals',prerequisites:['python']},
  {id:'java',title:'Speak Java fluently',label:'05',tier:'Intermediate',status:'Planned',topics:['JDK and compilation','Static types','Classes and interfaces','Composition and inheritance','Generics','Collections','Equality and hashing','Exceptions','Streams','JUnit','Concurrency basics','JVM memory and GC'],outcome:'Implement the same concept in Python and Java and explain semantic differences.',project:'A tested Java inventory service',prerequisites:['python','tools']},
  {id:'web',title:'Build for the web',label:'06',tier:'Intermediate',status:'Planned',topics:['Semantic HTML','CSS layout','JavaScript','TypeScript','DOM and events','Accessibility','React state','Next.js routing','Forms and validation','Browser networking','Frontend tests','Performance'],outcome:'Ship a responsive, accessible application and explain browser/server boundaries.',project:'The learner dashboard for this platform',prerequisites:['tools']},
  {id:'db',title:'Understand your data',label:'07',tier:'Intermediate',status:'Concept demo',topics:['Relational modeling','Keys and constraints','SELECT and filtering','JOINs and NULL','Aggregation','Window functions','Indexes and query plans','Transactions','Isolation anomalies','Migrations','SQL injection prevention','Vector search foundations'],outcome:'Design a schema, write correct SQL, and explain an index or transaction trade-off.',project:'A learning-progress database with audited migrations',prerequisites:['python','tools']},
  {id:'backend',title:'Build reliable services',label:'08',tier:'Intermediate',status:'Planned',topics:['REST and contracts','Authentication vs authorization','Sessions and OAuth','Validation','Pagination','Idempotency','Caching','Background jobs','Rate limits','API testing','Structured logging','Threat modeling'],outcome:'Build an API with authorization tests, understandable errors, and an operational runbook.',project:'A job-application tracker API',prerequisites:['db','tools']},
  {id:'systems',title:'See the infrastructure',label:'09',tier:'Advanced',status:'Concept demo',topics:['Processes and threads','Memory and filesystems','DNS','TCP and TLS','Reverse proxies','Load balancers','Containers','CI/CD','Cloud IAM','Monitoring and tracing','Queues and backpressure','Incident response'],outcome:'Follow a request across services and diagnose failures from evidence.',project:'A deployed service with load tests and a failure drill',prerequisites:['backend']},
  {id:'design',title:'Design at scale',label:'10',tier:'Advanced',status:'Planned',topics:['Requirements and constraints','Capacity estimation','Data models','Replication','Partitioning','Consistency','Availability trade-offs','Retries and timeouts','Consensus intuition','Event-driven systems','Failure domains','Architecture decision records'],outcome:'Defend a design under changing requirements and describe what breaks first.',project:'A document-processing platform with explicit consistency guarantees',prerequisites:['systems','db','dsa']},
  {id:'rag',title:'Engineer AI & RAG systems',label:'11',tier:'Advanced',status:'Concept demo',topics:['Tokens and embeddings','Keyword retrieval','Vector similarity','Chunking','Metadata filters and ACLs','Hybrid search','Reranking','Context construction','Citations','Retrieval evaluation','Groundedness and abstention','Prompt injection','Cost and latency','Freshness and deletion'],outcome:'Build and evaluate a permission-aware retrieval system; explain retrieval failures separately from generation failures.',project:'A source-cited tutor over an approved original lesson collection',prerequisites:['backend','db','systems']},
  {id:'specialist',title:'Develop specialist depth',label:'12',tier:'Expert practice',status:'Planned',topics:['Advanced database internals','Compilers and interpreters','Distributed consensus','Concurrency correctness','Performance profiling','Security engineering','ML systems evaluation','Accessibility engineering','Technical leadership','Research replication'],outcome:'Choose a specialty, read primary sources, reproduce an experiment, and defend a design review.',project:'Build a small database, interpreter, or retrieval benchmark',prerequisites:['design']},
  {id:'interview',title:'Turn skills into interviews',label:'13',tier:'Career',status:'Self-practice studio',topics:['Problem clarification','Think-aloud problem solving','Timed coding','Test selection','Complexity explanations','System design mocks','Behavioral evidence','Project walkthroughs','Resume evidence','Applications and networking','Interview reflection','Target-role gap analysis'],outcome:'Present reproducible work and communicate uncertainty, alternatives, and trade-offs.',project:'A portfolio case study and a recorded mock interview',prerequisites:['python']}
];

export const readings = [
  {title:'Think Python, third edition',author:'Allen B. Downey',topic:'Python',url:'https://greenteapress.com/wp/think-python-3rd-edition/',note:'Read for progressive explanations and small experiments. Link-only here; the listed license restricts commercial reuse.'},
  {title:'The Python Tutorial',author:'Python documentation',topic:'Python',url:'https://docs.python.org/3/tutorial/',note:'The language reference companion: data structures, control flow, functions, modules, and errors.'},
  {title:'dev.java learning materials',author:'Oracle / Java developer portal',topic:'Java',url:'https://dev.java/learn/',note:'Use the modern language and tooling documentation alongside a tested Java project.'},
  {title:'Operating Systems: Three Easy Pieces',author:'Remzi and Andrea Arpaci-Dusseau',topic:'Systems',url:'https://pages.cs.wisc.edu/~remzi/OSTEP/',note:'Read around virtualization, concurrency, and persistence. Free access is not blanket republishing permission.'},
  {title:'OpenDSA',author:'OpenDSA / Virginia Tech',topic:'Algorithms',url:'https://opendsa-server.cs.vt.edu/',note:'Compare an algorithm explanation with its interactive exercise. No third-party exercises are copied into this app.'},
  {title:'Composing Programs',author:'John DeNero',topic:'Foundations',url:'https://composingprograms.com/',note:'Abstraction, program structure, and reasoning. Edition-specific licensing needs review before any adaptation.'},
  {title:'PostgreSQL Tutorial',author:'PostgreSQL documentation',topic:'Databases',url:'https://www.postgresql.org/docs/current/tutorial.html',note:'Pair SQL syntax with constraints, transactions, and query-plan experiments.'},
  {title:'CS50x',author:'Harvard CS50',topic:'Foundations',url:'https://cs50.harvard.edu/x/',note:'A broader conceptual companion. Complete your own work; do not transplant course solutions.'},
  {title:'Retrieval Augmented Generation',author:'DeepLearning.AI',topic:'AI & RAG',url:'https://www.deeplearning.ai/courses/retrieval-augmented-generation',note:'Extend retrieval intuition into an evaluated system. This catalog links to the course; it does not include paid content.'},
  {title:'Three.js manual',author:'Three.js contributors',topic:'Visual engineering',url:'https://threejs.org/manual/',note:'Scene graphs, rendering, and performance for concept-driven 3D labs.'},
  {title:'Anime.js documentation',author:'Anime.js contributors',topic:'Visual engineering',url:'https://animejs.com/documentation/',note:'Use motion to indicate a meaningful state change. Reduced-motion mode must retain the explanation.'},
  {title:'Software Carpentry lessons',author:'The Carpentries',topic:'Tools',url:'https://swcarpentry.github.io/python-novice-images/license/',note:'A useful example of explicit lesson and code licensing. Preserve attribution and review individual assets.'}
];

export const interviewPrompts = [
  {title:'Explain a loop without hand-waving',tag:'Python · 3 minutes',prompt:'Walk through the running-total algorithm. Clarify the input, state the invariant, give an edge case, and explain time and auxiliary-space complexity.',rubric:['I stated the input and empty-input behavior.','I explained how the state changes, not just read the code.','I justified the result with a loop invariant.','I explained complexity and tested a boundary.']},
  {title:'Follow a request through the system',tag:'Infrastructure · 5 minutes',prompt:'A learner opens a lesson and submits code. Explain the browser, DNS/TLS, API, database, job queue, isolated runner, and result delivery. Where could the request fail?',rubric:['I distinguished browser, server, database, and runner.','I separated authentication from authorization.','I identified timeouts, retries, and duplicate submissions.','I kept untrusted code away from application secrets.']},
  {title:'A RAG answer is wrong. Now what?',tag:'AI engineering · 5 minutes',prompt:'A tutor returns an incorrect answer with a citation. Diagnose document freshness, permissions, retrieval, ranking, context selection, and generation separately. What evidence would you collect?',rubric:['I checked whether the relevant source was indexed and permitted.','I separated retrieval quality from answer quality.','I checked whether the citation actually supported the claim.','I described an evaluation case and an abstention policy.']},
  {title:'Tell the story of your project',tag:'Behavioral · 4 minutes',prompt:'Describe a technical decision in a project you built. What was the constraint, what alternatives did you consider, what did you implement yourself, and what evidence shows the result?',rubric:['I described a concrete situation and my own contribution.','I gave an alternative and a trade-off.','I used a reproducible result, not an invented metric.','I explained a limitation and what I learned.']}
];

export const ragStages = [
  {name:'Question',detail:'The learner asks a question. Keep user identity and document permissions attached to the request.'},
  {name:'Retrieve',detail:'Search only permitted documents. This demo uses transparent keyword overlap, not real embeddings or a vector database.'},
  {name:'Rank',detail:'Sort candidate passages by relevance. In production, compare keyword, vector, hybrid, and reranking baselines using held-out queries.'},
  {name:'Context',detail:'Select evidence that fits the context budget. Include stable source identifiers and avoid treating source text as instructions.'},
  {name:'Answer',detail:'A real model would answer from the selected evidence and abstain when it is insufficient. This prototype displays evidence excerpts, not generated claims.'},
  {name:'Verify',detail:'Check that each cited passage supports its claim. Evaluate retrieval and generated-answer quality separately.'}
];

export const corpus = [
  {id:'L01',title:'Python loop state',text:'A loop visits each value in a list. An accumulator stores a running total. Initialize a sum to zero and update it once per item.'},
  {id:'L02',title:'Database indexes',text:'A database index helps locate rows without scanning every row for suitable queries. Indexes consume storage and add maintenance work when data changes.'},
  {id:'L03',title:'Cache trade-offs',text:'A cache can reduce repeated database reads and response latency. Cached data may become stale. Choose an expiration or invalidation policy based on correctness requirements.'},
  {id:'L04',title:'RAG permissions and evidence',text:'Retrieval augmented generation selects relevant source text before an answer is generated. Apply document permissions before retrieval results enter the model context. Cite evidence and abstain without support.'},
  {id:'L05',title:'Queues and workers',text:'A queue decouples a request from background work. Workers process jobs. Retries require idempotency and bounded attempts; a queue alone does not guarantee exactly once processing.'}
];

export function retrieve(query, k = 3) {
  const stop = new Set(['the','a','an','what','why','how','do','does','is','are','to','and','of','in','for']);
  const words = [...new Set(query.toLowerCase().match(/[a-z]+/g) ?? [])].filter(x => !stop.has(x));
  return corpus.map(d => { const tokens = new Set((d.title+' '+d.text).toLowerCase().match(/[a-z]+/g)); return {...d,score:words.filter(w=>tokens.has(w)).length}; }).filter(d=>d.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,k);
}
