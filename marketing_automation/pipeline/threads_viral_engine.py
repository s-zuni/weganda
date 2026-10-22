import json
import random
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Mapping, Optional, Sequence
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field

from config import Config, redact_secrets
from crawlers.models import RawJobPosting
from pipeline import fallback_posts
from pipeline.content_pillars import (
    BRAND_VOICE_RULES,
    CLOSING_STYLES,
    PILLAR_CAREER,
    PILLAR_JOB,
    PILLAR_SURVIVAL,
    HookFormula,
    ThreadFormat,
    pick_format,
    pick_hook,
)
from pipeline.optimizer import ExperimentSpec, assign_arm
from pipeline.quality_gate import check_posts
from pipeline.utm import build_tracking_url

MAX_LEN = 480  # Threads API 한도 500자에 여유 확보
LLM_ATTEMPTS = 3

# 간호사 3교대 라이프사이클 맞춤 하루 3회 발행 시각 (KST)
THREADS_SLOTS = {
    "morning": (6, 30),     # 06:30 KST — 데이(D) 출근길 / 나이트(N) 퇴근 직전
    "afternoon": (12, 30),  # 12:30 KST — 데이 점심 / 이브닝(E) 출근 준비 / 간호대생 점심
    "evening": (17, 30),    # 17:30 KST — 데이 퇴근길 / 나이트 기상 후 출근 전
}

SLOT_LABELS = {
    "morning": "🌅 아침 06:30 (출근/퇴근길 채용·커리어 팩트)",
    "afternoon": "☀️ 낮 12:30 (점심 밸런스 게임 & 면접·임상 족보)",
    "evening": "🌆 오후 17:30 (퇴근길 3교대 폭풍 공감 & 생존 루틴)",
}

SLOT_STRATEGIES = {
    "morning": {
        "category": "채용·커리어 팩트 큐레이션",
        "default_tag": "간호사",
        "tone": (
            "아침 6시 30분 데이 출근길 버스/지하철이나 나이트 퇴근 직전에 읽는 글입니다. "
            "정신이 번쩍 드는 '실전 채용 비교·병원 선택 기준·놓치면 손해 보는 공채 체크리스트' 톤으로 작성하세요."
        ),
    },
    "afternoon": {
        "category": "밸런스 게임 & 면접·임상 족보",
        "default_tag": "간호학과",
        "tone": (
            "낮 12시 30분 점심시간이나 이브닝 출근 준비 중에 가볍게 보다가 댓글을 달고 싶어지는 글입니다. "
            "간호사·간호대생 사이에서 의견이 반반으로 갈리는 '극단적 밸런스 게임'이나 '면접/임상에서 흔히 하는 착각 vs 현실 팩트' 톤으로 작성하세요."
        ),
    },
    "evening": {
        "category": "3교대 현실 공감 & 듀티 생존법",
        "default_tag": "교대근무",
        "tone": (
            "오후 5시 30분 데이 퇴근길 해방감이나 나이트 출근 전 공감대를 자극하는 글입니다. "
            "병동 동기와 단톡방에 공유하고 싶어지는 '3교대 수면 루틴, N-O-D 극복법, 번아웃 시그널, 병동 인간관계 처방전' 톤으로 작성하세요."
        ),
    },
}

# 슬롯 폴백(LLM 실패 시)에서 기록할 필러
_FALLBACK_PILLAR = {"morning": PILLAR_CAREER, "afternoon": PILLAR_CAREER, "evening": PILLAR_SURVIVAL}

