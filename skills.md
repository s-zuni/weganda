# 우간다 (Weganda) — 도메인 기능 명세 및 기술 레퍼런스 가이드 (skills.md)

> **문서 목적**: 우간다 앱의 **5대 핵심 서비스 도메인 기능 명세, 기술 스택 상세 스펙, 디렉터리별 구현 기술(Skills Map) 및 실무 엔지니어링 가이드**를 정의합니다.

---

## 1. 서비스 개요 및 가치 제안

- **서비스명**: 우간다 (우리 간호사가 간다 / Weganda)
- **타깃 사용자**: 대한민국 종합병원 및 일반병원 3교대 간호사 (Day, Evening, Night, Off, Vacation)
- **핵심 가치**:
  - 교대 근무로 불규칙한 일상을 한눈에 정리하는 듀티 관리
  - 지친 일상에 활력을 불어넣는 따뜻하고 감성적인 UI (`#FF507C` 비바 코랄 핑크 톤업)
  - 동료와의 듀티 동기화 및 임상 실무 지식 공유

---

## 2. 5대 핵심 서비스 도메인 기능 명세 (Feature Specifications)

### 1) 🩺 홈 대시보드 (Home Dashboard)
- **헤더**: 🩹 밴드 로고 + 우간다 타이틀 (`#FF507C`), 알림(🔔), 프로필(👤)
- **인사 배너**: 사용자 닉네임 + 오늘의 듀티 알림 + 격려 문구
- **근무 카드 Row**:
  - **오늘 근무 카드**: 대형 52px 근무 코드(D/E/N/O), 근무 시간(07:30~13:30), `#FF507C` 솔리드 배경
  - **내일 근무 카드**: 서브 32px 근무 코드, 내일 일정 요약, `#FF6B8E` 솔리드 배경
  - **하단 서브 액션 버튼**: 알람 맞추기, 오늘의 운세 바로가기 (`#FFAEC0`)
- **주간 캘린더 스트립**:
  - 일~토 7일간의 날짜 및 근무 코드(D/E/N/O/V) 뱃지
  - 오늘 날짜는 `#FF507C` 원형으로 강조 (오늘 텍스트 + 일자)
- **스케줄 CTA (Pill Buttons)**:
  - `전체 스케줄 보기 >`, `스케줄 추가하기 +` (비바 코랄 핑크 `#FF507C`, `rounded-full`)
- **데일리 노트**:
  - `특이사항 기록하기` 카드 (핑크 라인 펜 아이콘)
  - `업무 가이드` 카드 (핑크 라인 구급함 아이콘)

### 2) 🔮 간호 운세 & 바이오리듬 (Fortune)
- **Hero 운세 카드**:
  - `#FF507C` 배경, 오늘 날짜, 컨디션 점수 배지(95점), 일일 운세 요약 문구, 행운 아이템 및 칼퇴 지수 태그
- **3분할 세부 운세 칩**:
  - 💖 **동료운**: 인연/협력 지수 (92점)
  - 💼 **직업운**: 노티/인계 원활 지수 (95점)
  - 💰 **휴식운**: 꿀잠/칼퇴 지수 (98점)
- **임상 바이오리듬**:
  - 💉 **주사/라인(IV) 성공률**: 손끝 감각 및 혈관 적중률 (%)
  - 🤝 **소통 & 노티(Noti) 원활도**: 주치의 및 타부서 협력 흐름 (%)
  - 🧘 **멘탈 방어력**: 스트레스 상황 극복 지수 (%)
- **오늘의 행운 & 힐링 조언**:
  - 행운의 컬러(비바 코랄 핑크), 행운의 숫자(7), 행운의 방향(스테이션 동쪽)
  - 좌측 4px 핑크 액센트가 들어간 일일 힐링 조언 카드

### 3) 👥 동기 & 친구 스케줄 동기화 (Friends)
- **동기 요약 배너**:
  - 이번 달 연결된 동기 수 요약 및 오늘 나와 같은 듀티를 하는 동기 인원 통계
- **듀티 시너지 카드**:
  - "이번 주 지은님과 Day 근무가 3번 겹쳐요! ☕" 감성 연결 및 오프 일정 매칭
- **친구 검색 & 추가 바**:
  - `#F8F9FA` 인풋 필드 및 `+ 친구 추가` 버튼
