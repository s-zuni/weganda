import json
import random
import re
import sqlite3
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

import requests

from config import Config
from security.auth_guard import is_authorized_user
from crawlers.hospital_crawler import HospitalCrawler
from crawlers.models import RawJobPosting
from pipeline.content_planner import ContentPlanner, ContentPackage
from pipeline.card_renderer import CardRenderer
from pipeline.job_extractor import ExtractionError, JobExtractor, find_urls
from pipeline.media_host import MediaHost, MediaUploadError
from pipeline.threads_viral_engine import (
    SLOT_LABELS,
    THREADS_SLOTS,
    ThreadsViralEngine,
    ViralThreadResult,
)
from pipeline.publishers.community_publisher import CommunityPublisher
from pipeline.publishers.instagram_publisher import InstagramPublisher
from pipeline.publishers.threads_publisher import ThreadsPublisher

DB_PATH = Config.DATA_DIR / "state.db"

PLAN_ID_RE = re.compile(r"^job_\d+$")
THREAD_DRAFT_RE = re.compile(r"^thr_\d+$")
ALLOWED_ACTIONS = {"pub_all", "pub_ig_app", "pub_sns", "pub_app", "skip"}
TELEGRAM_MAX_LEN = 4000
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 제보 이미지/PDF 최대 크기
MIN_PASTED_TEXT = 40  # URL/파일 없이 붙여넣은 텍스트의 최소 길이

HELP_TEXT = (
    "🤖 weganda 마케팅 전자동 봇 (관리자 전용)\n\n"
    "⏰ 자동 스케줄 (승인 없이 무인 자동 발행)\n"
    f"• {Config.THREADS_MORNING_KST} KST — 🧵 쓰레드 아침 바이럴 (채용·커리어 팩트)\n"
    f"• {Config.SCHEDULE_TIME_KST} KST — 📸 인스타 카드뉴스 + 🏥 앱 커뮤니티 동시 발행\n"
    f"• {Config.THREADS_AFTERNOON_KST} KST — 🧵 쓰레드 점심 바이럴 (밸런스 게임·족보)\n"
    f"• {Config.THREADS_EVENING_KST} KST — 🧵 쓰레드 오후 바이럴 (3교대 공감 + CTA)\n\n"
    "📮 수동 공고 제보 방법\n"
    "• 공고 URL / 캡처 이미지 / PDF / 본문 텍스트를 채팅방에 보내면 기획안을 만듭니다\n\n"
    "🛠 명령어\n"
    "/briefing — 지금 즉시 채용 카드뉴스+커뮤니티 발행(또는 기획안 받기)\n"
    "/threads [morning|afternoon|evening] — 지금 즉시 10만 뷰 바이럴 쓰레드 생성·발행\n"
    "/status — 현재 자동화 설정 및 오늘 발행 현황 확인\n"
    "/help — 이 도움말"
)


