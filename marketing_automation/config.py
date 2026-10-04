import os
import sys
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


# 루트 기준 .env 파일 로드
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in ("1", "true", "yes", "y", "on")


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, "").strip() or default)
    except ValueError:
        return default


def clean_token(token: Optional[str]) -> str:
    """붙여넣기 중 섞인 따옴표/공백/줄바꿈/'KEY=' 접두어를 제거합니다."""
    t = (token or "").strip()
    if "=" in t[:30]:
        t = t.split("=", 1)[1]
    return "".join(t.split()).strip("'\"")


def is_placeholder(value: Optional[str]) -> bool:
    """미설정/예시값(your_..., 기존토큰 등) 여부."""
    v = (value or "").strip()
    return (not v) or v.lower().startswith("your_") or v.startswith("기존")


def mask_secret(value: Optional[str], show_chars: int = 4) -> str:
    """보안 마스킹 유틸리티: 로그 출력 시 비밀 키 노출 방지"""
    if not value:
        return "[미설정]"
    if len(value) <= show_chars * 2:
        return "****"
    return f"{value[:show_chars]}...{value[-show_chars:]}"


class Config:
    # Google Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")

    # Telegram (보안 핵심: ADMIN_CHAT_ID 화이트리스트)
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_ADMIN_CHAT_ID: int = _env_int("TELEGRAM_ADMIN_CHAT_ID", 0)

    # weganda Supabase (커뮤니티 연동)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    OFFICIAL_BOT_AUTHOR_ID: str = os.getenv("OFFICIAL_BOT_AUTHOR_ID", "")

    # Meta Instagram & Threads
    INSTAGRAM_ACCOUNT_ID: str = os.getenv("INSTAGRAM_ACCOUNT_ID", "")
    INSTAGRAM_ACCESS_TOKEN: str = clean_token(os.getenv("INSTAGRAM_ACCESS_TOKEN", ""))
    THREADS_USER_ID: str = os.getenv("THREADS_USER_ID", "")
    THREADS_ACCESS_TOKEN: str = clean_token(os.getenv("THREADS_ACCESS_TOKEN", ""))
    FB_APP_ID: str = os.getenv("FB_APP_ID", "")
    FB_APP_SECRET: str = os.getenv("FB_APP_SECRET", "")
    THREADS_APP_SECRET: str = os.getenv("THREADS_APP_SECRET", "")
    INSTAGRAM_GRAPH_VERSION: str = os.getenv("INSTAGRAM_GRAPH_VERSION", "v21.0")
    THREADS_API_VERSION: str = os.getenv("THREADS_API_VERSION", "v1.0")

    # 운영 안전장치 (기본값은 모두 '안전한 쪽')
    DRY_RUN: bool = _env_bool("DRY_RUN", True)
    ALLOW_MOCK_JOBS: bool = _env_bool("ALLOW_MOCK_JOBS", False)
    MAX_POSTS_PER_DAY: int = _env_int("MAX_POSTS_PER_DAY", 1)
    JOB_MIN_DDAY: int = _env_int("JOB_MIN_DDAY", 2)  # 마감 N일 미만 공고는 추천 제외
    DATA_GO_KR_SERVICE_KEY: str = os.getenv("DATA_GO_KR_SERVICE_KEY", "")  # 잡알리오(공공기관 채용) API
    WORKNET_API_KEY: str = os.getenv("WORKNET_API_KEY", "")  # 고용24 채용정보 API (기업회원 키 필요)
    APP_DOWNLOAD_URL: str = os.getenv("APP_DOWNLOAD_URL", "")
    INSTAGRAM_HANDLE: str = os.getenv("INSTAGRAM_HANDLE", "")

    # Media Hosting
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")

    # System & Scheduler
    SCHEDULE_TIME_KST: str = os.getenv("SCHEDULE_TIME_KST", "08:30")
    TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Seoul")

    # Directories
    # 영구 저장소 경로: Railway에서는 Volume 마운트 경로(예: /data)로 지정 — state.db(중복 발행 방지 기록)가 재배포 후에도 유지됨
    DATA_DIR: Path = Path(os.getenv("DATA_DIR") or BASE_DIR)
    OUTPUT_DIR: Path = BASE_DIR / "assets" / "output"
    TEMP_DIR: Path = BASE_DIR / "assets" / "temp"
    TEMPLATE_DIR: Path = BASE_DIR / "templates"

    @classmethod
    def validate_essential(cls) -> None:
        """기본 필수 환경변수 검증"""
        missing = []
        if not cls.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        if not cls.TELEGRAM_BOT_TOKEN:
            missing.append("TELEGRAM_BOT_TOKEN")
        if cls.TELEGRAM_ADMIN_CHAT_ID == 0:
            missing.append("TELEGRAM_ADMIN_CHAT_ID (보안 화이트리스트용 ID 필수)")
        
        if missing:
            print(f"[보안 경고] 필수 환경변수가 설정되지 않았습니다: {', '.join(missing)}")
            print("[안내] marketing_automation/.env 파일을 생성하고 설정해주세요.")

    @classmethod
    def print_status(cls) -> None:
        """보안 마스킹 처리된 상태 출력"""
        print("=" * 50)
        print("🔒 weganda 마케팅 자동화 보안 환경 상태")
        print("=" * 50)
        print(f"• Gemini Model        : {cls.GEMINI_MODEL} ({mask_secret(cls.GEMINI_API_KEY)})")
        print(f"• Telegram Admin ID   : {cls.TELEGRAM_ADMIN_CHAT_ID} (화이트리스트 보호)")
        print(f"• Telegram Bot Token  : {mask_secret(cls.TELEGRAM_BOT_TOKEN)}")
        print(f"• Supabase URL        : {cls.SUPABASE_URL}")
        print(f"• Supabase Role Key   : {mask_secret(cls.SUPABASE_SERVICE_ROLE_KEY)}")
        print(f"• Official Bot ID     : {cls.OFFICIAL_BOT_AUTHOR_ID or '[미지정 (기본 프로필 대체)]'}")
        print(f"• Instagram Account   : {cls.INSTAGRAM_ACCOUNT_ID or '[미설정]'}")
        print(f"• Threads User ID     : {cls.THREADS_USER_ID or '[미설정]'}")
        print(f"• Timezone / Schedule : {cls.TIMEZONE} / {cls.SCHEDULE_TIME_KST}")
        print(f"• DRY_RUN             : {cls.DRY_RUN} ({'실제 발행 안 함' if cls.DRY_RUN else '⚠️ 실제 발행 활성'})")
        print(f"• Mock 공고 허용      : {cls.ALLOW_MOCK_JOBS} / 일일 발행 한도: {cls.MAX_POSTS_PER_DAY}")
        print(f"• Instagram Token     : {'[미설정/예시값]' if is_placeholder(cls.INSTAGRAM_ACCESS_TOKEN) else mask_secret(cls.INSTAGRAM_ACCESS_TOKEN)}")
        print(f"• Threads Token       : {'[미설정/예시값]' if is_placeholder(cls.THREADS_ACCESS_TOKEN) else mask_secret(cls.THREADS_ACCESS_TOKEN)}")
        print("=" * 50)


# 디렉토리 자동 생성
Config.DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
Config.TEMP_DIR.mkdir(parents=True, exist_ok=True)
