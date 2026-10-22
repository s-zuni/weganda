"""캠페인 추적 링크 생성.

analytics 스킬의 UTM 규칙을 따른다: 소문자·하이픈만 사용하고, 개인정보는 넣지 않는다.
스토어 링크는 UTM을 그대로 전달하지 못하므로 스토어별 방식으로 변환한다.
  - Google Play: `referrer=utm_source%3D...` (설치 리퍼러로 전달)
  - Apple App Store: `ct=<캠페인 토큰>` (App Store Connect 캠페인 분석, 40자 이내)
"""
import re
from typing import Dict, Optional
from urllib.parse import parse_qsl, quote, urlencode, urlsplit, urlunsplit

_SLUG_RE = re.compile(r"[^a-z0-9]+")
APPLE_CT_MAX = 40


def slugify(value: str) -> str:
    """소문자·숫자·하이픈만 남긴다 (공백/밑줄/한글 등은 하이픈으로 치환, 양끝 하이픈 제거)."""
    return _SLUG_RE.sub("-", (value or "").lower()).strip("-")


def build_tracking_url(
    url: str,
    *,
    source: str,
    medium: str,
    campaign: str,
    content: Optional[str] = None,
) -> str:
    """추적 파라미터가 붙은 URL을 반환한다. url이 비었거나 http(s)가 아니면 빈 문자열(= 링크 미사용)."""
    url = (url or "").strip()
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return ""

    params: Dict[str, str] = {
        "utm_source": slugify(source),
        "utm_medium": slugify(medium),
        "utm_campaign": slugify(campaign),
    }
    if content:
        params["utm_content"] = slugify(content)
    params = {k: v for k, v in params.items() if v}

    host = parts.netloc.lower()
    existing = dict(parse_qsl(parts.query, keep_blank_values=True))

    if host.endswith("play.google.com"):
        # referrer 값 자체가 하나의 쿼리스트링이므로 한 번 더 인코딩한다.
        existing["referrer"] = urlencode(params)
    elif host.endswith("apps.apple.com") or host.endswith("itunes.apple.com"):
        token = "-".join(v for v in (params.get("utm_campaign"), params.get("utm_content")) if v)
        existing["ct"] = token[:APPLE_CT_MAX].rstrip("-")
    else:
        existing.update(params)

    query = urlencode(existing, quote_via=quote)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, parts.fragment))
