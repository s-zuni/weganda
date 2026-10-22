# Product Marketing Context

**Document version:** v3
**Last updated:** 2026-10-22

> 출처: `STORE_RELEASE_GUIDE.md`, `src/components/specific/Landing/*`, `src/constants/membership.ts`, `marketing_automation/`.
> 코드/문서에서 확인되지 않은 항목은 `(미확인)`으로 표시했다. 지어내지 말고 확인 후 채울 것.

## Product Overview
**One-liner:** 3교대 간호사를 위한 근무표(듀티) 캘린더 + 채용 정보 + 익명 커뮤니티 앱.
**What it does:** D/E/N/Off 교대근무표를 터치로 입력하고, 동기·선후배와 근무표를 공유해 겹치는 오프를 자동으로 찾는다. 병원 채용 공고, 간호사 전용 익명 커뮤니티, 약물 점적 계산기, 듀티 운세, 야간수당·월급 예측기를 제공한다.
**Product category:** 간호사 교대근무 캘린더 / 간호사 라이프스타일 앱 (스토어 카테고리: 건강 및 피트니스, 2차 의학).
**Product type:** B2C 모바일 앱 (iOS/Android, Expo/React Native). 웹 랜딩 `https://www.weganda.kr`.
**Business model:** 기본 듀티 관리는 무료, 구독 `weganda+`(앱 커스텀 컬러, 운세 월 5회 초과, 월급/수당 예측기, 약물 계산기·Ask AI 횟수 제한 해제, 스마트 듀티 건강·번아웃 분석). 공유 캘린더·AI 모임 추천은 전면 무료. 가격(미확인 — `membership.ts` IAP_SKUS 참조).
**무료 체험(확정, 2026-10-22):** 랜딩에서 사전예약한 사용자는 weganda+ **2개월 무료**, 사전예약 없이 일반 구매하는 사용자는 **1개월 무료 체험**. 홍보 문구에 기간을 쓸 때는 반드시 대상 조건을 함께 쓴다.

## Target Audience
**Target:** 대한민국 병원 근무 3교대 간호사(신규·경력), 간호대학생·취업 준비생.
**Decision-makers:** 본인(개인 구매). 동기·선후배 입소문이 설치의 주된 계기라고 가정(미확인).
**Primary use case:** 불규칙한 교대 근무표를 한 곳에서 관리하고 동료와 맞춘다.
**Jobs to be done:**
- 내 근무표를 빠르게 기록하고 한눈에 본다.
- 동기와 겹치는 오프를 찾아 약속을 잡는다.
- 지원할 병원 공고와 마감일(D-day)을 놓치지 않는다.
**Use cases:** 출근길 채용 공고 확인, 나이트 전후 수면·루틴 관리, 이번 달 야간수당 확인, 투약 계산 보조.

## Personas
B2C 단일 구매자. 세분화는 아래 두 집단으로 한다.
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| 재직 간호사 (1~5년 차) | 근무표 관리, 오프 맞추기, 수당, 번아웃 | 단톡방에 근무표 사진을 올려 비교, 수기 계산 | 공유 캘린더로 겹치는 오프 자동 탐색 |
| 취준 간호대생·이직 준비자 | 공채 일정, 병원 비교 | 공고가 흩어져 마감을 놓침 | 공고 모아보기 + D-day |

## Problems & Pain Points
**Core problem:** 불규칙한 3교대 때문에 일정·휴식·사회생활을 조율하기 어렵다.
**Why alternatives fall short:**
- 종이 달력·메모: 공유·합산이 안 된다.
- 단톡방 근무표 사진: 겹치는 오프를 사람이 눈으로 비교해야 한다.
- 범용 캘린더 앱: D/E/N 근무 개념과 수당 계산이 없다. (경쟁 제품 실명은 미확인)
**What it costs them:** 시간, 약속 취소, 수당 누락 가능성.
**Emotional tension:** 병동 고충을 털어놓을 곳이 없다는 고립감, 나이트 후 피로.

## Competitive Landscape
**Direct:** 다른 근무표/듀티 앱 (미확인 — 조사 필요)
**Secondary:** 범용 캘린더·공유 캘린더 앱 — 교대 개념 없음
**Indirect:** 단톡방 사진 공유, 종이 달력, 간호사 온라인 커뮤니티

## Differentiation
**Key differentiators:**
- 교대(D/E/N/Off) 중심 UI와 동료 간 겹치는 오프 자동 매칭
- 채용 공고·커뮤니티·약물 계산기가 한 앱에 있음
- 기본 듀티 관리 무료
**Why customers choose us:** (미확인 — 인터뷰 필요)

## Objections
| Objection | Response |
|-----------|----------|
| 개인 근무표를 동료에게 공개하기 싫다 | 공유 범위는 사용자가 선택(앱 동작 확인 후 문구 확정) |
| 익명 커뮤니티가 걱정된다 | 신고·차단 기능과 이용 가이드라인 운영 |
| 유료 구독이 부담된다 | 기본 듀티 관리는 무료 |

**Anti-persona:** 교대 근무를 하지 않는 직군.

## Switching Dynamics
**Push:** 사진으로 근무표를 비교하는 번거로움.
**Pull:** 겹치는 오프 자동 탐색, 채용 D-day.
**Habit:** 이미 쓰는 캘린더·단톡방.
**Anxiety:** 근무표·연락처 등 개인정보 노출.

