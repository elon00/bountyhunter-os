/**
 * Universal Reality Law Engine (URS v1.0)
 * Mathematical Definition:
 *   URS_10 = min(E, I, O, V, R, C, P, F, A, H) * 10
 *
 * Law of Non-Simulation:
 *   Any single critical gate failure drops the overall system to NOT_VERIFIED.
 */

export const URS_DIMENSIONS = [
  'E_ExecutionReality',
  'I_InputReality',
  'O_OutputImpact',
  'V_IndependentVerification',
  'R_Reproducibility',
  'C_ClaimHonesty',
  'P_Provenance',
  'F_FailClosedSafety',
  'A_AdversarialSecurity',
  'H_ExternalAudit'
];

export function calculateUrsScore(dimensions) {
  const scores = URS_DIMENSIONS.map(d => {
    const val = Number(dimensions[d]);
    return Number.isFinite(val) ? Math.max(0, Math.min(1, val)) : 0;
  });

  const weakestLink = Math.min(...scores);
  const composite10 = Number((weakestLink * 10).toFixed(2));
  const arithmeticAverage = Number(((scores.reduce((a, b) => a + b, 0) / scores.length) * 10).toFixed(2));

  const hasCriticalFailure = scores.some(s => s < 0.5);

  return {
    scores: Object.fromEntries(URS_DIMENSIONS.map((d, i) => [d, scores[i]])),
    weakestLink,
    composite10,
    arithmeticAverage,
    status: hasCriticalFailure ? 'FAILED_CRITICAL_GATE' : (weakestLink >= 0.6 ? 'EVIDENCE_BASED_PQC_PROTOCOL' : 'PROVISIONAL')
  };
}

export function evaluateFailClosedGate(condition, errorMessage) {
  if (!condition) {
    throw new Error(`[URS FAIL-CLOSED VIOLATION]: ${errorMessage}`);
  }
  return true;
}
