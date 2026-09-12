# 출시 전 최종 점검 리포트 — 보안 · 회원가입/온보딩 · 키보드 입력 UX · 전체 화면 UI/UX

> 작성 목적: 아래 항목들은 AI(Claude Code)가 위에서부터 순서대로 읽고 바로 수정 작업에 착수할 수 있도록, 문제 위치(파일:라인)·원인·구체적 수정 방법을 명시했다.
> 각 항목 작업 후 반드시 `npx tsc --noEmit`을 실행해 타입 에러가 없는지 확인하고, `CLAUDE.md`의 "서비스 계층 경유 원칙" / "프리미엄 게이팅 단일 원천(`useUserStore`/`membership.ts`)" / "그라디언트·색상 하드코딩 금지" 규칙을 위반하지 않는지 재확인할 것.
> 4명의 독립 조사자가 각각 (1) 보안/서비스계층/RLS, (2) 회원가입·온보딩 UX, (3) 키보드·입력 UX, (4) 전체 화면 UI/UX를 담당해 조사한 결과를 통합했다.

---

## 우선순위 요약

| # | 심각도 | 영역 | 제목 |
|---|--------|------|------|
| 1 | Critical | 보안/인증 | 심사관 로그인 백도어가 프로덕션 빌드에 그대로 노출됨 |
| 2 | Critical | 보안/결제 | 프리미엄(`isPremium`) 상태의 서버 측 진실 원천 부재 |
| 3 | Critical | 데이터 신뢰성 | 커뮤니티 피드에 가짜(mock) 데이터가 일반 사용자에게도 노출됨 |
| 4 | Critical | 품질/안정성 | DashboardScreen의 `any` 타입 남용 및 로딩/에러 처리 부재 |
| 5 | Critical | 키보드 UX | GroupChatDetailModal에 KeyboardAvoidingView 완전 누락 |
| 6 | Critical | 키보드 UX | CreateGroupModal에 KeyboardAvoidingView 없음 |
| 7 | High | 보안 | SECURITY DEFINER RPC 함수 3종이 `authenticated` 역할에 과다 노출 |
| 8 | High | 보안 | `profileApi.updateProfile`이 클라이언트에서 `role` 필드를 그대로 전달 |
| 9 | High | 온보딩 UX | 이메일 인증에 실제 인증코드 검증 단계 없음 |
| 10 | High | 온보딩 UX | 온보딩 중 앱 종료 시 입력값 전부 소실 |
| 11 | High | 키보드 UX | 다수 모달(인증/게시글/채팅)에서 `keyboardShouldPersistTaps` 누락으로 첫 탭이 무시됨 |
| 12 | High | UI/UX | MyPageModal이 1200줄+ God Component이며 활동 통계가 하드코딩된 가짜 값 |
| 13 | High | 디자인 규칙 | MyPageModal 전역 색상 하드코딩 다수 (theme 상수 미사용) |
| 14 | High | UI/UX | StudyScreen 빈 데이터 시 undefined 접근(크래시 위험) 및 로딩 상태 미표시 |
| 15 | Medium | 보안 | Supabase Auth "유출된 비밀번호 검사" 비활성화 |
| 16 | Medium | 보안/UX | 로그인 에러 원문(영문) 메시지·객체가 그대로 노출/로깅됨 |
| 17 | Medium | 온보딩 UX | "나중에 인증하기" 스킵 후 재인증 진입 경로 확인 필요 |
| 18 | Medium | 키보드 UX | 다수 입력 폼에서 `returnKeyType`/`onSubmitEditing` 필드 체이닝 없음 |
| 19 | Medium | 키보드 UX | 중첩 `<Modal>` 구조로 인한 Android 키보드/포커스 충돌 위험 |
| 20 | Medium | UI/UX | FriendsScreen/CommunityScreen이 fetch 실패 시 에러 안내 없음 |
| 21 | Medium | UI/UX | AdminScreen이 어떤 네비게이터에도 연결돼 있지 않음 |
| 22 | Medium | 문서 | 네비게이션 skills.md 문서와 실제 탭 구성 서술 불일치 |
| 23 | Low | 디자인 규칙 | 색상 리터럴 하드코딩 (LoginScreen 등 다수 파일) |
| 24 | Low | UX | 심사 계정 버튼이 로그인 진행 중에도 비활성화되지 않음 (1번 해결 시 자연 소멸) |
| 25 | Low | 키보드 UX | `keyboardVerticalOffset` 공통 헬퍼 부재 |
| 26 | Low | 키보드 UX | `SwipeableBottomSheet`의 PanResponder와 TextInput 포커스 스크롤 충돌 가능성 |
| 27 | Low | 키보드 UX | 채팅 입력창 Enter(returnKeyType="send")로 전송 안 됨 |
| 28 | Low | 접근성 | FAB 탭에 시각적 라벨 없음, 일부 버튼 44px 터치영역 미달 가능성 |
| 29 | 정보 | 향후 대비 | SMS OTP 인증 추가 시 `textContentType="oneTimeCode"` 적용 필요 |

