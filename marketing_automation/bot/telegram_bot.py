import json
import re
import sqlite3
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
from pipeline.publishers.community_publisher import CommunityPublisher
from pipeline.publishers.instagram_publisher import InstagramPublisher
from pipeline.publishers.threads_publisher import ThreadsPublisher

DB_PATH = Config.DATA_DIR / "state.db"

PLAN_ID_RE = re.compile(r"^job_\d+$")
ALLOWED_ACTIONS = {"pub_all", "pub_sns", "pub_app", "skip"}
TELEGRAM_MAX_LEN = 4000
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 제보 이미지/PDF 최대 크기
MIN_PASTED_TEXT = 40  # URL/파일 없이 붙여넣은 텍스트의 최소 길이
HELP_TEXT = (
    "📮 공고 제보 방법 (관리자 전용)\n\n"
    "• 공고 URL을 보내기 → 페이지를 읽어 기획안을 만듭니다\n"
    "• 공고 캡처 이미지/PDF를 보내기 (캡션에 URL을 적으면 원문 링크로 사용)\n"
    "• 공고 본문 텍스트를 붙여넣기\n\n"
    "명령어\n"
    "/briefing — 잡알리오 자동 수집 공고로 기획안 받기\n"
    "/status — 현재 모드(DRY_RUN 등) 확인\n"
    "/help — 이 도움말\n\n"
    "⚠️ AI가 추출한 내용은 승인 전에 반드시 원문과 대조해 주세요."
)


class Storage:
    """SQLite 기반의 안전한 상태 영속화 엔진"""

    def __init__(self):
        self.conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        self._init_db()

    def _init_db(self):
        with self.conn:
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

    def mark_job(self, source_id: str, status: str):
        """발행/건너뜀 처리된 공고 기록 — 같은 공고를 다시 추천하지 않기 위함"""
        if not source_id:
            return
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO posted_jobs (source_id, status) VALUES (?, ?)", (source_id, status)
            )

    def handled_job_ids(self) -> set:
        cur = self.conn.cursor()
        cur.execute("SELECT source_id FROM posted_jobs")
        return {row[0] for row in cur.fetchall()}

    def save_pending(self, plan_id: str, pkg: ContentPackage):
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO pending_proposals (id, package_json) VALUES (?, ?)",
                (plan_id, pkg.model_dump_json()),
            )

    def claim_pending(self, plan_id: str) -> Optional[ContentPackage]:
        """
        기획안을 '원자적으로' 꺼내며 삭제한다. 같은 버튼을 두 번 눌러도
        한 번만 성공하므로 중복 발행을 막는다. (실패 시 save_pending으로 복구)
        """
        with self.conn:
            cur = self.conn.execute("SELECT package_json FROM pending_proposals WHERE id = ?", (plan_id,))
            row = cur.fetchone()
            if not row:
                return None
            deleted = self.conn.execute("DELETE FROM pending_proposals WHERE id = ?", (plan_id,)).rowcount
            if deleted != 1:
                return None
        return ContentPackage.model_validate_json(row[0])

    def delete_pending(self, plan_id: str):
        with self.conn:
            self.conn.execute("DELETE FROM pending_proposals WHERE id = ?", (plan_id,))

    def has_dispatched_today(self, date_str: str) -> bool:
        cur = self.conn.cursor()
        cur.execute("SELECT id FROM dispatch_logs WHERE date_str = ?", (date_str,))
        return cur.fetchone() is not None

    def record_dispatch(self, date_str: str, status: str = "COMPLETED"):
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO dispatch_logs (date_str, status) VALUES (?, ?)",
                (date_str, status),
            )

    def record_publish(self, date_str: str, plan_id: str, channel: str, status: str, detail: str = ""):
        with self.conn:
            self.conn.execute(
                "INSERT INTO publish_logs (date_str, plan_id, channel, status, detail) VALUES (?, ?, ?, ?, ?)",
                (date_str, plan_id, channel, status, detail[:500]),
            )

    def count_published_today(self, date_str: str) -> int:
        """오늘 한 채널이라도 성공한 '기획안' 수 (일일 발행 한도 판단용)"""
        cur = self.conn.cursor()
        cur.execute(
            "SELECT COUNT(DISTINCT plan_id) FROM publish_logs WHERE date_str = ? AND status = 'success'",
            (date_str,),
        )
        return cur.fetchone()[0]


