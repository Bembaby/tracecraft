# The two-hour developer practice session

Use one recurring session to write code, test it, explain it, and revisit a weakness. The target is independent performance and recovery when a problem is unfamiliar. A timer, a streak, or a viewed solution cannot establish that on its own.

This plan schedules **120 minutes, including a 10-minute break**. The eight-week route has 56 suggested sessions and 112 scheduled hours; it is a planning scaffold rather than a deadline for expertise. Repeat a difficult gate and reduce new content when needed. The detailed assignments are in [DEVELOPER_PATH.md](DEVELOPER_PATH.md), with the same structured content in `src/training-content.mjs`.

## The daily loop

| Minutes | Activity | Evidence to leave behind |
|---|---|---|
| 0-10 | Recall yesterday without notes | A fresh query or function, predicted output, and the exact point of uncertainty |
| 10-25 | Learn one small concept | Three sentences: what it is, why it is needed, how it works |
| 25-70 | Write and test | A first attempt, a normal input, an edge case, and a repaired failure |
| 70-80 | Break | Step away; these minutes are not counted as coding |
| 80-105 | Build a project step or investigate a failure | A runnable change, test, migration, or short investigation note |
| 105-115 | Explain your decision | A concise explanation with a trade-off and a follow-up answer |
| 115-120 | Log evidence and the next retry | Assistance used, one corrected mistake, and tomorrow’s exact starting task |

Start the timer when ready to work and pause it when interrupted. Keep a session note when your main task is in a terminal, IDE, or database tool outside TraceCraft. Never interpret elapsed time alone as an independently completed task.

## How to use answers and AI during practice

1. Read the requirement, state the input/output contract, and predict a tiny example.
2. Save an attempt before viewing a hint. Spend about ten minutes making a useful first attempt; do not spend the whole session staring at a blank editor.
3. If stuck, ask for one diagnostic question or a small hint. Keep ownership of the next line of code.
4. Run the code and inspect the actual result. Add an input that would expose your mistaken assumption.
5. After a full solution view, mark that attempt assisted. Close it, use changed data, and try again later.
6. For independent assessment, use no answer-generating assistance. For ordinary project work, use documentation and tools deliberately, and explain what you accepted and verified.

The difference between an assisted solution and an independent retry is useful information, not a moral judgment. A result check proves only the tested behavior. A later attempt on changed data and an explanation provide different evidence.

## The first three sessions

### Session 1: a valid schema and a join

Start the SQL lab from a blank editor. Create a parent table and child table with a real foreign key. Include one parent with no children and one with two children. Insert only valid child references. Write an INNER JOIN, predict the rows, and run it. Change to a LEFT JOIN and explain the added row.

In the project block, write the relationship between `users` and `workouts` for a small learning project. Close the answer and reconstruct the query using new names. Finish by explaining the join key, result cardinality, and a constraint failure.

### Session 2: Python object state and sequence operations

Use the full Python drills or a local Python 3 interpreter. Implement `Workout.__init__`, create two instances, and prove that each owns a different list. Practice append, indexing, and slices with an exclusive stop. Write assertions for an empty list, a short list, and no accidental input mutation.

The original Mini-Python practice lab cannot run these class/function/string exercises. It remains useful for its supported numeric tracing exercises; do not interpret a mini-runtime limitation as a Python language rule.

### Session 3: combine skills under a small time limit

Attempt a new two-table query for 15 minutes, a short Python function for 20 minutes, and a three-minute architecture explanation. Save the initial work before review. Spend the remaining practice and project blocks repairing the weakest part and adding a revealing test.

When you cannot recall something, use a concrete recovery sentence: “I’ll make a tiny example, identify the relationship, and write the smallest correct step.” Begin with table names, a function signature, or one expected row. The objective is useful progress while uncertain.

## What gets logged

- The requirement and the code/query you wrote.
- Whether you needed a hint, documentation, or a full answer.
- Actual results and one edge case.
- What you changed after a failed attempt, and why.
- Your explanation: what, why, how, trade-off, failure case.
- A later independent attempt using changed data.

Project tasks may use a local MySQL database, Java/Spring project, terminal, or IDE. Check them off only after producing the stated deliverable. These are self-assessments unless a separate observed check is explicitly identified.

## Weekly check

Choose an unfamiliar variation, a previous error, and an explanation. Attempt them with the old answer hidden. Ask whether the tests would reject your earlier incorrect approach. Demonstrate a concrete behavior rather than reporting that a tutorial felt familiar.

If an entire two-hour session is impossible, do one short complete loop: ten minutes of recall, fifteen minutes of writing/testing, and five minutes of explanation. Record it as a shorter session. Resume the normal plan the next day without trying to manufacture a perfect streak.

## Environments and references

The SQL lab uses SQLite in the browser. MySQL transaction, query-plan, migration, backup, and account-management tasks require a separate local MySQL instance with synthetic data. Python exercises need full Python 3. Java/Spring assignments run in a local learning project. Completing browser queries alone does not verify database administration or production operations.

- [Python tutorial: sequences](https://docs.python.org/3/tutorial/introduction.html)
- [Python tutorial: classes](https://docs.python.org/3/tutorial/classes.html)
- [MySQL tutorial](https://dev.mysql.com/doc/refman/8.4/en/tutorial.html)
- [Spring JDBC guide](https://spring.io/guides/gs/relational-data-access/)
- [Microservices architecture trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)

The exercises and plan are original TraceCraft assignments. The linked primary documentation supports language and platform behavior; it is not evidence that a fixed schedule guarantees a learning or hiring outcome.