---

## Critical

### 1. 심사관 로그인 백도어가 프로덕션 빌드에 그대로 노출됨

- **파일**: `src/components/specific/Auth/ReviewerLoginModal.tsx:31-32, 46-48, 68-96, 135-173`, `src/screens/Auth/LoginScreen.tsx:96-109, 231`
- **문제**: 로그인 화면에 항상 렌더링되는 "심사 계정" 버튼을 누르면 하드코딩된 계정(`testuser` / `weganda103820@`)이 입력창에 미리 채워지고 "퀵 채우기" 칩까지 제공한다. `handleLogin`은 Supabase 인증 성공 여부와 무관하게(실패해도 `try/catch`로 조용히 무시) 로컬 상태를 `role: 'admin'`, `isPremium: true`, `isVerified: true`, `subscriptionInfo: { planType: 'yearly', status: 'active', ... }`로 강제 설정한다. `__DEV__`나 빌드 플래그 가드가 전혀 없고, ID 필드는 `keyboardType`도 지정돼 있지 않다.
- **왜 위험한가**: 실제 스토어 배포 빌드에서 아무나 이 버튼만 눌러 자격증명 검증 없이 관리자 권한 + 전체 프리미엄 기능을 무료로 얻을 수 있다. 자격증명이 화면에 그대로 노출되므로 디컴파일조차 필요 없다.
- **수정 방법**:
  1. `ReviewerLoginModal`과 `LoginScreen`의 "심사 계정" 버튼 렌더링을 `if (__DEV__ || Constants.expoConfig?.extra?.reviewerLoginEnabled)` 조건으로 감싸 프로덕션 빌드에서는 컴포넌트 트리에서 완전히 제외한다.
  2. App Store 심사용 계정이 실제로 필요하면 `eas.json` 빌드 프로필별 `extra.reviewerLoginEnabled` 값으로 제어하고, 스토어 배포 빌드에서는 반드시 `false`로 고정한다.
  3. 최소 완화책: 자격증명을 입력창에 미리 채우지 않고(`useState('')`), Supabase 인증이 실제로 성공했을 때만 관리자 상태를 설정하도록(무음 catch 제거) 수정한다.
  4. 부가 조치: `reviewerButton`의 `onPress`에도 다른 소셜 로그인 버튼과 동일하게 `disabled={loadingProvider !== null}`을 적용한다(항목 24).

### 2. 프리미엄(`isPremium`) 상태의 서버 측 진실 원천(source of truth) 부재

- **파일**: `src/services/inAppPurchaseService.ts:122-139, 238-317, 319-367`, `src/store/useUserStore.ts:131-170, 293-304, 301`
- **문제**: Supabase에 `purchases`/`subscriptions` 테이블 자체가 존재하지 않는다(`list_tables` 확인). `purchaseUpdatedListener`는 `finishTransaction` 호출 후 서버 영수증 검증 없이 곧바로 `useUserStore.getState().subscribeToPremiumWithDetails(...)`를 호출해 클라이언트 로컬 상태만 `isPremium: true`로 바꾸고 이 값은 `zustand/persist`로 기기에 영속화된다. 또한 `useUserStore.ts:301`의 `isPremium: userRole === 'plus' || userRole === 'admin' || get().isPremium` 로직은 OR 연산이라 한 번 true가 되면 서버 `role`이 바뀌어도 절대 false로 되돌아가지 않는다. `restorePurchases`도 동일하게 서버 대조 없이 클라이언트 상태만 신뢰한다.
- **왜 위험한가**: (a) 영수증 서버 검증이 없어 루팅/탈옥 기기나 로컬 스토리지 조작, 결제 콜백 스푸핑으로 영구 프리미엄을 얻을 수 있다. (b) 구독이 만료/환불돼도 클라이언트에 전파할 방법이 없어 한번 true가 되면 계속 프리미엄으로 남는다. (c) 항목 1(심사 백도어)과 결합 시 위험이 배가된다.
- **수정 방법**:
  1. Supabase에 `subscriptions` 테이블(`user_id`, `store_sku`, `status`, `expires_at`, `verified_at`)을 추가하고, IAP 영수증을 Edge Function으로 전송해 Apple/Google 서버 API로 검증한 뒤 이 테이블에 기록한다.
  2. `useUserStore`의 `isPremium`은 세션 시작 시(`syncUserFromSession`) 서버 테이블 값을 조회해 **덮어쓰도록**(로컬 값과 OR가 아니라 서버 값으로 replace) 수정한다.
  3. `subscribeToPremium`/`subscribeToPremiumWithDetails`는 클라이언트가 직접 `isPremium: true`를 세팅하지 말고, 서버 검증 결과(Edge Function 응답 또는 폴링)를 반영하도록 변경한다.
  4. 단기 완화책: `useUserStore.ts:301`의 `|| get().isPremium` 부분을 즉시 제거해 매 로그인마다 서버 `role` 값만 신뢰하도록 바꾼다.

