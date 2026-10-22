import re
import uuid
from typing import Any, Dict, List, Optional

import requests

from config import Config, redact_secrets
from pipeline.content_planner import CommunityPlan
from pipeline.insights import FetchResult

REQUEST_TIMEOUT = 15
_POST_ID_RE = re.compile(r"[A-Za-z0-9-]{1,64}")  # PostgREST 필터에 들어가는 값이므로 허용 문자를 제한한다


class CommunityPublisher:
    """
    weganda 앱 커뮤니티 '채용/취업 정보' 게시판 자동 등록기
    - Supabase REST API / posts 테이블 연동
    - 공식 채용 알리미 계정(author_id)으로 안전하게 글 작성
    - 렌더링된 카드뉴스 이미지 목록(images) 자동 첨부
    """

    def __init__(self):
        self.supabase_url = Config.SUPABASE_URL.rstrip("/")
        self.role_key = Config.SUPABASE_SERVICE_ROLE_KEY
        self.author_id = Config.OFFICIAL_BOT_AUTHOR_ID

    def is_configured(self) -> bool:
        return bool(self.supabase_url and self.role_key)

    def fetch_stats(self, post_id: str, http_get: Optional[Any] = None) -> FetchResult:
        """앱 안에서의 조회·좋아요·댓글 수. 서비스 롤 키로 읽기만 한다."""
        if not self.is_configured():
            return FetchResult(False, error="Supabase 미설정", fatal=True)
        if not _POST_ID_RE.fullmatch(post_id or ""):
            return FetchResult(False, error="게시글 ID 형식 오류")
        getter = http_get or requests.get
        try:
            res = getter(
                f"{self.supabase_url}/rest/v1/posts",
                params={"id": f"eq.{post_id}", "select": "views_count,likes_count,comments_count"},
                headers={"apikey": self.role_key, "Authorization": f"Bearer {self.role_key}"},
                timeout=REQUEST_TIMEOUT,
            )
            if not res.ok:
                return FetchResult(False, error=redact_secrets(f"HTTP {res.status_code}: {res.text[:160]}"))
            rows = res.json()
        except (requests.RequestException, ValueError) as e:
            return FetchResult(False, error=redact_secrets(e))
        if not rows:
            return FetchResult(False, error="게시글을 찾을 수 없음(삭제·숨김 가능)")
        row = rows[0]
        metrics = {
            "views": float(row.get("views_count") or 0),
            "likes": float(row.get("likes_count") or 0),
            "comments": float(row.get("comments_count") or 0),
        }
        return FetchResult(True, metrics=metrics)

    def publish_post(
        self,
        plan: CommunityPlan,
        image_urls: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Supabase 'posts' 테이블에 새 게시글을 등록합니다.
        """
        if not self.is_configured():
            return {"success": False, "error": "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."}

        endpoint = f"{self.supabase_url}/rest/v1/posts"
        headers = {
            "apikey": self.role_key,
            "Authorization": f"Bearer {self.role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        # author_id는 profiles(FK)에 실존하는 UUID여야 하므로 형식 검증 후 없으면 발행 중단
        author_uuid = self.author_id
        try:
            uuid.UUID(author_uuid)
        except (ValueError, AttributeError, TypeError):
            return {"success": False, "error": "OFFICIAL_BOT_AUTHOR_ID가 올바른 UUID가 아닙니다."}
        if author_uuid.startswith("00000000"):
            return {"success": False, "error": "OFFICIAL_BOT_AUTHOR_ID가 예시값입니다. 봇 계정 profiles.id를 설정하세요."}

        payload = {
            "author_id": author_uuid,
            "category": "채용/취업 정보",
            "title": plan.title,
            "content": plan.content,
            "is_anonymous": False,  # 공식 우간다 봇 뱃지 노출
            "images": image_urls or [],
            "views_count": 0,
            "likes_count": 0,
            "comments_count": 0,
            "is_hidden": False,
        }

        try:
            res = requests.post(endpoint, json=payload, headers=headers, timeout=10)
            if res.status_code in (200, 201):
                data = res.json()
                created_id = data[0]["id"] if data else "unknown"
                print(f"[커뮤니티 퍼블리셔] 게시글 등록 성공! (ID: {created_id})")
                return {
                    "success": True,
                    "simulated": False,
                    "post_id": created_id,
                    "title": plan.title,
                }
            else:
                print(f"[커뮤니티 퍼블리셔 오류] HTTP {res.status_code}: {res.text[:300]}")
                return {
                    "success": False,
                    "error": f"HTTP {res.status_code}: {res.text[:300]}",
                }
        except Exception as e:
            print(f"[커뮤니티 퍼블리셔 예외] {redact_secrets(e)}")
            return {"success": False, "error": redact_secrets(e)}
