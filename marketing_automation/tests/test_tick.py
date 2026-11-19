import unittest
from datetime import datetime
from unittest import mock
from zoneinfo import ZoneInfo

from tests import _bootstrap
from config import Config
import main
import scheduling

KST = ZoneInfo("Asia/Seoul")
MONDAY = (2026, 11, 16)  # 월요일


def kst(h: int, m: int, ymd=MONDAY) -> datetime:
    return datetime(*ymd, h, m, tzinfo=KST)


class FakeAnalytics:
    def __init__(self, calls):
        self.calls = calls

    def collect(self):
        self.calls.append("collect")

    def send_scheduled_report(self):
        self.calls.append("weekly_report")


class FakeBot:
    """build_schedule 과 run_tick 이 쓰는 최소 인터페이스만 구현한 봇."""

    def __init__(self):
        self.calls = []
        self.storage = _bootstrap.make_storage()
        self.analytics = FakeAnalytics(self.calls)

    def poll_updates_once(self):
        self.calls.append("poll")

    def run_daily_dispatch(self):
        self.calls.append("daily")

    def run_scheduled_threads_slot(self, slot):
        self.calls.append(f"threads_{slot}")

    def refresh_threads_token(self):
        self.calls.append("token")

    def check_instagram_health(self):
        self.calls.append("ig_health")

    def retry_failed_jobs(self, skip_threads_slots=None):
        self.calls.append("retry")
        self.retry_skip = skip_threads_slots


class WithGrace(unittest.TestCase):
    def test_widens_but_never_shrinks(self):
        bot = FakeBot()
        base = {i.name: i for i in scheduling.build_schedule(bot)}
        widened = {i.name: i for i in scheduling.with_grace(list(base.values()), 120, 360)}
        self.assertEqual(widened["threads_morning"].grace_min, 120)
        self.assertEqual(widened["collect_insights"].grace_min, 360)
        for name, item in widened.items():
            self.assertGreaterEqual(item.grace_min, base[name].grace_min)
        # 원본은 바뀌지 않는다(불변 사본)
        self.assertEqual(base["threads_morning"].grace_min, scheduling.PUBLISH_GRACE_MIN)

    def test_larger_existing_grace_is_kept(self):
        item = scheduling.ScheduledItem("x", 1, 0, lambda: None, grace_min=500)
        self.assertEqual(scheduling.with_grace([item], 120, 360)[0].grace_min, 500)


class RunTick(unittest.TestCase):
    def test_late_start_still_runs_slot_and_overdue_maintenance_once(self):
        bot = FakeBot()
        ran = main.run_tick(bot, kst(6, 40))  # 06:30 슬롯이 10분 늦게 시작
        self.assertEqual(ran, ["threads_morning", "collect_insights", "threads_token_refresh", "instagram_health"])
        self.assertEqual(bot.retry_skip, {"morning"})  # 이번에 시도한 슬롯은 재시도에서 제외(시도 횟수 연달아 소진 방지)
        self.assertEqual(bot.calls[0], "poll")

        bot.calls.clear()
        again = main.run_tick(bot, kst(6, 50))  # 같은 날 다음 실행: 유지보수는 하루 1회만
        self.assertEqual(again, ["threads_morning"])  # 슬롯 중복은 봇 내부 DB claim이 막는다

    def test_nothing_due_runs_retry(self):
        bot = FakeBot()
        # 화요일 11:00: 일일 발행(08:30)·유지보수는 유예가 지났고, Threads 아침 슬롯만 다음 슬롯(12:30) 전까지 늦게라도 시도 대상이다
        ran = main.run_tick(bot, kst(11, 0, (2026, 11, 17)))
        self.assertEqual(ran, ["threads_morning"])
        self.assertEqual(bot.calls, ["poll", "threads_morning", "retry"])

    def test_threads_slot_catches_up_late_but_never_bursts(self):
        bot = FakeBot()
        ran = main.run_tick(bot, kst(12, 40, (2026, 11, 17)))  # 아침 슬롯은 만료, 점심 슬롯만 대상(몰아서 발행하지 않음)
        self.assertEqual([n for n in ran if n.startswith("threads_")], ["threads_afternoon"])
        late_evening = main.run_tick(FakeBot(), kst(22, 0, (2026, 11, 17)))  # 저녁 슬롯은 23:30까지
        self.assertEqual([n for n in late_evening if n.startswith("threads_")], ["threads_evening"])
        too_late = main.run_tick(FakeBot(), kst(23, 45, (2026, 11, 17)))
        self.assertEqual([n for n in too_late if n.startswith("threads_")], [])

    def test_weekly_items_only_on_monday(self):
        bot = FakeBot()
        tuesday = main.run_tick(bot, kst(9, 5, (2026, 11, 17)))
        self.assertNotIn("weekly_report", tuesday)
        self.assertNotIn("threads_token_refresh", tuesday)
        bot2 = FakeBot()
        monday = main.run_tick(bot2, kst(9, 5))
        self.assertIn("weekly_report", monday)

    def test_before_first_slot_nothing_runs(self):
        bot = FakeBot()
        ran = main.run_tick(bot, kst(3, 0))
        self.assertEqual(ran, [])


class TelegramOffset(unittest.TestCase):
    def _bot(self):
        from bot.telegram_bot import TelegramApprovalBot

        bot = TelegramApprovalBot.__new__(TelegramApprovalBot)
        bot.token = "123:abc"
        bot.base_url = "https://api.telegram.org/bot123:abc"
        bot.storage = _bootstrap.make_storage()
        bot.last_update_id = 0
        bot.handled = []
        bot.handle_message = lambda msgs: bot.handled.append(msgs[0]["text"])
        bot.handle_callback_query = lambda q: bot.handled.append(q["data"])
        return bot

    def _response(self, updates):
        res = mock.Mock(status_code=200)
        res.json.return_value = {"result": updates}
        return res

    def test_offset_is_saved_after_polling(self):
        bot = self._bot()
        updates = [
            {"update_id": 41, "message": {"text": "a"}},
            {"update_id": 42, "callback_query": {"data": "b"}},
        ]
        with mock.patch("bot.telegram_bot.requests.get", return_value=self._response(updates)) as get:
            bot.poll_updates_once()
        self.assertEqual(bot.handled, ["a", "b"])
        self.assertEqual(bot.storage.get_setting("tg_last_update_id"), "42")
        self.assertEqual(get.call_args.kwargs["params"]["offset"], 1)

    def test_offset_untouched_when_no_updates(self):
        bot = self._bot()
        with mock.patch("bot.telegram_bot.requests.get", return_value=self._response([])):
            bot.poll_updates_once()
        self.assertEqual(bot.storage.get_setting("tg_last_update_id"), "")

    def test_new_bot_resumes_from_saved_offset(self):
        from bot.telegram_bot import TelegramApprovalBot

        storage = _bootstrap.make_storage()
        storage.set_setting("tg_last_update_id", "42")
        with mock.patch("bot.telegram_bot.Storage", return_value=storage):
            bot = TelegramApprovalBot()
        self.assertEqual(bot.last_update_id, 42)


if __name__ == "__main__":
    unittest.main()
