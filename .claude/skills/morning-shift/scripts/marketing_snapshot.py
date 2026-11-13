"""marketing_automation/state.db 를 읽기 전용으로 열어 봇 상태 요약을 출력한다.

morning-shift 스킬의 marketing-operator 워커가 사용한다. DB를 수정하지 않으며,
게시물 본문·토큰 등 원문 데이터는 출력하지 않는다(건수·상태·날짜만).
"""
import os
import sqlite3
import sys
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
DB_PATH = os.path.join(ROOT, "marketing_automation", "state.db")
STALE_AFTER_DAYS = 2
LOOKBACK_DAYS = 7


def table_exists(conn: sqlite3.Connection, name: str) -> bool:
    row = conn.execute(
        "select 1 from sqlite_master where type='table' and name=?", (name,)
    ).fetchone()
    return row is not None


def main() -> None:
    if not os.path.exists(DB_PATH):
        print("스냅샷: state.db 없음 — 성과 데이터 없음으로 처리할 것")
        return

    modified = datetime.fromtimestamp(os.path.getmtime(DB_PATH))
    age_days = (datetime.now() - modified).days
    stale = age_days > STALE_AFTER_DAYS
    print(f"스냅샷 기준: {modified:%Y-%m-%d %H:%M} (약 {age_days}일 전)")
    if stale:
        print(
            "주의: 로컬 DB가 오래됨. 운영 봇(Railway)의 최신 상태가 아닐 수 있으므로 "
            "성과 분석은 '데이터 없음'으로 처리할 것"
        )

    since = (datetime.now() - timedelta(days=LOOKBACK_DAYS)).strftime("%Y-%m-%d")
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    try:
        if table_exists(conn, "publish_logs"):
            print(f"\n[발행 로그] 최근 {LOOKBACK_DAYS}일 (채널/상태/건수)")
            rows = conn.execute(
                "select channel, status, count(*) from publish_logs "
                "where date_str >= ? group by channel, status order by channel",
                (since,),
            ).fetchall()
            for channel, status, count in rows:
                print(f"  {channel} / {status} / {count}")
            if not rows:
                last = conn.execute("select max(date_str) from publish_logs").fetchone()[0]
                print(f"  없음 (마지막 기록일: {last})")

        if table_exists(conn, "threads_slot_logs"):
            print(f"\n[Threads 슬롯] 최근 {LOOKBACK_DAYS}일 (슬롯/상태/건수)")
            rows = conn.execute(
                "select slot, status, count(*) from threads_slot_logs "
                "where date_str >= ? group by slot, status order by slot",
                (since,),
            ).fetchall()
            for slot, status, count in rows:
                print(f"  {slot} / {status} / {count}")
            if not rows:
                print("  없음")

        if table_exists(conn, "pending_proposals"):
            count, oldest = conn.execute(
                "select count(*), min(created_at) from pending_proposals"
            ).fetchone()
            print(f"\n[승인 대기] {count}건 (가장 오래된 건: {oldest})")

        if table_exists(conn, "posted_jobs"):
            rows = conn.execute(
                "select status, count(*) from posted_jobs group by status"
            ).fetchall()
            print("\n[공고 처리 누계] " + ", ".join(f"{s}: {c}" for s, c in rows))
    finally:
        conn.close()


if __name__ == "__main__":
    main()
