from config import Config


def is_authorized_user(user_id: int) -> bool:
    """
    텔레그램 봇 보안 가드:
    등록된 관리자 CHAT_ID와 일치하는지 엄격히 검증합니다.
    미인가 사용자의 버튼 클릭, 명령 조작을 100% 차단합니다.
    """
    if not Config.TELEGRAM_ADMIN_CHAT_ID:
        print("[보안 경고] TELEGRAM_ADMIN_CHAT_ID가 0으로 설정되어 있어 인증을 통과할 수 없습니다.")
        return False
    return user_id == Config.TELEGRAM_ADMIN_CHAT_ID
