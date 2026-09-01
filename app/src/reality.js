export const STAGES = [
  { id: "DISCOVER", label: "Discover", description: "Map codebase topology and repository tree" },
  { id: "CLASSIFY", label: "Classify", description: "Identify frameworks, runtimes, and targets" },
  { id: "AUDIT", label: "Audit", description: "Scan dependencies, secrets, and security rules" },
  { id: "FIX", label: "Fix", description: "Apply safe, deterministic, reversible patches" },
  { id: "TEST", label: "Test", description: "Execute unit, integration, and contract tests" },
  { id: "VERIFY", label: "Verify", description: "Require machine evidence before status claims" },
  { id: "DEPLOY", label: "Deploy", description: "Publish verified builds to Netlify / staging" },
  { id: "REPORT", label: "Report", description: "Generate verifiable audit logs and verdicts" }
];

export function evaluateProject(checks) {
  if (!Array.isArray(checks) || checks.length === 0) return "NOT VERIFIED";
  return checks.every(Boolean) ? "VERIFIED PASS" : "NOT VERIFIED";
}

export function calculateIntegrityScore(checks) {
  if (!Array.isArray(checks) || checks.length === 0) return 0;
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function classifyStage(stageIndex) {
  const index = Math.max(0, Math.min(STAGES.length - 1, Number(stageIndex) || 0));
  return STAGES[index];
}

export function filterBounties(bounties, { query = "", tag = "ALL" } = {}) {
  if (!Array.isArray(bounties)) return [];
  const normalizedQuery = query.toLowerCase().trim();
  return bounties.filter(bounty => {
    const matchesTag = tag === "ALL" || (bounty.tags && bounty.tags.includes(tag));
    const matchesQuery = !normalizedQuery ||
      bounty.title.toLowerCase().includes(normalizedQuery) ||
      bounty.description.toLowerCase().includes(normalizedQuery) ||
      (bounty.tags && bounty.tags.some(t => t.toLowerCase().includes(normalizedQuery)));
    return matchesTag && matchesQuery;
  });
}

export function getBountyStats(bounties) {
  if (!Array.isArray(bounties)) return { total: 0, totalRewardUsdc: 0, verifiedCount: 0 };
  const total = bounties.length;
  const totalRewardUsdc = bounties.reduce((sum, b) => sum + (Number(b.rewardUsdc) || 0), 0);
  const verifiedCount = bounties.filter(b => b.status === "VERIFIED PASS").length;
  return { total, totalRewardUsdc, verifiedCount };
}

