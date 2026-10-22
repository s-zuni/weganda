import unittest
from datetime import datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from tests import _bootstrap
from config import Config, redact_secrets
import scheduling

KST = ZoneInfo("Asia/Seoul")
DAY = 86400
NOW = 1_800_000_000


class Redaction(unittest.TestCase):
    def test_tokens_are_masked(self):
        Config.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz_-0123456"
        try:
            text = redact_secrets(
                "url: /bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz_-0123456/getUpdates?access_token=EAAB123xyz&x=1"
            )
        finally:
            Config.TELEGRAM_BOT_TOKEN = ""
        self.assertNotIn("ABCdef", text)
        self.assertNotIn("EAAB123", text)
        self.assertIn("/bot***/", text)


class RetryClaims(unittest.TestCase):
    def setUp(self):
        self.s = _bootstrap.make_storage()
        Config.MAX_RETRY_ATTEMPTS = 3

    def test_threads_slot_retry_budget(self):
        s, d = self.s, "2099-01-01"
        self.assertTrue(s.claim_threads_slot(d, "morning"))
        self.assertFalse(s.claim_threads_slot(d, "morning"))  # 실행 중 중복 차단
        s.update_threads_slot(d, "morning", "PUBLISHED")
        self.assertFalse(s.claim_threads_slot(d, "morning"))  # 성공은 재실행 불가

        self.assertTrue(s.claim_threads_slot(d, "evening"))
        for attempt in range(2):
            s.update_threads_slot(d, "evening", "FAILED")
            self.assertEqual(s.retryable_threads_slots(d), ["evening"])
            self.assertTrue(s.claim_threads_slot(d, "evening"), f"재시도 {attempt + 1}")
        s.update_threads_slot(d, "evening", "FAILED")
        self.assertFalse(s.claim_threads_slot(d, "evening"))  # 한도 소진
        self.assertEqual(s.retryable_threads_slots(d), [])

    def test_partial_is_not_retried(self):
        s, d = self.s, "2099-01-02"
        self.assertTrue(s.claim_threads_slot(d, "afternoon"))
        s.update_threads_slot(d, "afternoon", "PARTIAL")
        self.assertNotIn("afternoon", s.retryable_threads_slots(d))
        self.assertFalse(s.claim_threads_slot(d, "afternoon"))

    def test_daily_dispatch_retry(self):
        s, d = self.s, "2099-01-03"
        self.assertTrue(s.claim_daily_dispatch(d))
        s.record_dispatch(d, "FAILED")
        self.assertTrue(s.daily_dispatch_retryable(d))
        self.assertTrue(s.claim_daily_dispatch(d))
        s.record_dispatch(d, "COMPLETED")
        self.assertFalse(s.daily_dispatch_retryable(d))
        self.assertFalse(s.claim_daily_dispatch(d))

    def test_claim_once(self):
        self.assertTrue(self.s.claim_once("k"))
        self.assertFalse(self.s.claim_once("k"))


