"""성과(Insights) 수집 공통 부품: 응답 파서, 오류 분류, 결과 타입.

네트워크 호출은 각 퍼블리셔(threads/instagram/community)가 담당하고, 이 모듈은 순수 로직만 가진다.
성과 수집은 보조 기능이므로 어떤 실패도 발행 흐름에 영향을 주지 않도록 예외 대신 FetchResult로 돌려준다.
"""
from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Tuple

import requests

from config import redact_secrets

REQUEST_TIMEOUT = 15

# Meta Graph API 오류 코드 중 같은 채널의 나머지 요청도 실패하게 만드는 것(권한 부족·토큰 무효)
_FATAL_CODES = {10, 102, 190, 200}


@dataclass(frozen=True)
class FetchResult:
    ok: bool
    metrics: Dict[str, float] = field(default_factory=dict)
    error: str = ""
    fatal: bool = False  # True면 권한/토큰 문제 — 이번 수집 라운드에서 해당 채널을 더 시도하지 않는다


def parse_insights_payload(payload: Any) -> Dict[str, float]:
    """Graph API insights 응답({'data': [{'name', 'values': [{'value'}]}]})을 {지표: 값}으로 변환한다.
    숫자가 아닌 값(딕셔너리형 분해 지표 등)은 버린다."""
    if not isinstance(payload, dict):
        return {}
    out: Dict[str, float] = {}
    for item in payload.get("data") or []:
        if not isinstance(item, dict) or not item.get("name"):
            continue
        value: Any = None
        values = item.get("values")
        if isinstance(values, list) and values and isinstance(values[0], dict):
            value = values[0].get("value")
        elif isinstance(item.get("total_value"), dict):
            value = item["total_value"].get("value")
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            out[str(item["name"])] = float(value)
    return out


def classify_error(res: requests.Response) -> Tuple[str, bool]:
    """(사람이 읽을 메시지, 치명적 여부). 응답 본문이 JSON이 아니어도 안전하다."""
    try:
        err = res.json().get("error", {})
    except ValueError:
        return redact_secrets(f"HTTP {res.status_code}: {res.text[:160]}"), False
    code = err.get("code")
    message = str(err.get("message", res.text[:160]))
    fatal = code in _FATAL_CODES or "permission" in message.lower()
    return redact_secrets(f"[{code}] {message}")[:300], fatal


def fetch_insights(
    url: str,
    params: Dict[str, str],
    *,
    http_get: Optional[Any] = None,
) -> FetchResult:
    """insights 엔드포인트를 호출해 FetchResult로 돌려준다. http_get은 테스트에서 가짜 호출로 바꿀 수 있다."""
    getter = http_get or requests.get
    try:
        res = getter(url, params=params, timeout=REQUEST_TIMEOUT)
    except requests.RequestException as e:
        return FetchResult(False, error=redact_secrets(e))
    if not res.ok:
        message, fatal = classify_error(res)
        return FetchResult(False, error=message, fatal=fatal)
    try:
        metrics = parse_insights_payload(res.json())
    except ValueError:
        return FetchResult(False, error="응답 JSON 파싱 실패")
    if not metrics:
        return FetchResult(False, error="응답에 수치 지표가 없음")
    return FetchResult(True, metrics=metrics)
