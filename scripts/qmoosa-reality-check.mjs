import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
const checks=[];
const add=(name,status,evidence)=>checks.push({name,status,evidence});
add("package.json",existsSync("package.json")?"PASS":"FAIL",existsSync("package.json")?"present":"missing");
for (const [name,command] of [["build","npm run build --if-present"],["test","npm test --if-present"]]) { try { execSync(command,{stdio:"pipe"}); add(name,"PASS",command); } catch(e) { add(name,"FAIL",String(e.message).split("\n")[0]); } }
const failed=checks.filter(x=>x.status==="FAIL");
console.log(JSON.stringify({mode:"REALITY_MODE",checks,status:failed.length?"NOT VERIFIED":"VERIFIED PASS"},null,2));
process.exit(failed.length?1:0);
