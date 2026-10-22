"""성과 기반 가중치와 A/B 실험 평가 (순수 함수 — DB·네트워크 의존 없음).

ab-testing / analytics 스킬 원칙을 따른다:
  - 가설과 표본 크기를 사전에 확정하고, 표본이 차기 전에는 승자를 선언하지 않는다(peeking 금지).
  - 비율 지표는 관측 창이 닫힌(발행 후 72시간 경과) 게시물만 사용한다.
  - 소표본에서 우연한 변동에 휘둘리지 않도록 평균을 전체 평균 쪽으로 수축(shrinkage)시킨다.
"""
import random
import statistics
from dataclasses import dataclass
from typing import Dict, List, Mapping, Optional, Sequence, Tuple

MIN_OBS = 3            # 옵션별 최소 관측 수. 미만이면 가중치를 바꾸지 않는다.
PRIOR_N = 5            # 수축 강도(가상 관측 수)
WEIGHT_MIN = 0.5       # 성과가 낮아도 완전히 배제하지 않는다(탐색 유지)
WEIGHT_MAX = 2.0
BOOTSTRAP_ROUNDS = 2000
VALID_DIMENSIONS = ("hook", "format")


def engagement_rate(metrics: Mapping[str, float]) -> Optional[float]:
    """Threads 참여율 = (좋아요 + 2×(답글+리포스트+인용)) / 조회수. 조회수가 없으면 측정 불가(None)."""
    views = float(metrics.get("views") or 0)
    if views <= 0:
        return None
    interactions = (
        float(metrics.get("likes") or 0)
        + 2.0 * (float(metrics.get("replies") or 0) + float(metrics.get("reposts") or 0) + float(metrics.get("quotes") or 0))
    )
    return interactions / views


def shrunk_mean(values: Sequence[float], prior_mean: float, prior_n: int = PRIOR_N) -> float:
    return (sum(values) + prior_mean * prior_n) / (len(values) + prior_n)


def performance_weights(samples: Sequence[Tuple[str, float]]) -> Dict[str, float]:
    """(옵션 id, 점수) 표본으로부터 옵션별 선택 가중치(0.5~2.0)를 계산한다. 관측이 부족한 옵션은 포함하지 않는다."""
    if not samples:
        return {}
    overall = statistics.fmean(score for _, score in samples)
    if overall <= 0:
        return {}
    grouped: Dict[str, List[float]] = {}
    for option_id, score in samples:
        grouped.setdefault(option_id, []).append(score)
    weights: Dict[str, float] = {}
    for option_id, values in grouped.items():
        if len(values) < MIN_OBS:
            continue
        ratio = shrunk_mean(values, overall) / overall
        weights[option_id] = min(max(ratio, WEIGHT_MIN), WEIGHT_MAX)
    return weights


@dataclass(frozen=True)
class ExperimentSpec:
    id: str
    dimension: str                 # "hook" | "format"
    arms: Tuple[str, str]          # 정확히 두 팔 (A, B)
    hypothesis: str
    min_posts_per_arm: int = 12    # 사전 확정 표본. 이보다 적으면 판정하지 않는다.

    def __post_init__(self) -> None:
        if self.dimension not in VALID_DIMENSIONS:
            raise ValueError(f"dimension은 {VALID_DIMENSIONS} 중 하나여야 합니다: {self.dimension}")
        if len(self.arms) != 2 or self.arms[0] == self.arms[1]:
            raise ValueError("실험은 서로 다른 두 팔(A/B)로 구성해야 합니다.")
        if self.min_posts_per_arm < 5:
            raise ValueError("팔당 최소 표본은 5 이상이어야 합니다.")


# 진행 중인 실험. 한 차원(dimension)에는 동시에 하나만 둔다.
EXPERIMENTS: Tuple[ExperimentSpec, ...] = (
    ExperimentSpec(
        id="hook-contrarian-vs-checklist",
        dimension="hook",
        arms=("contrarian", "symptom_checklist"),
        hypothesis=(
            "통념을 뒤집는 반직관 단언 첫 줄이 구체적 장면을 나열하는 공감 체크리스트 첫 줄보다 "
            "Threads 참여율(좋아요+2×답글·리포스트·인용 / 조회수)이 높을 것이다."
        ),
        min_posts_per_arm=12,
    ),
)


def active_experiment(dimension: str, enabled: bool = True) -> Optional[ExperimentSpec]:
    if not enabled:
        return None
    return next((e for e in EXPERIMENTS if e.dimension == dimension), None)


def assign_arm(spec: ExperimentSpec, counts: Mapping[str, int], rng: Optional[random.Random] = None) -> str:
    """지금까지 표본이 더 적은 팔을 배정한다(균형 배정). 동률이면 무작위."""
    rng = rng or random.Random()
    a, b = spec.arms
    ca, cb = counts.get(a, 0), counts.get(b, 0)
    if ca == cb:
        return rng.choice(spec.arms)
    return a if ca < cb else b


@dataclass(frozen=True)
class ExperimentVerdict:
    status: str                    # insufficient | no_difference | winner_a | winner_b
    n_a: int
    n_b: int
    mean_a: Optional[float]
    mean_b: Optional[float]
    ci_low: Optional[float]
    ci_high: Optional[float]
    message: str


def evaluate(
    spec: ExperimentSpec,
    scores_by_arm: Mapping[str, Sequence[float]],
    rounds: int = BOOTSTRAP_ROUNDS,
    seed: int = 7,
) -> ExperimentVerdict:
    """표본이 사전 확정치에 도달했을 때만 B-A 평균 차이의 95% 부트스트랩 구간으로 판정한다."""
    a_vals = list(scores_by_arm.get(spec.arms[0], ()))
    b_vals = list(scores_by_arm.get(spec.arms[1], ()))
    mean_a = statistics.fmean(a_vals) if a_vals else None
    mean_b = statistics.fmean(b_vals) if b_vals else None
    need = spec.min_posts_per_arm

    if len(a_vals) < need or len(b_vals) < need:
        return ExperimentVerdict(
            "insufficient", len(a_vals), len(b_vals), mean_a, mean_b, None, None,
            f"표본 부족: {spec.arms[0]} {len(a_vals)}/{need}, {spec.arms[1]} {len(b_vals)}/{need} — 판정 보류",
        )

    rng = random.Random(seed)
    diffs = sorted(
        statistics.fmean(rng.choices(b_vals, k=len(b_vals))) - statistics.fmean(rng.choices(a_vals, k=len(a_vals)))
        for _ in range(rounds)
    )
    low = diffs[int(rounds * 0.025)]
    high = diffs[min(int(rounds * 0.975), rounds - 1)]
    if low > 0:
        status, text = "winner_b", f"{spec.arms[1]} 우세"
    elif high < 0:
        status, text = "winner_a", f"{spec.arms[0]} 우세"
    else:
        status, text = "no_difference", "유의한 차이 없음"
    return ExperimentVerdict(
        status, len(a_vals), len(b_vals), mean_a, mean_b, low, high,
        f"{text} (차이 95% 구간 {low:+.4f} ~ {high:+.4f})",
    )
