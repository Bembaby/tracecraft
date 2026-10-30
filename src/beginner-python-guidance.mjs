// Worked examples extend existing lessons. They do not create graded attempts.
export const PYTHON_GUIDANCE_SECTIONS = Object.freeze({
  'what-is-code':{
    title:'Separate an error from an unexpected answer',
    body:'A syntax error means Python cannot read the writing rules, such as a missing closing quote. A runtime error happens while following readable code, such as using a name that was never assigned. A wrong answer can run without either error. Here both instructions are valid, but only the second prints the requested greeting. Before running, predict both lines. Which text would you change if the task required Hello, coder!?',
    code:'print("Hello, reader!")\nprint("Hello, coder!")',
    result:'Hello, reader!\nHello, coder!'
  },
  'values-and-variables':{
    title:'Read an update from right to left',
    body:'Assignment first calculates the value on the right, then stores it under the name on the left. The update reads the earlier score of 4 before replacing it with 7. It is not a mathematical statement that both sides must stay equal forever. Predict the final value if the starting score were 0. Why would assigning score = 3 discard the earlier score?',
    code:'score = 4\nscore = score + 3\nprint(score)',
    result:'7'
  },
  'text-and-numbers':{
    title:'Check the type before joining a message',
    body:'The number 6 and the text "6" look similar when displayed, but do different jobs. Add numbers to calculate; join strings to form a message. str(count) produces text so it can be joined to " items". Predict what each line displays before reading the result. Why would count + 2 calculate a number while str(count) + "2" joins text?',
    code:'count = 6\nprint(count + 2)\nprint(str(count) + "2")\nprint(str(count) + " items")',
    result:'8\n62\n6 items'
  },
  'decisions':{
    title:'Distinguish storing a value from comparing it',
    body:'One equals sign stores a value. Two equals signs compare values and produce True or False. The indented line belongs to if, while the final print runs after the whole decision. Predict which lines appear when points is 2 instead of 3. If a task includes the exact boundary, explain why changing > to >= changes the answer at that boundary.',
    code:'points = 3\nprint(points == 3)\nif points >= 3:\n    print("ready")\nprint("checked")',
    result:'True\nready\nchecked'
  },
  'lists':{
    title:'Check that a position exists before reading it',
    body:'An empty list has length 0 and no first item. Reading values[0] before checking the length would cause a runtime error. This decision prints a clear message for the empty case. Predict the result if values were [9]. Which branch would run, and why does its first position use 0?',
    code:'values = []\nif len(values) == 0:\n    print("no values")\nelse:\n    print(values[0])',
    result:'no values'
  },
  'loops':{
    title:'Inspect a running total one repetition at a time',
    body:'The total starts once, before the loop. Each repetition adds its current value and displays the updated total. The repeated 2 still counts twice because there are two entries. Predict both lines. Why would moving total = 0 into the indented loop body lose earlier work?',
    code:'values = [2, 2]\ntotal = 0\nfor value in values:\n    total = total + value\n    print(total)',
    result:'2\n4'
  },
  'functions':{
    title:'Return a reusable answer, then choose when to print it',
    body:'return sends an answer back to the caller. The function does not print anything by itself here. The first call stores its answer in first; the second call passes its answer directly to print. Predict both displayed numbers. Why would putting only print inside add_two leave its caller without the numeric result it needs?',
    code:'def add_two(value):\n    return value + 2\n\nfirst = add_two(3)\nprint(first)\nprint(add_two(8))',
    result:'5\n10'
  },
  'changed-inputs':{
    title:'Choose an input that can disprove a guess',
    body:'A function that always returns "Hello, Amina!" could pass one example by accident. A different name and an empty name test whether it actually uses its parameter. Empty text is still a string input, so the space and punctuation remain. Predict both messages. Which example would expose a hardcoded name, and what should the general rule be?',
    code:'def greeting(name):\n    return "Hello, " + name + "!"\n\nprint(greeting("Tariq"))\nprint(greeting(""))',
    result:'Hello, Tariq!\nHello, !'
  },
  'function-loops':{
    title:'Finish the loop before returning the total',
    body:'return is aligned with for, inside the function but outside the loop. It runs after every item has been visited. For empty input, the loop runs zero times and the function still returns the starting total of 0. Predict both calls. Why would an indented return inside the loop stop after the first item and fail to return a total for an empty list?',
    code:'def total_values(values):\n    total = 0\n    for value in values:\n        total = total + value\n    return total\n\nprint(total_values([3, 3, -1]))\nprint(total_values([]))',
    result:'5\n0'
  },
  'python-dictionaries':{
    title:'Distinguish an absent key from a stored zero',
    body:'A key can be present even when its stored total is zero. get supplies 0 for an absent key, and assignment stores the new total. This creates the missing Rami entry while keeping Noor. Predict the two printed totals. Why would reading totals["Rami"] before its first assignment raise an error instead of supplying a starting value?',
    code:'totals = {"Noor": 0}\nprint(totals["Noor"])\ntotals["Rami"] = totals.get("Rami", 0) + 4\nprint(totals["Rami"])',
    result:'0\n4'
  },
  'python-classes':{
    title:'Keep each instance state separate from the next',
    body:'self.count belongs to the particular object receiving the call. Creating first and second runs the initializer separately, so updating first leaves second at 0. The amount parameter exists for one method call; the updated self.count remains on the object afterward. Predict the two values. What would go wrong if both counters shared one mutable list of events instead of owning their own?',
    code:'class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def add(self, amount):\n        self.count = self.count + amount\n\nfirst = Counter()\nsecond = Counter()\nfirst.add(4)\nprint(first.count)\nprint(second.count)',
    result:'4\n0'
  },
  'python-errors':{
    title:'Handle the expected conversion error precisely',
    body:'int can read whole-number text, including surrounding spaces and a minus sign. It raises ValueError for text such as "later". Catching that specific error lets the function return None for the invalid case without hiding unrelated mistakes. Predict all three calls. Why is a valid zero different from None, and why should a misspelled variable still be allowed to report its own error?',
    code:'def read_integer(text):\n    try:\n        return int(text.strip())\n    except ValueError:\n        return None\n\nprint(read_integer(" 0 "))\nprint(read_integer("-2"))\nprint(read_integer("later"))',
    result:'0\n-2\nNone'
  }
});

export function enrichPythonLessons(lessons) {
  return lessons.map(lesson=>{
    const section=lesson.track==='python'?PYTHON_GUIDANCE_SECTIONS[lesson.id]:null;
    if(!section||lesson.sections.some(item=>item.title===section.title))return lesson;
    return {...lesson,sections:[...lesson.sections,section]};
  });
}
