"""콘텐츠 필러·포맷·후킹 정의와 선택 로직.

`.agents/product-marketing.md`(Brand Voice)와 content-strategy 스킬의 필러 개념을 코드로 옮긴 모듈이다.
선택 로직은 순수 함수(난수 생성기 주입)로 두어 테스트가 가능하고, DB·LLM에 의존하지 않는다.
"""
import random
from dataclasses import dataclass
from typing import Dict, Iterable, List, Mapping, Optional, Sequence

PILLAR_JOB = "job_fact"          # 채용 팩트
PILLAR_SURVIVAL = "shift_survival"  # 3교대 생존
PILLAR_CAREER = "career"         # 커리어·병원 선택
PILLAR_APP = "app_tip"           # 앱 기능과 맞닿은 실용 팁 (본문에서 앱을 홍보하지 않는다)

# 목표 비중(%). 합계 100. 최근 발행분과 비교해 부족한 필러의 포맷에 가중치를 준다.
PILLAR_TARGET_SHARE: Dict[str, int] = {
    PILLAR_JOB: 30,
    PILLAR_SURVIVAL: 30,
    PILLAR_CAREER: 30,
    PILLAR_APP: 10,
}

# 마지막 줄 처리 방식. 매번 "(1) vs (2)"로 끝나면 패턴 피로가 생기므로 포맷마다 다르게 지정한다.
CLOSING_STYLES: Dict[str, str] = {
    "choice": "마지막 줄은 숫자나 A/B로 바로 답할 수 있는 선택형 질문 (예: '1번 vs 2번 어디 가실래요?')",
    "experience": "마지막 줄은 독자의 경험을 묻는 짧은 질문 (예: '여러분이 겪어본 최악은 몇 번이었나요?')",
    "statement": "마지막 줄은 질문 없이 한 문장으로 단정하는 마무리 (질문형·낚시성 마무리 금지)",
}

# 프롬프트에 주입하는 브랜드 보이스 규칙. `.agents/product-marketing.md`의 Brand Voice와 같은 내용을 유지한다.
BRAND_VOICE_RULES = (
    "- 친한 선후배 간호사가 현실 조언을 해주듯 구어체(~함, ~거든요, ~임, ~해요 혼용)로 쓴다.\n"
    "- 순위·최상급('1위', '최고', '유일')과 보장성 표현('합격 보장')은 쓰지 않는다.\n"
    "- 특정 병원 실명에는 부정적 표현을 붙이지 않는다.\n"
    "- 투약·진단·치료를 단정하는 조언은 쓰지 않는다. 일상 루틴과 경험 공유 수준으로 쓴다.\n"
    "- 공고 원문에 없는 연봉·인원·점수는 만들어내지 않는다.\n"
    "- weganda+ 무료 체험 기간을 언급할 때는 대상 조건을 함께 쓴다: 사전예약자 2개월, 사전예약 없이 구매하면 1개월. 조건 없이 '무료'만 단정하지 않는다.\n"
    "- 앱 기능을 언급할 때는 실제 있는 기능(듀티 캘린더, 동료와 근무표 공유·겹치는 오프 찾기, 채용/취업 정보 게시판, "
    "약물 점적 계산기, 익명 커뮤니티)만 쓴다. '채용 D-day 알림', '자동 등록' 같은 없는 기능은 쓰지 않는다."
)


@dataclass(frozen=True)
class ThreadFormat:
    id: str
    slot: str
    pillar: str
    closing: str
    brief: str
    requires_jobs: bool = False  # True면 실제 공고 데이터가 있을 때만 후보가 된다


@dataclass(frozen=True)
class HookFormula:
    id: str
    brief: str


