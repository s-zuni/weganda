# 🏥 weganda 마케팅 & 커뮤니티 동시 발행 자동화 파이프라인

본 파이프라인은 병원 간호사 채용 공고(공적 정보)를 수집하여 **인스타그램(카드뉴스/캐러셀), 쓰레드(속보 타래), 그리고 weganda 앱 커뮤니티 [채용/취업 정보] 게시판**에 원클릭으로 동시 발행하는 올인원 마케팅 자동화 시스템입니다.

---

## 🔒 보안 아키텍처 (Security Design)

1. **텔레그램 관리자 화이트리스트 보호**:
   - `TELEGRAM_ADMIN_CHAT_ID`와 일치하는 사용자만 승인 버튼 조작 및 명령어 실행이 가능합니다. (미인가자의 조작 100% 차단)
2. **비밀 키 마스킹 및 유출 방지**:
   - `.env` 파일은 Git 커밋에서 원천 제외됩니다 (`.gitignore` 등록 완료).
   - CLI 상태 확인 시 모든 API 키가 `sk-...1234` 형태로 안전하게 마스킹 처리되어 콘솔에 노출되지 않습니다.
3. **데이터 정제 & XSS/인젝션 방어**:
   - 크롤링한 텍스트에서 악성 HTML/스크립트 태그를 원천 제거(`BeautifulSoup`)하고, URL 스키마(`http/https`) 검증을 거칩니다.
4. **Supabase 커뮤니티 안전 연동**:
   - SQL Injection 없는 Supabase 공식 REST API 바인딩 사용 및 공식 채용 봇 뱃지(`is_anonymous: false`) 자동 부여.

---

## 📁 디렉토리 구조

```text
marketing_automation/
├── .env.example                     # 안전한 환경변수 설정 가이드 (키 제외)
├── requirements.txt                 # 필수 의존성 패키지
├── config.py                        # 보안 환경변수 로더 및 검증
├── main.py                          # 원클릭 CLI 실행 및 상시 봇 데몬 엔트리포인트
│
├── security/                        # 보안 유틸리티
│   ├── auth_guard.py                # 텔레그램 관리자 ID 검증
│   └── sanitizer.py                 # HTML/텍스트 정제 및 URL 보안 검증
│
├── crawlers/                        # 채용 정보 수집기
│   ├── base_crawler.py              # User-Agent, 타임아웃, SSL 검증 베이스
│   └── hospital_crawler.py          # 병원/알리오 채용공고 크롤러 (안정적 Mock 폴백 내장)
│
├── pipeline/                        # 콘텐츠 생성 파이프라인
│   ├── content_planner.py           # Gemini 기반 인스타/쓰레드/앱 커뮤니티 동시 기획
│   ├── card_renderer.py            # 1080x1350 비바 코랄 핑크 테마 카드뉴스 렌더러
│   ├── media_host.py                # 이미지 호스팅 (Cloudinary / 임시 URL 변환)
│   └── publishers/                  # 멀티 채널 발행기
│       ├── community_publisher.py   # 🏥 weganda Supabase [채용/취업 정보] 게시판 등록
│       ├── instagram_publisher.py   # 📸 Instagram Graph API (캐러셀 발행)
│       └── threads_publisher.py     # 🧵 Threads API (3단 타래 체이닝 발행)
│
├── templates/                       # 카드뉴스 HTML/CSS 템플릿
│   └── slide.html                   # Pretendard + 토스 스타일 디자인 템플릿
│
└── bot/                             # 텔레그램 승인 워커
    └── telegram_bot.py              # 인라인 승인 버튼 + SQLite 상태 영속화
```

---

## 🚀 사용 방법

### 1. 환경변수 설정 (`.env`)
`marketing_automation/.env.example`을 복사하여 `.env`를 생성하고 발급받은 키를 입력합니다:
```bash
cp marketing_automation/.env.example marketing_automation/.env
```

### 2. 보안 환경 및 키 상태 확인
```bash
python marketing_automation/main.py --status
```

### 3. 크롤링 ➔ 기획 ➔ 카드뉴스 렌더링 1회 즉시 테스트
```bash
python marketing_automation/main.py --test-plan
```
*생성된 고화질 카드뉴스 이미지는 `marketing_automation/assets/output/`에서 즉시 확인할 수 있습니다.*

### 4. 텔레그램 상시 승인 봇 및 KST 아침 스케줄러 가동
```bash
python marketing_automation/main.py --bot
```
*매일 아침 지정된 시각(기본 08:30 KST)에 관리자 텔레그램으로 기획안 카드가 전송되며, **[🚀 3개 채널 전면 발행]** 버튼 클릭 한 번으로 인스타, 쓰레드, 앱 커뮤니티에 동시 등록됩니다.*

---

## 📮 채용공고 수집 & 텔레그램 제보

| 경로 | 대상 | 방식 |
|---|---|---|
| 자동 수집 | 공공기관·국립대병원 등 (잡알리오) | `DATA_GO_KR_SERVICE_KEY`, 매일 브리핑 (`/briefing`) |
| 제보 | 사립 병원 등 API에 없는 공고 | 텔레그램에 **URL / 캡처 이미지·PDF / 본문 텍스트** 전송 |

- 제보는 관리자 개인 채팅에서만 동작하며, 그 외 사용자·그룹 메시지는 무시합니다.
- URL은 내부망·사설 IP·비표준 포트·과다 리다이렉트를 차단한 안전 fetch로만 가져옵니다.
- AI(Gemini)가 원문에 있는 내용만 추출하며, 공고가 아니거나 이미 마감된 경우 거부합니다.
- 발행/건너뜀 처리된 공고는 `state.db`에 기록되어 다시 추천되지 않습니다.
- `python main.py --test-crawl` 로 수집 결과만 확인할 수 있습니다 (발행 없음).
- ⚠️ 고용24(워크넷) 채용정보 API는 **기업회원** 키만 사용 가능합니다 (개인회원 키는 호출 불가).
