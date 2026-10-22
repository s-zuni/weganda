import unittest

import requests

from tests import _bootstrap
from bot.analytics_service import AnalyticsService
from config import Config
from pipeline.insights import FetchResult, fetch_insights, parse_insights_payload
from pipeline.reporting import build_weekly_report, performance_weights_for, score_for
from pipeline.threads_viral_engine import ThreadsViralEngine

DAY = 86400
NOW = 1_800_000_000

PAYLOAD = {"data": [
    {"name": "views", "values": [{"value": 120}]},
    {"name": "likes", "values": [{"value": 7}]},
    {"name": "bad", "values": [{"value": {"x": 1}}]},
    {"name": "flag", "values": [{"value": True}]},
    {"name": "total", "total_value": {"value": 3}},
    "junk", {"values": []},
]}


class FakeRes:
    def __init__(self, status=200, body=None, text=""):
        self.status_code, self._body, self.text = status, body, text
        self.ok = status < 400

    def json(self):
        if self._body is None:
            raise ValueError("no json")
        return self._body


class Insights(unittest.TestCase):
    def test_parser_keeps_numeric_metrics_only(self):
        self.assertEqual(parse_insights_payload(PAYLOAD), {"views": 120.0, "likes": 7.0, "total": 3.0})
        self.assertEqual(parse_insights_payload(None), {})
        self.assertEqual(parse_insights_payload({"data": None}), {})

    def test_fetch_outcomes(self):
        ok = fetch_insights("u", {}, http_get=lambda *a, **k: FakeRes(200, PAYLOAD))
        self.assertTrue(ok.ok)
        self.assertEqual(ok.metrics["views"], 120)

        perm = fetch_insights("u", {}, http_get=lambda *a, **k: FakeRes(
            400, {"error": {"code": 10, "message": "Application does not have permission"}}))
        self.assertFalse(perm.ok)
        self.assertTrue(perm.fatal)

        bad_metric = fetch_insights("u", {}, http_get=lambda *a, **k: FakeRes(
            400, {"error": {"code": 100, "message": "bad metric"}}))
        self.assertFalse(bad_metric.ok)
        self.assertFalse(bad_metric.fatal)

        html = fetch_insights("u", {}, http_get=lambda *a, **k: FakeRes(502, None, "<html>bad gateway</html>"))
        self.assertFalse(html.ok)
        self.assertIn("502", html.error)

        empty = fetch_insights("u", {}, http_get=lambda *a, **k: FakeRes(200, {"data": []}))
        self.assertFalse(empty.ok)

    def test_network_error_never_leaks_token(self):
        def boom(*a, **k):
            raise requests.ConnectionError("fail url=https://x?access_token=SECRETTOKEN123")

        result = fetch_insights("u", {}, http_get=boom)
        self.assertFalse(result.ok)
        self.assertNotIn("SECRETTOKEN123", result.error)