VIRAL_STYLE_GUIDE = f"""[Threads 바이럴 작법 규칙]
■ 1. 구조 (도달·체류시간·댓글)
- 본문(posts[0]) 하나만 읽어도 완결된 재미와 핵심 정보가 다 들어 있어야 합니다. ("타래로 이어집니다 👇"만 써놓고 본문에 알맹이가 없으면 노출이 죽습니다.)
- 본문은 7~11줄, 전체 220~380자 내외. 첫 줄은 반드시 22자 이내의 강렬한 한 문장으로 시작해 스크롤을 멈추게 하세요.
- 답글(posts[1])은 선택 사항(0~1개)이며, 본문에서 다루지 못한 '실전 팁 1가지'나 '실제 채용 공고 팩트 요약(마감일·원문 확인 안내)'만 간결하게 덧붙입니다.
- 마지막 줄은 아래 [마무리 방식] 지시를 따르세요.

■ 2. 모바일 줄바꿈 & 가독성 (가장 중요)
- 한 줄은 25자 안팎으로 짧게 끊고, 문장이 끝나면 무조건 줄을 바꿉니다.
- 번호 리스트는 반드시 2줄 구조를 지킵니다:
  1. 핵심 키워드 또는 병원명 (짧고 굵게)
  : 구체적인 이유나 현실 상황 1문장 설명
- 항목과 항목 사이, 문단과 문단 사이에는 빈 줄(\\n\\n)을 넣어 모바일에서 숨 막히지 않게 하세요.

■ 3. 어투 및 디테일
- 추상적인 말 대신 간호사만 아는 생생한 일상 장면(인계장, 프리셉터, N-O-D, 액팅, 나이트 퇴근 버스, 카톡 단톡방 등)을 넣으세요.
{BRAND_VOICE_RULES}
- 번역투나 AI스러운 상투적 표현("안녕하세요!", "함께 알아볼까요?", "~해보세요!")은 절대 금지합니다.
- 이모지는 글 전체에서 최대 2개까지만 쓰고, 본문 안에 해시태그(#)나 외부 링크(http)는 절대 넣지 마세요 (알고리즘 도달 페널티 방지).

■ 4. 사실성(Fact-Safety)
- [실시간 채용 공고 데이터]가 제공되어 특정 병원 공고를 언급할 때는, 제공된 병원명·마감일·D-day·고용형태만 정확히 인용하세요.
- 원문 데이터에 없는 연봉 액수, 정확한 모집 인원수, 특정 어학 점수를 특정 병원의 확정 사실인 것처럼 쓰지 마세요."""


class LLMThreadsDraft(BaseModel):
    topic_tag: str = Field(
        default="간호사",
        description="Threads 토픽 태그 1개 (# 기호나 공백·특수문자 없이 한글 단어만, 예: 간호사, 간호학과, 병원취업, 교대근무)",
    )
    posts: List[str] = Field(
        ...,
        description="타래 글 목록. posts[0]은 완결성 있는 본문(220~380자), posts[1]은 보충 답글(선택, 150~300자). 각 글 460자 이내, 해시태그/링크/홍보 금지.",
    )


class ViralThreadResult(BaseModel):
    slot: str
    category: str
    topic_tag: str
    hook_used: str  # 사용한 후킹 공식 id (폴백이면 'fallback')
    posts: List[str]
    has_cta: bool = False
    referenced_job_ids: List[str] = Field(default_factory=list)
    needs_review: bool = False  # 품질 게이트가 사람 확인을 요구하면 무인 발행 대신 승인 대기로 전환
    review_reasons: List[str] = Field(default_factory=list)
    # 성과 분석·실험용 메타데이터 (발행 성공 시 content_posts에 기록)
    pillar: str = ""
    format_id: str = ""
    cta_variant: str = ""
    experiment_id: str = ""
    arm: str = ""


@dataclass(frozen=True)
class SlotChoice:
    """한 번의 생성에 쓸 포맷·후킹·실험 배정."""
    format: Optional[ThreadFormat]
    hook: HookFormula
    experiment_id: str = ""
    arm: str = ""


@dataclass(frozen=True)
class Cta:
    text: str
    variant_id: str


