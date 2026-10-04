"""
Threads 단기 토큰 → 장기 토큰(60일)을 발급해 THREADS_ACCESS_TOKEN / THREADS_USER_ID로 .env에 저장합니다.
(이미 장기 토큰이면 `--refresh` 로 60일 연장)

사전 준비: marketing_automation/.env 에 THREADS_APP_SECRET (Threads 앱 시크릿) 설정
사용법   : python scripts/threads_token_setup.py <단기 토큰>
           python scripts/threads_token_setup.py --refresh
* 토큰 값은 화면에 출력하지 않고 .env에만 기록합니다.
"""
import re
import sys
from pathlib import Path

import requests
from dotenv import dotenv_values

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
API = "https://graph.threads.net"


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
    env = dotenv_values(ENV_PATH)

    if sys.argv[1] == "--refresh":
        r = requests.get(f"{API}/refresh_access_token", params={
            "grant_type": "th_refresh_token", "access_token": env.get("THREADS_ACCESS_TOKEN", "")}, timeout=30)
        step = "갱신"
    else:
        secret = env.get("THREADS_APP_SECRET", "")
        if not secret:
            print("❌ .env에 THREADS_APP_SECRET을 먼저 입력하세요.")
            return 1
        r = requests.get(f"{API}/access_token", params={
            "grant_type": "th_exchange_token", "client_secret": secret, "access_token": sys.argv[1].strip()}, timeout=30)
        step = "교환"
        if not r.ok:
            # 설정 화면의 토큰 생성기는 이미 장기 토큰을 주는 경우가 있어, 교환이 거부되면 갱신으로 대체
            r2 = requests.get(f"{API}/refresh_access_token", params={
                "grant_type": "th_refresh_token", "access_token": sys.argv[1].strip()}, timeout=30)
            if r2.ok:
                r, step = r2, "갱신(이미 장기 토큰)"
    if not r.ok:
        print(f"❌ 장기 토큰 {step} 실패:", _err(r))
        return 1
    token, expires = r.json()["access_token"], r.json().get("expires_in")

    me = requests.get(f"{API}/v1.0/me", params={"fields": "id,username", "access_token": token}, timeout=15)
    if not me.ok:
        print("❌ 발급된 토큰 검증 실패:", _err(me))
        return 1
    me = me.json()

    text = ENV_PATH.read_text(encoding="utf-8")
    text = _set(text, "THREADS_ACCESS_TOKEN", token)
    text = _set(text, "THREADS_USER_ID", me["id"])
    ENV_PATH.write_text(text, encoding="utf-8")
    print(f"✅ 저장 완료: @{me['username']} (id {me['id']}) | 유효기간 {round((expires or 0) / 86400)}일 — 만료 전에 --refresh 로 연장하세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