### 3. 커뮤니티 피드에 가짜(mock) 데이터가 일반 사용자에게도 노출됨

- **파일**: `src/store/useCommunityStore.ts:87-92`
- **문제**: `communityApi.getPosts()`가 빈 배열을 반환하거나 실패하면 `isGuest` 여부와 무관하게 `MOCK_POSTS_DATA`(조작된 좋아요/댓글 수 포함)로 조용히 대체된다. `CLAUDE.md` 2번 규칙(mock은 게스트/프리뷰 모드 전용)에 위반.
- **왜 위험한가**: 서비스 오픈 초기(실제 글이 0개)나 네트워크 실패 시 실사용자가 조작된 가짜 게시글·통계를 진짜처럼 보게 되어 서비스 신뢰도를 해친다.
- **수정 방법**: `useCommunityStore`에서 mock 폴백 분기를 `isGuest`(또는 `userId === 'guest_user_preview'`)일 때만 타도록 조건을 추가하고, 일반 사용자에게는 실패 시 `error` 상태를 노출하거나 진짜 빈 목록(empty state)을 보여준다.

### 4. DashboardScreen의 `any` 타입 남용 및 로딩/에러 처리 부재

- **파일**: `src/screens/Home/DashboardScreen.tsx:44-54, 83, 84, 99, 115`
- **문제**: `schedules[key] as any`, `(SHIFT_TYPES as any)[code]` 등 `any` 캐스팅이 다수 존재해 `CLAUDE.md` 8번("`any` 사용 금지") 위반. 또한 `fetchMonthlySchedule(userId)` 호출에 로딩 스피너/에러 얼럿이 전혀 없어 네트워크 실패 시 근무표가 비어있는 이유를 사용자가 알 수 없다.
- **수정 방법**: `ShiftCode` 타입을 좁혀 `as any` 캐스팅을 제거하고, `useShiftScheduleStore`에 `isLoading`/`error` 상태를 추가해 화면에 스피너/에러 배너로 반영한다.

### 5. GroupChatDetailModal에 KeyboardAvoidingView 완전 누락

- **파일**: `src/components/specific/*/GroupChatDetailModal.tsx:88-307` (최상위 `<View style={styles.container}>`, 입력창 `inputBar` 285행 부근)
- **문제**: 단체 대화방 메시지 입력창을 탭하면 iOS에서 키보드가 입력창과 전송 버튼을 그대로 덮어버린다. 동일 프로젝트의 다른 채팅형 모달(`ChatRoomModal`, `PostDetailModal`, `AskAiModal`)은 전부 `KeyboardAvoidingView`로 감싸져 있는데 이 파일만 빠져 있어 일관성도 깨진다.
- **수정 방법**: 최상위 `View`를 `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`로 교체한다(다른 채팅 모달과 동일 패턴).

### 6. CreateGroupModal에 KeyboardAvoidingView 없음

- **파일**: `src/components/specific/*/CreateGroupModal.tsx:64-161` (`modalContainer`)
- **문제**: "새 단체 모임 만들기" 화면(가입 후 자주 쓰는 핵심 소셜 기능)에서 모임 이름 입력 시 화면 전체가 일반 `View`라 키보드가 폼 하단(친구 선택 리스트, 개설 버튼)을 가릴 수 있다.
- **수정 방법**: `modalContainer`를 `KeyboardAvoidingView`로 감싼다(항목 5와 동일 패턴).

---

## High

### 7. SECURITY DEFINER RPC 함수 3종이 `authenticated` 역할에 과다 노출

- **위치**: Supabase DB 함수 `public.accept_duty_swap(uuid)`, `public.delete_user_account()`, `public.prevent_self_role_escalation()`
- **문제**: `get_advisors(type: security)` 결과 세 함수 모두 `SECURITY DEFINER`이며 `authenticated` 역할이 REST RPC(`/rest/v1/rpc/...`)로 직접 호출 가능하다. `delete_user_account()`처럼 강한 부수효과가 있는 함수가 RPC로 노출되어 있으면 내부에 `auth.uid()` 기반 본인 확인이 없을 경우 타인 계정 삭제로 이어질 수 있다. `prevent_self_role_escalation()`은 트리거 전용으로 설계된 함수인데 RPC로도 호출 가능한 상태다(단, `profiles.role` 자기 승격 자체는 `tr_prevent_self_role_escalation` 트리거로 이미 서버에서 차단됨을 SQL로 확인함).
- **수정 방법**:
  1. `delete_user_account()`와 `accept_duty_swap()` 함수 본문에 `auth.uid()` 기반 본인/권한 검증이 있는지 재확인한다.
  2. 트리거 전용 함수(`prevent_self_role_escalation`)는 `REVOKE EXECUTE ON FUNCTION public.prevent_self_role_escalation() FROM authenticated, anon;`으로 REST 노출을 차단한다(트리거는 함수 소유자 권한으로 실행되므로 EXECUTE 권한 회수와 무관하게 정상 동작).
  3. 각 함수 정의에 `SET search_path = public, pg_temp`을 명시해 스키마 하이재킹 가능성도 함께 제거한다.
  4. 마이그레이션 파일로 작성해 `mcp__supabase__apply_migration`으로 반영한다.

