import { fileURLToPath } from 'node:url';
import fsForRaceTest from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { runChecks as executeChecks, scoreReport as evaluateScore, sourceIdentity, redact, releasePlan, verifyEvm, rubric, saveJson } from '../src/missionControl.js';

const profiles = new WeakMap();
function runChecks(project, ...args) { const report = executeChecks(project, ...args); profiles.set(report, project); return report; }
function scoreReport(report, ...args) { return evaluateScore(report, ...args, profiles.get(report)); }
function fixture(fn) {
  const base = mkdtempSync(join(tmpdir(), 'qmoosa-mission-'));
  const repo = join(base, 'repo'); const out = join(base, 'out');
  mkdirSync(repo);
  const git = args => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe', timeout:15000 });
  git(['init', '-q']);
  writeFileSync(join(repo, 'source.txt'), 'baseline');
  git(['add', '.']);
  git(['-c','user.name=Mission Test','-c','user.email=mission@example.invalid','commit','--no-gpg-sign','--no-verify','-qm','fixture']);
  try { return fn(repo, out); }
  finally { rmSync(base, { recursive: true, force: true }); }
}
const nodeStep = (id, code, criteria = []) => ({ id, file: process.execPath, args: ['-e', code], criteria });

test('rubric has 100 possible points and unique criteria', () => {
  assert.equal(rubric.reduce((n, x) => n + x.weight, 0), 100);
  const all = rubric.flatMap(x => x.criteria);
  assert.equal(new Set(all).size, all.length);
});
test('real child failure and timeout cannot pass or certify deployment', () => fixture((repo, out) => {
  const report = runChecks({name:'fixture',checks:[
    nodeStep('pass', 'console.log("ok")', ['unit']),
    nodeStep('fail', 'process.exit(7)', ['smoke']),
    {...nodeStep('timeout', 'setInterval(()=>{},1000)', ['regression']),timeoutMs:100}
  ]}, repo, out);
  assert.equal(report.status, 'FAIL');
  assert.equal(report.checks[1].exitCode, 7);
  assert.equal(report.checks[2].status, 'BLOCKED');
  assert.equal(report.productionReady, false);
  const score = scoreReport(report, sourceIdentity(repo), out);
  assert.equal(score.earned, 2);
  assert.equal(score.productionReady, false);
}));
test('source modifications invalidate successful command results', () => fixture((repo, out) => {
  const report = runChecks({name:'fixture',checks:[nodeStep('mutate', "require('node:fs').writeFileSync('source.txt','changed')", ['unit'])]}, repo, out);
  assert.equal(report.checks[0].status, 'PASS');
  assert.equal(report.status, 'STALE_SOURCE');
  assert.equal(scoreReport(report, sourceIdentity(repo), out).earned, 0);
}));
test('tampered logs and stale evidence lose checklist credit', () => fixture((repo, out) => {
  const report = runChecks({name:'fixture',checks:[nodeStep('unit', 'console.log("unit")', ['unit'])]}, repo, out);
  assert.equal(scoreReport(report, sourceIdentity(repo), out).earned, 2);
  writeFileSync(join(out, report.checks[0].logFile), 'replacement');
  assert.equal(scoreReport(report, sourceIdentity(repo), out).earned, 0);
  writeFileSync(join(repo, 'source.txt'), 'new source');
  assert.equal(scoreReport(report, sourceIdentity(repo), out).evidenceStatus, 'MISSING_OR_STALE');
}));
test('private endpoint and injected environment secrets are redacted from actual logs', () => fixture((repo, out) => {
  const secret = 'not-a-real-test-secret-749';
  const report = runChecks({name:'fixture',checks:[nodeStep('logs', 'console.log(process.env.MISSION_API_KEY);console.log("https://rpc.example.invalid/private-path")')]}, repo, out, {env:{...process.env,MISSION_API_KEY:secret}});
  const log = readFileSync(join(out, report.checks[0].logFile), 'utf8');
  assert.ok(!log.includes(secret)); assert.ok(!log.includes('private-path'));
  assert.equal(redact('Bearer abc123token'), 'Bearer [REDACTED]');
  assert.equal(redact('Bearer abc+secret/~token=='), 'Bearer [REDACTED]');
}));
test('plan blocks absent adapters, unknown chain, signer, budget, source changes and human approval', () => {
  const plan = releasePlan({name:'fixture',chains:['Sui']}, {dirty:true}, {earned:100}, 'Ethereum', 'mainnet');
  assert.equal(plan.executable, false);
  for (const reason of ['PROJECT_CHAIN_COMPATIBILITY_NOT_REVIEWED','UNCOMMITTED_SOURCE','DEPLOYMENT_ADAPTER_NOT_IMPLEMENTED','FEE_QUOTE_AND_BUDGET_MISSING','HUMAN_RELEASE_APPROVAL_REQUIRED']) assert.ok(plan.blockers.includes(reason));
  assert.throws(()=>releasePlan({}, {}, {}, 'Sui', 'automatic'));
});
const txHash = '0x' + '22'.repeat(32);
const address = '0x' + '11'.repeat(20);
const blockHash = '0x' + '33'.repeat(32);
function rpcMock(overrides = {}) {
  const normal = {
    eth_chainId:'0x1',
    eth_getTransactionReceipt:{status:'0x1',transactionHash:txHash,contractAddress:address,blockNumber:'0xa',blockHash},
    eth_blockNumber:'0x15',
    eth_getBlockByNumber:{hash:blockHash},
    eth_getCode:'0x60006000'
  };
  return async (_url, request) => {
    const {method} = JSON.parse(request.body);
    assert.ok(['eth_chainId','eth_getTransactionReceipt','eth_blockNumber','eth_getBlockByNumber','eth_getCode'].includes(method), 'only read-only RPC allowed');
    return {ok:true,json:async()=>({result:Object.hasOwn(overrides,method)?overrides[method]:normal[method]})};
  };
}
const verify = overrides => verifyEvm({rpcUrl:'https://rpc.example.invalid/secret',chainId:1,txHash,address,fetchImpl:rpcMock(overrides)});
test('EVM verifier observes successful creation without claiming source match, finality or production readiness', async () => {
  const proof = await verify();
  assert.equal(proof.status, 'ONCHAIN_CREATION_OBSERVED');
  assert.equal(proof.confirmations, '12');
  assert.equal(proof.sourceMatch, 'NOT_VERIFIED');
  assert.equal(proof.productionReady, false);
  assert.ok(!JSON.stringify(proof).includes('secret'));
});
for (const [name, overrides] of [
  ['wrong network',{eth_chainId:'0x2'}],
  ['missing receipt',{eth_getTransactionReceipt:null}],
  ['reverted transaction',{eth_getTransactionReceipt:{status:'0x0'}}],
  ['wrong creation address',{eth_getTransactionReceipt:{status:'0x1',transactionHash:txHash,contractAddress:'0x'+'44'.repeat(20)}}],
  ['no bytecode',{eth_getCode:'0x'}],
  ['all zero bytecode',{eth_getCode:'0x00'}],
  ['malformed bytecode',{eth_getCode:'0x6'}],
  ['insufficient confirmations',{eth_blockNumber:'0xb'}],
  ['reorganized block',{eth_getBlockByNumber:{hash:'0x'+'44'.repeat(32)}}]
]) test('EVM verifier rejects '+name, async()=>assert.rejects(()=>verify(overrides)));
test('RPC errors and HTTP failures cannot pass', async () => {
  for (const fetchImpl of [
    async()=>({ok:false}),
    async()=>({ok:true,json:async()=>({error:{message:'bad'}})})
  ]) await assert.rejects(()=>verifyEvm({rpcUrl:'https://rpc.example.invalid',chainId:1,txHash,address,fetchImpl}));
  await assert.rejects(()=>verifyEvm({rpcUrl:'http://public.example.invalid',chainId:1,txHash,address}));
});

