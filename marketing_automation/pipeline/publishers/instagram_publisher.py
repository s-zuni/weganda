import time
from typing import Any, Dict, List, Optional

import requests

from config import Config, is_placeholder

MAX_CAPTION_LEN = 2200


class InstagramPublisher:
    """
    Instagram Graph API 기반 캐러셀(카드뉴스) 발행기
    - 계정 ID 자동 보정(페이지 ID → 인스타 비즈니스 ID)
    - 게시 전 토큰 사전 점검
    - 컨테이너가 FINISHED 될 때까지 대기한 뒤에만 media_publish 호출
    """

    def __init__(self):
        self.account_id = Config.INSTAGRAM_ACCOUNT_ID
        self.access_token = Config.INSTAGRAM_ACCESS_TOKEN
        self.version = Config.INSTAGRAM_GRAPH_VERSION

    def is_configured(self) -> bool:
        return bool(self.account_id and not is_placeholder(self.access_token))

    def _graph(self, path: str = "") -> str:
        return f"https://graph.facebook.com/{self.version}/{path}".rstrip("/")

    @staticmethod
    def _api_error(res: requests.Response) -> str:
        try:
            return res.json().get("error", {}).get("message", res.text)[:300]
        except ValueError:
            return res.text[:300]

    def _resolve_account_id(self) -> str:
        """입력 ID가 페이스북 페이지 ID면 연결된 인스타그램 비즈니스 계정 ID로 전환."""
        try:
            r = requests.get(
                self._graph(self.account_id),
                params={"fields": "id,instagram_business_account", "access_token": self.access_token},
                timeout=10,
            )
            if r.ok:
                ig = r.json().get("instagram_business_account", {}).get("id")
                if ig:
                    return str(ig)
        except requests.RequestException as e:
            print(f"[인스타그램] 계정 ID 자동 확인 중 알림: {e}")
        return self.account_id

    def check_token(self, account_id: Optional[str] = None) -> Optional[str]:
        """문제가 없으면 None, 있으면 원인/해결책 한글 메시지."""
        try:
            res = requests.get(
                self._graph(account_id or self.account_id),
                params={"fields": "id,username", "access_token": self.access_token},
                timeout=15,
            )
        except requests.RequestException as e:
            return f"토큰 사전 점검 중 네트워크 오류: {e}"
        if res.ok:
            return None
        try:
            err = res.json().get("error", {})
        except ValueError:
            err = {}
        msg = err.get("message", res.text[:200])
        if err.get("code") in (190, 102) or "expired" in msg.lower():
            return f"Instagram 액세스 토큰이 만료/무효 상태입니다: {msg} → 토큰을 재발급해 .env의 INSTAGRAM_ACCESS_TOKEN을 갱신하세요."
        return f"Instagram 토큰/계정 점검 실패: {msg}"

    def _wait_container(self, container_id: str, timeout: int = 120, interval: int = 3) -> Optional[str]:
        """FINISHED가 되면 None, 실패/타임아웃이면 원인 메시지."""
        start = time.time()
        last = "UNKNOWN"
        while time.time() - start < timeout:
            try:
                r = requests.get(
                    self._graph(container_id),
                    params={"fields": "status_code,status", "access_token": self.access_token},
                    timeout=15,
                )
                if r.ok:
                    body = r.json()
                    last = body.get("status_code", "UNKNOWN")
                    if last == "FINISHED":
                        return None
                    if last in ("ERROR", "EXPIRED"):
                        return f"미디어 처리 실패({last}): {body.get('status', '')}"
            except requests.RequestException as e:
                print(f"[인스타그램] 컨테이너 상태 조회 일시 오류: {e}")
            time.sleep(interval)
        return f"미디어 처리 대기 시간 초과({timeout}초, 마지막 상태: {last})"

    def publish_carousel(self, image_urls: List[str], caption: str) -> Dict[str, Any]:
        """
        1. 개별 슬라이드 컨테이너 생성 → 2. 각각 FINISHED 대기
        3. 캐러셀 묶음 컨테이너 생성 → 4. FINISHED 대기 → 5. 발행 및 permalink 조회
        """
        if not self.is_configured():
            return {"success": False, "error": "INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN이 설정되지 않았습니다."}
        if not 2 <= len(image_urls) <= 10:
            return {"success": False, "error": f"캐러셀은 이미지 2~10장이 필요합니다 (현재 {len(image_urls)}장)."}
        if len(caption) > MAX_CAPTION_LEN:
            return {"success": False, "error": f"캡션이 {MAX_CAPTION_LEN}자를 초과합니다 ({len(caption)}자)."}

        account_id = self._resolve_account_id()
        token_error = self.check_token(account_id)
        if token_error:
            return {"success": False, "error": token_error}

        try:
            children_ids: List[str] = []
            for idx, img_url in enumerate(image_urls, start=1):
                res = requests.post(
                    self._graph(f"{account_id}/media"),
                    data={"image_url": img_url, "is_carousel_item": "true", "access_token": self.access_token},
                    timeout=30,
                )
                if not res.ok:
                    return {"success": False, "error": f"슬라이드 {idx} 생성 실패: {self._api_error(res)}"}
                children_ids.append(res.json()["id"])

            for idx, cid in enumerate(children_ids, start=1):
                wait_error = self._wait_container(cid)
                if wait_error:
                    return {"success": False, "error": f"슬라이드 {idx}: {wait_error}"}

            car = requests.post(
                self._graph(f"{account_id}/media"),
                data={
                    "media_type": "CAROUSEL",
                    "children": ",".join(children_ids),
                    "caption": caption,
                    "access_token": self.access_token,
                },
                timeout=30,
            )
            if not car.ok:
                return {"success": False, "error": f"캐러셀 묶음 생성 실패: {self._api_error(car)}"}
            carousel_id = car.json()["id"]

            wait_error = self._wait_container(carousel_id)
            if wait_error:
                return {"success": False, "error": wait_error}

            pub = requests.post(
                self._graph(f"{account_id}/media_publish"),
                data={"creation_id": carousel_id, "access_token": self.access_token},
                timeout=30,
            )
            if not pub.ok:
                return {"success": False, "error": f"게시 실패: {self._api_error(pub)}"}
            post_id = pub.json().get("id")

            permalink = ""
            try:
                lr = requests.get(
                    self._graph(post_id),
                    params={"fields": "permalink", "access_token": self.access_token},
                    timeout=15,
                )
                if lr.ok:
                    permalink = lr.json().get("permalink", "")
            except requests.RequestException:
                pass
            return {"success": True, "post_id": post_id, "permalink": permalink}
        except (requests.RequestException, KeyError, ValueError) as e:
            return {"success": False, "error": str(e)}
