import { evaluateProject } from "./reality.js";
const projects=[{name:"Repository Integrity",checks:[true,true,true]},{name:"Reality Gate",checks:[true,true,true]},{name:"Application Evidence",checks:[false]}];
document.querySelector("#app").innerHTML=`<main><h1>🏹 BountyHunter OS</h1><p>QMoosa Reality Mode — evidence before claims.</p><section>${projects.map(p=>{const r=evaluateProject(p.checks);return `<article><h2>${p.name}</h2><strong>${r}</strong></article>`}).join("")}</section><p>Pipeline: DISCOVER → AUDIT → FIX → TEST → VERIFY → REPORT</p></main>`;
