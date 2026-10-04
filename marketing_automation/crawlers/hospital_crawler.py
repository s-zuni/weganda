from typing import Iterable, List, Optional

from config import Config
from .alio_crawler import AlioCrawler
from .base_crawler import BaseCrawler
from .models import RawJobPosting, d_day_label

__all__ = ["HospitalCrawler", "RawJobPosting", "FALLBACK_JOB_POSTS"]

# 로컬 렌더링/DRY_RUN 테스트용 Mock (실제 공고가 아님 — ALLOW_MOCK_JOBS=true일 때만 사용)
FALLBACK_JOB_POSTS: List[RawJobPosting] = [
    RawJobPosting(
        hospital_name="국립중앙의료원",
        title="2026년도 정규직 신규/경력 간호사 채용 공고",
        category="신규/경력간호사",
        deadline="2026-10-20 18:00",
        d_day="D-7",
        url="https://www.nmc.or.kr/recruit",
        source="mock",
        source_id="mock:nmc",
        raw_details=(
            "1. 모집분야: 정규직 일반간호사 (00명)\n"
            "2. 응시자격: 간호사 면허증 소지자(또는 2027년 2월 취득 예정자), 어학성적(TOEIC 700점 이상 또는 OPIc IM2 이상)\n"
            "3. 전형절차: 1차 서류전형 -> 2차 필기시험(직무기초능력) -> 3차 블라인드 면접 -> 4차 신체검사\n"
            "4. 우대사항: 보훈대상자 및 장애인, 공공의료원 실습 경험자\n"
            "5. 근무조건: 3교대 근무, 기숙사 제공, 복지포인트 지급"
        ),
    ),
    RawJobPosting(
        hospital_name="서울대학교병원",
        title="2026년도 본원 정규직 간호직(간호사) 공개채용",
        category="신규간호사",
        deadline="2026-10-25 17:00",
        d_day="D-12",
        url="https://snuh.recruiter.co.kr",
        source="mock",
        source_id="mock:snuh",
        raw_details=(
            "1. 모집인원: 000명 (신규간호사)\n"
            "2. 응시자격: 간호대학(과) 졸업자 또는 졸업예정자, 공인영어성적 소지자\n"
            "3. 전형일정: 서류접수(10/10~10/25) -> 실무면접(11월 초) -> 최종면접(11월 중순)\n"
            "4. 복리후생: 진료비 감면 혜택, 직장어린이집, 자기계발비 지원"
        ),
    ),
]


class HospitalCrawler(BaseCrawler):
    """
    간호사 채용공고 수집기.
    - 잡알리오(공공기관: 국립대병원·공공병원 등) 자동 수집
    - 사립 병원 등 API에 없는 공고는 텔레그램 제보(pipeline/job_extractor.py)로 보완
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alio = AlioCrawler()

    @staticmethod
    def _rank(job: RawJobPosting):
        # 정규직 우선 → 마감 임박 순
        # ('비정규직'에도 '정규직'이 포함되므로 쉼표로 분리해 정확히 일치하는지 확인)
        is_regular = "정규직" in [t.strip() for t in job.hire_type.split(",")]
        return (0 if is_regular else 1, job.days_left if job.days_left is not None else 9999)

    def fetch_latest_jobs(
        self,
        limit: int = 3,
        use_mock_if_needed: Optional[bool] = None,
        exclude_ids: Iterable[str] = (),
    ) -> List[RawJobPosting]:
        # 명시하지 않으면 ALLOW_MOCK_JOBS 설정을 따른다 (실발행에 가짜 공고가 섞이지 않도록 기본 False)
        if use_mock_if_needed is None:
            use_mock_if_needed = Config.ALLOW_MOCK_JOBS
        excluded = set(exclude_ids)

        jobs = [
            j for j in self.alio.fetch_nursing_jobs()
            if j.source_id not in excluded and (j.days_left is None or j.days_left >= Config.JOB_MIN_DDAY)
        ]
        jobs.sort(key=self._rank)
        if jobs:
            return jobs[:limit]

        if use_mock_if_needed:
            print("[크롤러] ⚠️ Mock 공고를 사용합니다 (실제 공고가 아님 — 테스트/DRY_RUN 전용).")
            return FALLBACK_JOB_POSTS[:limit]

        print("[크롤러] 추천할 신규 공고가 없고 Mock은 비허용(ALLOW_MOCK_JOBS=false)이라 빈 결과를 반환합니다.")
        return []