FORMATS: Sequence[ThreadFormat] = (
    # ---- morning 06:30 : 채용·커리어 팩트
    ThreadFormat(
        "m_job_compare", "morning", PILLAR_JOB, "choice",
        "오늘 기준 접수 중인 실제 공공병원/대학병원 채용 공고를 묶어 마감일(D-day)·전형 특징을 한눈에 비교하는 리스트",
        requires_jobs=True,
    ),
    ThreadFormat(
        "m_deadline_alert", "morning", PILLAR_JOB, "statement",
        "마감이 가까운 실제 공고 1~2개를 짚고, 지원 전에 원문에서 꼭 대조할 항목(자격·어학·접수 방법)을 정리",
        requires_jobs=True,
    ),
    ThreadFormat(
        "m_job_checklist", "morning", PILLAR_JOB, "experience",
        "신규/경력 간호사가 원서 넣기 전에 확인해야 하는 병원 조건 4가지 (기숙사, 프리셉터 기간, 교대 형태, 통근 거리)",
    ),
    ThreadFormat(
        "m_public_hospital", "morning", PILLAR_CAREER, "choice",
        "빅5/상급종합만 보다가 놓치기 쉬운 국공립·공공의료원 정규직의 현실 장점 3~4가지 비교",
    ),
    ThreadFormat(
        "m_resume_mistakes", "morning", PILLAR_CAREER, "experience",
        "서류·자기소개서에서 탈락 사유가 되기 쉬운 흔한 실수 3가지와 고치는 방법",
    ),
    ThreadFormat(
        "m_first_month", "morning", PILLAR_CAREER, "experience",
        "신규 간호사 입사 첫 달에 챙기면 편해지는 것 4가지 (인계 메모, 프리셉터 질문법, 수면, 식사)",
    ),
    # ---- afternoon 12:30 : 밸런스 게임 & 면접·임상 족보
    ThreadFormat(
        "a_balance_game", "afternoon", PILLAR_CAREER, "choice",
        "극단적 병원·병동 밸런스 게임: 조건 A(급여 높지만 오버타임·통근 부담) vs 조건 B(급여 평범하지만 칼퇴·좋은 프리셉터·기숙사). "
        "구체적 금액은 쓰지 말고 '높음/평범' 같은 표현만 쓴다",
    ),
    ThreadFormat(
        "a_red_flags", "afternoon", PILLAR_CAREER, "experience",
        "이직·취준 때 걸러야 하는 병원·병동 시그널 4가지 (상시채용, 인계 시간, N-O-D 빈도 등)",
    ),
    ThreadFormat(
        "a_interview_mistakes", "afternoon", PILLAR_CAREER, "experience",
        "병원 면접에서 자주 나오는 단골 실수 3가지와 답변을 한 줄로 정리하는 공식",
    ),
    ThreadFormat(
        "a_myth_vs_fact", "afternoon", PILLAR_CAREER, "statement",
        "취준·임상에서 흔한 통념 3가지와 현실 (예: 무조건 큰 병원이 유리하다)",
    ),
    ThreadFormat(
        "a_preceptor_types", "afternoon", PILLAR_SURVIVAL, "choice",
        "프리셉터 유형별(꼼꼼형·방임형·감정기복형) 신규가 잘 버티는 질문·대화 요령",
    ),
    ThreadFormat(
        "a_offday_matching", "afternoon", PILLAR_APP, "choice",
        "동기와 오프를 맞추기 어려운 이유와, 근무표를 미리 공유해 약속을 잡는 현실적인 방법 (앱 이름은 쓰지 않는다)",
    ),
    # ---- evening 17:30 : 3교대 현실 공감 & 듀티 생존법
    ThreadFormat(
        "e_night_sleep", "evening", PILLAR_SURVIVAL, "choice",
        "나이트 근무 전후 수면 패턴이 무너지는 행동 3가지와 일상에서 지킬 수 있는 루틴 (약·보충제 언급 금지)",
    ),
    ThreadFormat(
        "e_nod_survival", "evening", PILLAR_SURVIVAL, "experience",
        "N-O-D, 이브닝 연속 같은 힘든 듀티를 만났을 때 현직자들이 쓰는 생존 요령 4가지",
    ),
    ThreadFormat(
        "e_longevity_traits", "evening", PILLAR_SURVIVAL, "choice",
        "병동에서 오래 버티는 간호사들의 공통점 4가지 (인계 마인드셋, 오프 날 루틴, 감정 분리)",
    ),
    ThreadFormat(
        "e_duty_swap", "evening", PILLAR_SURVIVAL, "experience",
        "듀티 교환을 부탁하고 받을 때 서로 편한 매너 3가지",
    ),
    ThreadFormat(
        "e_burnout_signals", "evening", PILLAR_SURVIVAL, "experience",
        "일상에서 알아채는 지침 신호 3가지와 오프 날 회복 습관 (진단·치료 표현 금지, 경험 공유 수준)",
    ),
    ThreadFormat(
        "e_pay_structure", "evening", PILLAR_APP, "statement",
        "야간·휴일 근무 수당이 월급에서 어떤 구조로 붙는지 개념적으로 정리하고, 직접 기록해 두면 좋은 항목 (구체적 법 조항·금액 단정 금지)",
    ),
    ThreadFormat(
        "e_offday_planning", "evening", PILLAR_APP, "choice",
        "오프 날을 약속과 휴식으로 나누어 계획하는 법",
    ),
)