### 8. `profileApi.updateProfile`이 클라이언트에서 `role` 필드를 그대로 전달

- **파일**: `src/services/profileApi.ts:115` (`if (updates.role !== undefined) rowUpdates.role = updates.role;`)
- **현재 상태**: DB 트리거로 실제로는 이미 방어되어 있음을 확인(항목 7 참고).
- **왜 그래도 고쳐야 하는가**: 서버 방어에 의존해 클라이언트 서비스 함수가 민감 필드를 무분별하게 전달하는 패턴 자체가 위험하다 — 트리거가 실수로 제거/변경되거나 다른 테이블에 동일 패턴이 복제되면 즉시 취약점이 된다.
- **수정 방법**: `profileApi.updateProfile`의 인자 타입에서 `role`을 제거하고, 필요하다면 `adminApi.updateUserRole()` 같은 관리자 전용 함수로 분리해 일반 프로필 갱신 경로에는 `role` 필드가 타입상 존재하지 않도록 좁힌다.

### 9. 이메일 인증에 실제 인증코드 검증 단계 없음

- **파일**: `src/components/specific/Onboarding/Step2Verification.tsx:64-84, 260-277`
- **문제**: 이메일 인증 탭에서 "공식 도메인으로 인증 코드가 발송됩니다"라고 안내하지만, `handleCompleteVerification`은 이메일 형식(`@` 포함 여부)만 검사하고 바로 다음 단계로 넘어간다. 실제 코드 발송/입력/검증 로직이 코드베이스 어디에도 없다.
- **왜 문제인가**: 사용자는 오지 않는 인증코드를 기다리며 혼란을 겪고, 타인의 이메일을 입력해도 그대로 통과되어 인증 기능 자체가 무의미해진다.
- **수정 방법** (택1):
  1. (권장) `verificationApi.ts`에 `sendVerificationCode(email)` / `confirmVerificationCode(email, code)`를 추가하고 Supabase Edge Function으로 실제 코드를 발송, `Step2Verification`에 6자리 코드 입력 UI를 별도 하위 컴포넌트로 분리해 추가한다(`CLAUDE.md` 4번 규칙 준수).
  2. (임시) 실시간 검증이 아니라 서류 심사와 동일하게 "제출 후 관리자 심사"로 동작한다면, 안내 문구를 실제 동작("입력하신 이메일은 관리자 심사팀이 확인 후 승인 여부를 안내드립니다")과 일치시킨다.

### 10. 온보딩 중 앱 종료/재시작 시 입력값 전부 소실

- **파일**: `src/screens/Auth/OnboardingFlowScreen.tsx:21-30, 86-92`
- **문제**: `currentStep`과 `profileData`(닉네임/병원명/병동/연차 등)가 컴포넌트 로컬 `useState`로만 관리된다. `useUserStore.hasCompletedOnboarding`은 `persist`되어 "완료 여부"는 유지되지만, 완료 전 중간 입력 데이터는 저장되지 않는다.
- **왜 문제인가**: 2단계(서류 첨부)까지 입력하다 앱이 종료되면 재실행 시 `OnboardingFlowScreen`이 항상 1단계·빈 값으로 초기화되어 사용자가 처음부터 다시 입력해야 한다.
- **수정 방법**:
  1. `useUserStore`에 `onboardingDraft: { step: 1 | 2 | 3; profileData: Step1Data } | null` 필드를 추가하고 `persist`의 `partialize` 대상에 포함한다.
  2. `OnboardingFlowScreen` 마운트 시 `onboardingDraft`가 있으면 이를 초기값으로 복원하고, 각 단계 전환 시점마다 갱신한다.
  3. `completeOnboarding()` 호출 시 `onboardingDraft`를 `null`로 초기화한다.

### 11. 다수 모달에서 `keyboardShouldPersistTaps` 누락 — 첫 탭이 무시됨

