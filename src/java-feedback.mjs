/** Plain-language recovery paired with the actual compiler or runtime message. */
export function javaErrorGuide(message='',context={}) {
  if(context.cancelled)return 'The run stopped. Your draft is still in the editor. You can change it or choose Run my code again.';
  if(context.phase==='load')return 'The Java compiler could not load. Check your connection, use a current browser with WebAssembly GC support, and retry. Your code has not been checked.';
  if(context.phase==='compile'&&context.timedOut)return 'The browser compiler did not finish in time. Retry with a smaller program or reload Java. This timeout happened before your program ran.';
  if(/';' expected/.test(message))return 'Java expects a semicolon at the end of a statement. Check this line and the line just above it.';
  if(/unclosed string|unclosed character|illegal line end/.test(message))return 'Check the opening and closing quotation marks. Text uses double quotes, such as "Hello".';
  if(/cannot find symbol/.test(message))return 'Java cannot find that name. Check its spelling, capitalization, and whether you declared the variable before using it.';
  if(/incompatible types|cannot be converted/.test(message))return 'The value has the wrong type for this variable or result. An int stores a whole number; a String stores text. Read the Input and Output contract before changing the type.';
  if(/reached end of file|class, interface|illegal start|expected.*[{}]|'}' expected/.test(message))return 'Check the braces around the Main class, main method, and any if or loop block. Every opening brace needs a closing brace.';
  if(/ArrayIndexOutOfBounds|Index.*out of bounds|index out of bounds/i.test(message))return 'Your code tried to read an array position that does not exist. The first position is 0; check the array length before reading an item.';
  if(/NumberFormatException|For input string/.test(message))return 'A text input could not be read as a whole number. Use the numeric inputs in this task, or handle invalid text if the contract asks for it.';
  if(/NullPointer|dereferencing a null/.test(message))return 'A value was missing when code tried to use it. Check which object should be created or returned before that line. If the supplied starter fails before running, reload Java and retry.';
  if(/Unsupported Java runtime import|interop|argument array entries|Browser object access/.test(message))return 'This program asks for a browser or library feature outside this Java workspace. Use the supported console-program features listed above.';
  if(/too long|time limit/i.test(message))return 'Check the loop condition and the variable that changes on each repetition. Try the smallest input, then run again.';
  return 'Read the exact message and line number below. Compare that line with the lesson example, change one thing, and run again. Your draft is preserved.';
}

export function javaLineRange(source,line) {
  if(!Number.isSafeInteger(line)||line<1)return null;
  const lines=source.split('\n');if(line>lines.length)return null;
  const start=lines.slice(0,line-1).reduce((total,value)=>total+value.length+1,0);
  return {start,end:start+lines[line-1].length};
}
