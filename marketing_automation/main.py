import argparse
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from datetime import datetime
from zoneinfo import ZoneInfo

from config import Config, redact_secrets
from bot.telegram_bot import TelegramApprovalBot
from crawlers.hospital_crawler import HospitalCrawler
from pipeline.content_planner import ContentPlanner
from pipeline.card_renderer import CardRenderer
from pipeline.threads_viral_engine import SLOT_LABELS, ThreadsViralEngine
from scheduling import build_schedule, configured_slots, execute, is_due, parse_hhmm

RETRY_INTERVAL_MIN = 15  # 실패한 발행을 다시 시도하는 간격(분)


def run_status_check():
    """보안 환경설정 상태 점검"""
    Config.print_status()
    Config.validate_essential()


def run_test_pipeline():
    """크롤링 -> 기획 -> 카드뉴스 렌더링 파이프라인 1회 로컬 테스트"""
    print("\n🔍 [1/3] 채용 공고 수집 중...")
    crawler = HospitalCrawler()
    jobs = crawler.fetch_latest_jobs(limit=1, use_mock_if_needed=True)
    if not jobs:
        print("공고를 찾을 수 없습니다.")
        return
    job = jobs[0]
    print(f"✅ 수집 완료: [{job.hospital_name}] {job.title}")

    print("\n✍️ [2/3] Gemini 옴니채널 콘텐츠 기획 중...")
    planner = ContentPlanner()
    package = planner.plan_job_package(job)
    print(
        f"✅ 기획 완료:\n"
        f"• 카드뉴스 슬라이드: {len(package.carousel.slides)}장\n"
        f"• 쓰레드 타래: {len(package.threads.posts)}개\n"
        f"• 커뮤니티 제목: {package.community.title}"
    )

    print("\n🎨 [3/3] 1080x1350 카드뉴스 렌더링 중...")
    renderer = CardRenderer()
    session_id = f"test_{int(time.time())}"
    rendered_images = renderer.render_carousel(package.carousel, session_id)
    print(f"🎉 렌더링 성공! 생성된 이미지 파일 목록 ({len(rendered_images)}장):")
    for img in rendered_images:
        print(f"  - {img}")


def run_test_threads(slot_arg: str = "all"):
    """쓰레드 바이럴 타래 슬롯별 생성 테스트 (실제 게시 없음)"""
    crawler = HospitalCrawler()
    jobs = crawler.fetch_latest_jobs(limit=3, use_mock_if_needed=True)
    engine = ThreadsViralEngine()

    target_slots = ["morning", "afternoon", "evening"] if slot_arg == "all" else [slot_arg]
    for slot in target_slots:
        with_cta = slot == "evening"
        res = engine.generate_for_slot(slot=slot, jobs=jobs if slot == "morning" else [], with_cta=with_cta)
        print("\n" + "=" * 65)
        print(f"🧵 [{SLOT_LABELS.get(slot, slot)}] 바이럴 타래 미리보기")
        print(f"• 카테고리: {res.category} | 토픽 태그: #{res.topic_tag} | CTA 포함: {res.has_cta}")
        print(f"• 필러: {res.pillar} | 포맷: {res.format_id} | 후킹: {res.hook_used}")
        if res.needs_review:
            print(f"• ⚠️ 품질 게이트: 사람 확인 필요 {res.review_reasons}")
        print("=" * 65)
        for p_idx, post in enumerate(res.posts):
            label = "본문 (Post 1)" if p_idx == 0 else f"답글 {p_idx}"
            print(f"\n--- [{label}] ({len(post)}자) ---\n{post}")


def run_test_crawl():
    """잡알리오 실수집 결과만 확인 (발행·AI 호출 없음)"""
    crawler = HospitalCrawler()
    jobs = crawler.fetch_latest_jobs(limit=20)
    print(f"\n추천 후보 {len(jobs)}건 (정규직 우선 · 마감 임박 순, 마감 D-{Config.JOB_MIN_DDAY} 이상)")
    for j in jobs:
        print(f"- [{j.d_day}] {j.hospital_name} | {j.title[:44]} | {j.hire_type}")


def start_apscheduler(bot: TelegramApprovalBot):
    """APScheduler가 설치돼 있으면 정시 크론으로 실행한다. 없으면 None을 반환하고 메인 루프가 같은 표를 처리한다."""
    tz = ZoneInfo(Config.TIMEZONE)
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger
        from apscheduler.triggers.interval import IntervalTrigger
    except ImportError as e:
        print(f"[스케줄러 안내] APScheduler 미설치 ({e}) -> 내장 메인 루프 스케줄러로 동작합니다.")
        return None

    try:
        scheduler = BackgroundScheduler(timezone=tz)
        for item in build_schedule(bot):
            scheduler.add_job(
                lambda it=item: execute(it, bot.storage, datetime.now(tz)),
                CronTrigger(
                    day_of_week=item.weekday if item.weekday is not None else "*",
                    hour=item.hour,
                    minute=item.minute,
                    timezone=tz,
                ),
                id=item.name,
                replace_existing=True,
                misfire_grace_time=item.grace_min * 60,
                coalesce=True,
            )
        scheduler.add_job(
            bot.retry_failed_jobs,
            IntervalTrigger(minutes=RETRY_INTERVAL_MIN, timezone=tz),
            id="retry_failed_jobs",
            replace_existing=True,
            misfire_grace_time=300,
            coalesce=True,
        )
        scheduler.start()
        print("[APScheduler] ✅ 정밀 KST 크론 스케줄러 가동 완료")
        return scheduler
    except Exception as e:
        print(f"[스케줄러 안내] APScheduler 시작 실패 ({type(e).__name__}: {e}) -> 내장 메인 루프 스케줄러로 동작합니다.")
        return None


