// Original console tasks that bridge the Java foundations and interview practice.
const main = body => `public class Main {\n    public static void main(String[] args) {\n${body.split('\n').map(line=>'        '+line).join('\n')}\n    }\n}\n`;
const fixture = (name,args,stdout) => ({name,args,stdout});
const lab = value => ({...value,starter:value.bug,prerequisite:'java-next-tools'});
const firstMatchProgram = found => `public class Main {
    static int firstIndex(int[] values, int target) {
        int low = 0;
        int high = values.length - 1;
        int answer = -1;
        while (low <= high) {
            int middle = low + (high - low) / 2;
            if (values[middle] == target) {
${found}
            } else if (values[middle] < target) {
                low = middle + 1;
            } else {
                high = middle - 1;
            }
        }
        return answer;
    }

    public static void main(String[] args) {
        int target = args.length == 0 ? 0 : Integer.parseInt(args[0]);
        int[] values = new int[Math.max(0, args.length - 1)];
        for (int i = 0; i < values.length; i++) {
            values[i] = Integer.parseInt(args[i + 1]);
        }
        System.out.println(firstIndex(values, target));
    }
}
`;

export const JAVA_ALGORITHM_LABS = [
  lab({
    id:'java-stable-unique',title:'Keep the first appearance of each label',
    goal:'Remove repeated labels while preserving the order in which different labels first arrived.',
    contract:{
      input:'Between 0 and 50 text arguments. Each label has at most 40 characters and contains no newline or carriage return. An empty label is allowed. Treat uppercase and lowercase as different, and preserve spaces.',
      output:'First print the number of different labels. Then print each different label on its own line, in first-appearance order. Every printed line ends with a newline. No inputs print only 0 and a newline.',
      edgeCases:'Repeated labels appear once. Empty text is one real label and produces a blank output line after the count. Do not sort labels, trim spaces, or combine labels that differ in case.',
      mutation:'Keep the input arguments unchanged. Build a separate collection that remembers which labels have appeared.'
    },
    solution:main('java.util.Set<String> unique = new java.util.LinkedHashSet<>();\nfor (String label : args) {\n    unique.add(label);\n}\nSystem.out.println(unique.size());\nfor (String label : unique) {\n    System.out.println(label);\n}'),
    bug:main('java.util.List<String> unique = new java.util.ArrayList<>();\nfor (String label : args) {\n    unique.add(label);\n}\nSystem.out.println(unique.size());\nfor (String label : unique) {\n    System.out.println(label);\n}'),
    hints:['The starter keeps every input in a list, so repeated labels still appear. You need a collection that keeps at most one equal value.', 'LinkedHashSet rejects an equal duplicate while retaining the first-insertion order. add does not move an item that is already present.'],
    explanation:'A set stores at most one copy of each equal value. LinkedHashSet also retains insertion order, so the first time each label arrives determines its output position. Adding a duplicate leaves both membership and order unchanged. An ArrayList alone stores every occurrence, which is the deliberate starter bug. Checks compare results; they do not require one particular collection.',
    complexity:'For n labels with c total characters, expected O(c + n) processing and output time using hashing, and O(n) extra collection references. Label text is already present in the input. Hash-table operations are expected constant time after hashing, not a worst-case constant-time guarantee.',
    teaching:[
      {title:'A set answers whether a value is already present',body:'The same String can arrive more than once. A set accepts its first addition and keeps one entry when it arrives again. Predict the size before running this complete example.',code:main('java.util.Set<String> labels = new java.util.LinkedHashSet<>();\nlabels.add("blue");\nlabels.add("blue");\nSystem.out.println(labels.size());'),result:'1\n'},
      {title:'Insertion order is different from sorted order',body:'LinkedHashSet remembers when each different value first arrived. Iteration reads that order. The repeat of blue does not move blue to the end. Sorting would change the requirement.',code:main('java.util.Set<String> labels = new java.util.LinkedHashSet<>();\nlabels.add("blue");\nlabels.add("amber");\nlabels.add("blue");\nfor (String label : labels) {\n    System.out.println(label);\n}'),result:'blue\namber\n'},
      {title:'Empty text still has a place',body:'An empty String is a value; zero input values means no values were supplied. Here the set contains one empty String. The second printed line is blank, so exact line endings matter.',code:main('java.util.Set<String> labels = new java.util.LinkedHashSet<>();\nlabels.add("");\nSystem.out.println(labels.size());\nfor (String label : labels) {\n    System.out.println(label);\n}'),result:'1\n\n'}
    ],
    fixtures:[fixture('Repeat without sorting',['blue','amber','blue','green'],'3\nblue\namber\ngreen\n'),fixture('Changed arrival order',['z','a','z','b','a'],'3\nz\na\nb\n'),fixture('No labels',[],'0\n'),fixture('One empty label',[''],'1\n\n'),fixture('Repeated empty labels',['','','x',''],'2\n\nx\n'),fixture('Case and spaces remain different',['A','a',' A ','A'],'3\nA\na\n A \n'),fixture('Fifty arrivals retain one label',Array(50).fill('repeat'),'1\nrepeat\n'),fixture('Forty-character label',['long'.repeat(10),'long'.repeat(10)],'1\n'+'long'.repeat(10)+'\n')]
  }),
  lab({
    id:'java-count-labels',title:'Count labels without losing their first order',
    goal:'Associate each label with its occurrence count, then display the counts in first-appearance order.',
    contract:{
      input:'Between 0 and 50 text arguments. Each label has at most 40 characters and contains no equals sign, newline, or carriage return. Empty labels and spaces are allowed. Equality is case-sensitive.',
      output:'Print the number of different labels first. Then print one label=count line for each different label, in first-appearance order. The equals sign has no added surrounding spaces. End every line with a newline. No inputs print only 0 and a newline.',
      edgeCases:'Count every duplicate. An empty label is printed as =count. Preserve spaces and case exactly. A label that appears later again keeps its original output position.',
      mutation:'Do not change the input arguments. Store occurrence counts in a separate map with one entry per different label.'
    },
    solution:main('java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();\nfor (String label : args) {\n    counts.put(label, counts.getOrDefault(label, 0) + 1);\n}\nSystem.out.println(counts.size());\nfor (String key : counts.keySet()) {\n    System.out.println(key + "=" + counts.get(key));\n}'),
    bug:main('java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();\nfor (String label : args) {\n    counts.put(label, 1);\n}\nSystem.out.println(counts.size());\nfor (String key : counts.keySet()) {\n    System.out.println(key + "=" + counts.get(key));\n}'),
    hints:['The starter overwrites every count with 1. A repeat should increase the existing value instead.', 'getOrDefault(label, 0) reads the old count, using zero only for a label that has not appeared. Add one before storing the new value with put.'],
    explanation:'A map associates a key with a value. The label is the key, and an Integer occurrence count is the value. getOrDefault supplies zero for a new label; adding one also handles repeats. LinkedHashMap retains the first insertion order when an existing key is updated. Storing 1 every time forgets previous occurrences.',
    complexity:'For n input labels with c total input characters, expected O(c + n) counting time using hashing, plus time proportional to the printed output. The map stores O(k) entries for k different labels. Counts are bounded by 50. Hash-table operations have expected, not guaranteed worst-case, constant lookup cost after hashing.',
    teaching:[
      {title:'A map remembers a value for each key',body:'The key is a label, and the value is its count. Integer is the object form of int used by this collection. get reads the stored count for an existing key.',code:main('java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();\ncounts.put("blue", 2);\nSystem.out.println(counts.get("blue"));'),result:'2\n'},
      {title:'Read the previous count before replacing it',body:'getOrDefault reads an existing count or returns the supplied default for an absent key. Each arrival increases that value by one. Predict the count after two arrivals.',code:main('java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();\nString[] labels = {"blue", "blue"};\nfor (String label : labels) {\n    counts.put(label, counts.getOrDefault(label, 0) + 1);\n}\nSystem.out.println(counts.get("blue"));'),result:'2\n'},
      {title:'Read keys and counts together',body:'keySet lets a loop visit each key, and get(key) reads its associated count. Updating blue does not change its first position in a LinkedHashMap. This complete example prints blue before amber.',code:main('java.util.Map<String, Integer> counts = new java.util.LinkedHashMap<>();\ncounts.put("blue", 1);\ncounts.put("amber", 1);\ncounts.put("blue", 2);\nfor (String key : counts.keySet()) {\n    System.out.println(key + "=" + counts.get(key));\n}'),result:'blue=2\namber=1\n'}
    ],
    fixtures:[fixture('Repeated labels',['blue','amber','blue'],'2\nblue=2\namber=1\n'),fixture('Changed order and counts',['z','z','a','b','a','z'],'3\nz=3\na=2\nb=1\n'),fixture('No labels',[],'0\n'),fixture('One label',['solo'],'1\nsolo=1\n'),fixture('Repeated empty label',['','','x',''],'2\n=3\nx=1\n'),fixture('Preserve case and spaces',['A','a',' A ','A'],'3\nA=2\na=1\n A =1\n'),fixture('Fifty arrivals all count',Array(50).fill('repeat'),'1\nrepeat=50\n'),fixture('Forty-character label',['long'.repeat(10),'long'.repeat(10)],'1\n'+'long'.repeat(10)+'=2\n')]
  }),
  lab({
    id:'java-first-match',title:'Find the first matching position in sorted numbers',
    goal:'Use binary search to find the leftmost matching array position, including repeated values.',
    contract:{
      input:'The first argument is an integer target, followed by 0 to 50 integer data values in nondecreasing sorted order. Every integer is from -1000 to 1000. No arguments means target 0 with an empty data array. The supplied main method parses this setup.',
      output:'Print the zero-based position of the first matching data value, or -1 if the target is absent. The target argument itself is not part of the data array. Print one integer followed by a newline.',
      edgeCases:'An empty data array returns -1. Repeated targets require the leftmost position. A target below the smallest value or above the largest value returns -1. Negative data and a target at either boundary are valid.',
      mutation:'Keep the sorted values array unchanged. Move low and high search bounds and remember a matching position in a separate answer variable.'
    },
    solution:firstMatchProgram('                answer = middle;\n                high = middle - 1;'),
    bug:firstMatchProgram('                return middle;'),
    hints:['A matching middle position proves that the target exists, but an equal value may still exist to its left.', 'Remember middle in answer, then search the remaining left side by setting high = middle - 1. Continue until the bounds cross.'],
    explanation:'The remaining candidate interval is between low and high, inclusive. A smaller middle value rules out that position and everything left of it; a larger middle value rules out the right side. On equality, remember a valid answer but continue left to find an earlier match. Returning immediately on equality is the deliberate bug: it may return a later duplicate.',
    complexity:'The firstIndex search uses O(log n) time and O(1) extra working space for n sorted data values, because every iteration reduces the candidate interval. The complete console program also parses and stores all n inputs, so its total time is O(n) and its input array uses O(n) space. The bounds keep parsing and arithmetic within int range.',
    teaching:[
      {title:'Positions belong to the data array',body:'An array position starts at zero. The target is a separate value, not an array item. In this complete example, the first 4 is at data position 1.',code:main('int[] values = {1, 4, 4, 8};\nSystem.out.println(values[1]);'),result:'4\n'},
      {title:'Sorted order lets you discard one side',body:'low and high include all remaining candidates. Here the middle value is smaller than the target, so positions up to middle cannot contain the target. Moving low to middle + 1 makes progress.',code:main('int[] values = {1, 3, 5, 7};\nint target = 7;\nint low = 0;\nint high = values.length - 1;\nint middle = low + (high - low) / 2;\nif (values[middle] < target) {\n    low = middle + 1;\n}\nSystem.out.println(low);'),result:'2\n'},
      {title:'A match is a candidate, not necessarily the first',body:'A match at position 2 can have an equal value before it. Save it, then narrow the right bound to search earlier positions. The full task repeats these steps while low is no greater than high.',code:main('int[] values = {1, 4, 4, 4, 8};\nint middle = 2;\nint answer = middle;\nint high = middle - 1;\nSystem.out.println(answer);\nSystem.out.println(high);'),result:'2\n1\n'}
    ],
    fixtures:[fixture('Match among repeated values',['4','1','4','4','4','8'],'1\n'),fixture('Changed target and first position',['-3','-3','-3','0','9'],'0\n'),fixture('No arguments',[],'-1\n'),fixture('Target with no data',['7'],'-1\n'),fixture('Absent between values',['4','1','3','5','7'],'-1\n'),fixture('Last position',['9','-2','0','9'],'2\n'),fixture('Below all data',['-1000','-999','0','1000'],'-1\n'),fixture('Above all data',['1000','-1000','0','999'],'-1\n'),fixture('Every value matches',['0','0','0','0','0'],'0\n'),fixture('Fifty sorted data values',['24',...Array.from({length:50},(_,i)=>String(i-25))],'49\n'),fixture('Fifty matching data values',['-1000',...Array(50).fill('-1000')],'0\n')]
  })
];
