import json
import random
import sqlite3
import threading
import time
from typing import Dict, List, Optional

from config import Config
from pipeline.content_planner import ContentPackage
from pipeline.threads_viral_engine import THREADS_SLOTS

DB_PATH = Config.DATA_DIR / "state.db"


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
            # 발행된 콘텐츠의 메타데이터(필러·포맷·후킹·실험 팔)와 성과 스냅샷. 추가 전용이라 기존 데이터에 영향 없음.
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS content_posts (
                    post_key TEXT PRIMARY KEY,
                    channel TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    date_str TEXT,
                    slot TEXT,
                    pillar TEXT,
                    format_id TEXT,
                    hook_id TEXT,
                    has_cta INTEGER DEFAULT 0,
                    cta_variant TEXT,
                    experiment_id TEXT,
                    arm TEXT,
                    permalink TEXT,
                    published_ts INTEGER NOT NULL
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS content_metrics (
                    post_key TEXT NOT NULL,
                    obs_window TEXT NOT NULL,
                    metrics_json TEXT NOT NULL,
                    fetched_ts INTEGER NOT NULL,
                    PRIMARY KEY (post_key, obs_window)
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

    def claim_once(self, key: str) -> bool:
        """같은 key는 한 번만 True를 반환한다(원자적). 스케줄러가 중복 실행돼도 한 번만 처리하게 할 때 쓴다."""
        with self._lock, self.conn:
            cur = self.conn.execute("INSERT OR IGNORE INTO bot_settings (key, value) VALUES (?, '1')", (key,))
            return cur.rowcount == 1

    def del_setting(self, key: str):
        with self._lock, self.conn:
            self.conn.execute("DELETE FROM bot_settings WHERE key = ?", (key,))

    # ------------------------------------------------------------------ 실패 재시도 (시도 횟수는 bot_settings에 기록)
    def _attempts(self, attempts_key: str) -> int:
        """호출자가 self._lock을 잡고 있어야 한다. 기록이 없으면 최초 1회 시도한 것으로 본다."""
        row = self.conn.execute("SELECT value FROM bot_settings WHERE key = ?", (attempts_key,)).fetchone()
        return int(row[0]) if row and str(row[0]).isdigit() else 1

    def _reclaim_failed(self, table: str, key_col: str, key_val: str, attempts_key: str) -> bool:
        """FAILED 상태이고 시도 횟수가 남았다면 원자적으로 RUNNING으로 되돌려 재실행 권한을 얻는다.
        (table/key_col은 이 클래스 내부 상수만 전달한다.) 호출자가 self._lock과 트랜잭션을 잡고 있어야 한다."""
        attempts = self._attempts(attempts_key)
        if attempts >= Config.MAX_RETRY_ATTEMPTS:
            return False
        cur = self.conn.execute(
            f"UPDATE {table} SET status = 'RUNNING' WHERE {key_col} = ? AND status = 'FAILED'",
            (key_val,),
        )
        if cur.rowcount != 1:
            return False
        self.conn.execute(
            "INSERT OR REPLACE INTO bot_settings (key, value) VALUES (?, ?)",
            (attempts_key, str(attempts + 1)),
        )
        return True

    def retryable_threads_slots(self, date_str: str) -> List[str]:
        with self._lock:
            rows = self.conn.execute(
                "SELECT slot, slot_key FROM threads_slot_logs WHERE date_str = ? AND status = 'FAILED'",
                (date_str,),
            ).fetchall()
            return [
                slot for slot, slot_key in rows
                if self._attempts(f"attempts:threads:{slot_key}") < Config.MAX_RETRY_ATTEMPTS
            ]

    def daily_dispatch_retryable(self, date_str: str) -> bool:
        with self._lock:
            row = self.conn.execute("SELECT status FROM dispatch_logs WHERE date_str = ?", (date_str,)).fetchone()
            return bool(row and row[0] == "FAILED" and self._attempts(f"attempts:daily:{date_str}") < Config.MAX_RETRY_ATTEMPTS)

    # ------------------------------------------------------------------ 쓰레드 슬롯 & 최근 글 관리
    def claim_threads_slot(self, date_str: str, slot: str) -> bool:
        """
        하루 3회(morning/afternoon/evening) 슬롯의 중복 실행을 원자적으로 방지합니다.
        이미 오늘 해당 슬롯이 실행되었으면 False를 반환합니다.
        단, 이전 시도가 FAILED이고 재시도 횟수(MAX_RETRY_ATTEMPTS)가 남았다면 다시 선점할 수 있습니다.
        """
        slot_key = f"{date_str}:{slot}"
        with self._lock, self.conn:
            cur = self.conn.execute(
                "INSERT OR IGNORE INTO threads_slot_logs (slot_key, date_str, slot, status, permalink) VALUES (?, ?, ?, 'RUNNING', '')",
                (slot_key, date_str, slot),
            )
            if cur.rowcount == 1:
                return True
            return self._reclaim_failed("threads_slot_logs", "slot_key", slot_key, f"attempts:threads:{slot_key}")

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

    def claim_daily_dispatch(self, date_str: str) -> bool:
        """08:30 일일 카드뉴스+커뮤니티 자동 발행의 중복 실행을 원자적으로 방지합니다. (FAILED는 횟수 내 재선점 가능)"""
        with self._lock, self.conn:
            cur = self.conn.execute(
                "INSERT OR IGNORE INTO dispatch_logs (date_str, status) VALUES (?, 'RUNNING')",
                (date_str,),
            )
            if cur.rowcount == 1:
                return True
            return self._reclaim_failed("dispatch_logs", "date_str", date_str, f"attempts:daily:{date_str}")

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

    # ------------------------------------------------------------------ 콘텐츠 메타데이터 & 성과 (측정·실험)
    def record_content_post(
        self,
        *,
        channel: str,
        external_id: str,
        slot: str = "",
        pillar: str = "",
        format_id: str = "",
        hook_id: str = "",
        has_cta: bool = False,
        cta_variant: str = "",
        experiment_id: str = "",
        arm: str = "",
        permalink: str = "",
        date_str: str = "",
        published_ts: Optional[int] = None,
    ) -> bool:
        """발행된 게시물의 메타데이터를 기록한다. 같은 게시물은 한 번만 기록되며(신규면 True), id가 없으면 건너뛴다."""
        if not external_id:
            return False
        with self._lock, self.conn:
            cur = self.conn.execute(
                """INSERT OR IGNORE INTO content_posts
                   (post_key, channel, external_id, date_str, slot, pillar, format_id, hook_id,
                    has_cta, cta_variant, experiment_id, arm, permalink, published_ts)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    f"{channel}:{external_id}", channel, external_id, date_str, slot, pillar, format_id, hook_id,
                    1 if has_cta else 0, cta_variant, experiment_id, arm, permalink,
                    int(published_ts if published_ts is not None else time.time()),
                ),
            )
            return cur.rowcount == 1

    def recent_content_meta(self, channel: str, limit: int = 30) -> List[Dict[str, str]]:
        """최근 발행분(최신순)의 포맷·후킹·필러·슬롯. 포맷 중복 회피와 필러 균형 계산에 쓴다."""
        with self._lock:
            rows = self.conn.execute(
                """SELECT slot, pillar, format_id, hook_id FROM content_posts
                   WHERE channel = ? ORDER BY published_ts DESC LIMIT ?""",
                (channel, limit),
            ).fetchall()
        return [{"slot": r[0] or "", "pillar": r[1] or "", "format_id": r[2] or "", "hook_id": r[3] or ""} for r in rows]

    def experiment_counts(self, experiment_id: str, slot: str) -> Dict[str, int]:
        """슬롯별 실험 팔 배정 수 (슬롯 안에서 균형 배정하기 위함)."""
        with self._lock:
            rows = self.conn.execute(
                """SELECT arm, COUNT(*) FROM content_posts
                   WHERE experiment_id = ? AND slot = ? GROUP BY arm""",
                (experiment_id, slot),
            ).fetchall()
        return {r[0]: r[1] for r in rows}

    def metric_targets(self, now_ts: int, limit: int = 30) -> List[Dict[str, str]]:
        """성과 스냅샷이 필요한 게시물: 발행 24h 경과 시 'd1', 72h 경과 시 'd3'(최대 14일까지 재시도)."""
        day = 86400
        with self._lock:
            posts = self.conn.execute(
                """SELECT post_key, channel, external_id, published_ts FROM content_posts
                   WHERE published_ts <= ? AND published_ts >= ? ORDER BY published_ts""",
                (now_ts - day, now_ts - 14 * day),
            ).fetchall()
            done = {
                (r[0], r[1])
                for r in self.conn.execute("SELECT post_key, obs_window FROM content_metrics").fetchall()
            }
        targets: List[Dict[str, str]] = []
        for post_key, channel, external_id, published_ts in posts:
            window = "d3" if now_ts - published_ts >= 3 * day else "d1"
            if (post_key, window) not in done:
                targets.append({"post_key": post_key, "channel": channel, "external_id": external_id, "window": window})
            if len(targets) >= limit:
                break
        return targets

    def save_metrics(self, post_key: str, window: str, metrics: Dict[str, float], now_ts: Optional[int] = None) -> None:
        with self._lock, self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO content_metrics (post_key, obs_window, metrics_json, fetched_ts) VALUES (?, ?, ?, ?)",
                (post_key, window, json.dumps(metrics, ensure_ascii=False), int(now_ts if now_ts is not None else time.time())),
            )

    def posts_with_metrics(self, window: str, since_ts: int, channel: Optional[str] = None) -> List[Dict[str, object]]:
        """지정한 관측 창의 성과가 수집된 게시물 (since_ts 이후 발행분). metrics는 dict로 복원한다."""
        sql = (
            """SELECT p.post_key, p.channel, p.slot, p.pillar, p.format_id, p.hook_id, p.has_cta,
                      p.cta_variant, p.experiment_id, p.arm, p.permalink, p.published_ts, m.metrics_json
               FROM content_posts p JOIN content_metrics m ON m.post_key = p.post_key AND m.obs_window = ?
               WHERE p.published_ts >= ?"""
        )
        args: list = [window, since_ts]
        if channel:
            sql += " AND p.channel = ?"
            args.append(channel)
        sql += " ORDER BY p.published_ts"
        with self._lock:
            rows = self.conn.execute(sql, args).fetchall()
        keys = ("post_key", "channel", "slot", "pillar", "format_id", "hook_id", "has_cta",
                "cta_variant", "experiment_id", "arm", "permalink", "published_ts")
        result: List[Dict[str, object]] = []
        for row in rows:
            item: Dict[str, object] = dict(zip(keys, row[:12]))
            try:
                item["metrics"] = json.loads(row[12])
            except ValueError:
                continue  # 손상된 행은 집계에서 제외
            result.append(item)
        return result

    def count_posts_missing_metrics(self, window: str, now_ts: int) -> int:
        """관측 창이 닫혔지만(d3: 72h) 아직 성과가 없는 게시물 수 — 리포트의 '집계 대기' 표기용."""
        min_age = 3 * 86400 if window == "d3" else 86400
        with self._lock:
            row = self.conn.execute(
                """SELECT COUNT(*) FROM content_posts p
                   WHERE p.published_ts <= ? AND p.published_ts >= ?
                   AND NOT EXISTS (SELECT 1 FROM content_metrics m WHERE m.post_key = p.post_key AND m.obs_window = ?)""",
                (now_ts - min_age, now_ts - 14 * 86400, window),
            ).fetchone()
        return row[0] if row else 0
