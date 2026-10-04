import time
import requests
from typing import Optional, Dict, Any


DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
}


class BaseCrawler:
    """
    보안 및 안정성 강화 베이스 크롤러:
    - 표준 User-Agent 적용
    - SSL 검증 강제 (verify=True)
    - 연결 타임아웃 및 지연 처리 (과도한 트래픽 유발 방지)
    """

    def __init__(self, timeout: int = 10, delay_seconds: float = 1.0):
        self.timeout = timeout
        self.delay_seconds = delay_seconds
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)

    def fetch_json(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """JSON API 호출. 실패 시 None (오류 메시지에 서비스키가 노출되지 않도록 params는 출력하지 않음)."""
        try:
            time.sleep(self.delay_seconds)
            response = self.session.get(url, params=params, timeout=self.timeout, verify=True)
            response.raise_for_status()
            return response.json()
        except (requests.exceptions.RequestException, ValueError) as e:
            print(f"[크롤러 경고] JSON 요청 실패 ({url}): {type(e).__name__}")
            return None

    def fetch(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[str]:
        try:
            time.sleep(self.delay_seconds)
            response = self.session.get(
                url,
                params=params,
                timeout=self.timeout,
                verify=True,  # 🔒 SSL 인증서 검증 필수
            )
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"[크롤러 경고] 요청 실패 ({url}): {e}")
            return None
