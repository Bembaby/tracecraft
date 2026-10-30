// Complete original examples for local Java practice. No learner Java runs here.
const program=body=>`public class Main {\n    public static void main(String[] args) {\n${body.split('\n').map(line=>'        '+line).join('\n')}\n    }\n}\n`;
export const JAVA_PROGRAMS={
  'java-next-tools':{code:program('String left = new String("book");\nString right = new String("book");\nSystem.out.println(left.equals(right));\njava.util.List<String> names = new java.util.ArrayList<>();\nnames.add("Amina");\nnames.add("Omar");\nSystem.out.println(names.size());\ntry {\n    System.out.println(Integer.parseInt("abc"));\n} catch (NumberFormatException error) {\n    System.out.println("invalid");\n}'),output:'true\n2\ninvalid\n'},
  'java-start':{code:program('int energy = 3;\nenergy = energy + 2;\nSystem.out.println(energy);'),output:'5\n'},
  'java-types':{code:program('String name = "Amina";\nSystem.out.println("Hello, " + name + "!");'),output:'Hello, Amina!\n'},
  'java-decisions':{code:program('int coins = 3;\nif (coins >= 3) {\n    System.out.println("open");\n} else {\n    System.out.println("closed");\n}'),output:'open\n'},
  'java-arrays':{code:program('int[] values = {2, 0, -1, 3};\nint total = 0;\nfor (int value : values) {\n    total = total + value;\n}\nSystem.out.println(total);'),output:'4\n'},
  'java-methods':{code:'public class Main {\n    static int doubleValue(int value) {\n        return value * 2;\n    }\n    public static void main(String[] args) {\n        System.out.println(doubleValue(4));\n        System.out.println(doubleValue(0));\n    }\n}\n',output:'8\n0\n'},
  'java-classes':{code:'public class Main {\n    public static void main(String[] args) {\n        Counter first = new Counter();\n        Counter second = new Counter();\n        first.add(3);\n        System.out.println(first.count);\n        System.out.println(second.count);\n    }\n}\nclass Counter {\n    int count = 0;\n    void add(int amount) { count = count + amount; }\n}\n',output:'3\n0\n'}
};
export function downloadJavaProgram(id){
  const example=JAVA_PROGRAMS[id];if(!example)return;
  const url=URL.createObjectURL(new Blob([example.code],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');
  link.href=url;link.download='Main.java';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function javaExampleLabel(code){return code.startsWith('java ')?'Terminal command':/^(public )?class Main/.test(code)?'Complete Java program':/^(static |class )/.test(code)?'Java class or method definition':'Java instructions inside main';}
