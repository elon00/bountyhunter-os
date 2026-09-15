# QMoosa Master Project Finisher — Unified Engineering Blueprint

## Mission
Finish projects with evidence, not claims. Existing repositories are preserved; reusable capabilities are integrated through adapters.

## Canonical Pipeline
1. DISCOVER — inventory repo, opportunity, constraints, current deployment, and existing artifacts.
2. CLASSIFY — identify project type, blockchain/network, hackathon/grant fit, risk, and completion level.
3. AUDIT — inspect source, dependencies, workflows, tests, deployment config, secrets exposure, and evidence.
4. PLAN — create P0/P1/P2 backlog with explicit acceptance criteria.
5. IMPLEMENT — add only necessary code/docs/config; reuse existing components before creating duplicates.
6. INTEGRATE — connect agent, policy, security, blockchain, AI, UI, and evidence layers through stable interfaces.
7. TEST — unit, integration, build, security, deployment smoke tests, and negative-path tests.
8. VERIFY — independently verify outputs, commit SHA, workflow status, deployment URL, network/chain, and artifacts.
9. DEPLOY — deploy only after required gates pass; keep production and testnet/devnet state explicit.
10. PACKAGE — README, architecture, screenshots, demo script/video plan, pitch deck, and submission copy.
11. SUBMIT — match the project to an eligible hackathon, grant, bounty, or launch opportunity and capture proof.
12. REPORT — record status as COMPLETE, BLOCKED, or PARTIAL with evidence links and next actions.

## Non-negotiable completion gates
- Required functionality works end-to-end.
- Automated tests pass for both success and failure paths.
- Build succeeds.
- Security checks pass or documented exceptions have evidence.
- Deployment target and network are explicitly verified.
- No secret/private key is committed.
- README and operator instructions are current.
- Demo path works from a clean start.
- Completion record contains commit SHA + workflow/test/deployment evidence.

## QMoosa Web4 reference architecture
Agent → Identity → Trust → Policy → Astra/Reasoning → Authorization → Nexus/Execution → Audit/Evidence.

A reasoning model must never bypass the deterministic authorization/policy gate. Denied actions remain denied and are auditable.

## Reuse rule
A capability becomes a reusable module only after it has tests and a documented interface. Project-specific adapters translate between the master pipeline and each repository instead of copying entire systems.

## Status vocabulary
- PLANNED: not implemented.
- IMPLEMENTED: code exists.
- TESTED: required tests passed.
- VERIFIED: independent evidence confirms behavior.
- DEPLOYED: deployment target and version are confirmed.
- COMPLETE: all required gates for the defined scope pass.

Never label a project COMPLETE based only on source code presence or a green GitHub Pages deployment.

## Project execution loop
INVENTORY → GAP MAP → P0 FIXES → TEST → SECURITY → DEPLOY → VERIFY → PACKAGE → OPPORTUNITY MATCH → SUBMIT → EVIDENCE → CLOSE.
