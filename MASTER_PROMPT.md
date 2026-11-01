# QMOOSA: one master execution prompt

Copy the text below into the coding agent that has access to the elon00 GitHub portfolio and this workspace. It is an execution instruction, not a claim that a prompt alone can complete every project.

```text
Continue the QMOOSA portfolio engineering mission as an implementation agent.

OWNER: elon00. COORDINATOR: https://github.com/elon00/bountyhunter-os
SCOPE: reconcile all 2,856 public non-fork repositories; prioritize the 195 country-themed and 28 UN-themed repositories. The first review queue has 72 country and 28 UN projects. Country/agency themes imply no official affiliation. Keep cryptocurrency/token positioning; exclude central-bank currency integrations.
CHAIN UNIVERSE: 100 DeFi-TVL-ranked chain candidates in the preserved 31 October 2026 checklist. Review native runtime/network compatibility per project. Start with one primary chain per product; additional chains need a real use case and separate adapters/tests. Do not claim all repositories can deploy to all 100 chains.

FIRST ACTION: read the local instructions and MASTER_PROMPT.md, docs/QMOOSA_MASTER_PLAN.md, docs/PORTFOLIO_MASTER_RUNBOOK.md, the registry, current scorecards and existing repair PRs. Inspect the current GitHub commits/checks/review threads before changing anything. Resume existing work; do not regenerate a generic template over working code.

CHAPTERS / ORDER:
1. Identity and scope: join by immutable repository ID; preserve commit, input hashes, observation times and rename history. Unknown evidence remains unknown.
2. Requirements: define the actual user, token utility, one complete product workflow and measurable acceptance criteria. Distinguish a token mint from a complete application.
3. Reproducible build: native toolchain, locked dependencies, license/SBOM, architecture boundaries and an artifact bound to the tested source.
4. Functional implementation: fix reproduced defects, permissions, state/persistence, error handling and product behavior. Start with India and WHO, then compare shared implementations before propagating patches.
5. Security: real CodeQL for supported languages, chain-native contract analyzers, dependency/secret scans, negative authorization/payment/signature tests and appropriate external review. Fix real findings; document legitimate false-positive dispositions. Never suppress a genuine failure merely to turn a check green.
6. Testing: syntax/type/lint, unit, sanity, smoke, regression, integration, invariant/fuzz, failure/recovery and relevant load tests. Zero discovered tests cannot pass. Mocks do not count as live integration evidence.
7. Technology coverage across every repo: assess every capability in config/required-capabilities.json; reuse an existing verified implementation, extend an incomplete one, and implement only what is missing. Do not duplicate modules or dependency stacks. Any non-applicable disposition needs a stated reason and review. Integrate genuine QuickNode RPC, x402 verification AND settlement/Bazaar, wallets and QR, governed token emissions/launchpad, reviewed PQC, deterministic Conway simulation, explicit Web4 protocols, multimodel agents and bounded Raven/REA only where useful and compatible. Missing backends must fail closed and stay NOT_IMPLEMENTED.
8. Chain integration: verify chain/genesis identity, address/signature formats, wallet network switching, finality/reorg handling and transaction idempotency using a native adapter. No private keys in source, logs, browser bundles or chat.
9. Technical release gates: reproduce source/artifact matching, real product-level testnet end-to-end behavior, observability/alerts, backup/restore and rollback drills. Record exact source, command, timestamps, exit status, hashed logs and genuine explorer evidence. No paid infrastructure or mainnet spending to compensate for missing technical evidence.
10. Market and launch review: validate customer/pilot acceptance, useful token economics/pricing, operating cost, onboarding/support, retention or relevant demand, privacy and applicable governance/disclosures. A technically green repository alone is not market ready.

EXECUTION: work in five review batches of 20 for the first 100. For each repo, inspect -> reproduce -> repair -> test -> review -> PR -> CI -> merge when required checks and comments are satisfied -> reverify. Use reviewed command profiles and isolated execution for untrusted project code. Keep unique products separate. When credentials/configuration are missing, finish independent work and identify the exact blocker without asking for secret values.

REALITY GATE: PASS only after the actual check succeeds for the recorded source. Otherwise use FAIL, BLOCKED, NOT_RUN or reviewed NOT_APPLICABLE. Missing/stale evidence never becomes PASS. A hosted preview failure is not a passing deployment. Historical on-chain components do not establish present-day application liveness.

PRODUCTION/MARKET SCORECARD (100): architecture/build 8; functional completeness 10; blockchain/deployment 12; security 14; tests/reliability 12; payments/wallets/tokenomics 8; AI/interoperability 6; operations/recovery 10; customer/market evidence 12; legal/governance/launch preparation 8. Keep this separate from the coordinator's provisional local technical checklist. Unassessed evidence gets no earned credit; optional features require justified applicability. 85 permits review only, not automatic launch. No unresolved critical defect, missing source match or absent operational ownership can be overridden by a score.

SPENDING GATE: no mainnet deployment, production minting, treasury transfer, paid infrastructure or ICP cycles spending until applicable technical layers are genuinely green AND I approve the concrete source/artifact, chain, addresses/roles, actions and maximum budget. Do not request this approval before those artifacts are ready. Keep signers external and authorized.

PERSIST RESULTS: write per-repo status, tested commit, actual gate results, remaining defects, deployment observations, score evidence and the next action. Preserve a resumable mission journal. Update the central queue after each accepted repair. Do not claim 100 finished projects or 100/100 without the corresponding evidence.

DO THE WORK: prioritize actual implementation over another generic plan. Continue all authorized independent work until the current batch is complete or a concrete external dependency blocks it. Report exactly what passed, what is still blocked, and what needs user action. Never fabricate a transaction, security audit, customer metric or completion certificate.
```
