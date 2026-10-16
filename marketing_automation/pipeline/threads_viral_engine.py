import json
import random
import re
from datetime import datetime
from typing import List, Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field

from config import Config
from crawlers.models import RawJobPosting

MAX_LEN = 480  # Threads API 한도 500자에 여유 확보
MIN_POSTS = 1
MAX_POSTS = 3  # 본문 1 + 핵심 보충 답글 0~1 + (선택적 CTA 답글 1)

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
        "formats": [
            "오늘 기준 접수 중인 실제 공공병원/대학병원 채용 공고들을 묶어 마감일(D-day)·전형 특징을 한눈에 비교하는 리스트 → 마지막 줄에 '솔직히 1번 vs 2번 어디 지원하실래요?' 질문",
            "신규/경력 간호사가 원서 넣기 전에 무조건 확인해야 하는 병원 조건 4가지 (기숙사, 프리셉터 기간, 교대 형태, 통근 거리) → '여러분이 병원 고를 때 1순위는 몇 번인가요?'",
            "빅5/상급종합만 바라보다가 놓치기 쉬운 알짜 국공립·공공의료원 정규직의 현실 장점 3~4가지 비교 → '연봉 높은 상급종합 vs 정년·워라밸 공공병원 어디가 더 끌리세요?'",
        ],
    },
    "afternoon": {
        "category": "밸런스 게임 & 면접·임상 족보",
        "default_tag": "간호학과",
        "tone": (
            "낮 12시 30분 점심시간이나 이브닝 출근 준비 중에 가볍게 보다가 댓글을 달고 싶어지는 글입니다. "
            "간호사·간호대생 사이에서 의견이 반반으로 갈리는 '극단적 밸런스 게임'이나 '면접/임상에서 흔히 하는 착각 vs 현실 팩트' 톤으로 작성하세요."
        ),
        "formats": [
            "극단적 병원/병동 밸런스 게임: 조건 A(예: 초봉 높지만 태움·오버타임 심한 곳) vs 조건 B(예: 급여는 평범하지만 칼퇴·프리셉터 천사·1인실 기숙사) 구체적 상황 비교 → '무조건 A 간다(1) vs 그래도 B 간다(2) 여러분의 선택은?'",
            "간호사 이직/취준할 때 무조건 걸러야 하는 병원·병동 시그널 4가지 (상시채용, 인계 시간, N-O-D 빈도 등) → '여러분이 겪어본 최악은 몇 번이었나요?'",
            "병원 면접에서 지원자들이 제일 많이 떨어지는 단골 실수 3가지와 실제 합격하는 답변 한 줄 공식 → '면접 때 제일 떨렸던 질문은 뭐였나요?'",
        ],
    },
    "evening": {
        "category": "3교대 현실 공감 & 듀티 생존법",
        "default_tag": "교대근무",
        "tone": (
            "오후 5시 30분 데이 퇴근길 해방감이나 나이트 출근 전 공감대를 자극하는 글입니다. "
            "병동 동기와 단톡방에 공유하고 싶어지는 '3교대 수면 루틴, N-O-D 극복법, 번아웃 시그널, 병동 인간관계 처방전' 톤으로 작성하세요."
        ),
        "formats": [
            "나이트(N) 근무 전후 수면 패턴이 완전히 망가지는 행동 3가지와 생체리듬 살리는 현실 루틴 → '나이트 퇴근하고 바로 잔다(1) vs 버텼다 밤에 잔다(2) 어떻게 하세요?'",
            "죽음의 듀티(N-O-D, 5연속 이브닝 등) 걸렸을 때 멘탈과 체력 지키는 현직자 생존 치트키 4가지 → '듀티표에서 제일 싫은 조합은 뭔가요?'",
            "병동에서 오래 버티는 간호사들의 의외의 공통점 4가지 (인계 마인드셋, 오프 날 루틴, 감정 분리법) → '오프 날 집 밖으로 나온다(1) vs 침대와 한 몸 된다(2)?'",
        ],
    },
}

