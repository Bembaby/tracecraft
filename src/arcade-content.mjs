// Original recognition practice. These questions do not execute learner code.
import {PATTERN_ARCADE_QUESTS} from './interview-arcade-content.mjs';
import {FRONTEND_ARCADE_QUESTS} from './frontend-course-content.mjs';
import {JAVA_QUESTS} from './beginner-java-content.mjs';
const choice = (id, prompt, code, options, answer, explanation, hint) => ({id, kind:'choice', prompt, code, options, answer, explanation, hint});
const blank = (id, prompt, code, options, answer, explanation, hint) => ({id, kind:'blank', prompt, code, options, answer, explanation, hint});

export const ARCADE_QUESTS = [
  {id:'first-variable', title:'Power up a variable', topic:'Variables', language:'Python', color:'mint', icon:'battery',
    description:'Store a value. Change it. See what stays the same.',
    lesson:'A variable gives a value a name. Python reads statements from top to bottom. Assigning a new value replaces the old value for that name.',
    contract:'Input: an integer named energy. Output: energy increased by 2. Negative values and zero are allowed.',
    starter:'energy = ___\nprint(energy)', solution:'def solve(energy):\n    energy = energy + 2\n    return energy',
    bug:'def solve(energy):\n    energy = 2\n    return energy', complexity:'O(1) time and O(1) extra space: one addition, regardless of the input value.',
    fixtures:[{input:3,expected:5},{input:0,expected:2},{input:-2,expected:0}], lab:'#python/first-total',
    questions:[
      choice('variable-read','What value does this print?','energy = 3\nenergy = energy + 2\nprint(energy)', ['3','5','2'], '5','Python reads the old energy value, adds 2, then stores 5 in energy. The final print uses that new value.','Work from the top: start with 3, then add 2.'),
      blank('variable-fill','Add 2 to the energy you already have.','energy = 3\nenergy = ___\nprint(energy)', ['energy + 2','2','energy - 2'], 'energy + 2','energy + 2 keeps the current value and adds 2. Assigning only 2 would replace the current energy.','Use the variable on the right side to keep its current value.'),
      choice('variable-debug','We want 5. Which line causes the bug?','energy = 3\nenergy = 2\nprint(energy)', ['energy = 3','energy = 2','print(energy)'], 'energy = 2','energy = 2 replaces 3 with 2. Change that line to energy = energy + 2 to get 5.','Look for the line that replaces energy instead of adding to it.')
    ]},
  {id:'open-the-gate', title:'Open the logic gate', topic:'Conditions', language:'Python', color:'violet', icon:'gate',
    description:'Choose what happens when a condition is true.',
    lesson:'An if statement makes a choice. The expression >= means greater than or equal to, so the boundary value counts too.',
    contract:'Input: integer coins. Output: "open" when coins is at least 3, otherwise "closed". Negative values are treated as insufficient coins.',
    solution:'def solve(coins):\n    if coins >= 3:\n        return "open"\n    return "closed"',
    bug:'def solve(coins):\n    if coins > 3:\n        return "open"\n    return "closed"', complexity:'O(1) time and O(1) extra space: a single comparison and choice.',
    fixtures:[{input:3,expected:'open'},{input:2,expected:'closed'},{input:0,expected:'closed'},{input:4,expected:'open'}], lab:'#python/first-decision',
    questions:[
      choice('gate-read','You have exactly 3 coins. What prints?','coins = 3\nif coins >= 3:\n    print("open")\nelse:\n    print("closed")', ['open','closed','Nothing'], 'open','At least 3 includes exactly 3. The condition is true, so the if branch prints open.','The equal part of >= matters at the boundary.'),
      blank('gate-fill','Open the gate with 3 or more coins.','coins = 3\nif coins ___ 3:\n    print("open")\nelse:\n    print("closed")', ['>=','>','=='], '>=','>= includes 3 and every larger value. > excludes 3, while == excludes 4 and above.','You need both greater than and equal to.'),
      choice('gate-debug','Which input reveals this bug?','if coins > 3:\n    print("open")\nelse:\n    print("closed")', ['coins = 2','coins = 3','coins = 4'], 'coins = 3','The gate should open at 3, but > requires more than 3. Use >= to include the boundary.','Try the smallest number that should open the gate.')
    ]},
  {id:'collect-the-stars', title:'Collect the stars', topic:'Loops', language:'Python', color:'gold', icon:'star',
    description:'Turn a list of small values into one total.',
    lesson:'A for loop visits each item. An accumulator starts at zero and keeps a running total. Keep that starting value outside the loop.',
    contract:'Input: a list of integers named stars, including an empty list or negative values. Output: their sum; the empty list returns 0.',
    solution:'def solve(stars):\n    total = 0\n    for star in stars:\n        total = total + star\n    return total',
    bug:'def solve(stars):\n    total = 0\n    for star in stars:\n        total = star\n    return total', complexity:'O(n) time for n list items and O(1) extra space: each item is visited once.',
    fixtures:[{input:[2,1,3],expected:6},{input:[],expected:0},{input:[-2,2],expected:0},{input:[4],expected:4}], lab:'#python/first-loop',
    questions:[
      choice('stars-read','How many stars are collected in total?','total = 0\nfor star in [2, 1, 3]:\n    total = total + star\nprint(total)', ['3','6','2'], '6','The running total becomes 2, then 3, then 6. The loop adds values, rather than counting how many values exist.','Write down the total after each addition.'),
      blank('stars-fill','Keep the running total as you add each star.','total = 0\nfor star in [2, 1, 3]:\n    total = ___\nprint(total)', ['total + star','star','total + 1'], 'total + star','total + star keeps everything collected so far and adds the next value. total + 1 would count items instead.','Combine the old total with the current item.'),
      choice('stars-debug','This should print 6. What does it actually print?','total = 0\nfor star in [2, 1, 3]:\n    total = star\nprint(total)', ['6','0','3'], '3','Each assignment discards the earlier total. The last item, 3, is all that remains. Fix it with total = total + star.','Follow the assignments: total becomes 2, then 1, then what?')
    ]},
  {id:'list-inventory', title:'Check your inventory', topic:'Lists', language:'Python', color:'pink', icon:'bag',
    description:'Read a list without changing what is inside.',
    lesson:'A list keeps items in order. Python starts counting positions at zero. len(items) counts the items, and items[0] reads the first one.',
    contract:'Input: a nonempty list named items containing integers. Output: the first integer. An empty list is outside this exercise contract.',
    solution:'def solve(items):\n    return items[0]', bug:'def solve(items):\n    return items[1]',
    complexity:'O(1) time and O(1) extra space: reading one list position does not scan the list.',
    fixtures:[{input:[7,9],expected:7},{input:[4],expected:4},{input:[0,-1],expected:0}], lab:'#python/first-list',
    questions:[
      choice('list-read','Which item is at position 0?','items = [7, 9, 4]\nprint(items[0])', ['7','9','4'], '7','Position 0 is the first item, 7. Position 1 is the second item, 9.','Python list positions start at zero.'),
      blank('list-fill','Read the first item in the inventory.','items = [7, 9, 4]\nfirst = items[___]\nprint(first)', ['0','1','3'], '0','Index 0 selects the first item. The same expression works for a one-item list.','The first position is one less than you might expect.'),
      choice('list-debug','Which input makes this first-item function fail?','def first(items):\n    return items[1]', ['[4]','[4, 4]','[4, 4, 4]'], '[4]','A one-item list has only position 0. Reading position 1 raises IndexError. Use items[0] for the first item.','Find the list that has no second position.')
    ]},
  {id:'find-the-potions', title:'Find the right potions', topic:'SQL filters', language:'SQL', color:'blue', icon:'flask',
    description:'Ask a table for just the rows you need.',
    lesson:'SELECT chooses columns. FROM names the table. WHERE keeps rows that meet a condition. Use ORDER BY when the output order matters.',
    contract:'Table potions(id INTEGER PRIMARY KEY, price INTEGER NOT NULL). Return id for every row with price <= 5, ordered by id. Prices are nonnegative integers.',
    schema:'CREATE TABLE potions(id INTEGER PRIMARY KEY, price INTEGER NOT NULL);',
    solution:'SELECT id FROM potions WHERE price <= 5 ORDER BY id;', bug:'SELECT id FROM potions WHERE price < 5 ORDER BY id;',
    complexity:'With no price index, filtering scans n rows. Sorting up to n matches can take O(n log n) time and O(n) temporary space; SQLite may avoid the sort using the primary-key order.',
    fixtures:[{input:[[1,2],[2,5],[3,9]],expected:[[1],[2]]},{input:[],expected:[]},{input:[[1,0],[2,6]],expected:[[1]]}], lab:'#sql/filter-books',
    questions:[
      choice('potions-read','Which IDs fit the budget of 5?','-- id | price\n--  1 | 2\n--  2 | 5\n--  3 | 9\nSELECT id FROM potions\nWHERE price <= 5 ORDER BY id;', ['1 and 2','Only 1','1, 2 and 3'], '1 and 2','Both 2 and 5 are at most 5. The row priced at 9 does not match the filter.','The <= comparison includes the exact budget.'),
      blank('potions-fill','Keep only potions that cost at most 5.','SELECT id FROM potions\n___ price <= 5\nORDER BY id;', ['WHERE','FROM','LIMIT'], 'WHERE','WHERE filters rows using a condition. FROM already names the table. LIMIT caps the number of returned rows.','You need the SQL word that introduces a row condition.'),
      choice('potions-debug','Which price is incorrectly left out?','SELECT id FROM potions\nWHERE price < 5\nORDER BY id;', ['2','5','9'], '5','< 5 excludes exactly 5. The input contract includes prices at the budget, so the condition needs <= 5.','Check the exact budget boundary.')
    ]},
  {id:'count-the-loot', title:'Count the loot', topic:'SQL counting', language:'SQL', color:'orange', icon:'chest',
    description:'Get one answer from a whole table.',
    lesson:'COUNT(*) counts rows, including rows whose other columns contain NULL. COUNT(column) counts only rows where that column is not NULL.',
    contract:'Table loot(id INTEGER PRIMARY KEY, label TEXT). Return one row with a column named total containing the number of rows. NULL labels still count; an empty table returns 0.',
    schema:'CREATE TABLE loot(id INTEGER PRIMARY KEY, label TEXT);', solution:'SELECT COUNT(*) AS total FROM loot;', bug:'SELECT COUNT(label) AS total FROM loot;',
    complexity:'Counting is bounded by O(n) time over n rows and O(1) accumulator space. SQLite may optimize COUNT(*) using its table structure.',
    fixtures:[{input:[[1,'key'],[2,null],[3,'gem']],expected:[[3]]},{input:[],expected:[[0]]},{input:[[1,null]],expected:[[1]]}], lab:'#sql/count-books',
    questions:[
      choice('loot-read','How many rows does COUNT(*) count?','-- id | label\n--  1 | key\n--  2 | NULL\n--  3 | gem\nSELECT COUNT(*) AS total FROM loot;', ['2','3','0'], '3','COUNT(*) counts all three rows. A missing label does not remove the row.','Count the rows, including the one with a NULL label.'),
      blank('loot-fill','Count every row, even a row with no label.','SELECT COUNT(___) AS total\nFROM loot;', ['*','label','NULL'], '*','COUNT(*) counts rows. COUNT(label) would skip missing labels, and COUNT(NULL) would count no values.','Choose the symbol that means count whole rows.'),
      choice('loot-debug','Why can this count be too small?','SELECT COUNT(label) AS total\nFROM loot;', ['It skips NULL labels','It skips repeated labels','It counts only the first row'], 'It skips NULL labels','COUNT(label) includes repeated non-NULL labels but skips NULL values. Use COUNT(*) when every row should count.','Think about a row whose label is missing.')
    ]}
  ,...PATTERN_ARCADE_QUESTS,
  ...FRONTEND_ARCADE_QUESTS,
  ...JAVA_QUESTS
];

export const ARCADE_QUEST_BY_ID = new Map(ARCADE_QUESTS.map(q=>[q.id,q]));
export const ARCADE_QUESTIONS = ARCADE_QUESTS.flatMap(q=>q.questions);
export const ARCADE_QUESTION_BY_ID = new Map(ARCADE_QUESTIONS.map(q=>[q.id,q]));
export const questionsFor = (quest, mode='all') => quest.questions.filter(q=>mode==='all'||q.kind===mode);
export const isCorrectAnswer = (question, answer) => typeof answer==='string' && answer.trim()===question.answer;
