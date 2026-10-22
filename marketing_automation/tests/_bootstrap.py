"""테스트 공통 준비. 다른 테스트 모듈이 가장 먼저 import 한다.

- 운영 state.db를 건드리지 않도록 임시 DATA_DIR을 지정한다(config import 전에 설정해야 함).
- 외부 호출이 없도록 API 키/다운로드 URL을 비운다.
- 이 환경에 설치되지 않은 무관한 서드파티(HTML 파싱·이미지 렌더링 등)는 스텁으로 대체한다.
  테스트 대상은 순수 로직과 SQLite 저장소이며 네트워크는 사용하지 않는다.
"""
import importlib
import os
import sqlite3
import sys
import tempfile
import threading
import types
from pathlib import Path

os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="weganda_test_")
os.environ["GEMINI_API_KEY"] = ""
os.environ["APP_DOWNLOAD_URL"] = ""
os.environ["TELEGRAM_BOT_TOKEN"] = ""

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _stub_getattr(attr: str):
    if attr.startswith("__"):
        raise AttributeError(attr)
    return type(attr, (), {})  # `from x import Y` 허용


for _name in ("bs4", "playwright", "playwright.sync_api", "cloudinary", "cloudinary.uploader", "PIL", "jinja2"):
    try:
        importlib.import_module(_name)
    except ImportError:
        _m = types.ModuleType(_name)
        _m.__path__ = []  # 패키지처럼 보이게 해서 하위 모듈 import를 허용
        _m.__getattr__ = _stub_getattr
        sys.modules[_name] = _m


def make_storage():
    """테스트마다 독립된 인메모리 Storage."""
    from bot.storage import Storage

    s = Storage.__new__(Storage)
    s.conn = sqlite3.connect(":memory:", check_same_thread=False)
    s._lock = threading.Lock()
    s._init_db()
    return s
