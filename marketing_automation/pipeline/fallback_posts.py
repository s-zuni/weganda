"""LLM 호출이 실패했을 때 쓰는 내장 Threads 글.

모든 글은 품질 게이트(`quality_gate.check_posts`)를 통과해야 한다: 지어낸 금액·최상급 표현·의료 단정 금지.
(`tests`가 아닌 운영 데이터이므로 문구를 바꿀 때는 게이트 통과 여부를 함께 확인할 것.)
"""
import random
from typing import List, Optional, Sequence

from crawlers.models import RawJobPosting

MORNING_NO_JOBS: Sequence[str] = (
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
    ),
)

AFTERNOON: Sequence[str] = (
    (
        "간호사 이직할 때 무조건 걸러야 하는 병원 특징 4가지\n\n"
        "3번에 해당되면 연봉을 더 준다고 해도 다시 생각해야 합니다\n\n"
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
        "1. A병원 (초봉 높음)\n"
        ": 이름 대면 다 아는 상급종합인데 오버타임 기본 1시간 + 통근 왕복 90분\n\n"
        "2. B병원 (초봉은 평범)\n"
        ": 집 앞 걸어서 10분 거리 + 칼퇴 문화 + 1인 1실 신축 기숙사 제공\n\n"
        "신규 때는 무조건 1번이 맞다 vs 오래 다니려면 2번이 승리자다\n"
        "여러분이라면 1번 vs 2번 어디 선택하시나요?"
    ),
)

EVENING: Sequence[str] = (
    (
        "나이트 근무 끝나고 바로 통잠 자면 안 되는 이유\n\n"
        "퇴근하자마자 암막커튼 치고 오후 4시까지 자버리면\n"
        "그날 밤에 눈 말똥말똥해져서 다음 오프까지 다 날아갑니다\n\n"
        "1. 퇴근 직후 리커버리 수면은 딱 3~4시간만\n"
        ": 정오나 오후 1시쯤 일단 일어나서 햇빛을 잠깐이라도 봐야 함\n\n"
        "2. 퇴근길에 무거운 배달음식 폭식 피하기\n"
        ": 속이 더부룩하면 자고 일어나도 몸이 천근만근이에요\n\n"
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
)

_POOLS = {"afternoon": AFTERNOON, "evening": EVENING}


def morning_with_jobs(jobs: Sequence[RawJobPosting]) -> List[str]:
    """실제 공고 3건 이내를 정리한 [본문, 확인 포인트 답글]. 공고 원문에 있는 값만 인용한다."""
    top = list(jobs)[:3]
    bullets = "\n\n".join(
        f"{idx}. {j.hospital_name} ({j.d_day})\n: {j.category} · 마감 {j.deadline}"
        for idx, j in enumerate(top, start=1)
    )
    main = (
        "지금 원서 안 쓰면 놓치는 병원 채용 공고 요약\n\n"
        "빅5만 기다리다가 상·하반기 다 흘려보내는 분들 많은데\n"
        "공공병원·의료원 라인도 지금 접수 중인 곳 꽤 많습니다\n\n"
        f"{bullets}\n\n"
        "솔직히 연봉 높은 상급종합(1) vs 정년 안정적인 공공병원(2)\n"
        "여러분은 어디가 더 끌리시나요?"
    )
    reply_lines = ["📌 오늘 기준 공식 공고 확인 포인트\n"]
    for j in top:
        url_note = f" ({j.url})" if j.url else ""
        reply_lines.append(f"• {j.hospital_name}: 마감 {j.deadline}{url_note}")
    reply_lines.append("\n지원 자격과 어학 기준은 반드시 각 병원 공식 채용 원문에서 대조하세요.")
    return [main, "\n".join(reply_lines)]


def pick_fallback(
    slot: str,
    recent_posts: Sequence[str] = (),
    rng: Optional[random.Random] = None,
) -> str:
    """슬롯별 내장 글 중 최근에 발행하지 않은 것을 고른다. 모두 최근에 썼다면 무작위로 고른다."""
    rng = rng or random.Random()
    pool = _POOLS.get(slot, MORNING_NO_JOBS)
    recent_firsts = [r.split("\n", 1)[0] for r in recent_posts if r]
    fresh = [p for p in pool if p.split("\n", 1)[0] not in recent_firsts]
    return rng.choice(fresh or list(pool))
