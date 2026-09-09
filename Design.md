# Design System — 우간다 (Weganda)
> 대한민국 3교대 간호사를 위한 라이프스타일 앱의 디자인 시스템 문서  
> **디자인 레퍼런스**: 토스(Toss) 디자인 언어 기반 — 명료함, 신뢰, 군더더기 없는 인터랙션 + 톤업된 웜 핑크 아이덴티티

---

## 1. 브랜드 아이덴티티

### 브랜드 철학
우간다(우리 간호사가 간다)는 **응원, 활력, 배려, 신뢰**를 핵심 가치로 삼습니다.  
반복되는 3교대(Day/Evening/Night)의 고단한 일상 속에서도 간호사가 자신의 일상을 밝고 경쾌하게 파악하고 동료들과 끈끈하게 연결될 수 있도록, **순백의 화이트 배경 위에 생동감 넘치는 비바 코랄 핑크(`#FF507C`)**를 포인트로 적용하여 톤업된 **Maximal Minimalist** 디자인을 지향합니다.

### 브랜드 감성 키워드
`생동감` · `따뜻함` · `전문성` · `응원` · `심플함`

---

## 2. 컬러 시스템

### Primary Palette (비바 코랄 핑크 톤업)

| 역할 | 이름 | HEX | 사용 용도 |
|------|------|-----|-----------|
| **Primary** | Viva Coral Pink | `#FF507C` | 브랜드 로고 텍스트, 메인 CTA 버튼, 오늘 근무 카드, 탭 Active, FAB 버튼 |
| Primary Light | Coral Mid | `#FF6B8E` | 내일 근무 카드, Secondary 카드 배경 |
| Primary Muted | Soft Pink | `#FFAEC0` | 알람/운세 보조 버튼, 비활성 칩/배지 |
| Primary Tint | Rose Tint | `#FFE8EE` | 배지 배경, Chip 배경, 강조 영역 Tint |

### Neutral Palette

| 역할 | HEX | 사용 용도 |
|------|-----|-----------|
| Background | `#FFFFFF` | 앱 전체 배경, 카드 배경 |
| Off-White | `#F8F9FA` | 페이지 기본 배경, 인풋 필드 |
| Border | `#E5E7EB` | 카드 테두리, Divider, 탭바 구분선 |
| Divider | `#F3F4F6` | 섹션 내부 구분선 |
| Text Primary | `#1A1A1A` | 제목, 본문 주요 텍스트 |
| Text Secondary | `#6B7280` | 서브 텍스트, 라벨 |
| Text Muted | `#9CA3AF` | Placeholder, 비활성 텍스트 |

### Shift Color Palette (근무 타입 — 표준 색상 고정)

| 근무 | 코드 | HEX | 의미 |
|------|------|-----|------|
| 주간 (Day) | D | `#4F98CA` | 파랑 — 낮 근무 |
| 저녁 (Evening) | E | `#E2703A` | 주황 — 오후 근무 |
| 야간 (Night) | N | `#272727` | 다크 차콜 — 야간 근무 |
| 휴무 (Off) | O | `#E84A5F` | 레드/코랄 — 휴일 |
| 연차 (Vacation) | V | `#9B51E0` | 보라 — 연차/특별휴가 |

### weganda+ 프리미엄 컬러 팔레트 (Premium Palette)

| 역할 | 이름 | HEX | 사용 용도 |
|------|------|-----|-----------|
| **Premium Hero** | Deep Green | `#1B4332` | Paywall 모달 Hero 배경 (솔리드), 구독 CTA 버튼 배경 |
| Premium Hero Sub | Deep Forest | `#2D6A4F` | Paywall 보조 섹션 |
| **Premium Accent** | Gold | `#D4A853` | 👑 CrownIcon, weganda+ 골드 로고/텍스트, CTA 텍스트 |
| Premium Gold Light | Champagne | `#F5E6C8` | 골드 테두리, Pro 태그 배경 |
| Premium Gold Dark | Deep Bronze | `#B8922E` | 골드 뱃지 텍스트 |
| Premium Badge Tint | Warm Gold Tint | `#FFF8E7` | `👑 weganda+ 이용 중` 배지 배경 |
| Toss Blue | Toss Brand Blue | `#0064FF` | 토스페이먼츠 결제창 인디케이터 및 브랜드 컬러 |

