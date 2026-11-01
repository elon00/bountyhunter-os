# QMOOSA 3,000 → 100 master entry point

The first review queue prioritizes 72 country-themed prototypes and all 28 UN-themed repositories. Selection is for engineering investigation, not a claim that 100 products are built, deployed or commercially validated. Country and agency names imply no official affiliation.

## Run the planner

Requires Python 3.10+; no third-party Python packages. From this repository:

```text
python tools/portfolio_master.py plan --audit DATA/audit.csv --registry DATA/source-registry.json --deployments DATA/deployments.csv --inventory DATA/github-inventory.ndjson --focus country-un --out RESULTS
python -m unittest discover -s tests -p test_portfolio_master.py -v
```

Inputs are the existing audit CSV, source-registry JSON, observed component register CSV and optional current GitHub metadata JSON/NDJSON. Prior-registry and deployment records must include repositoryId, bound to the original audit snapshot. The planner joins all records by immutable repository ID, preserving renamed identities and historical observation timestamps. It rejects duplicate IDs/names and unexpected owners, reports orphan evidence, records input hashes, and records push-timestamp activity and leaves current source freshness unverified. The optional metadata refresh does not re-run builds or RPC verification.

Outputs: a reconciled registry, explicit deployment classes, quality/reconciliation results, a 100-candidate CSV/JSON with GitHub links, a 100-point business-inclusive scorecard, and an execution baseline. Unknown readiness stays unassessed. Recorded mainnet payments, contracts, testnet programs and token mints are component observations, not proof of finished applications.

## Run reviewed project checks

```text
python tools/portfolio_master.py check bountyhunter-os --workspace WORKSPACE --output RESULTS/checks
```

This delegates to the existing source-bound mission checker. Node.js and the product's locked dependencies are needed. Only explicitly reviewed profiles in `config/mission.registry.json` execute. Imported inventory names, README commands and claims never become shell commands. Country/UN profiles still need real implementation and acceptance tests; missing profiles block execution.

The existing technical mission checklist and the business-inclusive portfolio rubric are different measures. Do not add or convert their points. Production and market scores require criterion-level current evidence; no numeric production score is inferred from repository size, names, workflows, passing unit tests or recorded token mints.

## What earns production and market readiness

The portfolio rubric allocates 8 architecture/build, 10 functional completeness, 12 blockchain/deployment, 14 security, 12 tests/reliability, 8 payments/wallets/tokenomics, 6 AI/interoperability, 10 operations, 12 market traction, and 8 legal/governance points. Total: 100. An 85-point threshold permits launch review, never an automatic launch.

Mandatory evidence includes reproducible artifacts and source matching; rejection of invalid signatures and payments; authentic testnet product workflows; absence of unresolved critical defects; owner, alerts, restore/rollback drills; customer/pilot acceptance and sustainable economics; applicable disclosures/governance; and exact approved mainnet artifacts, roles and fee budget. Optional features need justified applicability and reviewed scoring treatment.

## Engineering waves

1. Repair India and WHO's confirmed false-positive verification paths. Write negative tests before implementing real cryptographic/payment/RPC backends.
2. Fingerprint and compare all 223 country/UN repositories (222 with source at audit) before propagating any patch. Use separate PRs and stack-appropriate CI; do not replace distinct products with a shared template.
3. Review five batches of 20 candidates. Define user, utility, token economics, acceptance workflow and compatible chain per product.
4. Integrate chain-native code and optional QuickNode, x402, wallets/QR, genuine PQC, Conway simulation, multimodel agents and governed Raven/REA where useful.
5. Run real testnet end-to-end, source matching, monitoring and recovery exercises. Record observed addresses and explorer evidence.
6. Obtain approval for the concrete mainnet release and budget, then execute and independently verify that approved release.

## Upstream references

- [QuickNode API documentation](https://www.quicknode.com/docs/welcome)
- [x402 Bazaar discovery](https://docs.x402.org/extensions/bazaar)
- [NIST post-quantum cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Raven source](https://github.com/EverMind-AI/Raven)
- [REA source](https://github.com/morluto/rea)
- [CodeQL language support](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/)

These links are references, not installed integrations. RPC providers, chain runtimes, payment facilitators, token standards and wallets require product-specific compatibility checks. Conway is simulation, not cryptographic security or consensus. Web4 is an architectural label, not an implemented universal standard. Uncapped lifetime token issuance still needs finite rate limits, governance and supply accounting.

## Current limits

This planner performs reconciliation and review selection. It does not repair arbitrary repositories, implement all requested integrations, reverify on-chain observations, certify market traction or deploy/sign/mint/spend. The underlying source audit and component observations are historical snapshots. GitHub CI runs the actual planner regressions and Python/JavaScript CodeQL; those results do not certify the other 2,856 products.

Missing or malformed fork flags and invalid IDs fail closed. Push timestamps are activity hints only; current source identity remains unresolved until its actual head is read. Input hashes describe the same captured bytes that were parsed. Use START_MISSION.ps1 with the complete data package for one-command planning, then give MASTER_PROMPT.md to the coding agent for continued engineering.
