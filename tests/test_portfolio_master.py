import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("portfolio_master",Path(__file__).resolve().parents[1]/"tools/portfolio_master.py")
p=importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)


class PortfolioMasterTests(unittest.TestCase):
    def test_united_nations_hub_is_included_in_agency_scope(self):
        self.assertEqual(p.theme("elon00/united-nations-ai"),"un-themed")
        self.assertEqual(p.theme("elon00/un-who-health-ai"),"un-themed")
        self.assertEqual(p.theme("elon00/india-sovereign-ai"),"country")

    def baseline(self):
        return [dict(repository="elon00/cbdcbridge",id="12",pushed_at="2026-10-29",repository_type="Blockchain contract source",tree_coverage="Tree inspected")]

    def test_identity_join_preserves_history_after_rename(self):
        live=[dict(full_name="elon00/crypto-token-bridge",id=12,fork=False,pushed_at="2026-10-31")]
        evidence=[dict(repository="elon00/cbdcbridge",network="Testnet",verification="Observed Testnet bytecode",evidence_url="https://example.invalid/proof")]
        rows,quality=p.build_registry(self.baseline(),[],evidence,live)
        self.assertEqual(rows[0]["repository"],"elon00/crypto-token-bridge")
        self.assertEqual(rows[0]["previousName"],"elon00/cbdcbridge")
        self.assertEqual(rows[0]["deploymentClass"],"TESTNET_COMPONENT_OBSERVED")
        self.assertTrue(rows[0]["sourceChangedSinceAudit"])
        self.assertFalse(quality["missingFromCurrentInventory"])

    def test_claims_and_links_alone_are_not_observations(self):
        rows=[dict(network="mainnet",verification="Repository candidate only",evidence_url="https://example.invalid")]
        self.assertEqual(p.component_class(rows),"DEPLOYMENT_NOT_ESTABLISHED")
        rows[0]["verification"]="Observed Mainnet contract"; rows[0]["evidence_url"]=""
        self.assertEqual(p.component_class(rows),"DEPLOYMENT_NOT_ESTABLISHED")

    def test_same_product_with_multiple_components_counts_once(self):
        evidence=[dict(repository="elon00/cbdcbridge",network=n,verification="Observed contract",evidence_url="https://example.invalid") for n in ["TON Testnet","TON Mainnet","TON Mainnet"]]
        rows,_=p.build_registry(self.baseline(),[],evidence)
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]["deploymentClass"],"MAINNET_COMPONENT_OBSERVED")
        self.assertFalse(rows[0]["productionReady"])
        self.assertIsNone(rows[0]["readinessScore"])

    def test_forks_are_excluded_even_if_string_false_is_used(self):
        live=[dict(full_name="elon00/cbdcbridge",id=12,fork="false"),dict(full_name="elon00/fork",id=13,fork=True)]
        rows,_=p.build_registry(self.baseline(),[],[],live)
        self.assertEqual(len(rows),1)

    def test_duplicate_current_ids_and_names_rejected(self):
        for live in ([dict(full_name="elon00/a",id=1),dict(full_name="elon00/b",id=1)],
                     [dict(full_name="elon00/a",id=1),dict(full_name="elon00/A",id=2)]):
            with self.subTest(live=live),self.assertRaisesRegex(ValueError,"Duplicate"):
                p.build_registry(self.baseline(),[],[],live)

    def test_duplicate_audit_ids_rejected(self):
        audit=self.baseline()*2
        with self.assertRaisesRegex(ValueError,"Duplicate"):
            p.build_registry(audit,[],[])

    def test_wrong_owner_is_rejected(self):
        with self.assertRaisesRegex(ValueError,"owner"):
            p.build_registry(self.baseline(),[],[],[dict(full_name="someone/project",id=12)])

    def test_orphan_deployment_evidence_is_reported(self):
        _,quality=p.build_registry(self.baseline(),[],[dict(repository="elon00/missing")])
        self.assertEqual(quality["orphanEvidenceRepositories"],["elon00/missing"])

    def test_new_repository_is_not_mistaken_for_audited_code(self):
        rows,quality=p.build_registry(self.baseline(),[],[],[dict(full_name="elon00/new",id=99)])
        self.assertEqual(rows[0]["sourceCoverageAtAudit"],"NOT_INSPECTED")
        self.assertEqual(quality["newUnscreenedRepositories"],1)
        self.assertIsNone(rows[0]["readinessScore"])

    def test_country_un_selection_has_28_agency_and_72_country_slots(self):
        raw=[]
        for i in range(28): raw.append(dict(full_name=f"elon00/un-{i}-ai",id=i+1))
        for i in range(195): raw.append(dict(full_name=f"elon00/country-{i}-sovereign-ai",id=i+29))
        rows,_=p.build_registry(self.baseline(),[],[],raw)
        selected=p.shortlist(rows)
        self.assertEqual(len(selected),100)
        self.assertEqual(sum(x["theme"]=="un-themed" for x in selected),28)
        self.assertEqual(sum(x["theme"]=="country" for x in selected),72)
        self.assertEqual(len({x["repository"] for x in selected}),100)
        self.assertEqual(selected,p.shortlist(list(reversed(rows))))

    def test_empty_and_archived_projects_do_not_displace_review_candidates(self):
        rows,_=p.build_registry(self.baseline(),[],[],[dict(full_name="elon00/a-sovereign-ai",id=1,archived=True),dict(full_name="elon00/b-sovereign-ai",id=2)])
        rows[1]["sourceTypeAtAudit"]="Empty repository"
        self.assertEqual(p.shortlist(rows),[])

    def test_shortlist_handles_insufficient_candidates_and_small_limit(self):
        rows,_=p.build_registry(self.baseline(),[],[],[dict(full_name="elon00/un-one-ai",id=1)])
        self.assertEqual(len(p.shortlist(rows,limit=1)),1)
        self.assertEqual(p.shortlist([],limit=100),[])

    def test_scorecard_totals_100_without_optional_feature_inflation(self):
        self.assertEqual(sum(w for _,w in p.SCORECARD),100)
        self.assertTrue(any("Market" in n for n,_ in p.SCORECARD))


if __name__=="__main__": unittest.main()