- **토스형 Invisible UI 동기 리스트**:
  - 40px 원형 아바타, 이름, 소속 병원 및 병동/연차 정보
  - 실시간 듀티 뱃지 (Day: `#4F98CA`, Evening: `#E2703A`, Night: `#272727`, Off: `#E84A5F`)
  - 이번 달 같이 쉬는 오프 일수 뱃지 (`오프 X일 겹침`)
  - `소통` / `메시지` 버튼

### 4) 📚 임상 공부 & 매뉴얼 (Study)
- **추천 학습 Hero 카드**:
  - `#FF507C` 배경, `NEW` 배지, 전해질 불균형 & IV 응급 간호 중재 매뉴얼
- **카테고리 칩 필터 (가로 스크롤)**:
  - `전체`, `약물 계산`, `응급 간호`, `검사/수치`, `임상 술기`, `EKG`
- **임상 족보 & 실무 노트 리스트**:
  - 주제별 아이콘(🧪, ⚡, 🩸, 📈, 🫀), 카테고리 뱃지, 소요 시간, 2줄 요약
  - 북마크(🔖) 토글 저장 기능
- **플로팅 작성 버튼 (FAB)**:
  - 우측 하단 노트 기록 펜 버튼 (`#FF507C`)

### 5) 💬 간호사 익명 커뮤니티 (Community)
- **카테고리 탭**:
  - `전체`, `자유게시판`, `임상/질문`, `이직/취업`, `교대근무`, `한풀이`
- **익명 게시글 카드**:
  - 익명 아바타, 닉네임, 병원 태그, 작성 시간, 제목, 본문 미리보기
  - 하단 반응 메트릭 (👁️ 조회수, ❤️ 좋아요, 💬 댓글 수)
- **글쓰기 바텀 시트 모달**:
  - 우측 하단 ✏️ 플로팅 버튼 클릭 시 토스 스타일 바텀 시트로 안전한 익명 글 작성 및 목록 즉시 반영

### 6) 👑 프리미엄 멤버십 (weganda+)
- **멤버십 가격 정책**: 월 7,800원 (첫 7일 무료 체험)
- **5대 유료 혜택 및 Feature Gating**:
  1. 🎨 **앱 커스텀 컬러 테마**: 기본 핑크 외 딥 그린, 딥 블루, 옐로, 퍼플 등 5종 커스텀 컬러 선택
  2. 🔮 **간호 사주/운세 무제한**: 무료 회원 월 5회 초과 시 잠금 오버레이(`PremiumLockOverlay`) 및 무제한 열람
  3. 💰 **월급/수당 자동 예측기 (Killer Feature)**: D/E/N 패턴 기반 기본급, 야간/휴일/초과수당 자동 계산 및 월급 통계
  4. 🤖 **임상 계산기 & Ask AI 무제한**: 복잡한 약물 용량/gtt 점적 계산 프리셋 및 AI 간호 어시스턴트 무제한 질의
  5. 📅 **무제한 교집합 캘린더 & AI 모임 추천**: 3인 초과 동기 듀티 무제한 동기화 및 최적 공통 오프 자동 추천
- **결제 게이트웨이 연동 (Toss Payments)**:
  - Mock 웹뷰(`TossPaymentWebView.tsx`) 2초 로딩 후 구독 전환
  - 추후 토스페이먼츠 MCP (`@tosspayments/integration-guide-mcp`) 기반 정식 결제 모듈 확장

---

## 3. 기술 스택 & 라이브러리 레퍼런스

| 계층 | 기술 | 세부 버전 및 용도 |
|------|------|-------------------|
| **Core Framework** | React Native / Expo | Expo SDK 51, React Native 0.74, TypeScript 5.3 |
| **Routing** | React Navigation | Bottom Tabs 6 + Native Stack 6 |
| **Styling** | NativeWind / Tailwind | NativeWind v2 + Tailwind CSS 3 (Solid Color, No Gradient) |
| **State Management** | Zustand | 클라이언트 전역 상태, 프로필/구독 상태 및 목 데이터 스토어 (`src/store/`) |
| **Icons** | React Native SVG Vector Icons | `react-native-svg` 기반 단색 미니멀 벡터 컴포넌트 (`src/components/common/Icon.tsx`) |
| **Payment Gateway** | Toss Payments (토스페이먼츠) | 토스 웹뷰 결제 연동 및 `@tosspayments/integration-guide-mcp` 표준 참조 |
| **Future Backend** | Python / Supabase | FastAPI / Django (AI Scheduling/OCR) + Supabase Auth & DB |