> **🚫 NO GRADIENTS 원칙**: 신뢰성과 가독성을 위해 그라디언트는 일절 사용하지 않습니다. Paywall 및 프리미엄 영역을 포함한 모든 색상은 Solid Color로만 사용합니다.

---

## 3. 타이포그래피

### 메인 폰트: Pretendard
- 대한민국 간호사 대상 서비스로, **한글 가독성**이 가장 중요합니다.
- Pretendard는 현대적이고 클린한 한글 폰트로 모바일 환경에서 최적화된 가독성을 제공합니다.

```
Font Family: 'Pretendard'
Usage: 모든 한글 텍스트, UI 라벨, 버튼 텍스트, 본문
```

### 서브 폰트: Inter
- 영문 숫자(근무 코드 D/E/N/O, 시간, 날짜 등) 표기에 사용합니다.
- 정밀한 숫자 가독성과 Pretendard와의 자연스러운 어울림이 특징입니다.

```
Font Family: 'Inter'
Usage: 숫자(날짜, 시간), 영문 코드(D/E/N/O), 영문 레이블
```

### 타이포그래피 스케일 ([대주제 / 소주제 / 내용] 3단계 계층 구조)

| 계층 | 스타일 | 폰트 | 크기 (조정 전 → 개편) | 굵기 | Line Height | 주요 적용 대상 |
|---|---|---|---|---|---|---|
| **[대주제]** | Display | Pretendard / Inter | 44~52px → **48~54px** | 900 / 800 | 56px | 근무 코드(D/E/N), 히어로 대표 점수/타이틀 |
| **[대주제]** | H1 | Pretendard | 22px → **24px** | 800 (ExtraBold) | 32px | 브랜드 타이틀 "우간다", 아티클 상세 제목 |
| **[소주제]** | H2 | Pretendard | 18px → **20px** | 700 (Bold) | 28px | 메인 섹션 제목 ("임상 지침 & 술기 족보", "데일리 노트", "4대 정밀 운세") |
| **[소주제]** | H3 | Pretendard | 15~16px → **18px** | 700 (Bold) | 26px | 카드 제목, 지침서/게시글 카드 타이틀, 모달 소제목 |
| **[내용]** | Body1 | Pretendard | 14~15px → **16px** | 500 (Medium) | 24px | 본문 텍스트, AI 전문 답변 본문, 아티클 설명글 |
| **[내용]** | Body2 | Pretendard | 13~14px → **15px** | 400 (Regular) | 22px | 카드 요약 프리뷰, 인사말 서브텍스트, 리스트 보조 설명 |
| **[보조내용]** | Label | Pretendard | 12~13px → **14px** | 600 (SemiBold) | 20px | 날짜 레이블, 버튼 텍스트, 폼 입력 필드 |
| **[보조내용]** | Caption | Pretendard | 11~12px → **13px** | 500 (Medium) | 18px | 타임스탬프, 부가 메모, 퀵 태그 칩 |
| **[보조내용]** | Micro | Pretendard | 10~11px → **12px** | 600 (SemiBold) | 16px | 뱃지(병원인증, 카테고리), 탭바 라벨 |

> **💡 모바일 가독성 최우선 원칙**:
> - 간호사 임상 교대근무 환경에서 이동 중이나 베드사이드에서도 한눈에 읽힐 수 있도록, 작은 폰트(10~12px)를 지양하고 내용 본문은 **15~16px**, 소주제는 **18~20px**, 대주제는 **24px+**로 시원하게 배치합니다.
> - 스크롤 부담을 줄이기보다, 충분한 여백(`Line Height 22~26px`, 패딩)을 두어 시각적 피로도를 낮춥니다.

---

## 4. 컴포넌트 디자인 원칙

### 4.1 카드 (Card)

```
배경: #FFFFFF (White)
테두리 반경: 16px (rounded-2xl)
그림자: shadowColor #000, offset (0, 2), opacity 0.04~0.08, radius 6
테두리: 1px solid #E5E7EB
여백: 내부 padding 16px ~ 20px
```