## Customer Language
**How they describe the problem:** (미확인 — 실제 고객 발화 수집 필요. 아래는 앱 랜딩 카피 기반 가설)
- "근무표 수기 작성이 번거롭다", "동기들이랑 오프 맞추기 어렵다"
**How they describe us:** (미확인)
**Words to use:** 듀티, 오프, 나이트, 인계, 프리셉터, N-O-D, 3교대, 공채, D-day
**Words to avoid:** 1위·1등·최고·보장·확실히 합격 (근거 없음), 채용 D-day 알림·자동 등록·원클릭 등록 (앱에 없는 기능), "안녕하세요!"·"함께 알아볼까요?" (번역투), 임상 조치를 단정하는 표현
**Glossary:**
| Term | Meaning |
|------|---------|
| 듀티 | 근무 일정 |
| D/E/N/Off | 데이/이브닝/나이트/휴무 |
| N-O-D | 나이트 → 오프 → 데이 같은 부담 큰 연속 배치 |
| weganda+ | 유료 구독 멤버십 |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line |
|-----------|-------|--------------|--------------|
| 현실 공감 | 병동 일상 장면을 구체적으로 | 과장·자극적 비난 | "나이트 퇴근하고 바로 잔다(1) vs 버텼다 밤에 잔다(2)" |
| 친한 선후배 | 구어체(~함, ~거든요, ~해요) | 반말 남발, 훈계 | "이건 원서 넣기 전에 한 번만 확인해요" |
| 사실 기반 | 공고 원문의 수치·날짜만 인용 | 지어낸 연봉·인원 | "마감 D-3, 정규직" |

**Tone by context:**
- Support: 차분하고 정확하게
- Launch: 담백하게, 과장 없이
- Errors: 원인과 다음 행동을 먼저
- Sales: 압박·희소성 연출 금지 (사실일 때만)
- Social: 첫 줄 22자 이내 훅, 한 줄 25자 안팎, 이모지 최대 2개, 본문에 링크·해시태그 금지
**Terms we own:** 우간다, weganda, 듀티 캘린더
**Never use (and why):**
- 순위·최상급 표현: 증빙 불가 (스토어 설명문의 "대한민국 1등 간호사 라이프스타일 플랫폼"도 근거 확인 전까지 수정 대상)
- 특정 병원 실명 + 부정 표현: 명예훼손 위험
- 투약·진단·치료 조언 단정: 의료 정보 오인 위험

## Proof Points
**Metrics:** (미확인 — 설치 수, 활성 사용자, 평점 등 확보 후 기입)
**Customers:** (미확인)
**Testimonials:** (미확인)
**Value themes:**
| Theme | Proof |
|-------|-------|
| 겹치는 오프 자동 탐색 | 앱 기능(공유 캘린더) |
| 기본 기능 무료 | 랜딩·스토어 문구 |

## Goals
**Business goal:** 간호사 사용자 확보와 weganda+ 구독 전환.
**Conversion action:** 앱 설치 → 가입 → 근무표 입력/공유 캘린더 사용.
**Current metrics:** (미확인)

## Paid Ads (optional)
유료 광고 미운영(미확인). 운영 시 작성.

## Learnings
*Decisions and tested lessons. Newest first. Keep it to about 20 active entries.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-10-22 | 게시 전 품질 게이트로 근거 없는 최상급·원문에 없는 금액은 차단, 의료·노무·병원 비방 소지는 사람 승인으로 전환한다 | 운영 정책 결정, `pipeline/quality_gate.py` | Threads·Instagram·커뮤니티 자동 발행 | active |
| 2026-10-22 | 앱에 없는 기능(채용 D-day 알림, 일정 자동 등록, 원클릭 등록)을 마케팅 카피에서 약속하지 않는다. 앱의 알림은 임상 알람뿐이다 | 소스 확인(`localNotificationService.ts`, `useAlarmStore.ts`), 게이트 규칙 `unsupported_app_claim` | 모든 채널 카피, 스토어 설명 | active |
| 2026-10-22 | 무료 기간은 두 가지가 모두 사실이다: 사전예약 2개월, 일반 구매 1개월. 문서 불일치가 아니라 조건 차이였다 | 운영자 확인 | 모든 프로모션 문구 | active |
| 2026-10-22 | 스토어 설명의 "대한민국 1등" 표현은 증빙 없이 쓴 문구다. 수정은 보류 중이며, 자동 발행 콘텐츠에서는 계속 차단한다 | 운영자 확인 | 스토어 설명 | watch |

## Changelog
*Newest first. One line per revision: what changed and why.*
- v3 (2026-10-22) — 무료 체험 기간 확정(사전예약 2개월 / 일반 구매 1개월), "1등" 표현은 근거 없음으로 기록하고 수정 보류.
- v2 (2026-10-22) — Learnings에 '앱에 없는 기능 약속 금지' 추가(앱 알림이 임상 알람뿐임을 소스로 확인), Words to avoid에 해당 표현 반영.
- v1 (2026-10-22) — 코드베이스(스토어 가이드·랜딩·멤버십 상수)에서 초안 작성. 미확인 항목은 표시.