- **파일**: `VerificationModal.tsx`(SwipeableBottomSheet 기반), `SalaryCalculatorModal.tsx`, `PostWriteModal.tsx`, `PostDetailModal.tsx`, `ChatRoomModal.tsx`, `AskAiModal.tsx`
- **문제**: 위 파일들의 `ScrollView`에 `keyboardShouldPersistTaps`가 설정돼 있지 않다. 예를 들어 회원가입 직후 첫 관문인 "간호사/학생 인증" 폼(`VerificationModal`)에서 병원명 입력 중 키보드가 열린 상태로 바로 아래 "제출하기" 버튼을 누르면 첫 탭은 키보드만 닫고 버튼은 눌리지 않아 사용자가 두 번 탭해야 한다(전형적 이탈 유발 버그). 반면 `DrugCalculatorModal.tsx`, `AddFriendModal.tsx`, `Step1/2Onboarding`은 이미 `keyboardShouldPersistTaps="handled"`를 적용 중이라 이것이 사내 표준 패턴임을 알 수 있다.
- **수정 방법**: 위 6개 파일의 `ScrollView`에 `keyboardShouldPersistTaps="handled"`를 동일하게 추가한다.

### 12. MyPageModal이 1200줄+ God Component이며 활동 통계가 하드코딩된 가짜 값

- **파일**: `src/components/specific/MyPage/MyPageModal.tsx:500-546`
- **문제**: "이번 달 3교대 현황"(Day 10회/Evening 8회/Night 5회/Off 8회)과 "내 활동 기록"(글 3, 댓글 12, 북마크 5)이 실제 사용자 데이터와 무관하게 리터럴로 박혀 있어 모든 사용자에게 동일한 가짜 숫자가 노출된다. `CLAUDE.md` 2번(하드코딩 mock 금지)·4번(30~50줄 초과 시 서브 컴포넌트 분리) 위반.
- **수정 방법**: 실제 값은 서비스 계층(`profileApi`/`scheduleApi`)에서 계산해 store로 주입하고, 해당 섹션을 `MyPageActivityStatsSection` 등 서브 컴포넌트로 분리한다.

### 13. MyPageModal 전역 색상 하드코딩 다수

- **파일**: `src/components/specific/MyPage/MyPageModal.tsx:337-339, 397-407, 549-596, 1097-1107` 등
- **문제**: `'#DEF7EC'`, `'#FEF3C7'`, `'#31C48D'`, `'#FCD34D'`, `'#F87171'`, `'#F8FAFC'` 등 20개 이상의 hex 리터럴이 `theme.ts`/`premiumTheme.ts`를 거치지 않고 직접 사용된다. `CLAUDE.md` 7번 위반이며, 테마 선택 그리드(549-596행)는 정상 동작하지만 정작 화면 자신의 스타일(sectionCard, verificationCard 등)은 그대로라 프리미엄 테마(딥그린 등)로 바꿔도 마이페이지 내부는 시각적으로 바뀌지 않는 UX 불일치가 발생한다.
- **수정 방법**: `constants/theme.ts`에 `success/warning/danger` 계열 시맨틱 토큰을 추가하고 리터럴을 전부 치환, 스타일 전반에 `useAppTheme()`을 적용한다.

### 14. StudyScreen 빈 데이터 시 undefined 접근(크래시 위험) 및 로딩 상태 미표시

- **파일**: `src/screens/Study/StudyScreen.tsx:136-141`
- **문제**: `studyGuides[1]`을 인덱스로 직접 접근하는데, 네트워크 실패나 데이터 1개 이하 상태에서 `undefined`가 `StudyFeaturedCard`에 그대로 전달돼 하위 컴포넌트가 null 체크를 안 하면 크래시 위험이 있다. `isLoadingGuides`도 화면에서 구독하지 않아 첫 진입 시 빈 화면이 아무 피드백 없이 보인다.
- **수정 방법**: `studyGuides.length > 1`일 때만 렌더링하고, `isLoadingGuides`를 화면에 연결해 스피너를 표시한다.

---

## Medium

### 15. Supabase Auth "유출된 비밀번호 검사" 비활성화

- **위치**: Supabase 프로젝트 Auth 설정(코드 아님, 대시보드)
- **문제**: `get_advisors(type: security)`에서 `auth_leaked_password_protection` 경고 — HaveIBeenPwned 기반 유출 비밀번호 차단이 꺼져 있다.
- **수정 방법**: Supabase 대시보드 → Authentication → Policies에서 "Leaked password protection"을 활성화한다(이메일/비밀번호 로그인을 쓰는 경우에만 의미 있음).

### 16. 로그인 에러 원문(영문) 메시지·객체가 그대로 노출/로깅됨

