import json
import unittest
from types import SimpleNamespace
from typing import List, Optional

from pydantic import BaseModel, Field

from tests import _bootstrap  # noqa: F401  (환경 준비)
from config import Config
from pipeline import llm


class Sample(BaseModel):
    title: str = Field(..., description="제목")
    tags: List[str] = Field(default_factory=list)
    note: Optional[str] = None


class FakeCompletions:
    def __init__(self, content=None, finish_reason="stop", refusal=None):
        self.calls = []
        self._msg = SimpleNamespace(content=content, refusal=refusal)
        self._finish = finish_reason

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(choices=[SimpleNamespace(message=self._msg, finish_reason=self._finish)])


def fake_client(**kw):
    comp = FakeCompletions(**kw)
    return SimpleNamespace(chat=SimpleNamespace(completions=comp)), comp


class GenerateJson(unittest.TestCase):
    def setUp(self):
        self._model = Config.OPENAI_MODEL
        Config.OPENAI_MODEL = "test-model"

    def tearDown(self):
        Config.OPENAI_MODEL = self._model

    def test_returns_validated_model_and_sends_json_mode_with_schema(self):
        client, comp = fake_client(content=json.dumps({"title": "안녕", "tags": ["a"]}))
        out = llm.generate_json("본문 프롬프트", Sample, temperature=0.7, client=client)
        self.assertEqual((out.title, out.tags, out.note), ("안녕", ["a"], None))

        call = comp.calls[0]
        self.assertEqual(call["model"], "test-model")
        self.assertEqual(call["response_format"], {"type": "json_object"})
        self.assertEqual(call["temperature"], 0.7)
        system, user = call["messages"]
        self.assertEqual(system["role"], "system")
        self.assertIn("JSON", system["content"])  # JSON 모드는 프롬프트에 'JSON'이 있어야 한다
        self.assertIn("title", system["content"])  # 스키마가 전달된다
        self.assertEqual(user["content"], "본문 프롬프트")

    def test_temperature_is_omitted_when_not_given(self):
        client, comp = fake_client(content='{"title": "x"}')
        llm.generate_json("p", Sample, client=client)
        self.assertNotIn("temperature", comp.calls[0])

    def test_files_become_image_and_pdf_parts(self):
        client, comp = fake_client(content='{"title": "x"}')
        llm.generate_json("p", Sample, files=[(b"img", "image/png"), (b"pdf", "application/pdf")], client=client)
        content = comp.calls[0]["messages"][1]["content"]
        self.assertEqual(content[0], {"type": "text", "text": "p"})
        self.assertEqual(content[1]["type"], "image_url")
        self.assertTrue(content[1]["image_url"]["url"].startswith("data:image/png;base64,"))
        self.assertEqual(content[2]["type"], "file")
        self.assertTrue(content[2]["file"]["file_data"].startswith("data:application/pdf;base64,"))

    def test_failures_raise(self):
        cases = [
            dict(content=""),  # 빈 응답
            dict(content="{"),  # 깨진 JSON
            dict(content='{"tags": []}'),  # 필수 필드 누락
            dict(content='{"title": "x"}', finish_reason="length"),  # 잘림
            dict(content=None, refusal="거절"),  # 거절
        ]
        for kw in cases:
            client, _ = fake_client(**kw)
            with self.assertRaises(Exception, msg=str(kw)):
                llm.generate_json("p", Sample, client=client)


class TemperatureFallback(unittest.TestCase):
    """temperature를 거부하는 모델: 빼고 한 번 재시도하고, 이후 호출은 처음부터 빼서 보낸다."""

    class Reject400(Exception):
        status_code = 400

    def setUp(self):
        self._model = Config.OPENAI_MODEL
        Config.OPENAI_MODEL = "picky-model"
        llm._NO_TEMPERATURE_MODELS.discard("picky-model")

    def tearDown(self):
        Config.OPENAI_MODEL = self._model
        llm._NO_TEMPERATURE_MODELS.discard("picky-model")

    def _picky_client(self):
        calls = []

        def create(**kwargs):
            calls.append(dict(kwargs))
            if "temperature" in kwargs:
                raise self.Reject400("Unsupported value: 'temperature' does not support 0.9 with this model.")
            msg = SimpleNamespace(content='{"title": "ok"}', refusal=None)
            return SimpleNamespace(choices=[SimpleNamespace(message=msg, finish_reason="stop")])

        return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create))), calls

    def test_retries_without_temperature_then_remembers(self):
        client, calls = self._picky_client()
        self.assertEqual(llm.generate_json("p", Sample, temperature=0.9, client=client).title, "ok")
        self.assertEqual(len(calls), 2)
        self.assertNotIn("temperature", calls[1])

        llm.generate_json("p", Sample, temperature=0.9, client=client)
        self.assertEqual(len(calls), 3)  # 두 번째 호출부터는 처음부터 temperature 없이 한 번만 보낸다

    def test_other_400_errors_are_not_swallowed(self):
        def create(**kwargs):
            raise self.Reject400("invalid model")

        client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
        with self.assertRaises(self.Reject400):
            llm.generate_json("p", Sample, temperature=0.9, client=client)
        self.assertNotIn("picky-model", llm._NO_TEMPERATURE_MODELS)


class Configured(unittest.TestCase):
    def test_placeholder_keys_are_not_configured(self):
        original = Config.OPENAI_API_KEY
        try:
            for value, expected in (("", False), ("your_openai_api_key_here", False), ("sk-real", True)):
                Config.OPENAI_API_KEY = value
                self.assertEqual(llm.is_configured(), expected, value)
        finally:
            Config.OPENAI_API_KEY = original


if __name__ == "__main__":
    unittest.main()
