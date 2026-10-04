import re
from datetime import date, datetime
from typing import Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field

from config import Config


class RawJobPosting(BaseModel):
    hospital_name: str = Field(..., description="병원명 (예: 서울대학교병원)")
    title: str = Field(..., description="공고 제목")
    category: str = Field(default="신규간호사", description="구분 (신규/경력/공공)")
    deadline: str = Field(..., description="마감 일시")
    d_day: str = Field(default="D-7", description="마감 디데이")
    url: str = Field(default="", description="공식 채용 공고 원문 URL")
    raw_details: str = Field(..., description="공고 요강 세부 텍스트")
    source: str = Field(default="", description="수집 경로 (alio | manual | mock)")
    source_id: str = Field(default="", description="중복 발행 방지용 고유 ID")
    hire_type: str = Field(default="", description="고용형태 (정규직/비정규직 등)")
    days_left: Optional[int] = Field(default=None, description="오늘(KST) 기준 마감까지 남은 일수. 상시/미정이면 None")


def today_kst() -> date:
    return datetime.now(ZoneInfo(Config.TIMEZONE)).date()


def parse_date(text: str) -> Optional[date]:
    """'20261019', '2026-10-19', '2026.10.19', '2026년 10월 19일' 등에서 날짜를 추출."""
    if not text:
        return None
    compact = re.fullmatch(r"\s*(\d{4})(\d{2})(\d{2})\s*", text)
    m = compact or re.search(r"(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})", text)
    if not m:
        return None
    try:
        return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    except ValueError:
        return None


def days_left_from(deadline: date) -> int:
    return (deadline - today_kst()).days


def d_day_label(days_left: Optional[int]) -> str:
    if days_left is None:
        return "마감일 확인 필요"
    if days_left == 0:
        return "D-DAY"
    return f"D-{days_left}" if days_left > 0 else f"마감(D+{-days_left})"