- **파일**: `src/screens/Auth/LoginScreen.tsx:45, 66, 87` (`Alert.alert(..., error.message)`), `src/services/auth.ts:170-173` (`console.error`로 에러 객체 전체 로깅)
- **문제**: Supabase/OAuth 원문 에러가 그대로 사용자에게 노출되며, `auth.ts`는 콜백 URL에서 파싱한 토큰이 섞일 수 있는 에러 객체 전체를 로깅해 Sentry 등 연동 시 세션 토큰이 로그에 남을 위험이 있다.
- **수정 방법**: `getFriendlyAuthErrorMessage(error): string` 유틸을 추가해 알려진 에러를 한국어 친화 메시지로 매핑하고 화면에는 그 결과만 노출한다. 로깅은 에러 메시지 문자열만 남기고 원본 객체는 로깅하지 않는다.

### 17. "나중에 인증하기" 스킵 후 재인증 진입 경로 확인 필요

- **파일**: `src/components/specific/Onboarding/Step2Verification.tsx:298`, `src/screens/Auth/OnboardingFlowScreen.tsx:86-92`
- **문제**: 스킵 문구는 "나중에 마이페이지에서 인증할게요"이지만, 이후 `MyPageModal` 등에서 인증 재개 진입점이 실제로 눈에 띄게 노출되는지 확인되지 않았다.
- **수정 방법**: `MyPageModal.tsx`/`MyPageFooterSection.tsx`에서 `verificationStatus === 'none'`인 사용자에게 "신원 인증하기" 배너/메뉴가 명확히 보이는지 점검하고, 없다면 추가한다.

### 18. 다수 입력 폼에서 `returnKeyType`/`onSubmitEditing` 필드 체이닝 없음

- **파일**: `Step1ProfileSetup.tsx:155-184`(닉네임→병원→병동→연차 4필드), `Step2Verification.tsx:261-273`(병원명→면허번호), `VerificationModal.tsx:326-344`, `ReviewerLoginModal.tsx:135-158`(ID→PW, `keyboardType="email-address"`도 누락), `AddFriendModal.tsx:207-215`(코드 검색), `CommunityScreen.tsx:187-193`(검색창), `DrugCalculatorModal.tsx:178-217`, `SalaryCalculatorModal.tsx:148-196`
- **문제**: 필드마다 `returnKeyType="next"` + `onSubmitEditing`으로 다음 입력창에 자동 포커스 이동하는 체이닝이 없어, 매 필드마다 키보드를 내리고 다음 칸을 손으로 탭해야 한다. 특히 회원가입 온보딩 1~2단계는 이탈에 민감한 구간이다. `StudyAiSearchBar.tsx:57-59`는 이미 `onSubmitEditing`+`returnKeyType="search"`+`clearButtonMode` 패턴을 정확히 구현해뒀으므로 참고 가능.
- **수정 방법**: `useRef` 배열로 각 입력 필드에 ref를 연결하고 `onSubmitEditing={() => nextInputRef.current?.focus()}` 체이닝, 마지막 필드는 `returnKeyType="done"|"go"|"search"` + 제출/검색 함수 호출로 마무리한다. `ReviewerLoginModal`의 ID 필드에는 `keyboardType="email-address"`도 추가한다(단, 항목 1 처리 시 이 파일 자체가 프로덕션에서 제거될 예정).

### 19. 중첩 `<Modal>` 구조로 인한 Android 키보드/포커스 충돌 위험

- **파일**: `VerificationModal.tsx`(SwipeableBottomSheet, 이미 RN `Modal`) 내부에서 `DocumentPickerActionSheet.tsx`도 별도 `<Modal>`을 띄움. `MyPageModal → VerificationModal → DocumentPickerActionSheet`로 3중 중첩까지 발생.
- **문제**: Android에서 Modal 안에 Modal을 열면 두 번째 모달이 첫 번째 모달의 `statusBarTranslucent`/window 설정과 충돌해 배경이 깜빡이거나 키보드 포커스가 하위 모달로 넘어가지 않는 사례가 흔하다(실기기 확인 필요).
- **수정 방법**: `DocumentPickerActionSheet`를 별도 `Modal`을 쓰지 않는 `SwipeableBottomSheet` 기반으로 교체한다.

### 20. FriendsScreen/CommunityScreen이 fetch 실패 시 에러 안내 없음

- **파일**: `src/screens/Friends/FriendsScreen.tsx:36-40`, `src/screens/Community/CommunityScreen.tsx:40-42`
- **문제**: 로딩 스피너와 empty state는 있지만 `fetchFriends`/`fetchPosts`가 reject됐을 때 사용자 안내가 없어, 단순히 로딩만 꺼지고 실패 상태가 empty state로 오인된다(CommunityStore는 실패 시 항목 3의 mock으로 대체됨).
- **수정 방법**: 각 스토어에 `error` 상태를 추가하고 화면에 재시도 버튼을 포함한 에러 배너를 추가한다.

