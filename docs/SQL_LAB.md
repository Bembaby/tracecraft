# Real SQL practice in TraceCraft

The SQL lab runs SQLite inside a Web Worker, using the vendored **sql.js 1.15.2** runtime. The runtime reports its actual SQLite version in the interface. Its database is a disposable, in-memory practice workspace. It does not connect to a production database, upload queries, or create a paid service.

## Exercises

Ten original exercises cover table creation and constraints, filtering and ordering, inner joins, left joins and zero counts, grouped spending, `NOT EXISTS` and `NULL`, latest-row window queries, targeted updates, transaction rollback, and index construction with a real query plan.

Each exercise includes a precise output or state contract, at least two public fixtures, progressive hints, an explanation, a deliberate bug, a reference solution, and primary documentation links. Changed fixtures include empty tables, duplicate names, tied dates, a guest order with a null customer key, and alternative starting amounts. A sample output that is simply hardcoded fails the changed-data checks.

The table-creation task starts from an empty database and also attempts invalid writes to check its constraints. Later exercises use synthetic customers and orders with integer amounts in cents. A nullable guest customer key is valid; an unknown non-null customer key is rejected with foreign-key enforcement enabled before seeding.

## Using the workspace

- **Run** executes the current script against the current practice database. Changes remain in that worker until Reset, navigation cleanup, timeout, or reload. SQL database contents are not durable progress.
- **Check** creates a separate fresh database for each fixture. Checking does not modify the Run workspace. Query checks compare columns and rows; mutation tasks inspect actual database state. Duplicate result rows are preserved. Row order is required only when the exercise explicitly asks for it.
- **Reset** discards only the SQL practice database and loads the selected exercise's seed. Saved editor drafts and learning evidence are separate UI concerns.
- **Cancel/dispose** terminates the worker and loses its database. A timed-out database is never silently represented as still intact.

Run from `npm start` or an HTTP(S) deployment. Browsers restrict worker/module loads from `file:` previews. The server must serve `.wasm` as `application/wasm`, JavaScript as a JavaScript MIME type, and allow local workers plus WebAssembly compilation in its CSP (`'wasm-unsafe-eval'`, not general `'unsafe-eval'`). All executable assets are served locally.

## Bounds and limitations

Execution requests have a five-second deadline enforced by the main thread terminating the worker. Initial WASM loading gets twenty seconds. A request accepts at most 20,000 source characters, 25 statements, 20 result tables, 32 columns per result, and 200 displayed rows per table. A shared 200,000-character output budget bounds materialized cell data across the request. Long cells and BLOBs are bounded and labelled as truncated; truncated results cannot pass graded comparisons. SQLite's hard heap limit is set to 32 MiB and the initial maximum main database size to 8,192 pages. A browser worker provides responsiveness and cancellation, not a certification against all hostile inputs or browser-engine bugs.

Multi-statement scripts are not automatically wrapped in a transaction. If an early statement succeeds and a later one fails, earlier writes can remain, just as SQLite's statement/transaction rules dictate. Practice explicit `BEGIN`, `COMMIT`, and `ROLLBACK`; reset if the workspace becomes confusing. A runaway query or an engine allocation failure may require reset.

The fixture checks are visible, client-side practice evidence. They are not a tamper-resistant examination, a proof of general SQL correctness, or a hiring score. Index construction is checked, while explaining the query plan is self-assessed. Query-plan output is displayed directly from SQLite and is not treated as stable across all versions. This single-connection engine does not reproduce PostgreSQL/MySQL roles, server administration, concurrent sessions, isolation experiments, backups/restores of a real service, or production deployment.

For the database-management track, use a real local PostgreSQL or MySQL instance as specified in the daily curriculum. Re-create the schema, use parameterized application queries, add a migration, create a restricted application role, back up, restore to a separate database, and verify the restored rows. That work remains separate from an in-browser SQL practice pass.

## Vendor provenance

Downloaded on 2026-10-28 from the exact official npm package:

`https://registry.npmjs.org/sql.js/-/sql.js-1.15.2.tgz`

The upstream release is [sql.js v1.15.2](https://github.com/sql-js/sql.js/releases/tag/v1.15.2). Its preceding v1.15.0 release upgraded SQLite to 3.54.0; the application verifies the live engine version rather than relying on this note alone.

| File | SHA-256 |
| --- | --- |
| `sql-wasm.js` | `b46d4bddfdde8a787fc4764bd0a405cdfdf96fbd77e6a4e95446106826ecfa47` |
| `sql-wasm.wasm` | `0dfeecda2070b36da0cd4f6afa250af9453de528a983770f85b13d5d6b667572` |
| `LICENSE` | `60a3f6e4d7b29b4321359e683b36cf198d24f58e24582070f56e6fa89d5ee2be` |

The vendored SQL.js distribution is MIT licensed, and its complete license notice is included at `public/vendor/sqljs/LICENSE`. SQLite is public domain. The vendor `package.json` only declares CommonJS interpretation for the Node test import; it installs no dependency or executable hook.

Primary references: [sql.js API](https://sql.js.org/documentation/database/), [SQLite foreign keys](https://sqlite.org/foreignkeys.html), [SELECT](https://sqlite.org/lang_select.html), [transactions](https://sqlite.org/lang_transaction.html), and [EXPLAIN QUERY PLAN](https://sqlite.org/eqp.html).

## Verification

Run `node --test tests/sql.test.mjs` for all reference solutions, deliberate bugs, constraint enforcement, changed-data grading, duplicate preservation, mutation inspection, result bounds, client cancellation and reset behavior, and actual index-plan output. The main project's `npm test` picks up the same test file automatically.
