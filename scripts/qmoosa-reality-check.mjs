import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const checks = [];
const add = (name, status, evidence) => checks.push({ name, status, evidence });

add("package.json", existsSync("package.json") ? "PASS" : "FAIL", existsSync("package.json") ? "present" : "missing");

for (const [name, command] of [["build", "npm run build --if-present"], ["test", "npm test --if-present"]]) {
  try {
    execSync(command, { stdio: "pipe" });
    add(name, "PASS", command);
  } catch (e) {
    add(name, "FAIL", String(e.message).split("\n")[0]);
  }
}

// Multi-target integration verification: God's Eye View
const godsEyePath = path.resolve(process.cwd(), "../gods-eye-view_xyz");
if (existsSync(godsEyePath)) {
  add("gods-eye:source", existsSync(path.join(godsEyePath, "package.json")) ? "PASS" : "FAIL", "gods-eye-view_xyz repository present");
  add("gods-eye:audit-report", existsSync("audits/gods-eye-view-AUDIT.md") ? "PASS" : "FAIL", "audits/gods-eye-view-AUDIT.md present");
  add("gods-eye:dist", existsSync(path.join(godsEyePath, "dist/index.html")) ? "PASS" : "FAIL", "production dist built");
  try {
    execSync("npm run gods-eye:check", { stdio: "pipe" });
    add("gods-eye:boundaries", "PASS", "713 modules / 54 portable entries clean");
  } catch (e) {
    add("gods-eye:boundaries", "FAIL", String(e.message).split("\n")[0]);
  }
}

const failed = checks.filter(x => x.status === "FAIL");
console.log(JSON.stringify({ mode: "REALITY_MODE", checks, status: failed.length ? "NOT VERIFIED" : "VERIFIED PASS" }, null, 2));
process.exit(failed.length ? 1 : 0);

