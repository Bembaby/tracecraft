import {enrichPythonLessons} from './beginner-python-guidance.mjs';
import {enrichSqlLesson} from './beginner-sql-guidance.mjs';
import {JAVA_LAB_BY_ID} from './java-content.mjs';
import {JAVA_BRIDGE_LESSONS} from './java-bridge-content.mjs';
import {PYTHON_BRIDGE_LESSONS,SQL_BRIDGE_LESSONS} from './beginner-bridge-content.mjs';
// Original first steps. Every runnable task uses the existing browser workers.
import {PYTHON_VALUE_DRILLS,PYTHON_VALUE_LESSONS} from './beginner-python-content.mjs';
import {PYTHON_CONTROL_DRILLS,PYTHON_CONTROL_LESSONS} from './beginner-control-content.mjs';
import {PYTHON_FUNCTION_DRILLS,PYTHON_FUNCTION_LESSONS} from './beginner-functions-content.mjs';
import {FIRST_SQL_LABS,FIRST_SQL_LESSONS,BOOK_SEED,BOOK_CHANGED,BOOK_EMPTY,BOOK_TIED} from './beginner-sql-content.mjs';
import {SQL_SUMMARY_LABS,SQL_SUMMARY_LESSONS} from './beginner-sql-summary-content.mjs';
import {FIRST_JAVA_LESSONS} from './beginner-java-content.mjs';
import {JAVA_NEXT_LESSONS} from './beginner-java-next-content.mjs';
const pythonSource={title:'Python introduction',url:'https://docs.python.org/3/tutorial/introduction.html'};
export const BEGINNER_PYTHON_DRILLS=[{
  id:'hello-output',level:'beginner',title:'Display your first message',topic:'First program · print',
  prompt:'Write one Python instruction that displays Hello, coder! in the output area. The capitalization, comma, space, and exclamation mark must match. Do not type the surrounding quotation marks into the output.',
  contract:'No input is needed. The program must print exactly Hello, coder! followed by one line break. Do not print any extra lines or spaces. Use print with a quoted text value.',
  starter:'# Write your print instruction below.\n',solution:'print("Hello, coder!")\n',bug:'print("Hello coder!")\n',
  tests:'import sys\nassert sys.stdout.getvalue() == "Hello, coder!\\n", "Expected exactly Hello, coder! on one line. Check punctuation, spaces, and print()."',
  explanation:'print is a Python instruction that displays a value. The parentheses hold the value to display. Quotation marks tell Python that Hello, coder! is text. The quotation marks are part of the code, so they do not appear in the output. print adds a line break at the end.',
  complexity:'The greeting has a fixed length, so this task uses a fixed amount of work and memory: O(1) time and space. Printing arbitrary text would depend on its length.',
  fixtures:[{label:'Exact message',assertion:'Output is Hello, coder! with the comma and space.'},{label:'No extra output',assertion:'No extra spaces, blank lines, or quotation marks are printed.'},{label:'Line ending',assertion:'Exactly one final line break is present.'}],
  hints:['Start with print, then put the text inside parentheses.','Text needs matching quotation marks. For example, print("Hi!") displays Hi!'],sources:[pythonSource]
},...PYTHON_VALUE_DRILLS,...PYTHON_CONTROL_DRILLS,...PYTHON_FUNCTION_DRILLS];

const bookStates=new Map([
  [BOOK_EMPTY,[]],
  [BOOK_SEED,[[1,'River Notes',120,'nature'],[2,'Small Circuits',240,'technology'],[3,'Night Walk',200,'nature']]],
  [BOOK_CHANGED,[[2,'Same title',200,'nature'],[4,'Pocket Book',80,'travel'],[7,'Same title',0,'nature'],[9,'Larger Book',201,'technology']]],
  [BOOK_TIED,[[1,'Tie',200,'travel'],[2,'Same title',200,'nature'],[4,'Pocket Book',80,'travel'],[7,'Same title',0,'nature'],[9,'Larger Book',201,'technology']]]
]);
const bookRows=seed=>{if(!bookStates.has(seed))throw new Error('Author an unchanged-table expectation for this book fixture.');return bookStates.get(seed);};
export const BEGINNER_SQL_LABS=[...FIRST_SQL_LABS,...SQL_SUMMARY_LABS].map(lab=>({...lab,previewQuery:'SELECT id, title, pages, shelf FROM books ORDER BY id;',fixtures:lab.fixtures.map(fixture=>({...fixture,stateSql:'SELECT id, title, pages, shelf FROM books ORDER BY id; PRAGMA table_info(books);',stateExpected:[{columns:['id','title','pages','shelf'],values:bookRows(fixture.seedSql)},{columns:['cid','name','type','notnull','dflt_value','pk'],values:[[0,'id','INTEGER',0,null,1],[1,'title','TEXT',1,null,0],[2,'pages','INTEGER',1,null,0],[3,'shelf','TEXT',1,null,0]]}]}))}));