def make_choice(
    slot: str,
    has_jobs: bool,
    recent_meta: Sequence[Mapping[str, str]] = (),
    format_weights: Optional[Mapping[str, float]] = None,
    hook_weights: Optional[Mapping[str, float]] = None,
    experiment: Optional[ExperimentSpec] = None,
    experiment_counts: Optional[Mapping[str, int]] = None,
    rng: Optional[random.Random] = None,
) -> SlotChoice:
    """최근 발행 이력·성과 가중치·진행 중 실험을 반영해 포맷과 후킹을 정한다."""
    rng = rng or random.Random()
    recent_format_ids = [m.get("format_id", "") for m in recent_meta if m.get("slot") == slot]
    recent_pillars = [m.get("pillar", "") for m in recent_meta]
    recent_hook_ids = [m.get("hook_id", "") for m in recent_meta]

    fmt = pick_format(
        slot, has_jobs,
        recent_format_ids=recent_format_ids,
        recent_pillars=recent_pillars,
        perf_weights=format_weights,
        rng=rng,
    )

    experiment_id = arm = ""
    if experiment is not None and experiment.dimension == "hook":
        arm = assign_arm(experiment, experiment_counts or {}, rng)
        experiment_id = experiment.id
        hook = pick_hook(allowed_ids=[arm], rng=rng)
    else:
        hook = pick_hook(recent_hook_ids=recent_hook_ids, perf_weights=hook_weights, rng=rng)
    return SlotChoice(format=fmt, hook=hook, experiment_id=experiment_id, arm=arm)


def _sanitize_tag(tag: str) -> str:
    cleaned = re.sub(r"[#.&@\s/]", "", (tag or "")).strip()
    return cleaned[:30] or "간호사"


def _trim_post(text: str) -> str:
    text = (text or "").strip()
    if len(text) <= MAX_LEN:
        return text
    cut = text[:MAX_LEN]
    for sep in ("\n\n", "\n", "? ", "! ", ". ", "요 ", "다 ", "함 ", "임 "):
        idx = cut.rfind(sep)
        if idx > int(MAX_LEN * 0.65):
            return cut[: idx + len(sep)].strip()
    return cut.strip()


def _is_well_formatted(posts: List[str]) -> bool:
    """본문이 충분한 줄바꿈을 포함하는지 검증 (줄글 덩어리 방지)."""
    if not posts or not posts[0].strip():
        return False
    main_post = posts[0].strip()
    if len(main_post) < 80:
        return False
    lines = [line for line in main_post.split("\n") if line.strip()]
    return len(lines) >= 5


# 앱 홍보는 하루 1회 답글로만 붙인다. variant_id는 성과 기록용(어느 문구가 쓰였는지).
_CTA_VARIANTS: Dict[str, str] = {
    "cta_a": "3교대 듀티표 공유부터 병원 채용 공고 모아보기까지,\n한 앱에서 보고 싶다면",
    "cta_b": "동기들과 듀티표를 공유하면 겹치는 오프를 찾아줘요,\n기본 듀티 관리는 무료로 쓸 수 있어요",
    "cta_c": "간호사 교대근무 캘린더와 채용/취업 정보 게시판은\n우간다(weganda) 앱에서 한눈에 볼 수 있어요",
}


def build_weganda_cta(
    slot: str = "",
    variant_id: Optional[str] = None,
    rng: Optional[random.Random] = None,
) -> Cta:
    """하루 3번 중 1번만 타래 끝에 붙이는 전환 답글. 앱 링크에는 추적 파라미터를 붙인다."""
    rng = rng or random.Random()
    variant_id = variant_id if variant_id in _CTA_VARIANTS else rng.choice(sorted(_CTA_VARIANTS))
    handle = Config.INSTAGRAM_HANDLE or "@we_ganda"

    link = build_tracking_url(
        Config.APP_DOWNLOAD_URL,
        source="threads", medium="social", campaign="app-cta",
        content=f"{slot}-{variant_id}" if slot else variant_id,
    )
    url_line = f"\n👉 {link}" if link else f"\n👉 인스타 {handle} 프로필 링크에서 바로 시작"
    suffix = "" if variant_id == "cta_c" else " [우간다(weganda)]"
    return Cta(text=f"{_CTA_VARIANTS[variant_id]}{url_line}{suffix}", variant_id=variant_id)