def process_tick(storage, schedule, now: datetime, fired: set) -> None:
    """예정 시각이 지났고 아직 처리하지 않은 항목을 실행한다. fired는 (날짜, 작업명) 집합으로 같은 프로세스 안의 재호출을 막는다."""
    today_str = now.strftime("%Y-%m-%d")
    for item in schedule:
        key = (today_str, item.name)
        if key not in fired and is_due(item, now):
            fired.add(key)
            execute(item, storage, now)


def run_bot_daemon():
    """텔레그램 봇 데몬 + KST 스케줄러 실행. 메인 루프는 APScheduler 유무와 상관없이 같은 표를 따라잡기 방식으로 처리한다."""
    Config.validate_essential()
    bot = TelegramApprovalBot()
    tz = ZoneInfo(Config.TIMEZONE)
    schedule = build_schedule(bot)
    slots = configured_slots()
    daily_h, daily_m = parse_hhmm(Config.SCHEDULE_TIME_KST, (8, 30))

    start_apscheduler(bot)

    print("\n🚀 weganda 마케팅 전자동 시스템이 가동되었습니다.")
    print(f"• 🧵 Threads 3슬롯 (무인 자동 발행: {Config.THREADS_AUTO_POST}):")
    print(f"   - 아침 슬롯: 매일 {slots['morning'][0]:02d}:{slots['morning'][1]:02d} KST (채용·커리어 팩트 큐레이션)")
    print(f"   - 점심 슬롯: 매일 {slots['afternoon'][0]:02d}:{slots['afternoon'][1]:02d} KST (밸런스 게임 & 면접·임상 족보)")
    print(f"   - 오후 슬롯: 매일 {slots['evening'][0]:02d}:{slots['evening'][1]:02d} KST (3교대 공감 + 앱 CTA)")
    print(f"• 📸 인스타 카드뉴스 + 🏥 앱 커뮤니티 (무인 자동 발행: {Config.DAILY_AUTO_PUBLISH}): 매일 {daily_h:02d}:{daily_m:02d} KST")
    print(f"• 📈 성과 수집 03:30 · 토큰 점검 04:00/04:10 · 주간 리포트 월 09:00 (성과 수집: {Config.INSIGHTS_ENABLED})")
    print(f"• 🔒 관리자 ID: {Config.TELEGRAM_ADMIN_CHAT_ID} (화이트리스트 보호 중)")
    print("종료하려면 Ctrl+C를 누르세요.\n")

    fired: set = set()  # (날짜, 작업명): 같은 프로세스에서 매초 재호출되지 않도록 기록
    last_retry_minute = -1

    while True:
        try:
            # 1. 텔레그램 메시지/버튼 콜백 수신
            bot.poll_updates_once()

            # 2. 스케줄 표 처리. 실제 중복 방지는 DB claim이 담당하므로 APScheduler와 겹쳐도 한 번만 실행된다.
            now = datetime.now(tz)
            today_str = now.strftime("%Y-%m-%d")
            process_tick(bot.storage, schedule, now, fired)

            # 3. 실패한 발행 재시도 (RETRY_INTERVAL_MIN 간격의 특정 분에 한 번)
            if now.minute % RETRY_INTERVAL_MIN == 7:
                if now.minute != last_retry_minute:
                    last_retry_minute = now.minute
                    bot.retry_failed_jobs()
            else:
                last_retry_minute = -1

            if len(fired) > 40:  # 지난 날짜 기록 정리
                fired = {k for k in fired if k[0] == today_str}

            time.sleep(1.0)
        except KeyboardInterrupt:
            print("\n봇 프로세스를 안전하게 종료합니다.")
            break
        except Exception as e:
            print(f"[루프 오류] {type(e).__name__}: {redact_secrets(e)}")
            time.sleep(2.0)


def main():
    parser = argparse.ArgumentParser(description="weganda 마케팅 전자동 시스템 CLI")
    parser.add_argument("--status", action="store_true", help="보안 설정 및 스케줄 상태 점검")
    parser.add_argument("--test-plan", action="store_true", help="크롤링 및 카드뉴스 렌더링 1회 테스트")
    parser.add_argument("--test-crawl", action="store_true", help="잡알리오 실수집 결과 확인 (발행 없음)")
    parser.add_argument(
        "--test-threads",
        nargs="?",
        const="all",
        choices=["all", "morning", "afternoon", "evening"],
        help="쓰레드 바이럴 타래 슬롯별 생성 테스트 (발행 없음)",
    )
    parser.add_argument(
        "--publish-threads",
        choices=["morning", "afternoon", "evening"],
        help="지정한 슬롯의 바이럴 쓰레드를 지금 즉시 생성 및 실제 발행",
    )
    parser.add_argument("--bot", action="store_true", help="24시간 무인 자동화 스케줄러 및 텔레그램 봇 실행")
    parser.add_argument("--trigger-briefing", action="store_true", help="지금 즉시 인스타 카드뉴스+앱 커뮤니티 자동 발행 실행")

    args = parser.parse_args()

    if args.status:
        run_status_check()
    elif args.test_crawl:
        run_test_crawl()
    elif args.test_plan:
        run_test_pipeline()
    elif args.test_threads:
        run_test_threads(args.test_threads)
    elif args.publish_threads:
        bot = TelegramApprovalBot()
        bot.run_scheduled_threads_slot(slot=args.publish_threads, force=True)
    elif args.trigger_briefing:
        bot = TelegramApprovalBot()
        bot.send_morning_briefing()
    elif args.bot:
        run_bot_daemon()
    else:
        parser.print_help()
        print("\n")
        run_status_check()


if __name__ == "__main__":
    main()