export const BEGINNER_LESSONS=enrichPythonLessons([{
  id:'what-is-code',track:'python',title:'What is code? Run your first instruction',outcome:'Read one instruction and display a message.',
  why:'A computer follows precise instructions. A program is a collection of those instructions; code is the text you write. Python is one language for writing programs. People use it to automate repetitive work, process data, and build services.',
  terms:[['Program','Instructions for a computer to follow.'],['Run','Ask the computer to follow your instructions.'],['Output','The result the program displays.'],['Text (a string)','Characters between matching quotation marks.']],
  sections:[{title:'Read a single instruction',body:'print tells Python to display something. Put what you want to display inside parentheses. Put text inside matching quotation marks. Python treats uppercase and lowercase letters as different, so write print in lowercase.',code:'print("I am learning.")',result:'I am learning.'},
    {title:'Code and output are different',body:'The quotation marks and parentheses help Python understand the instruction. They do not become part of the displayed message. To change the message, change the text inside the quotation marks.',code:'print("A new message!")',result:'A new message!'},
    {title:'A mistake is useful information',body:'A missing quotation mark or closing parenthesis causes a syntax error. Syntax means the writing rules of a language. An error tells you that Python could not follow the instruction; check the punctuation and try again.',code:'print("Ready to try?")',result:'Ready to try?'}],
  task:{type:'python',id:'hello-output'},practice:'Use print to display your own first greeting. The lab tells you the exact message to produce.',recap:'Can you point to the instruction, the text value, and the resulting output?'
},...PYTHON_VALUE_LESSONS,...PYTHON_CONTROL_LESSONS,...PYTHON_FUNCTION_LESSONS,...PYTHON_BRIDGE_LESSONS,...FIRST_SQL_LESSONS,...SQL_SUMMARY_LESSONS,...SQL_BRIDGE_LESSONS,...FIRST_JAVA_LESSONS,...JAVA_NEXT_LESSONS,...JAVA_BRIDGE_LESSONS].map(enrichSqlLesson).map(lesson=>{
  if(lesson.track!=='java')return lesson;
  const lab=JAVA_LAB_BY_ID.get(lesson.id);
  const revised={...lesson,readingTask:lesson.task,task:{type:'java',id:lesson.id},practice:lab.goal+' The lab provides a complete Main.java starter. Read its exact inputs and output, edit the marked instructions, then run and check your program.'};
  if(lesson.id==='java-start'){
    revised.outcome='Find the starting method, edit an instruction, and run Java in the browser.';
    revised.why='Java is used for backend services and many structured applications. Explicit types help catch mistakes before running. Traditional Java applications run on the Java Virtual Machine (JVM); this browser workspace instead compiles supported console programs to WebAssembly with javac and TeaVM. You can write and run these lessons here without installing a JDK. Java and JavaScript are separate languages.';
    revised.sections=lesson.sections.map((section,index)=>index===0?{...section,body:'This complete console program runs in the browser Java workspace. Main is the class name, and main is the starting method. For now, focus on the instruction inside main: System.out.println displays text. The surrounding braces group instructions. You will learn methods and classes later.'}:index===2?{title:'Run one example, then check changed inputs',body:'Open the linked Java task and choose Enable browser Java. The site loads the compiler for you. Keep the Main class and main method, then edit the instructions inside. Run my code shows the output for your input values. Check my answer runs the same code with several different inputs. A compile error means Java could not translate the code; read its line details and try again.',code:'int energy = 3;\nenergy = energy + 2;\nSystem.out.println(energy);',result:'5 (inside main). With a starting value of 8, the same update displays 10.'}:section);
  }
  if(lesson.id==='java-next-tools'){
    revised.outcome='Use a growable collection and handle an expected conversion error.';
    revised.terms=[...lesson.terms,['Integer','The object form of int. List<Integer> stores whole-number objects; Java converts between int and Integer automatically in these examples.']];
    revised.sections=lesson.sections.map((section,index)=>index===1?{...section,body:section.body+' The task uses List<Integer> for whole numbers. Collections store objects, so Java uses Integer, the object form of int, and converts automatically when adding or reading a number.'}:section);
  }
  return revised;
}));
export const BEGINNER_LESSON_BY_ID=new Map(BEGINNER_LESSONS.map(item=>[item.id,item]));
export const lessonForTask=(type,id)=>BEGINNER_LESSONS.find(item=>item.task?.type===type&&item.task.id===id);