---

## 4. 디렉터리별 기술 구현 맵 (Directory Skills Map)

- `src/constants/`:
  - `theme.ts`: `#FF507C` Primary 토큰, Neutral, Typography 스케일 정의
  - `shiftTypes.ts`: D/E/N/O/V 표준 듀티 코드, 근무 시간, 고유 컬러 정의
  - `membership.ts`: 5대 프리미엄 혜택, 무료 제한 상수, 테마 옵션, 멤버십 가격(7,800원) 정의
  - `premiumTheme.ts`: 딥 그린(`#1B4332`), 골드(`#D4A853`), 토스 블루(`#0064FF`) 등 Paywall 토큰 정의
- `src/components/common/`:
  - `AppHeader.tsx`: 전 화면 공통 밴드 로고 + 우간다 핑크 타이틀 + 알림/프로필 헤더
  - `Card.tsx`: 16px radius, 소프트 드롭 섀도우, 화이트 카드 컨테이너
  - `Button.tsx`: Primary Pill Button, Sub Muted, Outline 버튼
  - `Input.tsx`: 토스 스타일 `#F8F9FA` 오프화이트 입력 필드
  - `PremiumBadge.tsx`: `👑 이용 중` / `✨ 알아보기 ›` 동적 구독 상태 배지
  - `PremiumLockOverlay.tsx`: 무료 회원 초과 시 반투명 블러 잠금 및 Paywall 전환 오버레이
  - `PaywallBottomSheet.tsx`: 인앱 기능 잠금 시 토스 스타일 업그레이드 바텀시트
  - `TossPaymentWebView.tsx`: 토스페이먼츠 Mock 결제 처리 웹뷰 모달
- `src/components/specific/`:
  - `DutyCalendar.tsx`: 교대근무 캘린더 그리드 컴포넌트
  - `FortuneCard.tsx`: `#FF507C` 테마 기반 운세 요약 카드
  - `Home/`:
    - `ClinicalAlarmModal.tsx`: 임상 퀵 프리셋 다중 알람 모달
    - `FullScheduleModal.tsx`: 월간 풀 캘린더 및 3교대 통계 모달
    - `AddScheduleModal.tsx`: AI 파일 업로드/직접입력/커스텀 듀티 에디터 모달
    - `DailyNoteModal.tsx`: 환자 인수인계 특이사항 CRUD 모달
  - `Fortune/`:
    - `BirthInfoModal.tsx`: 사주 탄생 정보(생년월일/시간/양음력/성별) 등록 모달
    - `NurseSajuDetailModal.tsx`: 간호 사주, 직장 오행 궁합, 간호 적합도 & 병동 랭킹 모달
    - `LoveFortuneDetailModal.tsx`: 애인 사주·MBTI 성격 솔루션, 짝사랑 공략 타임라인, 결혼 궁합 모달
    - `CareerFortuneDetailModal.tsx`: 10년 대운세 그래프, 추천 이직 병원 표, 동료 듀티 케미 모달
    - `WealthFortuneDetailModal.tsx`: 소비 성향 그래프, 자산 배분 포트폴리오 표, 재물 대운 타임라인 모달
  - `Friends/`:
    - `FriendProfileModal.tsx`: 동기 프로필 상세, 듀티 캘린더 대조, 즐겨찾기 고정 모달
    - `ChatRoomModal.tsx`: 1:1 대화방 및 듀티 맞교환 퀵 액션 모달
    - `GroupChatDetailModal.tsx`: 단체 톡방 및 전원 스케줄 일괄 비교 매트릭스 모달
    - `SharedShiftModal.tsx`: 오늘 겹치는 근무 동기 상세 바텀시트
  - `Community/`:
    - `PostDetailModal.tsx`: 게시글 상세, 댓글/대댓글 계층 뷰, 추천/공유/신고/차단 모달
    - `PostWriteModal.tsx`: 글쓰기 및 수정 모달 (카테고리, 익명 마스킹, 사진 3장 첨부)
    - `ReportModal.tsx`: 게시글/댓글 의료법 및 가이드라인 위반 신고 바텀시트
  - `Study/`:
    - `DrugCalculatorModal.tsx`: 임상 약물 gtt/cc 점적 속도 및 용량 계산기 모달
    - `StudyDetailModal.tsx`: 임상 프로토콜 상세 가이드라인 및 핵심 체크포인트 모달
    - `AskAiModal.tsx`: 임상 간호 AI 멘토 실시간 Q&A 대화 모달
  - `Notification/`:
    - `NotificationModal.tsx`: 듀티 교환, 근무 리마인더, 댓글 알림 센터 모달
  - `MyPage/`:
    - `MyPageModal.tsx`: 프로필 설정, 테마 컬러 5종 선택, 사주 탄생정보 연동, 3교대 통계 및 활동 내역 모달
