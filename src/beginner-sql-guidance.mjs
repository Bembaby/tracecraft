// Original worked examples extend existing lessons without adding graded tasks.
const books = `CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, pages INTEGER);
INSERT INTO books VALUES (1, 'Morning Trail', 90), (2, 'City Bridges', 160), (3, 'Pocket Map', 90);`;
const customers = `CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER);
INSERT INTO customers VALUES (1, 'Amina'), (2, 'Omar');
INSERT INTO orders VALUES (101, 1), (102, 1);`;
const example = (lessonId, section, setup, expected) => ({lessonId, section, setup, expected});

export const SQL_GUIDANCE_EXAMPLES = [
  example('why-sql', {
    title:'Ask a new question without copying the records',
    body:'Suppose books stores three records with 90, 160, and 90 pages. SQL can answer how many are short without moving those rows into a separate hand-counted list. COUNT(*) counts matching rows, and WHERE pages <= 100 keeps books with at most 100 pages. The same query can be run after records change. Python or Java can handle application rules and call the database; SQL describes the data the application needs. A database also supports constraints and transactions, which you will meet later. Correct design, access rules, and backups still need deliberate work.',
    code:'SELECT COUNT(*) AS short_books\nFROM books\nWHERE pages <= 100;',
    result:'short_books\n2'
  }, books, [{columns:['short_books'], values:[[2]]}]),
  example('why-sql', {
    title:'Recognize the language parts',
    body:'SELECT, FROM, WHERE, and ORDER BY are SQL keywords with specific jobs. books and title are names chosen for a table and column. The text value is enclosed in single quotes; the semicolon ends the statement. This example has three books: Morning Trail, City Bridges, and Pocket Map. It asks for the title that exactly matches Morning Trail. You write the query; the prepared database supplies the records.',
    code:"SELECT title\nFROM books\nWHERE title = 'Morning Trail'\nORDER BY id;",
    result:'title\nMorning Trail'
  }, books, [{columns:['title'], values:[['Morning Trail']]}]),
  example('sql-filters', {
    title:'A column name and a text value mean different things',
    body:"title names the column to read. 'Morning Trail' is the text to compare with each stored title. Use single quotes around text values, rather than around the column name. Selecting 'title' would repeat the literal word title instead of reading the titles. To put an apostrophe inside a SQL text value, double it, as in 'Sam''s book'.",
    code:"SELECT id, title\nFROM books\nWHERE title = 'Morning Trail'\nORDER BY id;",
    result:'id | title\n1  | Morning Trail'
  }, books, [{columns:['id','title'], values:[[1,'Morning Trail']]}]),
  example('sql-filters', {
    title:'Combine conditions and keep the boundary',
    body:'AND requires both comparisons to be true for a row. In this three-book example, the page counts are 90, 160, and 90. The query keeps both 90-page records. A result is a view of matching data; filtering does not delete the excluded record. Use >= and <= when the endpoints belong in the answer. Use OR when either condition is sufficient, and parentheses when combining more complex alternatives.',
    code:'SELECT id, pages\nFROM books\nWHERE pages >= 90 AND pages <= 100\nORDER BY id;',
    result:'id | pages\n1  | 90\n3  | 90'
  }, books, [{columns:['id','pages'], values:[[1,90],[3,90]]}]),
  example('sql-order', {
    title:'Read a whole query in plain language',
    body:'One way to reason about a query is: FROM chooses input records, WHERE keeps matches, SELECT chooses result columns, and ORDER BY arranges the result. That is a thinking aid, not a promise about the database engine’s execution plan. SQL writes SELECT first. Here the three books have 90, 160, and 90 pages. Both 90-page books stay, with their IDs deciding the tie.',
    code:'SELECT id, title\nFROM books\nWHERE pages >= 90\nORDER BY pages DESC, id ASC;',
    result:'id | title\n2  | City Bridges\n1  | Morning Trail\n3  | Pocket Map'
  }, books, [{columns:['id','title'], values:[[2,'City Bridges'],[1,'Morning Trail'],[3,'Pocket Map']]}]),
  example('sql-order', {
    title:'Choose the first rows only after defining first',
    body:'LIMIT 2 keeps two result rows. Without ORDER BY, it does not mean the two shortest books or the first records you happened to insert. Sort by the quantity you mean and add a stable tie rule. With page counts 90, 160, and 90, the two shortest books are IDs 1 and 3. A limit of two can still return fewer rows when fewer match.',
    code:'SELECT id, title\nFROM books\nORDER BY pages ASC, id ASC\nLIMIT 2;',
    result:'id | title\n1  | Morning Trail\n3  | Pocket Map'
  }, books, [{columns:['id','title'], values:[[1,'Morning Trail'],[3,'Pocket Map']]}]),
  example('sql-count', {
    title:'Count rows separately from known values',
    body:'For this example, three book records have ratings 4, NULL, and 4. NULL means the rating is missing or unknown; it is not the number zero. COUNT(*) counts all three records. COUNT(rating) counts the two records with a known rating. COUNT(DISTINCT rating) counts one different known rating value. Choose the question before choosing the count.',
    code:'SELECT COUNT(*) AS records,\n       COUNT(rating) AS known_ratings,\n       COUNT(DISTINCT rating) AS different_ratings\nFROM books;',
    result:'records | known_ratings | different_ratings\n3       | 2             | 1'
  }, 'CREATE TABLE books (id INTEGER PRIMARY KEY, rating INTEGER); INSERT INTO books VALUES (1,4),(2,NULL),(3,4);', [{columns:['records','known_ratings','different_ratings'], values:[[3,2,1]]}]),
  example('sql-count', {
    title:'Filter the records before counting them',
    body:'WHERE selects the rows that contribute to the count. These example books have 90, 160, and 90 pages, so none has more than 1,000 pages. COUNT(*) without GROUP BY still produces a summary row containing zero. Do not confuse that zero with an error or with a result that has no rows.',
    code:'SELECT COUNT(*) AS total\nFROM books\nWHERE pages > 1000;',
    result:'total\n0'
  }, books, [{columns:['total'], values:[[0]]}]),
  example('sql-groups', {
    title:'Filter individual rows with WHERE, then groups with HAVING',
    body:'This example has nature books of 90, 160, and 180 pages and one travel book of 200 pages. WHERE removes the 90-page record before grouping. GROUP BY makes a summary for each remaining shelf. HAVING then keeps only shelves whose summary count is at least two. Using a group count in WHERE confuses these two stages.',
    code:'SELECT shelf, COUNT(*) AS total\nFROM books\nWHERE pages >= 100\nGROUP BY shelf\nHAVING COUNT(*) >= 2\nORDER BY shelf;',
    result:'shelf  | total\nnature | 2'
  }, "CREATE TABLE books (id INTEGER PRIMARY KEY, shelf TEXT, pages INTEGER); INSERT INTO books VALUES (1,'nature',90),(2,'nature',160),(3,'nature',180),(4,'travel',200);", [{columns:['shelf','total'], values:[['nature',2]]}]),
  example('sql-groups', {
    title:'Return facts that describe the whole group',
    body:'SUM(pages) adds the page counts within each shelf. The nature values 90, 160, and 180 total 430; travel has 200. A shelf name and aggregate describe each group clearly. Adding an individual book title without grouping or aggregating it would not say which book represents that shelf. Some databases reject that ambiguous query; do not rely on SQLite permitting some such forms.',
    code:'SELECT shelf, SUM(pages) AS total_pages\nFROM books\nGROUP BY shelf\nORDER BY shelf;',
    result:'shelf  | total_pages\nnature | 430\ntravel | 200'
  }, "CREATE TABLE books (id INTEGER PRIMARY KEY, shelf TEXT, pages INTEGER); INSERT INTO books VALUES (1,'nature',90),(2,'nature',160),(3,'nature',180),(4,'travel',200);", [{columns:['shelf','total_pages'], values:[['nature',430],['travel',200]]}]),
  example('sql-relationships', {
    title:'Keep unmatched records and count actual matches',
    body:'Amina has two orders; Omar has none. LEFT JOIN keeps both customers. Amina’s two result matches are expected because one customer can have many orders. For Omar, the order columns are NULL. COUNT(o.order_id) counts actual orders and returns zero for Omar. COUNT(*) would count his preserved result row and incorrectly report one order. Adding DISTINCT to hide repeated customer names would also hide the relationship instead of explaining it.',
    code:'SELECT c.name, COUNT(o.order_id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY c.customer_id;',
    result:'name  | order_count\nAmina | 2\nOmar  | 0'
  }, customers, [{columns:['name','order_count'], values:[['Amina',2],['Omar',0]]}]),
  example('sql-relationships', {
    title:'When you begin changing data, target and undo deliberately',
    body:'This is a preview of the later update lessons. WHERE targets customer 1; omitting it would rename every customer. BEGIN starts a transaction, and ROLLBACK undoes this change. The first SELECT shows Mina; the second shows Amina again. The browser uses a disposable SQLite database, not a live application database. SQLite and MySQL share many SQL ideas but differ in types, functions, and transaction details. Later project work must test its actual database engine.',
    code:"BEGIN;\nUPDATE customers SET name = 'Mina' WHERE customer_id = 1;\nSELECT name FROM customers WHERE customer_id = 1;\nROLLBACK;\nSELECT name FROM customers WHERE customer_id = 1;",
    result:'First SELECT: Mina\nAfter ROLLBACK: Amina'
  }, customers, [{columns:['name'], values:[['Mina']]},{columns:['name'], values:[['Amina']]}])
];

export function enrichSqlLesson(lesson) {
  if(lesson.track !== 'sql') return lesson;
  const additions = SQL_GUIDANCE_EXAMPLES.filter(example => example.lessonId === lesson.id).map(example => example.section);
  return {...lesson, sections:[...lesson.sections, ...additions]};
}
