import random
import unittest

from tests import _bootstrap  # noqa: F401
from config import Config
from pipeline import content_pillars as cp
from pipeline import optimizer as opt
from pipeline.threads_viral_engine import ThreadsViralEngine, build_weganda_cta, make_choice
from pipeline.utm import build_tracking_url, slugify


class Pillars(unittest.TestCase):
    def test_catalog_is_consistent(self):
        ids = [f.id for f in cp.FORMATS]
        self.assertEqual(len(ids), len(set(ids)), "format id 중복")
        for slot in ("morning", "afternoon", "evening"):
            self.assertGreaterEqual(len(cp.formats_for_slot(slot, True)), 6, slot)
        self.assertEqual({f.pillar for f in cp.FORMATS}, set(cp.PILLAR_TARGET_SHARE))
        self.assertEqual(sum(cp.PILLAR_TARGET_SHARE.values()), 100)
        self.assertTrue(all(f.closing in cp.CLOSING_STYLES for f in cp.FORMATS))
        self.assertTrue({"contrarian", "symptom_checklist"} <= {h.id for h in cp.HOOKS})

    def test_job_formats_need_jobs(self):
        rng = random.Random(1)
        picked = {cp.pick_format("morning", False, rng=rng).id for _ in range(200)}
        self.assertFalse(picked & {"m_job_compare", "m_deadline_alert"})

    def test_recent_formats_are_avoided_when_alternatives_exist(self):
        rng = random.Random(2)
        recent = ["m_job_checklist", "m_public_hospital", "m_resume_mistakes"]
        for _ in range(50):
            self.assertEqual(cp.pick_format("morning", False, recent_format_ids=recent, rng=rng).id, "m_first_month")
        every = [f.id for f in cp.formats_for_slot("morning", False)]
        self.assertIsNotNone(cp.pick_format("morning", False, recent_format_ids=every, rng=rng))

    def test_pillar_balance_weights(self):
        w = cp.pillar_weights(["career"] * 20)
        self.assertLess(w["career"], 1)
        self.assertGreater(w["app_tip"], w["career"])
        self.assertEqual(cp.pillar_weights([]), {p: 1.0 for p in cp.PILLAR_TARGET_SHARE})

    def test_hook_restriction(self):
        self.assertEqual(cp.pick_hook(allowed_ids=["contrarian"], rng=random.Random(3)).id, "contrarian")


class Utm(unittest.TestCase):
    def test_slugify(self):
        self.assertEqual(slugify("Hello World_한글!"), "hello-world")

    def test_plain_url_keeps_existing_query(self):
        u = build_tracking_url("https://www.weganda.kr/?a=1", source="Threads", medium="social",
                               campaign="App CTA", content="evening-cta_a")
        for part in ("utm_source=threads", "utm_campaign=app-cta", "utm_content=evening-cta-a", "a=1"):
            self.assertIn(part, u)

    def test_google_play_uses_install_referrer(self):
        u = build_tracking_url("https://play.google.com/store/apps/details?id=com.weganda.app",
                               source="threads", medium="social", campaign="app-cta", content="x")
        self.assertIn("referrer=utm_source%3Dthreads%26utm_medium%3Dsocial", u)
        self.assertNotIn("utm_source=threads&", u)

    def test_apple_uses_campaign_token_within_limit(self):
        u = build_tracking_url("https://apps.apple.com/kr/app/id123", source="threads", medium="social",
                               campaign="app-cta", content="evening-cta-a")
        self.assertIn("ct=app-cta-evening-cta-a", u)
        long_u = build_tracking_url("https://apps.apple.com/kr/app/id123", source="a", medium="b",
                                    campaign="c" * 50, content="d")
        self.assertLessEqual(len(long_u.split("ct=")[1].split("&")[0]), 40)

    def test_invalid_urls_yield_empty(self):
        for bad in ("", "javascript:alert(1)", "ftp://x.kr"):
            self.assertEqual(build_tracking_url(bad, source="a", medium="b", campaign="c"), "")


class Cta(unittest.TestCase):
    def tearDown(self):
        Config.APP_DOWNLOAD_URL = ""

    def test_variant_and_tracking_link(self):
        Config.APP_DOWNLOAD_URL = "https://play.google.com/store/apps/details?id=com.weganda.app"
        cta = build_weganda_cta("evening", "cta_b")
        self.assertEqual(cta.variant_id, "cta_b")
        self.assertIn("referrer=utm_source%3Dthreads", cta.text)
        self.assertIn(build_weganda_cta("evening", "nope").variant_id, ("cta_a", "cta_b", "cta_c"))

    def test_without_url_points_to_profile(self):
        self.assertIn("프로필 링크", build_weganda_cta("evening", "cta_a").text)

    def test_copy_never_promises_missing_features(self):
        from pipeline.quality_gate import check_posts
        from pipeline.threads_viral_engine import _CTA_VARIANTS

        for variant, body in _CTA_VARIANTS.items():
            result = check_posts(["첫 줄\n둘\n셋\n넷\n다섯\n여섯 질문?", body])
            self.assertNotIn("unsupported_app_claim", [i.code for i in result.issues], variant)


