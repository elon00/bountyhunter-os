# QMoosa Master Operating System

## One command: Start and Finish Everything

This repository is the unified home for:

- QMoosa Master Project Finisher
- BountyHunter OS
- Conway AI Automaton integrations

### Pipeline

`DISCOVER → CLASSIFY → AUDIT → FIX → TEST → VERIFY → DEPLOY → REPORT`

### Safety and evidence rules

- No production PASS without evidence.
- No secrets committed.
- Automatic fixes are limited to deterministic, low-risk repository changes.
- Deployment requires successful applicable build/test gates.

Run locally:

```bash
npm install
npm run qmoosa:finish
```

### Current scope

The finisher runs local audit, test and build checks. It does not yet execute the
full cross-project pipeline or verify deployments; a successful local run is
`PARTIAL`. The dashboard is an unverified project catalog until an execution
service and commit-bound evidence are connected. Its command buttons do not run
server-side checks.

The Mother Body coordinates independently maintained project repositories.
Distinct projects keep their own history, dependencies, licenses, deployments
and hackathon submissions. See the [code and project-boundary audit](audits/2026-09-21-code-and-project-boundaries.md)
for findings, fixes and outstanding integration work.