class ThreadsViralEngine:
    """간호사 3교대 맞춤 바이럴 쓰레드 생성 엔진 (포맷·후킹 선택 → LLM → 품질 게이트 → 폴백)"""

    def generate_for_slot(
        self,
        slot: str = "morning",
        jobs: Optional[List[RawJobPosting]] = None,
        recent_posts: Optional[List[str]] = None,
        with_cta: bool = False,
        choice: Optional[SlotChoice] = None,
    ) -> ViralThreadResult:
        slot = slot if slot in SLOT_STRATEGIES else "morning"
        strategy = SLOT_STRATEGIES[slot]
        jobs = jobs or []
        choice = choice or make_choice(slot, has_jobs=bool(jobs and slot == "morning"))

        draft = self._generate_with_llm(slot, strategy, jobs, recent_posts or [], choice)
        if draft is not None:
            posts, topic_tag, gate = draft
            cta = build_weganda_cta(slot) if with_cta else None
            if cta:
                posts = posts + [cta.text]
            return ViralThreadResult(
                slot=slot,
                category=strategy["category"],
                topic_tag=topic_tag,
                hook_used=choice.hook.id,
                posts=posts,
                has_cta=with_cta,
                referenced_job_ids=[j.source_id for j in jobs[:3] if j.source_id] if slot == "morning" else [],
                needs_review=gate.needs_review,
                review_reasons=gate.reasons,
                pillar=choice.format.pillar if choice.format else "",
                format_id=choice.format.id if choice.format else "",
                cta_variant=cta.variant_id if cta else "",
                experiment_id=choice.experiment_id,
                arm=choice.arm,
            )
        return self._fallback_for_slot(slot, jobs, with_cta, recent_posts or [])

    # ------------------------------------------------------------------ LLM
    def _build_prompt(
        self,
        slot: str,
        strategy: Mapping[str, str],
        jobs: List[RawJobPosting],
        recent_posts: Sequence[str],
        choice: SlotChoice,
    ) -> str:
        now_kst = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y년 %m월 %d일 (%a)")
        fmt_brief = choice.format.brief if choice.format else "슬롯 톤에 맞는 자유 주제"
        closing = CLOSING_STYLES[choice.format.closing] if choice.format else CLOSING_STYLES["experience"]

        jobs_context = ""
        if jobs and slot == "morning":
            lines = ["\n[실시간 채용 공고 데이터 (잡알리오/공식 수집)]"]
            for idx, j in enumerate(jobs[:3], start=1):
                lines.append(
                    f"{idx}. 병원명: {j.hospital_name} | 공고명: {j.title} | "
                    f"구분: {j.category}({j.hire_type}) | 마감: {j.deadline} ({j.d_day}) | 링크: {j.url or '공식 사이트 참조'}"
                )
            lines.append("※ 위 실제 공고들을 소재로 활용하되, 딱딱한 공지가 아니라 위 작법과 후킹으로 재구성하세요.")
            jobs_context = "\n".join(lines)

        recent_context = ""
        if recent_posts:
            snippets = "\n---\n".join(p[:140] for p in recent_posts[:12])
            recent_context = f"\n\n[최근 발행된 글 — 아래 글들과 첫 줄 후킹/소재/질문이 겹치지 않게 작성]\n{snippets}"

        return f"""{VIRAL_STYLE_GUIDE}

[오늘 날짜]
{now_kst}

[발행 슬롯 및 타겟 상황]
- 슬롯: {SLOT_LABELS[slot]}
- 카테고리: {strategy['category']}
- 톤앤매너: {strategy['tone']}
- 이번 글 포맷: {fmt_brief}
- 이번 글 첫 줄 후킹 공식: {choice.hook.brief}
- 마무리 방식: {closing}
{jobs_context}
{recent_context}

위 지침을 준수하여 Threads 타래(posts 1~2개)를 JSON으로 작성하세요."""

    def _generate_with_llm(self, slot, strategy, jobs, recent_posts, choice):
        """게이트를 통과한 (posts, topic_tag, gate)을 반환한다. 키 미설정·반복 실패·게이트 차단이면 None."""
        if not Config.GEMINI_API_KEY or Config.GEMINI_API_KEY.startswith("your_"):
            return None
        try:
            from google import genai

            client = genai.Client(api_key=Config.GEMINI_API_KEY)
        except Exception as e:  # SDK 미설치·초기화 실패는 폴백으로 처리
            print(f"[Threads 바이럴 엔진 안내] Gemini 클라이언트 초기화 실패 ({redact_secrets(e)}) -> 내장 템플릿으로 전환합니다.")
            return None

        prompt = self._build_prompt(slot, strategy, jobs, recent_posts, choice)
        for attempt in range(LLM_ATTEMPTS):
            try:
                response = client.models.generate_content(
                    model=Config.GEMINI_MODEL,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": LLMThreadsDraft,
                        "temperature": 0.9,
                    },
                )
                if not response.text:
                    continue
                draft = LLMThreadsDraft.model_validate(json.loads(response.text))
            except Exception as e:  # 네트워크·파싱·스키마 오류는 다음 시도로 넘긴다
                print(f"[Threads 바이럴 엔진] LLM 호출/파싱 실패 ({attempt + 1}/{LLM_ATTEMPTS}): {redact_secrets(e)}")
                continue

            posts = [_trim_post(p) for p in draft.posts if p and p.strip()][:2]
            gate = check_posts(posts, jobs[:3])
            if gate.blocked:
                print(f"[Threads 바이럴 엔진] 품질 게이트 차단 → 재생성 ({attempt + 1}/{LLM_ATTEMPTS}): {gate.reasons}")
                continue
            if not _is_well_formatted(posts):
                continue
            return posts, _sanitize_tag(draft.topic_tag or strategy["default_tag"]), gate

        print("[Threads 바이럴 엔진 안내] LLM 결과가 기준을 통과하지 못해 내장 템플릿으로 전환합니다.")
        return None

    # ------------------------------------------------------------------ 폴백
    def _fallback_for_slot(
        self,
        slot: str,
        jobs: List[RawJobPosting],
        with_cta: bool,
        recent_posts: List[str],
    ) -> ViralThreadResult:
        strategy = SLOT_STRATEGIES.get(slot, SLOT_STRATEGIES["morning"])
        pillar = _FALLBACK_PILLAR.get(slot, PILLAR_CAREER)
        ref_ids: List[str] = []

        if slot == "morning" and jobs:
            top = jobs[:3]
            posts = [_trim_post(p) for p in fallback_posts.morning_with_jobs(top)]
            ref_ids = [j.source_id for j in top if j.source_id]
            pillar = PILLAR_JOB
        else:
            posts = [_trim_post(fallback_posts.pick_fallback(slot, recent_posts))]

        # 폴백도 같은 게이트를 통과시킨다. 고칠 수 없으니 차단 사유도 사람 확인으로 돌린다.
        gate = check_posts(posts, jobs[:3])

        cta = build_weganda_cta(slot) if with_cta else None
        if cta:
            posts.append(cta.text)

        return ViralThreadResult(
            slot=slot,
            category=strategy["category"],
            topic_tag=strategy["default_tag"],
            hook_used="fallback",
            posts=posts,
            has_cta=with_cta,
            referenced_job_ids=ref_ids,
            needs_review=gate.needs_review or gate.blocked,
            review_reasons=gate.reasons,
            pillar=pillar,
            format_id=f"fallback_{slot}",  # 선택된 포맷이 쓰이지 않았으므로 포맷·실험 통계에서 분리
            cta_variant=cta.variant_id if cta else "",
        )