class Optimizer(unittest.TestCase):
    def test_engagement_rate(self):
        self.assertIsNone(opt.engagement_rate({"views": 0}))
        self.assertAlmostEqual(opt.engagement_rate({"views": 100, "likes": 10, "replies": 2, "reposts": 1, "quotes": 0}), 0.16)

    def test_performance_weights(self):
        self.assertEqual(opt.performance_weights([]), {})
        samples = [("a", 0.10)] * 5 + [("b", 0.02)] * 5 + [("c", 0.10)] * 2  # c는 관측 부족
        w = opt.performance_weights(samples)
        self.assertNotIn("c", w)
        self.assertGreater(w["a"], 1)
        self.assertLess(w["b"], 1)
        self.assertTrue(all(opt.WEIGHT_MIN <= v <= opt.WEIGHT_MAX for v in w.values()))
        self.assertEqual(opt.performance_weights([("a", 0.0)] * 5), {})

    def test_spec_validation(self):
        for bad in (
            lambda: opt.ExperimentSpec("x", "slot", ("a", "b"), "h"),
            lambda: opt.ExperimentSpec("x", "hook", ("a", "a"), "h"),
            lambda: opt.ExperimentSpec("x", "hook", ("a", "b"), "h", min_posts_per_arm=2),
        ):
            with self.assertRaises(ValueError):
                bad()

    def test_balanced_assignment(self):
        spec = opt.ExperimentSpec("e", "hook", ("a", "b"), "h", min_posts_per_arm=5)
        self.assertEqual(opt.assign_arm(spec, {"a": 1, "b": 3}), "a")
        self.assertEqual(opt.assign_arm(spec, {"a": 3, "b": 1}), "b")
        self.assertEqual({opt.assign_arm(spec, {}, random.Random(i)) for i in range(20)}, {"a", "b"})

    def test_no_early_verdict_and_deterministic_results(self):
        spec = opt.ExperimentSpec("e", "hook", ("a", "b"), "h", min_posts_per_arm=5)
        early = opt.evaluate(spec, {"a": [0.1] * 4, "b": [0.2] * 5})
        self.assertEqual(early.status, "insufficient")
        self.assertIsNone(early.ci_low)
        jitter = [0.01 * (i % 3) for i in range(10)]
        low = [0.02 + j for j in jitter]
        high = [0.10 + j for j in jitter]
        self.assertEqual(opt.evaluate(spec, {"a": low, "b": high}).status, "winner_b")
        self.assertEqual(opt.evaluate(spec, {"a": high, "b": low}).status, "winner_a")
        same = [0.05 + j for j in jitter]
        verdict = opt.evaluate(spec, {"a": same, "b": list(reversed(same))})
        self.assertEqual(verdict.status, "no_difference")
        self.assertEqual(verdict, opt.evaluate(spec, {"a": same, "b": list(reversed(same))}))

    def test_active_experiment_lookup(self):
        self.assertIsNone(opt.active_experiment("hook", enabled=False))
        self.assertEqual(opt.active_experiment("hook").dimension, "hook")
        self.assertIsNone(opt.active_experiment("format"))


class EngineMetadata(unittest.TestCase):
    def test_fallback_is_excluded_from_experiments_and_format_stats(self):
        res = ThreadsViralEngine().generate_for_slot(
            "evening", [], [], with_cta=True, choice=make_choice("evening", False, rng=random.Random(3))
        )
        self.assertEqual(res.hook_used, "fallback")
        self.assertEqual(res.format_id, "fallback_evening")
        self.assertEqual(res.experiment_id, "")
        self.assertTrue(res.has_cta and res.cta_variant in ("cta_a", "cta_b", "cta_c"))
        self.assertEqual(len(res.posts), 2)

    def test_choice_with_experiment_assigns_arm(self):
        spec = opt.EXPERIMENTS[0]
        choice = make_choice("morning", False, experiment=spec, experiment_counts={spec.arms[0]: 5}, rng=random.Random(1))
        self.assertEqual(choice.arm, spec.arms[1])  # 표본이 적은 팔
        self.assertEqual(choice.hook.id, spec.arms[1])
        self.assertEqual(choice.experiment_id, spec.id)


if __name__ == "__main__":
    unittest.main()
