// Original SQLite fixtures. Every set belongs to a workout/exercise association.
const ddl = [
  'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)',
  'CREATE TABLE workouts (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL, started_at TEXT NOT NULL, duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0))',
  'CREATE TABLE exercises (id INTEGER PRIMARY KEY, name TEXT NOT NULL)',
  'CREATE TABLE workout_exercises (id INTEGER PRIMARY KEY, workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE, exercise_id INTEGER NOT NULL REFERENCES exercises(id), position INTEGER NOT NULL CHECK (position >= 1), UNIQUE (workout_id, position))',
  'CREATE TABLE workout_sets (id INTEGER PRIMARY KEY, workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE, set_number INTEGER NOT NULL CHECK (set_number >= 1), reps INTEGER NOT NULL CHECK (reps >= 0), weight_kg REAL CHECK (weight_kg >= 0), UNIQUE (workout_exercise_id, set_number))'
];
export const FITNESS_SCHEMA_SQL = ddl.join(';\n') + ';';
const columns = {
  users:['id','name','email'], workouts:['id','user_id','title','started_at','duration_minutes'],
  exercises:['id','name'], workout_exercises:['id','workout_id','exercise_id','position'],
  workout_sets:['id','workout_exercise_id','set_number','reps','weight_kg']
};
const tables = Object.keys(columns);
const base = {
  users:[[1,'Amina','amina@example.test'],[2,'Omar',null],[3,'Li','li@example.test'],[4,'Rae','rae@example.test']],
  workouts:[[101,1,'Circuit','2026-03-02T07:00:00Z',20],[102,1,'Lift','2026-03-03T12:00:00Z',30],[103,2,'Mobility','2026-03-04T18:00:00Z',15],[104,1,'Walk','2026-03-03T12:00:00Z',10],[105,3,'Next week','2026-03-09T00:00:00Z',40]],
  exercises:[[1,'Press'],[2,'Row'],[3,'Step']],
  workout_exercises:[[1001,101,1,1],[1002,101,2,2],[1003,102,1,1],[1004,103,3,1],[1005,104,3,1]],
  workout_sets:[[5001,1001,1,8,10],[5002,1001,2,8,12],[5003,1002,1,10,null],[5004,1003,1,5,20],[5005,1003,2,5,20],[5006,1004,1,0,0]]
};
const copy = value => structuredClone(value);
const changed = copy(base);
changed.users.push([5,'Amina',null],[6,'Jules','jules@example.test']);
for(let i=0;i<10;i++)changed.workouts.push([110+i,1,'Changed '+i,`2026-03-${String(2+Math.floor(i/2)).padStart(2,'0')}T09:00:00Z`,i]);
changed.workouts.push([120,5,'Exact threshold','2026-03-02T00:00:00Z',30],[121,6,'Above threshold','2026-03-08T23:59:59Z',31],[122,2,'Before interval','2026-03-01T23:59:59Z',90],[123,2,'End boundary','2026-03-09T00:00:00Z',90],[124,4,'Repeated duration first','2026-03-03T08:00:00Z',20],[125,4,'Repeated duration second','2026-03-05T08:00:00Z',20]);
changed.workout_exercises.push([1006,101,1,3],[1007,105,2,1]);
changed.workout_sets.push([5007,1006,1,2,5],[5008,1007,1,3,4]);
const noWorkouts = {...copy(base),workouts:[],workout_exercises:[],workout_sets:[]};
const empty = {users:[],workouts:[],exercises:[],workout_exercises:[],workout_sets:[]};
const datasets = [['Starting fitness records',base],['Changed records, ties, repeats and boundaries',changed],['Users with no workouts',noWorkouts],['Empty database tables',empty]];
const literal = value => value === null ? 'NULL' : typeof value === 'number' ? String(value) : "'" + value.replaceAll("'","''") + "'";
const insertRows = (table,rows) => rows.length ? `INSERT INTO ${table} VALUES ${rows.map(row=>'('+row.map(literal).join(',')+')').join(',')};` : '';
const seed = data => FITNESS_SCHEMA_SQL + tables.map(table=>insertRows(table,data[table])).join('\n');
export const FITNESS_SEED_SQL = seed(base);
const result = (names,values) => ({columns:names,values});
const stateSql = tables.map(table=>`SELECT ${columns[table].join(',')} FROM ${table} ORDER BY id;`).join('\n') + "\nSELECT name, sql FROM sqlite_schema WHERE type = 'table' AND name IN ('users','workouts','exercises','workout_exercises','workout_sets') ORDER BY name;";
const state = data => [...tables.map(table=>result(columns[table],data[table].toSorted((a,b)=>a[0]-b[0]))),result(['name','sql'],ddl.map(sql=>[sql.split(' ')[2],sql]).toSorted((a,b)=>a[0].localeCompare(b[0])))];
const schemaSnapshotSql = "SELECT 'main' AS schema_name,type,name,tbl_name,sql FROM sqlite_schema WHERE name NOT GLOB 'sqlite_*' UNION ALL SELECT 'temp' AS schema_name,type,name,tbl_name,sql FROM sqlite_temp_schema WHERE name NOT GLOB 'sqlite_*' ORDER BY schema_name,type,name;";
const schemaSnapshot = definitions => result(['schema_name','type','name','tbl_name','sql'],definitions.map(sql=>{const name=sql.split(' ')[2];return ['main','table',name,name,sql];}).toSorted((a,b)=>a[2].localeCompare(b[2])));
const readStateSql = stateSql+'\n'+schemaSnapshotSql;
const readState = data => [...state(data),schemaSnapshot(ddl)];
const readFixtures = (names,expected) => datasets.map(([label,data])=>({label,seedSql:seed(data),expected:[result(names,expected(data))],stateSql:readStateSql,stateExpected:readState(data)}));
const utc = 'All timestamps are fixed-width UTC text in YYYY-MM-DDTHH:MM:SSZ form. A stated interval includes its start and excludes its end. These exercises execute SQLite, not MySQL.';
const schema = 'users(id PK, name, email UNIQUE nullable)\nworkouts(id PK, user_id FK users, title, started_at UTC text, duration_minutes >= 0)\nexercises(id PK, name)\nworkout_exercises(id PK, workout_id FK workouts, exercise_id FK exercises, position >= 1, UNIQUE(workout_id, position))\nworkout_sets(id PK, workout_exercise_id FK workout_exercises, set_number >= 1, reps >= 0, weight_kg nullable >= 0, UNIQUE(workout_exercise_id, set_number))';
const source = (title,url) => ({title,url});
const sources = [source('SQLite SELECT processing','https://sqlite.org/lang_select.html'),source('SQLite foreign key relationships','https://sqlite.org/foreignkeys.html')];
function task(value){
  const hints=value.hints;
  return {version:'2026-10-29.2',track:'sql',difficulty:'foundation',minutes:20,level:'practice',prerequisites:[],variants:[],review:{intervalDays:[1,3,7,14],requiresChangedInputs:true},gradingMethod:'SQLite result/state fixtures; written explanations are self-assessed',schema,seedSql:FITNESS_SEED_SQL,previewQuery:'SELECT id, user_id, title, started_at, duration_minutes FROM workouts ORDER BY id;',ordered:true,sources,...value,
    assistance:{nudge:hints[0],question:hints[1],example:value.analogy||'For a separate table of deliveries, first decide whether each output row represents one delivery or one customer.',scaffold:value.scaffold||value.starter,solution:value.solution}};
}
const between = row => row[3]>='2026-03-02T00:00:00Z'&&row[3]<'2026-03-09T00:00:00Z';
const byId = rows => rows.toSorted((a,b)=>a[0]-b[0]);
const readonly = 'Read the prepared tables without changing rows or schema.';

