# 🏥 weganda 마케팅 자동화 (Threads · Instagram · 앱 커뮤니티)

병원 간호사 채용 공고(잡알리오 자동 수집 + 텔레그램 수동 제보)와 3교대 라이프사이클 콘텐츠를 결합해
**쓰레드(하루 3회), 인스타그램 카드뉴스(6장), weganda 앱 커뮤니티 [채용/취업 정보]** 에 자동 발행하고,
발행 결과를 측정해 다음 콘텐츠 선택에 반영하는 시스템입니다.

마케팅 방향과 용어는 `../.agents/product-marketing.md`(제품 마케팅 컨텍스트), 성장 전략은 [docs/growth_plan.md](docs/growth_plan.md)를 따릅니다.

---

## ⏰ 일일 스케줄 (Asia/Seoul KST)

| 시각 | 작업 | 비고 |
| :---: | :--- | :--- |
| 03:30 | 성과 수집 | 발행 24시간(d1)·72시간(d3) 경과 게시물의 조회·반응 스냅샷 저장 |
| 04:00 (월) | Threads 장기 토큰(60일) 갱신 | 실패 시 텔레그램 알림 |
| 04:10 | Instagram 토큰 상태 점검 | 이상 시 하루 1회 알림 |
| 06:30 | Threads `morning` | 채용·커리어 팩트 (실제 공고 3건 비교 등) |
| 08:30 | Instagram 카드뉴스 + 앱 커뮤니티 | 공고 1건 패키지 |
| 09:00 (월) | 주간 성과 리포트 | `/report`로 수동 조회 가능 |
| 12:30 | Threads `afternoon` | 밸런스 게임 · 면접/임상 족보 |
| 17:30 | Threads `evening` | 3교대 공감 · 생존 루틴, 앱 CTA(하루 1회) |
| 15분마다 | 실패 재시도 | 당일 최대 `MAX_RETRY_ATTEMPTS`회 |

시각은 `.env`(`THREADS_*_KST`, `SCHEDULE_TIME_KST`)로 바꿀 수 있습니다. 스케줄 정의는 [scheduling.py](scheduling.py) 한 곳입니다.
APScheduler가 설치돼 있지 않아도 메인 루프가 같은 표를 처리하며, 정시를 놓쳐도 일정 시간(발행 30분, 유지보수 90분) 안이면 따라잡습니다.

---

## 🧱 구조

```
main.py                    CLI · 데몬(메인 루프)
scheduling.py              KST 스케줄 표 · 정시/따라잡기 판단 · 하루 1회 보장
bot/
  telegram_bot.py          텔레그램 승인 봇 + 발행 오케스트레이션
  storage.py               SQLite 상태(중복 방지 claim, 재시도, 게시물 메타·성과)
  analytics_service.py     성과 수집 · 리포트 · 포맷/후킹 선택
pipeline/
  content_pillars.py       필러·포맷(19개)·후킹(5개) 정의와 선택 로직
  fallback_posts.py        LLM 실패 시 내장 글
  threads_viral_engine.py  포맷 선택 → LLM → 품질 게이트 → 폴백
  quality_gate.py          발행 전 검사 (차단 / 사람 확인)
  optimizer.py             성과 가중치 · A/B 실험 배정과 판정
  insights.py · reporting.py   성과 파서 · 주간 리포트
  utm.py                   추적 링크(UTM / Play referrer / Apple ct)
  content_planner.py · card_renderer.py · publishers/ ...
tests/                     unittest (네트워크·운영 DB 미사용)
docs/growth_plan.md        ASO · 추천 루프 · 출시 캘린더 · 실험 백로그
```

### 콘텐츠 설계
- **필러 목표 비중**: 채용 팩트 30 · 3교대 생존 30 · 커리어 30 · 앱 연관 실용 팁 10(%). 최근 발행분과 비교해 부족한 필러의 포맷에 가중치를 줍니다.
- **마무리 방식**을 포맷마다 다르게(선택형 / 경험 질문 / 단정) 지정해 매번 같은 질문형 끝맺음이 되지 않게 합니다.
- 앱 홍보는 하루 1회 답글(CTA)로만 붙이고, 본문은 앱 언급 없이 정보 가치를 줍니다.

### 품질 게이트 (`pipeline/quality_gate.py`)
- **차단 → 자동 재생성(최대 3회) 후 내장 글**: 공고 원문에 없는 금액, 근거 없는 최상급·보장 표현, 앱에 없는 기능 약속(채용 D-day 알림 등), 금지 상투구, 본문 링크/해시태그, 이모지 과다.
- **사람 확인 → 텔레그램 승인 버튼으로 전환**: 투약·의료 표현, 노무·법적 단정, 특정 병원과 부정 표현의 동반.
- 08:30 채용 패키지도 같은 게이트를 거칩니다.

### 측정과 실험
- 발행 시 게시물 메타(필러·포맷·후킹·CTA 변형·실험 팔)를 `content_posts`에 기록하고, d1/d3 성과를 `content_metrics`에 저장합니다.
- 참여율 = (좋아요 + 2×(답글·리포스트·인용)) ÷ 조회수. **72시간이 지난 게시물만** 리포트와 가중치에 사용합니다.
- 포맷·후킹 선택 가중치는 0.5~2.0으로 제한(탐색 유지), 관측 3건 미만은 반영하지 않습니다.
- 진행 중 실험은 `pipeline/optimizer.py`의 `EXPERIMENTS`에 정의합니다. 팔당 표본이 사전 확정치에 도달하기 전에는 승자를 선언하지 않습니다.
- Threads 성과 조회에는 `threads_manage_insights` 권한이 필요합니다. 없으면 하루 1회 알림만 보내고 건너뜁니다.

### 안정성
- 모든 발행은 SQLite 원자적 claim으로 중복을 막고, 실패(`FAILED`)는 횟수 한도 내에서 자동 재시도합니다. 본문만 올라간 부분 실패(`PARTIAL`)는 중복 방지를 위해 재시도하지 않습니다.
- 예외 메시지·로그의 토큰과 키는 `redact_secrets`로 가립니다.
- 성과 수집·리포트·선택 로직은 어떤 오류도 발행 흐름을 막지 않도록 예외를 격리합니다.

---

## 🚀 실행

```bash
python main.py --status                 # 설정 상태 점검
python main.py --test-threads all       # 3슬롯 생성 미리보기 (발행 없음, 필러·포맷·후킹 표시)
python main.py --publish-threads morning  # 해당 슬롯 즉시 실제 발행
python main.py --trigger-briefing       # 인스타 카드뉴스 + 앱 커뮤니티 즉시 실행
python main.py --bot                    # 24시간 데몬 (스케줄러 + 텔레그램 봇)
```

텔레그램 명령: `/status` `/report` `/briefing` `/threads [morning|afternoon|evening]` `/help`

### 테스트
```bash
python -m unittest discover -s tests -t .
```
운영 `state.db`를 건드리지 않고 네트워크를 쓰지 않습니다. (설치되지 않은 서드파티는 스텁으로 대체)

### 환경변수
`.env.example` 참고. 새로 추가된 항목: `MAX_RETRY_ATTEMPTS`, `INSIGHTS_ENABLED`, `EXPERIMENTS_ENABLED`.
