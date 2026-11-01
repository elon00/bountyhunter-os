# Mission control runbook

The source checkout contains a working Node.js coordinator. It runs reviewed checks and produces evidence; deployment/signing adapters remain unimplemented.

From the bountyhunter-os directory, with Node 22+ and Git installed:

```powershell
# Keep npm cache within your writable workspace on this machine.
$env:npm_config_cache = Join-Path (Get-Location) '.qmoosa/npm-cache'
npm ci --ignore-scripts
npm run mission -- list
npm run mission -- check bountyhunter-os
npm run mission -- check QSui --workspace ..
npm run mission -- score QSui --workspace ..
npm run mission -- plan QSui --workspace .. --chain Sui --network testnet
```

The plan command exits 2 while blocked. It writes .qmoosa/mission/PROJECT/release-plan.json with the exact source identity and blockers. It does not sign or broadcast a transaction.

Check profiles are reviewed explicit command/argument arrays in config/mission.registry.json. A discovered repository is not executable until a suitable profile is added. The separate portfolio catalog lists the 2,856 non-forks; the pilot check registry covers a deliberately smaller reviewed set.

Install dependencies before running a profile. npm ci uses the lockfile. The ignored install scripts need separate review if a particular package requires native setup. Do not run dependencies or repository scripts with production signer/provider credentials in the environment.

Logs, checks.json and scorecard.json are written under .qmoosa/mission/PROJECT/. Required commands missing from the registry do not silently pass. Failed commands preserve nonzero exit status. Source changes during execution invalidate the report. A source/profile mismatch or log change removes score credit. Local check evidence cannot award deployment or live integration points.

The provisional rubric has 100 possible points, but the implementation only grants a narrow allowlist of locally testable criteria. Manual architecture acceptance, live integration, independently reviewed security, operational and release evidence remain unverified. The code always returns productionReady:false. Adapting this into a production release service requires authenticated external evidence, not editing that field.

Read-only EVM verification can observe direct contract creation using an existing transaction, on an explicitly specified EVM chain:

```powershell
# Set QUICKNODE_RPC_URL securely outside shell history.
node scripts/mission-control.mjs verify-evm receipt --rpc-env QUICKNODE_RPC_URL --chain-id 1 --tx EXISTING_TX_HASH --address EXISTING_CONTRACT_ADDRESS --confirmations 12
```

Replace the transaction/address placeholders with real public identifiers. The provider must support EIP-1898 block-hash code reads. The verifier checks chain ID, successful direct creation receipt, address, confirmations, canonical block and nonempty bytecode. It rejects wrong-chain, reverted, missing, reorganized and incomplete observations. Factory/proxy deployments and non-EVM programs require distinct adapters.

This observation is from one provider. A confirmation count is not a universal finalized status, and bytecode presence does not establish source match, safe contract behavior or application availability. No live EVM verification was executed as part of the mocked regression suite.

Security boundaries:
- No signing/broadcast, minting, treasury transfer or paid infrastructure action exists in this coordinator.
- Registry commands execute local repository code with the invoking user's OS access. This is not an OS sandbox. Review the profile and scripts before execution; isolate untrusted repositories and keep secrets out of their environment.
- Log redaction is defense in depth. Review artifacts before publishing.
- Hashed evidence detects accidental/local tampering when compared against current inputs; it is not a signed independent attestation.
- A mainnet release still needs the exact source/artifact/network/recipient/authority/fee plan, approved budget, testnet evidence and the explicit human approval specified in your request.
