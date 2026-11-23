import unittest
from collections import Counter
from datetime import date, timedelta

from tests import _bootstrap  # noqa: F401  (환경 준비)
from bot.storage import Storage  # noqa: F401
from pipeline.content_calendar import (
    MAX_TITLE_LEN,
    SEED_FILE,
    VALID_SLOTS,
    ContentCalendar,
    norm_title,
    parse_calendar,
    render_post,
)
from pipeline.quality_gate import check_posts
from pipeline.threads_viral_engine import MAX_LEN, ThreadsViralEngine, _force_title, _is_well_formatted

HEADER = "순번,날짜,슬롯,필라,제목,도입,포인트1,포인트2,포인트3,마무리질문,트렌드근거,상태\n"


def seed_entries():
    entries, issues = parse_calendar(SEED_FILE.read_text(encoding="utf-8"))
    return entries, issues


class SeedCalendar(unittest.TestCase):
    """저장소에 들어 있는 30일 캘린더가 발행 가능한 상태인지 검증한다."""

    def test_parses_without_issues(self):
        entries, issues = seed_entries()
        self.assertEqual(issues, [])
        self.assertEqual(len(entries), 90)

    def test_thirty_days_three_slots_each(self):
        entries, _ = seed_entries()
        start = date(2026, 11, 23)
        expected = {((start + timedelta(days=d)).isoformat(), s) for d in range(30) for s in VALID_SLOTS}
        self.assertEqual({(e.date, e.slot) for e in entries}, expected)
        self.assertEqual(len(entries), len(expected))  # 날짜·슬롯 중복 없음

    def test_titles_are_unique_and_short(self):
        entries, _ = seed_entries()
        titles = [e.title for e in entries]
        self.assertEqual(len({norm_title(t) for t in titles}), len(titles))
        self.assertTrue(all(len(t) <= MAX_TITLE_LEN for t in titles), [t for t in titles if len(t) > MAX_TITLE_LEN])

    def test_every_entry_renders_a_publishable_post(self):
        entries, _ = seed_entries()
        for e in entries:
            post = render_post(e)
            self.assertTrue(post.startswith(e.title), e.title)
            self.assertLessEqual(len(post), MAX_LEN, f"{e.seq} {e.title} {len(post)}자")
            self.assertTrue(_is_well_formatted([post]), e.title)
            gate = check_posts([post])
            self.assertEqual(gate.reasons, [], f"{e.seq} {e.title}")
            self.assertEqual(len(e.points), 3, e.title)

    def test_pillar_mix_is_balanced(self):
        entries, _ = seed_entries()
        counts = Counter(e.pillar for e in entries)
        self.assertEqual(set(counts), {"career", "job_fact", "shift_survival", "app_tip"})
        self.assertLessEqual(counts["app_tip"], 12)  # 앱 연계 주제는 10% 안팎


class ParsingRules(unittest.TestCase):
    ROW = "1,2026. 11. 23,morning,career,제목A,도입 한 줄 / 두번째 줄,항목|설명,,,마무리?,근거,예정\n"

    def test_date_variants_and_blank_points(self):
        entries, issues = parse_calendar(HEADER + self.ROW)
        self.assertEqual(issues, [])
        self.assertEqual(entries[0].date, "2026-11-23")
        self.assertEqual(entries[0].points, (("항목", "설명"),))
        self.assertIn("\n두번째 줄", render_post(entries[0]).replace(" / ", "\n").replace("\n\n", "\n"))

    def test_duplicate_titles_and_bad_rows_are_dropped(self):
        text = (
            HEADER + self.ROW
            + "2,2026-11-24,morning,career,제 목A,도입,항목|설명,,,마무리?,,예정\n"  # 공백 차이만 있는 중복
            + "3,2026-11-25,night,career,제목C,도입,항목|설명,,,마무리?,,예정\n"  # 잘못된 슬롯
            + "4,날짜아님,morning,career,제목D,도입,항목|설명,,,마무리?,,예정\n"
            + "5,2026-11-26,morning,career,제목E,도입,항목|설명,,,마무리?,,건너뜀\n"
        )
        entries, issues = parse_calendar(text)
        self.assertEqual([e.title for e in entries], ["제목A"])
        self.assertEqual(len(issues), 3)

    def test_missing_required_column(self):
        entries, issues = parse_calendar("순번,제목\n1,A\n")
        self.assertEqual(entries, [])
        self.assertIn("필수 열 누락", issues[0])