**근무 카드 (Shift Card):**
- 오늘 근무 카드: `#FF507C` 배경, 흰색 텍스트, 16px radius
- 내일 근무 카드: `#FF6B8E` 배경, 흰색 텍스트, 16px radius

### 4.2 버튼 (Button)

| 타입 | 배경색 | 텍스트 | 반경 | 사용 용도 |
|------|--------|--------|------|-----------|
| Primary Pill | `#FF507C` | `#FFFFFF` | 9999px (full) | 메인 CTA, 전체 스케줄 보기, 스케줄 추가하기 |
| Sub Muted | `#FFAEC0` | `#FFFFFF` | 12px | 보조 액션, 알람 맞추기, 오늘의 운세 |
| Outline | `transparent` + border `#FF507C` | `#FF507C` | 12px | 친구 추가, 메시지/소통 버튼 |

### 4.3 주간 캘린더 스트립 (Week Strip)

- 오늘 날짜: 지름 32px 원형 `#FF507C` 배경 + 흰색 텍스트 (오늘 + 일자 강조)
- 일반 날짜: 텍스트만, `#1A1A1A`
- 요일 레이블: `#6B7280` (오늘은 `#FF507C`, 볼드)
- 근무 코드: 12px SemiBold, `#4F98CA`, `#E2703A`, `#272727`, `#E84A5F`, `#9B51E0`

### 4.4 하단 탭바 (Bottom Tab Bar)

```
배경: #FFFFFF
상단 곡률: 24px (rounded-t-3xl)
상단 구분선: 1px solid #E5E7EB
그림자: shadowColor #000, offset (0, -4), opacity 0.05, radius 10
높이: 80~84px (Safe Area Insets 동적 대응, 64px + bottomInset)
하단 패딩: 16px ~ insets.bottom (기기 하단 베젤/홈 인디케이터 여백 확보)
탭 수: 5개
Active 색상: #FF507C
Inactive 색상: #6B7280

[중앙 FAB 버튼 — 3번 탭 (홈)]
크기: 64 x 64px (원형)
배경: #FF507C (Solid)
테두리: 4px solid #FFFFFF (화이트 링 스트로크)
아이콘: StethoscopeIcon (청진기 화이트 벡터 SVG, 28px)
위치: top: -24px (탭바 위로 자연스럽게 돌출)
그림자: shadowColor #FF507C, offset (0, 6), opacity 0.35, radius 8
```

### 4.5 헤더 (Header)

```
높이: 자동 (패딩 상하 14/12px)
배경: #FFFFFF
좌측: 공식 피그마 심볼 로고 (WegandaLogo, 26px, 스퀘어클 핑크 그라디언트 + 심전도 펄스 파형) + 브랜드 타이틀 "우간다" (#FF507C, Pretendard, 22px, ExtraBold)
우측: 알림 라인 벡터 아이콘 (BellIcon, 20px) + 프로필 라인 벡터 아이콘 (UserIcon, 18px)
하단 구분선: 없음 (Invisible UI, Clean)
```

---

## 5. 스페이싱 시스템

| 토큰 | 값 | 사용 용도 |
|------|----|-----------|
| space-xs | 4px | 아이콘 간격, 뱃지 내부 패딩 |
| space-sm | 8px | 카드 내 요소 간격, 인라인 간격 |
| space-md | 12px | 카드 간 Gap, 버튼 간 Gap |
| space-lg | 16px | 섹션 내부 패딩, 카드 패딩 |
| space-xl | 20px | 페이지 좌우 여백 (Toss 스타일 표준) |
| space-2xl | 28px | 섹션 간 여백 |
| space-3xl | 32px | 주요 기능 블록 간 대형 여백 |

---

## 6. 아이콘 및 비주얼 시스템 (Iconography)

모든 전역 UI와 운세(Fortune) 서비스는 **일반 표준 단색 라인 벡터 SVG(Stroke-based, 2px 두께)**를 표준으로 합니다.
플랫폼(iOS/Android)마다 렌더링 모양과 색상이 달라지는 OS 종속적 이모티콘을 일절 배제하고, `react-native-svg` 기반의 자체 벡터 컴포넌트(`src/components/common/Icon.tsx`)로 렌더링 무결성을 보장합니다.


