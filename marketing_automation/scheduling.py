"""KST 스케줄 정의. APScheduler 경로와 메인 루프(백업) 경로가 같은 표를 쓰므로 어느 쪽이 실행해도 결과가 같다.

중복 방지: 발행 작업(일일 발행·쓰레드 슬롯)은 내부에서 DB claim을 하고, 유지보수 작업은 claim_once=True로
하루 1회 claim을 먼저 얻는다. 따라서 두 스케줄러가 동시에 동작해도 한 번만 실행된다.
"""
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Callable, Dict, List, Optional, Tuple

from config import Config, redact_secrets
from pipeline.threads_viral_engine import THREADS_SLOTS

PUBLISH_GRACE_MIN = 30      # 발행 작업: 정시를 놓쳐도 이 시간 안에 프로세스가 살아나면 따라잡는다
MAINTENANCE_GRACE_MIN = 90  # 유지보수 작업(수집·점검·갱신·리포트)
MONDAY = 0


@dataclass(frozen=True)
class ScheduledItem:
    name: str
    hour: int
    minute: int
    run: Callable[[], None]
    weekday: Optional[int] = None  # 0=월요일, None=매일
    grace_min: int = PUBLISH_GRACE_MIN
    claim_once: bool = False       # True면 실행 전에 '하루 1회' claim을 얻어야 실행한다


def parse_hhmm(time_str: str, default: Tuple[int, int]) -> Tuple[int, int]:
    try:
        h, m = map(int, time_str.strip().split(":"))
        if 0 <= h <= 23 and 0 <= m <= 59:
            return h, m
    except Exception:
        pass
    return default


def configured_slots() -> Dict[str, Tuple[int, int]]:
    return {
        "morning": parse_hhmm(Config.THREADS_MORNING_KST, THREADS_SLOTS["morning"]),
        "afternoon": parse_hhmm(Config.THREADS_AFTERNOON_KST, THREADS_SLOTS["afternoon"]),
        "evening": parse_hhmm(Config.THREADS_EVENING_KST, THREADS_SLOTS["evening"]),
    }


def build_schedule(bot) -> List[ScheduledItem]:
    """발행 4건 + 유지보수 4건. 실패 재시도(15분 간격)는 주기 작업이라 이 표에 넣지 않는다."""
    daily_h, daily_m = parse_hhmm(Config.SCHEDULE_TIME_KST, (8, 30))
    items = [ScheduledItem("daily_dispatch", daily_h, daily_m, bot.run_daily_dispatch)]
    for slot, (h, m) in configured_slots().items():
        items.append(ScheduledItem(f"threads_{slot}", h, m, lambda s=slot: bot.run_scheduled_threads_slot(s)))
    items += [
        ScheduledItem("collect_insights", 3, 30, bot.analytics.collect,
                      grace_min=MAINTENANCE_GRACE_MIN, claim_once=True),
        ScheduledItem("threads_token_refresh", 4, 0, bot.refresh_threads_token, weekday=MONDAY,
                      grace_min=MAINTENANCE_GRACE_MIN, claim_once=True),
        ScheduledItem("instagram_health", 4, 10, bot.check_instagram_health,
                      grace_min=MAINTENANCE_GRACE_MIN, claim_once=True),
        ScheduledItem("weekly_report", 9, 0, bot.analytics.send_scheduled_report, weekday=MONDAY,
                      grace_min=MAINTENANCE_GRACE_MIN, claim_once=True),
    ]
    return items


def with_grace(items: List[ScheduledItem], publish_min: int, maintenance_min: int) -> List[ScheduledItem]:
    """유예 시간을 늘린 사본을 반환한다. GitHub Actions cron은 수 분~수십 분 늦게 시작할 수 있어서,
    상시 데몬(30분/90분)보다 넉넉한 유예가 필요하다. 이미 처리된 작업은 DB claim이 막으므로 늘려도 중복 실행되지 않는다."""
    return [
        replace(i, grace_min=max(i.grace_min, maintenance_min if i.claim_once else publish_min))
        for i in items
    ]


def is_due(item: ScheduledItem, now: datetime) -> bool:
    """now가 예정 시각 이후 grace_min 이내이면 True (요일 제한 포함)."""
    if item.weekday is not None and now.weekday() != item.weekday:
        return False
    elapsed = (now.hour * 60 + now.minute) - (item.hour * 60 + item.minute)
    return 0 <= elapsed < item.grace_min


def execute(item: ScheduledItem, storage, now: datetime) -> bool:
    """작업을 실행한다. 예외는 삼켜서 스케줄러 루프를 보호한다. 실제로 실행했으면 True."""
    if item.claim_once and not storage.claim_once(f"task:{item.name}:{now.strftime('%Y-%m-%d')}"):
        return False
    try:
        item.run()
    except Exception as e:
        print(f"[스케줄러] {item.name} 실행 오류: {type(e).__name__}: {redact_secrets(e)}")
    return True
