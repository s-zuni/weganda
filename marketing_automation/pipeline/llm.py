"""LLM 호출의 단일 진입점 (OpenAI Chat Completions, JSON 모드).

모든 생성 코드는 이 모듈의 `generate_json`만 부른다. 모델·공급자를 바꿀 때 여기만 고치면 된다.

- 응답 형식: `response_format={"type": "json_object"}` + 시스템 메시지에 pydantic JSON 스키마를 넣고,
  결과는 pydantic으로 직접 검증한다. (Structured Outputs의 strict 모드는 기본값·Optional 필드가 있는
  기존 스키마와 충돌하므로 쓰지 않는다.)
- 이미지·PDF는 사용자 메시지의 content part로 전달한다 (비전 지원 모델 필요).
- 실패(네트워크·형식·검증 오류)는 예외로 올린다. 재시도/폴백은 호출자가 정한다.
"""
import base64
from typing import Any, Optional, Sequence, Tuple, Type, TypeVar

from pydantic import BaseModel

from config import Config, is_placeholder

T = TypeVar("T", bound=BaseModel)

REQUEST_TIMEOUT_SEC = 60
SDK_MAX_RETRIES = 2  # 429/5xx/연결 오류에 대한 SDK 자체 재시도


class LLMError(RuntimeError):
    """모델이 거절했거나 응답이 잘렸거나 비어 있을 때."""


def is_configured() -> bool:
    return not is_placeholder(Config.OPENAI_API_KEY)


def _new_client() -> Any:
    from openai import OpenAI  # 키가 없는 환경(테스트 등)에서 SDK 없이도 import 되도록 지연 import

    return OpenAI(api_key=Config.OPENAI_API_KEY, timeout=REQUEST_TIMEOUT_SEC, max_retries=SDK_MAX_RETRIES)


def _file_part(data: bytes, mime: str, index: int) -> dict:
    b64 = base64.b64encode(data).decode("ascii")
    if mime == "application/pdf":
        return {"type": "file", "file": {"filename": f"attachment_{index}.pdf", "file_data": f"data:{mime};base64,{b64}"}}
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}


def generate_json(
    prompt: str,
    schema: Type[T],
    *,
    temperature: Optional[float] = None,
    files: Sequence[Tuple[bytes, str]] = (),
    client: Any = None,
) -> T:
    """프롬프트로 `schema`에 맞는 JSON을 생성해 검증된 pydantic 객체로 돌려준다."""
    system = (
        "응답은 아래 JSON 스키마를 따르는 유효한 JSON 객체 하나만 출력하세요. "
        "설명·마크다운·코드블록 없이 JSON만 출력합니다.\n"
        f"JSON 스키마:\n{schema.model_json_schema()}"
    )
    if files:
        content: Any = [{"type": "text", "text": prompt}] + [_file_part(d, m, i) for i, (d, m) in enumerate(files, 1)]
    else:
        content = prompt

    kwargs: dict = {
        "model": Config.OPENAI_MODEL,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": content}],
        "response_format": {"type": "json_object"},
    }
    if temperature is not None:
        kwargs["temperature"] = temperature

    resp = (client or _new_client()).chat.completions.create(**kwargs)
    choice = resp.choices[0]
    if getattr(choice.message, "refusal", None):
        raise LLMError("모델이 요청을 거절했습니다")
    if choice.finish_reason == "length":
        raise LLMError("응답이 길이 제한으로 잘렸습니다")
    text = (choice.message.content or "").strip()
    if not text:
        raise LLMError("모델 응답이 비어 있습니다")
    return schema.model_validate_json(text)