| 분류 | 아이콘 명 | 형태 | 의미 / 용도 | 색상 규칙 |
|------|-----------|------|-------------|-----------|
| 브랜드 로고 | `WegandaLogo` | Squarecle Pink + Pulse ECG | 공식 서비스 아이덴티티 | `#FF638B`~`#FF3E6D` |
| 탭바 — 운세 | `FortuneIcon` | Sparkles (4점 별무리) | Fortune / Saju / AI 운세 | `#FF507C` (Active) |
| 탭바 — 친구 | `FriendsIcon` | User Group (친구 실루엣 중첩) | Social / 듀티 공유 | `#FF507C` |
| 탭바 — 홈 (FAB) | `StethoscopeIcon` | Stethoscope (청진기 벡터) | Home / 핵심 듀티 | `#FFFFFF` |
| 탭바 — 학습 | `StudyIcon` | Graduation Cap (학사모 라인) | Clinical Knowledge / 퀴즈 | `#FF507C` |
| 탭바 — 커뮤니티 | `CommunityIcon` | Chat Bubbles (대화 말풍선 중첩 벡터) | Community / 익명 게시판 | `#FF507C` |
| 헤더 — 알림 | `BellIcon` | Notification Bell (알림 벨 라인 벡터) | Notification | `#1A1A1A` |
| 헤더 — 프로필 | `UserIcon` | User Profile (계정 라인 벡터) | My Profile | `#1A1A1A` |
| 운세 — 간호 사주 | `StethoscopeIcon` | Medical Stethoscope (청진기) | 간호 직무/병원 궁합 | `#FF507C` |
| 운세 — 애정운 | `HeartIcon` | Heart (하트 벡터) | 연애/사주/MBTI 궁합 | `#E11D48` |
| 운세 — 직업운 | `BriefcaseIcon` | Briefcase (서류가방 벡터) | 이직운/10년 대운/동료 | `#2563EB` |
| 운세 — 금전운 | `CoinsIcon` | Coins (코인 중첩 벡터) | 수당 관리/재테크 전략 | `#F59E0B` |
| 홈 — 알람 맞추기 | `ClockIcon` | Minimal Clock (알람 시계 라인 벡터) | 근무 알람 설정 | `#FFFFFF` |
| 홈 — 특이사항 기록 | `PencilIcon` | Minimal Pencil (연필/작성 라인 벡터) | 특이사항 작성 | `#FF507C` |
| 커뮤니티 — 반응 메트릭 | `EyeIcon`, `HeartIcon`, `CommentIcon` | Eye, Heart, Chat Bubble (조회/하트/댓글) | 게시글 반응 수치 | `#9CA3AF` |
| 커뮤니티 — 글쓰기 FAB | `PencilIcon` | Minimal Pencil (연필/작성 라인 벡터) | 새 글 작성 | `#FFFFFF` |
| 프리미엄 — 멤버십 배지 | `CrownIcon` | Minimal Crown (왕관 벡터) | weganda+ 구독자 배지 및 Paywall 심볼 | `#D4A853` (골드) |
| 프리미엄 — 결제 완료 | `ShieldCheckIcon` | Shield + Checkmark (방패 체크 벡터) | 토스 결제 완료 및 구독 인증 | `#10B981` (그린) |
| 프리미엄 — 월급 예측기 | `ChartBarIcon` | 3-Bar Chart (차트 바 라인 벡터) | D/E/N 수당 및 월급 예측 통계 | `#FF507C` / `#1A1A1A` |