HOOK_FORMULAS = [
    "정체성 호명 + 결론 숨김: '<대상(예: 3년 차 이하 간호사 / 올해 공채 준비생 / 나이트 앞둔 간호사)>가 이거 모르면 무조건 손해 봅니다' 식으로 대상을 직접 부르고 첫 줄에서 호기심 유발",
    "숫자·팩트 폭격: '지금 원서 안 쓰면 후회하는 ~ 3곳', '이직할 때 3번 해당되면 연봉 더 줘도 도망쳐야 함'처럼 구체적 숫자로 시선 고정",
    "반직관 단언: 모두가 당연하게 믿는 통념(예: 무조건 큰 병원이 좋다 / 나이트 끝나고 바로 자야 한다)을 첫 문장에서 정면으로 뒤집기",
    "극단적 밸런스 대결: 첫 두 줄에 양극단 선택지 A vs B를 바로 던져 읽는 순간 머릿속으로 고르게 만들기",
    "공감 체크리스트: 임상/취준 일상에서 겪는 구체적 증상 3~4가지를 먼저 나열하고 원인과 해결책 제시",
]

VIRAL_STYLE_GUIDE = """[Threads 조회수 10만+ 바이럴 작법 절대 규칙]
■ 1. 구조 (도달·체류시간·댓글 극대화)
- 본문(posts[0]) 하나만 읽어도 완결된 재미와 핵심 정보가 다 들어 있어야 합니다. ("타래로 이어집니다 👇"만 써놓고 본문에 알맹이가 없으면 노출이 죽습니다.)
- 본문은 7~11줄, 전체 220~380자 내외. 첫 줄은 반드시 22자 이내의 강렬한 한 문장으로 시작해 스크롤을 멈추게 하세요.
- 답글(posts[1])은 선택 사항(0~1개)이며, 본문에서 다루지 못한 '실전 팁 1가지'나 '실제 채용 공고 팩트 요약(마감일·원문 확인 안내)'만 간결하게 덧붙입니다.
- 본문의 맨 마지막 줄은 반드시 '댓글을 부르는 선택형 질문'이어야 합니다: "솔직히 1번 vs 2번 어디 가실래요?", "여러분이 겪어본 최악은 몇 번인가요?"처럼 숫자나 A/B로 바로 답할 수 있게 물으세요.

■ 2. 모바일 줄바꿈 & 가독성 (가장 중요)
- 한 줄은 25자 안팎으로 짧게 끊고, 문장이 끝나면 무조건 줄을 바꿉니다.
- 번호 리스트는 반드시 2줄 구조를 지킵니다:
  1. 핵심 키워드 또는 병원명 (짧고 굵게)
  : 구체적인 이유나 현실 상황 1문장 설명
- 항목과 항목 사이, 문단과 문단 사이에는 빈 줄(\n\n)을 넣어 모바일에서 숨 막히지 않게 하세요.

■ 3. 어투 및 디테일
- 추상적인 말 대신 간호사만 아는 생생한 일상 장면(인계장, 프리셉터, N-O-D, 액팅, 나이트 퇴근 버스, 카톡 단톡방, 토익 성적표 등)을 넣으세요.
- 어투는 친한 선후배 간호사가 현실 조언을 해주듯 자연스러운 구어체(~함, ~거든요, ~임, ~해요 혼용)를 씁니다.
- 번역투나 AI스러운 상투적 표현("안녕하세요!", "함께 알아볼까요?", "~해보세요!")은 절대 금지합니다.
- 이모지는 글 전체에서 최대 2개까지만 절제해서 쓰고, 본문 안에 해시태그(#)나 외부 링크(http)는 절대 넣지 마세요 (알고리즘 도달 페널티 방지).

■ 4. 사실성(Fact-Safety) 절대 준수
- 만약 아래 [실시간 채용 공고 데이터]가 제공되어 특정 병원 공고를 언급할 때는, 제공된 병원명·마감일·D-day·고용형태만 정확히 인용하세요.
- 원문 데이터에 없는 연봉 액수, 정확한 모집 인원수, 특정 어학 점수를 특정 병원의 확정 사실인 것처럼 지어내지 마세요."""


class LLMThreadsDraft(BaseModel):
    topic_tag: str = Field(
        default="간호사",
        description="Threads 토픽 태그 1개 (# 기호나 공백·특수문자 없이 한글 단어만, 예: 간호사, 간호학과, 병원취업, 교대근무)",
    )
    hook_used: str = Field(..., description="사용한 후킹 공식 이름")
    posts: List[str] = Field(
        ...,
        description="타래 글 목록. posts[0]은 완결성 있는 본문(220~380자), posts[1]은 보충 답글(선택, 150~300자). 각 글 460자 이내, 해시태그/링크/홍보 금지.",
    )


