# QMoosa Master Healing Blueprint — One-Click Reality Mode

## Purpose

Provide one reusable, fail-closed control plane for repairing repository health problems without claiming that an unresolved problem is fixed.

Canonical authority: **BountyHunter OS**.

## Core law

`DETECT → CLASSIFY → SNAPSHOT → HEAL → TEST → SECURITY → BUILD → VERIFY → REPORT`

A green local command is not proof of production health. A simulated, emulated, mocked, or unreachable external service is never promoted to VERIFIED.

## Healing classes

| Class | Examples | Automatic action |
|---|---|---|
| Dependency | vulnerable/outdated package, lock drift | deterministic upgrade to an explicitly approved fixed version; regenerate lock |
| Build | compile/type/build failure | diagnose, apply only deterministic low-risk fixes |
| Test | failing unit/integration test | diagnose; never weaken/delete the test |
| Config | malformed CI/config | repair syntax and known schema errors |
| Security | known CVE, secret exposure, unsafe dependency | patch or BLOCK; never suppress the finding |
| Evidence | missing/contradictory proof | generate/repair evidence metadata; never fabricate external proof |
| Deployment | failed/unverified deployment | validate logs/endpoints; BLOCK if external evidence is absent |
| Hardware/QPU | provider auth/job/result missing | BLOCK; do not convert simulator/emulation into hardware proof |

## CVE healing policy

For a reported advisory, resolve the dependency at the **source of truth** (direct manifest or transitive lock), regenerate the lockfile, run tests/build, then re-run the security scanner.

Never use a blanket force upgrade when it can introduce unrelated breaking changes.

## One-click stages

1. Discover repository manifests and lockfiles.
2. Create a machine-readable baseline.
3. Detect deterministic fix candidates.
4. Apply only allow-listed safe repairs.
5. Install from the lockfile.
6. Run tests.
7. Run security/CVE scans.
8. Run production build/typecheck/lint where available.
9. Validate CI configuration.
10. Validate external deployment only when an explicit URL/evidence source exists.
11. Produce a signed-by-content evidence report.
12. Return one of:
   - `HEALED`
   - `HEALED_WITH_WARNINGS`
   - `BLOCKED_EXTERNAL_PROOF`
   - `BLOCKED_UNSAFE_FIX`
   - `FAILED`

## 10/10 definition

10/10 is granted only when every mandatory gate has evidence:

- source-of-truth dependency state is clean;
- tests pass;
- security scan passes;
- build passes;
- CI is green;
- deployment is independently reachable when deployment is claimed;
- external provider/hardware claims have provider-issued evidence;
- no mock/simulation/emulation is masquerading as reality;
- working tree and generated report are reproducible;
- BountyHunter OS records the final commit and gate results.

## Team operating model

**User:** provides authorization/credentials for external services and runs actions that require their private accounts.

**BountyHunter OS:** audits repository state, applies deterministic repository fixes, runs verification, captures evidence, and fails closed.

**External providers:** remain the authority for provider-issued execution IDs, job status, hardware identity, and provider-returned results.

## Golden rule

**One click starts everything; it does not invent evidence.**

If a fix cannot be established safely and reproducibly, the system stops at the exact failing gate and tells the operator what evidence/action is required next.
