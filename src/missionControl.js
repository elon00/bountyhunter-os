import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, realpathSync, lstatSync, readlinkSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

export const rubric = [
  ['architecture', 8, ['acceptance', 'boundaries']],
  ['blockchain_quicknode', 10, ['rpc-identity', 'chain-integration', 'finality']],
  ['x402', 8, ['payment-negative', 'payment-settlement', 'bazaar-discovery']],
  ['conway_web4', 6, ['conway-patterns', 'identity-integration']],
  ['pqc_security', 12, ['pqc-vectors', 'pqc-negative', 'key-lifecycle']],
  ['raven_rea', 10, ['authorized-analysis', 'bounded-improvement', 'improvement-regression']],
  ['ai_agents', 8, ['model-evaluation', 'tool-permissions', 'budget-enforcement']],
  ['tokenomics_launchpad', 8, ['mint-authorization', 'emission-invariants', 'launch-simulation']],
  ['wallet_qr', 6, ['wallet-network-switch', 'signature-replay', 'qr-validation']],
  ['tests_security', 12, ['unit', 'regression', 'smoke', 'sast', 'dependency-audit', 'secret-scan']],
  ['operations', 6, ['alerts', 'restore-drill', 'load-test']],
  ['deployment', 6, ['source-match', 'testnet-e2e', 'mainnet-release']]
].map(([id, weight, criteria]) => ({ id, weight, criteria }));

export const sha256 = data => createHash('sha256').update(data).digest('hex');
const iso = () => new Date().toISOString();
export function saveJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

export function sourceIdentity(repo) {
  const git = args => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout:15000 }).trim();
  if (realpathSync(git(['rev-parse', '--show-toplevel'])) !== realpathSync(repo)) throw new Error('Repository root mismatch');
  const files = execFileSync('git', ['-C', repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], {encoding:'utf8', maxBuffer:16*1024*1024}).split('\0').filter(Boolean).sort();
  const digest = createHash('sha256');
  for (const file of [...new Set(files)]) {
    const path = resolve(repo, file);
    digest.update(file + '\0');
    if (!existsSync(path)) { digest.update('DELETED\0'); continue; }
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) digest.update('LINK:' + readlinkSync(path));
    else if (stat.isFile()) digest.update(readFileSync(path));
    else digest.update('NON_FILE');
    digest.update('\0');
  }
  return { commit: git(['rev-parse', 'HEAD']), sourceSha256: digest.digest('hex'), dirty: Boolean(git(['status', '--porcelain'])) };
}