class TelegramApprovalBot:
    """
    보안 강화 텔레그램 승인 워커:
    - 관리자 화이트리스트 검증 필수
    - SQLite 상태 영속화, 기획안 원자적 claim(중복 발행 방지)
    - DRY_RUN / 일일 발행 한도 / 사전 점검(preflight) / 예외 시 관리자 알림
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
        self.community_pub = CommunityPublisher()
        self.instagram_pub = InstagramPublisher()
        self.threads_pub = ThreadsPublisher()
        self.last_update_id = 0

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

    # ------------------------------------------------------------------ 아침 브리핑
    def send_morning_briefing(self):
        """매일 아침 추천 채용공고 큐레이션 및 승인 요청 발송"""
        print("[텔레그램 봇] 오늘자 간호사 공채 추천 기획안 수집 시작...")
        jobs = self.crawler.fetch_latest_jobs(limit=1, exclude_ids=self.storage.handled_job_ids())
        if not jobs:
            self.send_message(
                self.admin_id,
                "오늘 추천할 신규 간호사 공고가 없습니다.\n"
                "사립 병원 등 자동 수집이 안 되는 공고는 URL·캡처 이미지·본문 텍스트로 제보해 주세요. (/help)",
            )
            return
        self._propose(jobs[0], origin="🤖 잡알리오 자동 수집" if jobs[0].source == "alio" else "")

    def _propose(self, job: RawJobPosting, origin: str = ""):
        """공고 → 3채널 기획안 생성 → 승인 요청 메시지 (자동 수집/제보 공통 경로)"""
        package = self.planner.plan_job_package(job)
        plan_id = f"job_{int(time.time() * 1000)}"
        self.storage.save_pending(plan_id, package)

        mode = "🧪 DRY_RUN (실제 발행 안 함, 미리보기만)" if Config.DRY_RUN else "🔴 실발행 모드"
        origin_line = f"{origin}\n" if origin else ""
        text = (
            f"📢 [오늘의 weganda 채용 속보 기획안]\n"
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
            "⚠️ AI가 작성한 내용입니다. 원문 대조 후 승인해 주세요.\n"
            "발행을 진행하시겠습니까?"
        )
        reply_markup = {
            "inline_keyboard": [
                [{"text": "🚀 3개 채널 전면 발행 (인스타+쓰레드+앱)", "callback_data": f"pub_all:{plan_id}"}],
                [{"text": "📱 SNS만 발행 (인스타+쓰레드)", "callback_data": f"pub_sns:{plan_id}"}],
                [{"text": "🏥 앱 커뮤니티에만 등록", "callback_data": f"pub_app:{plan_id}"}],
                [{"text": "❌ 이 공고 건너뛰기", "callback_data": f"skip:{plan_id}"}],
            ]
        }
        self.send_message(self.admin_id, text, reply_markup=reply_markup)
        print("[텔레그램 봇] 관리자에게 승인 대기 메시지를 성공적으로 발송했습니다.")

    # ------------------------------------------------------------------ 제보 (URL / 이미지 / 텍스트)
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
        # 🔒 개인 채팅 + 화이트리스트 관리자만. 그 외에는 응답하지 않고 무시(봇 존재 노출 최소화)
        chat = msg.get("chat", {})
        return (
            chat.get("type") == "private"
            and chat.get("id") == self.admin_id
            and is_authorized_user(msg.get("from", {}).get("id", 0))
        )

    def _status_text(self) -> str:
        today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        return (
            f"모드: {'🧪 DRY_RUN' if Config.DRY_RUN else '🔴 실발행'}\n"
            f"일일 발행 한도: {Config.MAX_POSTS_PER_DAY}건 / 오늘 발행: {self.storage.count_published_today(today)}건\n"
            f"Mock 공고: {'허용' if Config.ALLOW_MOCK_JOBS else '차단'} / 최소 마감 여유: D-{Config.JOB_MIN_DDAY}\n"
            f"처리 완료 공고: {len(self.storage.handled_job_ids())}건"
        )

    def handle_message(self, msgs: List[Dict[str, Any]]):
        """관리자 메시지 처리. 앨범(여러 장)은 하나의 제보로 묶여 msgs 에 함께 들어온다."""
        first = msgs[0]
        if not self._is_admin_message(first):
            print(f"[보안 차단] 미인가 메시지 무시 (User ID: {first.get('from', {}).get('id')})")
            return

        text = "\n".join(m.get("text") or m.get("caption") or "" for m in msgs).strip()
        if text.startswith("/"):
            cmd = text.split()[0].split("@")[0].lower()
            if cmd in ("/start", "/help"):
                self.send_message(self.admin_id, HELP_TEXT)
            elif cmd == "/status":
                self.send_message(self.admin_id, self._status_text())
            elif cmd == "/briefing":
                self.send_morning_briefing()
            else:
                self.send_message(self.admin_id, "알 수 없는 명령어입니다. /help 를 확인해 주세요.")
            return

        file_refs: List[Tuple[str, int]] = []
        for m in msgs:
            if m.get("photo"):
                best = m["photo"][-1]  # 가장 큰 해상도
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

            # 본문에서 URL 문구를 빼고 남은 텍스트도 자료로 사용
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

        notes = ["📥 제보 접수 (AI 추출 — 원문과 대조해 주세요)"]
        if len(urls) > 1:
            notes.append(f"※ URL이 {len(urls)}개여서 첫 번째만 사용했습니다.")
        if job.days_left is None:
            notes.append("⚠️ 마감일을 읽지 못했습니다. 원문에서 마감일을 꼭 확인한 뒤 승인하세요.")
        if job.source_id in self.storage.handled_job_ids():
            notes.append("※ 이미 처리(발행/건너뜀)한 공고와 동일해 보입니다.")
        self._propose(job, origin="\n".join(notes))

    # ------------------------------------------------------------------ 발행
    def _preflight(self, action: str) -> List[str]:
        """발행 전에 설정/토큰 문제를 모두 모아 반환 (렌더링·업로드 낭비와 부분 발행 방지)."""
        problems: List[str] = []
        if not self.media_host.is_configured():
            problems.append("CLOUDINARY_URL 미설정 (이미지 공개 URL 필요)")
        if action in ("pub_all", "pub_app"):
            if not self.community_pub.is_configured():
                problems.append("Supabase URL/Service Role Key 미설정")
        if action in ("pub_all", "pub_sns"):
            if not self.instagram_pub.is_configured():
                problems.append("Instagram 계정 ID/토큰 미설정(또는 예시값)")
            else:
                err = self.instagram_pub.check_token()
                if err:
                    problems.append(err)
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
            "🧪 DRY_RUN 완료 — 실제 발행은 하지 않았습니다.",
            f"• 렌더링된 슬라이드: {len(images)}장 (assets/output/{plan_id}/)",
            f"• 쓰레드 글자 수: {[len(p) for p in pkg.threads.posts]} (한도 500)",
            f"• 인스타 캡션: {len(pkg.carousel.caption)}자 (한도 2200)",
        ]
        if problems:
            lines.append("\n⚠️ 실발행 전 해결 필요:")
            lines += [f"  - {p}" for p in problems]
        else:
            lines.append("\n✅ 사전 점검 통과 — DRY_RUN=false 로 바꾸면 실발행 가능합니다.")
        self.send_message(self.admin_id, "\n".join(lines))

    def _run_publish(self, pkg: ContentPackage, plan_id: str, action: str, today: str) -> bool:
        """
        실제 발행. 반환값: 기획안을 소진했는지(True) / 재시도 가능하게 복구해야 하는지(False).
        """
        if self.storage.count_published_today(today) >= Config.MAX_POSTS_PER_DAY:
            self.send_message(
                self.admin_id,
                f"⛔ 오늘 발행 한도({Config.MAX_POSTS_PER_DAY}건)에 도달했습니다. 기획안은 보존되었습니다.",
            )
            return False

        problems = self._preflight(action)
        if problems:
            self.send_message(
                self.admin_id,
                "⛔ 사전 점검 실패 — 아무것도 발행하지 않았습니다 (기획안은 보존):\n" + "\n".join(f"- {p}" for p in problems),
            )
            return False

        self.send_message(self.admin_id, "⏳ 카드뉴스 렌더링 및 미디어 업로드 중...")
        local_images = self.renderer.render_carousel(pkg.carousel, plan_id)
        try:
            public_urls = self.media_host.upload_images(local_images)
        except MediaUploadError as e:
            self.send_message(self.admin_id, f"⛔ 이미지 업로드 실패 — 발행 중단 (기획안은 보존):\n{e}")
            return False

        report = ["📋 발행 결과"]
        any_success = False

        def run_channel(name: str, label: str, fn) -> None:
            nonlocal any_success
            try:
                res = fn()
            except Exception as e:  # 한 채널의 예외가 다른 채널 발행/기록을 막지 않도록
                res = {"success": False, "error": f"예외: {e}"}
            ok = bool(res.get("success"))
            any_success = any_success or ok
            link = res.get("permalink") or res.get("post_id") or ""
            self.storage.record_publish(today, plan_id, name, "success" if ok else "failed", str(res.get("error", link)))
            report.append(f"• {label}: {'성공 ✅ ' + str(link) if ok else '실패 ❌ ' + str(res.get('error', ''))}")

        if action in ("pub_all", "pub_app"):
            run_channel("community", "앱 커뮤니티", lambda: self.community_pub.publish_post(pkg.community, public_urls))
        if action in ("pub_all", "pub_sns"):
            run_channel("instagram", "인스타그램", lambda: self.instagram_pub.publish_carousel(public_urls, pkg.carousel.caption))
            run_channel("threads", "쓰레드", lambda: self.threads_pub.publish_thread_chain(pkg.threads.posts))

        if any_success:
            self.storage.mark_job(pkg.source_id, "published")
        if any_success and any("실패 ❌" in line for line in report):
            report.append("\n⚠️ 일부 채널만 성공했습니다. 중복 방지를 위해 기획안은 소진 처리되었으니 실패 채널은 수동으로 확인해 주세요.")
        elif not any_success:
            report.append("\n모든 채널이 실패해 기획안을 보존했습니다. 원인 해결 후 다시 눌러주세요.")
        self.send_message(self.admin_id, "\n".join(report))
        return any_success

    def handle_callback_query(self, query: Dict[str, Any]):
        user_id = query.get("from", {}).get("id", 0)
        query_id = query.get("id")

        # 🔒 보안 가드: 인가된 관리자 검증
        if not is_authorized_user(user_id):
            print(f"[보안 차단] 미인가 사용자의 콜백 쿼리 시도 차단됨 (User ID: {user_id})")
            self._answer_callback(query_id, "⛔ 접근 권한이 없습니다.", alert=True)
            return

        data = query.get("data", "")
        action, _, plan_id = data.partition(":")
        if action not in ALLOWED_ACTIONS or not PLAN_ID_RE.match(plan_id):
            self._answer_callback(query_id, "잘못된 요청입니다.", alert=True)
            return

        if action == "skip":
            skipped = self.storage.claim_pending(plan_id)
            if skipped:
                self.storage.mark_job(skipped.source_id, "skipped")
            self._answer_callback(query_id, "건너뛰었습니다.")
            self.send_message(self.admin_id, "오늘자 공고 발행이 취소되었습니다.")
            return

        # 중복 클릭/재시작 방어: 원자적으로 기획안을 점유 (이미 처리됐다면 None)
        pkg = self.storage.claim_pending(plan_id)
        if not pkg:
            self._answer_callback(query_id, "이미 처리되었거나 만료된 기획안입니다.", alert=True)
            return
        self._answer_callback(query_id, "처리를 시작합니다...")

        today = datetime.now(ZoneInfo(Config.TIMEZONE)).strftime("%Y-%m-%d")
        keep_consumed = False
        try:
            if Config.DRY_RUN:
                self._run_dry(pkg, plan_id, action)
            else:
                keep_consumed = self._run_publish(pkg, plan_id, action, today)
        except Exception as e:
            print(f"[발행 처리 예외] {e}")
            self.send_message(self.admin_id, f"❗ 처리 중 예외가 발생했습니다 (기획안은 보존): {e}")
        finally:
            if not keep_consumed:
                self.storage.save_pending(plan_id, pkg)

    def poll_updates_once(self):
        """단일 롱폴링 루프 (테스트 및 주기적 호출)"""
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
                            albums.setdefault(msg["media_group_id"], []).append(msg)  # 앨범은 모아서 한 번에
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