### 21. AdminScreen이 어떤 네비게이터에도 연결돼 있지 않음

- **파일**: `src/screens/Admin/AdminScreen.tsx` 및 전체 검색 결과 자기 자신 외 import 없음
- **문제**: 관리자 화면 진입 경로가 없어 실제 운영 중 접근이 불가능하거나, 별도 진입점이 유실된 상태일 수 있다.
- **수정 방법**: 의도적 격리라면 조치 불필요. 아니라면 딥링크 또는 역할 기반 라우트를 `RootNavigator`에 추가하고 `role === 'admin'` 가드를 확인한다.

### 22. 네비게이션 skills.md 문서와 실제 탭 구성 서술 불일치

- **파일**: `src/navigation/BottomTabNavigator.tsx:66-146`(실제: 운세→친구→홈→학습→커뮤니티) vs `src/navigation/skills.md:39, 44`(Tab3=FAB/홈, Tab4=학습 서술이 실제와 미묘하게 헷갈리게 기술됨)
- **수정 방법**: skills.md의 탭 다이어그램을 실제 탭 순서/라벨과 정확히 일치하도록 갱신한다.

---

## Low

### 23. 색상 리터럴 하드코딩 (LoginScreen 등)

- **파일**: `src/screens/Auth/LoginScreen.tsx`(`#191F28`, `#4E5968`, `#8B95A1` 등)
- **수정 방법**: `theme.ts`의 `COLORS`에 텍스트 계층 색상(`textPrimary`/`textSecondary`/`textTertiary`)이 있는지 확인 후 없으면 추가하고 리터럴을 상수 참조로 교체한다. (그라디언트 사용은 발견되지 않아 규칙 준수 확인됨.)

### 24. 심사 계정 버튼이 로그인 진행 중에도 비활성화되지 않음

- **파일**: `src/screens/Auth/LoginScreen.tsx:99-109`
- **문제**: 다른 소셜 로그인 버튼은 `disabled={loadingProvider !== null}`이 걸려있지만 `reviewerButton`에는 없다.
- **수정 방법**: 항목 1 처리 시 이 버튼 자체가 프로덕션에서 사라지므로 자동 해소됨. 개발 빌드에서 유지한다면 동일 가드를 추가한다.

### 25. `keyboardVerticalOffset` 공통 헬퍼 부재

- **파일**: `ReviewerLoginModal.tsx`, `AddFriendModal.tsx`, `GroupChatDetailModal.tsx`, `CreateGroupModal.tsx` 등 다수
- **문제**: `KeyboardAvoidingView`가 있는 곳도 `keyboardVerticalOffset`이 미지정이라 커스텀 헤더/노치가 있는 기기에서 입력창이 살짝 가려지거나 과도하게 떠 보일 수 있다.
- **수정 방법**: `useSafeAreaInsets().top` + 헤더 높이를 조합한 `useKeyboardOffset` 공통 훅을 `src/hooks/`에 추가해 재사용한다.

### 26. `SwipeableBottomSheet`의 PanResponder와 TextInput 포커스 스크롤 충돌 가능성

- **파일**: `src/components/common/SwipeableBottomSheet.tsx:78-108`
- **문제**: `onMoveShouldSetPanResponderCapture`가 `dy>10` + 수직 우세 제스처를 하위 뷰보다 먼저 가로챈다. 바텀시트 내 TextInput에 포커스가 있는 상태에서 스크롤을 살짝만 내려도 시트가 드래그로 오인해 키보드가 갑자기 닫히며 시트가 들썩일 가능성이 있다(`SalaryCalculatorModal`/`DrugCalculatorModal`/`VerificationModal`이 이 컴포넌트를 사용).
- **수정 방법**: 실기기 테스트로 재현 여부를 확인하고, 필요 시 TextInput 포커스 중에는 PanResponder capture 임계값을 높이거나 비활성화한다.

### 27. 채팅 입력창 Enter로 전송 안 됨

- **파일**: `ChatRoomModal.tsx:222-229`, `GroupChatDetailModal.tsx:286-292`, `AskAiModal.tsx:152-158`
- **문제**: `returnKeyType="send"`/`onSubmitEditing`이 없어 전송 버튼만 유효한 전송 수단이다.
- **수정 방법**: 단일 라인 입력이라면 `returnKeyType="send"` + `onSubmitEditing={handleSend}`를 추가한다(멀티라인 입력이면 현재처럼 버튼 전송 유지가 적절할 수 있음 — UX 판단 필요).

### 28. FAB 탭 시각 라벨 없음 / 일부 버튼 44px 터치영역 미달 가능성

- **파일**: `BottomTabNavigator.tsx:41`(`tabBarLabel: ''`), `CommunityScreen.tsx`(`writeButton`: paddingVertical 9 + 폰트 14 ≈ 실높이 32px 추정)
- **수정 방법**: FAB 하단에 "홈" 텍스트 라벨 추가 검토, `writeButton`은 실기기 실측 후 필요 시 `minHeight: 44` 명시.

