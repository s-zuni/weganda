"""성과 수집·주간 리포트·콘텐츠 선택을 묶은 서비스.

모든 메서드는 실패해도 예외를 밖으로 내보내지 않는다. 측정은 보조 기능이라
어떤 오류도 발행 파이프라인을 막아서는 안 되기 때문이다.
"""
import time
from datetime import datetime
from typing import Callable
from zoneinfo import ZoneInfo

from bot.storage import Storage
from config import Config, redact_secrets
from pipeline.insights import FetchResult
from pipeline.optimizer import active_experiment
from pipeline.reporting import (
    LOOKBACK_DAYS,
    WINDOW,
    build_weekly_report,
    performance_weights_for,
)
from pipeline.threads_viral_engine import SlotChoice, make_choice

MAX_TARGETS_PER_RUN = 30
DAY = 86400


class AnalyticsService:
    def __init__(
        self,
        storage: Storage,
        get_threads_pub: Callable[[], object],
        instagram_pub: object,
        community_pub: object,
        notify: Callable[[str], None],
        clock: Callable[[], float] = time.time,
    ):
        self.storage = storage
        self._get_threads_pub = get_threads_pub  # 토큰 갱신으로 퍼블리셔가 교체될 수 있어 호출 시점에 가져온다
        self.instagram_pub = instagram_pub
        self.community_pub = community_pub
        self.notify = notify
        self.clock = clock

    # ------------------------------------------------------------------ 콘텐츠 선택
    def choose_for_slot(self, slot: str, has_jobs: bool) -> SlotChoice:
        """최근 이력·성과 가중치·진행 중 실험을 반영해 포맷/후킹을 고른다. 집계 오류 시 이력 없이 무작위로 고른다."""
        try:
            now = int(self.clock())
            recent = self.storage.recent_content_meta("threads", limit=30)
            rows = self.storage.posts_with_metrics(WINDOW, now - LOOKBACK_DAYS * DAY, channel="threads")
            format_weights, hook_weights = performance_weights_for(rows)
            experiment = active_experiment("hook", Config.EXPERIMENTS_ENABLED)
            counts = self.storage.experiment_counts(experiment.id, slot) if experiment else None
            return make_choice(
                slot, has_jobs,
                recent_meta=recent,
                format_weights=format_weights,
                hook_weights=hook_weights,
                experiment=experiment,
                experiment_counts=counts,
            )
        except Exception as e:
            print(f"[분석 서비스] 선택 정보 집계 실패 → 이력 없이 선택: {type(e).__name__}: {redact_secrets(e)}")
            return make_choice(slot, has_jobs)

    # ------------------------------------------------------------------ 성과 수집
    def _fetch(self, channel: str, external_id: str) -> FetchResult:
        if channel == "threads":
            return self._get_threads_pub().fetch_insights(external_id)
        if channel == "instagram":
            return self.instagram_pub.fetch_insights(external_id)
        if channel == "community":
            return self.community_pub.fetch_stats(external_id)
        return FetchResult(False, error=f"알 수 없는 채널: {channel}")

    def _alert_once_per_day(self, channel: str, error: str) -> None:
        today = datetime.fromtimestamp(self.clock(), ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        key = f"insights_alert:{channel}:{today}"
        if self.storage.get_setting(key):
            return
        self.storage.set_setting(key, "1")
        self.notify(f"⚠️ [성과 수집] {channel} 수집 불가 — 권한/토큰 확인 필요:\n{error}")

    def collect(self) -> int:
        """발행 24h/72h가 지난 게시물의 성과 스냅샷을 저장한다. 저장한 건수를 반환한다."""
        if not Config.INSIGHTS_ENABLED:
            return 0
        saved = 0
        blocked = set()
        try:
            targets = self.storage.metric_targets(int(self.clock()), limit=MAX_TARGETS_PER_RUN)
        except Exception as e:
            print(f"[성과 수집] 대상 조회 실패: {type(e).__name__}: {redact_secrets(e)}")
            return 0

        for target in targets:
            channel = target["channel"]
            if channel in blocked:
                continue
            try:
                result = self._fetch(channel, target["external_id"])
                if result.ok:
                    self.storage.save_metrics(target["post_key"], target["window"], result.metrics, int(self.clock()))
                    saved += 1
                    continue
            except Exception as e:  # 한 게시물의 실패가 나머지 수집을 막지 않도록 격리한다
                print(f"[성과 수집] {target['post_key']} 예외: {type(e).__name__}: {redact_secrets(e)}")
                continue
            print(f"[성과 수집] {target['post_key']} 실패: {result.error}")
            if result.fatal:
                blocked.add(channel)
                self._alert_once_per_day(channel, result.error)
        if targets:
            print(f"[성과 수집] 대상 {len(targets)}건 중 {saved}건 저장")
        return saved

    # ------------------------------------------------------------------ 리포트
    def weekly_report_text(self) -> str:
        now = int(self.clock())
        rows = self.storage.posts_with_metrics(WINDOW, now - LOOKBACK_DAYS * DAY)
        pending = self.storage.count_posts_missing_metrics(WINDOW, now)
        return build_weekly_report(rows, pending, Config.EXPERIMENTS_ENABLED)

    def send_weekly_report(self) -> None:
        """수동(/report) 발송. 매번 보낸다."""
        try:
            self.notify(self.weekly_report_text())
        except Exception as e:
            print(f"[주간 리포트] 생성 실패: {type(e).__name__}: {redact_secrets(e)}")

    def send_scheduled_report(self) -> None:
        """스케줄러 발송. APScheduler와 백업 루프가 동시에 호출해도 ISO 주차당 한 번만 보낸다."""
        year, week, _ = datetime.fromtimestamp(self.clock(), ZoneInfo(Config.TIMEZONE)).isocalendar()
        if self.storage.claim_once(f"weekly_report:{year}-W{week:02d}"):
            self.send_weekly_report()