class ViralThreadResult(BaseModel):
    slot: str
    category: str
    topic_tag: str
    hook_used: str
    posts: List[str]
    has_cta: bool = False
    referenced_job_ids: List[str] = Field(default_factory=list)


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


def build_weganda_cta() -> str:
    """하루 3번 중 단 1번만 타래 맨 끝에 붙이는 자연스러운 전환 답글."""
    handle = Config.INSTAGRAM_HANDLE or "@we_ganda"
    url_line = f"\n👉 {Config.APP_DOWNLOAD_URL}" if Config.APP_DOWNLOAD_URL else f"\n👉 인스타 {handle} 프로필 링크에서 바로 시작"
    variants = [
        (
            "병원 공채 D-day 알림부터 3교대 듀티표 공유,\n"
            "내 야간·교대 수당 계산까지 한 번에 끝내고 싶다면"
            f"{url_line} [우간다(weganda)]"
        ),
        (
            "죽음의 N-O-D 듀티 체크랑 병원 채용 일정 관리,\n"
            "동기들과 공유 캘린더는 여기서 무료로 쓸 수 있어요"
            f"{url_line} [우간다(weganda)]"
        ),
        (
            "간호사 교대근무 캘린더 + 실시간 채용 속보 모음은\n"
            "우간다(weganda) 앱에서 한눈에 볼 수 있어요"
            f"{url_line}"
        ),
    ]
    return random.choice(variants)


