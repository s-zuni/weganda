@echo off
chcp 65001 > nul
title weganda 마케팅 전자동 봇 (24시간 데몬)

echo ===================================================
echo 🤖 weganda 마케팅 전자동 봇을 백그라운드로 실행합니다.
echo • 06:30 KST - 쓰레드 아침 바이럴 자동 발행
echo • 08:30 KST - 인스타 카드뉴스 + 앱 커뮤니티 자동 발행
echo • 12:30 KST - 쓰레드 점심 바이럴 자동 발행
echo • 17:30 KST - 쓰레드 오후 바이럴 자동 발행
echo ===================================================

cd /d "%~dp0"
set PYTHONPATH=%~dp0

"C:\Users\zxzx7\Desktop\insta_auto\.venv\Scripts\python.exe" main.py --bot

pause

