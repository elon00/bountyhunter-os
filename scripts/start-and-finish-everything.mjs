#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const startedAt = new Date().toISOString();
const results = [];
const root = process.cwd();
const reportDir = resolve(root, ".qmoosa");
const reportPath = resolve(reportDir, "master-finisher-report.json");

function record(name, status, evidence = "") {
  results.push({ name, status, evidence });
  const icon = status === "PASS" ? "PASS" : status === "SKIP" ? "SKIP" : "FAIL";
  console.log(`[${icon}] ${name}${evidence ? ` — ${evidence}` : ""}`);
}

function command(name, file, args, options = {}) {
  const started = Date.now();
  const windowsNpm = process.platform === "win32" && file === "npm";
  const executable = windowsNpm ? "cmd.exe" : file;
  const executableArgs = windowsNpm ? ["/d", "/s", "/c", "npm.cmd", ...args] : args;

  try {
    execFileSync(executable, executableArgs, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf8",
      timeout: options.timeout ?? 180000,
      env: { ...process.env, CI: process.env.CI ?? "1" }
    });
    record(name, "PASS", `${executable} ${executableArgs.join(" ")} (${Date.now() - started}ms)`);
    return true;
  } catch (error) {
    const stdout = typeof error.stdout === "string" ? error.stdout : "";
    const stderr = typeof error.stderr === "string" ? error.stderr : "";
    const output = `${stdout}${stderr}`.trim().split("\n").slice(-3).join(" | ");
    const details = [
      error.code ? `code=${error.code}` : "",
      error.errno ? `errno=${error.errno}` : "",
      error.syscall ? `syscall=${error.syscall}` : "",
      Number.isInteger(error.status) ? `exit=${error.status}` : "",
      output
    ].filter(Boolean).join(" | ");
    record(name, "FAIL", details || `${executable} ${executableArgs.join(" ")} (${Date.now() - started}ms)`);
    return false;
  }
}

console.log("🧙 QMOOSA MASTER PROJECT FINISHER");
console.log("REALITY MODE — evidence first, no fabricated PASS\n");

// DISCOVER
record("root package manifest", existsSync("package.json") ? "PASS" : "FAIL", existsSync("package.json") ? "package.json present" : "package.json missing");
record("truth protocol", existsSync("QMOOSA_TRUTH_PROTOCOL.md") ? "PASS" : "FAIL", existsSync("QMOOSA_TRUTH_PROTOCOL.md") ? "present" : "missing");
record("CI workflow", existsSync(".github/workflows/ci.yml") ? "PASS" : "FAIL", existsSync(".github/workflows/ci.yml") ? "present" : "missing");

// Integrated Modules Discovery
const godsEyePresent = existsSync(resolve(root, "../gods-eye-view_xyz/package.json"));
record("module: gods-eye-view", godsEyePresent ? "PASS" : "SKIP", godsEyePresent ? "gods-eye-view_xyz detected" : "module absent");

const aiQuantumPresent = existsSync(resolve(root, "../../qmoosa-deep-tech-ai-quantum-platform/package.json"));
record("module: qmoosa-ai-quantum", aiQuantumPresent ? "PASS" : "SKIP", aiQuantumPresent ? "qmoosa-deep-tech-ai-quantum-platform detected" : "module absent");

// AUDIT / SECURITY
command("dependency lock integrity", "npm", ["ci", "--dry-run", "--ignore-scripts", "--no-audit"], { timeout: 180000 });
command("crypto/reality audit", "npm", ["run", "audit:crypto"], { timeout: 180000 });

// TEST / BUILD
command("repository and application test suites", "npm", ["test"], { timeout: 180000 });
command("application production build", "npm", ["--prefix", "app", "run", "build"], { timeout: 180000 });

// VERIFY
try {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  record("git commit identity", "PASS", sha);
} catch {
  record("git commit identity", "FAIL", "unable to resolve HEAD");
}

record("deployment verification", "SKIP", "No deployment verifier is configured; local checks cannot prove deployment.");

const failures = results.filter((r) => r.status === "FAIL");
const skips = results.filter((r) => r.status === "SKIP");
const localGatesPass = failures.length === 0;
const status = !localGatesPass ? "FAILED" : skips.length ? "PARTIAL" : "COMPLETE";

const report = {
  system: "BOUNTYHUNTER-OS",
  mode: "REALITY_MODE",
  status,
  startedAt,
  finishedAt: new Date().toISOString(),
  commit: (() => {
    try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); }
    catch { return null; }
  })(),
  gates: results,
  rules: {
    missingEvidenceIsNotVerified: true,
    simulationsAreNotDeploymentProof: true
  }
};

mkdirSync(reportDir, { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(`\nSTATUS: ${status}`);
console.log(`REPORT: ${reportPath}`);
if (status === "COMPLETE") console.log("All configured gates passed with verified evidence.");
else if (status === "PARTIAL") console.log("Local gates passed with optional modules recorded.");
else console.log("One or more required gates failed.");

process.exitCode = failures.length ? 1 : 0;
