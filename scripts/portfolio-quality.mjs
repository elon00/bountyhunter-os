#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const value = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(value('--registry') || resolve(repositoryRoot, 'config/projects.json'), 'utf8'));
const workspace = realpathSync(value('--workspace') || resolve(repositoryRoot, '..'));
const selected = value('--project');
const execute = args.includes('--run');
if (execute && !selected) throw new Error('--run requires one explicit --project; review each project before execution');
const projects = registry.projects.filter(p => !selected || p.id === selected);
if (!projects.length) throw new Error('Unknown project');
const run = (file, argv, cwd) => spawnSync(file, argv, {cwd, encoding:'utf8', timeout:180000, maxBuffer:2*1024*1024, shell:false});
const reports = projects.map(project => {
  const report = {project:project.id,repository:project.repository,status:'NOT VERIFIED',commit:null,gates:[],blockers:[]};
  const root = resolve(workspace, project.localDirectory);
  const rel = relative(workspace, root);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Project path escapes workspace');
  if (!existsSync(root)) { report.blockers.push('Repository is not checked out locally'); return report; }
  const realRel = relative(workspace, realpathSync(root));
  if (!realRel || realRel.startsWith('..') || isAbsolute(realRel)) throw new Error('Project symlink escapes workspace');
  const origin = run('git',['remote','get-url','origin'],root);
  const normalized = (origin.stdout || '').trim().replace(/^git@github.com:/,'https://github.com/').replace(/\.git$/,'');
  if (origin.status !== 0 || normalized !== `https://github.com/${project.repository}`) {report.blockers.push('Git origin does not match registered repository');return report;}
  const head = run('git',['rev-parse','HEAD'],root);
  if (head.status !== 0) {report.blockers.push('Cannot resolve commit');return report;}
  report.commit=head.stdout.trim();
  const dirty = run('git',['status','--porcelain'],root);
  report.dirty = dirty.status !== 0 || Boolean(dirty.stdout.trim());
  if (report.dirty) report.blockers.push('Working tree is modified; results are not evidence for the clean commit');
  for (const name of project.requiredGates) {
    const command = project.commands[name];
    if (!command) {report.gates.push({name,status:'NOT CONFIGURED'});continue;}
    if (!execute) {report.gates.push({name,status:'NOT RUN',command});continue;}
    if (!Array.isArray(command) || command.length < 2 || command[0] !== 'npm' || command.some(v=>typeof v !== 'string')) throw new Error('Unsupported command');
    if (process.platform === 'win32') {report.gates.push({name,status:'BLOCKED',reason:'Use WSL for shell-free npm execution'});continue;}
    const start=Date.now();const result=run(command[0],command.slice(1),root);
    report.gates.push({name,status:result.status===0?'PASS':'FAIL',command,exitCode:result.status,durationMs:Date.now()-start,output:(result.stdout||'')+(result.stderr||''),error:result.error?.message});
  }
  const after = run('git',['status','--porcelain'],root);
  const afterHead = run('git',['rev-parse','HEAD'],root);
  if (after.status !== 0 || after.stdout.trim() || afterHead.status !== 0 || afterHead.stdout.trim() !== report.commit) {
    report.dirty=true;
    report.blockers.push('Working tree or HEAD changed during checks; results cannot certify the commit');
  }
  report.status=report.gates.some(g=>g.status==='FAIL')?'FAILED':execute?'PARTIAL':'NOT VERIFIED';
  return report;
});
const output = resolve(value('--output') || resolve(repositoryRoot,'.qmoosa/portfolio-quality.json'));
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify({version:1,generatedAt:new Date().toISOString(),mode:execute?'local-checks':'inventory',projects:reports},null,2)+'\n');
for(const r of reports) console.log(`${r.project}: ${r.status}${r.blockers.length?' — '+r.blockers.join('; '):''}`);
console.log(`Report: ${output}`);
process.exitCode=reports.some(r=>r.status==='FAILED')?1:execute&&reports.some(r=>r.status==='NOT VERIFIED')?2:0;
