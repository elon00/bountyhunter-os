import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const runner=resolve('scripts/portfolio-quality.mjs');
function fixture(fn) {
  const workspace=mkdtempSync(join(tmpdir(),'portfolio-quality-'));
  try {
    const root=join(workspace,'example');mkdirSync(root);
    const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
    git('init');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');git('remote','add','origin','https://github.com/example/project.git');
    writeFileSync(join(root,'package.json'),JSON.stringify({scripts:{test:'node -e "process.exit(1)"'}}));
    git('add','.');git('commit','-m','fixture');
    const project={id:'example',repository:'example/project',localDirectory:'example',requiredGates:['tests','deployment'],commands:{tests:['npm','test']}};
    const registry=join(workspace,'registry.json');const output=join(workspace,'report.json');
    const run=(args=[])=>{writeFileSync(registry,JSON.stringify({projects:[project]}));return spawnSync(process.execPath,[runner,'--registry',registry,'--workspace',workspace,'--output',output,...args],{encoding:'utf8'});};
    fn({project,run,output,root});
  }finally{rmSync(workspace,{recursive:true,force:true});}
}
test('inventory does not execute failing test command',()=>fixture(({run,output})=>{
  assert.equal(run().status,0);const p=JSON.parse(readFileSync(output)).projects[0];assert.equal(p.status,'NOT VERIFIED');assert.equal(p.gates[0].status,'NOT RUN');
}));
test('execution requires an explicit project',()=>fixture(({run})=>assert.notEqual(run(['--run']).status,0)));
test('failed gate gives FAILED and missing deployment stays unconfigured',()=>fixture(({run,output})=>{
  assert.equal(run(['--run','--project','example']).status,1);const p=JSON.parse(readFileSync(output)).projects[0];assert.equal(p.status,'FAILED');assert.equal(p.gates[1].status,'NOT CONFIGURED');
}));
test('wrong origin cannot run registered commands',()=>fixture(({project,run,output})=>{
  project.repository='another/project';assert.equal(run(['--run','--project','example']).status,2);const p=JSON.parse(readFileSync(output)).projects[0];assert.equal(p.gates.length,0);assert.match(p.blockers[0],/origin/);
}));
test('path escape rejected before execution',()=>fixture(({project,run})=>{
  project.localDirectory='../outside';assert.notEqual(run(['--run','--project','example']).status,0);
}));
