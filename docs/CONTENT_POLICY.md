# Detailed teaching without copying the library

## Editorial rule

Teach concepts through original explanations, original diagrams, tested examples, and original exercises. Link to primary references and correctly attributed further reading. Do not scrape or republish entire textbooks, paid courses, question banks, or substantial passages merely because they are useful or visible online.

Depth should come from multiple explanation levels: plain-language intuition; exact definition; worked trace; mathematical or algorithmic argument; counterexample; debugging task; real project; interview explanation; primary reading. The same concept can be richly taught without reproducing another author’s chapter.

## Rights are recorded before ingestion

A source record should include:

```json
{
  "id": "example-source-id",
  "title": "Source title",
  "author": "Author or organization",
  "edition": "Exact edition/version",
  "canonicalUrl": "https://example.org/source",
  "retrievedAt": "2026-09-08",
  "license": "unknown",
  "permissionEvidence": null,
  "allowedUse": "link-only",
  "commercialRedistribution": false,
  "attributionRequired": true,
  "reviewStatus": "needs-human-license-review"
}
```

“Unknown” never means “probably free.” Review individual assets and code samples as well as the enclosing page. Keep edition-specific evidence, changes, source paths, and attribution. Do not infer an exact license from another edition or a similarly named repository.

## Examples from this research

**Think Python, third edition** is linked, not copied. Its publisher’s page lists Attribution-NonCommercial-ShareAlike 4.0. That restriction is material to a product that may later charge subscriptions; do not simply ingest and relicense it as MIT. [Publisher and license statement](https://greenteapress.com/wp/think-python-3rd-edition/).

**Operating Systems: Three Easy Pieces** is a valuable reading source around virtualization, concurrency, and persistence. Free access is not a determination that every page may be redistributed commercially. Its chapters were not imported into this repository. [Author-hosted book](https://pages.cs.wisc.edu/~remzi/OSTEP/).

**Composing Programs** has edition/version-specific material and licensing statements. Keep a specific version record and verify the corresponding terms instead of assuming the current site and historical editions share one license. The alpha only links to it. [Official source](https://composingprograms.com/).

**Software Carpentry’s linked lesson license page** explicitly distinguishes lesson material and example code licenses. It is an example of a clearer permission record, not permission to ignore attribution or the status of separately included assets. [License page](https://swcarpentry.github.io/python-novice-images/license/).

**VisuAlgo** is inspiration for algorithm visualization, not a code source for this app. Its published guidance should be consulted before any reuse; the research does not authorize rehosting its implementation. TraceCraft’s diagrams and interpreter are original. [Official example and reuse guidance](https://visualgo.net/en/sorting).

These are concrete editorial constraints, not a comprehensive legal opinion. Before a commercial content ingestion program, obtain appropriately scoped rights review.

## Public library versus private study material

Public lessons require rights to distribute to everyone. A learner’s personal upload is a different use case: authenticate the uploader, restrict document access, avoid public indexing, and apply the authorized scope through retrieval and generated outputs. Uploading a book is not automatic evidence of broad rights.

Before supporting uploads, define allowed sources, storage jurisdiction, retention, deletion, model-provider transmission, and an appropriate rights/dispute process. Do not turn one user’s private text or notes into a public lesson. Do not put uploads or exported progress into Git.

A private RAG pipeline must preserve permissions on raw files, extracted text, chunks, indexes, caches, and logs. It should not answer another user with restricted passages. Quotation length, attribution, and output policy still matter when generation is involved.

## Lesson authoring checklist

Every lesson begins with a single observable objective and prerequisites. It includes a short original explanation; an executable example; a line-by-line interpretation; an edge case that reveals a misconception; an independent task; a repair task; a justified complexity statement; a text alternative to every visual; a spoken-explanation rubric; source links; and a versioned review record.

Technical reviewers validate language semantics and output in the named runtime. Editorial reviewers check clarity and source use. Rights reviewers decide whether anything besides a link can be imported. Accessibility reviewers verify that the same learning goal remains attainable without motion, sound, a mouse, or 3D hardware.

In this alpha, all eight exercise prompts and teaching paragraphs are original, all fixture tests are visible, and external readings are links. No textbook passage has been copied into the app’s retrieval corpus.
