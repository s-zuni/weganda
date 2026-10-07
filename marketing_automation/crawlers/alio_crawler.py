import re
from typing import Any, Dict, Iterable, List
from urllib.parse import unquote

from config import Config, is_placeholder
from security.sanitizer import clean_html_to_plain_text, validate_and_sanitize_url
from .base_crawler import BaseCrawler
from .models import RawJobPosting, d_day_label, days_left_from, parse_date

# 공공데이터포털 '재정경제부_공공기관 채용정보 조회서비스' (잡알리오)
ALIO_URL = "https://apis.data.go.kr/1051000/recruitment/list"
NCS_HEALTH_MEDICAL = "R600006"  # 보건.의료
PAGE_SIZE = 100
MAX_PAGES = 6

HOSPITAL_WORDS = ("병원", "의료원")
# '간호조무사'는 간호사가 아니므로 제외 (간호 뒤에 '조무'가 오지 않는 경우만 매칭)
NURSE_TITLE_RE = re.compile(r"간호사|간호직|간호(?!조무)")
BRACKET_RE = re.compile(r"^\s*\[([^\]]+)\]")


def _clip(text: str, limit: int) -> str:
    text = clean_html_to_plain_text(text or "")
    return text if len(text) <= limit else text[:limit].rstrip() + "…"


def is_nursing_posting(item: Dict[str, Any]) -> bool:
    """공고 제목에 간호직이 있거나, 병원 공고의 응시자격에 간호사가 명시된 경우."""
    title = item.get("recrutPbancTtl") or ""
    if NURSE_TITLE_RE.search(title):
        return True
    is_hospital = any(w in (item.get("instNm") or "") or w in title for w in HOSPITAL_WORDS)
    qual = item.get("aplyQlfcCn") or ""
    return is_hospital and "간호사" in qual


class AlioCrawler(BaseCrawler):
    """잡알리오(공공기관 채용정보) 오픈API 기반 간호직 공고 수집기."""

    def __init__(self):
        super().__init__(timeout=20, delay_seconds=0.3)

    def is_configured(self) -> bool:
        return not is_placeholder(Config.DATA_GO_KR_SERVICE_KEY)

    def _query(self, extra: Dict[str, Any]) -> List[Dict[str, Any]]:
        # '인코딩' 키(%포함)를 붙여 넣어도 이중 인코딩되지 않도록 디코딩해서 전달
        key = unquote(Config.DATA_GO_KR_SERVICE_KEY.strip())
        results: List[Dict[str, Any]] = []
        for page in range(1, MAX_PAGES + 1):
            body = self.fetch_json(ALIO_URL, params={
                "serviceKey": key, "resultType": "json", "pageNo": page,
                "numOfRows": PAGE_SIZE, "ongoingYn": "Y", **extra,
            })
            if not body or body.get("resultCode") != 200:
                if body:
                    print(f"[알리오] 응답 오류: {body.get('resultCode')} {body.get('resultMsg')}")
                break
            chunk = body.get("result") or []
            results += chunk
            if len(chunk) < PAGE_SIZE:
                break
        return results

    def _to_job(self, item: Dict[str, Any]) -> RawJobPosting | None:
        url = validate_and_sanitize_url(item.get("srcUrl") or "")
        end = parse_date(item.get("pbancEndYmd") or "")
        if not url or not end:
            return None  # 원문 링크/마감일이 없는 공고는 검증 불가하므로 제외

        title = (item.get("recrutPbancTtl") or "").strip()
        inst = (item.get("instNm") or "").strip()
        # 보훈복지의료공단처럼 산하 병원이 제목 대괄호에 있으면 그 병원명을 노출
        bracket = BRACKET_RE.match(title)
        hospital = bracket.group(1) if bracket and any(w in bracket.group(1) for w in HOSPITAL_WORDS) else inst

        begin = parse_date(item.get("pbancBgngYmd") or "")
        left = days_left_from(end)
        hire_type = item.get("hireTypeNmLst") or ""
        recruit_kind = item.get("recrutSeNm") or ""
        nope = item.get("recrutNope")

        lines = [
            f"1. 기관: {inst}",
            f"2. 공고명: {title}",
            f"3. 채용구분: {recruit_kind} / 고용형태: {hire_type}",
        ]
        if nope:
            lines.append(f"4. 모집인원: {nope}명")
        lines += [
            f"5. 근무지: {item.get('workRgnNmLst') or '공고문 참조'}",
            f"6. 접수기간: {begin.isoformat() if begin else '-'} ~ {end.isoformat()}",
            f"7. 학력: {item.get('acbgCondNmLst') or '공고문 참조'}",
            f"8. 응시자격:\n{_clip(item.get('aplyQlfcCn'), 900) or '공고문 참조'}",
        ]
        pref = _clip(item.get("prefCn") or item.get("prefCondCn"), 400)
        if pref:
            lines.append(f"9. 우대사항: {pref}")
        screening = _clip(item.get("scrnprcdrMthdExpln"), 600)
        if screening:
            lines.append(f"10. 전형절차:\n{screening}")

        return RawJobPosting(
            hospital_name=hospital,
            title=title,
            category=" · ".join(x for x in (recruit_kind, hire_type) if x) or "간호사",
            deadline=end.isoformat(),
            d_day=d_day_label(left),
            url=url,
            raw_details="\n".join(lines),
            source="alio",
            source_id=f"alio:{item.get('recrutPblntSn')}",
            hire_type=hire_type,
            days_left=left,
        )

    def fetch_nursing_jobs(self) -> List[RawJobPosting]:
        if not self.is_configured():
            print("[알리오] DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.")
            return []
        # 제목에 '간호' + 보건·의료 분야 두 경로를 합쳐 누락을 줄이고, 최종 판별은 로컬 규칙으로 수행
        merged: Dict[Any, Dict[str, Any]] = {}
        for extra in ({"recrutPbancTtl": "간호"}, {"ncsCdLst": NCS_HEALTH_MEDICAL}):
            for item in self._query(extra):
                merged.setdefault(item.get("recrutPblntSn"), item)

        jobs = [j for j in (self._to_job(i) for i in merged.values() if is_nursing_posting(i)) if j]
        print(f"[알리오] 수집 {len(merged)}건 중 간호직 {len(jobs)}건")
        return jobs
