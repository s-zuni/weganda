import time
from typing import Any, Dict, List, Optional

import requests

from config import Config, clean_token, is_placeholder

MAX_TEXT_LEN = 500
THREADS_API_BASE = "https://graph.threads.net"


class ThreadsPublisher:
    """
    Meta Threads API 기반 타래(Thread) 발행기
    - 글자 수(500자) 사전 검증
    - 공식 topic_tag 파라미터 지원 (본문 해시태그 없이 토픽 노출 극대화)
    - 장기 토큰(60일) 자동 갱신 지원
    - 중간 실패 시 이미 올라간 글 ID를 함께 반환
    """

    def __init__(self, access_token: Optional[str] = None):
        self.user_id = Config.THREADS_USER_ID
        self.access_token = clean_token(access_token or Config.THREADS_ACCESS_TOKEN)
        self.base = f"{THREADS_API_BASE}/{Config.THREADS_API_VERSION}"

    def is_configured(self) -> bool:
        return bool(self.user_id and not is_placeholder(self.access_token))

    @staticmethod
    def _api_error(res: requests.Response) -> str:
        try:
            err = res.json().get("error", {})
            return f"[{err.get('code')}/{err.get('error_subcode')}] {err.get('message', res.text)}"[:300]
        except ValueError:
            return res.text[:300]

    def refresh_long_lived_token(self, token: Optional[str] = None) -> Dict[str, Any]:
        """장기 액세스 토큰(60일)을 만료 전 연장합니다. 반환: {access_token, expires_in} 또는 {error}"""
        tok = clean_token(token or self.access_token)
        if is_placeholder(tok):
            return {"error": "THREADS_ACCESS_TOKEN이 설정되지 않았습니다."}
        try:
            res = requests.get(
                f"{THREADS_API_BASE}/refresh_access_token",
                params={"grant_type": "th_refresh_token", "access_token": tok},
                timeout=30,
            )
            if not res.ok:
                return {"error": self._api_error(res)}
            data = res.json()
            if data.get("access_token"):
                self.access_token = clean_token(data["access_token"])
            return data
        except (requests.RequestException, ValueError) as e:
            return {"error": str(e)}

    def _post_one(self, text: str, reply_to_id: str = "", topic_tag: Optional[str] = None) -> Dict[str, Any]:
        payload: Dict[str, Any] = {"media_type": "TEXT", "text": text, "access_token": self.access_token}
        if topic_tag and not reply_to_id:
            payload["topic_tag"] = topic_tag
        if reply_to_id:
            payload["reply_to_id"] = reply_to_id

        res = requests.post(f"{self.base}/{self.user_id}/threads", data=payload, timeout=30)
        if not res.ok and topic_tag and not reply_to_id:
            # topic_tag 거부 시 태그 제외하고 안전 재시도
            payload.pop("topic_tag", None)
            res = requests.post(f"{self.base}/{self.user_id}/threads", data=payload, timeout=30)
        if not res.ok:
            return {"error": f"컨테이너 생성 실패: {self._api_error(res)}"}
        creation_id = res.json().get("id")

        time.sleep(3)  # 컨테이너 처리 대기

        pub = requests.post(
            f"{self.base}/{self.user_id}/threads_publish",
            data={"creation_id": creation_id, "access_token": self.access_token},
            timeout=30,
        )
        if not pub.ok:
            return {"error": f"게시 실패: {self._api_error(pub)}"}
        post_id = pub.json().get("id")

        permalink = ""
        try:
            lr = requests.get(
                f"{self.base}/{post_id}",
                params={"fields": "permalink", "access_token": self.access_token},
                timeout=15,
            )
            if lr.ok:
                permalink = lr.json().get("permalink", "")
        except requests.RequestException:
            pass
        return {"id": post_id, "permalink": permalink}

    def publish_thread_chain(
        self,
        posts: List[str],
        topic_tag: Optional[str] = None,
    ) -> Dict[str, Any]:
        """posts[0]=본문, 이후는 직전 글에 이어지는 답글."""
        if not self.is_configured():
            return {"success": False, "error": "THREADS_USER_ID / THREADS_ACCESS_TOKEN이 설정되지 않았습니다."}
        posts = [p.strip() for p in posts if p and p.strip()]
        if not posts:
            return {"success": False, "error": "게시할 글이 없습니다."}
        for i, text in enumerate(posts, start=1):
            if len(text) > MAX_TEXT_LEN:
                return {"success": False, "error": f"{i}번째 글이 {MAX_TEXT_LEN}자를 초과합니다 ({len(text)}자)."}

        ids: List[str] = []
        permalink = ""
        try:
            for i, text in enumerate(posts):
                if i:
                    time.sleep(2)
                r = self._post_one(
                    text,
                    reply_to_id=ids[-1] if ids else "",
                    topic_tag=topic_tag if i == 0 else None,
                )
                if "error" in r:
                    return {
                        "success": False,
                        "thread_ids": ids,
                        "permalink": permalink,
                        "error": f"{i + 1}번째 글 실패 (앞선 {len(ids)}개는 이미 게시됨): {r['error']}",
                    }
                ids.append(r["id"])
                if i == 0:
                    permalink = r.get("permalink", "")
        except (requests.RequestException, ValueError) as e:
            return {"success": False, "thread_ids": ids, "permalink": permalink, "error": str(e)}
        return {"success": True, "thread_ids": ids, "permalink": permalink}
