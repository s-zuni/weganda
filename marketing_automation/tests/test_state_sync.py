import importlib.util
import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests import _bootstrap  # noqa: F401  (경로·환경 준비)

_spec = importlib.util.spec_from_file_location(
    "state_sync", Path(__file__).resolve().parent.parent / "scripts" / "state_sync.py"
)
state_sync = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(state_sync)


class Resp:
    def __init__(self, status=200, text="", content=b""):
        self.status_code = status
        self.text = text
        self.content = content


def make_db_bytes() -> bytes:
    fd, name = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    conn = sqlite3.connect(name)
    conn.execute("CREATE TABLE bot_settings (key TEXT PRIMARY KEY, value TEXT)")
    conn.execute("INSERT INTO bot_settings VALUES ('k', 'v')")
    conn.commit()
    conn.close()
    data = Path(name).read_bytes()
    Path(name).unlink()
    return data


class StateSync(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="sync_")
        self.env = mock.patch.dict(
            os.environ,
            {"SUPABASE_URL": "https://x.supabase.co", "SUPABASE_SERVICE_ROLE_KEY": "SECRET-KEY", "DATA_DIR": self.dir},
        )
        self.env.start()
        self.sleep = mock.patch.object(state_sync.time, "sleep")
        self.sleep.start()
        self.addCleanup(self.env.stop)
        self.addCleanup(self.sleep.stop)
        self.target = Path(self.dir) / "state.db"

    def route(self, bucket, obj):
        def fake(method, url, **kwargs):
            return bucket if url.endswith("/bucket") else obj

        return mock.patch.object(state_sync.requests, "request", side_effect=fake)

    def test_missing_object_starts_fresh(self):
        for missing in (Resp(404), Resp(400, '{"statusCode":"404","error":"not_found"}')):
            with self.route(Resp(200), missing):
                self.assertEqual(state_sync.pull(), "fresh")
            self.assertFalse(self.target.exists())

    def test_auth_error_aborts_instead_of_starting_fresh(self):
        with self.route(Resp(200), Resp(401, "unauthorized")):
            with self.assertRaises(state_sync.SyncError):
                state_sync.pull()
        self.assertFalse(self.target.exists())

    def test_server_error_aborts_after_retries(self):
        with self.route(Resp(200), Resp(503)) as req:
            with self.assertRaises(state_sync.SyncError):
                state_sync.pull()
        self.assertEqual(sum(1 for c in req.call_args_list if c.args[1].endswith("state.db")), state_sync.RETRIES)

    def test_valid_snapshot_is_restored(self):
        data = make_db_bytes()
        with self.route(Resp(400, "already exists"), Resp(200, content=data)):
            self.assertEqual(state_sync.pull(), "restored")
        conn = sqlite3.connect(str(self.target))
        self.assertEqual(conn.execute("SELECT value FROM bot_settings WHERE key='k'").fetchone()[0], "v")
        conn.close()

    def test_corrupt_download_keeps_existing_file(self):
        self.target.write_bytes(make_db_bytes())
        before = self.target.read_bytes()
        with self.route(Resp(200), Resp(200, content=b"not a database")):
            with self.assertRaises(state_sync.SyncError):
                state_sync.pull()
        self.assertEqual(self.target.read_bytes(), before)

    def test_push_uploads_consistent_valid_snapshot(self):
        self.target.write_bytes(make_db_bytes())
        sent = {}

        def fake(method, url, **kwargs):
            if url.endswith("/bucket"):
                return Resp(409, "Duplicate")
            sent.update(kwargs)
            return Resp(200)

        with mock.patch.object(state_sync.requests, "request", side_effect=fake):
            state_sync.push()
        self.assertTrue(sent["data"].startswith(state_sync.SQLITE_MAGIC))
        self.assertEqual(sent["headers"]["x-upsert"], "true")

    def test_push_failure_raises(self):
        self.target.write_bytes(make_db_bytes())
        with self.route(Resp(200), Resp(403, "denied")):
            with self.assertRaises(state_sync.SyncError):
                state_sync.push()

    def test_push_without_file_raises(self):
        with self.assertRaises(state_sync.SyncError):
            state_sync.push()

    def test_secret_is_not_printed_on_failure(self):
        with self.route(Resp(200), Resp(401, "unauthorized")):
            with mock.patch("builtins.print") as printed:
                self.assertEqual(state_sync.main(["pull"]), 1)
        self.assertNotIn("SECRET-KEY", " ".join(str(c) for c in printed.call_args_list))


if __name__ == "__main__":
    unittest.main()
