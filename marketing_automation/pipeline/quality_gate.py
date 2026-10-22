import re
from dataclasses import dataclass, field
from typing import Iterable, List, Sequence

from crawlers.models import RawJobPosting

# 등급: block = 자동 재생성 대상(고칠 수 있는 형식·사실 위반), review = 사람 승인이 필요한 위험(의료·노무·명예)
BLOCK = "block"
REVIEW = "review"

_MONEY_RE = re.compile(r"\d[\d,\.]*\s*(?:만\s*원|만원|억)")
_URL_RE = re.compile(r"https?://|www\.", re.IGNORECASE)
_EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆]")

# 근거를 대기 어려운 최상급·보장성 표현 (스킬: 주장은 증빙 가능해야 한다)
_UNSUPPORTED_CLAIM_RE = re.compile(
    r"(?:대한민국|국내|업계|전국)\s*(?:1위|최고|유일)|(?<!\d)1위(?!\d)|100\s*%|"
    r"합격\s*(?:보장|확정)|취업\s*(?:보장|확정)|확실히\s*(?:합격|붙)|보장합니다"
)
# 현재 앱에 없는 기능을 약속하는 표현 (앱의 알림은 '임상 알람'이며 채용 D-day 알림·자동 일정 등록은 없음).
# 해당 기능이 출시되면 이 패턴에서 제거할 것.
_APP_FEATURE_CLAIM_RE = re.compile(r"D-?day\s*알림|디데이\s*알림|알림\s*자동|자동\s*알림|자동\s*등록|원클릭", re.IGNORECASE)

# 번역투·광고투 상투구 (프롬프트에서도 금지하지만 모델이 어길 때를 대비한 후단 검사)
_BANNED_PHRASE_RE = re.compile(r"안녕하세요|함께\s*알아볼까요|알아보겠습니다|해\s*보세요!|구독과\s*좋아요")

# 간호 업무 지침처럼 읽힐 수 있는 의료·투약 표현 → 사람이 확인
_MEDICAL_RE = re.compile(
    r"처방|복용|투약|용량|진단|치료|인슐린|항생제|수면제|멜라토닌|약물|혈당|"
    r"\d+(?:\.\d+)?\s*(?:mg|mL|ml|cc|IU|mcg)\b",
    re.IGNORECASE,
)
# 노무·법적 단정
_LEGAL_RE = re.compile(r"불법|위법|근로기준법|노동청|고소|고발|직장\s*내\s*괴롭힘\s*신고")
# 특정 병원과 함께 쓰이면 명예훼손 소지가 있는 부정 표현
_DEFAMATION_RE = re.compile(r"태움|갑질|폭언|부실|최악|블랙|퇴사율|먹튀")

MAX_EMOJI_MAIN = 3  # 프롬프트 기준 최대 2개 + 여유 1


@dataclass(frozen=True)
class GateIssue:
    level: str
    code: str
    detail: str


@dataclass
class GateResult:
    issues: List[GateIssue] = field(default_factory=list)

    @property
    def blocked(self) -> bool:
        return any(i.level == BLOCK for i in self.issues)

    @property
    def needs_review(self) -> bool:
        return any(i.level == REVIEW for i in self.issues)

    @property
    def reasons(self) -> List[str]:
        return [f"{i.code}: {i.detail}" for i in self.issues]


def _norm(s: str) -> str:
    return re.sub(r"[\s,]", "", s)


def has_unverified_money(texts: Iterable[str], jobs: Sequence[RawJobPosting]) -> bool:
    """글의 금액 표현(예: 5,200만 원)이 제공된 공고 원문에 없으면 True. 공백·쉼표 차이는 무시한다."""
    source = _norm(" ".join(f"{j.hospital_name} {j.title} {j.raw_details}" for j in jobs))
    return any(_norm(m) not in source for text in texts for m in _MONEY_RE.findall(text))


def _common_checks(
    texts: Sequence[str],
    jobs: Sequence[RawJobPosting],
    result: GateResult,
    include_medical: bool = True,
) -> None:
    joined = "\n".join(texts)

    if has_unverified_money(texts, jobs):
        result.issues.append(GateIssue(BLOCK, "unverified_money", "공고 원문에 없는 금액 표현"))

    m = _UNSUPPORTED_CLAIM_RE.search(joined)
    if m:
        result.issues.append(GateIssue(BLOCK, "unsupported_claim", f"근거 없는 최상급·보장 표현 '{m.group(0)}'"))

    m = _APP_FEATURE_CLAIM_RE.search(joined)
    if m:
        result.issues.append(GateIssue(BLOCK, "unsupported_app_claim", f"앱에 없는 기능 약속 '{m.group(0)}'"))

    m = _BANNED_PHRASE_RE.search(joined)
    if m:
        result.issues.append(GateIssue(BLOCK, "banned_phrase", f"금지 상투구 '{m.group(0)}'"))

    m = _MEDICAL_RE.search(joined) if include_medical else None
    if m:
        result.issues.append(GateIssue(REVIEW, "medical_content", f"의료·투약 관련 표현 '{m.group(0)}' — 임상 정확성 확인"))

    m = _LEGAL_RE.search(joined)
    if m:
        result.issues.append(GateIssue(REVIEW, "legal_claim", f"노무·법적 단정 표현 '{m.group(0)}'"))

    for job in jobs:
        name = job.hospital_name.strip()
        if name and name in joined and (neg := _DEFAMATION_RE.search(joined)):
            result.issues.append(
                GateIssue(REVIEW, "hospital_defamation", f"'{name}'와(과) 부정 표현 '{neg.group(0)}'이 함께 등장")
            )
            break


def check_posts(posts: Sequence[str], jobs: Sequence[RawJobPosting] = ()) -> GateResult:
    """Threads 타래 검사. posts[0]은 본문(링크·해시태그·이모지 과다 금지), 이후는 답글."""
    result = GateResult()
    if not posts or not posts[0].strip():
        result.issues.append(GateIssue(BLOCK, "empty_post", "본문이 비어 있음"))
        return result

    main = posts[0]
    if _URL_RE.search(main) or "#" in main:
        result.issues.append(GateIssue(BLOCK, "link_or_hashtag", "본문에 링크/해시태그 포함 (도달 페널티)"))
    emoji_count = len(_EMOJI_RE.findall(main))
    if emoji_count > MAX_EMOJI_MAIN:
        result.issues.append(GateIssue(BLOCK, "emoji_overuse", f"본문 이모지 {emoji_count}개"))

    _common_checks(posts, jobs, result)
    return result


def check_texts(texts: Sequence[str], jobs: Sequence[RawJobPosting] = ()) -> GateResult:
    """인스타 캡션·카드뉴스·커뮤니티 글 등 채용 패키지 전체 문구 검사 (재생성 대신 승인 전환용).
    공고 원문에는 '치료센터' 같은 병원 용어가 흔하므로 의료 표현 검사는 생략한다."""
    result = GateResult()
    _common_checks([t for t in texts if t], jobs, result, include_medical=False)
    return result
