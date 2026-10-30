import {JAVA_ALGORITHM_LABS} from './java-algorithms-content.mjs';
// Original console exercises. Java receives fixture inputs through main's args array.
const program = body => `public class Main {\n    public static void main(String[] args) {\n${body.split('\n').map(line => '        ' + line).join('\n')}\n    }\n}\n`;
const fixture = (name, args, stdout) => ({name, args, stdout});
const lab = value => ({...value, starter:value.bug});

export const JAVA_FOUNDATION_LABS = [
  lab({
    id:'java-start', title:'Increase the starting energy',
    goal:'Give a whole number a name, add two, and display the updated value.',
    contract:{
      input:'Zero or one argument. If provided, it is a base-10 integer from -1000 to 1000. No argument means a starting energy of 3. The supplied first line reads this input; focus on the assignment below it.',
      output:'One line containing the starting energy plus 2, followed by a newline. Print the number only, without a label.',
      edgeCases:'A starting value of 0 becomes 2. A starting value of -2 becomes 0. Negative values are allowed. Inputs outside the stated range or extra arguments are outside this exercise.',
      mutation:'There is no external data to change. Update the local energy variable using its previous value.'
    },
    solution:program('int energy = args.length == 0 ? 3 : Integer.parseInt(args[0]);\nenergy = energy + 2;\nSystem.out.println(energy);'),
    bug:program('int energy = args.length == 0 ? 3 : Integer.parseInt(args[0]);\nenergy = 2;\nSystem.out.println(energy);'),
    hints:['The supplied input line is setup code. The line after it currently replaces energy with 2.', 'Use energy on the right side of the assignment, then add 2. Keep the semicolon.'],
    explanation:'Assignment stores the expression on its right into the variable on its left. energy + 2 reads the earlier value before storing the increased value. The starter deliberately discards the input by assigning 2 directly.',
    complexity:'O(1) time and O(1) extra space within this bounded integer contract. Parsing has bounded input length, and the update performs one addition.',
    fixtures:[fixture('No argument uses 3', [], '5\n'), fixture('Changed positive input', ['8'], '10\n'), fixture('Zero input', ['0'], '2\n'), fixture('Negative input reaches zero', ['-2'], '0\n'), fixture('Upper contract boundary', ['1000'], '1002\n')]
  }),
  lab({
    id:'java-types', title:'Build a greeting from text',
    goal:'Read a String variable and join it to punctuation and a space.',
    contract:{
      input:'Zero or one text argument, containing at most 80 characters and no newline characters. No argument means coder. A provided empty string is a real input, not the default.',
      output:'One line containing Hello, followed by one space, the input name unchanged, and !. End the line with a newline. Example: Amina produces Hello, Amina!.',
      edgeCases:'Preserve spaces inside the name and preserve an empty name. Do not trim or change case. For an empty name, the line is Hello, !.',
      mutation:'Do not change the supplied text. Construct a new greeting.'
    },
    solution:program('String name = args.length == 0 ? "coder" : args[0];\nSystem.out.println("Hello, " + name + "!");'),
    bug:program('String name = args.length == 0 ? "coder" : args[0];\nSystem.out.println("Hello," + name + "!");'),
    hints:['Java joins exactly the characters inside quotation marks. The starter has no space after its comma.', 'The first text piece should be "Hello, " including the final space. Keep name outside quotes to read its value.'],
    explanation:'String stores text and starts with a capital S. The + operator joins text values in order. The name variable contributes its stored text, while the quoted pieces contribute their literal punctuation and space. Quoting "name" would print those four letters.',
    complexity:'O(n) time and O(n) result space for a name of n characters. The punctuation contributes a fixed number of characters.',
    fixtures:[fixture('Default name', [], 'Hello, coder!\n'), fixture('A supplied name', ['Amina'], 'Hello, Amina!\n'), fixture('Changed name with a space', ['Li Na'], 'Hello, Li Na!\n'), fixture('Empty name stays empty', [''], 'Hello, !\n'), fixture('Existing surrounding spaces stay', [' Omar '], 'Hello,  Omar !\n')]
  }),
  lab({
    id:'java-decisions', title:'Include the gate boundary',
    goal:'Use an if/else branch to accept a count of at least four.',
    contract:{
      input:'Zero or one argument representing a base-10 integer count from -1000 to 1000. No argument means 0. The first line converts the supplied text into int count.',
      output:'Print open when count is at least 4. Otherwise print closed. Use lowercase and one newline after the word.',
      edgeCases:'Exactly 4 must print open. 3 prints closed. Zero and negative counts print closed.',
      mutation:'No external data changes. Select exactly one output branch.'
    },
    solution:program('int count = args.length == 0 ? 0 : Integer.parseInt(args[0]);\nif (count >= 4) {\n    System.out.println("open");\n} else {\n    System.out.println("closed");\n}'),
    bug:program('int count = args.length == 0 ? 0 : Integer.parseInt(args[0]);\nif (count > 4) {\n    System.out.println("open");\n} else {\n    System.out.println("closed");\n}'),
    hints:['Test 3, 4, and 5. The starter rejects one of the values that the rule accepts.', 'At least includes equality. Use a comparison that is true both above 4 and exactly at 4.'],
    explanation:'The condition inside parentheses chooses the branch. >= means greater than or equal to, so the threshold belongs to the open branch. The deliberate > bug only appears when the count is exactly 4.',
    complexity:'O(1) time and O(1) extra space for one bounded integer comparison and one output line.',
    fixtures:[fixture('Below the threshold', ['3'], 'closed\n'), fixture('Exactly the threshold', ['4'], 'open\n'), fixture('Above the threshold', ['5'], 'open\n'), fixture('No argument uses zero', [], 'closed\n'), fixture('Negative count', ['-2'], 'closed\n')]
  }),
  lab({
    id:'java-arrays', title:'Total an array of whole numbers',
    goal:'Use an enhanced for loop and keep a running total.',
    contract:{
      input:'Between 0 and 100 arguments. Each is a base-10 integer from -1000 to 1000. The supplied first loop converts the text arguments into an int[] named values.',
      output:'One line with the sum of every array value, followed by a newline. Print the final sum once, after processing the array.',
      edgeCases:'No arguments produce an empty array whose sum is 0. Preserve duplicate values. Negative values subtract from the total. The bounded inputs keep the sum within int range.',
      mutation:'Do not change the values array. Store the running sum in a separate total variable.'
    },
    solution:program('int[] values = new int[args.length];\nfor (int i = 0; i < args.length; i++) {\n    values[i] = Integer.parseInt(args[i]);\n}\nint total = 0;\nfor (int value : values) {\n    total = total + value;\n}\nSystem.out.println(total);'),
    bug:program('int[] values = new int[args.length];\nfor (int i = 0; i < args.length; i++) {\n    values[i] = Integer.parseInt(args[i]);\n}\nint total = 0;\nfor (int value : values) {\n    total = value;\n}\nSystem.out.println(total);'),
    hints:['The first loop is input setup. In the second loop, total must remember earlier values.', 'Assign total + value rather than value alone. Keep the print outside the loop so it runs once even when the array is empty.'],
    explanation:'Initialize the total once before visiting the array. Each iteration adds the current value to the accumulated result. Replacing total with value loses earlier work and returns only the last item. An empty array performs zero iterations, leaving the starting total at 0.',
    complexity:'O(n) time for n inputs. The supplied input conversion stores an O(n) array; the summing loop itself uses O(1) extra working space and does not modify that array.',
    fixtures:[fixture('Several values including a negative', ['2','0','-1','3'], '4\n'), fixture('Changed values', ['4','6'], '10\n'), fixture('Empty array', [], '0\n'), fixture('Duplicates both count', ['5','5'], '10\n'), fixture('All negative', ['-3','-2'], '-5\n')]
  }),
  lab({
    id:'java-methods', title:'Return a calculation from a method',
    goal:'Make doubleValue return twice its parameter, then display the caller’s result.',
    contract:{
      input:'Zero or one argument representing a base-10 integer from -1000 to 1000. No argument means 0. main reads it, calls doubleValue, and displays the returned value.',
      output:'One line containing twice the input value, followed by a newline. The requested method returns an int and does not print its own extra line.',
      edgeCases:'Zero doubles to zero. Negative values remain negative when doubled. A value of 4 alone is insufficient to expose the starter bug.',
      mutation:'The method receives a value and returns a result. It needs no shared mutable fields.'
    },
    solution:'public class Main {\n    static int doubleValue(int value) {\n        return value * 2;\n    }\n\n    public static void main(String[] args) {\n        int value = args.length == 0 ? 0 : Integer.parseInt(args[0]);\n        System.out.println(doubleValue(value));\n    }\n}\n',
    bug:'public class Main {\n    static int doubleValue(int value) {\n        return 8;\n    }\n\n    public static void main(String[] args) {\n        int value = args.length == 0 ? 0 : Integer.parseInt(args[0]);\n        System.out.println(doubleValue(value));\n    }\n}\n',
    hints:['The starter returns a fixed 8, so try an input other than 4.', 'Use the parameter value in the return expression. Returning a number and printing a number are separate operations.'],
    explanation:'The parameter supplies the input for each call. return sends a computed int back to main, where println displays it. The starter happens to work for 4 but ignores its parameter. Output checks verify behavior for the published fixtures; they do not prove that every possible implementation uses a method as requested.',
    complexity:'O(1) time and O(1) extra space for one bounded integer multiplication and one method call.',
    fixtures:[fixture('Example input can hide the bug', ['4'], '8\n'), fixture('Changed input', ['7'], '14\n'), fixture('Zero default', [], '0\n'), fixture('Explicit zero', ['0'], '0\n'), fixture('Negative input', ['-3'], '-6\n')]
  }),
  lab({
    id:'java-classes', title:'Give each counter its own state',
    goal:'Update one Counter object without changing a second Counter object.',
    contract:{
      input:'Zero or one argument representing an integer amount from -1000 to 1000. No argument means 0. Create two counters at zero and add the amount to only the first.',
      output:'Two lines: first.count on the first line, then second.count on the second line. End both lines with a newline. The expected second value is always 0.',
      edgeCases:'An amount of 0 leaves both values at 0. A negative amount updates only the first value. Every check runs a fresh program with new objects.',
      mutation:'Change only the first object’s count. The second object must keep its independent instance field.'
    },
    solution:'public class Main {\n    static class Counter {\n        int count = 0;\n        void add(int amount) {\n            count = count + amount;\n        }\n    }\n\n    public static void main(String[] args) {\n        int amount = args.length == 0 ? 0 : Integer.parseInt(args[0]);\n        Counter first = new Counter();\n        Counter second = new Counter();\n        first.add(amount);\n        System.out.println(first.count);\n        System.out.println(second.count);\n    }\n}\n',
    bug:'public class Main {\n    static class Counter {\n        static int count = 0;\n        void add(int amount) {\n            count = count + amount;\n        }\n    }\n\n    public static void main(String[] args) {\n        int amount = args.length == 0 ? 0 : Integer.parseInt(args[0]);\n        Counter first = new Counter();\n        Counter second = new Counter();\n        first.add(amount);\n        System.out.println(first.count);\n        System.out.println(second.count);\n    }\n}\n',
    hints:['The starter gives the class one shared count instead of giving each object its own count.', 'Remove static from the mutable count field. The nested Counter class may remain static; that declaration does not make its instance fields shared.'],
    explanation:'Each new Counter should own an independent count. A static count belongs to the class and is shared, so updating first also changes what second reads. A static nested class and a static field have different effects. This exercise checks observable independence on its fixtures, not the quality of an entire object design.',
    complexity:'O(1) time and O(1) extra space for two fixed-size objects, one update, and two output lines.',
    fixtures:[fixture('Update only the first counter', ['3'], '3\n0\n'), fixture('Changed amount', ['8'], '8\n0\n'), fixture('Zero amount', ['0'], '0\n0\n'), fixture('Negative amount', ['-2'], '-2\n0\n'), fixture('Default amount', [], '0\n0\n')]
  }),
  lab({
    id:'java-next-tools', title:'Collect valid numbers and handle invalid text',
    goal:'Use an ArrayList for accepted integers and catch the expected conversion error.',
    contract:{
      input:'Between 0 and 100 text arguments, each at most 20 characters with no newline. Each argument is either a valid base-10 int from -1000 to 1000 or text that Integer.parseInt cannot parse. A leading + or - is allowed for valid integers. Whitespace is not trimmed.',
      output:'Two lines: the number of successfully parsed integers, then their sum. End both lines with a newline. Ignore text that raises NumberFormatException; do not count it as a zero.',
      edgeCases:'No inputs or only invalid inputs produce 0 on both lines. A valid 0 must still count as one accepted item. Duplicate numbers count separately. Empty text and surrounding whitespace are invalid. Out-of-int-range text is invalid.',
      mutation:'Keep the original text arguments unchanged. Append only successfully parsed integers to a new list.'
    },
    solution:program('java.util.List<Integer> values = new java.util.ArrayList<>();\nfor (String text : args) {\n    try {\n        values.add(Integer.parseInt(text));\n    } catch (NumberFormatException error) {\n        // Invalid text contributes no item.\n    }\n}\nint total = 0;\nfor (int value : values) {\n    total = total + value;\n}\nSystem.out.println(values.size());\nSystem.out.println(total);'),
    bug:program('java.util.List<Integer> values = new java.util.ArrayList<>();\nfor (String text : args) {\n    try {\n        values.add(Integer.parseInt(text));\n    } catch (NumberFormatException error) {\n        values.add(0);\n    }\n}\nint total = 0;\nfor (int value : values) {\n    total = total + value;\n}\nSystem.out.println(values.size());\nSystem.out.println(total);'),
    hints:['The sum alone cannot distinguish an invalid item from a valid zero. Inspect the accepted-item count too.', 'The catch block should not append anything. Keep values.add inside try, where parsing succeeded.'],
    explanation:'Integer.parseInt either returns a whole number or raises NumberFormatException. Append the number only after successful parsing. ArrayList grows as items are accepted, and size() counts accepted items. Adding 0 in catch preserves some sums but incorrectly increases the accepted count. Catching the specific expected error also avoids hiding unrelated failures.',
    complexity:'O(n × m) time for n arguments of at most m characters, plus O(n) time to total accepted integers. Here m is bounded at 20. The list uses O(n) extra space; the bounded input keeps the sum in int range.',
    fixtures:[fixture('Mixed valid and invalid text', ['12','skip','abc','-2','0'], '3\n10\n'), fixture('Changed valid inputs', ['5','5','-1'], '3\n9\n'), fixture('No inputs', [], '0\n0\n'), fixture('Only invalid inputs', ['','skip','oops'], '0\n0\n'), fixture('Zero still counts', ['0'], '1\n0\n'), fixture('Whitespace and leading signs', [' 4','4 ','+4','-0'], '2\n4\n'), fixture('Overflow is invalid', ['99999999999999999999','2'], '1\n2\n')]
  })
];

export const JAVA_LABS=[...JAVA_FOUNDATION_LABS,...JAVA_ALGORITHM_LABS];
export const JAVA_LAB_BY_ID = new Map(JAVA_LABS.map(item => [item.id,item]));