class Storage:
    """SQLite 기반의 안전한 상태 영속화 엔진"""

    def __init__(self):
        self.conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        self._lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self._lock, self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS pending_proposals (
                    id TEXT PRIMARY KEY,
                    package_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS dispatch_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date_str TEXT UNIQUE,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS posted_jobs (
                    source_id TEXT PRIMARY KEY,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS publish_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date_str TEXT,
                    plan_id TEXT,
                    channel TEXT,
                    status TEXT,
                    detail TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS threads_slot_logs (
                    slot_key TEXT PRIMARY KEY,
                    date_str TEXT,
                    slot TEXT,
                    status TEXT,
                    permalink TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS bot_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            """)

    # ------------------------------------------------------------------ 범용 설정 K/V
    def set_setting(self, key: str, value: str):
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO bot_settings (key, value) VALUES (?, ?)",
                (key, value),
            )

    def get_setting(self, key: str, default: str = "") -> str:
        with self._lock:
            cur = self.conn.cursor()
            cur.execute("SELECT value FROM bot_settings WHERE key = ?", (key,))
            row = cur.fetchone()
            return row[0] if row else default

    def del_setting(self, key: str):
        with self._lock, self.conn:
            self.conn.execute("DELETE FROM bot_settings WHERE key = ?", (key,))

    # ------------------------------------------------------------------ 쓰레드 슬롯 & 최근 글 관리
    def claim_threads_slot(self, date_str: str, slot: str) -> bool:
        """
        하루 3회(morning/afternoon/evening) 슬롯의 중복 실행을 원자적으로 방지합니다.
        이미 오늘 해당 슬롯이 실행되었으면 False를 반환합니다.
        """
        slot_key = f"{date_str}:{slot}"
        with self._lock, self.conn:
            cur = self.conn.execute(
                "INSERT OR IGNORE INTO threads_slot_logs (slot_key, date_str, slot, status, permalink) VALUES (?, ?, ?, 'RUNNING', '')",
                (slot_key, date_str, slot),
            )
            return cur.rowcount == 1

    def update_threads_slot(self, date_str: str, slot: str, status: str, permalink: str = ""):
        slot_key = f"{date_str}:{slot}"
        with self._lock, self.conn:
            self.conn.execute(
                "UPDATE threads_slot_logs SET status = ?, permalink = ? WHERE slot_key = ?",
                (status, permalink, slot_key),
            )

    def get_today_threads_slots(self, date_str: str) -> Dict[str, str]:
        with self._lock:
            cur = self.conn.cursor()
            cur.execute("SELECT slot, status FROM threads_slot_logs WHERE date_str = ?", (date_str,))
            return {row[0]: row[1] for row in cur.fetchall()}

    def get_recent_threads_posts(self) -> List[str]:
        raw = self.get_setting("threads_recent_posts", "[]")
        try:
            data = json.loads(raw)
            return data if isinstance(data, list) else []
        except ValueError:
            return []

    def remember_threads_post(self, main_post: str):
        if not main_post:
            return
        recent = [main_post] + [p for p in self.get_recent_threads_posts() if p != main_post]
        self.set_setting("threads_recent_posts", json.dumps(recent[:15], ensure_ascii=False))

    def pick_daily_cta_slot(self, date_str: str) -> str:
        """하루 3개 쓰레드 슬롯 중 단 1개에만 CTA 답글이 붙도록 고정 (기본: evening 우선 또는 당일 고정)."""
        key = f"threads_cta_slot:{date_str}"
        slot = self.get_setting(key)
        if slot not in THREADS_SLOTS:
            # 퇴근길/출근전(evening 17:30) 슬롯에 70% 가중치, 점심(afternoon 12:30)에 30% 가중치
            slot = random.choices(["evening", "afternoon"], weights=[70, 30], k=1)[0]
            self.set_setting(key, slot)
        return slot

    # ------------------------------------------------------------------ 채용 공고/패키지 관리
    def mark_job(self, source_id: str, status: str):
        """발행/건너뜀 처리된 공고 기록 — 같은 공고를 다시 추천하지 않기 위함"""
        if not source_id:
            return
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO posted_jobs (source_id, status) VALUES (?, ?)", (source_id, status)
            )

    def handled_job_ids(self) -> set:
        with self._lock:
            cur = self.conn.cursor()
            cur.execute("SELECT source_id FROM posted_jobs")
            return {row[0] for row in cur.fetchall()}

    def save_pending(self, plan_id: str, pkg: ContentPackage):
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO pending_proposals (id, package_json) VALUES (?, ?)",
                (plan_id, pkg.model_dump_json()),
            )

    def claim_pending(self, plan_id: str) -> Optional[ContentPackage]:
        """기획안을 원자적으로 꺼내며 삭제한다 (중복 클릭 방어)."""
        with self._lock, self.conn:
            cur = self.conn.execute("SELECT package_json FROM pending_proposals WHERE id = ?", (plan_id,))
            row = cur.fetchone()
            if not row:
                return None
            deleted = self.conn.execute("DELETE FROM pending_proposals WHERE id = ?", (plan_id,)).rowcount
            if deleted != 1:
                return None
        return ContentPackage.model_validate_json(row[0])

    def delete_pending(self, plan_id: str):
        with self._lock, self.conn:
            self.conn.execute("DELETE FROM pending_proposals WHERE id = ?", (plan_id,))

    def claim_daily_dispatch(self, date_str: str) -> bool:
        """08:30 일일 카드뉴스+커뮤니티 자동 발행의 중복 실행을 원자적으로 방지합니다."""
        with self._lock, self.conn:
            cur = self.conn.execute(
                "INSERT OR IGNORE INTO dispatch_logs (date_str, status) VALUES (?, 'RUNNING')",
                (date_str,),
            )
            return cur.rowcount == 1

    def has_dispatched_today(self, date_str: str) -> bool:
        with self._lock:
            cur = self.conn.cursor()
            cur.execute("SELECT id FROM dispatch_logs WHERE date_str = ?", (date_str,))
            return cur.fetchone() is not None

    def record_dispatch(self, date_str: str, status: str = "COMPLETED"):
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO dispatch_logs (date_str, status) VALUES (?, ?)",
                (date_str, status),
            )

    def record_publish(self, date_str: str, plan_id: str, channel: str, status: str, detail: str = ""):
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT INTO publish_logs (date_str, plan_id, channel, status, detail) VALUES (?, ?, ?, ?, ?)",
                (date_str, plan_id, channel, status, detail[:500]),
            )

    def count_published_today(self, date_str: str) -> int:
        """오늘 한 채널이라도 성공한 '채용 기획안(job_*)' 수 (일일 발행 한도 판단용)"""
        with self._lock:
            cur = self.conn.cursor()
            cur.execute(
                "SELECT COUNT(DISTINCT plan_id) FROM publish_logs WHERE date_str = ? AND status = 'success' AND plan_id LIKE 'job_%'",
                (date_str,),
            )
            return cur.fetchone()[0]


class TelegramApprovalBot:
    """
    보안 강화 텔레그램 마케팅 자동화 & 승인 워커:
    - 쓰레드 하루 3회(06:30 / 12:30 / 17:30 KST) 조회수 10만+ 바이럴 타래 무인 자동 발행
    - 매일 아침 08:30 KST 인스타그램 카드뉴스(6장) + weganda 앱 커뮤니티 무인 자동 발행
    - 관리자 화이트리스트 검증 및 수동 URL/이미지/텍스트 공고 제보 지원
    """

    def __init__(self):
        self.token = Config.TELEGRAM_BOT_TOKEN
        self.admin_id = Config.TELEGRAM_ADMIN_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.token}"
        self.storage = Storage()
        self.crawler = HospitalCrawler()
        self.planner = ContentPlanner()
        self.renderer = CardRenderer()
        self.extractor = JobExtractor()
        self.media_host = MediaHost()
        self.viral_engine = ThreadsViralEngine()
        self.community_pub = CommunityPublisher()
        self.instagram_pub = InstagramPublisher()
        saved_thr_token = self.storage.get_setting("threads_refreshed_token")
        self.threads_pub = ThreadsPublisher(access_token=saved_thr_token or None)
        self.last_update_id = 0
        self._publish_lock = threading.Lock()

    # ------------------------------------------------------------------ 텔레그램 I/O
    def _token_ready(self) -> bool:
        return bool(self.token) and not self.token.startswith("your_")

    def send_message(self, chat_id: int, text: str, reply_markup: Optional[Dict[str, Any]] = None):
        text = text[:TELEGRAM_MAX_LEN]
        if not self._token_ready():
            print(f"[텔레그램 가상 발송] Chat ID: {chat_id}\n{text}\nMarkup: {reply_markup}")
            return
        payload: Dict[str, Any] = {"chat_id": chat_id, "text": text}
        if reply_markup:
            payload["reply_markup"] = json.dumps(reply_markup)
        try:
            requests.post(f"{self.base_url}/sendMessage", json=payload, timeout=10)
        except requests.RequestException as e:
            print(f"[텔레그램 발송 오류] {e}")

    def send_photo(self, chat_id: int, photo_path: str, caption: str = ""):
        if not self._token_ready():
            print(f"[텔레그램 가상 사진 발송] {photo_path}")
            return
        try:
            with open(photo_path, "rb") as f:
                requests.post(
                    f"{self.base_url}/sendPhoto",
                    data={"chat_id": chat_id, "caption": caption[:1000]},
                    files={"photo": f},
                    timeout=30,
                )
        except (OSError, requests.RequestException) as e:
            print(f"[텔레그램 사진 발송 오류] {e}")

    def _answer_callback(self, query_id: Optional[str], text: str = "", alert: bool = False):
        if not (self._token_ready() and query_id):
            return
        try:
            requests.post(
                f"{self.base_url}/answerCallbackQuery",
                json={"callback_query_id": query_id, "text": text[:200], "show_alert": alert},
                timeout=5,
            )
        except requests.RequestException:
            pass

    # ------------------------------------------------------------------ 1. 쓰레드 하루 3회(06:30 / 12:30 / 17:30) 무인 자동 발행
    def run_scheduled_threads_slot(self, slot: str = "morning", force: bool = False):
        """
        지정된 슬롯(morning 06:30 / afternoon 12:30 / evening 17:30 KST)에
        조회수 10만+ 타겟 바이럴 타래를 생성하여 승인 없이 즉시 Threads에 자동 게시합니다.
        """
        today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        if not force and not self.storage.claim_threads_slot(today, slot):
            print(f"[Threads 스케줄러] 오늘({today}) '{slot}' 슬롯은 이미 처리되었습니다.")
            return

        label = SLOT_LABELS.get(slot, slot)
        print(f"[Threads 스케줄러] {label} 바이럴 타래 생성 시작...")

        jobs: List[RawJobPosting] = []
        if slot == "morning":
            try:
                jobs = self.crawler.fetch_latest_jobs(limit=3, exclude_ids=self.storage.handled_job_ids())
            except Exception as e:
                print(f"[Threads 스케줄러] 아침 공고 조회 경고: {e}")

        with_cta = slot == self.storage.pick_daily_cta_slot(today)
        recent = self.storage.get_recent_threads_posts()

        try:
            viral_res = self.viral_engine.generate_for_slot(
                slot=slot,
                jobs=jobs,
                recent_posts=recent,
                with_cta=with_cta,
            )
        except Exception as e:
            self.storage.update_threads_slot(today, slot, "FAILED")
            self.send_message(self.admin_id, f"❌ [Threads {label}] 글 생성 실패: {e}")
            return

        preview_block = "\n\n".join(
            f"[{'본문' if i == 0 else f'답글 {i}'} ({len(p)}자)]\n{p}"
            for i, p in enumerate(viral_res.posts)
        )

        # DRY_RUN 모드일 때는 실제 게시 없이 텔레그램으로 전문 미리보기 전송
        if Config.DRY_RUN:
            self.storage.update_threads_slot(today, slot, "DRY_RUN")
            self.send_message(
                self.admin_id,
                f"🧪 [DRY_RUN · Threads 자동 슬롯 미리보기]\n"
                f"슬롯: {label}\n"
                f"토픽 태그: #{viral_res.topic_tag} | CTA 포함: {'예' if viral_res.has_cta else '아니오'}\n\n"
                f"{preview_block}",
            )
            return

        # THREADS_AUTO_POST=false로 설정한 경우에만 수동 승인 버튼 발송 (기본값은 true로 무인 즉시 게시)
        if not Config.THREADS_AUTO_POST:
            draft_id = f"thr_{int(time.time() * 1000)}"
            self.storage.set_setting(f"thread_draft:{draft_id}", viral_res.model_dump_json())
            markup = {
                "inline_keyboard": [
                    [{"text": "🧵 이대로 Threads 게시", "callback_data": f"thr_pub:{draft_id}"}],
                    [{"text": "❌ 건너뛰기", "callback_data": f"thr_skip:{draft_id}"}],
                ]
            }
            self.send_message(
                self.admin_id,
                f"🧵 [Threads {label} 초안]\n토픽: #{viral_res.topic_tag}\n\n{preview_block}",
                reply_markup=markup,
            )
            return

        # 승인 없이 즉시 무인 게시
        self._publish_viral_thread(today, slot, viral_res)

    def _publish_viral_thread(self, today: str, slot: str, viral_res: ViralThreadResult):
        label = SLOT_LABELS.get(slot, slot)
        res = self.threads_pub.publish_thread_chain(viral_res.posts, topic_tag=viral_res.topic_tag)
        if not res.get("success") and "[190/" in str(res.get("error", "")):
            # DB 저장 갱신 토큰 만료 시 .env 원본 토큰으로 1회 복구 시도
            self.storage.del_setting("threads_refreshed_token")
            self.threads_pub = ThreadsPublisher(access_token=Config.THREADS_ACCESS_TOKEN)
            res = self.threads_pub.publish_thread_chain(viral_res.posts, topic_tag=viral_res.topic_tag)

        if res.get("success"):
            permalink = res.get("permalink") or (res.get("thread_ids") or [""])[0]
            self.storage.remember_threads_post(viral_res.posts[0])
            self.storage.update_threads_slot(today, slot, "PUBLISHED", permalink=permalink)
            self.storage.record_publish(today, f"thr_{slot}_{int(time.time())}", "threads", "success", permalink)
            cta_badge = " · 🎯CTA포함" if viral_res.has_cta else ""
            self.send_message(
                self.admin_id,
                f"✅ [Threads 무인 자동 게시 완료]\n"
                f"• 슬롯: {label}\n"
                f"• 카테고리: {viral_res.category} (#{viral_res.topic_tag}{cta_badge})\n"
                f"• 링크: {permalink or '(게시 완료)'}\n\n"
                f"📝 본문 첫 줄:\n{viral_res.posts[0].splitlines()[0]}",
            )
        else:
            err = str(res.get("error", "알 수 없는 오류"))
            self.storage.update_threads_slot(today, slot, "FAILED", permalink=err[:200])
            self.send_message(
                self.admin_id,
                f"❌ [Threads 무인 자동 게시 실패]\n• 슬롯: {label}\n• 사유: {err}",
            )

    def refresh_threads_token(self):
        """매주 월요일 새벽 04:00 KST에 Threads 장기 토큰(60일)을 자동 연장합니다."""
        if not self.threads_pub.is_configured():
            return
        out = self.threads_pub.refresh_long_lived_token()
        if out.get("access_token"):
            self.storage.set_setting("threads_refreshed_token", out["access_token"])
            print("[Threads 토큰] 장기 액세스 토큰(60일) 자동 연장 완료.")
        elif out.get("error"):
            print(f"[Threads 토큰 경고] 자동 연장 실패: {out['error']}")
            self.send_message(self.admin_id, f"⚠️ Threads 장기 토큰 자동 갱신 실패:\n{out['error']}")

    # ------------------------------------------------------------------ 2. 아침 08:30 인스타 카드뉴스 + 앱 커뮤니티 자동 발행
    def send_morning_briefing(self, force_manual: bool = False):
        """
        매일 아침 08:30 KST 채용공고 큐레이션.
        - Config.DAILY_AUTO_PUBLISH=True(기본값)이면 승인 대기 없이 즉시 인스타그램 카드뉴스 + 앱 커뮤니티에 자동 발행합니다.
        - force_manual=True 이거나 DAILY_AUTO_PUBLISH=False 이면 승인 버튼 카드를 발송합니다.
        """
        print("[텔레그램 봇] 오늘자 간호사 공채 추천 공고 수집 시작...")
        jobs = self.crawler.fetch_latest_jobs(limit=1, exclude_ids=self.storage.handled_job_ids())
        if not jobs:
            self.send_message(
                self.admin_id,
                "ℹ️ 오늘 자동 수집된 신규 간호사 공고가 없습니다.\n"
                "사립/대학병원 공고는 URL·캡처 이미지·본문 텍스트를 채팅방에 보내주시면 즉시 발행됩니다.",
            )
            return

        job = jobs[0]
        origin = "🤖 잡알리오 자동 수집" if job.source == "alio" else "🤖 자동 수집"

        if Config.DAILY_AUTO_PUBLISH and not force_manual:
            self._auto_publish_job(job, origin=origin)
        else:
            self._propose(job, origin=origin)

    def _auto_publish_job(self, job: RawJobPosting, origin: str = ""):
        """승인 버튼 없이 즉시 인스타 카드뉴스(6장) + weganda 앱 커뮤니티에 무인 발행합니다."""
        with self._publish_lock:
            today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
            package = self.planner.plan_job_package(job)
            plan_id = f"job_{int(time.time() * 1000)}"

            self.send_message(
                self.admin_id,
                f"🚀 [08:30 무인 자동 발행 시작]\n"
                f"{origin}\n"
                f"🏥 {job.hospital_name} — {job.title} ({job.d_day})\n"
                f"인스타그램 카드뉴스(6장) 및 weganda 앱 커뮤니티에 자동 등록을 진행합니다...",
            )

            # 쓰레드(Threads)는 06:30 / 12:30 / 17:30 전용 스케줄러가 담당하므로,
            # 08:30 채용 패키지는 인스타그램 카드뉴스 + 앱 커뮤니티(pub_ig_app)를 동시 자동 발행
            if Config.DRY_RUN:
                self._run_dry(package, plan_id, "pub_ig_app")
            else:
                self._run_publish(package, plan_id, "pub_ig_app", today)

    def _propose(self, job: RawJobPosting, origin: str = ""):
        """공고 → 3채널 기획안 생성 → 승인 요청 메시지 (수동 제보 / 수동 브리핑 경로)"""
        package = self.planner.plan_job_package(job)
        plan_id = f"job_{int(time.time() * 1000)}"
        self.storage.save_pending(plan_id, package)

        mode = "🧪 DRY_RUN (실제 발행 안 함, 미리보기만)" if Config.DRY_RUN else "🔴 실발행 모드"
        origin_line = f"{origin}\n" if origin else ""
        text = (
            f"📢 [weganda 채용 속보 기획안]\n"
            f"{origin_line}"
            f"모드: {mode}\n\n"
            f"🏥 {job.hospital_name}\n"
            f"📋 {job.title}\n"
            f"🗓 마감: {job.deadline} ({job.d_day}) · {job.category}\n"
            f"🔗 원문: {job.url or '(링크 없음)'}\n\n"
            "🎨 준비된 에셋:\n"
            f"• 인스타그램 카드뉴스 ({len(package.carousel.slides)}장)\n"
            f"• 쓰레드 속보 타래 ({len(package.threads.posts)}단)\n"
            "• 앱 커뮤니티 [채용/취업 정보] 공식 게시글\n\n"
            "원하시는 발행 옵션을 선택해 주세요:"
        )
        reply_markup = {
            "inline_keyboard": [
                [{"text": "📸 인스타 카드뉴스 + 🏥 앱 커뮤니티 발행", "callback_data": f"pub_ig_app:{plan_id}"}],
                [{"text": "🚀 3개 채널 전면 발행 (인스타+쓰레드+앱)", "callback_data": f"pub_all:{plan_id}"}],
                [{"text": "📱 SNS만 발행 (인스타+쓰레드)", "callback_data": f"pub_sns:{plan_id}"}],
                [{"text": "🏥 앱 커뮤니티에만 등록", "callback_data": f"pub_app:{plan_id}"}],
                [{"text": "❌ 이 공고 건너뛰기", "callback_data": f"skip:{plan_id}"}],
            ]
        }
        self.send_message(self.admin_id, text, reply_markup=reply_markup)
        print("[텔레그램 봇] 관리자에게 승인 대기 메시지를 성공적으로 발송했습니다.")

    # ------------------------------------------------------------------ 3. 제보 (URL / 이미지 / 텍스트) 및 명령어
    def _download_file(self, file_id: str, declared_size: int = 0) -> Optional[Tuple[bytes, str]]:
        """텔레그램 파일 다운로드. (바이트, mime) 또는 None"""
        if declared_size and declared_size > MAX_UPLOAD_BYTES:
            return None
        info = requests.get(f"{self.base_url}/getFile", params={"file_id": file_id}, timeout=15).json()
        result = info.get("result") or {}
        path = result.get("file_path")
        if not path or (result.get("file_size") or 0) > MAX_UPLOAD_BYTES:
            return None
        res = requests.get(f"https://api.telegram.org/file/bot{self.token}/{path}", timeout=60)
        if not res.ok or len(res.content) > MAX_UPLOAD_BYTES:
            return None
        ext = path.rsplit(".", 1)[-1].lower()
        mime = {
            "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
            "webp": "image/webp", "pdf": "application/pdf",
        }.get(ext)
        return (res.content, mime) if mime else None

    def _is_admin_message(self, msg: Dict[str, Any]) -> bool:
        chat = msg.get("chat", {})
        return (
            chat.get("type") == "private"
            and chat.get("id") == self.admin_id
            and is_authorized_user(msg.get("from", {}).get("id", 0))
        )

    def _status_text(self) -> str:
        today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        slots = self.storage.get_today_threads_slots(today)
        slot_summary = ", ".join(f"{k}:{slots.get(k, '대기')}" for k in ("morning", "afternoon", "evening"))
        return (
            f"📊 [weganda 마케팅 자동화 상태 ({today})]\n"
            f"• 실행 모드: {'🧪 DRY_RUN' if Config.DRY_RUN else '🔴 실발행 활성'}\n"
            f"• 08:30 인스타+커뮤니티 무인발행: {'ON ✅' if Config.DAILY_AUTO_PUBLISH else 'OFF (승인형)'}\n"
            f"• 06:30/12:30/17:30 쓰레드 무인발행: {'ON ✅' if Config.THREADS_AUTO_POST else 'OFF (승인형)'}\n"
            f"• 오늘 쓰레드 슬롯 상태: {slot_summary}\n"
            f"• 오늘 채용 패키지 발행: {self.storage.count_published_today(today)} / {Config.MAX_POSTS_PER_DAY}건\n"
            f"• 누적 처리 공고: {len(self.storage.handled_job_ids())}건"
        )

    def handle_message(self, msgs: List[Dict[str, Any]]):
        """관리자 메시지 처리."""
        first = msgs[0]
        if not self._is_admin_message(first):
            print(f"[보안 차단] 미인가 메시지 무시 (User ID: {first.get('from', {}).get('id')})")
            return

        text = "\n".join(m.get("text") or m.get("caption") or "" for m in msgs).strip()
        if text.startswith("/"):
            parts = text.split()
            cmd = parts[0].split("@")[0].lower()
            arg = parts[1].lower() if len(parts) > 1 else ""
            if cmd in ("/start", "/help"):
                self.send_message(self.admin_id, HELP_TEXT)
            elif cmd == "/status":
                self.send_message(self.admin_id, self._status_text())
            elif cmd == "/briefing":
                self.send_morning_briefing()
            elif cmd in ("/threads", "/thread"):
                slot = arg if arg in THREADS_SLOTS else "morning"
                self.run_scheduled_threads_slot(slot=slot, force=True)
            else:
                self.send_message(self.admin_id, "알 수 없는 명령어입니다. /help 를 확인해 주세요.")
            return

        file_refs: List[Tuple[str, int]] = []
        for m in msgs:
            if m.get("photo"):
                best = m["photo"][-1]
                file_refs.append((best["file_id"], best.get("file_size", 0)))
            doc = m.get("document") or {}
            if doc.get("mime_type", "").startswith("image/") or doc.get("mime_type") == "application/pdf":
                file_refs.append((doc["file_id"], doc.get("file_size", 0)))

        urls = find_urls(text)
        if not file_refs and not urls and len(text) < MIN_PASTED_TEXT:
            self.send_message(self.admin_id, "공고 URL, 캡처 이미지/PDF, 또는 본문 텍스트를 보내주세요. (/help)")
            return

        self.send_message(self.admin_id, "🔍 제보 내용을 분석 중입니다... (10~30초)")
        try:
            files: List[Tuple[bytes, str]] = []
            for file_id, size in file_refs[:5]:
                downloaded = self._download_file(file_id, size)
                if downloaded:
                    files.append(downloaded)
            if file_refs and not files:
                self.send_message(self.admin_id, "⚠️ 파일을 받지 못했습니다 (10MB 이하의 jpg/png/webp/pdf만 가능).")
                return

            body_text = text
            for u in urls:
                body_text = body_text.replace(u, " ")
            job = self.extractor.extract(text=body_text, url=urls[0] if urls else None, files=files)
        except ExtractionError as e:
            self.send_message(self.admin_id, f"⚠️ 제보를 처리하지 못했습니다.\n{e}")
            return
        except Exception as e:
            print(f"[제보 처리 예외] {type(e).__name__}: {e}")
            self.send_message(self.admin_id, "❗ 제보 처리 중 예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
            return

        notes = ["📥 제보 접수"]
        if len(urls) > 1:
            notes.append(f"※ URL이 {len(urls)}개여서 첫 번째만 사용했습니다.")
        if job.days_left is None:
            notes.append("⚠️ 마감일을 읽지 못했습니다.")
        if job.source_id in self.storage.handled_job_ids():
            notes.append("※ 이미 처리한 공고와 동일해 보입니다.")
        self._propose(job, origin="\n".join(notes))

    # ------------------------------------------------------------------ 4. 발행 실행부
    def _preflight(self, action: str) -> List[str]:
        """발행 전에 설정/토큰 문제를 모두 모아 반환."""
        problems: List[str] = []
        if not self.media_host.is_configured():
            problems.append("CLOUDINARY_URL 미설정 (이미지 공개 URL 필요)")
        if action in ("pub_all", "pub_ig_app", "pub_app"):
            if not self.community_pub.is_configured():
                problems.append("Supabase URL/Service Role Key 미설정")
        if action in ("pub_all", "pub_ig_app", "pub_sns"):
            if not self.instagram_pub.is_configured():
                problems.append("Instagram 계정 ID/토큰 미설정(또는 예시값)")
            else:
                err = self.instagram_pub.check_token()
                if err:
                    problems.append(err)
        if action in ("pub_all", "pub_sns"):
            if not self.threads_pub.is_configured():
                problems.append("Threads 사용자 ID/토큰 미설정(또는 예시값)")
        return problems

    def _run_dry(self, pkg: ContentPackage, plan_id: str, action: str):
        """실제 발행 없이 카드뉴스를 렌더링해 텔레그램으로 미리보기를 보낸다."""
        images = self.renderer.render_carousel(pkg.carousel, plan_id)
        if images:
            self.send_photo(self.admin_id, images[0], caption=f"[DRY_RUN] {pkg.hospital_name} 표지 미리보기")
        problems = self._preflight(action)
        lines = [
            f"🧪 DRY_RUN 완료 ({action}) — 실제 발행은 하지 않았습니다.",
            f"• 렌더링된 슬라이드: {len(images)}장 (assets/output/{plan_id}/)",
            f"• 쓰레드 글자 수: {[len(p) for p in pkg.threads.posts]} (한도 500)",
            f"• 인스타 캡션: {len(pkg.carousel.caption)}자 (한도 2200)",
        ]
        if problems:
            lines.append("\n⚠️ 실발행 전 해결 필요:")
            lines += [f"  - {p}" for p in problems]
        else:
            lines.append("\n✅ 사전 점검 통과 — DRY_RUN=false 로 바꾸면 실발행됩니다.")
        self.send_message(self.admin_id, "\n".join(lines))

    def _run_publish(self, pkg: ContentPackage, plan_id: str, action: str, today: str) -> bool:
        """
        실제 발행. 반환값: 기획안을 소진했는지(True) / 재시도 가능하게 복구해야 하는지(False).
        """
        if self.storage.count_published_today(today) >= Config.MAX_POSTS_PER_DAY:
            self.send_message(
                self.admin_id,
                f"⛔ 오늘 채용 패키지 발행 한도({Config.MAX_POSTS_PER_DAY}건)에 도달했습니다.",
            )
            return False

        problems = self._preflight(action)
        if problems:
            self.send_message(
                self.admin_id,
                "⛔ 사전 점검 실패 — 발행 중단:\n" + "\n".join(f"- {p}" for p in problems),
            )
            return False

        self.send_message(self.admin_id, "⏳ 카드뉴스 렌더링 및 미디어 업로드 중...")
        local_images = self.renderer.render_carousel(pkg.carousel, plan_id)
        try:
            public_urls = self.media_host.upload_images(local_images)
        except MediaUploadError as e:
            self.send_message(self.admin_id, f"⛔ 이미지 업로드 실패 — 발행 중단:\n{e}")
            return False

        report = [f"🎉 [{pkg.hospital_name}] 자동 발행 완료 리포트"]
        any_success = False

        def run_channel(name: str, label: str, fn) -> None:
            nonlocal any_success
            try:
                res = fn()
            except Exception as e:
                res = {"success": False, "error": f"예외: {e}"}
            ok = bool(res.get("success"))
            any_success = any_success or ok
            link = res.get("permalink") or res.get("post_id") or ""
            self.storage.record_publish(today, plan_id, name, "success" if ok else "failed", str(res.get("error", link)))
            report.append(f"• {label}: {'성공 ✅ ' + str(link) if ok else '실패 ❌ ' + str(res.get('error', ''))}")

        if action in ("pub_all", "pub_ig_app", "pub_app"):
            run_channel("community", "앱 커뮤니티", lambda: self.community_pub.publish_post(pkg.community, public_urls))
        if action in ("pub_all", "pub_ig_app", "pub_sns"):
            run_channel("instagram", "인스타그램 카드뉴스", lambda: self.instagram_pub.publish_carousel(public_urls, pkg.carousel.caption))
        if action in ("pub_all", "pub_sns"):
            run_channel("threads", "쓰레드", lambda: self.threads_pub.publish_thread_chain(pkg.threads.posts, topic_tag="간호사"))

        if any_success:
            self.storage.mark_job(pkg.source_id, "published")
        if any_success and any("실패 ❌" in line for line in report):
            report.append("\n⚠️ 일부 채널만 성공했습니다. 중복 방지를 위해 해당 공고는 처리 완료로 기록되었습니다.")
        elif not any_success:
            report.append("\n모든 채널이 실패했습니다.")
        self.send_message(self.admin_id, "\n".join(report))
        return any_success

    def handle_callback_query(self, query: Dict[str, Any]):
        user_id = query.get("from", {}).get("id", 0)
        query_id = query.get("id")

        if not is_authorized_user(user_id):
            print(f"[보안 차단] 미인가 사용자의 콜백 쿼리 시도 차단됨 (User ID: {user_id})")
            self._answer_callback(query_id, "⛔ 접근 권한이 없습니다.", alert=True)
            return

        data = query.get("data", "")
        action, _, target_id = data.partition(":")

        # 쓰레드 초안 수동 승인 콜백 처리
        if action in ("thr_pub", "thr_skip") and THREAD_DRAFT_RE.match(target_id):
            raw = self.storage.get_setting(f"thread_draft:{target_id}")
            self.storage.del_setting(f"thread_draft:{target_id}")
            if not raw:
                self._answer_callback(query_id, "이미 처리되었거나 만료된 초안입니다.", alert=True)
                return
            if action == "thr_skip":
                self._answer_callback(query_id, "건너뛰었습니다.")
                self.send_message(self.admin_id, "Threads 초안 발행을 건너뛰었습니다.")
                return
            self._answer_callback(query_id, "Threads 게시 중...")
            today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
            viral_res = ViralThreadResult.model_validate_json(raw)
            self._publish_viral_thread(today, viral_res.slot, viral_res)
            return

        if action not in ALLOWED_ACTIONS or not PLAN_ID_RE.match(target_id):
            self._answer_callback(query_id, "잘못된 요청입니다.", alert=True)
            return

        if action == "skip":
            skipped = self.storage.claim_pending(target_id)
            if skipped:
                self.storage.mark_job(skipped.source_id, "skipped")
            self._answer_callback(query_id, "건너뛰었습니다.")
            self.send_message(self.admin_id, "공고 발행이 취소되었습니다.")
            return

        pkg = self.storage.claim_pending(target_id)
        if not pkg:
            self._answer_callback(query_id, "이미 처리되었거나 만료된 기획안입니다.", alert=True)
            return
        self._answer_callback(query_id, "처리를 시작합니다...")

        today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        keep_consumed = False
        try:
            if Config.DRY_RUN:
                self._run_dry(pkg, target_id, action)
            else:
                keep_consumed = self._run_publish(pkg, target_id, action, today)
        except Exception as e:
            print(f"[발행 처리 예외] {e}")
            self.send_message(self.admin_id, f"❗ 처리 중 예외가 발생했습니다 (기획안은 보존): {e}")
        finally:
            if not keep_consumed:
                self.storage.save_pending(target_id, pkg)

    def poll_updates_once(self):
        """단일 롱폴링 루프"""
        if not self._token_ready():
            return
        try:
            res = requests.get(
                f"{self.base_url}/getUpdates",
                params={"offset": self.last_update_id + 1, "timeout": 2},
                timeout=5,
            )
            if res.status_code != 200:
                return
            albums: Dict[str, List[Dict[str, Any]]] = {}
            for item in res.json().get("result", []):
                self.last_update_id = item["update_id"]
                try:
                    if "callback_query" in item:
                        self.handle_callback_query(item["callback_query"])
                    elif "message" in item:
                        msg = item["message"]
                        if msg.get("media_group_id"):
                            albums.setdefault(msg["media_group_id"], []).append(msg)
                        else:
                            self.handle_message([msg])
                except Exception as e:
                    print(f"[업데이트 처리 오류] {type(e).__name__}: {e}")
            for group in albums.values():
                try:
                    self.handle_message(group)
                except Exception as e:
                    print(f"[앨범 처리 오류] {type(e).__name__}: {e}")
        except (requests.RequestException, ValueError) as e:
            print(f"[텔레그램 폴링 오류] {e}")
