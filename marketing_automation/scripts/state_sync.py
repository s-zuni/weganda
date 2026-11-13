"""state.db 스냅샷을 Supabase Storage의 비공개 버킷과 동기화한다 (GitHub Actions 전용).

GitHub Actions 러너는 실행마다 새 머신이라 SQLite 상태(중복 발행 방지 기록, 재시도 횟수,
갱신된 Threads 토큰, 성과 데이터)가 사라진다. 실행 전에 pull, 실행 후에 push 해서 이어 붙인다.

사용법 (marketing_automation 폴더에서):
    python scripts/state_sync.py pull
    python scripts/state_sync.py push [--file 경로]   # --file 은 기존 state.db 를 처음 올릴 때(시드)

필요한 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_DIR(없으면 marketing_automation 폴더)

안전 원칙
- 파일이 '없는' 경우만 새로 시작한다. 인증·네트워크·서버 오류는 실행을 중단한다.
  (오류를 새로 시작으로 오인하면 이미 올린 글을 다시 발행할 수 있다.)
- 받은 파일은 SQLite 헤더와 integrity_check 를 통과해야 교체한다.
- 올리기 전 backup API 로 일관된 사본을 만들고 검사한다.
- 키 값은 출력하지 않는다.
"""
import argparse
import os
import sqlite3
import sys
import tempfile
import time
from pathlib import Path
from typing import Optional

import requests

BUCKET = "marketing-state"
OBJECT = "state.db"
RETRIES = 3
SQLITE_MAGIC = b"SQLite format 3\x00"


class SyncError(Exception):
    pass


def _env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SyncError(f"환경변수 {name} 가 비어 있습니다.")
    return value


def _base() -> str:
    return _env("SUPABASE_URL").rstrip("/") + "/storage/v1"


def _headers(extra: Optional[dict] = None) -> dict:
    key = _env("SUPABASE_SERVICE_ROLE_KEY")
    headers = {"Authorization": f"Bearer {key}", "apikey": key}
    headers.update(extra or {})
    return headers


def db_path() -> Path:
    data_dir = os.environ.get("DATA_DIR", "").strip()
    return (Path(data_dir) if data_dir else Path(__file__).resolve().parent.parent) / "state.db"


def _request(method: str, url: str, **kwargs) -> requests.Response:
    """5xx·연결 오류만 재시도한다. 4xx는 호출자가 판단한다."""
    last = "알 수 없음"
    for attempt in range(RETRIES):
        try:
            res = requests.request(method, url, timeout=30, **kwargs)
            if res.status_code < 500:
                return res
            last = f"HTTP {res.status_code}"
        except requests.RequestException as e:
            last = type(e).__name__
        if attempt < RETRIES - 1:
            time.sleep(2 ** attempt)
    raise SyncError(f"Supabase Storage 요청 실패({method}, {RETRIES}회 시도): {last}")


def _is_not_found(res: requests.Response) -> bool:
    # Supabase Storage는 없는 객체를 404 또는 본문에 statusCode 404를 담은 400으로 돌려준다.
    if res.status_code == 404:
        return True
    text = res.text.lower()
    return res.status_code == 400 and ('"404"' in text or "not_found" in text or "not found" in text)


def ensure_bucket() -> bool:
    """비공개 버킷을 보장한다. 새로 만들었으면 True, 이미 있었으면 False."""
    res = _request(
        "POST",
        f"{_base()}/bucket",
        headers=_headers({"Content-Type": "application/json"}),
        json={"id": BUCKET, "name": BUCKET, "public": False},
    )
    if res.status_code in (200, 201):
        return True
    text = res.text.lower()
    if "already exists" in text or "duplicate" in text or res.status_code == 409:
        return False
    raise SyncError(f"버킷 확인 실패: HTTP {res.status_code} {res.text[:200]}")


def _check_sqlite(path: Path) -> None:
    with open(path, "rb") as f:
        if f.read(16) != SQLITE_MAGIC:
            raise SyncError("SQLite 파일이 아닙니다.")
    conn = sqlite3.connect(str(path))
    try:
        result = conn.execute("PRAGMA integrity_check").fetchone()
    finally:
        conn.close()
    if not result or result[0] != "ok":
        raise SyncError(f"integrity_check 실패: {result}")


def pull() -> str:
    """스냅샷을 내려받아 DATA_DIR/state.db 로 둔다. 'restored' 또는 'fresh'를 반환한다."""
    created = ensure_bucket()
    res = _request("GET", f"{_base()}/object/authenticated/{BUCKET}/{OBJECT}", headers=_headers())
    target = db_path()
    target.parent.mkdir(parents=True, exist_ok=True)

    if _is_not_found(res):
        if not created:
            print("::warning::버킷은 있는데 state.db 가 없습니다. 최초 실행이 아니라면 중복 발행에 주의하세요.")
        print("스냅샷 없음: 새 state.db 로 시작합니다.")
        return "fresh"
    if res.status_code != 200:
        raise SyncError(f"스냅샷 다운로드 실패: HTTP {res.status_code} {res.text[:200]}")

    fd, tmp_name = tempfile.mkstemp(dir=str(target.parent), suffix=".db.part")
    os.close(fd)
    tmp = Path(tmp_name)
    try:
        tmp.write_bytes(res.content)
        _check_sqlite(tmp)
        os.replace(tmp, target)
    finally:
        tmp.unlink(missing_ok=True)
    print(f"스냅샷 복원 완료 ({len(res.content)} bytes)")
    return "restored"


def push(source: Optional[Path] = None) -> None:
    """일관된 사본을 만들어 검사한 뒤 덮어써 올린다."""
    source = source or db_path()
    if not source.exists():
        raise SyncError(f"올릴 파일이 없습니다: {source}")

    fd, tmp_name = tempfile.mkstemp(suffix=".db.snapshot")
    os.close(fd)
    tmp = Path(tmp_name)
    try:
        src = sqlite3.connect(str(source))
        dst = sqlite3.connect(str(tmp))
        try:
            src.backup(dst)  # 쓰기 중이어도 일관된 사본
        finally:
            dst.close()
            src.close()
        _check_sqlite(tmp)
        data = tmp.read_bytes()
    finally:
        tmp.unlink(missing_ok=True)

    ensure_bucket()
    res = _request(
        "POST",
        f"{_base()}/object/{BUCKET}/{OBJECT}",
        headers=_headers({"Content-Type": "application/octet-stream", "x-upsert": "true"}),
        data=data,
    )
    if res.status_code not in (200, 201):
        raise SyncError(f"스냅샷 업로드 실패: HTTP {res.status_code} {res.text[:200]}")
    print(f"스냅샷 업로드 완료 ({len(data)} bytes)")


def main(argv: Optional[list] = None) -> int:
    parser = argparse.ArgumentParser(description="state.db ↔ Supabase Storage 동기화")
    parser.add_argument("action", choices=["pull", "push"])
    parser.add_argument("--file", type=Path, help="push 할 파일(기본: DATA_DIR/state.db)")
    args = parser.parse_args(argv)
    try:
        if args.action == "pull":
            pull()
        else:
            push(args.file)
    except SyncError as e:
        print(f"::error::state_sync {args.action} 실패: {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
