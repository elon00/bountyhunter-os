#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here=dirname(fileURLToPath(import.meta.url));
const mother=resolve(here,"..");
const workspace=resolve(mother,"..");
const projects=[
  {name:"bountyhunter-os",dir:mother,cmd:["npm","run","qmoosa:finish"]},
  {name:"QARBI",dir:resolve(workspace,"QARBI"),cmd:["npm","run","finish"]},
  {name:"jarsol-web4-automaton",dir:resolve(workspace,"jarsol-web4-automaton"),cmd:["npm","run","qmoosa:finish"]},
  {name:"qmoosa-pqs",dir:resolve(workspace,"qmoosa-pqs"),cmd:["python","tests/run_all_tests.py"]},
  {name:"qmoosa-nexus-platform",dir:resolve(workspace,"qmoosa-nexus-platform"),cmd:["npm","run","qmoosa:finish"]},
  {name:"qmoosa-deep-tech-ai-quantum-platform",dir:resolve(workspace,"qmoosa-deep-tech-ai-quantum-platform"),cmd:["npm","run","qmoosa:finish"]},
  {name:"pq-rdl-blockchain",dir:resolve(workspace,"pq-rdl-blockchain"),cmd:["npm","run","finish:all"]},
  {name:"QSui",dir:resolve(workspace,"QSui"),cmd:["npm","test"]},
  {name:"qton",dir:resolve(workspace,"qton"),cmd:["npm","run","reality:all"]},
  {name:"bnb-qusd",dir:resolve(workspace,"bnb-qusd"),cmd:["npm","run","reality:all"]},
  {name:"quantumshield",dir:resolve(workspace,"quantumshield"),cmd:["npm","test"]},
  {name:"omniver-quantum-decoder",dir:resolve(workspace,"omniver-quantum-decoder"),cmd:["npm","run","reality:universal"]},
  {name:"quantum-ai",dir:resolve(workspace,"quantum-ai"),cmd:["npm","test"]},
  {name:"tiddi-token",dir:resolve(workspace,"tiddi-token"),cmd:["npm","test"]},
  {name:"quantum-portfolio-optimizer",dir:resolve(workspace,"quantum-portfolio-optimizer"),cmd:["npm","run","qmoosa:finish"]},
  {name:"my_yellow_project",dir:resolve(workspace,"my_yellow_project"),cmd:["npm","run","qmoosa:finish"]},
  {name:"solana-pqc",dir:resolve(workspace,"solana-pqc"),cmd:["npm","test"]},
  {name:"martins-algorithm",dir:resolve(workspace,"martins-algorithm"),cmd:["npm","test"]},
  {name:"Algo_Qain",dir:resolve(workspace,"Algo_Qain"),cmd:["npm","test"]},
  {name:"wayai-nft-launch",dir:resolve(workspace,"wayai-nft-launch"),cmd:["npm","test"]},
  {name:"shor-x402",dir:resolve(workspace,"shor-x402"),cmd:["npm","run","qmoosa:finish"]},
  {name:"Republic-of-Divine-Light",dir:resolve(workspace,"Republic-of-Divine-Light"),cmd:["npm","run","qmoosa:finish"]},
  {name:"omnicall-quantum-sentinel",dir:resolve(workspace,"omnicall-quantum-sentinel"),cmd:["npm","run","reality:all"]},
  {name:"alcat-mesh",dir:resolve(workspace,"alcat-mesh"),cmd:["npm","test"]},
  {name:"QDS",dir:resolve(workspace,"QDS"),cmd:["npm","run","qmoosa:finish"]},
  {name:"qain-project",dir:resolve(workspace,"qain-project"),cmd:["npm","run","qmoosa:finish"]},
  {name:"del-ai",dir:resolve(workspace,"del-ai"),cmd:["npm","run","qmoosa:finish"]}
];
const results=[];
function run(x){
 if(!existsSync(x.dir)){results.push({...x,status:"BLOCKED",evidence:"repository not present in local workspace"});return;}
 try{
  const [file,...args]=x.cmd;
  execFileSync(file,args,{cwd:x.dir,stdio:"inherit",timeout:600000,env:{...process.env,CI:process.env.CI??"1"}});
  results.push({...x,status:"VERIFIED_LOCAL",evidence:x.cmd.join(" ")});
 }catch(e){results.push({...x,status:"FAILED",evidence:`exit=${e.status??"unknown"} ${x.cmd.join(" ")}`});}
}
console.log("QMOOSA ONE-CLICK PORTFOLIO FINISHER — FAIL-CLOSED REALITY MODE");
for(const x of projects) run(x);
const failed=results.filter(x=>x.status==="FAILED");
const blocked=results.filter(x=>x.status==="BLOCKED");
const status=failed.length?"FAILED":blocked.length?"PARTIAL":"VERIFIED_LOCAL";
const out={system:"QMOOSA_ONE_CLICK_PORTFOLIO_FINISHER",status,startedAt,projects:results,policy:{externalEvidenceRequired:true,mainnetNeverAutoAuthorized:true,secretsNeverRequested:true,missingEvidenceIsNotVerified:true}};
const outDir=resolve(mother,".qmoosa"); mkdirSync(outDir,{recursive:true});
const outPath=resolve(outDir,"portfolio-finisher-report.json"); writeFileSync(outPath,JSON.stringify(out,null,2)+"\n");
console.log("\nPORTFOLIO STATUS:",status); console.log("REPORT:",outPath);
if(failed.length||blocked.length){console.log("ALL PROJECTS DONE is intentionally withheld until every required gate has evidence.");}
process.exitCode=failed.length?1:blocked.length?2:0;
