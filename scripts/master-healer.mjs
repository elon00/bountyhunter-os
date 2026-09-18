#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, ".qmoosa");
mkdirSync(outDir, { recursive: true });
const gates = [];
const startedAt = new Date().toISOString();

function gate(name, status, evidence="") {
  gates.push({name,status,evidence});
  console.log(`[${status}] ${name}${evidence ? " — "+evidence : ""}`);
}

function run(name, file, args, timeout=180000) {
  try {
    execFileSync(file,args,{cwd:root,stdio:"pipe",encoding:"utf8",timeout,env:{...process.env,CI:process.env.CI ?? "1"}});
    gate(name,"PASS",`${file} ${args.join(" ")}`);
    return true;
  } catch (e) {
    const output=(String(e.stdout||"")+" "+String(e.stderr||"")).trim().split("\n").slice(-5).join(" | ");
    gate(name,"FAIL",output||String(e.message||e));
    return false;
  }
}

console.log("QMOOSA MASTER HEALER — REALITY MODE");
console.log("No fabricated PASS; unsafe fixes fail closed.");

gate("repository manifest", existsSync("package.json") || existsSync("pyproject.toml") || existsSync("requirements.txt") ? "PASS" : "FAIL","supported manifest detected");

const pkgPath=resolve(root,"package.json");
let pkg=null;
if (existsSync(pkgPath)) {
  try { pkg=JSON.parse(readFileSync(pkgPath,"utf8")); gate("package.json syntax","PASS"); }
  catch(e) { gate("package.json syntax","FAIL",e.message); }
}

// Deterministic healing only. Never use --force.
if (pkg) {
  const npmOk=run("npm lock/install verification","npm",["install","--package-lock-only","--ignore-scripts","--no-audit"],180000);
  if (!npmOk) gate("dependency healing","BLOCKED_UNSAFE_FIX","npm manifest/lock requires manual diagnosis");
  else gate("dependency healing","PASS","lockfile reconciled without --force");
  run("npm security audit","npm",["audit","--omit=dev"],180000);
  if (pkg.scripts?.test) run("project tests","npm",["test"],300000);
  if (pkg.scripts?.build) run("production build","npm",["run","build"],300000);
}

if (existsSync("requirements.txt") || existsSync("pyproject.toml")) {
  if (existsSync("requirements.txt")) {
    run("Python dependency compilation check","python",["-m","pip","check"],180000);
  } else {
    gate("Python dependency healing","BLOCKED_EXTERNAL_PROOF","pyproject.toml detected; use project-specific resolver rather than rewriting dependencies blindly");
  }
}

const failures=gates.filter(g=>g.status==="FAIL");
const blocked=gates.filter(g=>g.status.startsWith("BLOCKED"));
const status=failures.length ? "FAILED" : blocked.length ? "BLOCKED_EXTERNAL_PROOF" : "HEALED";
const report={system:"BOUNTYHUNTER-OS",mode:"REALITY_MODE",status,startedAt,finishedAt:new Date().toISOString(),commit:(()=>{try{return execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim()}catch{return null}})(),gates,policy:{noForceFixes:true,noFabricatedEvidence:true,externalProofFailClosed:true}};
writeFileSync(resolve(outDir,"master-healing-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("\nFINAL STATUS:",status);
process.exitCode=failures.length ? 1 : blocked.length ? 2 : 0;