test('score rejects changed profile, command and arbitrary reported deployment criteria', () => fixture((repo, out) => {
  const project = {name:'fixture', checks:[nodeStep('unit','console.log("ok")',['unit'])]};
  const report = executeChecks(project, repo, out);
  report.checks[0].criteria = ['mainnet-release','testnet-e2e','source-match'];
  const scored = evaluateScore(report, sourceIdentity(repo), out, project);
  assert.equal(scored.earned, 2);
  assert.equal(scored.categories.find(x=>x.id==='deployment').earned, 0);
  assert.equal(evaluateScore(report, sourceIdentity(repo), out, {...project,name:'other'}).earned, 0);
  report.checks[0].command=['node','fabricated'];
  assert.equal(evaluateScore(report, sourceIdentity(repo), out, project).earned, 0);
}));
test('EVM code read pins canonical block hash and rejects a reorg during verification', async () => {
  let blockReads = 0;
  const base = rpcMock();
  const fetchImpl = async (url, request) => {
    const {method, params} = JSON.parse(request.body);
    if (method==='eth_getCode') assert.deepEqual(params[1], {blockHash,requireCanonical:true});
    if (method==='eth_getBlockByNumber' && ++blockReads===2) return {ok:true,json:async()=>({result:{hash:'0x'+'44'.repeat(32)}})};
    return base(url,request);
  };
  await assert.rejects(()=>verifyEvm({rpcUrl:'https://rpc.example.invalid',chainId:1,txHash,address,fetchImpl}), /Canonical block changed/);
});


