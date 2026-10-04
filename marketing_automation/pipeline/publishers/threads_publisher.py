import time
from typing import Any, Dict, List

import requests

from config import Config, is_placeholder

MAX_TEXT_LEN = 500


class ThreadsPublisher:
    """
    Meta Threads API 기반 채용 속보 타래(Thread) 발행기
    - 글자 수(500자) 사전 검증
    - 중간 실패 시 이미 올라간 글 ID를 함께 반환
    """

    def __init__(self):
        self.user_id = Config.THREADS_USER_ID
        self.access_token = Config.THREADS_ACCESS_TOKEN
        self.base = f"https://graph.threads.net/{Config.THREADS_API_VERSION}"

    def is_configured(self) -> bool:
        return bool(self.user_id and not is_placeholder(self.access_token))

    @staticmethod
    def _api_error(res: requests.Response) -> str:
        try:
            err = res.json().get("error", {})
            return f"[{err.get('code')}/{err.get('error_subcode')}] {err.get('message', res.text)}"[:300]
        except ValueError:
            return res.text[:300]

    def _post_one(self, text: str, reply_to_id: str = "") -> Dict[str, Any]:
        payload: Dict[str, Any] = {"media_type": "TEXT", "text": text, "access_token": self.access_token}
        if reply_to_id:
            payload["reply_to_id"] = reply_to_id

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

    def publish_thread_chain(self, posts: List[str]) -> Dict[str, Any]:
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
                r = self._post_one(text, reply_to_id=ids[-1] if ids else "")
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