export function redact(text, env = process.env) {
  let safe = String(text ?? '');
  for (const [key, value] of Object.entries(env)) {
    if (/secret|token|api.?key|private.?key|rpc.?url|password/i.test(key) && value?.length >= 6) safe = safe.split(value).join('[REDACTED]');
  }
  return safe.replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[PRIVATE_KEY_REDACTED]')
    .replace(/https?:\/\/[^\s<>"']+/gi, '[URL_REDACTED]')
    .replace(/(Bearer\s+)[^\s<>\"']+/gi, '$1[REDACTED]');
}

export function commandFor(step, env) {
  if (typeof step.file !== 'string' || !Array.isArray(step.args) || step.args.some(x => typeof x !== 'string' || /[\r\n\0]/.test(x))) throw new Error('Use a command and an explicit argument array');
  if (process.platform !== 'win32' || step.file !== 'npm') return [step.file, step.args];
  const candidates = [env.npm_execpath, join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')];
  try {
    for (const p of execFileSync('where.exe', ['npm.cmd'], { encoding: 'utf8' }).trim().split(/\r?\n/)) candidates.push(join(dirname(p), 'node_modules/npm/bin/npm-cli.js'));
  } catch { /* A missing npm executable becomes BLOCKED, never a pass. */ }
  const cli = candidates.find(p => p && existsSync(p) && /npm-cli\.js$/i.test(p));
  if (!cli) throw new Error('npm CLI unavailable; install Node/npm or invoke through npm');
  return [process.execPath, [cli, ...step.args]];
}

export function runChecks(project, repo, outputDir, { env = process.env } = {}) {
  if (!Array.isArray(project.checks) || !project.checks.length) throw new Error('No reviewed check profile; classify this repository first');
  const before = sourceIdentity(repo);
  const startedAt = iso();
  mkdirSync(outputDir, { recursive: true });
  const checks = project.checks.map((step, i) => {
    const startedAt = iso();
    let execution;
    try {
      const [file, args] = commandFor(step, env);
      execution = spawnSync(file, args, { cwd: repo, encoding: 'utf8', shell: false, timeout: Math.min(step.timeoutMs ?? 180000, 600000), maxBuffer: 4 * 1024 * 1024, env: { ...env, CI: '1' }, windowsHide: true });
    } catch (error) { execution = { error, status: null }; }
    const log = redact(`${execution.stdout ?? ''}\n${execution.stderr ?? ''}\n${execution.error?.message ?? ''}`, env);
    const logFile = `check-${i + 1}.log`;
    writeFileSync(join(outputDir, logFile), log);
    return {
      id: step.id, criteria: step.criteria ?? [], command: [step.file, ...step.args],
      startedAt, finishedAt: iso(), exitCode: execution.status,
      status: execution.error ? 'BLOCKED' : execution.status === 0 ? 'PASS' : 'FAIL',
      logFile, logSha256: sha256(log), limitation: 'Local execution only; not a deployment or independent security attestation'
    };
  });
  const after = sourceIdentity(repo);
  const stable = before.commit === after.commit && before.sourceSha256 === after.sourceSha256;
  const report = {
    schemaVersion: 1, project: project.name, repository: project.repository, profileSha256: sha256(JSON.stringify(project)),
    startedAt, finishedAt: iso(), source: before, sourceAfter: after,
    status: !stable ? 'STALE_SOURCE' : checks.some(x => x.status === 'FAIL') ? 'FAIL' : checks.some(x => x.status === 'BLOCKED') ? 'BLOCKED' : 'LOCAL_CHECKS_PASS',
    checks, deployment: 'NOT_VERIFIED', productionReady: false,
    limitation: 'Review the configured commands: exit zero alone cannot detect false assertions inside a project test. Logs are redacted and hashed, not signed.'
  };
  saveJson(join(outputDir, 'checks.json'), report);
  return report;
}

export function scoreReport(report, currentSource, reportDir, project) {
  const valid = Boolean(project) && report?.profileSha256 === sha256(JSON.stringify(project)) && report.project === project.name && report?.schemaVersion === 1 && report.sourceAfter?.commit === currentSource.commit && report.status !== 'STALE_SOURCE' && report.source?.commit === currentSource.commit && report.source?.sourceSha256 === currentSource.sourceSha256 && report.sourceAfter?.sourceSha256 === currentSource.sourceSha256;
  const proven = new Set();
  const localCriteria = new Set(['unit', 'regression', 'dependency-audit', 'pqc-negative', 'pqc-vectors', 'conway-patterns']);
  if (valid) for (const check of report.checks ?? []) {
    const expected = project.checks.find(step => step.id === check.id);
    if (!expected || JSON.stringify(check.command) !== JSON.stringify([expected.file, ...expected.args])) continue;
    const logPath = resolve(reportDir, check.logFile ?? 'missing');
    if (dirname(logPath) !== resolve(reportDir)) continue;
    if (check.status === 'PASS' && check.exitCode === 0 && check.startedAt && check.finishedAt && existsSync(logPath) && sha256(readFileSync(logPath)) === check.logSha256) for (const id of expected.criteria ?? []) if (localCriteria.has(id)) proven.add(id);
  }
  const categories = rubric.map(row => {
    const passed = row.criteria.filter(id => proven.has(id));
    return { ...row, passed, missing: row.criteria.filter(id => !proven.has(id)), earned: row.weight * passed.length / row.criteria.length };
  });
  return { evidenceStatus: valid ? 'CURRENT_LOCAL_EVIDENCE' : 'MISSING_OR_STALE', earned: Math.round(categories.reduce((n, x) => n + x.earned, 0) * 100) / 100, possible: 100, categories, productionReady: false, marketReady: 'NOT_ASSESSED', release: 'BLOCKED_PENDING_EXTERNAL_EVIDENCE_AND_APPROVAL', limitation: 'Provisional engineering checklist, not a production certificate. Manual, live integration, security review, operational, customer and release evidence remain required. N/A is not automatically awarded.' };
}

// Read-only JSON-RPC. This module contains no signing or broadcast method.
export async function verifyEvm({ rpcUrl, chainId, txHash, address, minConfirmations = 12, fetchImpl = fetch }) {
  const url = new URL(rpcUrl);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('RPC requires HTTPS or local test endpoint');
  if (!/^0x[0-9a-f]{64}$/i.test(txHash) || !/^0x[0-9a-f]{40}$/i.test(address)) throw new Error('Invalid EVM transaction or address');
  if (!Number.isSafeInteger(minConfirmations) || minConfirmations < 1) throw new Error('Confirmations must be a positive integer');
  const expected = BigInt(chainId);
  const rpc = async (method, params) => {
    const response = await fetchImpl(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(15000), redirect: 'error' });
    if (!response.ok) throw new Error('RPC HTTP failure');
    const data = await response.json();
    if (data.error || !Object.hasOwn(data, 'result')) throw new Error('RPC result unavailable');
    return data.result;
  };
  if (BigInt(await rpc('eth_chainId', [])) !== expected) throw new Error('Wrong chain');
  const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
  if (!receipt || BigInt(receipt.status ?? 0) !== 1n || receipt.transactionHash?.toLowerCase() !== txHash.toLowerCase() || receipt.contractAddress?.toLowerCase() !== address.toLowerCase()) throw new Error('No successful direct contract creation receipt for this address');
  if (!/^0x[0-9a-f]{64}$/i.test(receipt.blockHash ?? '')) throw new Error('Invalid receipt block hash');
  const height = BigInt(await rpc('eth_blockNumber', []));
  const block = BigInt(receipt.blockNumber);
  const confirmations = height - block + 1n;
  if (confirmations < BigInt(minConfirmations)) throw new Error('Insufficient confirmations');
  const canonical = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false]);
  if (canonical?.hash?.toLowerCase() !== receipt.blockHash.toLowerCase()) throw new Error('Receipt block is no longer canonical');
  const code = await rpc('eth_getCode', [address, {blockHash: receipt.blockHash, requireCanonical: true}]);
  const canonicalAfter = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false]);
  if (canonicalAfter?.hash?.toLowerCase() !== receipt.blockHash.toLowerCase()) throw new Error('Canonical block changed during verification');
  if (!/^0x(?:[0-9a-f]{2})+$/i.test(code) || /^0x(?:00)+$/i.test(code)) throw new Error('No executable bytecode at receipt block');
  return { status: 'ONCHAIN_CREATION_OBSERVED', checkedAt: iso(), chainId: expected.toString(), txHash, address, blockHash: receipt.blockHash, blockNumber: block.toString(), confirmations: confirmations.toString(), codeSha256: sha256(Buffer.from(code.slice(2), 'hex')), sourceMatch: 'NOT_VERIFIED', productionReady: false, limitations: ['Single provider observation', 'Provider must support EIP-1898 block-hash code reads', 'Direct contract creation only; factory deployments need a separate adapter', 'Confirmation count is not chain-specific finalized status', 'Runtime bytecode hash does not prove reproducible source match or safe behavior'] };
}

