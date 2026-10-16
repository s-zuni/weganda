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
from typing import Tuple
from zoneinfo import ZoneInfo

from config import Config
from bot.telegram_bot import TelegramApprovalBot
from crawlers.hospital_crawler import HospitalCrawler
from pipeline.content_planner import ContentPlanner
from pipeline.card_renderer import CardRenderer
from pipeline.threads_viral_engine import SLOT_LABELS, THREADS_SLOTS, ThreadsViralEngine


def _parse_hhmm(time_str: str, default: Tuple[int, int]) -> Tuple[int, int]:
    try:
        h, m = map(int, time_str.strip().split(":"))
        if 0 <= h <= 23 and 0 <= m <= 59:
            return h, m
    except Exception:
        pass
    return default


def get_configured_slots() -> dict:
    return {
        "morning": _parse_hhmm(Config.THREADS_MORNING_KST, THREADS_SLOTS["morning"]),
        "afternoon": _parse_hhmm(Config.THREADS_AFTERNOON_KST, THREADS_SLOTS["afternoon"]),
        "evening": _parse_hhmm(Config.THREADS_EVENING_KST, THREADS_SLOTS["evening"]),
    }


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
    """쓰레드 10만 뷰 바이럴 타래 슬롯별 생성 테스트 (실제 게시 없음)"""
    crawler = HospitalCrawler()
    jobs = crawler.fetch_latest_jobs(limit=3, use_mock_if_needed=True)
    engine = ThreadsViralEngine()

    target_slots = ["morning", "afternoon", "evening"] if slot_arg == "all" else [slot_arg]
    for idx, slot in enumerate(target_slots):
        with_cta = slot == "evening"
        res = engine.generate_for_slot(slot=slot, jobs=jobs if slot == "morning" else [], with_cta=with_cta)
        print("\n" + "=" * 65)
        print(f"🧵 [{SLOT_LABELS.get(slot, slot)}] 바이럴 타래 미리보기")
        print(f"• 카테고리: {res.category} | 토픽 태그: #{res.topic_tag} | CTA 포함: {res.has_cta}")
        print(f"• 적용된 후킹 공식: {res.hook_used}")
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
    """APScheduler를 사용하여 KST 기준 하루 4회(쓰레드 3회 + 인스타/커뮤니티 1회) 정밀 스케줄링 가동"""
    tz = ZoneInfo(Config.TIMEZONE)
    daily_h, daily_m = _parse_hhmm(Config.SCHEDULE_TIME_KST, (8, 30))
    slots = get_configured_slots()

    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = BackgroundScheduler(timezone=tz)

        # 1) 매일 08:30 KST — 인스타그램 카드뉴스(6장) + weganda 앱 커뮤니티 자동 발행
        def _daily_card_and_community_job():
            today_str = datetime.now(tz).strftime("%Y-%m-%d")
            if bot.storage.claim_daily_dispatch(today_str):
                print(f"[스케줄러] {Config.SCHEDULE_TIME_KST} KST 인스타 카드뉴스 + 앱 커뮤니티 자동 발행 트리거!")
                bot.send_morning_briefing()
                bot.storage.record_dispatch(today_str, "COMPLETED")

        scheduler.add_job(
            _daily_card_and_community_job,
            CronTrigger(hour=daily_h, minute=daily_m, timezone=tz),
            id="daily_card_and_community",
            replace_existing=True,
            misfire_grace_time=900,
            coalesce=True,
        )

        # 2) 매일 06:30 / 12:30 / 17:30 KST — 쓰레드(Threads) 조회수 10만+ 바이럴 타래 자동 발행
        for slot_name, (sh, sm) in slots.items():
            scheduler.add_job(
                bot.run_scheduled_threads_slot,
                CronTrigger(hour=sh, minute=sm, timezone=tz),
                args=[slot_name],
                id=f"threads_slot_{slot_name}",
                replace_existing=True,
                misfire_grace_time=900,
                coalesce=True,
            )

        # 3) 매주 월요일 04:00 KST — Threads 장기 토큰(60일) 자동 갱신
        scheduler.add_job(
            bot.refresh_threads_token,
            CronTrigger(day_of_week="mon", hour=4, minute=0, timezone=tz),
            id="refresh_threads_token",
            replace_existing=True,
            misfire_grace_time=3600,
            coalesce=True,
        )

        scheduler.start()
        print("[APScheduler] ✅ 정밀 KST 크론 스케줄러 가동 완료")
        return scheduler
    except Exception as e:
        print(f"[스케줄러 안내] APScheduler 미사용 ({e}) -> 내장 메인 루프 스케줄러로 안전하게 동작합니다.")
        return None


def run_bot_daemon():
    """텔레그램 봇 데몬 및 KST 정기 스케줄러(06:30 / 08:30 / 12:30 / 17:30) 실행"""
    Config.validate_essential()
    bot = TelegramApprovalBot()
    tz = ZoneInfo(Config.TIMEZONE)
    daily_h, daily_m = _parse_hhmm(Config.SCHEDULE_TIME_KST, (8, 30))
    slots = get_configured_slots()

    start_apscheduler(bot)

    print(f"\n🚀 weganda 마케팅 전자동 시스템이 가동되었습니다.")
    print(f"• 🧵 Threads 3슬롯 (무인 자동 발행: {Config.THREADS_AUTO_POST}):")
    print(f"   - 아침 슬롯: 매일 {slots['morning'][0]:02d}:{slots['morning'][1]:02d} KST (채용·커리어 팩트 큐레이션)")
    print(f"   - 점심 슬롯: 매일 {slots['afternoon'][0]:02d}:{slots['afternoon'][1]:02d} KST (밸런스 게임 & 면접·임상 족보)")
    print(f"   - 오후 슬롯: 매일 {slots['evening'][0]:02d}:{slots['evening'][1]:02d} KST (3교대 폭풍 공감 + 앱 CTA)")
    print(f"• 📸 인스타 카드뉴스 + 🏥 앱 커뮤니티 (무인 자동 발행: {Config.DAILY_AUTO_PUBLISH}):")
    print(f"   - 매일 {daily_h:02d}:{daily_m:02d} KST")
    print(f"• 🔒 관리자 ID: {Config.TELEGRAM_ADMIN_CHAT_ID} (화이트리스트 보호 중)")
    print("종료하려면 Ctrl+C를 누르세요.\n")

    while True:
        try:
            # 1. 텔레그램 메시지/버튼 콜백 수신
            bot.poll_updates_once()

            # 2. 메인 루프 백업 스케줄 검사 (SQLite 원자적 claim으로 APScheduler와 중복 실행 절대 없음)
            now = datetime.now(tz)
            today_str = now.strftime("%Y-%m-%d")

            if (now.hour, now.minute) == (daily_h, daily_m):
                if bot.storage.claim_daily_dispatch(today_str):
                    print(f"[{now.strftime('%H:%M:%S')}] {Config.SCHEDULE_TIME_KST} KST 인스타+커뮤니티 자동 발행 시작!")
                    bot.send_morning_briefing()
                    bot.storage.record_dispatch(today_str, "COMPLETED")

            for slot_name, (sh, sm) in slots.items():
                if (now.hour, now.minute) == (sh, sm):
                    bot.run_scheduled_threads_slot(slot_name)

            time.sleep(1.0)
        except KeyboardInterrupt:
            print("\n봇 프로세스를 안전하게 종료합니다.")
            break
        except Exception as e:
            print(f"[루프 오류] {e}")
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
        help="쓰레드 10만 뷰 바이럴 타래 슬롯별 생성 테스트 (발행 없음)",
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
