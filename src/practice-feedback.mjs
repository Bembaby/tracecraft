export const pythonFailureKind=(error='')=>/^(Python could not (start|complete)|The Python (runtime download|worker returned)|Python workers are unavailable)/.test(error)?'runtime':'code';
export function pythonErrorGuide(error=''){
  if(/IndentationError|TabError/.test(error))return 'Check the spaces at the start of each line. Instructions inside if, for, or def need consistent indentation. Use the Indent 4 spaces control if helpful.';
  if(/SyntaxError/.test(error))return 'Python could not read this instruction. Check matching quotation marks and parentheses. An if, for, or def line also needs a colon.';
  if(/NameError/.test(error))return 'A name was used before Python knew its value. Check its spelling and give it a value before using it.';
  if(/TypeError/.test(error))return 'An operation received a kind of value or argument it could not use. Compare the task’s expected input types with your code, especially text and numbers.';
  if(/AssertionError/.test(error))return 'The program ran, but a check did not get the required result. Read the failed check, compare its input and expected answer, and try that example.';
  if(pythonFailureKind(error)==='runtime')return 'Python could not finish loading or running in this browser. Check your connection and try Run again. Your code draft stays in the editor.';
  if(/time limit|timed out|execution limit/i.test(error))return 'This run took too long and was stopped. Check that each loop makes progress. You can edit the code and run again.';
  if(/download|fetch|network|load/i.test(error))return 'Python could not finish loading or running. Check your connection and try Run again. Your code draft stays in the editor.';
  return 'Read the error details, compare your code with the task, and change one thing at a time. A hint can help you choose the next step.';
}
export function sqlErrorGuide(error=''){
  if(/no such (column|table)/i.test(error))return 'Check table and column names against the starting data. SQL needs their exact names. Reset restores this task’s prepared database and keeps your code draft.';
  if(/syntax error|incomplete input/i.test(error))return 'Check the SQL words and their order. For these reading queries, use SELECT, FROM, then WHERE if needed, followed by GROUP BY or ORDER BY as required.';
  return 'Read the error details and compare the query with the task. If a previous write changed the practice data, Reset restores the starting database and keeps your draft.';
}
