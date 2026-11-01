#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks, scoreReport, sourceIdentity, saveJson, releasePlan, verifyEvm, redact } from '../src/missionControl.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command, projectName, ...tokens] = process.argv.slice(2);
const options = {};
for (let i = 0; i < tokens.length; i += 2) {
  if (!/^--[a-z-]+$/.test(tokens[i]) || !tokens[i + 1] || tokens[i + 1].startsWith('--')) throw new Error('Options require --name value');
  options[tokens[i].slice(2)] = tokens[i + 1];
}
try {
  if (command === 'verify-evm') {
    const rpcUrl = process.env[options['rpc-env'] ?? 'QUICKNODE_RPC_URL'];
    if (!rpcUrl) throw new Error('Set the RPC URL in an environment variable, never a CLI argument');
    const proof = await verifyEvm({ rpcUrl, chainId: options['chain-id'], txHash: options.tx, address: options.address, minConfirmations: Number(options.confirmations ?? 12) });
    saveJson(resolve(options.output ?? '.qmoosa/evm-proof.json'), proof);
    console.log(JSON.stringify(proof, null, 2));
  } else {
    const registry = JSON.parse(readFileSync(resolve(options.registry ?? resolve(root, 'config/mission.registry.json')), 'utf8'));
    if (command === 'list') { console.log(JSON.stringify(registry.projects, null, 2)); }
    else if (['check', 'score', 'plan'].includes(command)) {
      const project = registry.projects.find(x => x.name === projectName);
      if (!project || !/^[a-z0-9_.-]+$/i.test(project.name)) throw new Error('No reviewed profile for this repository; add explicit commands before execution');
      const repo = options.workspace ? resolve(options.workspace, project.name) : project.name === 'bountyhunter-os' ? root : resolve(root, '..', project.name);
      const out = resolve(options.output ?? resolve(root, '.qmoosa/mission', project.name));
      const reportPath = resolve(out, 'checks.json');
      let report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : null;
      if (command === 'check') report = runChecks(project, repo, out);
      const source = sourceIdentity(repo);
      const score = scoreReport(report, source, out, project);
      saveJson(resolve(out, 'scorecard.json'), score);
      if (command === 'plan') {
        const plan = releasePlan(project, source, score, options.chain, options.network);
        saveJson(resolve(out, 'release-plan.json'), plan);
        console.log(JSON.stringify(plan, null, 2)); process.exitCode = 2;
      } else {
        console.log(JSON.stringify({ project: project.name, status: report?.status ?? 'NOT_RUN', source, score: score.earned, productionReady: false, output: out }, null, 2));
        process.exitCode = command === 'check' ? report.status === 'LOCAL_CHECKS_PASS' ? 0 : 1 : score.evidenceStatus === 'CURRENT_LOCAL_EVIDENCE' ? 0 : 2;
      }
    } else throw new Error('Usage: mission-control.mjs list | check|score|plan PROJECT [--workspace PATH --chain NAME --network testnet|mainnet] | verify-evm receipt [--rpc-env NAME --chain-id ID --tx HASH --address ADDRESS --confirmations N]');
  }
} catch (error) { console.error(redact(error.message)); process.exitCode = 1; }
