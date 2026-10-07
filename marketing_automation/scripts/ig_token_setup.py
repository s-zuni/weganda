"""
Instagram 단기 토큰 → 장기 토큰 → 페이지 액세스 토큰(사실상 무기한)을 발급해 .env에 저장합니다.

사전 준비: marketing_automation/.env 에 FB_APP_ID, FB_APP_SECRET (weganda 앱) 설정
사용법   : python scripts/ig_token_setup.py <Graph API Explorer 단기 토큰>
* 토큰 값은 화면에 출력하지 않고 .env에만 기록합니다.
"""
import re
import sys
from pathlib import Path

import requests
from dotenv import dotenv_values

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
G = "https://graph.facebook.com/v21.0"


def _err(r: requests.Response) -> str:
    try:
        return r.json().get("error", {}).get("message", r.text[:200])
    except ValueError:
        return r.text[:200]


def _set(text: str, key: str, value: str) -> str:
    pat = re.compile(rf"^{key}=.*$", re.M)
    return pat.sub(lambda m: f"{key}={value}", text) if pat.search(text) else text + f"\n{key}={value}\n"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    short = sys.argv[1].strip()
    env = dotenv_values(ENV_PATH)
    app_id, secret = env.get("FB_APP_ID", ""), env.get("FB_APP_SECRET", "")
    if not app_id or not secret:
        print("❌ .env에 FB_APP_ID / FB_APP_SECRET(weganda 앱)을 먼저 입력하세요.")
        return 1

    r = requests.get(f"{G}/oauth/access_token", params={
        "grant_type": "fb_exchange_token", "client_id": app_id,
        "client_secret": secret, "fb_exchange_token": short}, timeout=30)
    if not r.ok:
        print("❌ 장기 토큰 교환 실패:", _err(r))
        return 1
    long_user = r.json()["access_token"]
    print("✅ 장기 사용자 토큰 교환 완료")

    # 비즈니스 포트폴리오 소속 페이지는 /me/accounts가 비므로, 토큰에 허용된 페이지를 직접 조회
    dbg = requests.get(f"{G}/debug_token", params={"input_token": long_user, "access_token": f"{app_id}|{secret}"}, timeout=15)
    scopes = dbg.json().get("data", {}).get("granular_scopes", []) if dbg.ok else []
    page_ids = next((s["target_ids"] for s in scopes if s["scope"] == "pages_show_list"), [])
    if not page_ids:
        print("❌ 토큰에 허용된 페이지가 없습니다. Explorer에서 페이지/인스타 계정을 선택하고 다시 발급하세요.")
        return 1

    for pid in page_ids:
        pr = requests.get(f"{G}/{pid}", params={
            "access_token": long_user, "fields": "id,name,access_token,instagram_business_account{id,username}"}, timeout=15)
        if not pr.ok:
            print(f"⚠️ 페이지 {pid} 조회 실패:", _err(pr))
            continue
        page = pr.json()
        ig = page.get("instagram_business_account")
        if not ig:
            print(f"⚠️ 페이지 {page.get('name')}에 연결된 인스타 비즈니스 계정이 없습니다.")
            continue
        text = ENV_PATH.read_text(encoding="utf-8")
        for k, v in {"INSTAGRAM_ACCESS_TOKEN": page["access_token"], "INSTAGRAM_ACCOUNT_ID": ig["id"],
                     "INSTAGRAM_HANDLE": "@" + ig["username"]}.items():
            text = _set(text, k, v)
        ENV_PATH.write_text(text, encoding="utf-8")

        d = requests.get(f"{G}/debug_token", params={"input_token": page["access_token"], "access_token": f"{app_id}|{secret}"}, timeout=15).json().get("data", {})
        exp = d.get("data_access_expires_at") or d.get("expires_at")
        print(f"✅ 저장 완료: 페이지 {page['name']} / @{ig['username']} ({ig['id']})")
        print(f"   토큰 유효: {d.get('is_valid')} | 만료(0=무기한): {d.get('expires_at')} | 데이터접근 만료: {d.get('data_access_expires_at')}")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
