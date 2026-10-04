import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup


def clean_html_to_plain_text(raw_html: str) -> str:
    """
    외부 크롤링 HTML에서 텍스트만 안전하게 추출하고,
    악성 스크립트/태그 및 연속된 공백을 정제합니다.
    """
    if not raw_html:
        return ""
    # BeautifulSoup 파싱
    soup = BeautifulSoup(raw_html, "html.parser")
    # 스크립트 및 스타일 태그 원천 제거
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    # 다중 공백 및 제어문자 정제
    cleaned = re.sub(r"[ \t]+", " ", text)
    cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
    return cleaned.strip()


def validate_and_sanitize_url(url: str) -> str:
    """
    공고 원문 URL 보안 검증:
    http/https 프로토콜만 허용하고, javascript:/data: 등 취약점 차단
    """
    if not url:
        return ""
    url = url.strip()
    try:
        parsed = urlparse(url)
        if parsed.scheme.lower() not in ("http", "https"):
            print(f"[보안 경고] 안전하지 않은 URL 스키마 차단됨: {parsed.scheme}")
            return ""
        if not parsed.netloc:
            return ""
        return url
    except Exception as e:
        print(f"[보안 경고] URL 파싱 오류: {e}")
        return ""


def escape_telegram_markdown(text: str) -> str:
    """
    Telegram MarkdownV2 예약어 이스케이프:
    특수문자로 인한 400 Bad Request 에러 방지
    """
    escape_chars = r"_*[]()~`>#+-=|{}.!"
    return re.sub(f"([{re.escape(escape_chars)}])", r"\\\1", text)
