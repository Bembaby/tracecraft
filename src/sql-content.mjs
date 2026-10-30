import {TCS_SQL_LABS} from './tcs-lab-content.mjs';
import {FITNESS_SQL_LABS} from './fitness-sql-content.mjs';
import { SQL_BACKEND_LABS } from './backend-content.mjs';
import { BEGINNER_SQL_LABS } from './beginner-content.mjs';
import { INTERVIEW_SQL_LABS } from './interview-sql-content.mjs';
// Original SQL practice material. Fixtures are intentionally visible: this is
// learning evidence, not a secure examination or a production database.
export const SQL_SEED = `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  ordered_at TEXT NOT NULL
);
INSERT INTO customers VALUES
  (1, 'Amina', 'amina@example.test'), (2, 'Omar', 'omar@example.test'),
  (3, 'Lena', NULL), (4, 'Sam', 'sam@example.test');
INSERT INTO orders VALUES
  (101, 1, 3000, 'paid', '2026-01-02'),
  (102, 1, 2000, 'pending', '2026-01-04'),
  (103, 2, 5000, 'paid', '2026-01-04'),
  (104, 2, 2500, 'cancelled', '2026-01-05'),
  (105, 4, 5000, 'paid', '2026-01-03'),
  (106, NULL, 750, 'paid', '2026-01-01');`;

const VARIANT_SEED = `${SQL_SEED}
INSERT INTO customers VALUES (5, 'Amina', 'another@example.test'), (6, 'No orders', NULL);
INSERT INTO orders VALUES
  (107, 5, 3000, 'paid', '2026-01-04'),
  (108, 1, 7000, 'paid', '2026-01-04'),
  (109, 3, 0, 'paid', '2026-01-06'),
  (110, 2, 1000, 'paid', '2026-01-07');`;
const EMPTY_SEED = `${SQL_SEED}\nDELETE FROM orders;`;
const SCHEMA = 'customers(customer_id PK, name NOT NULL, email UNIQUE nullable)\norders(order_id PK, customer_id FK nullable for guests, amount_cents >= 0, status, ordered_at ISO date)';
const SELECT_SOURCE = {title:'SQLite SELECT reference',url:'https://sqlite.org/lang_select.html'};
const result = (columns, values) => ({columns, values});
const fixture = (label, seedSql, columns, values, rest={}) => ({label,seedSql,expected:[result(columns,values)],...rest});

