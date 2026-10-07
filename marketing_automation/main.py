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
from config import Config
from bot.telegram_bot import TelegramApprovalBot
from crawlers.hospital_crawler import HospitalCrawler
from pipeline.content_planner import ContentPlanner
from pipeline.card_renderer import CardRenderer


def run_status_check():
    """보안 환경설정 상태 점검"""
    Config.print_status()
    Config.validate_essential()


def run_test_pipeline():
    """크롤링 -> 기획 -> 카드뉴스 렌더링 파이프라인 1회 로컬 테스트"""
    print("\n🔍 [1/3] 채용 공고 수집 중...")
    crawler = HospitalCrawler()
    # 로컬 렌더링 테스트는 발행이 없으므로 Mock 공고를 명시적으로 허용
    jobs = crawler.fetch_latest_jobs(limit=1, use_mock_if_needed=True)
    if not jobs:
        print("공고를 찾을 수 없습니다.")
        return
    job = jobs[0]
    print(f"✅ 수집 완료: [{job.hospital_name}] {job.title}")

    print("\n✍️ [2/3] Gemini 옴니채널 콘텐츠 기획 중...")
    planner = ContentPlanner()
    package = planner.plan_job_package(job)
    print(f"✅ 기획 완료:\n• 카드뉴스 슬라이드: {len(package.carousel.slides)}장\n• 쓰레드 타래: {len(package.threads.posts)}개\n• 커뮤니티 제목: {package.community.title}")

    print("\n🎨 [3/3] 1080x1350 카드뉴스 렌더링 중...")
    renderer = CardRenderer()
    session_id = f"test_{int(time.time())}"
    rendered_images = renderer.render_carousel(package.carousel, session_id)
    print(f"🎉 렌더링 성공! 생성된 이미지 파일 목록 ({len(rendered_images)}장):")
    for img in rendered_images:
        print(f"  - {img}")


def run_test_crawl():
    """잡알리오 실수집 결과만 확인 (발행·AI 호출 없음)"""
    crawler = HospitalCrawler()
    jobs = crawler.fetch_latest_jobs(limit=20)
    print(f"\n추천 후보 {len(jobs)}건 (정규직 우선 · 마감 임박 순, 마감 D-{Config.JOB_MIN_DDAY} 이상)")
    for j in jobs:
        print(f"- [{j.d_day}] {j.hospital_name} | {j.title[:44]} | {j.hire_type}")


def run_bot_daemon():
    """텔레그램 봇 데몬 및 KST 정기 스케줄러 실행"""
    Config.validate_essential()
    bot = TelegramApprovalBot()
    target_hour, target_minute = map(int, Config.SCHEDULE_TIME_KST.split(":"))

    print(f"\n🚀 weganda 마케팅 자동화 봇이 가동되었습니다.")
    print(f"• 스케줄: 매일 KST {Config.SCHEDULE_TIME_KST}")
    print(f"• 관리자 ID: {Config.TELEGRAM_ADMIN_CHAT_ID} (화이트리스트 보호 중)")
    print("종료하려면 Ctrl+C를 누르세요.\n")

    while True:
        try:
            # 1. 텔레그램 버튼 콜백 수신
            bot.poll_updates_once()

            # 2. 정기 스케줄 검사 (KST 기준)
            now = datetime.now(ZoneInfo(Config.TIMEZONE))
            today_str = now.strftime("%Y-%m-%d")

            if now.hour == target_hour and now.minute == target_minute:
                if not bot.storage.has_dispatched_today(today_str):
                    print(f"[{now.strftime('%H:%M:%S')}] KST 정기 브리핑 발송 시작!")
                    bot.send_morning_briefing()
                    bot.storage.record_dispatch(today_str)

            time.sleep(1.0)
        except KeyboardInterrupt:
            print("\n봇 프로세스를 안전하게 종료합니다.")
            break
        except Exception as e:
            print(f"[루프 오류] {e}")
            time.sleep(2.0)


def main():
    parser = argparse.ArgumentParser(description="weganda 마케팅 자동화 CLI")
    parser.add_argument("--status", action="store_true", help="보안 설정 및 환경 점검")
    parser.add_argument("--test-plan", action="store_true", help="크롤링 및 카드뉴스 렌더링 1회 테스트")
    parser.add_argument("--test-crawl", action="store_true", help="잡알리오 실수집 결과 확인 (발행 없음)")
    parser.add_argument("--bot", action="store_true", help="텔레그램 상시 승인 봇 및 스케줄러 실행")
    parser.add_argument("--trigger-briefing", action="store_true", help="관리자에게 즉시 아침 브리핑 발송")

    args = parser.parse_args()

    if args.status:
        run_status_check()
    elif args.test_crawl:
        run_test_crawl()
    elif args.test_plan:
        run_test_pipeline()
    elif args.trigger_briefing:
        bot = TelegramApprovalBot()
        bot.send_morning_briefing()
    elif args.bot:
        run_bot_daemon()
    else:
        # 인자 없을 시 도움말 및 상태 안내
        parser.print_help()
        print("\n")
        run_status_check()


if __name__ == "__main__":
    main()
