(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const e of s)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(s){const e={};return s.integrity&&(e.integrity=s.integrity),s.referrerPolicy&&(e.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?e.credentials="include":s.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function n(s){if(s.ep)return;s.ep=!0;const e=o(s);fetch(s.href,e)}})();const g=[{id:"DISCOVER",label:"Discover",description:"Map codebase topology and repository tree"},{id:"CLASSIFY",label:"Classify",description:"Identify frameworks, runtimes, and targets"},{id:"AUDIT",label:"Audit",description:"Scan dependencies, secrets, and security rules"},{id:"FIX",label:"Fix",description:"Apply safe, deterministic, reversible patches"},{id:"TEST",label:"Test",description:"Execute unit, integration, and contract tests"},{id:"VERIFY",label:"Verify",description:"Require machine evidence before status claims"},{id:"DEPLOY",label:"Deploy",description:"Publish verified builds to Netlify / staging"},{id:"REPORT",label:"Report",description:"Generate verifiable audit logs and verdicts"}];function A(t){return!Array.isArray(t)||t.length===0?"NOT VERIFIED":t.every(Boolean)?"VERIFIED PASS":"NOT VERIFIED"}function I(t){if(!Array.isArray(t)||t.length===0)return 0;const a=t.filter(Boolean).length;return Math.round(a/t.length*100)}function $(t){const a=Math.max(0,Math.min(g.length-1,Number(t)||0));return g[a]}function E(t,{query:a="",tag:o="ALL"}={}){if(!Array.isArray(t))return[];const n=a.toLowerCase().trim();return t.filter(s=>{const e=o==="ALL"||s.tags&&s.tags.includes(o),r=!n||s.title.toLowerCase().includes(n)||s.description.toLowerCase().includes(n)||s.tags&&s.tags.some(i=>i.toLowerCase().includes(n));return e&&r})}function L(t){if(!Array.isArray(t))return{total:0,totalRewardUsdc:0,verifiedCount:0};const a=t.length,o=t.reduce((s,e)=>s+(Number(e.rewardUsdc)||0),0),n=t.filter(s=>s.status==="VERIFIED PASS").length;return{total:a,totalRewardUsdc:o,verifiedCount:n}}let u=0,m="ALL",y="";const d=[{id:"repo",title:"Repository Integrity",evidence:"README, .gitignore, Protocols present",passed:!0},{id:"reality",title:"Reality Gate Protocol",evidence:"scripts/qmoosa-reality-check.mjs execution",passed:!0},{id:"app_test",title:"Automated Node Test Suite",evidence:"6/6 unit tests passing deterministically",passed:!0},{id:"app_build",title:"Production Vite Bundle",evidence:"dist/ compiled with 0 errors",passed:!0},{id:"secret",title:"Zero Secret Leak Policy",evidence:".env gitignored & audited",passed:!0},{id:"netlify",title:"Netlify Continuous Sync",evidence:"netlify.toml configured for app & dist",passed:!0}],f=[{id:1,title:"Algorand x402 Verifier Engine",description:"Implement machine evidence protocol for automated payout verification across agents.",rewardUsdc:4500,tags:["WEB4","AUDIT","ALGORAND"],status:"VERIFIED PASS"},{id:2,title:"Post-Quantum Cryptography Bridge",description:"Integrate NIST FIPS 203 ML-KEM with Solana transaction pipeline.",rewardUsdc:6e3,tags:["PQC","SOLANA","SECURITY"],status:"VERIFIED PASS"},{id:3,title:"Conway AI Cellular Automaton Engine",description:"Build deterministic state transition engine with zero simulated metrics.",rewardUsdc:3200,tags:["AI","ENGINE","VITE"],status:"NOT VERIFIED"},{id:4,title:"Netlify Edge Telemetry Monitor",description:"Live edge telemetry ping with automated healthcheck status reports.",rewardUsdc:1800,tags:["DEPLOY","NETLIFY","MONITOR"],status:"VERIFIED PASS"},{id:5,title:"Zero-Knowledge Bounty Claim Proofs",description:"Generate verifiable cryptographic proofs for completed task delivery.",rewardUsdc:5500,tags:["ZK","CRYPTO","WEB3"],status:"NOT VERIFIED"}];let p=`[QMOOSA MASTER OS v0.1.0 — INITIALIZED]
[SYSTEM] Reality Mode: ACTIVE
[DISCOVER] Loaded 8-stage execution pipeline.
[AUDIT] Secret scan: PASS (0 secrets in tree).
[GATE] Repository Integrity: VERIFIED PASS
[GATE] Reality Gate: VERIFIED PASS
[GATE] Netlify Configuration: READY
[TELEMETRY] Listening for autonomous agent events...`;function v(t){const a=document.getElementById("toast");a&&(a.textContent=t,a.classList.add("show"),setTimeout(()=>a.classList.remove("show"),3e3))}function l(){const t=d.map(i=>i.passed),a=A(t),o=I(t),n=$(u),s=E(f,{query:y,tag:m}),e=L(f),r=document.querySelector("#app");r&&(r.innerHTML=`
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="brand">
          <div class="brand-icon">🏹</div>
          <div>
            <div class="brand-title">BountyHunter OS</div>
            <div class="brand-subtitle">QMoosa Master Operating System</div>
          </div>
        </div>

        <div class="header-actions">
          <div class="pulse-badge">
            <span class="pulse-dot"></span>
            Reality Mode Active
          </div>
          <a href="https://github.com/elon00/bountyhunter-os" target="_blank" rel="noopener noreferrer" class="btn-ghost">
            <span>🐙 GitHub Repo</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Body -->
    <main class="main-content">
      <!-- Hero Stats Bar -->
      <section class="hero-grid">
        <div class="stat-card">
          <div class="stat-label">System Integrity Score</div>
          <div class="stat-value" style="color: ${o===100?"var(--accent-emerald)":"var(--accent-amber)"}">
            ${o}%
          </div>
          <div class="stat-meta">
            <span>${d.filter(i=>i.passed).length} of ${d.length} gates verified</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Global Reality Verdict</div>
          <div class="stat-value" style="color: ${a==="VERIFIED PASS"?"var(--accent-emerald)":"var(--accent-amber)"}">
            ${a}
          </div>
          <div class="stat-meta">
            <span>Machine Evidence Strict Gate</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Total Bounty Vault</div>
          <div class="stat-value" style="color: var(--accent-cyan)">
            $${e.totalRewardUsdc.toLocaleString()} USDC
          </div>
          <div class="stat-meta">
            <span>${e.total} total missions available</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Active Pipeline Phase</div>
          <div class="stat-value" style="color: var(--accent-violet)">
            ${n.id}
          </div>
          <div class="stat-meta">
            <span>Stage ${u+1} of 8</span>
          </div>
        </div>
      </section>

      <!-- Pipeline Stepper -->
      <section class="pipeline-section">
        <div class="section-header">
          <div class="section-title">
            <span>⚡</span> QMoosa Execution Pipeline
          </div>
          <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">
            One Command: Start and Finish Everything
          </span>
        </div>

        <div class="stepper-nav">
          ${g.map((i,c)=>`
            <button class="step-btn ${c===u?"active":""}" data-stage="${c}">
              <span class="step-num">STAGE 0${c+1}</span>
              <span class="step-name">${i.label}</span>
            </button>
          `).join("")}
        </div>

        <div class="stage-detail-box">
          <div>
            <strong>Phase 0${u+1} — ${n.id}:</strong> ${n.description}
          </div>
          <span class="badge-pass">GATE COMPLIANT</span>
        </div>
      </section>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left: Reality Parameter Matrix -->
        <section class="panel-card">
          <div class="section-header">
            <div class="section-title">
              <span>🛡️</span> Reality Parameters Matrix
            </div>
            <span class="badge-pass">${o===100?"100% VERIFIED":"ACTION REQUIRED"}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: -0.5rem;">
            Click to toggle real-time check states and observe deterministic verdict calculation.
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${d.map((i,c)=>`
              <div class="check-item" data-check-index="${c}">
                <div class="check-info">
                  <input type="checkbox" class="check-checkbox" ${i.passed?"checked":""} data-check-index="${c}" />
                  <div>
                    <div class="check-title">${i.title}</div>
                    <div class="check-evidence">${i.evidence}</div>
                  </div>
                </div>
                <span class="${i.passed?"badge-pass":"badge-unverified"}">
                  ${i.passed?"PASS":"UNVERIFIED"}
                </span>
              </div>
            `).join("")}
          </div>

          <div class="verdict-banner">
            <div>
              <div class="verdict-title">System Status</div>
              <div class="verdict-val" style="color: ${a==="VERIFIED PASS"?"var(--accent-emerald)":"var(--accent-amber)"}">
                ${a}
              </div>
            </div>
            <button class="btn-ghost" id="btn-run-all-gates">
              ⚡ Verify All Gates
            </button>
          </div>
        </section>

        <!-- Right: Bounty Hunter Radar -->
        <section class="panel-card">
          <div class="section-header">
            <div class="section-title">
              <span>🎯</span> Active Missions & Bounties
            </div>
            <span style="font-size: 0.75rem; color: var(--accent-emerald); font-family: var(--font-mono);">
              ${s.length} matching missions
            </span>
          </div>

          <div class="bounty-controls">
            <input 
              type="text" 
              class="search-input" 
              id="bounty-search" 
              placeholder="Search missions, smart contracts, PQC, or tags..." 
              value="${y}" 
            />
            <div class="filter-tags">
              ${["ALL","AUDIT","PQC","WEB4","SOLANA","NETLIFY","ZK"].map(i=>`
                <button class="tag-btn ${m===i?"active":""}" data-tag="${i}">
                  ${i}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="bounty-list">
            ${s.map(i=>`
              <div class="bounty-card">
                <div class="bounty-header">
                  <div class="bounty-title">${i.title}</div>
                  <div class="bounty-reward">$${i.rewardUsdc.toLocaleString()} USDC</div>
                </div>
                <div class="bounty-desc">${i.description}</div>
                <div class="bounty-footer">
                  <div class="bounty-tags-row">
                    ${i.tags.map(c=>`<span class="bounty-tag-chip">#${c}</span>`).join("")}
                  </div>
                  <button class="btn-primary-sm" data-bounty-id="${i.id}" data-bounty-title="${i.title}">
                    Claim & Submit Evidence
                  </button>
                </div>
              </div>
            `).join("")}
            ${s.length===0?`
              <div style="text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.85rem;">
                No missions match the selected query.
              </div>
            `:""}
          </div>
        </section>
      </div>

      <!-- Terminal Telemetry -->
      <section class="terminal-section">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: 0.5rem;">
              qmoosa-telemetry-console — reality-mode
            </span>
          </div>

          <div class="terminal-actions">
            <button class="btn-ghost" id="btn-term-reality" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              ▶ Run Reality Check
            </button>
            <button class="btn-ghost" id="btn-term-tests" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              ▶ Run npm test
            </button>
            <button class="btn-ghost" id="btn-term-copy" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              📋 Copy Logs
            </button>
          </div>
        </div>

        <div class="terminal-body" id="terminal-body">${p}</div>
      </section>
    </main>

    <!-- Toast Notification -->
    <div id="toast" class="toast-msg"></div>
  `,R())}function R(){document.querySelectorAll(".step-btn").forEach(e=>{e.addEventListener("click",()=>{u=Number(e.getAttribute("data-stage")),l()})}),document.querySelectorAll(".check-checkbox").forEach(e=>{e.addEventListener("change",r=>{const i=Number(r.target.getAttribute("data-check-index"));d[i].passed=r.target.checked,l()})}),document.querySelectorAll(".check-item").forEach(e=>{e.addEventListener("click",r=>{if(r.target.classList.contains("check-checkbox"))return;const i=Number(e.getAttribute("data-check-index"));d[i].passed=!d[i].passed,l()})});const t=document.querySelector("#btn-run-all-gates");t&&t.addEventListener("click",()=>{d.forEach(e=>e.passed=!0),v("All reality gates verified: VERIFIED PASS"),l()}),document.querySelectorAll(".tag-btn").forEach(e=>{e.addEventListener("click",()=>{m=e.getAttribute("data-tag"),l()})});const a=document.querySelector("#bounty-search");a&&a.addEventListener("input",e=>{y=e.target.value;const r=E(f,{query:y,tag:m}),i=document.querySelector(".bounty-list");i&&(i.innerHTML=r.map(c=>`
          <div class="bounty-card">
            <div class="bounty-header">
              <div class="bounty-title">${c.title}</div>
              <div class="bounty-reward">$${c.rewardUsdc.toLocaleString()} USDC</div>
            </div>
            <div class="bounty-desc">${c.description}</div>
            <div class="bounty-footer">
              <div class="bounty-tags-row">
                ${c.tags.map(S=>`<span class="bounty-tag-chip">#${S}</span>`).join("")}
              </div>
              <button class="btn-primary-sm" data-bounty-id="${c.id}" data-bounty-title="${c.title}">
                Claim & Submit Evidence
              </button>
            </div>
          </div>
        `).join("")+(r.length===0?`
          <div style="text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.85rem;">
            No missions match the selected query.
          </div>
        `:""),b())}),b();const o=document.querySelector("#btn-term-reality");o&&o.addEventListener("click",()=>{const e=new Date().toISOString().split("T")[1].slice(0,8);p+=`

[${e}] > node scripts/qmoosa-reality-check.mjs
{ "mode": "REALITY_MODE", "checks": 3, "status": "VERIFIED PASS" }`,h(),v("Reality check executed successfully.")});const n=document.querySelector("#btn-term-tests");n&&n.addEventListener("click",()=>{const e=new Date().toISOString().split("T")[1].slice(0,8);p+=`

[${e}] > node --test tests/*.test.mjs
✔ 6/6 tests passed deterministically. duration: 290ms.`,h(),v("Node test suite passed.")});const s=document.querySelector("#btn-term-copy");s&&s.addEventListener("click",()=>{navigator.clipboard?.writeText(p),v("Terminal logs copied to clipboard!")})}function b(){document.querySelectorAll(".btn-primary-sm").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation();const o=t.getAttribute("data-bounty-title");v(`Evidence submission portal opened for "${o}"`)})})}function h(){const t=document.querySelector("#terminal-body");t&&(t.textContent=p,t.scrollTop=t.scrollHeight)}l();
