import unittest

from tests import _bootstrap  # noqa: F401  (환경 준비)
from crawlers.models import RawJobPosting
from pipeline.quality_gate import check_posts, check_texts, has_unverified_money
from pipeline.threads_viral_engine import ThreadsViralEngine

JOB = RawJobPosting(
    hospital_name="A의료원", title="간호사 채용", category="신규", deadline="2099-01-02",
    d_day="D-3", url="", source="t", source_id="t:1", raw_details="초봉 4,100만 원, 재활치료센터",
)
OK_MAIN = "첫 줄 훅\n둘째 줄\n셋째 줄\n넷째 줄\n다섯째 줄\n어디 가실래요? (1) vs (2)"


def codes(result):
    return sorted(i.code for i in result.issues)


class BlockRules(unittest.TestCase):
    def test_clean_post_passes(self):
        self.assertEqual(codes(check_posts([OK_MAIN])), [])

    def test_link_and_hashtag_only_blocked_in_main_post(self):
        self.assertIn("link_or_hashtag", codes(check_posts([OK_MAIN + "\nhttps://x.kr"])))
        self.assertIn("link_or_hashtag", codes(check_posts([OK_MAIN + " #간호사"])))
        self.assertNotIn("link_or_hashtag", codes(check_posts([OK_MAIN, "원문 https://x.kr"])))

    def test_emoji_overuse(self):
        self.assertIn("emoji_overuse", codes(check_posts([OK_MAIN + "😀😀😀😀"])))

    def test_unsupported_claims(self):
        self.assertIn("unsupported_claim", codes(check_posts([OK_MAIN + "\n대한민국 1위 앱"])))
        self.assertIn("unsupported_claim", codes(check_posts([OK_MAIN + "\n합격 보장"])))
        self.assertNotIn("unsupported_claim", codes(check_posts([OK_MAIN + "\n병원 고를 때 1순위는?"])))

    def test_app_feature_claims_are_blocked(self):
        for text in ("채용 D-day 알림 받기", "일정 자동 등록", "원클릭으로 등록", "마감 알림 자동 발송"):
            self.assertIn("unsupported_app_claim", codes(check_posts([OK_MAIN + "\n" + text])), text)
        self.assertNotIn("unsupported_app_claim", codes(check_posts([OK_MAIN + "\n마감 D-3, 지원서 확인"])))

    def test_banned_phrase_and_empty(self):
        self.assertIn("banned_phrase", codes(check_posts(["안녕하세요! " + OK_MAIN])))
        self.assertIn("empty_post", codes(check_posts([""])))

    def test_money_must_come_from_the_job(self):
        self.assertIn("unverified_money", codes(check_posts([OK_MAIN + "\n초봉 5,200만 원"], [JOB])))
        self.assertNotIn("unverified_money", codes(check_posts([OK_MAIN + "\n초봉 4100만원"], [JOB])))
        self.assertTrue(has_unverified_money(["초봉 5,200만 원"], [JOB]))
        self.assertFalse(has_unverified_money(["연봉 높은 곳"], []))


class ReviewRules(unittest.TestCase):
    def test_medical_content_needs_review_not_block(self):
        r = check_posts([OK_MAIN + "\n인슐린 용량 확인"])
        self.assertTrue(r.needs_review)
        self.assertFalse(r.blocked)
        self.assertIn("medical_content", codes(r))

    def test_legal_claim(self):
        self.assertIn("legal_claim", codes(check_posts([OK_MAIN + "\n그건 불법입니다"])))

    def test_hospital_defamation_requires_named_hospital(self):
        r = check_posts([OK_MAIN + "\nA의료원은 태움 최악"], [JOB])
        self.assertIn("hospital_defamation", codes(r))
        self.assertTrue(r.needs_review)
        self.assertNotIn("hospital_defamation", codes(check_posts([OK_MAIN + "\n태움 최악"], [])))


class PackageCheck(unittest.TestCase):
    def test_package_ignores_medical_words_from_job_text(self):
        self.assertEqual(codes(check_texts(["재활치료센터 근무", "초봉 4,100만 원"], [JOB])), [])

    def test_package_blocks_superlatives(self):
        self.assertIn("unsupported_claim", codes(check_texts(["업계 최고 병원"], [JOB])))


class FallbacksAreGateClean(unittest.TestCase):
    """운영에서 LLM이 실패해도 내장 글이 매번 승인 요청으로 빠지지 않아야 한다."""

    def test_all_slots(self):
        engine = ThreadsViralEngine()
        for slot in ("morning", "afternoon", "evening"):
            for _ in range(8):
                res = engine.generate_for_slot(slot=slot, jobs=[JOB] if slot == "morning" else [], with_cta=(slot == "evening"))
                self.assertFalse(res.needs_review, (slot, res.review_reasons))
                self.assertTrue(res.posts and res.posts[0])


if __name__ == "__main__":
    unittest.main()