class PickOrder(unittest.TestCase):
    def setUp(self):
        self.cal = ContentCalendar(seed_entries()[0], "seed")

    def test_picks_todays_entry_for_slot(self):
        e = self.cal.pick("2026-11-24", "afternoon")
        self.assertEqual((e.date, e.slot), ("2026-11-24", "afternoon"))

    def test_published_titles_are_never_picked_again(self):
        first = self.cal.pick("2026-11-23", "morning")
        # 오늘 항목을 이미 올렸다면 같은 슬롯의 밀린 항목이 없으니 None
        self.assertIsNone(self.cal.pick("2026-11-23", "morning", done_titles=[first.title]))

    def test_catches_up_missed_days_in_order(self):
        # 11/23~11/24 아침을 못 올린 채 11/25가 된 경우: 오늘 항목이 먼저, 그다음 밀린 순서대로
        today = self.cal.pick("2026-11-25", "morning")
        self.assertEqual(today.date, "2026-11-25")
        done = [today.title]
        self.assertEqual(self.cal.pick("2026-11-25", "morning", done).date, "2026-11-23")

    def test_no_entry_after_calendar_ends(self):
        done = [e.title for e in self.cal.entries]
        self.assertIsNone(self.cal.pick("2026-12-23", "evening", done))
        self.assertIsNone(self.cal.pick("2027-01-05", "morning", done))


class EnginePlanned(unittest.TestCase):
    def setUp(self):
        from config import Config

        Config.OPENAI_API_KEY = ""  # LLM 없이 템플릿 경로 확인
        self.entry = ContentCalendar(seed_entries()[0], "seed").pick("2026-11-23", "evening")

    def test_planned_post_keeps_title_and_records_calendar_meta(self):
        res = ThreadsViralEngine().generate_for_slot("evening", plan=self.entry)
        self.assertEqual(res.posts[0].splitlines()[0], self.entry.title)
        self.assertEqual((res.calendar_title, res.calendar_seq), (self.entry.title, self.entry.seq))
        self.assertEqual(res.format_id, "calendar_template")
        self.assertFalse(res.needs_review)

    def test_cta_reply_is_appended_after_the_planned_post(self):
        res = ThreadsViralEngine().generate_for_slot("evening", plan=self.entry, with_cta=True)
        self.assertEqual(len(res.posts), 2)
        self.assertTrue(res.has_cta)

    def test_force_title(self):
        self.assertEqual(_force_title("다른 훅\n\n본문", "제목"), "제목\n\n본문")
        self.assertEqual(_force_title("제목\n본문", "제목"), "제목\n본문")
        긴첫줄 = "이 첫 줄은 제목이 아니라 서른 글자를 훌쩍 넘기는 아주 긴 문장입니다 정말로요"
        self.assertTrue(_force_title(긴첫줄 + "\n본문", "제목").startswith("제목\n\n" + 긴첫줄))


class CalendarDoneStorage(unittest.TestCase):
    def test_done_titles_are_remembered_once(self):
        s = _bootstrap.make_storage()
        self.assertEqual(s.get_calendar_done(), [])
        s.mark_calendar_done("제목A")
        s.mark_calendar_done("제목A")
        s.mark_calendar_done("")
        s.mark_calendar_done("제목B")
        self.assertEqual(s.get_calendar_done(), ["제목A", "제목B"])


if __name__ == "__main__":
    unittest.main()
