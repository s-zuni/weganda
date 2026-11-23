"""월간 쓰레드 콘텐츠 캘린더.

구글 시트(또는 저장소의 시드 CSV)에 미리 기획해 둔 주제를 날짜·슬롯 순서대로 꺼내 쓴다.
같은 제목은 한 번만 발행되며(`done_titles`), 시트에서 중복 제목은 로드 시점에 걸러낸다.

시트 열: 순번, 날짜, 슬롯, 필라, 제목, 도입, 포인트1~3("항목|설명"), 마무리질문, 트렌드근거, 상태
- 도입의 ` / `는 줄바꿈으로 바뀐다.
- 상태가 `건너뜀`/`보류`/`중단`인 행은 쓰지 않는다.
시트는 편집자가 바꿀 수 있는 외부 입력이므로 LLM 프롬프트에서는 데이터로만 취급하고,
발행 전에는 항상 품질 게이트를 거친다.
"""
import csv
import io
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Set, Tuple

import requests

from config import BASE_DIR, Config, redact_secrets

VALID_SLOTS = ("morning", "afternoon", "evening")
MAX_TITLE_LEN = 22  # 모바일 첫 줄 한 화면 기준 (프롬프트의 22자 규칙과 동일)
SKIP_STATUSES = {"건너뜀", "보류", "중단"}
REQUIRED_COLUMNS = ("날짜", "슬롯", "제목", "도입", "포인트1", "마무리질문")
POINT_COLUMNS = ("포인트1", "포인트2", "포인트3")
SEED_FILE = BASE_DIR / "data" / "threads_content_calendar.csv"

_DATE_RE = re.compile(r"(\d{4})\D+(\d{1,2})\D+(\d{1,2})")


@dataclass(frozen=True)
class CalendarEntry:
    seq: int
    date: str  # YYYY-MM-DD
    slot: str
    pillar: str
    title: str
    intro: str
    points: Tuple[Tuple[str, str], ...]  # (항목, 설명)
    closing: str
    trend: str = ""


def norm_title(title: str) -> str:
    """제목 비교용 정규화: 공백·대소문자 차이를 무시한다."""
    return re.sub(r"\s+", "", title or "").lower()


def _normalize_date(raw: str) -> Optional[str]:
    """`2026-11-23`, `2026. 11. 23`, `2026/11/23` 같은 표기를 ISO로 맞춘다."""
    m = _DATE_RE.search(raw or "")
    if not m:
        return None
    y, mo, d = (int(g) for g in m.groups())
    if not (1 <= mo <= 12 and 1 <= d <= 31):
        return None
    return f"{y:04d}-{mo:02d}-{d:02d}"


def _parse_point(raw: str) -> Optional[Tuple[str, str]]:
    raw = (raw or "").strip()
    if not raw:
        return None
    head, sep, tail = raw.partition("|")
    return (head.strip(), tail.strip()) if sep else (raw, "")


def parse_calendar(text: str) -> Tuple[List[CalendarEntry], List[str]]:
    """CSV 텍스트를 항목 목록과 문제 목록으로 변환한다. 잘못된 행은 건너뛰고 사유를 남긴다."""
    issues: List[str] = []
    reader = csv.DictReader(io.StringIO((text or "").lstrip("﻿")))
    if reader.fieldnames is None:
        return [], ["빈 캘린더"]
    reader.fieldnames = [(h or "").strip() for h in reader.fieldnames]
    missing = [c for c in REQUIRED_COLUMNS if c not in reader.fieldnames]
    if missing:
        return [], [f"필수 열 누락: {', '.join(missing)}"]

    entries: List[CalendarEntry] = []
    seen_titles: Set[str] = set()
    for line_no, row in enumerate(reader, start=2):
        row = {(k or "").strip(): (v or "").strip() for k, v in row.items() if k is not None}
        if not any(row.values()):
            continue
        if row.get("상태", "") in SKIP_STATUSES:
            continue

        title = row.get("제목", "")
        date_iso = _normalize_date(row.get("날짜", ""))
        slot = row.get("슬롯", "").lower()
        if not title or not date_iso or slot not in VALID_SLOTS:
            issues.append(f"{line_no}행 건너뜀: 제목/날짜/슬롯 확인 필요")
            continue

        points = tuple(p for p in (_parse_point(row.get(c, "")) for c in POINT_COLUMNS) if p)
        if not points or not row.get("도입") or not row.get("마무리질문"):
            issues.append(f"{line_no}행 건너뜀('{title}'): 도입/포인트/마무리질문 누락")
            continue

        key = norm_title(title)
        if key in seen_titles:
            issues.append(f"{line_no}행 건너뜀: 중복 제목 '{title}'")
            continue
        seen_titles.add(key)
        if len(title) > MAX_TITLE_LEN:
            issues.append(f"{line_no}행 경고: 제목이 {len(title)}자 (권장 {MAX_TITLE_LEN}자 이내) '{title}'")

        try:
            seq = int(row.get("순번", "") or len(entries) + 1)
        except ValueError:
            seq = len(entries) + 1
        entries.append(CalendarEntry(
            seq=seq,
            date=date_iso,
            slot=slot,
            pillar=row.get("필라", ""),
            title=title,
            intro=row["도입"],
            points=points,
            closing=row["마무리질문"],
            trend=row.get("트렌드근거", ""),
        ))
    return entries, issues


