import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests

from crawlers.base_crawler import DEFAULT_HEADERS
from security.sanitizer import validate_and_sanitize_url

MAX_REDIRECTS = 3
ALLOWED_PORTS = (None, 80, 443)


class UnsafeURLError(ValueError):
    """내부망/비정상 URL 등 가져오면 안 되는 대상."""


@dataclass
class FetchResult:
    content: bytes
    content_type: str
    final_url: str


def _assert_public_host(host: str) -> None:
    """호스트가 가리키는 모든 IP가 공인 주소인지 확인 (사설망·루프백·링크로컬·메타데이터 주소 차단)."""
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror as e:
        raise UnsafeURLError(f"도메인을 찾을 수 없습니다: {host}") from e
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast
                or ip.is_reserved or ip.is_unspecified):
            raise UnsafeURLError("내부망/비공개 주소로 향하는 URL은 허용되지 않습니다.")


def safe_get(url: str, max_bytes: int = 5_000_000, timeout: int = 15) -> FetchResult:
    """
    관리자가 제보한 URL을 안전하게 가져온다.
    - http/https만, 80/443 포트만
    - 모든 리다이렉트 단계마다 공인 IP 검증 (최대 3회)
    - 응답 크기 상한 (스트리밍으로 초과 즉시 중단)
    * 검증 후 연결 사이의 DNS 재바인딩까지는 막지 못하므로, 관리자 전용 기능에서만 사용할 것.
    """
    current = validate_and_sanitize_url(url)
    if not current:
        raise UnsafeURLError("올바른 http/https URL이 아닙니다.")

    for _ in range(MAX_REDIRECTS + 1):
        parsed = urlparse(current)
        if parsed.port not in ALLOWED_PORTS:
            raise UnsafeURLError("허용되지 않는 포트입니다.")
        _assert_public_host(parsed.hostname or "")

        with requests.get(current, headers=DEFAULT_HEADERS, timeout=timeout, stream=True,
                          allow_redirects=False, verify=True) as resp:
            if resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
                nxt = resp.headers.get("Location", "")
                current = validate_and_sanitize_url(urljoin(current, nxt))
                if not current:
                    raise UnsafeURLError("안전하지 않은 리다이렉트 대상입니다.")
                continue
            resp.raise_for_status()
            chunks, size = [], 0
            for chunk in resp.iter_content(64 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    raise UnsafeURLError(f"응답이 너무 큽니다 (>{max_bytes // 1_000_000}MB).")
                chunks.append(chunk)
            ctype = resp.headers.get("Content-Type", "").split(";")[0].strip().lower()
            return FetchResult(b"".join(chunks), ctype, current)

    raise UnsafeURLError("리다이렉트가 너무 많습니다.")