test('source fingerprint rejects a file replaced between metadata inspection and open', () => fixture((repo) => {
  const originalOpen = fsForRaceTest.openSync;
  const originalWrite = fsForRaceTest.writeFileSync;
  const target = join(repo, 'source.txt');
  let replaced = false;
  fsForRaceTest.openSync = function(path, ...args) {
    if (path === target && !replaced) {
      replaced = true;
      const opened = originalOpen(path, ...args);
      fsForRaceTest.renameSync(target, join(repo, 'original-source.txt'));
      originalWrite(target, 'replacement');
      return opened;
    }
    return originalOpen(path, ...args);
  };
  syncBuiltinESMExports();
  try { assert.throws(() => sourceIdentity(repo), /Source changed while reading/); }
  finally { fsForRaceTest.openSync = originalOpen; syncBuiltinESMExports(); }
  assert.equal(replaced, true);
}));


test('RPC quantities and bytecode reject JSON values that merely coerce to expected strings', async () => {
  for (const overrides of [
    {eth_chainId:true}, {eth_blockNumber:21}, {eth_getCode:['0x60006000']},
    {eth_getTransactionReceipt:{status:1,transactionHash:txHash,contractAddress:address,blockNumber:'0xa',blockHash}},
    {eth_getTransactionReceipt:{status:'0x1',transactionHash:txHash,contractAddress:address,blockNumber:10,blockHash}},
    {eth_getTransactionReceipt:{status:'0x1',transactionHash:txHash,contractAddress:address,blockNumber:'0xa',blockHash:[blockHash]}}
  ]) await assert.rejects(() => verify(overrides));
});

test('RPC evidence cannot be written as an executable file', () => fixture((repo) => {
  assert.throws(() => saveJson(join(repo, 'download.js'), {payload:'not executed'}), /JSON data file/);
  saveJson(join(repo, 'proof.json'), {observation:'untrusted data only'});
  assert.equal(JSON.parse(readFileSync(join(repo, 'proof.json'), 'utf8')).observation, 'untrusted data only');
}));

test('dangling symlink retargeting changes the source fingerprint', (t) => fixture((repo) => {
  const target = join(repo, 'dangling-link');
  try { fsForRaceTest.symlinkSync('missing-a', target); }
  catch (error) { if (error.code === 'EPERM' || error.code === 'EACCES') { t.skip('Windows symlink privilege unavailable; Linux CI exercises this case'); return; } throw error; }
  const before = sourceIdentity(repo).sourceSha256;
  fsForRaceTest.unlinkSync(target);
  fsForRaceTest.symlinkSync('missing-b', target);
  assert.notEqual(sourceIdentity(repo).sourceSha256, before);
  const linkHash = sourceIdentity(repo).sourceSha256;
  fsForRaceTest.unlinkSync(target);
  writeFileSync(target, 'LINK:missing-b');
  assert.notEqual(sourceIdentity(repo).sourceSha256, linkHash);
}));


test('the coordinator profile honors an explicitly selected workspace checkout', () => fixture((repo, out) => {
  const workspace = join(repo, '..');
  const selected = join(workspace, 'bountyhunter-os');
  fsForRaceTest.renameSync(repo, selected);
  const profilesFile = join(workspace, 'reviewed-profiles.json');
  writeFileSync(profilesFile, JSON.stringify({projects:[{name:'bountyhunter-os',checks:[]}]}));
  const script = new URL('../scripts/mission-control.mjs', import.meta.url);
  const result = spawnSync(process.execPath, [fileURLToPath(script), 'score', 'bountyhunter-os', '--workspace', workspace, '--registry', profilesFile, '--output', out], {encoding:'utf8', windowsHide:true});
  assert.equal(result.status, 2, result.stderr);
  const observed = JSON.parse(result.stdout);
  assert.equal(observed.source.sourceSha256, sourceIdentity(selected).sourceSha256);
}));


test('an empty reviewed command profile cannot report successful checks', () => fixture((repo, out) => {
  assert.throws(() => executeChecks({name:'empty-profile',checks:[]}, repo, out), /empty check suite cannot pass/);
}));
