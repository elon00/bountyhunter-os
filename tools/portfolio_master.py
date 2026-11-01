#!/usr/bin/env python3
"""Read-only portfolio planning. Python 3.10+, standard library; never signs or deploys."""
import argparse
from collections import Counter, defaultdict
import csv
import io
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SCORECARD = [
    ("Architecture and reproducible build", 8), ("Functional product completeness", 10),
    ("Blockchain integration and deployment", 12), ("Security and cryptographic controls", 14),
    ("Automated tests and reliability", 12), ("Payments, wallets and tokenomics", 8),
    ("AI automation and interoperability", 6), ("Operations and incident response", 10),
    ("Market traction and product viability", 12), ("Legal, governance and launch preparedness", 8),
]
NAME = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def stamp():
    return datetime.now(timezone.utc).isoformat()


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def save(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def csv_rows(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def inventory_rows(path):
    text = Path(path).read_text(encoding="utf-8-sig")
    return json.loads(text) if text.lstrip().startswith("[") else [json.loads(x) for x in text.splitlines() if x.strip()]


def boolean(value):
    if type(value) is bool:
        return value
    if isinstance(value, str) and value.lower() in ("true", "false"):
        return value.lower() == "true"
    raise ValueError("Boolean flags must be true or false; missing/unknown values are not safe defaults")


def repository_id(value):
    if type(value) is bool or not re.fullmatch(r"[0-9]+", str(value)) or int(value) <= 0:
        raise ValueError("Repository ID must be a positive integer")
    return str(int(value))


def theme(repo):
    slug = repo.split("/")[-1].lower()
    return "country" if slug.endswith("-sovereign-ai") else "un-themed" if slug.startswith("un-") or slug == "united-nations-ai" else "other"


def component_observed(row):
    # Evidence labels are observations from the supplied register, never fresh RPC verification.
    return str(row.get("verification", "")).startswith("Observed ") and bool(row.get("evidence_url"))


def component_class(rows):
    observed = [x for x in rows if component_observed(x)]
    networks = " ".join(x.get("network", "").lower() for x in observed)
    if "mainnet" in networks:
        return "MAINNET_COMPONENT_OBSERVED"
    if "testnet" in networks or "sepolia" in networks:
        return "TESTNET_COMPONENT_OBSERVED"
    if "devnet" in networks:
        return "DEVNET_COMPONENT_OBSERVED"
    return "DEPLOYMENT_NOT_ESTABLISHED"


def build_registry(audit, prior, deployments, live=None):
    by_name = {x["repository"].lower(): x for x in audit}
    by_id = {repository_id(x["id"]): x for x in audit}
    details = {repository_id(x["repositoryId"]): x for x in prior}
    if len(details) != len(prior):
        raise ValueError("Duplicate prior-registry repository identity")
    evidence = defaultdict(list)
    for row in deployments:
        evidence[repository_id(row["repositoryId"])].append(row)
    if len(by_name) != len(audit) or len(by_id) != len(audit):
        raise ValueError("Duplicate audit repository identity")
    if live is None:
        live = [dict(full_name=x["repository"], id=int(x["id"]), fork=False,
                     archived=boolean(x.get("archived", False)), pushed_at=x.get("pushed_at"),
                     language=x.get("language")) for x in audit]
    seen_names, seen_ids, result = set(), set(), []
    for current in live:
        name = current["full_name"]
        identity = repository_id(current["id"])
        if not NAME.fullmatch(name) or name.split("/")[0].lower() != "elon00":
            raise ValueError("Unexpected repository owner or name")
        if identity in seen_ids or name.lower() in seen_names:
            raise ValueError("Duplicate current repository identity")
        seen_ids.add(identity); seen_names.add(name.lower())
        if boolean(current.get("fork")):
            continue
        old = by_id.get(identity, {})
        old_name = old.get("repository", name).lower()
        metadata = details.get(identity, {})
        records = evidence.get(identity, [])
        coverage = old.get("tree_coverage", "NOT_INSPECTED")
        push_changed = bool(old and old.get("pushed_at") and current.get("pushed_at") and current["pushed_at"] != old["pushed_at"])
        kind = old.get("repository_type", "SOURCE_REVIEW_REQUIRED")
        status = component_class(records)
        if status == "DEPLOYMENT_NOT_ESTABLISHED":
            status = "EMPTY_AT_AUDIT" if kind == "Empty repository" else "SOURCE_PRESENT_UNVERIFIED" if "source" in kind.lower() else "PURPOSE_REVIEW_REQUIRED"
        result.append(dict(repository=name, repositoryId=int(identity), githubUrl="https://github.com/"+name,
            previousName=old.get("repository") if old_name != name.lower() else None,
            theme=theme(name), language=current.get("language"), archived=boolean(current.get("archived", False)),
            sourceTypeAtAudit=kind, sourceCoverageAtAudit=coverage,
            sourceChangedSinceAudit=None, pushActivitySinceAudit=push_changed, sourceCommit=metadata.get("sourceCommit"),
            sourceCommitStatus="CURRENT_HEAD_NOT_INDEPENDENTLY_RESOLVED",
            codeFileCountHeuristic=metadata.get("codeFileCountHeuristic", 0),
            workflowCountAtAudit=metadata.get("workflowCount", 0),
            deploymentClass=status, componentObservations=records,
            productDeployment="NOT_VERIFIED", productionReady=False, marketReady="NOT_ASSESSED",
            readinessScore=None, readinessEvidencePoints=0, scoreMaximum=100,
            auditCheckedAt=old.get("tree_checked_at_utc"),
            nextGate="Resolve current commit, reproduce build and negative tests, then verify product-level testnet behavior"))
    # Do not silently drop orphan deployment evidence from the reconciliation.
    return result, dict(orphanEvidenceRepositories=sorted({r["repository"] for identity,records in evidence.items() if identity not in by_id for r in records}),
        orphanPriorRepositoryIds=sorted(set(details)-set(by_id)),
        newUnscreenedRepositories=sum(str(x["repositoryId"]) not in by_id for x in result),
        renamedRepositories=[dict(before=x["previousName"], after=x["repository"]) for x in result if x["previousName"]],
        pushActivitySinceAudit=sum(x["pushActivitySinceAudit"] for x in result),
        sourceFreshnessUnverified=len(result),
        missingFromCurrentInventory=sorted(x["repository"] for x in audit if repository_id(x["id"]) not in seen_ids))


def priority(row):
    # Investigation order only. Nothing here earns readiness points or measures commercial potential.
    pilot = row["repository"].lower() in {"elon00/india-sovereign-ai", "elon00/un-who-health-ai"}
    return (int(pilot), min(int(row.get("codeFileCountHeuristic") or 0), 40),
            int(bool(row.get("componentObservations"))),
            hashlib.sha256(row["repository"].lower().encode()).hexdigest())


def shortlist(rows, limit=100, focus="country-un"):
    eligible = [x for x in rows if not x["archived"] and x["sourceTypeAtAudit"] != "Empty repository"]
    if focus == "country-un":
        # Give each existing UN-themed product a review slot, then fill with country prototypes.
        un = sorted((x for x in eligible if x["theme"] == "un-themed"), key=priority, reverse=True)
        country = sorted((x for x in eligible if x["theme"] == "country"), key=priority, reverse=True)
        chosen = un[:min(28, limit)] + country[:max(0, limit-min(len(un), 28, limit))]
    else:
        chosen, counts = [], Counter()
        for row in sorted(eligible, key=priority, reverse=True):
            family = row["theme"] if row["theme"] != "other" else re.sub(r"-(?:kit|gate|lens|run|protocol|engine|sdk|dashboard|tests)$", "", row["repository"].lower())
            if counts[family] >= 2:
                continue
            chosen.append(row); counts[family] += 1
            if len(chosen) == limit:
                break
    return [dict(rank=i+1, repository=x["repository"], githubUrl=x["githubUrl"], theme=x["theme"],
        classification=x["deploymentClass"], readinessScore=None,
        selectionStatus="REVIEW_CANDIDATE_NOT_VERIFIED_PRODUCT", nextGate=x["nextGate"],
        reason="Requested thematic priority; deeper source coverage first; India/WHO are confirmed defect repair pilots. Ties use a deterministic hash, not a market ranking.") for i,x in enumerate(chosen[:limit])]


def plan(args):
    # Parse and hash exactly the same captured bytes, with no second file read.
    captured = {k: Path(getattr(args,k)).read_bytes() for k in ("audit", "registry", "deployments", "inventory", "chains", "capabilities") if getattr(args,k,None)}
    text = {k: value.decode("utf-8-sig") for k,value in captured.items()}
    audit = list(csv.DictReader(io.StringIO(text["audit"])))
    prior = json.loads(text["registry"])["repositories"]
    deployment = list(csv.DictReader(io.StringIO(text["deployments"])))
    inventory_text = text.get("inventory")
    live = (json.loads(inventory_text) if inventory_text.lstrip().startswith("[") else [json.loads(x) for x in inventory_text.splitlines() if x.strip()]) if inventory_text is not None else None
    capability_policy = json.loads(text["capabilities"]) if "capabilities" in text else None
    if capability_policy is not None:
        capability_ids = [x["id"] for x in capability_policy["capabilities"]]
        if not capability_ids or len(capability_ids) != len(set(capability_ids)):
            raise ValueError("Capability IDs must be nonempty and unique")
    chain_policy = json.loads(text["chains"]) if "chains" in text else None
    if chain_policy is not None:
        chain_names = [x["name"].casefold() for x in chain_policy["chains"]]
        if len(chain_names) != 100 or len(set(chain_names)) != 100:
            raise ValueError("The reviewed blockchain universe must contain 100 unique entries")
    rows, quality = build_registry(audit, prior, deployment, live)
    selected = shortlist(rows, args.limit, args.focus)
    out = Path(args.out)
    inputs = {k: dict(path=str(Path(getattr(args,k)).resolve()), sha256=hashlib.sha256(value).hexdigest()) for k,value in captured.items()}
    summary = dict(generatedAt=stamp(), sourceInventoryMode="LIVE_METADATA_PLUS_HISTORICAL_SOURCE_AUDIT" if live is not None else "AUDIT_SNAPSHOT_ONLY",
        totalPublicRepositories=len(live) if live is not None else None, publicNonForks=len(rows),
        forksExcluded=sum(boolean(x.get("fork")) for x in live) if live is not None else None,
        deploymentClasses=dict(Counter(x["deploymentClass"] for x in rows)),
        themes=dict(Counter(x["theme"] for x in rows)), shortlisted=len(selected), focus=args.focus,
        shortlistThemes=dict(Counter(x["theme"] for x in selected)),
        chainReviewTargetCount=len(chain_policy["chains"]) if chain_policy else None,
        chainCompatibilityStatus="NOT_VERIFIED_PER_PRODUCT",
        requestedCapabilityCount=len(capability_policy["capabilities"]) if capability_policy else None,
        verifiedCompleteProducts=None, verifiedProductionReadyProjects=None,
        limitations=["A component observation does not establish a deployed application or present-day liveness.",
            "Source audits and deployment observations retain their original timestamps; live metadata does not refresh them.",
            "No customer, revenue, legal, security certification or production operations evidence was supplied.",
            "Country and agency themes do not establish official affiliation.",
            "The 100 candidates are an engineering review queue, not the 100 strongest commercially validated products."],
        quality=quality, inputs=inputs)
    save(out/"portfolio-registry.json", dict(summary=summary, repositories=rows))
    save(out/"summary.json", summary)
    if capability_policy is not None:
        save(out/"capability-register.json", dict(policy=capability_policy,
            status="INTEGRATION_ASSESSMENT_REQUIRED_NOT_INSTALLED_BY_REGISTRATION",
            bindings=[dict(repositoryId=x["repositoryId"], repository=x["repository"],
                capabilitySet=capability_policy["capabilitySet"], assessment="NOT_ASSESSED",
                nextAction="Inspect existing modules and reuse/extend before adding code") for x in rows]))
    save(out/"review-shortlist-100.json", selected)
    save(out/"production-scorecard.json", dict(maximum=100, earned=None, evidencePoints=0,
        categories=[dict(name=n, maximum=w, earned=None, status="NOT_ASSESSED") for n,w in SCORECARD],
        launchReviewThreshold=85, target=100, releaseAllowed=False,
        hardGates=["Reproducible artifact and source match", "No unresolved critical security defects", "Real product testnet end-to-end proof", "Operational recovery and owner", "Customer acceptance and sustainable economics", "Applicable legal and governance review", "Explicit artifact/network/budget approval for mainnet"],
        applicability="Optional features need justified applicability; they are never inserted merely to earn points."))
    out.mkdir(parents=True, exist_ok=True)
    with (out/"review-shortlist-100.csv").open("w", encoding="utf-8", newline="") as stream:
        writer=csv.DictWriter(stream, fieldnames=list(selected[0]) if selected else ["repository"])
        writer.writeheader(); writer.writerows(selected)
    text = ["# QMOOSA 3,000 → 100 execution baseline", "", "Status: portfolio review and engineering in progress; production readiness is not established.", "",
        f"Public non-fork repositories reconciled: {len(rows)}. First review candidates: {len(selected)}.",
        f"Focus: {args.focus}. Candidate mix: {summary['shortlistThemes']}.", "",
        "## What is known", "", *[f"- {k}: {v}" for k,v in summary["deploymentClasses"].items()], "",
        "These are historical component observations and source screening states, not counts of finished products.", "",
        "## Execution waves", "", "1. India and WHO: reproduce negative tests; fix fake payment/PQC/RPC success before integrating genuine backends.",
        "2. Fingerprint the 223 country/UN repositories (222 with source at audit); propagate a fix only to confirmed matching code through per-repository PRs and CI.",
        "3. Review the 100 candidates in five batches of 20; define one usable product workflow and acceptance test per project.",
        "4. Add chain-specific adapters, wallet/QR, token economics and optional QuickNode/x402/PQC/AI modules only where applicable.",
        "5. Verify a real testnet product workflow, source/artifact identity, monitoring, recovery and customer pilot.",
        "6. Prepare the exact mainnet release manifest and operating budget for approval; verify the authorized release afterward.", "",
        "## Score interpretation", "", "The business-inclusive scorecard totals 100. Unknown evidence is unassessed, not a measured zero-quality product. 85 permits launch review only; mandatory gates still block release. The existing mission checker has a separate provisional technical checklist and must not be added to this score.", "",
        "## Limitations", "", *["- "+x for x in summary["limitations"]], "", "## Candidate links", "",
        *[f"{x['rank']}. [{x['repository']}]({x['githubUrl']}) — {x['classification']}" for x in selected]]
    (out/"EXECUTION_BASELINE.md").write_text("\n".join(text)+"\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest="command", required=True)
    p=sub.add_parser("plan")
    for field in ("audit", "registry", "deployments"):
        p.add_argument("--"+field, required=True)
    p.add_argument("--capabilities", default=str(ROOT/"config/required-capabilities.json"))
    p.add_argument("--chains", default=str(ROOT/"config/top100-chains.json"))
    p.add_argument("--inventory"); p.add_argument("--out", required=True)
    p.add_argument("--limit", type=int, choices=range(1,101), default=100)
    p.add_argument("--focus", choices=["country-un", "balanced"], default="country-un")
    c=sub.add_parser("check")
    c.add_argument("project"); c.add_argument("--workspace", required=True)
    c.add_argument("--profiles", default=str(ROOT/"config/mission.registry.json"))
    c.add_argument("--output", required=True)
    args=parser.parse_args(argv)
    if args.command=="plan":
        plan(args); return 0
    profiles=load(args.profiles)["projects"]
    if not any(x["name"]==args.project for x in profiles):
        parser.error("No reviewed check profile; refusing to execute imported repository commands")
    return subprocess.run(["node", str(ROOT/"scripts/mission-control.mjs"), "check", args.project,
        "--workspace", args.workspace, "--registry", args.profiles, "--output", args.output], check=False).returncode


if __name__=="__main__":
    try:
        sys.exit(main())
    except (ValueError, KeyError, OSError) as error:
        print("Portfolio input/operation error: "+str(error), file=sys.stderr)
        sys.exit(2)
