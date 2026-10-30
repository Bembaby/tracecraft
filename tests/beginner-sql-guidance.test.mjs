import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import initSqlJs from '../public/vendor/sqljs/sql-wasm.js';
import {SQL_GUIDANCE_EXAMPLES,enrichSqlLesson} from '../src/beginner-sql-guidance.mjs';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';

let SQL;
before(async()=>{SQL=await initSqlJs({locateFile:name=>fileURLToPath(new URL('../public/vendor/sqljs/'+name,import.meta.url))});});

for(const example of SQL_GUIDANCE_EXAMPLES) {
  test(`${example.lessonId}: worked example ${example.section.title} matches actual SQLite`,()=>{
    const db=new SQL.Database();
    try {
      db.exec(example.setup);
      const output=db.exec(example.section.code).map(({columns,values})=>({columns,values}));
      assert.deepEqual(output,example.expected);
      for(const field of ['title','body','code','result'])assert.ok(example.section[field].trim());
      assert.doesNotMatch(Object.values(example.section).join('\n'),/\u2014/);
    } finally {db.close();}
  });
}

test('every SQL beginner lesson gains two teaching sections and retains its existing practice task',()=>{
  const lessons=BEGINNER_LESSONS.filter(lesson=>lesson.track==='sql');
  assert.equal(lessons.length,6);
  for(const lesson of lessons){
    const additions=SQL_GUIDANCE_EXAMPLES.filter(example=>example.lessonId===lesson.id);
    assert.equal(additions.length,2,lesson.id);
    assert.equal(lesson.sections.length,5,lesson.id);
    assert.deepEqual(lesson.sections.slice(-2),additions.map(example=>example.section));
    assert.equal(lesson.task.type,'sql');
  }
  const python={track:'python',sections:[]};assert.equal(enrichSqlLesson(python),python);
});

test('the quote explanation distinguishes a literal word from a stored title and escapes apostrophes',()=>{
  const db=new SQL.Database();
  try {
    db.exec("CREATE TABLE books (title TEXT); INSERT INTO books VALUES ('Sam''s book');");
    assert.deepEqual(db.exec("SELECT 'title' AS literal, title FROM books WHERE title = 'Sam''s book';")[0].values,[['title',"Sam's book"]]);
  } finally {db.close();}
});

test('the targeted update changes only the requested customer and rollback restores both records',()=>{
  const example=SQL_GUIDANCE_EXAMPLES.find(example=>example.section.title.startsWith('When you begin changing'));
  const db=new SQL.Database();
  try {
    db.exec(example.setup);
    db.exec("BEGIN; UPDATE customers SET name = 'Mina' WHERE customer_id = 1;");
    assert.deepEqual(db.exec('SELECT customer_id, name FROM customers ORDER BY customer_id;')[0].values,[[1,'Mina'],[2,'Omar']]);
    db.exec('ROLLBACK;');
    assert.deepEqual(db.exec('SELECT customer_id, name FROM customers ORDER BY customer_id;')[0].values,[[1,'Amina'],[2,'Omar']]);
  } finally {db.close();}
});
