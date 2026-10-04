import hashlib
import time
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse

import requests

from config import Config


class MediaUploadError(RuntimeError):
    """공개 URL을 만들지 못했을 때 발생. 호출 측은 발행을 중단해야 한다."""


class MediaHost:
    """
    미디어 호스팅 유틸리티:
    로컬에 렌더링된 카드뉴스 이미지를 Cloudinary에 서명 업로드(REST)하여
    Instagram Graph API / Supabase 커뮤니티가 접근 가능한 공개 HTTPS URL로 변환합니다.
    * 실패 시 가짜(placeholder) URL을 돌려주지 않고 MediaUploadError를 던집니다.
    """

    def _parse_url(self) -> Optional[Dict[str, str]]:
        raw = (Config.CLOUDINARY_URL or "").strip().strip("\"'")
        if raw.upper().startswith("CLOUDINARY_URL="):
            raw = raw.split("=", 1)[1].strip().strip("\"'")
        if not raw.startswith("cloudinary://"):
            return None
        u = urlparse(raw)
        if not (u.username and u.password and u.hostname):
            return None
        return {"api_key": u.username, "api_secret": u.password, "cloud_name": u.hostname}

    def is_configured(self) -> bool:
        return self._parse_url() is not None

    def _upload_one(self, cfg: Dict[str, str], path: str, folder: str) -> str:
        file_path = Path(path)
        if not file_path.is_file():
            raise MediaUploadError(f"파일이 없습니다: {path}")

        timestamp = str(int(time.time()))
        # 서명 대상: file/api_key/resource_type 제외, 키 알파벳순 + secret → SHA-1
        sign_params = {"folder": folder, "timestamp": timestamp}
        to_sign = "&".join(f"{k}={v}" for k, v in sorted(sign_params.items())) + cfg["api_secret"]
        signature = hashlib.sha1(to_sign.encode("utf-8")).hexdigest()

        url = f"https://api.cloudinary.com/v1_1/{cfg['cloud_name']}/image/upload"
        try:
            with open(file_path, "rb") as f:
                res = requests.post(
                    url,
                    data={
                        "api_key": cfg["api_key"],
                        "timestamp": timestamp,
                        "signature": signature,
                        "folder": folder,
                    },
                    files={"file": (file_path.name, f)},
                    timeout=120,
                )
            body = res.json()
        except (requests.RequestException, ValueError) as e:
            raise MediaUploadError(f"Cloudinary 통신 오류: {e}") from e

        secure_url = body.get("secure_url")
        if not (res.ok and secure_url):
            msg = body.get("error", {}).get("message", res.text)[:200]
            raise MediaUploadError(f"Cloudinary 업로드 실패: {msg}")
        return secure_url

    def upload_images(self, local_image_paths: List[str]) -> List[str]:
        cfg = self._parse_url()
        if not cfg:
            raise MediaUploadError(
                "CLOUDINARY_URL이 설정되지 않았습니다. cloudinary://<api_key>:<api_secret>@<cloud_name> 형식으로 .env에 등록하세요."
            )
        urls = [self._upload_one(cfg, p, "weganda_marketing") for p in local_image_paths]
        print(f"[미디어 호스트] {len(urls)}장의 이미지를 안전하게 업로드했습니다.")
        return urls