class Schedule(unittest.TestCase):
    def fake_bot(self):
        calls = []
        bot = SimpleNamespace(
            run_daily_dispatch=lambda: calls.append("daily"),
            run_scheduled_threads_slot=lambda slot: calls.append(f"slot:{slot}"),
            refresh_threads_token=lambda: calls.append("token"),
            check_instagram_health=lambda: calls.append("ig"),
            analytics=SimpleNamespace(
                collect=lambda: calls.append("collect"),
                send_scheduled_report=lambda: calls.append("report"),
            ),
        )
        return bot, calls

    def test_table_contents(self):
        bot, _ = self.fake_bot()
        names = {i.name for i in scheduling.build_schedule(bot)}
        self.assertEqual(
            names,
            {"daily_dispatch", "threads_morning", "threads_afternoon", "threads_evening",
             "collect_insights", "threads_token_refresh", "instagram_health", "weekly_report"},
        )

    def test_is_due_window_and_weekday(self):
        item = scheduling.ScheduledItem("x", 6, 30, lambda: None, grace_min=30)
        self.assertFalse(scheduling.is_due(item, datetime(2026, 10, 22, 6, 29, tzinfo=KST)))
        self.assertTrue(scheduling.is_due(item, datetime(2026, 10, 22, 6, 30, tzinfo=KST)))
        self.assertTrue(scheduling.is_due(item, datetime(2026, 10, 22, 6, 59, tzinfo=KST)))
        self.assertFalse(scheduling.is_due(item, datetime(2026, 10, 22, 7, 0, tzinfo=KST)))
        monday_only = scheduling.ScheduledItem("m", 4, 0, lambda: None, weekday=scheduling.MONDAY, grace_min=90)
        self.assertTrue(scheduling.is_due(monday_only, datetime(2026, 10, 19, 4, 30, tzinfo=KST)))   # 월요일
        self.assertFalse(scheduling.is_due(monday_only, datetime(2026, 10, 20, 4, 30, tzinfo=KST)))  # 화요일

    def test_maintenance_items_run_once_per_day_even_if_two_schedulers_fire(self):
        storage = _bootstrap.make_storage()
        bot, calls = self.fake_bot()
        items = {i.name: i for i in scheduling.build_schedule(bot)}
        now = datetime(2026, 10, 19, 4, 5, tzinfo=KST)
        self.assertTrue(scheduling.execute(items["threads_token_refresh"], storage, now))
        self.assertFalse(scheduling.execute(items["threads_token_refresh"], storage, now))
        self.assertEqual(calls, ["token"])
        # 다음 날은 다시 실행 가능
        self.assertTrue(scheduling.execute(items["collect_insights"], storage, datetime(2026, 10, 20, 3, 31, tzinfo=KST)))

    def test_publish_items_rely_on_their_own_claims(self):
        storage = _bootstrap.make_storage()
        bot, calls = self.fake_bot()
        items = {i.name: i for i in scheduling.build_schedule(bot)}
        now = datetime(2026, 10, 22, 6, 31, tzinfo=KST)
        scheduling.execute(items["threads_morning"], storage, now)
        scheduling.execute(items["threads_morning"], storage, now)  # 중복 방지는 봇의 DB claim 담당
        self.assertEqual(calls, ["slot:morning", "slot:morning"])

    def test_exception_in_task_is_contained(self):
        storage = _bootstrap.make_storage()

        def boom():
            raise RuntimeError("fail access_token=SECRET123456")

        item = scheduling.ScheduledItem("boom", 1, 0, boom, claim_once=True)
        self.assertTrue(scheduling.execute(item, storage, datetime(2026, 10, 22, 1, 5, tzinfo=KST)))

    def test_tick_runs_each_item_once_and_catches_up_within_grace(self):
        import main

        storage = _bootstrap.make_storage()
        bot, calls = self.fake_bot()
        schedule = scheduling.build_schedule(bot)
        fired = set()
        main.process_tick(storage, schedule, datetime(2026, 10, 22, 6, 20, tzinfo=KST), fired)
        self.assertEqual(calls, [])                                   # 아직 정시 전
        main.process_tick(storage, schedule, datetime(2026, 10, 22, 6, 41, tzinfo=KST), fired)
        self.assertEqual(calls, ["slot:morning"])                     # 프로세스가 늦게 살아나도 30분 안이면 따라잡는다
        main.process_tick(storage, schedule, datetime(2026, 10, 22, 6, 42, tzinfo=KST), fired)
        self.assertEqual(calls, ["slot:morning"])                     # 같은 날 재실행 없음
        main.process_tick(storage, schedule, datetime(2026, 10, 22, 12, 31, tzinfo=KST), fired)
        self.assertEqual(calls, ["slot:morning", "slot:afternoon"])
        main.process_tick(storage, schedule, datetime(2026, 10, 23, 6, 30, tzinfo=KST), fired)
        self.assertEqual(calls[-1], "slot:morning")                   # 다음 날 다시 실행

    def test_tick_runs_monday_token_refresh_and_report(self):
        import main

        storage = _bootstrap.make_storage()
        bot, calls = self.fake_bot()
        schedule = scheduling.build_schedule(bot)
        fired = set()
        main.process_tick(storage, schedule, datetime(2026, 10, 19, 4, 1, tzinfo=KST), fired)   # 월요일
        main.process_tick(storage, schedule, datetime(2026, 10, 19, 9, 1, tzinfo=KST), fired)
        self.assertIn("token", calls)
        self.assertIn("report", calls)
        calls.clear()
        main.process_tick(storage, schedule, datetime(2026, 10, 20, 4, 1, tzinfo=KST), fired)   # 화요일
        main.process_tick(storage, schedule, datetime(2026, 10, 20, 9, 1, tzinfo=KST), fired)
        self.assertNotIn("token", calls)
        self.assertNotIn("report", calls)

    def test_main_loop_still_works_without_apscheduler(self):
        import main

        try:
            import apscheduler  # noqa: F401
        except ImportError:
            bot, _ = self.fake_bot()
            self.assertIsNone(main.start_apscheduler(bot))

    def test_parse_hhmm_falls_back_on_bad_input(self):
        self.assertEqual(scheduling.parse_hhmm("07:15", (1, 1)), (7, 15))
        for bad in ("", "25:00", "abc", "7"):
            self.assertEqual(scheduling.parse_hhmm(bad, (8, 30)), (8, 30))


if __name__ == "__main__":
    unittest.main()