### 29. (정보) SMS OTP 인증 추가 시 대비 사항

- **문제**: 현재 이메일/서류 인증만 존재해 OTP 자동완성 관련 코드가 없다. 향후 휴대폰 SMS 인증을 추가한다면 `textContentType="oneTimeCode"`(iOS)와 `autoComplete="sms-otp"`(Android, RN 0.71+)를 반드시 적용해야 자동 채움이 동작한다.

---

## 확인 완료 (정상 / 조치 불필요)

작업 중 함께 점검했으나 문제가 없어 별도 조치가 필요 없는 항목 — 중복 작업 방지를 위해 기록.

- **서비스 계층 우회**: `src/screens/**`, `src/components/**` 전체에서 `supabase.from(`/`supabase.rpc(`/`supabase.auth`/`fetch(` 직접 호출이 발견되지 않음(`ReviewerLoginModal.tsx`의 직접 `supabase.auth.signInWithPassword` 호출은 예외이나 이는 Critical #1의 일부이며 파일 자체가 제거 대상).
- **하드코딩된 시크릿**: 소스 코드에 `service_role` 키, JWT secret 등 민감 키 없음. `.env`/`.env.local`은 `.gitignore`에 정상 등록(anon key만 `EXPO_PUBLIC_SUPABASE_ANON_KEY`로 노출되는 것은 Supabase 설계상 정상).
- **`npx tsc --noEmit`**: 타입 에러 없이 통과 확인(단, Critical #4의 `any` 캐스팅은 컴파일은 되지만 규칙 위반이므로 조치 대상).
- **RLS**: `public` 스키마의 모든 테이블(`profiles`, `schedules`, `posts`, `friendships`, `chat_messages`, `daily_notes`, `clinical_alarms` 등 19개) RLS 활성화 확인. 단, 각 정책의 `USING`/`WITH CHECK` 조건 자체까지는 이번 조사에서 상세 검증하지 않음(별도 점검 권장).
- **`profiles.role` 자기 승격 방어**: `tr_prevent_self_role_escalation` 트리거가 `check_is_admin()`이 아닌 사용자의 `role` 변경 시도를 서버에서 차단하는 것을 SQL로 직접 확인함.
- **IAP 라이프사이클 기본 배선**: `App.tsx:150-162`에서 `inAppPurchaseService.init()` / `setupPurchaseListeners()` / `removePurchaseListeners()`가 실제로 호출됨(`CLAUDE.md`에 "초기화 호출 누락"이라 명시돼 있었으나 이미 해결됨). `finishTransaction`, `getAvailablePurchases`도 구현되어 있음 — 단, Critical #2의 "서버 검증 부재"는 별개 문제로 남음.

---

## 작업 순서 제안 (AI 실행 시)

1. **Critical #1**(심사관 백도어 프로덕션 차단) → 즉시 조치. 빌드 설정 가드만으로 해결 가능해 리스크 대비 작업량이 가장 적음.
2. **Critical #5, #6**(GroupChatDetailModal/CreateGroupModal 키보드 회피) → 다른 채팅 모달과 동일 패턴 복사로 빠르게 처리 가능.
3. **High #11**(keyboardShouldPersistTaps 6개 파일), **Medium #18**(returnKeyType 체이닝) → 동일 패턴 일괄 적용.
4. **Critical #3**(커뮤니티 mock 노출) → `isGuest` 조건 추가로 빠르게 해결.
5. **Critical #4**(DashboardScreen any/로딩·에러) → 타입 좁히기 + 스토어 상태 추가.
6. **High #10**(온보딩 draft 영속화) → `useUserStore` 필드 추가 + `OnboardingFlowScreen` 연동.
7. **High #12, #13**(MyPageModal 리팩터링 + 색상) → 범위가 크므로 통계 하드코딩 제거와 색상 치환을 별도 커밋으로 분리 권장.
8. **High #9**(이메일 인증 코드) → 범위가 크면 우선 임시 조치(문구 수정)로 처리 후 후속 스프린트에서 정식 구현.
9. **High #7**(SECURITY DEFINER RPC), **Medium #15**(Leaked password) → Supabase 마이그레이션/대시보드 작업이므로 별도 PR로 분리 권장.
10. **Critical #2**(프리미엄 서버 검증) → 백엔드 스키마 설계가 필요한 가장 큰 작업이라 별도 기획/스프린트로 분리 권장. 단, 단기 완화책(`useUserStore.ts:301`의 `|| get().isPremium` 제거)은 즉시 적용 가능.
11. 나머지 Medium/Low 항목은 위 작업들과 병행해 여유 있을 때 처리.
