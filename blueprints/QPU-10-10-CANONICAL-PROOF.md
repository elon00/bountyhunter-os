# QPU 10/10 Canonical Proof Blueprint

## Objective
Make QMoosa-PQS eligible for a 10/10 evidence-backed QPU execution certification under the BountyHunter OS canonical control plane.

Fail-closed rule: no LIVE_QPU_VERIFIED status is allowed from endpoint reachability, configured credentials, local simulation, calibrated emulation, or a locally generated job ID.

## Canonical control flow
BountyHunter OS is the control plane:

DISCOVER -> CLASSIFY -> AUDIT -> FIX -> TEST -> VERIFY -> DEPLOY -> ATTEST -> REPORT

QMoosa-PQS is the workload/provider adapter. BountyHunter OS owns the final certification decision.

## 10/10 gates

| Gate | Required evidence | PASS condition |
|---|---|---|
| G0 Identity | repo, commit SHA, dirty-tree state | immutable run identity captured |
| G1 Reproducibility | clean install + lockfile | deterministic dependency install |
| G2 Software | unit/integration/E2E tests | all mandatory tests pass |
| G3 Security | secret scan + dependency audit + truth audit | no blocking finding |
| G4 Circuit | canonical Bell/GHZ test vector + hash | exact circuit artifact captured |
| G5 Provider auth | provider response | authenticated session proven |
| G6 Provider submission | provider-issued job/task ID | ID comes from provider response, never generated locally |
| G7 Provider lifecycle | queued/running/completed state | provider reports terminal success |
| G8 Provider result | provider-returned measurement/result payload | result retrieved directly from provider |
| G9 Hardware identity | provider backend/device + execution metadata | backend is an actual QPU and is bound to the job |
| G10 Integrity | signed/hashed attestation bundle | receipt hash verifies and artifacts are immutable |
| G11 Independent replay | second verifier checks provider receipt/result | verifier reaches same conclusion without trusting local status |
| G12 Canonical CI | BountyHunter OS gate | all mandatory checks green |
| G13 Public evidence | release artifact/evidence URL | reviewer can inspect evidence without secrets |
| G14 Final state | report + commit + clean tree | CERTIFIED_10_OF_10 only when every mandatory gate passes |

## QPU proof minimum
A provider request returning HTTP 200 is not enough.

A valid proof bundle must contain:
- provider name
- provider-issued job/task ID
- backend name
- provider-reported submission timestamp
- provider-reported terminal status
- provider-returned result/counts
- requested shot count and observed shot count
- canonical circuit hash
- provider execution metadata where available
- exact API version/endpoint
- receipt creation time
- SHA-512 or SHA3-512 digest over the canonical receipt
- verifier result
- BountyHunter OS run ID and commit SHA

## Anti-fabrication controls
1. Never generate a provider job ID locally.
2. Never mark hardware execution from HTTP reachability alone.
3. Never use simulator counts as provider results.
4. Never turn calibrated emulation into a hardware PASS.
5. Never accept a hand-written provider receipt as proof unless the receipt is retrieved from the provider or independently bound to provider evidence.
6. Secrets must stay in environment variables/GitHub Secrets and never enter commits or reports.
7. Any missing mandatory artifact produces BLOCKED/FAIL, not PASS.
8. The final status is computed by the canonical control plane, not by the workload adapter.

## Team split
### User (required external actions)
- Configure an authorized provider account/plan and access to an actual QPU backend.
- Add the provider credential/required instance identifier as local environment variables or repository secrets; never paste secrets into chat.
- Run the canonical proof command in the authenticated environment when direct provider access is required.
- If the provider requires an interactive approval/instance selection, complete that step.
- Publish the resulting non-secret evidence bundle or attach it to the release/PR.

### ChatGPT / BountyHunter OS work
- Harden the proof protocol and fail-closed state machine.
- Remove any path that can label simulator output as physical QPU output.
- Capture provider-issued IDs and provider-returned results.
- Validate receipt integrity and schema.
- Add tests for false-positive scenarios.
- Wire the QPU gate into the canonical BountyHunter OS finisher.
- Produce a machine-readable report and human-readable certification report.
- Re-run repository CI and inspect every mandatory check.
- Do not claim 10/10 until provider evidence is actually present and independently verified.

## Certification states
NOT_READY -> SOFTWARE_VERIFIED -> PROVIDER_AUTH_PENDING -> PROVIDER_EXECUTION_PENDING -> PROVIDER_RESULT_PENDING -> INDEPENDENT_VERIFICATION_PENDING -> CERTIFIED_10_OF_10

Any failed mandatory gate returns to BLOCKED/FAILED; no partial state may be promoted to certification.

## Definition of Done
The project is 10/10 only when:
- BountyHunter OS canonical finisher is green.
- QMoosa-PQS mandatory software/security tests are green.
- A real provider-issued job/task ID is captured.
- Provider reports successful completion on an actual QPU.
- Provider-returned results are captured and verified.
- The local simulator is not used as the claimed hardware result.
- Receipt/evidence integrity checks pass.
- A second verification path independently validates the evidence.
- The final canonical report says CERTIFIED_10_OF_10.
- The evidence bundle is reproducible by a reviewer without access to secrets.

## Current known blocker
The existing QMoosa-PQS gateway can fall back to local calibrated emulation after provider failure, and its current job IDs are locally generated. Therefore those fields cannot certify physical QPU execution. The current Origin evidence also recorded an unauthorized response. This blueprint intentionally keeps certification blocked until genuine provider evidence exists.