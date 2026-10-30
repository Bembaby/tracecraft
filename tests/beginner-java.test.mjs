import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve,dirname,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {JAVA_QUESTS} from '../src/beginner-java-content.mjs';
import {JAVA_PROGRAMS} from '../src/java-programs.mjs';
import {BEGINNER_LESSONS} from '../src/beginner-content.mjs';
const java=process.env.TRACECRAFT_JAVA||'java';
const available=spawnSync(java,['-version'],{encoding:'utf8',timeout:5000}).status===0;
for(const quest of JAVA_QUESTS){
  test(`${quest.id}: actual Java checks authored reference, edges and deliberate bug`,{skip:available?false:'Set TRACECRAFT_JAVA to a Java 21+ launcher for authored Java checks.'},()=>{
    const folder=mkdtempSync(join(tmpdir(),'tracecraft-java-'));
    try{
      const run=method=>{
        const code=`class TraceTask { ${method}\npublic static void main(String[] args) { ${quest.fixtures.map(fixture=>`System.out.println(${fixture.call});`).join('\n')} } }`;
        const file=join(folder,'TraceTask.java');writeFileSync(file,code);
        const result=spawnSync(java,[file],{encoding:'utf8',timeout:20000});assert.equal(result.status,0,result.stderr);
        return result.stdout.replaceAll('\r','').trimEnd().split('\n');
      };
      const expected=quest.fixtures.map(fixture=>fixture.expected);
      assert.deepEqual(run(quest.solution),expected);assert.notDeepEqual(run(quest.bug),expected);
    }finally{
      assert.equal(dirname(resolve(folder)),resolve(tmpdir()));assert.ok(basename(folder).startsWith('tracecraft-java-'));
      rmSync(folder,{recursive:true,force:true});
    }
  });
}
const asProgram=code=>{
  if(/^(public )?class Main/.test(code))return code;
  if(code.startsWith('static '))return `class Main { ${code} public static void main(String[] args) {} }`;
  const prelude=code.includes('coins')&&!code.includes('int coins')?'int coins = 3;\n':'';
  const counter=code.includes('Counter')&&!code.includes('class Counter')?'class Counter { int count = 0; void add(int amount) { count = count + amount; } }\n':'';
  return `class Main { public static void main(String[] args) { ${counter}${prelude}${code}\n} }`;
};
test('complete Java downloads, teaching fragments, and filled quiz snippets compile in actual Java',{skip:available?false:'Java 21+ launcher not configured.'},()=>{
  const folder=mkdtempSync(join(tmpdir(),'tracecraft-java-'));
  try{
    const run=(code,label)=>{const file=join(folder,'Main.java');writeFileSync(file,code);const result=spawnSync(java,[file],{encoding:'utf8',timeout:20000});assert.equal(result.status,0,label+'\n'+result.stderr);return result.stdout.replaceAll('\r','');};
    for(const [id,example]of Object.entries(JAVA_PROGRAMS))assert.equal(run(example.code,id),example.output);
    for(const lesson of BEGINNER_LESSONS.filter(item=>item.track==='java'))for(const section of lesson.sections){if(section.code.startsWith('java '))continue;run(asProgram(section.code),lesson.id+': '+section.title);}
    const outputs={'java-variable-read':'5\n','java-variable-debug':'2\n','java-text-read':'Hello, Amina!\n','java-text-debug':'Hello,Amina!\n','java-choice-read':'open\n','java-array-read':'6\n','java-array-debug':'0\n','java-method-read':'8\n','java-object-read':'0\n','java-equality-read':'true\n','java-list-fill':'2\n','java-error-read':'invalid\n'};
    for(const quest of JAVA_QUESTS)for(const question of quest.questions){const output=run(asProgram(question.code.replace('___',question.answer)),question.id);if(question.id in outputs)assert.equal(output,outputs[question.id],question.id);}
  }finally{
    assert.equal(dirname(resolve(folder)),resolve(tmpdir()));assert.ok(basename(folder).startsWith('tracecraft-java-'));
    rmSync(folder,{recursive:true,force:true});
  }
});