class StorageMetrics(unittest.TestCase):
    def setUp(self):
        self.s = _bootstrap.make_storage()
        s = self.s
        s.record_content_post(channel="threads", external_id="T1", slot="morning", pillar="career",
                              format_id="m_first_month", hook_id="contrarian", experiment_id="e1",
                              arm="contrarian", published_ts=NOW - 5 * DAY, date_str="d")
        s.record_content_post(channel="threads", external_id="T2", slot="evening", pillar="shift_survival",
                              format_id="e_night_sleep", hook_id="symptom_checklist", experiment_id="e1",
                              arm="symptom_checklist", published_ts=NOW - 2 * DAY)
        s.record_content_post(channel="threads", external_id="T3", slot="evening", published_ts=NOW - 3600)
        s.record_content_post(channel="instagram", external_id="I1", slot="daily", published_ts=NOW - 4 * DAY)
        s.record_content_post(channel="threads", external_id="OLD", slot="morning", published_ts=NOW - 30 * DAY)

    def test_records_are_idempotent_and_skip_missing_ids(self):
        self.assertFalse(self.s.record_content_post(channel="threads", external_id="T1", published_ts=NOW))
        self.assertFalse(self.s.record_content_post(channel="threads", external_id=""))

    def test_experiment_counts_are_per_slot(self):
        self.assertEqual(self.s.experiment_counts("e1", "morning"), {"contrarian": 1})
        self.assertEqual(self.s.experiment_counts("e1", "evening"), {"symptom_checklist": 1})

    def test_metric_targets_and_overwrite(self):
        got = {(t["post_key"], t["window"]) for t in self.s.metric_targets(NOW)}
        self.assertEqual(got, {("threads:T1", "d3"), ("threads:T2", "d1"), ("instagram:I1", "d3")})
        self.s.save_metrics("threads:T1", "d3", {"views": 1000, "likes": 50}, NOW)
        self.s.save_metrics("threads:T1", "d3", {"views": 1000, "likes": 60}, NOW)  # 덮어쓰기
        self.assertNotIn(("threads:T1", "d3"), {(t["post_key"], t["window"]) for t in self.s.metric_targets(NOW)})
        rows = self.s.posts_with_metrics("d3", NOW - 28 * DAY)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["metrics"]["likes"], 60)
        self.assertEqual(self.s.posts_with_metrics("d3", NOW - 28 * DAY, channel="instagram"), [])
        self.assertEqual(self.s.count_posts_missing_metrics("d3", NOW), 1)  # I1 (T2는 72시간 미경과)
        self.assertEqual(len(self.s.metric_targets(NOW, limit=1)), 1)

    def test_recent_meta_is_newest_first(self):
        meta = self.s.recent_content_meta("threads", 10)
        self.assertEqual(meta[0]["slot"], "evening")
        self.assertEqual(len(meta), 4)


class Reporting(unittest.TestCase):
    @staticmethod
    def rows(n=40, experiment="hook-contrarian-vs-checklist"):
        return [{
            "channel": "threads", "slot": "morning", "pillar": "career",
            "format_id": "m_first_month" if i % 2 else "m_public_hospital",
            "hook_id": "contrarian" if i % 2 else "symptom_checklist", "has_cta": i % 5 == 0,
            "experiment_id": experiment, "arm": "contrarian" if i % 2 else "symptom_checklist",
            "metrics": {"views": 1000 + i, "likes": 50 + (10 if i % 2 else 0), "replies": 5, "reposts": 1, "quotes": 0},
        } for i in range(n)]

    def test_scores(self):
        self.assertEqual(score_for("threads", {"views": 100, "likes": 10}), 0.1)
        self.assertIsNone(score_for("instagram", {"reach": 0}))
        self.assertIsNone(score_for("unknown", {"views": 1}))
        self.assertAlmostEqual(score_for("community", {"views": 10, "likes": 1, "comments": 1}), 0.3)

    def test_empty_and_corrupt_input(self):
        self.assertIn("집계 대기: 2건", build_weekly_report([], 2))
        corrupt = [{"channel": "threads", "metrics": "oops"}, {"channel": "threads"}]
        self.assertIn("Threads 성과 데이터가 아직 없습니다", build_weekly_report(corrupt, 0))

    def test_full_report(self):
        report = build_weekly_report(self.rows(), 0)
        for expected in ("Threads: 40건", "실험 hook-contrarian-vs-checklist", "필러 비중"):
            self.assertIn(expected, report)
        self.assertLessEqual(len(report), 3800)

    def test_weights_exclude_experiments_and_fallbacks(self):
        format_w, hook_w = performance_weights_for(self.rows())
        self.assertEqual(hook_w, {})  # 전부 실험 대상 → 후킹 표본에서 제외
        self.assertEqual(set(format_w), {"m_first_month", "m_public_hospital"})
        fallback = [dict(r, format_id="fallback_morning", hook_id="fallback", experiment_id="") for r in self.rows(10)]
        self.assertEqual(performance_weights_for(fallback), ({}, {}))


class FakePub:
    def __init__(self, result):
        self.result, self.calls = result, []

    def fetch_insights(self, media_id):
        self.calls.append(media_id)
        if isinstance(self.result, Exception):
            raise self.result
        return self.result