### 6.1 운세 서비스 유료화 대비 비동기 생성 UX 원칙
- **선택 즉시 노출 차단**: 사용자가 운세 카드를 눌렀을 때 결과를 즉시 보여주지 않고, 각 운세의 상세 가치와 분석 항목을 사전에 안내하는 **`FortuneUnlockView` (미리보기 화면)**를 노출합니다.
- **분석 확인 트리거**: 사용자가 `[운세 분석 확인하기]` CTA 버튼을 터치해야 비로소 API/생성 로직(`unlockFortune`)이 호출되어 프로그레스 인디케이터와 함께 정밀 분석 리포트가 언락됩니다.
- **수익화 확장성**: 추후 인앱 결제, 유료 티켓/코인 차감, 리워드 광고 시청 후 언락하는 구조로 손쉽게 전환할 수 있도록 `useFortuneStore`의 `unlockedFortunes` 상태로 중앙 제어됩니다.


---

## 7. 신뢰성 UI 원칙

1. **정보 계층 명확화**: 오늘 근무 → 내일 근무 → 주간 캘린더 순으로 시각 계층 분리.
2. **색상 의미 일관성**: D/E/N/O/V 5대 근무 코드는 고유 색상을 유지하여 혼동 방지.
3. **과도한 장식 배제**: 화이트 배경 위 깔끔한 솔리드 핑크(`#FF507C`)로 시각 피로도 최소화.
4. **터치 타겟 44x44px 이상**: 긴박한 교대 근무 중에도 오터치 없는 쾌적한 인터랙션.
5. **화이트 배경 우선**: 병원의 밝은 형광등 아래에서도 선명한 가독성 보장.

---

## 8. 화면 레이아웃 — 홈(Home) 상세 스펙

```
[Status Bar] 
[Header: 🩹 우간다 (#FF507C) | 🔔 👤]
[Greeting Banner: "user님, 오늘은 데이 근무이시네요. 오늘도 간호를 제공해주셔서 감사합니다!"]
[Shift Cards Row]
  ├─ [오늘 카드 (좌측) — #FF507C 배경]
  │   ├─ 날짜 레이블: "오늘 (8/19) 근무"
  │   ├─ 코드: "D" (52px, ExtraBold) + 시간: "07:30 -13:30"
  │   └─ [하단 보조 버튼: 알람 맞추기 — #FFAEC0 배경]
  └─ [내일 카드 (우측) — #FF6B8E 배경]
      ├─ 날짜 레이블: "내일 (8/20) 근무"
      ├─ 코드: "O" + "내일은 쉬는 날!"
      └─ [하단 보조 버튼: 오늘의 운세 — #FFAEC0 배경]
[Weekly Strip 카드: 일-월-오늘(19)-수-목-금-토 + D/D/D/O/O/E/N]
[Pill Button Row: 전체 스케줄 보기 > | 스케줄 추가하기 + (#FF507C)]
[섹션: 데일리 노트]
  ├─ [특이사항 기록하기 카드 (핑크 라인 펜 아이콘)]
  └─ [업무 가이드 카드 (핑크 라인 구급함 아이콘)]
[Bottom Tab: 운세 ✨ | 친구 👥 | 🩺 FAB (#FF507C) | 학습 🎓 | 커뮤니티 💬]
```

---

## 9. 접근성 & 다크모드

- **현재 단계**: 라이트 모드 전용 구현 (화이트 `#FFFFFF` + 비바 코랄 핑크 `#FF507C`).
- **폰트 크기**: 시스템 폰트 스케일 무시 (`allowFontScaling: false`) — 레이아웃 일관성 보장.
- **컬러 대비**: Primary `#FF507C` / White `#FFFFFF` 텍스트 — 고대비 시인성 확보.

---

## 10. 토스(Toss) 디자인 언어 가이드

우간다의 UI/UX는 **토스 앱의 명료함과 군더더기 없는 인터랙션**을 기반으로 합니다.

### 10.1 토스 디자인의 핵심 철학 6가지

#### ① One Thing at a Time (한 번에 한 가지만)
- 홈 화면의 핵심: "오늘 내 근무는 D" → 52px 대형 타이포로 최우선 표시.
- 스케줄 추가: 날짜 선택 → 근무 코드 선택 → 확인 (바텀 시트 단계별 분리).

#### ② Invisible UI (보이지 않는 UI)
- 불필요한 1px 구분선 제거. **여백(20px, 28~32px)이 곧 구분자**.
- 카드 테두리는 은은한 `#E5E7EB` 1px 또는 소프트 드롭 섀도우로 경계 정의.