HOOKS: Sequence[HookFormula] = (
    HookFormula("identity_call", "정체성 호명 + 결론 숨김: '<대상(3년 차 이하 간호사 / 올해 공채 준비생 / 나이트 앞둔 간호사)>가 이거 모르면 손해 봅니다'처럼 대상을 직접 부르고 첫 줄에서 호기심 유발"),
    HookFormula("number_fact", "숫자·팩트 제시: '원서 쓰기 전에 볼 3가지', '이직할 때 3번 해당되면 다시 생각할 것'처럼 구체적 숫자로 시선 고정"),
    HookFormula("contrarian", "반직관 단언: 모두가 당연하게 믿는 통념(무조건 큰 병원이 좋다 / 나이트 끝나고 바로 자야 한다)을 첫 문장에서 정면으로 뒤집기"),
    HookFormula("balance_duel", "극단적 밸런스 대결: 첫 두 줄에 양극단 선택지 A vs B를 바로 던져 읽는 순간 머릿속으로 고르게 만들기"),
    HookFormula("symptom_checklist", "공감 체크리스트: 임상/취준 일상에서 겪는 구체적 장면 3~4가지를 먼저 나열하고 원인과 해결책 제시"),
)

_FORMAT_BY_ID: Dict[str, ThreadFormat] = {f.id: f for f in FORMATS}
_HOOK_BY_ID: Dict[str, HookFormula] = {h.id: h for h in HOOKS}


def get_format(format_id: str) -> Optional[ThreadFormat]:
    return _FORMAT_BY_ID.get(format_id)


def get_hook(hook_id: str) -> Optional[HookFormula]:
    return _HOOK_BY_ID.get(hook_id)


def formats_for_slot(slot: str, has_jobs: bool) -> List[ThreadFormat]:
    return [f for f in FORMATS if f.slot == slot and (has_jobs or not f.requires_jobs)]


def pillar_of(format_id: str) -> str:
    fmt = _FORMAT_BY_ID.get(format_id)
    return fmt.pillar if fmt else ""


def pillar_weights(recent_pillars: Iterable[str]) -> Dict[str, float]:
    """최근 발행분의 필러 비중이 목표보다 낮을수록 큰 가중치를 준다. (기록이 없으면 목표 비중 그대로)"""
    recent = [p for p in recent_pillars if p in PILLAR_TARGET_SHARE]
    total = len(recent)
    weights: Dict[str, float] = {}
    for pillar, target in PILLAR_TARGET_SHARE.items():
        actual = (recent.count(pillar) / total * 100) if total else float(target)
        # 부족(actual<target)하면 >1, 넘치면 <1. 0 나눗셈과 극단 편향을 막기 위해 범위를 제한한다.
        ratio = target / max(actual, 5.0)
        weights[pillar] = min(max(ratio, 0.4), 2.5)
    return weights


def pick_format(
    slot: str,
    has_jobs: bool,
    recent_format_ids: Sequence[str] = (),
    recent_pillars: Sequence[str] = (),
    perf_weights: Optional[Mapping[str, float]] = None,
    rng: Optional[random.Random] = None,
) -> Optional[ThreadFormat]:
    """슬롯에 맞는 포맷을 고른다. 최근에 쓴 포맷은 피하고(대안이 있을 때), 필러 비중과 성과 가중치를 곱한다."""
    rng = rng or random.Random()
    candidates = formats_for_slot(slot, has_jobs)
    if not candidates:
        return None

    recent_set = set(recent_format_ids[:4])
    fresh = [f for f in candidates if f.id not in recent_set]
    pool = fresh or candidates

    p_weights = pillar_weights(recent_pillars)
    weights = [
        p_weights.get(f.pillar, 1.0) * (perf_weights or {}).get(f.id, 1.0)
        for f in pool
    ]
    return rng.choices(pool, weights=weights, k=1)[0]


def pick_hook(
    allowed_ids: Optional[Sequence[str]] = None,
    recent_hook_ids: Sequence[str] = (),
    perf_weights: Optional[Mapping[str, float]] = None,
    rng: Optional[random.Random] = None,
) -> HookFormula:
    """후킹 공식을 고른다. allowed_ids로 후보를 제한할 수 있다(실험에서 사용)."""
    rng = rng or random.Random()
    pool = [h for h in HOOKS if not allowed_ids or h.id in allowed_ids] or list(HOOKS)
    recent_set = set(recent_hook_ids[:2])
    fresh = [h for h in pool if h.id not in recent_set]
    pool = fresh or pool
    weights = [(perf_weights or {}).get(h.id, 1.0) for h in pool]
    return rng.choices(pool, weights=weights, k=1)[0]