class FakeCommunity:
    def __init__(self):
        self.calls = []

    def fetch_stats(self, post_id):
        self.calls.append(post_id)
        return FetchResult(True, {"views": 5.0})


class Service(unittest.TestCase):
    def setUp(self):
        self.s = _bootstrap.make_storage()
        for ch, ext in (("threads", "A"), ("threads", "B"), ("instagram", "C"), ("community", "D")):
            self.s.record_content_post(channel=ch, external_id=ext, slot="x", published_ts=NOW - 4 * DAY)
        self.sent = []
        self.threads = FakePub(FetchResult(False, error="[10] permission", fatal=True))
        self.service = AnalyticsService(
            self.s, lambda: self.threads, FakePub(FetchResult(True, {"reach": 100.0})), FakeCommunity(),
            notify=self.sent.append, clock=lambda: NOW,
        )
        Config.INSIGHTS_ENABLED = True
        Config.EXPERIMENTS_ENABLED = True

    def test_fatal_error_blocks_channel_and_alerts_once(self):
        self.assertEqual(self.service.collect(), 2)  # instagram + community
        self.assertEqual(self.threads.calls, ["A"])  # 같은 채널의 두 번째 호출은 건너뜀
        self.assertEqual(len(self.sent), 1)
        self.assertIn("권한/토큰", self.sent[0])
        self.service.collect()
        self.assertEqual(len(self.sent), 1)  # 하루 1회만 알림

    def test_exceptions_are_isolated_per_post(self):
        self.threads.result = RuntimeError("network boom")
        self.assertEqual(self.service.collect(), 2)
        self.threads.result = FetchResult(True, {"views": 10.0, "likes": 1.0})
        self.assertEqual(self.service.collect(), 2)
        self.assertEqual(self.service.collect(), 0)  # 모두 수집됨

    def test_disabled_flag(self):
        Config.INSIGHTS_ENABLED = False
        self.assertEqual(self.service.collect(), 0)

    def test_choose_for_slot_uses_experiment_and_survives_db_errors(self):
        choice = self.service.choose_for_slot("morning", has_jobs=False)
        self.assertIsNotNone(choice.format)
        self.assertEqual(choice.experiment_id, "hook-contrarian-vs-checklist")
        self.assertEqual(choice.arm, choice.hook.id)
        Config.EXPERIMENTS_ENABLED = False
        self.assertEqual(self.service.choose_for_slot("morning", False).experiment_id, "")
        Config.EXPERIMENTS_ENABLED = True

        def down(*a, **k):
            raise RuntimeError("db down")

        self.s.recent_content_meta = down
        self.assertIsNotNone(self.service.choose_for_slot("evening", False).format)

    def test_weekly_report_sent_once_per_week_but_manual_every_time(self):
        self.service.send_scheduled_report()
        self.service.send_scheduled_report()
        self.assertEqual(len(self.sent), 1)
        self.service.send_weekly_report()
        self.assertEqual(len(self.sent), 2)


class BotRecording(unittest.TestCase):
    def test_threads_post_is_recorded_with_experiment_arm(self):
        from bot.telegram_bot import TelegramApprovalBot

        storage = _bootstrap.make_storage()
        bot = TelegramApprovalBot.__new__(TelegramApprovalBot)
        bot.storage = storage
        res = ThreadsViralEngine().generate_for_slot("evening", [], [], with_cta=False)
        vr = res.model_copy(update={"experiment_id": "e9", "arm": "contrarian", "hook_used": "contrarian"})
        bot._record_threads_post("2099-01-01", "evening", vr, {"thread_ids": ["ZZ1", "ZZ2"], "permalink": "https://t/p"})
        bot._record_threads_post("2099-01-01", "evening", vr, {"thread_ids": []})  # id 없으면 기록 안 함
        self.assertEqual(storage.experiment_counts("e9", "evening"), {"contrarian": 1})


if __name__ == "__main__":
    unittest.main()