#### ③ Bold Typography First (타이포그래피가 UI다)
- [핵심 수치 / 코드] → 48px~52px ExtraBold
- [화면/브랜드 제목] → 22px~24px Bold
- [섹션 제목] → 18px Bold
- [본문] → 15px Regular (line-height: 1.6)

#### ④ Generous Whitespace (넉넉한 여백)
- 페이지 좌우 여백: **20px 일정 유지**
- 카드 내부 패딩: 16~20px
- 리스트 아이템 높이: 최소 60px 이상 확보

#### ⑤ Bottom CTA & Floating FAB
- 주요 액션 버튼은 화면 하단 고정 또는 눈에 띄는 Pill 버튼 적용.
- 중앙 3번째 탭은 16px 돌출된 원형 FAB(🩺, `#FF507C`)로 핵심 동선 담당.

#### ⑥ Micro-interaction & Haptic
- 버튼 탭 시 `scale(0.97)` + Light Haptic 피드백.
- 듀티 선택 시 즉각적인 시각적 피드백 제공.

---

## 11. weganda+ 프리미엄 멤버십 & Paywall 디자인 스펙

### 11.1 Paywall 화면 레이아웃 (`MembershipScreen.tsx`)

```
[SafeAreaView: Deep Green (#1B4332)]
  [← 닫기 버튼: 44x44px 터치 영역, 화이트 텍스트]
  [ScrollView]
    [Hero Section: 솔리드 딥 그린 (#1B4332)]
      ├─ 👑 CrownIcon (48px, #D4A853 Gold)
      ├─ "weganda+" 로고 타이틀 (28px ExtraBold, #D4A853)
      └─ "당신의 간호 라이프를 한 단계 높여보세요" (16px, White 80%)
    [Benefits Section: 화이트 (#FFFFFF) 배경]
      ├─ 섹션 타이틀: "프리미엄 혜택" (18px Bold, #1A1A1A)
      ├─ [구독 중 배지 (선택적)]: 연한 그린 배경 + ShieldCheckIcon
      └─ [5대 혜택 카드 수직 리스트 (16px radius, #E5E7EB 테두리)]
          1. 🎨 앱 커스텀 컬러 설정 (PRO 전용 테마 5종)
          2. 🔮 사주 서비스 무제한 (무료: 월 5회 제한)
          3. 💰 야간/휴일 수당 및 월급 자동 예측기 (D/E/N 패턴 계산)
          4. 🤖 약물 계산기 & Ask AI 무제한 (임상 계산 프리셋)
          5. 📅 무제한 교집합 캘린더 & AI 모임 날짜 추천 (오프 동기화)
  [Sticky Bottom CTA Container: 화이트 배경, 상단 소프트 그림자]
    ├─ 메인 CTA: "우간다+ 구독하기 (월 7,800원)" (56px Pill Button, #1B4332 배경, #D4A853 텍스트)
    └─ 안심 문구: "언제든 해지 가능 • 첫 7일 무료 체험" (12px, #9CA3AF)
```

### 11.2 Feature Gating 컴포넌트 표준
- **`PremiumBadge`**: 프로필 하단 16px radius 카드. 무료 회원은 핑크 틴트(`✨ 알아보기 ›`), 구독 회원은 골드 틴트(`👑 이용 중`).
- **`PremiumLockOverlay`**: 잠긴 카드 상단 반투명 화이트(`rgba(255,255,255,0.92)`) 오버레이 + 자물쇠 아이콘 + 즉시 업그레이드 Pill CTA.
- **`PaywallBottomSheet`**: 토스 스타일 24px 상단 곡률 바텀시트. 기능 설명 + 3대 핵심 혜택 + 즉시 구독 버튼.
- **`InAppPurchaseModal`**: App Store(StoreKit) & Google Play 스토어 네이티브 인앱 결제 상태 모달. 결제 진행 중, 성공, 에러 상태 처리 및 폴백 시뮬레이션 지원.
- **구매 복원(Restore Purchases)**: Apple/Google 스토어 필수 정책에 따른 구매 복원 액션 및 피드백 처리.