class ThreadsViralEngine:
    """
    간호사 3교대 맞춤 조회수 10만+ 바이럴 쓰레드 생성 엔진
    """

    def generate_for_slot(
        self,
        slot: str = "morning",
        jobs: Optional[List[RawJobPosting]] = None,
        recent_posts: Optional[List[str]] = None,
        with_cta: bool = False,
    ) -> ViralThreadResult:
        slot = slot if slot in SLOT_STRATEGIES else "morning"
        strategy = SLOT_STRATEGIES[slot]
        chosen_format = random.choice(strategy["formats"])
        chosen_hook = random.choice(HOOK_FORMULAS)
        jobs = jobs or []
        referenced_ids = [j.source_id for j in jobs[:3] if j.source_id]

        if Config.GEMINI_API_KEY and not Config.GEMINI_API_KEY.startswith("your_"):
            try:
                from google import genai

                client = genai.Client(api_key=Config.GEMINI_API_KEY)
                now_kst = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y년 %m월 %d일 (%a)")

                jobs_context = ""
                if jobs and slot == "morning":
                    lines = ["\n[실시간 채용 공고 데이터 (잡알리오/공식 수집)]"]
                    for idx, j in enumerate(jobs[:3], start=1):
                        lines.append(
                            f"{idx}. 병원명: {j.hospital_name} | 공고명: {j.title} | "
                            f"구분: {j.category}({j.hire_type}) | 마감: {j.deadline} ({j.d_day}) | 링크: {j.url or '공식 사이트 참조'}"
                        )
                    lines.append("※ 아침 슬롯이므로 위 실제 공고들을 소재로 활용하되, 딱딱한 공지가 아니라 위 바이럴 포맷과 후킹으로 재구성하세요.")
                    jobs_context = "\n".join(lines)

                recent_context = ""
                if recent_posts:
                    snippets = "\n---\n".join(p[:140] for p in recent_posts[:12])
                    recent_context = f"\n\n[최근 발행된 글 목록 — 아래 글들과 첫 줄 후킹/소재/질문이 절대 겹치지 않게 작성]\n{snippets}"

                prompt = f"""{VIRAL_STYLE_GUIDE}

[오늘 날짜]
{now_kst}

[발행 슬롯 및 타겟 상황]
- 슬롯: {SLOT_LABELS[slot]}
- 카테고리: {strategy['category']}
- 톤앤매너: {strategy['tone']}
- 이번 글 포맷 지침: {chosen_format}
- 이번 글 첫 줄 후킹 공식: {chosen_hook}
{jobs_context}
{recent_context}

위 지침을 완벽히 준수하여 조회수 10만 회 이상을 달성할 수 있는 Threads 타래(posts 1~2개)를 JSON으로 작성하세요."""

                for attempt in range(3):
                    response = client.models.generate_content(
                        model=Config.GEMINI_MODEL,
                        contents=prompt,
                        config={
                            "response_mime_type": "application/json",
                            "response_schema": LLMThreadsDraft,
                            "temperature": 0.9,
                        },
                    )
                    if response.text:
                        draft = LLMThreadsDraft.model_validate(json.loads(response.text))
                        cleaned_posts = [_trim_post(p) for p in draft.posts if p and p.strip()][:2]
                        if _is_well_formatted(cleaned_posts):
                            if with_cta:
                                cleaned_posts.append(build_weganda_cta())
                            return ViralThreadResult(
                                slot=slot,
                                category=strategy["category"],
                                topic_tag=_sanitize_tag(draft.topic_tag or strategy["default_tag"]),
                                hook_used=draft.hook_used,
                                posts=cleaned_posts,
                                has_cta=with_cta,
                                referenced_job_ids=referenced_ids if slot == "morning" else [],
                            )
            except Exception as e:
                print(f"[Threads 바이럴 엔진 안내] LLM 호출 예외 ({e}) -> 내장 고품질 바이럴 템플릿으로 전환합니다.")

        return self._fallback_for_slot(slot, jobs, with_cta, recent_posts or [])

    def _fallback_for_slot(
        self,
        slot: str,
        jobs: List[RawJobPosting],
        with_cta: bool,
        recent_posts: List[str],
    ) -> ViralThreadResult:
        strategy = SLOT_STRATEGIES.get(slot, SLOT_STRATEGIES["morning"])

        if slot == "morning" and jobs:
            top_jobs = jobs[:3]
            bullet_lines = []
            for idx, j in enumerate(top_jobs, start=1):
                bullet_lines.append(
                    f"{idx}. {j.hospital_name} ({j.d_day})\n"
                    f": {j.category} · 마감 {j.deadline}"
                )
            joined_bullets = "\n\n".join(bullet_lines)
            main_post = (
                "지금 원서 안 쓰면 놓치는 병원 채용 공고 요약\n\n"
                "빅5만 기다리다가 상·하반기 다 흘려보내는 분들 많은데\n"
                "공공병원·의료원 라인도 지금 접수 중인 곳 꽤 많습니다\n\n"
                f"{joined_bullets}\n\n"
                "솔직히 연봉 높은 상급종합(1) vs 정년 안정적인 공공병원(2)\n"
                "여러분은 어디가 더 끌리시나요?"
            )
            reply_lines = ["📌 오늘 기준 공식 공고 확인 포인트\n"]
            for j in top_jobs:
                url_note = f" ({j.url})" if j.url else ""
                reply_lines.append(f"• {j.hospital_name}: 마감 {j.deadline}{url_note}")
            reply_lines.append("\n지원 자격과 어학 기준은 반드시 각 병원 공식 채용 원문에서 대조해 보세요!")
            posts = [_trim_post(main_post), _trim_post("\n".join(reply_lines))]
            ref_ids = [j.source_id for j in top_jobs if j.source_id]
        elif slot == "morning":
            posts = [
                (
                    "간호사 첫 병원 고를 때 이거 안 보면 입사 후 무조건 후회함\n\n"
                    "초봉 숫자만 보고 지원했다가 6개월 만에 사직서 쓰는 이유 4가지입니다\n\n"
                    "1. 기숙사 1인실 여부 & 통근 시간\n"
                    ": 3교대에서 왕복 2시간 통근은 체력 절반을 길에 버리는 거임\n\n"
                    "2. 프리셉터 교육 기간\n"
                    ": 최소 6~8주 이상 체계적으로 잡아주는지 꼭 봐야 해요\n\n"
                    "3. 나이트 수당 & 실제 오버타임 분위기\n"
                    ": 기본급보다 수당 구조가 실수령액을 좌우합니다\n\n"
                    "4. 부서 이동 및 육아휴직 복귀율\n"
                    ": 3년 뒤 내 미래를 보여주는 제일 정확한 지표임\n\n"
                    "병원 고를 때 딱 하나만 본다면 몇 번이 1순위인가요?"
                )
            ]
            ref_ids = []
        elif slot == "afternoon":
            pool = [
                (
                    "간호사 이직할 때 무조건 걸러야 하는 병원 특징 4가지\n\n"
                    "3번에 해당되면 연봉 500 더 준다고 해도 다시 생각해야 합니다\n\n"
                    "1. 1년 365일 상시채용 공고가 안 내려감\n"
                    ": 들어오는 사람보다 나가는 사람이 더 많다는 확실한 신호임\n\n"
                    "2. 신규 트레이닝 기간이 2~3주밖에 안 됨\n"
                    ": 독립이 빠른 게 아니라 그냥 액팅에 던져놓는 거임\n\n"
                    "3. 듀티표에 N-O-D가 한 달 2~3번씩 기본으로 깔림\n"
                    ": 사람 생체리듬 갈아서 메꾸는 구조라 번아웃 금방 와요\n\n"
                    "4. 인계 시간이 기본 1시간을 훌쩍 넘김\n"
                    ": 업무 효율보다 감정 소모가 큰 곳일 확률이 높습니다\n\n"
                    "여러분이 겪어본 최악은 몇 번이었나요? (1~4번)"
                ),
                (
                    "간호사 평생 난제 밸런스 게임\n\n"
                    "솔직히 다시 입사한다면 어디 가실 건가요?\n\n"
                    "1. A병원 (초봉 5,200만 원)\n"
                    ": 이름 대면 다 아는 상급종합인데 오버타임 기본 1시간 + 통근 왕복 90분\n\n"
                    "2. B병원 (초봉 4,100만 원)\n"
                    ": 집 앞 걸어서 10분 거리 + 칼퇴 문화 + 1인 1실 신축 기숙사 제공\n\n"
                    "신규 때는 무조건 1번이 맞다 vs 오래 다니려면 2번이 승리자다\n"
                    "여러분이라면 1번 vs 2번 어디 선택하시나요?"
                ),
            ]
            chosen = pool[0]
            for cand in pool:
                if not any(cand[:30] in r for r in recent_posts):
                    chosen = cand
                    break
            posts = [_trim_post(chosen)]
            ref_ids = []
        else:
            pool = [
                (
                    "나이트 근무 끝나고 바로 통잠 자면 안 되는 이유\n\n"
                    "퇴근하자마자 암막커튼 치고 오후 4시까지 자버리면\n"
                    "그날 밤에 눈 말똥말똥해져서 다음 오프까지 다 날아갑니다\n\n"
                    "1. 퇴근 직후 리커버리 수면은 딱 3~4시간만\n"
                    ": 정오나 오후 1시쯤 일단 일어나서 햇빛을 잠깐이라도 봐야 함\n\n"
                    "2. 퇴근길에 무거운 탄수화물·배달음식 폭식 피하기\n"
                    ": 혈당 스파이크 치면 자고 일어나도 몸이 천근만근이에요\n\n"
                    "3. 밤 11시~12시에 본 수면 들어가기\n"
                    ": 이렇게 해야 다음 날 데이나 오프 생체리듬이 바로 돌아옵니다\n\n"
                    "나이트 퇴근하면 바로 푹 잔다(1) vs 조금만 자고 밤에 잔다(2)\n"
                    "다들 어떻게 버티고 계신가요?"
                ),
                (
                    "병동에서 멘탈 안 털리고 오래 버티는 사람들의 공통점\n\n"
                    "일 잘하는 것도 중요하지만 결국 롱런하는 건 마인드셋 차이더라고요\n\n"
                    "1. 퇴근하고 병원 문을 나서는 순간 병원 생각 끄기\n"
                    ": 집에 와서까지 인계 복기하면 잠도 못 자고 내일 더 실수함\n\n"
                    "2. 오프 날 중 하루는 무조건 병원 밖 일상 만들기\n"
                    ": 간호사 말고 '나 자신'으로 사는 시간이 있어야 안 무너져요\n\n"
                    "3. 실수했을 때 자책 대신 수첩에 한 줄만 적고 털어버리기\n"
                    ": 다음번에 안 틀리면 그게 성장인 거임\n\n"
                    "여러분은 퇴근 후 병원 생각 바로 꺼지시나요(1) 아니면 집에서도 생각나나요(2)?"
                ),
            ]
            chosen = pool[0]
            for cand in pool:
                if not any(cand[:30] in r for r in recent_posts):
                    chosen = cand
                    break
            posts = [_trim_post(chosen)]
            ref_ids = []

        if with_cta:
            posts.append(build_weganda_cta())

        return ViralThreadResult(
            slot=slot,
            category=strategy["category"],
            topic_tag=strategy["default_tag"],
            hook_used="fallback_viral_formula",
            posts=posts,
            has_cta=with_cta,
            referenced_job_ids=ref_ids,
        )

