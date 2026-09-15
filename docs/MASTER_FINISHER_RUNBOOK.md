# QMoosa Master Finisher — Operator Runbook

## Purpose

This repository is the canonical orchestration layer for finishing software projects with evidence rather than claims.

## One-command execution

```bash
npm install
npm run qmoosa:finish
```

The command performs repository discovery, lockfile integrity, production dependency audit, configured crypto/reality audit, root and application tests, application build, Git identity/working-tree verification, and deployment-evidence evaluation.

A JSON report is written to `.qmoosa/master-finisher-report.json`.

## Truth rules

- `PASS` means the check actually executed successfully.
- `FAIL` means the check executed and failed.
- `SKIP` means required evidence was not available.
- `PARTIAL` means local gates passed but at least one evidence gate remains unresolved.
- `COMPLETE` is reserved for a run where every configured gate passes, including deployment evidence.

A GitHub Pages or Netlify build is not, by itself, proof that a blockchain program, smart contract, or external network deployment occurred. For network claims, record the actual network, deployment/program identifier, transaction or deployment reference, and an independently verifiable explorer or provider result.

## Safe operating model

The finisher may run deterministic, low-risk checks automatically. It does not rotate secrets, fabricate deployment records, force-push history, delete project files, or silently convert simulations into production claims.

## Project adapter model

Each portfolio project should be represented by an adapter/registry entry describing its requirements, commands, deployment target, evidence sources, and known simulation boundaries. Reusable modules must have tests and a documented interface before being promoted into the shared layer.

## Close-out record

For a completed project, retain:

1. final commit SHA;
2. CI workflow/run evidence;
3. test and build evidence;
4. security evidence;
5. deployment target and version;
6. network/program/contract identifier when applicable;
7. independent verification reference;
8. README/demo/submission artifacts.
