import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename,resolve} from 'node:path';
import {JAVA_ALGORITHM_LABS} from '../src/java-algorithms-content.mjs';

const java=process.env.TRACECRAFT_JAVA||'java';
const javac=process.env.TRACECRAFT_JAVAC||(java==='java'?'javac':join(dirname(java),process.platform==='win32'?'javac.exe':'javac'));
const available=spawnSync(java,['-version'],{encoding:'utf8',timeout:5000}).status===0&&spawnSync(javac,['-version'],{encoding:'utf8',timeout:5000}).status===0;
const nativeOptions={skip:available?false:'Set TRACECRAFT_JAVA to a Java 21+ author verification launcher.',timeout:60000};

test('intermediate Java tasks have exact contracts, teaching, changed fixtures and compiling-bug starters',()=>{
  assert.deepEqual(JAVA_ALGORITHM_LABS.map(value=>value.id),['java-stable-unique','java-count-labels','java-first-match']);
  for(const lab of JAVA_ALGORITHM_LABS){
    for(const name of ['title','goal','solution','starter','bug','explanation','complexity'])assert.ok(lab[name]?.length>10,lab.id+': '+name);
    for(const name of ['input','output','edgeCases','mutation'])assert.ok(lab.contract[name]?.length>40,lab.id+': '+name);
    assert.equal(lab.prerequisite,'java-next-tools');assert.equal(lab.starter,lab.bug);assert.notEqual(lab.solution,lab.bug);
    assert.equal(lab.teaching.length,3);assert.ok(lab.hints.length>=2);assert.ok(lab.fixtures.length>=6);
    assert.ok(lab.fixtures.some(fixture=>fixture.args.length===0));assert.equal(new Set(lab.fixtures.map(fixture=>fixture.name)).size,lab.fixtures.length);
    for(const fixture of lab.fixtures){assert.ok(fixture.args.every(value=>typeof value==='string'));assert.ok(fixture.stdout.endsWith('\n'));}
    assert.doesNotMatch(JSON.stringify(lab),/\u2014/);
  }
});

function workspace(run){
  const folder=mkdtempSync(join(tmpdir(),'tracecraft-java-algorithms-'));
  try{return run(folder);}finally{assert.equal(dirname(resolve(folder)),resolve(tmpdir()));assert.ok(basename(folder).startsWith('tracecraft-java-algorithms-'));rmSync(folder,{recursive:true,force:true});}
}
function compile(folder,name,source){
  const directory=join(folder,name);mkdirSync(directory);const file=join(directory,'Main.java');writeFileSync(file,source);
  const result=spawnSync(javac,['-encoding','UTF-8','-d',directory,file],{encoding:'utf8',timeout:20000});
  assert.equal(result.status,0,result.stderr);return directory;
}
function execute(directory,args){
  const result=spawnSync(java,['-cp',directory,'Main',...args],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr);return result.stdout.replaceAll('\r','');
}
function expectedUnique(args){const unique=[...new Set(args)];return [String(unique.length),...unique].join('\n')+'\n';}
function expectedCounts(args){const counts=new Map();for(const value of args)counts.set(value,(counts.get(value)||0)+1);return [String(counts.size),...[...counts].map(([label,count])=>label+'='+count)].join('\n')+'\n';}

for(const lab of JAVA_ALGORITHM_LABS){
  test(`${lab.id}: actual javac validates all fixtures, deliberate bug and independent changed inputs`,nativeOptions,()=>workspace(folder=>{
    const correct=compile(folder,'solution',lab.solution),bug=compile(folder,'bug',lab.bug);
    for(const fixture of lab.fixtures)assert.equal(execute(correct,fixture.args),fixture.stdout,fixture.name);
    assert.ok(lab.fixtures.some(fixture=>execute(bug,fixture.args)!==fixture.stdout),'at least one fixture must expose the deliberate bug');
    let seed=71;const random=()=>{seed=(seed*48271)%2147483647;return seed;};
    for(let i=0;i<8;i++){
      if(lab.id==='java-first-match'){
        const values=Array.from({length:random()%9},()=>random()%9-4).sort((a,b)=>a-b),target=random()%11-5;
        const args=[String(target),...values.map(String)];assert.equal(execute(correct,args),String(values.indexOf(target))+'\n',JSON.stringify(args));
      }else{
        const labels=['','A','a',' x ','z'],args=Array.from({length:random()%10},()=>labels[random()%labels.length]);
        assert.equal(execute(correct,args),lab.id==='java-stable-unique'?expectedUnique(args):expectedCounts(args),JSON.stringify(args));
      }
    }
  }));
  test(`${lab.id}: every complete teaching program matches its stated output`,nativeOptions,()=>workspace(folder=>{
    for(const [index,section]of lab.teaching.entries())assert.equal(execute(compile(folder,'example-'+index,section.code),[]),section.result,section.title);
  }));
}
