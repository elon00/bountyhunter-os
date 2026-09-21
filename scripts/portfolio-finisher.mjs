#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here=dirname(fileURLToPath(import.meta.url));
const mother=resolve(here,"..");
const workspace=resolve(mother,"..");
const registry=JSON.parse(readFileSync(resolve(mother,"portfolio.registry.json"),"utf8"));
const registryProjects=[...(registry.verified_priority??[]),...(registry.gated_projects??[])];
const projects=registryProjects.map(p=>({
  name:p.name,
  dir:p.name==="bountyhunter-os"?mother:resolve(workspace,p.name),
  cmd:p.gate.trim().split(/\s+/),
  strength:p.strength??"aggregate",
  externalEvidenceRequired:p.external_evidence_required??true
}));
const results=[];
const startedAt=new Date().toISOString();
function run(x){
 if(!existsSync(x.dir)){results.push({...x,status:"BLOCKED",evidence:"repository not present in local workspace"});return;}
 try{
  const [file,...args]=x.cmd;
  execFileSync(file,args,{cwd:x.dir,stdio:"inherit",timeout:600000,env:{...process.env,CI:process.env.CI??"1"}});
  results.push({...x,status:x.externalEvidenceRequired?"PARTIAL_LOCAL_GATE_PASS":"VERIFIED_LOCAL",evidence:x.cmd.join(" ")});
 }catch(e){results.push({...x,status:"FAILED",evidence:`exit=${e.status??"unknown"} ${x.cmd.join(" ")}`});}
}
console.log("QMOOSA ONE-CLICK PORTFOLIO FINISHER — FAIL-CLOSED REALITY MODE");
for(const x of projects) run(x);
const failed=results.filter(x=>x.status==="FAILED");
const blocked=results.filter(x=>x.status==="BLOCKED");
const partial=results.filter(x=>x.status==="PARTIAL_LOCAL_GATE_PASS");
const status=failed.length?"FAILED":blocked.length||partial.length?"PARTIAL":"VERIFIED_LOCAL";
const finishedAt=new Date().toISOString();
const out={system:"QMOOSA_ONE_CLICK_PORTFOLIO_FINISHER",status,startedAt,finishedAt,projects:results,policy:{externalEvidenceRequired:true,mainnetNeverAutoAuthorized:true,secretsNeverRequested:true,missingEvidenceIsNotVerified:true}};
const outDir=resolve(mother,".qmoosa"); mkdirSync(outDir,{recursive:true});
const outPath=resolve(outDir,"portfolio-finisher-report.json"); writeFileSync(outPath,JSON.stringify(out,null,2)+"\n");
console.log("\nPORTFOLIO STATUS:",status); console.log("REPORT:",outPath);
if(failed.length||blocked.length){console.log("ALL PROJECTS DONE is intentionally withheld until every required gate has evidence.");}
process.exitCode=failed.length?1:blocked.length?2:0;