export const SQL_LABS = [
  ...BEGINNER_SQL_LABS,
  {
    id:'schema-join', title:'Build two related tables', topic:'Keys · constraints · INSERT · JOIN', minutes:25,
    prompt:'Start with an empty database. Create customers and orders, insert the sample records, and return every order with its customer name. A third customer must remain valid without an order.',
    contract:'customers: customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL. orders: order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(customer_id), amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0). Insert customers (1, Amina), (2, Omar), (3, Lena); orders (101, 1, 3000), (102, 1, 2000), (103, 2, 5000). Return columns customer_id, name, order_id, amount_cents ordered by order_id.',
    schema:'Empty database. Write CREATE TABLE and INSERT yourself.', seedSql:'', starter:'-- Create the parent table, then the child table.\n-- Insert rows and write the INNER JOIN.\n', ordered:true,
    solution:`CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0)
);
INSERT INTO customers VALUES (1, 'Amina'), (2, 'Omar'), (3, 'Lena');
INSERT INTO orders VALUES (101, 1, 3000), (102, 1, 2000), (103, 2, 5000);
SELECT c.customer_id, c.name, o.order_id, o.amount_cents
FROM customers AS c INNER JOIN orders AS o ON o.customer_id = c.customer_id
ORDER BY o.order_id;`,
    bug:`CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, amount_cents INTEGER NOT NULL);
INSERT INTO customers VALUES (1, 'Amina'), (2, 'Omar'), (3, 'Lena');
INSERT INTO orders VALUES (101, 1, 3000), (102, 1, 2000), (103, 2, 5000);
SELECT c.customer_id, c.name, o.order_id, o.amount_cents
FROM customers c JOIN orders o ON o.customer_id = c.customer_id ORDER BY o.order_id;`,
    hints:['A parent row must exist before a child row can reference its key.','Use REFERENCES customers(customer_id) on the child key. A JOIN does not create or enforce that constraint.','Start the query with FROM customers AS c, join orders AS o, and match their customer_id columns.'],
    explanation:'The primary keys identify records; the foreign key enforces that each non-null customer reference exists. A customer may have zero, one, or several orders. The join produces one row per matching order, so Amina appears twice and Lena does not appear. An unknown customer ID should fail at INSERT time, not disappear quietly at JOIN time.',
    complexity:'For these small tables the cost is negligible. In a larger database, the physical join algorithm and indexes determine cost; do not assign every JOIN one universal Big-O. Primary-key lookup can avoid scanning the whole parent table for each order.',
    sources:[SELECT_SOURCE,{title:'SQLite foreign key constraints',url:'https://sqlite.org/foreignkeys.html'}],
    fixtures:[
      fixture('Seeded rows, keys, and rejected invalid writes','',['customer_id','name','order_id','amount_cents'],[[1,'Amina',101,3000],[1,'Amina',102,2000],[2,'Omar',103,5000]],{rejects:[
        {sql:"INSERT INTO orders VALUES (999, 999, 10);",message:'An orphan order must be rejected.'},
        {sql:"INSERT INTO orders VALUES (998, 1, -10);",message:'A negative amount must be rejected.'},
        {sql:"INSERT INTO orders VALUES (997, NULL, 10);",message:'A null customer key must be rejected.'},
        {sql:"INSERT INTO orders VALUES (101, 1, 10);",message:'A duplicate order primary key must be rejected.'},
        {sql:"INSERT INTO orders VALUES (996, 1, NULL);",message:'A null amount must be rejected.'},
        {sql:"INSERT INTO customers VALUES (1, 'Duplicate');",message:'A duplicate customer primary key must be rejected.'},
        {sql:"INSERT INTO customers VALUES (50, NULL);",message:'A null customer name must be rejected.'}
      ]}),
      fixture('New customer and order still obey the relationship','',['customer_id','name','order_id','amount_cents'],[[1,'Amina',101,3000],[1,'Amina',102,2000],[2,'Omar',103,5000],[4,'Sam',104,1500]],{postSql:"INSERT INTO customers VALUES (4, 'Sam'); INSERT INTO orders VALUES (104, 4, 1500);",inspectSql:'SELECT c.customer_id, c.name, o.order_id, o.amount_cents FROM customers c JOIN orders o ON o.customer_id = c.customer_id ORDER BY o.order_id;'})
    ]
  },
  {
    id:'paid-orders',title:'Filter and order rows',topic:'SELECT · WHERE · ORDER BY',minutes:15,
    prompt:'Find paid orders worth at least 5,000 cents. Show the largest amount first; break ties by order_id ascending.',
    contract:'Return order_id, customer_id, amount_cents. Include the 5,000 boundary. Use the status column, not assumptions about amount. Guest orders have a null customer_id.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Write your SELECT from memory.\n',ordered:true,
    solution:"SELECT order_id, customer_id, amount_cents FROM orders WHERE status = 'paid' AND amount_cents >= 5000 ORDER BY amount_cents DESC, order_id ASC;",
    bug:"SELECT order_id, customer_id, amount_cents FROM orders WHERE status = 'paid' AND amount_cents > 5000 ORDER BY amount_cents DESC, order_id ASC;",
    hints:['Decide which columns you need before choosing filters.','Two conditions must be true: paid status AND the inclusive amount threshold.','ORDER BY amount_cents DESC, order_id ASC makes the tie order explicit.'],
    explanation:'WHERE filters individual rows. >= includes the exact threshold; > does not. Without ORDER BY, SQL makes no promise about row order. Naming a tie-breaker makes the result reproducible.',
    complexity:'Without a useful index this needs a scan over orders and may sort the qualifying rows. The query plan shows which access path the engine actually chooses.',sources:[SELECT_SOURCE],
    fixtures:[fixture('Boundary and equal amounts',SQL_SEED,['order_id','customer_id','amount_cents'],[[103,2,5000],[105,4,5000]]),fixture('An added larger order',VARIANT_SEED,['order_id','customer_id','amount_cents'],[[108,1,7000],[103,2,5000],[105,4,5000]]),fixture('No orders',EMPTY_SEED,['order_id','customer_id','amount_cents'],[])]
  },
  {
    id:'inner-join',previewQuery:'SELECT * FROM customers ORDER BY customer_id; SELECT * FROM orders ORDER BY order_id;',title:'Join customers to orders',topic:'INNER JOIN · cardinality',minutes:20,
    prompt:'Show the customer name alongside every order with a registered customer. Keep multiple orders from the same customer.',
    contract:'Return customer_id, name, order_id, amount_cents. Any row order is accepted. Exclude guest orders; preserve distinct orders even if they share a customer or amount.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Start with FROM, then decide the matching key.\n',ordered:false,
    solution:'SELECT c.customer_id, c.name, o.order_id, o.amount_cents FROM customers AS c INNER JOIN orders AS o ON c.customer_id = o.customer_id;',
    bug:'SELECT c.customer_id, c.name, o.order_id, o.amount_cents FROM customers AS c INNER JOIN orders AS o ON c.customer_id = o.order_id;',
    hints:['The relationship is stored in orders.customer_id.','Match c.customer_id to o.customer_id, not to order_id.','An INNER JOIN emits one row for every matching pair. It does not deduplicate customers.'],
    explanation:'Both sides must match the join predicate. A parent with no child is absent, and an order with a null customer key cannot match a customer. Two orders create two result rows for the same customer; this is expected one-to-many behavior.',
    complexity:'A join can scan child rows and probe a parent primary-key index. Actual work depends on row counts, indexes, and the chosen plan; the number of output pairs matters too.',sources:[SELECT_SOURCE],
    fixtures:[fixture('One-to-many, missing orders, and a guest',SQL_SEED,['customer_id','name','order_id','amount_cents'],[[1,'Amina',101,3000],[1,'Amina',102,2000],[2,'Omar',103,5000],[2,'Omar',104,2500],[4,'Sam',105,5000]]),fixture('Duplicate customer names and new orders',VARIANT_SEED,['customer_id','name','order_id','amount_cents'],[[1,'Amina',101,3000],[1,'Amina',102,2000],[2,'Omar',103,5000],[2,'Omar',104,2500],[4,'Sam',105,5000],[5,'Amina',107,3000],[1,'Amina',108,7000],[3,'Lena',109,0],[2,'Omar',110,1000]]),fixture('Empty child table',EMPTY_SEED,['customer_id','name','order_id','amount_cents'],[])]
  },
  {
    id:'left-join-count',title:'Keep customers with zero orders',topic:'LEFT JOIN · COUNT · NULL',minutes:25,
    prompt:'Count paid orders for every customer, including customers who have none. Show zero for those customers.',
    contract:'Return customer_id, name, paid_count, ordered by customer_id. Count paid order rows, not the placeholder row introduced by LEFT JOIN. Do not merge different customers with the same name.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Preserve the customer side, then count matching orders.\n',ordered:true,
    solution:"SELECT c.customer_id, c.name, COUNT(o.order_id) AS paid_count FROM customers AS c LEFT JOIN orders AS o ON o.customer_id = c.customer_id AND o.status = 'paid' GROUP BY c.customer_id, c.name ORDER BY c.customer_id;",
    bug:"SELECT c.customer_id, c.name, COUNT(*) AS paid_count FROM customers AS c LEFT JOIN orders AS o ON o.customer_id = c.customer_id AND o.status = 'paid' GROUP BY c.customer_id, c.name ORDER BY c.customer_id;",
    hints:['Use customers as the left table.','Put the paid-status condition in ON so unmatched customers remain.','COUNT(o.order_id) ignores the null placeholder. COUNT(*) counts it.'],
    explanation:'LEFT JOIN retains every left-side customer. For no matching paid order, the right-side values are NULL. COUNT(order_id) ignores NULL and returns zero. Putting o.status = paid in WHERE would remove these unmatched rows after the join.',
    complexity:'The engine must consider customers and qualifying orders, then group the join output. An index on orders(customer_id, status) may help probes; measure the real plan rather than assuming.',sources:[SELECT_SOURCE,{title:'SQLite aggregate functions',url:'https://sqlite.org/lang_aggfunc.html'}],
    fixtures:[fixture('Zero really means zero',SQL_SEED,['customer_id','name','paid_count'],[[1,'Amina',1],[2,'Omar',1],[3,'Lena',0],[4,'Sam',1]]),fixture('Same name, different primary keys',VARIANT_SEED,['customer_id','name','paid_count'],[[1,'Amina',2],[2,'Omar',2],[3,'Lena',1],[4,'Sam',1],[5,'Amina',1],[6,'No orders',0]]),fixture('All counts are zero',EMPTY_SEED,['customer_id','name','paid_count'],[[1,'Amina',0],[2,'Omar',0],[3,'Lena',0],[4,'Sam',0]])]
  },
  {
    id:'group-having',title:'Filter grouped spending',topic:'GROUP BY · SUM · HAVING',minutes:25,
    prompt:'Find registered customers whose total paid spending is at least 5,000 cents. Pending and cancelled orders do not count.',
    contract:'Return customer_id, name, total_cents ordered by customer_id. Group customers by their identity, even when names match. Apply the threshold to each sum.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Which condition belongs in WHERE, and which in HAVING?\n',ordered:true,
    solution:"SELECT c.customer_id, c.name, SUM(o.amount_cents) AS total_cents FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.status = 'paid' GROUP BY c.customer_id, c.name HAVING SUM(o.amount_cents) >= 5000 ORDER BY c.customer_id;",
    bug:"SELECT c.customer_id, c.name, SUM(o.amount_cents) AS total_cents FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.status = 'paid' AND o.amount_cents >= 5000 GROUP BY c.customer_id, c.name ORDER BY c.customer_id;",
    hints:['WHERE applies before grouping; HAVING applies to groups.','Sum only paid rows, then test each sum against 5000.','A customer can qualify through several small orders.'],
    explanation:'Filtering each order by its size answers a different question from filtering total spending. WHERE chooses the eligible paid rows; GROUP BY creates one group per customer; HAVING selects qualifying sums. Integer cents avoid introducing decimal rounding into this exercise.',
    complexity:'The paid rows are scanned or accessed through an index, joined, and aggregated. Grouping may use temporary sorting or an index-supported traversal. The optimizer and data distribution matter.',sources:[SELECT_SOURCE],
    fixtures:[fixture('Inclusive total threshold',SQL_SEED,['customer_id','name','total_cents'],[[2,'Omar',5000],[4,'Sam',5000]]),fixture('Several purchases contribute to totals',VARIANT_SEED,['customer_id','name','total_cents'],[[1,'Amina',10000],[2,'Omar',6000],[4,'Sam',5000]]),fixture('No qualifying groups',EMPTY_SEED,['customer_id','name','total_cents'],[])]
  },
  {
    id:'not-exists',title:'Find customers without paid orders',topic:'NOT EXISTS · three-valued logic',minutes:20,
    prompt:'Return customers who have never placed a paid order. The dataset includes a paid guest order with a null customer_id.',
    contract:'Return customer_id, name ordered by customer_id. A zero-cent paid order still counts as an order. Do not let a NULL in the orders table invalidate every comparison.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Ask whether a matching paid order exists for each customer.\n',ordered:true,
    solution:"SELECT c.customer_id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.status = 'paid') ORDER BY c.customer_id;",
    bug:"SELECT customer_id, name FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE status = 'paid') ORDER BY customer_id;",
    hints:['Think in terms of the absence of a matching row.','Correlate the inner query with the current customer_id.','NOT IN behaves unexpectedly when its subquery contains NULL. NOT EXISTS tests the existence of matching rows.'],
    explanation:'A correlated NOT EXISTS succeeds when there is no matching paid order for that customer. The guest NULL is not equal to any customer key. By contrast, NOT IN with a NULL in its candidate set can produce UNKNOWN, which WHERE does not retain.',
    complexity:'A naive correlated lookup could examine many orders for each customer. A matching index can make the existence probe cheaper and allow it to stop at the first match. Optimizers may transform the query.',sources:[SELECT_SOURCE,{title:'SQLite expression and NULL rules',url:'https://sqlite.org/lang_expr.html'}],
    fixtures:[fixture('Paid guest order has a NULL customer',SQL_SEED,['customer_id','name'],[[3,'Lena']]),fixture('Zero-cent purchase is still paid',VARIANT_SEED,['customer_id','name'],[[6,'No orders']]),fixture('No orders means all customers qualify',EMPTY_SEED,['customer_id','name'],[[1,'Amina'],[2,'Omar'],[3,'Lena'],[4,'Sam']])]
  },
  {
    id:'latest-order',title:'Choose one latest row per customer',topic:'Window functions · deterministic ties',minutes:30,
    prompt:'Return each registered customer’s latest order, regardless of status. Break same-day ties with the larger order_id.',
    contract:'Return customer_id, order_id, ordered_at ordered by customer_id. Exclude guest orders and customers with no orders. Dates are ISO YYYY-MM-DD text in this dataset, so text ordering matches date ordering.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Rank rows within each customer, then choose rank 1.\n',ordered:true,
    solution:`WITH ranked AS (
  SELECT customer_id, order_id, ordered_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC, order_id DESC) AS rn
  FROM orders WHERE customer_id IS NOT NULL
)
SELECT customer_id, order_id, ordered_at FROM ranked WHERE rn = 1 ORDER BY customer_id;`,
    bug:'SELECT customer_id, MAX(order_id) AS order_id, MAX(ordered_at) AS ordered_at FROM orders WHERE customer_id IS NOT NULL GROUP BY customer_id ORDER BY customer_id;',
    hints:['Partition by customer_id, then order the rows inside each partition.','ROW_NUMBER produces exactly one row numbered 1 in each nonempty partition.','Independent MAX values do not necessarily come from the same record.'],
    explanation:'A window function ranks complete rows without collapsing their columns independently. Ordering by date and then ID defines a stable winner. Taking MAX(order_id) and MAX(ordered_at) separately can combine values from two different orders.',
    complexity:'Without a matching ordered access path, the engine usually sorts rows within the partition order. A composite index can help but does not guarantee that every temporary sort disappears.',sources:[{title:'SQLite window functions',url:'https://sqlite.org/windowfunctions.html'}],
    fixtures:[fixture('One latest order per registered customer',SQL_SEED,['customer_id','order_id','ordered_at'],[[1,102,'2026-01-04'],[2,104,'2026-01-05'],[4,105,'2026-01-03']]),fixture('Ties plus an older order with a larger ID',`${VARIANT_SEED}\nINSERT INTO orders VALUES (999, 1, 100, 'paid', '2025-12-01');`,['customer_id','order_id','ordered_at'],[[1,108,'2026-01-04'],[2,110,'2026-01-07'],[3,109,'2026-01-06'],[4,105,'2026-01-03'],[5,107,'2026-01-04']]),fixture('Empty child table',EMPTY_SEED,['customer_id','order_id','ordered_at'],[])]
  },
  {
    id:'safe-update',title:'Change exactly the intended rows',topic:'UPDATE · WHERE · verify state',minutes:20,
    prompt:'Cancel all pending orders for customer 1. Preserve every other status and customer.',
    contract:'Run UPDATE against orders. The checker inspects the entire order_id/status table afterward; it does not grade a claimed SELECT output. Use both the customer and current-status conditions.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Preview the target rows with SELECT, then write the matching UPDATE.\n',ordered:true,
    solution:"UPDATE orders SET status = 'cancelled' WHERE customer_id = 1 AND status = 'pending'; SELECT order_id, status FROM orders ORDER BY order_id;",
    bug:"UPDATE orders SET status = 'cancelled' WHERE customer_id = 1; SELECT order_id, status FROM orders ORDER BY order_id;",
    hints:['A missing WHERE can change every row.','A customer match alone would also cancel already-paid orders.','Preview with SELECT using the exact WHERE expression before issuing UPDATE.'],
    explanation:'Safe modification begins with a precise predicate and checking the affected state. Matching both customer and pending status makes the operation repeatable: a second execution finds no remaining matching rows. In an application, bind the customer ID as a parameter.',
    complexity:'Without an index, finding targets can scan the table. Indexes can speed selection but each changed indexed value adds maintenance cost. Transaction and lock behavior differs across database engines.',sources:[{title:'SQLite UPDATE reference',url:'https://sqlite.org/lang_update.html'}],
    fixtures:[fixture('Paid orders must stay paid',SQL_SEED,['order_id','status'],[[101,'paid'],[102,'cancelled'],[103,'paid'],[104,'cancelled'],[105,'paid'],[106,'paid']],{inspectSql:'SELECT order_id, status FROM orders ORDER BY order_id;'}),fixture('Another customer also has a pending order',`${SQL_SEED}\nINSERT INTO orders VALUES (107, 2, 800, 'pending', '2026-01-08'), (108, 1, 900, 'pending', '2026-01-09');`,['order_id','status'],[[101,'paid'],[102,'cancelled'],[103,'paid'],[104,'cancelled'],[105,'paid'],[106,'paid'],[107,'pending'],[108,'cancelled']],{inspectSql:'SELECT order_id, status FROM orders ORDER BY order_id;'})]
  },
  {
    id:'rollback',title:'Make a change and roll it back',topic:'BEGIN · ROLLBACK · atomic work',minutes:25,
    prompt:'Practice a reversible adjustment: inside one transaction, add 1,000 cents to order 101 and subtract 1,000 from order 103. Show the adjusted amounts, roll back, and show the restored amounts.',
    contract:'Return exactly two result tables, each with order_id, amount_cents for orders 101 and 103, sorted by order_id. The first shows the adjustment; the second shows original values. Use relative updates because the second fixture starts with different balances. No other rows should be changed.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- BEGIN; make both updates; SELECT; ROLLBACK; SELECT again.\n',ordered:true,allResults:true,
    solution:`BEGIN;
UPDATE orders SET amount_cents = amount_cents + 1000 WHERE order_id = 101;
UPDATE orders SET amount_cents = amount_cents - 1000 WHERE order_id = 103;
SELECT order_id, amount_cents FROM orders WHERE order_id IN (101, 103) ORDER BY order_id;
ROLLBACK;
SELECT order_id, amount_cents FROM orders WHERE order_id IN (101, 103) ORDER BY order_id;`,
    bug:`BEGIN;
UPDATE orders SET amount_cents = amount_cents + 1000 WHERE order_id = 101;
UPDATE orders SET amount_cents = amount_cents - 1000 WHERE order_id = 103;
SELECT order_id, amount_cents FROM orders WHERE order_id IN (101, 103) ORDER BY order_id;
COMMIT;
SELECT order_id, amount_cents FROM orders WHERE order_id IN (101, 103) ORDER BY order_id;`,
    hints:['BEGIN groups the changes into an explicit transaction.','Use amount_cents = amount_cents + 1000 rather than a hardcoded final amount.','ROLLBACK discards the uncommitted changes; COMMIT keeps them.'],
    explanation:'A transaction groups related changes. Within it, this connection sees the adjusted values. ROLLBACK restores the previous state. This single-connection browser lab demonstrates rollback, not concurrent locking or isolation between independent clients.',
    complexity:'Each primary-key update targets one row, with database bookkeeping for rollback. Real systems also pay for durability, indexes, locks, and contention, which this in-memory exercise cannot measure.',sources:[{title:'SQLite transactions',url:'https://sqlite.org/lang_transaction.html'}],
    fixtures:[{label:'Observe adjusted and restored amounts',seedSql:SQL_SEED,expected:[result(['order_id','amount_cents'],[[101,4000],[103,4000]]),result(['order_id','amount_cents'],[[101,3000],[103,5000]])],stateSql:'SELECT order_id, amount_cents FROM orders ORDER BY order_id;',stateExpected:[result(['order_id','amount_cents'],[[101,3000],[102,2000],[103,5000],[104,2500],[105,5000],[106,750]])]},{label:'Different starting amounts',seedSql:`${SQL_SEED}\nUPDATE orders SET amount_cents = 4500 WHERE order_id = 101; UPDATE orders SET amount_cents = 6500 WHERE order_id = 103;`,expected:[result(['order_id','amount_cents'],[[101,5500],[103,5500]]),result(['order_id','amount_cents'],[[101,4500],[103,6500]])],stateSql:'SELECT order_id, amount_cents FROM orders ORDER BY order_id;',stateExpected:[result(['order_id','amount_cents'],[[101,4500],[102,2000],[103,6500],[104,2500],[105,5000],[106,750]])]}]
  },
  {
    id:'index-plan',title:'Add an index and inspect its plan',topic:'CREATE INDEX · EXPLAIN QUERY PLAN',minutes:25,
    prompt:'Create idx_orders_customer_date on orders(customer_id, ordered_at), in that order. Then inspect the real query plan for finding customer 2’s orders ordered by date.',
    contract:'The checker verifies the named index and its column order against two datasets. Run EXPLAIN QUERY PLAN SELECT order_id, ordered_at FROM orders WHERE customer_id = 2 ORDER BY ordered_at yourself and explain SCAN versus SEARCH. A pass checks index construction; plan interpretation is self-assessed, not automatically graded.',
    schema:SCHEMA,seedSql:SQL_SEED,starter:'-- Create the composite index, then inspect EXPLAIN QUERY PLAN.\n',ordered:true,
    solution:'CREATE INDEX idx_orders_customer_date ON orders(customer_id, ordered_at);\nEXPLAIN QUERY PLAN SELECT order_id, ordered_at FROM orders WHERE customer_id = 2 ORDER BY ordered_at;',
    bug:'CREATE INDEX idx_orders_customer_date ON orders(ordered_at, customer_id);\nEXPLAIN QUERY PLAN SELECT order_id, ordered_at FROM orders WHERE customer_id = 2 ORDER BY ordered_at;',
    hints:['Composite indexes have an ordered sequence of columns.','Start with the equality-filter column, customer_id, then the requested ordering column.','The plan text comes from SQLite. Do not infer execution time from a tiny sample dataset.'],
    explanation:'The index groups entries by customer, then date. This can support a customer lookup followed by ordered retrieval. EXPLAIN QUERY PLAN exposes SQLite’s chosen access path, not a universal plan across engines. Indexes require storage and work on inserts/updates, and plan output can change with versions and data.',
    complexity:'An index can reduce a full-table search to a range lookup plus matching-row traversal, but actual gains depend on selectivity and the planner. Creating the index itself scans and organizes existing entries.',sources:[{title:'SQLite EXPLAIN QUERY PLAN',url:'https://sqlite.org/eqp.html'},{title:'SQLite query planner',url:'https://sqlite.org/queryplanner.html'}],
    fixtures:[fixture('Index columns in the requested order',SQL_SEED,['name'],[['customer_id'],['ordered_at']],{inspectSql:"SELECT name FROM pragma_index_info('idx_orders_customer_date') ORDER BY seqno;"}),fixture('Same index contract on changed data',VARIANT_SEED,['name'],[['customer_id'],['ordered_at']],{inspectSql:"SELECT name FROM pragma_index_info('idx_orders_customer_date') ORDER BY seqno;"})]
  },
  ...SQL_BACKEND_LABS,
  ...INTERVIEW_SQL_LABS,
  ...FITNESS_SQL_LABS.map(task=>({...task,curriculum:'practical'})),
  ...TCS_SQL_LABS.map(task=>({...task,curriculum:'practical'}))
];

export function sqlLab(id) {
  const lab = SQL_LABS.find(item => item.id === id);
  if (!lab) throw new Error('Unknown SQL exercise.');
  return lab;
}
