import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGES,
  evaluateProject,
  calculateIntegrityScore,
  classifyStage,
  filterBounties,
  getBountyStats
} from "../src/reality.js";

test("evaluateProject - returns VERIFIED PASS when all checks pass", () => {
  assert.equal(evaluateProject([true, true, true]), "VERIFIED PASS");
  assert.equal(evaluateProject([true]), "VERIFIED PASS");
});

test("evaluateProject - returns NOT VERIFIED if any check fails or is empty", () => {
  assert.equal(evaluateProject([true, false]), "NOT VERIFIED");
  assert.equal(evaluateProject([false]), "NOT VERIFIED");
  assert.equal(evaluateProject([]), "NOT VERIFIED");
  assert.equal(evaluateProject(null), "NOT VERIFIED");
});

test("calculateIntegrityScore - calculates percentage accurately", () => {
  assert.equal(calculateIntegrityScore([true, true]), 100);
  assert.equal(calculateIntegrityScore([true, false]), 50);
  assert.equal(calculateIntegrityScore([true, true, true, false]), 75);
  assert.equal(calculateIntegrityScore([]), 0);
});

test("classifyStage - resolves valid pipeline stages", () => {
  assert.equal(classifyStage(0).id, "DISCOVER");
  assert.equal(classifyStage(5).id, "VERIFY");
  assert.equal(classifyStage(7).id, "REPORT");
  assert.equal(classifyStage(999).id, "REPORT");
  assert.equal(classifyStage(-5).id, "DISCOVER");
  assert.equal(STAGES.length, 8);
});

test("filterBounties - filters by query and tags correctly", () => {
  const sampleBounties = [
    { title: "Smart Contract Audit", description: "Audit ERC20 bridge", tags: ["AUDIT", "WEB3"], rewardUsdc: 2500, status: "VERIFIED PASS" },
    { title: "PQC Solana Integration", description: "NIST FIPS 203 ML-KEM", tags: ["PQC", "SOLANA"], rewardUsdc: 5000, status: "NOT VERIFIED" },
    { title: "Automaton Telemetry UI", description: "Vite dashboard for agents", tags: ["UI", "VITE"], rewardUsdc: 1200, status: "VERIFIED PASS" }
  ];

  const filteredByTag = filterBounties(sampleBounties, { tag: "PQC" });
  assert.equal(filteredByTag.length, 1);
  assert.equal(filteredByTag[0].title, "PQC Solana Integration");

  const filteredByQuery = filterBounties(sampleBounties, { query: "bridge" });
  assert.equal(filteredByQuery.length, 1);
  assert.equal(filteredByQuery[0].title, "Smart Contract Audit");

  const allFiltered = filterBounties(sampleBounties, { tag: "ALL", query: "" });
  assert.equal(allFiltered.length, 3);
});

test("getBountyStats - aggregates metrics correctly", () => {
  const sampleBounties = [
    { rewardUsdc: 1000, status: "VERIFIED PASS" },
    { rewardUsdc: 2000, status: "NOT VERIFIED" },
    { rewardUsdc: 500, status: "VERIFIED PASS" }
  ];

  const stats = getBountyStats(sampleBounties);
  assert.equal(stats.total, 3);
  assert.equal(stats.totalRewardUsdc, 3500);
  assert.equal(stats.verifiedCount, 2);
});

