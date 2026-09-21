# Portfolio quality baseline — 2026-09-21

GitHub search `user:elon00 fork:false` returned 67 accessible non-fork repositories, including reference material and learning repositories. Non-fork ownership alone does not establish original authorship. The 29 candidates below were selected from the named projects and related product repositories; this is not a claim that every self-created project is identified or finished. No private repository identities are included here.

## Readiness criteria

Each project needs agreed functional acceptance checks, reproducible dependencies, meaningful tests, security review, usable UI where applicable, deployment evidence tied to the tested commit, and setup/submission documentation. Source inspection and successful builds alone do not establish production readiness.

## Source inventory

| Repository | Default branch | Source findings |
|---|---|---|
| [elon00/martins-algorithm](https://github.com/elon00/martins-algorithm) | main | Contains Midnight integration files; preserve until boundary review |
| [elon00/solana-ai](https://github.com/elon00/solana-ai) | main | No root npm test script; identify project-specific test gates; Commands depend on a developer's absolute Windows path; No recognized dependency lock or requirements file |
| [elon00/qmoosa-deep-tech-ai-quantum-platform](https://github.com/elon00/qmoosa-deep-tech-ai-quantum-platform) | master | Contains Midnight integration files; preserve until boundary review |
| [elon00/QSui](https://github.com/elon00/QSui) | main | Project-specific test and runtime review required |
| [elon00/shor](https://github.com/elon00/shor) | master | Project-specific test and runtime review required |
| [elon00/Algo_Qain](https://github.com/elon00/Algo_Qain) | main | No root npm test script; identify project-specific test gates |
| [elon00/qton](https://github.com/elon00/qton) | main | Project-specific test and runtime review required |
| [elon00/pq-rdl-blockchain](https://github.com/elon00/pq-rdl-blockchain) | master | Project-specific test and runtime review required |
| [elon00/quantum-portfolio-optimizer](https://github.com/elon00/quantum-portfolio-optimizer) | main | No root npm test script; identify project-specific test gates |
| [elon00/bnb-qusd](https://github.com/elon00/bnb-qusd) | main | Project-specific test and runtime review required |
| [elon00/qmoosa-nexus-platform](https://github.com/elon00/qmoosa-nexus-platform) | main | Project-specific test and runtime review required |
| [elon00/quantumshield](https://github.com/elon00/quantumshield) | master | Project-specific test and runtime review required |
| [elon00/QARBI](https://github.com/elon00/QARBI) | main | Project-specific test and runtime review required |
| [elon00/alcat-mesh](https://github.com/elon00/alcat-mesh) | main | Commands depend on a developer's absolute Windows path |
| [elon00/qmoosa-pqs](https://github.com/elon00/qmoosa-pqs) | main | No root npm test script; identify project-specific test gates |
| [elon00/del-ai](https://github.com/elon00/del-ai) | main | No root npm test script; identify project-specific test gates; Commands depend on a developer's absolute Windows path |
| [elon00/my_yellow_project](https://github.com/elon00/my_yellow_project) | main | No root npm test script; identify project-specific test gates |
| [elon00/solutionai](https://github.com/elon00/solutionai) | master | No root npm test script; identify project-specific test gates |
| [elon00/wayai-nft-launch](https://github.com/elon00/wayai-nft-launch) | master | Project-specific test and runtime review required |
| [elon00/omnicall-quantum-sentinel](https://github.com/elon00/omnicall-quantum-sentinel) | master | Project-specific test and runtime review required |
| [elon00/QDS](https://github.com/elon00/QDS) | main | No root npm test script; identify project-specific test gates |
| [elon00/shor-x402](https://github.com/elon00/shor-x402) | main | Project-specific test and runtime review required |
| [elon00/tiddi-token](https://github.com/elon00/tiddi-token) | master | Generated node_modules content is tracked |
| [elon00/jarsol-web4-automaton](https://github.com/elon00/jarsol-web4-automaton) | main | No root npm test script; identify project-specific test gates |
| [elon00/quantum-ai](https://github.com/elon00/quantum-ai) | master | Project-specific test and runtime review required |
| [elon00/omniver-quantum-decoder](https://github.com/elon00/omniver-quantum-decoder) | master | Project-specific test and runtime review required |
| [elon00/bountyhunter-os](https://github.com/elon00/bountyhunter-os) | main | Project-specific test and runtime review required |
| [elon00/solana-pqc](https://github.com/elon00/solana-pqc) | master | Commands depend on a developer's absolute Windows path |
| [elon00/Quantum-Drug-Discovery-for-Malaria-Tuberculosis-Using-VQE-QML](https://github.com/elon00/Quantum-Drug-Discovery-for-Malaria-Tuberculosis-Using-VQE-QML) | main | No root npm test script; identify project-specific test gates; No recognized dependency lock or requirements file |

## Architecture and priorities

1. Bounty Hunter PR #4 was merged after all three GitHub workflows passed and actual dashboard JavaScript passed DOM interaction checks. Browser screenshot QA was unavailable because Chromium could not be downloaded.
2. PQ-RDL PR #8 fixes accounting and frame limits. Its cryptographic application path, peer TLS transport and HTTP authorization still block a production claim.
3. Deep Tech contains `test:midnight` and Midnight files. Preserve this intentional-looking integration pending a project-boundary review; do not extract it automatically. Quantumshield code also appears nested in multiple repos; compare provenance and dependencies before removing any copies.
4. Solana AI, Solana PQC, Alcat Mesh and Del AI have machine-specific Windows test commands. Replace those with local dependencies and verify on clean CI before claiming portable operation.
5. Tiddi tracks node_modules. A cleanup needs a reproducible lockfile install and successful contract tests before removing generated content.
6. Kind, Nameless ERC and the exact seven-technology acceptance criteria are not yet mapped with sufficient confidence. They remain unresolved, not silently assigned to similarly named repositories.
7. A prior context item mentioned an All Things Agentic submission freeze through approximately October 8, but did not identify the submitted repo. Verify the submission mapping before changing a potentially affected default branch or submission materials; draft improvements are reviewable separately.

## Using the registry

`config/projects.json` is the executable mapping; `config/project-registry.yml` remains a legacy role catalog.

- `npm run portfolio:status` inspects local checkout availability, repository identity and configured gates without running project scripts.
- `npm run portfolio:status -- --project pq-rdl-blockchain --run` runs its configured local accounting and build gates.
- `--workspace /absolute/path` selects the directory containing independent repo checkouts.
- Each run records commit, dirty-tree state, command result, output and missing gates under `.qmoosa/portfolio-quality.json`.
- The runner never marks a project COMPLETE or deploys it. Security/deployment checks without configuration remain NOT CONFIGURED. Only Bounty Hunter and the new PQ-RDL branch have commands configured in this first implementation; all other candidates require script review first.

Current validation: five runner regression tests cover no-execution inventory, required project selection, failing tests, wrong repository identity and path escape. A local PQ-RDL run executed its accounting and build gates and returned PARTIAL with security/deployment unconfigured. The full portfolio has not been executed or certified.

