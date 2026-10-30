export const JAVA_SETUP_GUIDES = {
  'java-start':'The supplied first line chooses 3 when there are no inputs. Otherwise Integer.parseInt(args[0]) turns the first text input into a whole number. You can keep that setup and edit the assignment below it.',
  'java-types':'The supplied first line uses the first text input as name, or uses coder when there is no input. An empty text value is different from having no input at all. Join text with + and put spaces inside the quotation marks.',
  'java-decisions':'The supplied line reads a whole-number input. The if block chooses which message to print. Exactly 4 belongs on the open side of the boundary, so test that value as well as values above and below it.',
  'java-arrays':'The supplied setup creates an int array and reads each input string into one position. A for loop then visits the numbers. Focus on the accumulator, a variable that keeps the running total. No input produces an empty array.',
  'java-methods':'The main method reads the input and calls doubleValue. The parameter value is the name that doubleValue uses for that input. return sends the result back to main, where println displays it.',
  'java-classes':'The Counter class describes one counter. new Counter() creates an independent object. The supplied input tells the first counter how much to add. The second counter must retain its own starting value.',
  'java-next-tools':'List<Integer> stores a growing list of whole-number values. Integer is the object form of int, which lets a collection hold those values. Java converts between int and Integer here. try attempts parsing; catch handles only the number-parsing error and continues with the next input.'
};

export const JAVA_SCAFFOLD = [
  ['public class Main { ... }','The class is the program container. This workspace calls it Main and prepares the file for you.'],
  ['public static void main(String[] args) { ... }','Java begins at this method. Keep this supplied line while learning the instructions inside it. void means this method sends no result back.'],
  ['String[] args','The input values arrive as an array, an ordered group of text values. args[0] reads the first value; args.length tells you how many there are.'],
  ['System.out.println(value);','Display a value and finish the line. The semicolon ends the statement. Output is separate from the Java source you typed.']
];
