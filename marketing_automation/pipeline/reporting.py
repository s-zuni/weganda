"""성과 집계: 주간 리포트 문구와 포맷·후킹 선택 가중치.

analytics 스킬 원칙: 비율 지표는 관측 창이 닫힌 게시물(발행 72시간 이후 'd3' 스냅샷)만 쓰고,
모든 수치는 행 단위 데이터에서 코드로 계산한다.
"""
import statistics
from typing import Callable, Dict, List, Mapping, Optional, Sequence, Tuple

from pipeline.content_pillars import PILLAR_TARGET_SHARE
from pipeline.optimizer import (
    EXPERIMENTS,
    MIN_OBS,
    engagement_rate,
    evaluate,
    performance_weights,
)

WINDOW = "d3"
LOOKBACK_DAYS = 28
REPORT_MAX_LEN = 3800  # 텔레그램 4000자 한도 여유
FALLBACK_PREFIX = "fallback"

Row = Mapping[str, object]


def score_for(channel: str, metrics: Mapping[str, float]) -> Optional[float]:
    """채널별 참여율. 분모(조회/도달)가 없으면 None."""
    if channel == "threads":
        return engagement_rate(metrics)
    if channel == "instagram":
        reach = float(metrics.get("reach") or 0)
        if reach <= 0:
            return None
        return (
            2.0 * (float(metrics.get("saved") or 0) + float(metrics.get("shares") or 0) + float(metrics.get("comments") or 0))
            + float(metrics.get("likes") or 0)
        ) / reach
    if channel == "community":
        views = float(metrics.get("views") or 0)
        if views <= 0:
            return None
        return (float(metrics.get("likes") or 0) + 2.0 * float(metrics.get("comments") or 0)) / views
    return None


def _scored(rows: Sequence[Row]) -> List[Tuple[Row, float]]:
    out: List[Tuple[Row, float]] = []
    for row in rows:
        metrics = row.get("metrics")
        if not isinstance(metrics, dict):
            continue
        score = score_for(str(row.get("channel", "")), metrics)
        if score is not None:
            out.append((row, score))
    return out


def _views(row: Row) -> float:
    metrics = row.get("metrics")
    return float(metrics.get("views") or 0) if isinstance(metrics, dict) else 0.0


def _group(scored: Sequence[Tuple[Row, float]], key: Callable[[Row], str]) -> Dict[str, List[float]]:
    groups: Dict[str, List[float]] = {}
    for row, score in scored:
        name = key(row)
        if name:
            groups.setdefault(name, []).append(score)
    return groups


def _lines(title: str, groups: Mapping[str, Sequence[float]], limit: int = 6) -> List[str]:
    if not groups:
        return []
    ranked = sorted(groups.items(), key=lambda kv: statistics.fmean(kv[1]), reverse=True)[:limit]
    lines = [title]
    for name, vals in ranked:
        note = "" if len(vals) >= MIN_OBS else " (표본 부족·참고용)"
        lines.append(f"  - {name}: {statistics.fmean(vals) * 100:.2f}% (n={len(vals)}){note}")
    return lines


def performance_weights_for(rows: Sequence[Row]) -> Tuple[Dict[str, float], Dict[str, float]]:
    """(포맷 가중치, 후킹 가중치). 폴백 글과 후킹 실험 대상 게시물은 제외한다(선택 효과를 오염시키므로)."""
    threads = [(r, s) for r, s in _scored(rows) if r.get("channel") == "threads"]
    format_samples = [
        (str(r["format_id"]), s) for r, s in threads
        if r.get("format_id") and not str(r["format_id"]).startswith(FALLBACK_PREFIX)
    ]
    hook_samples = [
        (str(r["hook_id"]), s) for r, s in threads
        if r.get("hook_id") and r["hook_id"] != FALLBACK_PREFIX and not r.get("experiment_id")
    ]
    return performance_weights(format_samples), performance_weights(hook_samples)


def build_weekly_report(
    rows: Sequence[Row],
    pending_count: int,
    experiments_enabled: bool = True,
) -> str:
    """rows: window='d3' 성과가 수집된 최근 게시물. pending_count: 72시간이 지났지만 성과가 아직 없는 게시물 수."""
    scored = _scored(rows)
    threads = [(r, s) for r, s in scored if r.get("channel") == "threads"]
    lines: List[str] = [f"📈 [weganda 주간 마케팅 리포트] 발행 72시간 경과분, 최근 {LOOKBACK_DAYS}일"]

    if pending_count:
        lines.append(f"⏳ 성과 집계 대기: {pending_count}건 (미포함)")

    if not threads:
        lines.append("\nThreads 성과 데이터가 아직 없습니다. 성과 수집(threads_manage_insights 권한)이 동작하는지 /status로 확인해 주세요.")
    else:
        values = [s for _, s in threads]
        views = [_views(r) for r, _ in threads]
        lines.append(
            f"\n🧵 Threads: {len(threads)}건 · 평균 조회 {statistics.fmean(views):,.0f} · "
            f"평균 참여율 {statistics.fmean(values) * 100:.2f}%"
        )
        lines += _lines("• 필러별", _group(threads, lambda r: str(r.get("pillar") or "")))
        lines += _lines("• 포맷별", _group(threads, lambda r: str(r.get("format_id") or "")))
        lines += _lines("• 후킹별", _group(threads, lambda r: str(r.get("hook_id") or "")))
        lines += _lines("• 슬롯별", _group(threads, lambda r: str(r.get("slot") or "")))
        lines += _lines("• CTA", _group(threads, lambda r: "CTA 포함" if r.get("has_cta") else "CTA 없음"))

        counts = _group(threads, lambda r: str(r.get("pillar") or ""))
        total = sum(len(v) for v in counts.values())
        if total:
            mix = ", ".join(
                f"{p} {len(counts.get(p, [])) / total * 100:.0f}%(목표 {t}%)" for p, t in PILLAR_TARGET_SHARE.items()
            )
            lines.append(f"• 필러 비중: {mix}")

    for channel, label in (("instagram", "📸 인스타 카드뉴스"), ("community", "🏥 앱 커뮤니티")):
        subset = [(r, s) for r, s in scored if r.get("channel") == channel]
        if subset:
            lines.append(f"\n{label}: {len(subset)}건 · 평균 참여율 {statistics.fmean(s for _, s in subset) * 100:.2f}%")

    if experiments_enabled:
        for spec in EXPERIMENTS:
            by_arm = _group(
                [(r, s) for r, s in threads if r.get("experiment_id") == spec.id],
                lambda r: str(r.get("arm") or ""),
            )
            verdict = evaluate(spec, by_arm)
            lines.append(f"\n🧪 실험 {spec.id}\n  가설: {spec.hypothesis}\n  결과: {verdict.message}")

    lines.append("\n※ 참여율 = (좋아요 + 2×답글·리포스트·인용) ÷ 조회수. 표본 3건 미만 항목은 참고용입니다.")
    text = "\n".join(lines)
    return text if len(text) <= REPORT_MAX_LEN else text[: REPORT_MAX_LEN - 1] + "…"