export const FITNESS_SQL_LABS = [
  task({id:'fitness-filter-workouts',title:'Find a user\'s substantial workouts',topic:'Fitness SQL: SELECT, aliases, WHERE and ordering',skills:['sql-select'],minutes:15,
    prompt:'Return user 1\'s workouts lasting at least 20 minutes. Show workout_id, title and minutes, ordered by workout_id ascending.',
    contract:readonly+' Return exactly workout_id, title, minutes in that order. Include duration_minutes = 20 and preserve separate workouts with equal titles. Return no rows if none qualify. '+utc,
    starter:'SELECT ___\nFROM workouts\nWHERE ___\nORDER BY ___;',
    solution:'SELECT id AS workout_id, title, duration_minutes AS minutes FROM workouts WHERE user_id = 1 AND duration_minutes >= 20 ORDER BY id;',
    bug:'SELECT id AS workout_id, title, duration_minutes AS minutes FROM workouts WHERE user_id = 1 AND duration_minutes > 20 ORDER BY id;',
    hints:['Choose the columns first, then keep rows meeting both conditions.','Does a 20-minute workout belong in at least 20?'],
    analogy:'For sessions lasting at least 5 minutes, duration >= 5 includes the boundary while duration > 5 does not.',
    prediction:'Before Run, list the qualifying workout IDs and the three output column names.',
    explanation:'SELECT chooses values and AS gives the requested result names. WHERE requires both the owner and inclusive duration condition. The deliberate bug loses the exact 20-minute boundary.',
    complexity:'Reading W workouts takes O(W) work. An explicit sort can take O(K log K) for K matches; result space is O(K). A suitable access path can avoid a separate sort.',
    fixtures:readFixtures(['workout_id','title','minutes'],data=>byId(data.workouts.filter(row=>row[1]===1&&row[4]>=20)).map(row=>[row[0],row[2],row[4]]))}),
  task({id:'fitness-latest-seven',title:'Find the latest seven workouts with a tie rule',topic:'Fitness SQL: ORDER BY, LIMIT and tied timestamps',skills:['sql-select','sql-ordering'],prerequisites:['fitness-filter-workouts'],
    prompt:'Return at most seven workouts for user 1, newest first. When two start times are equal, the larger workout ID comes first.',
    contract:readonly+' Return workout_id, started_at, duration_minutes. Filter user_id = 1, sort started_at descending and then id descending, and return at most 7 rows. IDs are unique. Empty input returns no rows. '+utc,
    starter:'SELECT id AS workout_id, started_at, duration_minutes\nFROM workouts\nWHERE user_id = 1\nORDER BY ___\nLIMIT ___;',
    solution:'SELECT id AS workout_id, started_at, duration_minutes FROM workouts WHERE user_id = 1 ORDER BY started_at DESC, id DESC LIMIT 7;',
    bug:'SELECT id AS workout_id, started_at, duration_minutes FROM workouts WHERE user_id = 1 ORDER BY started_at DESC, id ASC LIMIT 7;',
    hints:['Define newest and the equal-time tie rule before applying LIMIT.','If IDs 102 and 104 have the same time, which must be returned first?'],
    prediction:'Predict the first two rows when timestamps tie, and count how many rows LIMIT can return.',
    explanation:'A timestamp alone does not define a deterministic order when several rows tie. The unique ID breaks that tie. LIMIT applies after the chosen ordering; it does not mean seven calendar days.',
    complexity:'Without a suitable index, filtering and sorting W rows can take O(W log W) time. A matching composite index permits a user range traversal and early stopping after seven matches. Output size is bounded by 7.',
    fixtures:readFixtures(['workout_id','started_at','duration_minutes'],data=>data.workouts.filter(row=>row[1]===1).toSorted((a,b)=>b[3].localeCompare(a[3])||b[0]-a[0]).slice(0,7).map(row=>[row[0],row[3],row[4]]))}),
  task({id:'fitness-insert-workout',title:'Insert one workout without replacing existing data',topic:'Fitness SQL: INSERT and constraints',skills:['sql-mutations','sql-constraints'],
    prompt:'Insert workout 900 for user 1: title Recovery, start 2026-03-05T08:00:00Z, duration 0 minutes. Keep every existing row unchanged.',
    contract:'The fixture always contains user 1 and no workout 900. Insert exactly the stated workout with id 900 and no child associations or sets. Zero is valid; negative duration is invalid. The checker inspects stored rows and rejects duplicate primary keys. '+utc,
    starter:'INSERT INTO workouts (id, user_id, title, started_at, duration_minutes)\nVALUES (___);',
    solution:"INSERT INTO workouts (id,user_id,title,started_at,duration_minutes) VALUES (900,1,'Recovery','2026-03-05T08:00:00Z',0);",
    bug:"INSERT INTO workouts (id,user_id,title,started_at,duration_minutes) VALUES (900,1,'Recovery','2026-03-05T08:00:00Z',1);",
    hints:['List the five target columns and pair each with its supplied value.','Is zero missing data here, or a valid stated duration?'],
    prediction:'Predict the new workout count and which existing rows should change.',
    explanation:'An INSERT creates a new row. A primary key identifies it and the foreign key requires an existing owner. This contract deliberately permits zero minutes. In an application, bind values as parameters rather than interpolating user input into SQL.',
    complexity:'An insertion updates the table and relevant indexes. B-tree key maintenance is typically O(log W), plus foreign-key lookup and index costs; storage grows by one row.',
    sources:[...sources,source('SQLite INSERT','https://sqlite.org/lang_insert.html')],
    fixtures:[base,changed,noWorkouts].map((data,i)=>{const after=copy(data);after.workouts.push([900,1,'Recovery','2026-03-05T08:00:00Z',0]);return {label:['Starting data','Changed existing rows','Owner with no earlier workouts'][i],seedSql:seed(data),inspectSql:'SELECT id, user_id, title, started_at, duration_minutes FROM workouts WHERE id=900;',expected:[result(columns.workouts,[[900,1,'Recovery','2026-03-05T08:00:00Z',0]])],stateSql,stateExpected:state(after),rejects:[{sql:"INSERT INTO workouts VALUES(900,1,'Duplicate','2026-03-05T08:00:00Z',0);",message:'The primary key must reject a duplicate workout ID.'}]};})}),
  task({id:'fitness-update-workout',title:'Correct one owned workout safely',topic:'Fitness SQL: UPDATE, WHERE and ownership scope',skills:['sql-mutations','request-ownership'],
    prompt:'Change workout 102 to 35 minutes only when it belongs to user 1. Do not change any other field or row.',
    contract:'Update only duration_minutes for id = 102 AND user_id = 1. If workout 102 is missing or belongs to another user, change nothing. SQL ownership predicates are defense in depth; a real service must derive the trusted user from authentication. '+utc,
    starter:'UPDATE workouts\nSET duration_minutes = 35\nWHERE ___;',
    solution:'UPDATE workouts SET duration_minutes=35 WHERE id=102 AND user_id=1;',
    bug:'UPDATE workouts SET duration_minutes=35 WHERE id=102;',
    hints:['The row ID and trusted owner must both match.','What happens if the same requested ID belongs to user 2?'],
    prediction:'Predict affected rows for the normal fixture, a missing ID, and another owner.',
    explanation:'WHERE limits which stored rows change. The owner check is independent of duration validation. The deliberate bug updates a row belonging to a different user in a changed fixture. A missing match is not permission to create or overwrite a different row.',
    complexity:'The primary-key lookup is normally O(log W); at most one row and its affected indexes are updated. The additional owner predicate is constant work for that candidate.',
    sources:[...sources,source('SQLite UPDATE','https://sqlite.org/lang_update.html')],
    fixtures:[base,{...copy(base),workouts:base.workouts.map(row=>row[0]===102?[row[0],2,...row.slice(2)]:copy(row))},noWorkouts].map((data,i)=>{const after=copy(data);for(const row of after.workouts)if(row[0]===102&&row[1]===1)row[4]=35;return {label:['Matching owner','Requested workout belongs to another user','Requested workout is absent'][i],seedSql:seed(data),inspectSql:'SELECT id, user_id, duration_minutes FROM workouts ORDER BY id;',expected:[result(['id','user_id','duration_minutes'],byId(after.workouts).map(row=>[row[0],row[1],row[4]]))],stateSql,stateExpected:state(after)};})}),
  task({id:'fitness-delete-workout',title:'Delete one workout and its dependent rows',topic:'Fitness SQL: DELETE and cascading associations',skills:['sql-mutations','sql-constraints'],
    prompt:'Delete workout 101 only if user 1 owns it. Its workout_exercises and their workout_sets should disappear through the prepared foreign-key cascade.',
    contract:'Use the exact workout and owner condition. Leave unrelated workouts, users and exercise definitions unchanged. Missing or differently owned workout 101 must change nothing. This is a disposable database; Reset restores its fixtures. '+utc,
    starter:'DELETE FROM workouts WHERE ___;',solution:'DELETE FROM workouts WHERE id=101 AND user_id=1;',bug:'DELETE FROM workouts WHERE user_id=1;',
    hints:['Deletion needs a narrow row condition, not only an owner condition.','Which dependent rows reference this workout through workout_exercises?'],
    prediction:'Name the association and set IDs that will disappear, and one exercise definition that must remain.',
    explanation:'The workout is the parent of its workout/exercise associations. Each set belongs to an association. ON DELETE CASCADE follows those edges; it does not delete shared exercise definitions. The bug removes every workout for the owner.',
    complexity:'The parent key lookup is normally O(log W). Cascading work depends on affected associations and sets and their indexes; absent child indexes can require scans. Storage removed is proportional to the affected rows.',
    sources:[...sources,source('SQLite DELETE','https://sqlite.org/lang_delete.html')],
    fixtures:[base,changed,noWorkouts,{...copy(base),workouts:base.workouts.map(row=>row[0]===101?[row[0],2,...row.slice(2)]:copy(row))}].map((data,i)=>{const after=copy(data);const ids=new Set(after.workout_exercises.filter(row=>row[1]===101&&after.workouts.some(w=>w[0]===101&&w[1]===1)).map(row=>row[0]));after.workouts=after.workouts.filter(row=>!(row[0]===101&&row[1]===1));after.workout_exercises=after.workout_exercises.filter(row=>!ids.has(row[0]));after.workout_sets=after.workout_sets.filter(row=>!ids.has(row[1]));return {label:['Delete one populated workout','Keep another workout using the same exercise','Missing workout changes nothing','Another owner keeps the requested workout'][i],seedSql:seed(data),inspectSql:'SELECT id FROM workouts ORDER BY id;',expected:[result(['id'],byId(after.workouts).map(row=>[row[0]]))],stateSql,stateExpected:state(after)};})}),
  task({id:'fitness-user-counts',title:'Count workouts for every user, including zero',topic:'Fitness SQL: LEFT JOIN, COUNT and NULL',skills:['sql-joins','sql-null'],prerequisites:['fitness-filter-workouts'],
    prompt:'Return one row for every user, including people without workouts. Show user_id, name and workout_count.',
    contract:readonly+' Count each workout once, use 0 for a user with none, and order by user_id ascending. User names need not be unique. Count workout IDs rather than the preserved outer-join row. '+utc,
    starter:'SELECT u.id AS user_id, u.name, ___ AS workout_count\nFROM users AS u\nLEFT JOIN workouts AS w ON ___\nGROUP BY ___\nORDER BY user_id;',
    solution:'SELECT u.id AS user_id,u.name,COUNT(w.id) AS workout_count FROM users AS u LEFT JOIN workouts AS w ON w.user_id=u.id GROUP BY u.id,u.name ORDER BY user_id;',
    bug:'SELECT u.id AS user_id,u.name,COUNT(*) AS workout_count FROM users AS u LEFT JOIN workouts AS w ON w.user_id=u.id GROUP BY u.id,u.name ORDER BY user_id;',
    hints:['Start from the table whose records must all remain.','For a user without workouts, is the joined workout ID a value or NULL?'],
    analogy:'If a customer has no deliveries, an outer join still preserves the customer row. COUNT(delivery.id) counts no child IDs.',
    prediction:'Predict Rae\'s row before running. Explain why COUNT(*) gives a different answer.',
    explanation:'LEFT JOIN preserves each user. A missing workout produces NULL child columns, and COUNT(w.id) ignores those NULLs. COUNT(*) instead counts the one preserved row. Grouping by the user key prevents equal names from merging.',
    complexity:'With a child-key index or SQLite automatic index, joining and grouping U users and W workouts is typically near O((U+W) log W), depending on the plan. Without an index, nested scans can approach O(UW). Output space is O(U).',
    fixtures:readFixtures(['user_id','name','workout_count'],data=>byId(data.users).map(u=>[u[0],u[1],data.workouts.filter(w=>w[1]===u[0]).length]))}),
  task({id:'fitness-no-workouts',title:'Find users without a workout in an interval',topic:'Fitness SQL: NOT EXISTS and half-open UTC intervals',skills:['sql-joins','sql-dates'],prerequisites:['fitness-user-counts'],
    prompt:'Find users with no workout starting during the UTC week beginning March 2, 2026. A workout exactly at March 9 midnight is outside that week.',
    contract:readonly+" Return user_id and name ordered by user_id. The interval is started_at >= '2026-03-02T00:00:00Z' AND started_at < '2026-03-09T00:00:00Z'. Workouts before or after it do not exclude a user. "+utc,
    starter:'SELECT u.id AS user_id, u.name\nFROM users AS u\nWHERE NOT EXISTS (SELECT 1 FROM workouts AS w WHERE ___)\nORDER BY user_id;',
    solution:"SELECT u.id AS user_id,u.name FROM users AS u WHERE NOT EXISTS (SELECT 1 FROM workouts AS w WHERE w.user_id=u.id AND w.started_at >= '2026-03-02T00:00:00Z' AND w.started_at < '2026-03-09T00:00:00Z') ORDER BY user_id;",
    bug:"SELECT u.id AS user_id,u.name FROM users AS u WHERE NOT EXISTS (SELECT 1 FROM workouts AS w WHERE w.user_id=u.id AND w.started_at >= '2026-03-02T00:00:00Z' AND w.started_at <= '2026-03-09T00:00:00Z') ORDER BY user_id;",
    hints:['Look for the absence of a qualifying related row.','Does a workout at the exact end boundary belong to this interval?'],
    prediction:'Predict whether user 3 qualifies when their only workout starts at the end boundary.',
    explanation:'The correlated subquery checks each user\'s qualifying rows. NOT EXISTS keeps the user when there are none. The exclusive end makes adjacent weeks meet without counting the same timestamp twice. This works because every supplied timestamp uses the same UTC format; it is not general timezone conversion.',
    complexity:'Without an owner/time index, the correlated check can take O(UW). A suitable index permits a range existence lookup per user. The result uses O(U) output space at most.',
    fixtures:readFixtures(['user_id','name'],data=>byId(data.users).filter(u=>!data.workouts.some(w=>w[1]===u[0]&&between(w))).map(u=>[u[0],u[1]]))}),
  task({id:'fitness-weekly-totals',title:'Filter weekly totals above a threshold',topic:'Fitness SQL: SUM, GROUP BY, WHERE and HAVING',skills:['sql-grouping','sql-dates'],prerequisites:['fitness-no-workouts'],
    prompt:'For the same UTC week, return users whose total workout duration is strictly more than 30 minutes.',
    contract:readonly+" Return user_id and total_minutes, ordered by user_id. Sum only workouts in [2026-03-02T00:00:00Z, 2026-03-09T00:00:00Z). A total of exactly 30 does not qualify. Repeated equal durations represent separate workouts and must all count. "+utc,
    starter:'SELECT user_id, SUM(duration_minutes) AS total_minutes\nFROM workouts\nWHERE ___\nGROUP BY user_id\nHAVING ___\nORDER BY user_id;',
    solution:"SELECT user_id,SUM(duration_minutes) AS total_minutes FROM workouts WHERE started_at >= '2026-03-02T00:00:00Z' AND started_at < '2026-03-09T00:00:00Z' GROUP BY user_id HAVING SUM(duration_minutes)>30 ORDER BY user_id;",
    bug:"SELECT user_id,SUM(duration_minutes) AS total_minutes FROM workouts WHERE started_at >= '2026-03-02T00:00:00Z' AND started_at < '2026-03-09T00:00:00Z' GROUP BY user_id HAVING SUM(duration_minutes)>=30 ORDER BY user_id;",
    hints:['WHERE selects the workouts; HAVING selects the completed user groups.','Which comparison excludes a total of exactly 30?'],
    prediction:'Predict the total for user 1 and whether a user with exactly 30 qualifies.',
    explanation:'Filtering rows before grouping prevents other weeks from contributing. SUM adds each qualifying workout duration. HAVING compares the group total, not each individual duration. SUM(DISTINCT duration_minutes) would incorrectly discard separate workouts of equal length.',
    complexity:'Scanning W workouts and grouping them can take O(W log W) time with sorting or index-based grouping. There are at most U group results, using O(U) aggregate/result space.',
    fixtures:readFixtures(['user_id','total_minutes'],data=>byId(data.users).map(u=>[u[0],data.workouts.filter(w=>w[1]===u[0]&&between(w)).reduce((n,w)=>n+w[4],0)]).filter(row=>row[1]>30))}),
  task({id:'fitness-set-volume',title:'Join sets through their actual workout association',topic:'Fitness SQL: many-to-many relationships and join cardinality',skills:['sql-joins','sql-grouping'],prerequisites:['fitness-user-counts','fitness-weekly-totals'],difficulty:'intermediate',minutes:30,
    prompt:'Return every workout with its set count and recorded volume. A set belongs to workout_exercises.id, not directly to a shared exercise definition.',
    contract:readonly+' Return workout_id, set_count and recorded_volume ordered by workout_id. Count each physical workout_sets row once. Sum reps * weight_kg for known weights; an unknown weight contributes 0 to this recorded-volume measure but its set still counts. Workouts without sets return 0 and 0. Do not borrow sets from another workout using the same exercise. '+utc,
    starter:'SELECT w.id AS workout_id, ___ AS set_count, ___ AS recorded_volume\nFROM workouts AS w\nLEFT JOIN workout_exercises AS we ON ___\nLEFT JOIN workout_sets AS s ON ___\nGROUP BY w.id\nORDER BY workout_id;',
    solution:'SELECT w.id AS workout_id,COUNT(s.id) AS set_count,COALESCE(SUM(s.reps*s.weight_kg),0) AS recorded_volume FROM workouts AS w LEFT JOIN workout_exercises AS we ON we.workout_id=w.id LEFT JOIN workout_sets AS s ON s.workout_exercise_id=we.id GROUP BY w.id ORDER BY workout_id;',
    bug:'SELECT w.id AS workout_id,COUNT(s.id) AS set_count,COALESCE(SUM(s.reps*s.weight_kg),0) AS recorded_volume FROM workouts AS w LEFT JOIN workout_exercises AS we ON we.workout_id=w.id LEFT JOIN workout_exercises AS shared ON shared.exercise_id=we.exercise_id LEFT JOIN workout_sets AS s ON s.workout_exercise_id=shared.id GROUP BY w.id ORDER BY workout_id;',
    hints:['Follow each foreign key in the schema, one edge at a time.','Could the same exercise definition appear in two different workouts?'],
    prediction:'For workout 101, list its association IDs and then only the set IDs attached to those associations.',
    explanation:'Exercise definitions are reusable. The association identifies a particular occurrence inside a workout, and sets reference that occurrence. Joining through a shared exercise ID mixes sessions and can multiply rows. A NULL weight is unknown, so this output is recorded volume rather than an estimate of total physical effort.',
    complexity:'Work depends on W workouts, A associations and S sets and the chosen indexes. Indexed joins typically visit the related rows rather than forming every possible pair. Group state/output is O(W); avoid claiming a universal plan or constant-time join.',
    fixtures:readFixtures(['workout_id','set_count','recorded_volume'],data=>byId(data.workouts).map(w=>{const ids=new Set(data.workout_exercises.filter(a=>a[1]===w[0]).map(a=>a[0]));const sets=data.workout_sets.filter(s=>ids.has(s[1]));return [w[0],sets.length,sets.reduce((n,s)=>n+s[3]*(s[4]??0),0)];}))}),
  task({id:'fitness-legacy-emails',title:'Find duplicate legacy emails before a constraint',topic:'Fitness SQL: data cleanup, normalization and NULL',skills:['sql-grouping','sql-null','sql-constraints'],prerequisites:['fitness-weekly-totals'],
    prompt:'Inspect a separate legacy_users import table before adding an email uniqueness rule. Find duplicate normalized email values.',
    contract:readonly+' The extra legacy_users(legacy_id, email) table intentionally has no uniqueness constraint. Normalize these ASCII-only sample addresses with lower(trim(email)). Exclude NULL and blank-after-trim values. Return normalized_email and occurrences for groups with count > 1, ordered by normalized_email. This policy is a stated import assumption, not a universal email standard.',
    schema:schema+'\nlegacy_users(legacy_id INTEGER PRIMARY KEY, email TEXT nullable, deliberately not UNIQUE)',
    starter:'SELECT lower(trim(email)) AS normalized_email, COUNT(*) AS occurrences\nFROM legacy_users\nWHERE ___\nGROUP BY ___\nHAVING ___\nORDER BY normalized_email;',
    solution:"SELECT lower(trim(email)) AS normalized_email,COUNT(*) AS occurrences FROM legacy_users WHERE email IS NOT NULL AND trim(email)<>'' GROUP BY lower(trim(email)) HAVING COUNT(*)>1 ORDER BY normalized_email;",
    bug:"SELECT email AS normalized_email,COUNT(*) AS occurrences FROM legacy_users WHERE email IS NOT NULL AND trim(email)<>'' GROUP BY email HAVING COUNT(*)>1 ORDER BY normalized_email;",
    hints:['Define the normalization policy before grouping.','Are Amina@example.test and a surrounding-space lowercase version separate under this contract?'],
    prediction:'Predict which NULL, blank, case and surrounding-space values will share a group.',
    explanation:'A legacy import can contain data that the target constraints would reject. Audit the normalized values before migration. This task deliberately states an ASCII case/whitespace policy. Real email canonicalization and account identity require a product decision; blindly changing existing addresses can merge distinct records.',
    complexity:'Normalizing E email strings of total length C costs O(C). Sorting/grouping can take O(E log E), and group storage depends on the distinct normalized values.',
    fixtures:[[[1,'Amina@example.test'],[2,' amina@example.test '],[3,null],[4,' '],[5,'omar@example.test'],[6,'OMAR@example.test']],[[1,'X@example.test'],[2,'x@example.test'],[3,' x@example.test'],[4,'solo@example.test'],[5,null],[6,'']],[]].map((rows,i)=>{const groups=new Map();for(const row of rows){const email=row[1]?.trim().toLowerCase();if(email)groups.set(email,(groups.get(email)||0)+1);}const expected=[...groups].filter(([,n])=>n>1).toSorted((a,b)=>a[0].localeCompare(b[0]));const legacyDdl='CREATE TABLE legacy_users (legacy_id INTEGER PRIMARY KEY, email TEXT)';return {label:['Mixed duplicates and missing values','Changed duplicate and singleton groups','Empty import'][i],seedSql:seed(base)+legacyDdl+';'+insertRows('legacy_users',rows),expected:[result(['normalized_email','occurrences'],expected)],stateSql:stateSql+'\n'+schemaSnapshotSql+'\nSELECT legacy_id,email FROM legacy_users ORDER BY legacy_id;\nPRAGMA table_info(legacy_users);',stateExpected:[...state(base),schemaSnapshot([...ddl,legacyDdl]),result(['legacy_id','email'],rows),result(['cid','name','type','notnull','dflt_value','pk'],[[0,'legacy_id','INTEGER',0,null,1],[1,'email','TEXT',0,null,0]])]};}),
    seedSql:seed(base)+"CREATE TABLE legacy_users (legacy_id INTEGER PRIMARY KEY, email TEXT);INSERT INTO legacy_users VALUES(1,'Amina@example.test'),(2,' amina@example.test '),(3,NULL),(4,' '),(5,'omar@example.test'),(6,'OMAR@example.test');",
    previewQuery:'SELECT legacy_id,email FROM legacy_users ORDER BY legacy_id;'}),
  task({id:'fitness-left-filter',title:'Keep zero-match users when filtering a LEFT JOIN',topic:'Fitness SQL: ON versus WHERE and preserved parents',skills:['sql-joins','sql-null'],prerequisites:['fitness-user-counts'],
    prompt:'For every user, count workouts in the stated UTC week. Keep users with zero matching workouts.',
    contract:readonly+" Return user_id and week_count ordered by user_id. The interval is [2026-03-02T00:00:00Z, 2026-03-09T00:00:00Z). Apply the child date condition without removing preserved user rows. A workout outside the interval is not a qualifying child. "+utc,
    starter:'SELECT u.id AS user_id, COUNT(w.id) AS week_count\nFROM users AS u\nLEFT JOIN workouts AS w ON ___\nGROUP BY u.id\nORDER BY user_id;',
    solution:"SELECT u.id AS user_id,COUNT(w.id) AS week_count FROM users AS u LEFT JOIN workouts AS w ON w.user_id=u.id AND w.started_at >= '2026-03-02T00:00:00Z' AND w.started_at < '2026-03-09T00:00:00Z' GROUP BY u.id ORDER BY user_id;",
    bug:"SELECT u.id AS user_id,COUNT(w.id) AS week_count FROM users AS u LEFT JOIN workouts AS w ON w.user_id=u.id WHERE w.started_at >= '2026-03-02T00:00:00Z' AND w.started_at < '2026-03-09T00:00:00Z' GROUP BY u.id ORDER BY user_id;",
    hints:['Preserve the parent even when no child satisfies the date condition.','What does a WHERE comparison do when the joined timestamp is NULL?'],
    prediction:'Predict the rows for a user with no workouts and a user whose only workout is outside the week.',
    explanation:'The ON condition determines which child rows match. A later WHERE condition on the nullable child timestamp removes the preserved NULL row, losing zero-match users. A correct alternative can prefilter workouts in a subquery or CTE before the LEFT JOIN.',
    complexity:'An indexed owner/time join can use per-user ranges. Without appropriate indexes, work can approach O(UW). Group/output space is O(U).',
    fixtures:readFixtures(['user_id','week_count'],data=>byId(data.users).map(u=>[u[0],data.workouts.filter(w=>w[1]===u[0]&&between(w)).length]))}),
  task({id:'fitness-atomic-workout',title:'Create a workout and its sets in one transaction',topic:'Fitness SQL: BEGIN, COMMIT and relational integrity',skills:['sql-transactions','sql-constraints'],prerequisites:['fitness-insert-workout','fitness-set-volume'],difficulty:'intermediate',minutes:30,
    prompt:'Create workout 900 for user 1, association 9001 for exercise 1 at position 1, and two sets in one explicit transaction.',
    contract:"Insert workout (900,1,'Practice','2026-03-05T08:00:00Z',15), association (9001,900,1,1), and sets (9901,9001,1,5,10) and (9902,9001,2,6,10). Preserve all existing data. Use BEGIN and COMMIT. The automated check verifies final rows and constraint rejection, not the presence of a real application's transaction boundary. To study failure handling, use the companion rollback task. "+utc,
    starter:'BEGIN;\n-- Insert the parent, its association, and the two sets.\nCOMMIT;',
    solution:"BEGIN; INSERT INTO workouts VALUES(900,1,'Practice','2026-03-05T08:00:00Z',15); INSERT INTO workout_exercises VALUES(9001,900,1,1); INSERT INTO workout_sets VALUES(9901,9001,1,5,10),(9902,9001,2,6,10); COMMIT;",
    bug:"BEGIN; INSERT INTO workouts VALUES(900,1,'Practice','2026-03-05T08:00:00Z',15); INSERT INTO workout_exercises VALUES(9001,900,1,1); INSERT INTO workout_sets VALUES(9901,9001,1,5,10); COMMIT;",
    hints:['Create parent rows before rows that reference them.','Which two set rows must exist when the transaction commits?'],
    prediction:'Predict the row counts after a successful commit, then explain what should remain after a failed transaction is rolled back.',
    explanation:'A transaction makes related writes a unit. A service should commit only when every required operation succeeds, and explicitly roll back on failure. A rejected SQLite statement can leave earlier transaction statements pending; rejection alone does not mean all earlier work was undone. These fixture checks prove stored results and constraints, while the written transaction explanation remains self-assessed. Reset safely discards a failed practice workspace.',
    complexity:'This task inserts a fixed number of rows. B-tree and foreign-key maintenance depends on table/index sizes, typically logarithmic lookups per inserted row. Transaction durability/concurrency costs are not modeled by this in-memory lab.',
    sources:[...sources,source('SQLite transactions and error handling','https://sqlite.org/lang_transaction.html#response_to_errors_within_a_transaction')],variants:['fitness-rollback'],
    fixtures:[base,changed,noWorkouts].map((data,i)=>{const after=copy(data);after.workouts.push([900,1,'Practice','2026-03-05T08:00:00Z',15]);after.workout_exercises.push([9001,900,1,1]);after.workout_sets.push([9901,9001,1,5,10],[9902,9001,2,6,10]);return {label:['Complete related insert','Existing related records remain intact','First workout for an existing user'][i],seedSql:seed(data),inspectSql:'SELECT s.id,s.workout_exercise_id,s.set_number,s.reps,s.weight_kg FROM workout_sets AS s WHERE s.workout_exercise_id=9001 ORDER BY s.id;',expected:[result(columns.workout_sets,[[9901,9001,1,5,10],[9902,9001,2,6,10]])],stateSql,stateExpected:state(after),rejects:[{sql:'INSERT INTO workout_sets VALUES(9991,99999,1,1,1);',message:'A set must reference an existing workout/exercise association.'},{sql:'INSERT INTO workout_sets VALUES(9992,9001,1,1,1);',message:'A set number must be unique inside its association.'}]};})}),
  task({id:'fitness-rollback',title:'Undo every pending write after a failed operation',topic:'Fitness SQL: ROLLBACK and failure recovery',skills:['sql-transactions'],prerequisites:['fitness-atomic-workout'],difficulty:'intermediate',
    prompt:'The fixture starts an uncommitted transaction and stages a workout and an association. Treat a later operation as rejected and roll back the entire pending transaction.',
    contract:'The seeded transaction is already open. Issue ROLLBACK, not COMMIT or a new BEGIN. Every staged row must disappear and all original rows/schema must remain. The checker inspects the resulting database state. In a real application, catch the actual persistence error and roll back before reusing the connection. The initial rejection is an authored scenario; the learner script itself is not required to throw.',
    starter:'-- The transaction is already open. Undo all of its pending writes.\n',solution:'ROLLBACK;',bug:'COMMIT;',
    hints:['The transaction contains more than the last statement.','Which transaction command cancels all pending writes rather than preserving them?'],
    prediction:'List which original records remain and whether staged workout 900 survives.',
    explanation:'ROLLBACK cancels the entire pending transaction. Committing after a child operation fails could retain an incomplete feature. SQLite errors have different effects; this exercise provides an open transaction explicitly and verifies the rollback state rather than assuming every error automatically rolls back everything.',
    complexity:'Rollback work depends on changes in the open transaction and SQLite journal/undo behavior. This fixture stages only two rows; it does not measure production disk or concurrency costs.',
    sources:[source('SQLite transactions','https://sqlite.org/lang_transaction.html')],variants:['fitness-atomic-workout'],
    fixtures:[base,changed,noWorkouts].map((data,i)=>({label:['Rollback staged workout and association','Rollback preserves changed original data','Rollback first pending workout'][i],seedSql:seed(data)+"BEGIN; INSERT INTO workouts VALUES(900,1,'Pending','2026-03-05T08:00:00Z',15); INSERT INTO workout_exercises VALUES(9001,900,1,1);",inspectSql:'SELECT id FROM workouts ORDER BY id;',expected:[result(['id'],byId(data.workouts).map(row=>[row[0]]))],stateSql,stateExpected:state(data)}))}),
  task({id:'fitness-index-plan',title:'Index the latest-workout access path and inspect a real plan',topic:'Fitness SQL: composite indexes and EXPLAIN QUERY PLAN',skills:['sql-indexes'],prerequisites:['fitness-latest-seven'],difficulty:'intermediate',minutes:25,
    prompt:'Create fitness_workout_time on workouts(user_id, started_at DESC, id DESC), then inspect the actual SQLite plan for the latest-seven query.',
    contract:'Keep the prepared rows/tables unchanged. Create the named index with exactly those columns and descending directions for started_at and id. Run EXPLAIN QUERY PLAN for user_id = 1 ordered by started_at DESC, id DESC LIMIT 7. Checks verify index structure; interpretation and claimed performance gains are self-assessed. A tiny in-memory fixture is not a production latency benchmark.',
    starter:'CREATE INDEX fitness_workout_time ON workouts (___);\nEXPLAIN QUERY PLAN SELECT id,started_at FROM workouts WHERE user_id=1 ORDER BY started_at DESC,id DESC LIMIT 7;',
    solution:'CREATE INDEX fitness_workout_time ON workouts(user_id,started_at DESC,id DESC); EXPLAIN QUERY PLAN SELECT id,started_at FROM workouts WHERE user_id=1 ORDER BY started_at DESC,id DESC LIMIT 7;',
    bug:'CREATE INDEX fitness_workout_time ON workouts(started_at DESC,user_id,id DESC); EXPLAIN QUERY PLAN SELECT id,started_at FROM workouts WHERE user_id=1 ORDER BY started_at DESC,id DESC LIMIT 7;',
    hints:['Place the equality-filter key before the ordered time range.','Which column groups one user\'s records together before ordering their timestamps?'],
    prediction:'Predict whether the index can both restrict user_id and provide the requested ordering. Verify the actual plan rather than inventing a timing.',
    explanation:'The index groups a user\'s entries and orders them by descending time and ID. SQLite can often traverse the matching range and stop early. EXPLAIN QUERY PLAN shows the actual selected access path, but its text format may change between SQLite versions. Indexes add storage and write-maintenance costs. SQLite execution does not prove the same plan or behavior in MySQL.',
    complexity:'Building the index requires organizing W existing entries, typically O(W log W) work and O(W) index storage. A compatible user lookup followed by seven entries can approach O(log W + 7), depending on the plan and data.',
    sources:[source('SQLite EXPLAIN QUERY PLAN','https://sqlite.org/eqp.html'),source('SQLite query planner','https://sqlite.org/queryplanner.html')],
    fixtures:datasets.map(([label,data])=>({label,seedSql:seed(data),inspectSql:"SELECT name,desc FROM pragma_index_xinfo('fitness_workout_time') WHERE key=1 ORDER BY seqno;",expected:[result(['name','desc'],[['user_id',0],['started_at',1],['id',1]])],stateSql,stateExpected:state(data)}))}),
  task({id:'fitness-schema-note',title:'Model one optional note per workout exercise occurrence',topic:'Fitness SQL: a schema migration with key and validation constraints',skills:['sql-constraints','sql-modeling'],prerequisites:['fitness-atomic-workout'],difficulty:'intermediate',minutes:30,
    prompt:'A new requirement adds at most one nonblank note to each workout/exercise occurrence. Create workout_exercise_notes without changing the five existing tables.',
    contract:'Create workout_exercise_notes(workout_exercise_id, note), in that column order. workout_exercise_id is the primary key and references workout_exercises(id) with ON DELETE CASCADE. note is TEXT NOT NULL and must satisfy length(trim(note)) > 0. A note belongs to an occurrence, not to the reusable exercise definition. The fixtures insert valid notes, reject duplicates/missing parents/NULL/blanks, and check cascading deletion.',
    starter:'CREATE TABLE workout_exercise_notes (\n    workout_exercise_id ___,\n    note ___\n);',
    solution:'CREATE TABLE workout_exercise_notes (workout_exercise_id INTEGER PRIMARY KEY REFERENCES workout_exercises(id) ON DELETE CASCADE, note TEXT NOT NULL CHECK(length(trim(note)) > 0));',
    bug:'CREATE TABLE workout_exercise_notes (workout_exercise_id INTEGER PRIMARY KEY REFERENCES workout_exercises(id) ON DELETE CASCADE, note TEXT NOT NULL);',
    hints:['The association is the record whose particular note you need to store.','Which constraint rejects a note containing only spaces?'],
    prediction:'Predict which of a valid note, a blank note, an orphan association and a second note for the same occurrence will be accepted.',
    explanation:'A separate optional table avoids adding duplicate notes to every set and does not mix notes across workouts that reuse an exercise. Making the association reference the primary key enforces at most one note per occurrence. NOT NULL and CHECK protect different invalid inputs. SQLite type affinity is not MySQL static typing; apply and test a corresponding migration on the actual target database before making target-specific claims.',
    complexity:'Creating an empty table is fixed metadata work here. Inserts and parent-key checks normally use indexed lookups, typically O(log A) in association count A. The design adds up to one note row per association and a primary-key index.',
    sources:[source('SQLite CREATE TABLE constraints','https://sqlite.org/lang_createtable.html#column_definitions'),source('SQLite foreign keys and cascading actions','https://sqlite.org/foreignkeys.html#fk_actions')],
    fixtures:[base,changed].map((data,i)=>({label:['Create and enforce the new relationship','Cascading removal of an occurrence note'][i],seedSql:seed(data),postSql:i===0?"INSERT INTO workout_exercise_notes VALUES(1001,'Keep wrists neutral');":"INSERT INTO workout_exercise_notes VALUES(1001,'Keep wrists neutral'); DELETE FROM workout_exercises WHERE id=1001;",inspectSql:'SELECT workout_exercise_id,note FROM workout_exercise_notes ORDER BY workout_exercise_id;',expected:[result(['workout_exercise_id','note'],i===0?[[1001,'Keep wrists neutral']]:[])],stateSql:stateSql+"\nSELECT cid,name,pk FROM pragma_table_info('workout_exercise_notes') ORDER BY cid;",stateExpected:[...state(i===0?data:{...copy(data),workout_exercises:data.workout_exercises.filter(row=>row[0]!==1001),workout_sets:data.workout_sets.filter(row=>row[1]!==1001)}),result(['cid','name','pk'],[[0,'workout_exercise_id',1],[1,'note',0]])],rejects:[{sql:"INSERT INTO workout_exercise_notes VALUES(1003,'   ');",message:'Blank-after-trim notes must be rejected.'},{sql:'INSERT INTO workout_exercise_notes VALUES(1003,NULL);',message:'NULL notes must be rejected.'},{sql:"INSERT INTO workout_exercise_notes VALUES(99999,'Missing parent');",message:'A note must reference an existing occurrence.'},...(i===0?[{sql:"INSERT INTO workout_exercise_notes VALUES(1001,'Second note');",message:'Only one note per occurrence is allowed.'}]:[])]}))})
];

export const FITNESS_SQL_BY_ID = new Map(FITNESS_SQL_LABS.map(lab=>[lab.id,lab]));