export function releasePlan(project, source, score, chain, network) {
  if (typeof chain !== 'string' || !chain.trim()) throw new Error('Choose a concrete chain');
  if (!['testnet', 'mainnet'].includes(network)) throw new Error('Choose testnet or mainnet explicitly');
  const blockers = [];
  if (!project.chains?.includes(chain)) blockers.push('PROJECT_CHAIN_COMPATIBILITY_NOT_REVIEWED');
  if (source.dirty) blockers.push('UNCOMMITTED_SOURCE');
  if (score?.earned !== 100) blockers.push('REQUIRED_ENGINEERING_EVIDENCE_MISSING');
  blockers.push('DEPLOYMENT_ADAPTER_NOT_IMPLEMENTED', 'REPRODUCIBLE_BUILD_MATCH_MISSING', 'SIGNER_NOT_CONFIGURED', 'FEE_QUOTE_AND_BUDGET_MISSING');
  if (network === 'mainnet') blockers.push('HUMAN_RELEASE_APPROVAL_REQUIRED', 'TESTNET_END_TO_END_PROOF_REQUIRED');
  const plan = { schemaVersion: 1, createdAt: iso(), project: project.name, repository: project.repository, source, chain, network, executable: false, blockers, recipient: null, artifactSha256: null, feeQuote: null, signing: 'EXTERNAL_SIGNER_REQUIRED', policy: 'No deployment, minting, transaction signing or spending is implemented by this coordinator' };
  return { ...plan, planSha256: sha256(JSON.stringify(plan)) };
}