def render_post(entry: CalendarEntry) -> str:
    """LLM 없이 항목만으로 만드는 본문. 제목이 첫 줄이고 번호 리스트는 2줄 구조(항목 / : 설명)를 따른다."""
    parts = [entry.title, entry.intro.replace(" / ", "\n")]
    for idx, (head, desc) in enumerate(entry.points, start=1):
        parts.append(f"{idx}. {head}\n: {desc}" if desc else f"{idx}. {head}")
    parts.append(entry.closing)
    return "\n\n".join(parts)


def _fetch_sheet_csv() -> Optional[str]:
    """링크 공개(보기 가능)된 구글 시트를 CSV로 읽는다. 비공개이거나 오류면 None."""
    sheet_id = Config.THREADS_CALENDAR_SHEET_ID.strip()
    if not sheet_id:
        return None
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={Config.THREADS_CALENDAR_SHEET_GID}"
    try:
        resp = requests.get(url, timeout=10)
    except requests.RequestException as e:
        print(f"[콘텐츠 캘린더] 시트 조회 실패: {redact_secrets(e)}")
        return None
    if resp.status_code != 200 or "csv" not in resp.headers.get("content-type", "").lower():
        print(f"[콘텐츠 캘린더] 시트를 읽을 수 없습니다 (HTTP {resp.status_code}). 링크 공유를 '링크가 있는 모든 사용자 - 뷰어'로 설정하세요.")
        return None
    resp.encoding = "utf-8"
    return resp.text


def _read_seed(path: Path = SEED_FILE) -> Optional[str]:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as e:
        print(f"[콘텐츠 캘린더] 시드 파일 읽기 실패: {e}")
        return None


class ContentCalendar:
    def __init__(self, entries: Sequence[CalendarEntry], source: str, issues: Iterable[str] = ()):
        self.entries = list(entries)
        self.source = source
        self.issues = list(issues)

    @classmethod
    def load(cls) -> "ContentCalendar":
        """시트 → 시드 CSV 순으로 읽는다. 어떤 경우에도 예외를 던지지 않는다(발행 흐름을 막지 않기 위해)."""
        for source, text in (("sheet", _fetch_sheet_csv()), ("seed", _read_seed())):
            if not text:
                continue
            entries, issues = parse_calendar(text)
            for issue in issues:
                print(f"[콘텐츠 캘린더/{source}] {issue}")
            if entries:
                return cls(entries, source, issues)
            print(f"[콘텐츠 캘린더] {source}에서 유효한 항목을 찾지 못했습니다.")
        return cls([], "none", ["읽을 수 있는 캘린더가 없습니다"])

    def pick(self, date_str: str, slot: str, done_titles: Iterable[str] = ()) -> Optional[CalendarEntry]:
        """오늘 날짜·슬롯의 항목을 고른다. 이미 발행한 제목은 제외하며, 없으면 밀린 항목을 순서대로 이어서 쓴다."""
        done = {norm_title(t) for t in done_titles}
        todo = [e for e in self.entries if e.slot == slot and norm_title(e.title) not in done]
        for e in todo:
            if e.date == date_str:
                return e
        overdue = sorted((e for e in todo if e.date < date_str), key=lambda e: (e.date, e.seq))
        return overdue[0] if overdue else None
