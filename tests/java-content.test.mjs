import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {join,resolve,dirname,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {JAVA_FOUNDATION_LABS as JAVA_LABS,JAVA_LAB_BY_ID} from '../src/java-content.mjs';

const java = process.env.TRACECRAFT_JAVA || 'java';
const javac = process.env.TRACECRAFT_JAVAC || (java === 'java' ? 'javac' : join(dirname(java), process.platform === 'win32' ? 'javac.exe' : 'javac'));
const available = spawnSync(java,['-version'],{encoding:'utf8',timeout:5000}).status === 0 && spawnSync(javac,['-version'],{encoding:'utf8',timeout:5000}).status === 0;

test('all seven Java browser labs have complete original authoring contracts', () => {
  assert.deepEqual(JAVA_LABS.map(item => item.id), ['java-start','java-types','java-decisions','java-arrays','java-methods','java-classes','java-next-tools']);
  assert.ok(JAVA_LABS.every(lab=>JAVA_LAB_BY_ID.has(lab.id)));
  for (const item of JAVA_LABS) {
    for (const key of ['title','goal','starter','solution','bug','explanation','complexity']) assert.ok(typeof item[key] === 'string' && item[key].trim().length > 10,`${item.id}: ${key}`);
    for (const key of ['input','output','edgeCases','mutation']) assert.ok(item.contract[key].length > 30,`${item.id}: ${key}`);
    assert.ok(item.hints.length >= 2);
    assert.ok(item.fixtures.length >= 3);
    assert.notEqual(item.solution,item.bug);
    assert.equal(item.starter,item.bug,'the initial broken attempt is the documented deliberate bug');
    for (const source of [item.starter,item.solution,item.bug]) {
      assert.match(source,/public class Main/);
      assert.match(source,/public static void main\(String\[\] args\)/);
      assert.doesNotMatch(source,/\u2014/);
    }
    assert.equal(new Set(item.fixtures.map(value => value.name)).size,item.fixtures.length);
    assert.ok(item.fixtures.some(value => value.args.length === 0),'every lab specifies the no-input edge');
    assert.ok(new Set(item.fixtures.map(value => JSON.stringify(value.args))).size >= 3);
    for (const value of item.fixtures) {
      assert.ok(value.args.every(arg => typeof arg === 'string'));
      assert.ok(value.stdout.endsWith('\n'));
    }
  }
});

const additionalCases = {
  'java-start': [{args:['-1000'],stdout:'-998\n'}],
  'java-types': [{args:['Zara Q'],stdout:'Hello, Zara Q!\n'}],
  'java-decisions': [{args:['1000'],stdout:'open\n'}],
  'java-arrays': [{args:['1000','-1000','9','9','-8'],stdout:'10\n'}],
  'java-methods': [{args:['-1000'],stdout:'-2000\n'}],
  'java-classes': [{args:['-1000'],stdout:'-1000\n0\n'}],
  'java-next-tools': [{args:['-1000','1000','+0','not-a-number'],stdout:'3\n0\n'}]
};

for (const item of JAVA_LABS) {
  test(`${item.id}: real javac checks the solution, changed inputs, edge cases, and deliberate bug`,{skip:available ? false : 'Set TRACECRAFT_JAVA and, if needed, TRACECRAFT_JAVAC to author verification tools.'}, () => {
    const folder = mkdtempSync(join(tmpdir(),'tracecraft-java-lab-'));
    try {
      const compile = (label,source) => {
        const directory = join(folder,label);
        mkdirSync(directory);
        const file = join(directory,'Main.java');
        writeFileSync(file,source);
        const compiled = spawnSync(javac,['-encoding','UTF-8','-d',directory,file],{encoding:'utf8',timeout:20000});
        assert.equal(compiled.status,0,`${item.id} ${label}: ${compiled.stderr}`);
        return directory;
      };
      const run = (directory,fixture) => {
        const executed = spawnSync(java,['-cp',directory,'Main',...fixture.args],{encoding:'utf8',timeout:10000});
        assert.equal(executed.status,0,`${item.id}: ${executed.stderr}`);
        return executed.stdout.replaceAll('\r','');
      };
      const solutionDirectory = compile('solution',item.solution);
      for (const value of [...item.fixtures,...additionalCases[item.id]]) assert.equal(run(solutionDirectory,value),value.stdout,`${item.id}: ${value.name || JSON.stringify(value.args)}`);
      const bugDirectory = compile('bug',item.bug);
      const observations = item.fixtures.map(value => run(bugDirectory,value));
      assert.ok(observations.some((stdout,index) => stdout !== item.fixtures[index].stdout),`${item.id}: at least one actual check must expose its deliberate bug`);
    } finally {
      assert.equal(dirname(resolve(folder)),resolve(tmpdir()));
      assert.ok(basename(folder).startsWith('tracecraft-java-lab-'));
      rmSync(folder,{recursive:true,force:true});
    }
  });
}