- `src/screens/`:
  - `Home/DashboardScreen.tsx`: 홈 메인 대시보드 화면 및 월급/수당 예측 카드(D/E/N 수당 통계)
  - `Fortune/FortuneScreen.tsx`: 간호 운세 및 월 5회 횟수 제한 게이팅
  - `Friends/FriendsScreen.tsx`: 동기 듀티 현황, 3인 공유 제한 및 AI 모임 날짜 추천 게이팅
  - `Study/StudyScreen.tsx`: 약물 계산기, 임상 프로토콜, AI Q&A 학습 화면
  - `Community/CommunityScreen.tsx`: HOT 토픽, 병원 인증 뱃지, 북마크 보관함 커뮤니티 화면
  - `MyPage/MembershipScreen.tsx`: weganda+ 풀스크린 Paywall 모달 화면
- `src/navigation/`:
  - `BottomTabNavigator.tsx`: 5개 탭 및 중앙 돌출 64px FAB(🩺, `#FF507C`) 렌더링
  - `RootNavigator.tsx`: 인증 및 메인 탭 전환 루트 네비게이터
- `src/mocks/`:
  - `membership.ts`: 월급 예측 D/E/N 수당 및 월별 히스토리 Mock 데이터
  - `shifts.ts`, `fortunes.ts`, `fortuneData.ts`, `friends.ts`, `friendsData.ts`, `study.ts`, `studyData.ts`, `community.ts`, `communityData.ts`, `notificationsData.ts`, `alarms.ts`, `dailyNotes.ts`: 현실적인 임상 데이터 모델
- `src/store/`:
  - `useUserStore.ts`: 사용자 프로필, weganda+ 프리미엄 상태(`isPremium`, `monthlyFortuneCount`, `appThemeColor`) 및 액션 관리
  - `useFriendsStore.ts`: 동기 목록, 즐겨찾기 고정, 대화방 상태 관리
  - `useCommunityStore.ts`: 게시글 CRUD, 댓글/대댓글, 추천, 북마크, 신고/차단 관리
  - `useStudyStore.ts`: 임상 족보 북마크, AI 질문 Q&A 관리
  - `useNotificationStore.ts`: 알림 센터 및 읽음 처리 상태 관리
  - `useHeaderModalStore.ts`: 전역 상단바 알림 및 마이페이지 모달 제어 관리
  - `useFortuneStore.ts`: 사주 탄생 정보, 상대방/동료 정보 전역 관리
  - `useAlarmStore.ts`: 다중 임상 알람 상태 관리
  - `useDailyNoteStore.ts`: 환자 특이사항 기록 상태 관리
  - `useShiftScheduleStore.ts`: 월간 스케줄 및 커스텀 듀티 매핑 상태 관리

> **어느 상황에서 이 문서를 참조하는가?**
> - "각 화면(홈/운세/친구/학습/커뮤니티)에 정확히 어떤 UI 요소와 데이터 항목이 들어가야 하는가?"
> - "특정 디렉터리(`src/screens`, `src/mocks` 등)의 역할과 구현해야 할 기술 요구사항이 무엇인가?"
> - "3교대 듀티 코드(D/E/N/O/V)와 스케줄 계산 로직의 도메인 규칙이 무엇인가?"
> - **즉, '서비스에서 무엇을 만들어야 하고 기술적으로 어떻게 구성되어 있는가(What to Build & Technical Specs)'에 대한 기능 명세를 확인할 때 참조합니다.**
