# Bounty Hunter code and project-boundary audit

Reviewed baseline: `3c5435810c17f340c7ecfd53b5f44ea5c6a30518`.
Scope: repository source, finisher, dashboard, registry, tests and CI. External repositories, deployed applications, institutional relationships and live payments were not verified.

## Findings and changes

1. **High: dashboard fabricated execution evidence.** `app/src/main.js` initialized all checks to true, hardcoded successful terminal output and marked every check true when the user clicked verification. Test and reality buttons only appended success strings. Changed initial checks and bounty statuses to NOT VERIFIED, removed initial success claims, prevented manual check toggles from certifying anything, and made command buttons disclose that execution has not occurred. No execution backend or evidence importer exists yet. Catalog descriptions and reward values remain unverified entries.
2. **High: finisher could report COMPLETE without deployment.** `scripts/start-and-finish-everything.mjs` inferred completion from local commands and optional directories. It never deployed or verified a deployment. Added an explicit missing deployment gate; successful local runs remain PARTIAL. Regression coverage includes both optional directories being present.
3. **High: missing commands could pass and root tests were omitted.** Required audit/build commands used `--if-present`, and the finisher only ran application tests. Removed optional execution for these required commands and now run the repository's full `npm test`. Regression coverage verifies root test failures produce FAILED and nonzero exit.
4. **Medium: portfolio scanner had an unused obsolete import.** Removed `@noble/hashes/sha256`, which is inconsistent with the pinned package's exports. The scanner still uses machine-specific Windows paths, trusts certificate fields without verification, defaults an absent score to 6.0, and treats signature presence as certification. Those remain unresolved; scanner output is not cryptographic verification.
5. **Architecture gap: registry is not orchestration.** `config/project-registry.yml` lists three names and required gates, but lacks repository URLs and is not consumed by the finisher. Discovery checks two fixed relative directories; their presence is not a test of those projects. The dashboard catalog is not proof their code is merged here.
6. **Evidence scope gap.** `scripts/audit-crypto.mjs` exercises library primitives, includes a hardcoded classical payment boolean, and does not demonstrate a live payment integration. Tests labelled NIST/Wycheproof do not by themselves establish formal certification or execution of the complete external test suites. No new certification claim is made.

## Mother Body boundary decision

Use this repository to list and coordinate independent projects. Each distinct project retains its own repository, history, dependencies, license, deployment and hackathon submission. Record canonical repository URL, project ID, event/submission, integration relationship, commit and evidence locations for each entry. Unresolved URLs must remain unknown until checked; do not invent them from display names.

Midnight is not named in the reviewed tracked source. Its intended integration and repository must be identified before moving or extracting code. Existing intentional integrations may remain together. No project code was moved, split or merged in this change.

Next implementation requires verified repository mappings, a registry-consuming runner, per-project isolated checks and commit-bound evidence ingestion. Live deployment and payment checks must use actual provider evidence. These tasks remain open.

## Validation

Locked dependencies installed with lifecycle scripts disabled. Existing 10 root tests and 11 application tests passed before adding regression coverage; production Vite build passed. Final finisher validation and the added regression tests are recorded in the accompanying PR. Browser interaction rendering and external deployments were not tested in this audit.
