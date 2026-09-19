# 🚀 우간다 (Weganda) 정식 출시 완결 워크플로우 (v3.0)
**Production Launch Execution Workflow & Agent Orchestration**

> **프로젝트**: 우간다 (Weganda) — 대한민국 3교대 간호사 라이프스타일 플랫폼  
> **문서 버전**: v3.0 (하드 테스트 기반 출시 로드맵) / 갱신 일시: 2026-09-11  
> **Supabase 프로젝트**: `vegtlnhgfjxdntnxbztb` (ap-northeast-2, ACTIVE_HEALTHY)  
> **번들 ID**: `com.weganda.app` (iOS & Android 공통)  
> **최종 목표**: Phase 1~4 결함 전수 해결 → EAS Build → App Store / Google Play Store 동시 심사 통과 및 출시

---

## 🗺️ 출시 마스터 로드맵 개요

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Phase 1] 🔴 보안 긴급 조치 (Security Criticals)           — 즉시 (Day 1)   │
│   • Edge Function API키 제거 및 JWT 검증 강제                            │
│   • profiles role 권한 상승 방지 DB 트리거 배포                          │
│   • 웹 /admin 인가 가드 및 개발자 UUID 폴백 소거                          │
├────────────────────────────────────────────────────────────────────────┤
│ [Phase 2] 🔴 크래시 & 스토어 차단 해소 (Crash & Compliance) — Day 1~2      │
│   • LoginScreen navigation 참조 크래시 픽스                            │
│   • 온보딩 완료 시 Supabase Profile DB UPDATE 연동                      │
│   • 마이페이지 회원 탈퇴(Apple 5.1.1(v)) & 약관 링크 신설                 │
│   • Paywall 구매 복원(Restore) & RECORD_AUDIO 권한 삭제                 │
│   • 커뮤니티 댓글/대댓글 신고 & 차단 기능 구현 (Apple 1.2 UGC)            │
├────────────────────────────────────────────────────────────────────────┤
│ [Phase 3] 🟠 비즈니스 로직 & 안정성 강화 (Business & Lifecycle) — Day 2~3  │
│   • 운세 카운터 증가 & Monthly Reset 로직 연동                          │
│   • Ask AI / 약물 계산기 무료 3회 제한 & Paywall 연동                    │
│   • 결제 성공 모달 플로우 개선 & 가격 표기/SKU 통일                       │
│   • AppState 포그라운드 복귀 시 세션 토큰 자동 갱신                      │
│   • 딥링크(Deep Linking) 네비게이션 매핑 & 단체 톡방 데이터 복구         │
├────────────────────────────────────────────────────────────────────────┤
│ [Phase 4] 🟡 UX 디테일 & 법률 보완 (UX, A11y & Legal)       — Day 3~4  │
│   • 온보딩 0년차 입력 버그 및 초기 생년월일 하드코딩 제거                  │
│   • 서류 인증 시 개인정보 수집/이용 동의 체크박스 추가                   │
│   • app.json buildNumber/versionCode 명시 & 연령 등급 상향(12+)        │
│   • 안드로이드 뒤로가기 backBehavior 및 최소 터치영역(44px) 보강         │
├────────────────────────────────────────────────────────────────────────┤
│ [Phase 5] 🚀 최종 빌드 & 스토어 심사 제출 (Build & Submit)   — Day 5~   │
│   • EAS Production Build 생성 (AAB / IPA)                              │
│   • TestFlight & Google 내부 테스트 트랙 배포 및 최종 점검               │
│   • App Store Connect & Google Play Console 심사 제출                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 서브 에이전트 오케스트레이션 전략 (Agent Delegation Strategy)

개발 효율을 극대화하기 위해 각 Phase별 작업을 독립적인 전문 서브 에이전트에게 병렬 위임하여 진행합니다.

| Phase | 에이전트 역할 (Role) | 담당 파일 및 책임 영역 |
|---|---|---|
| **Phase 1** | `SecurityDBSpecialist` | Supabase RLS, 트리거 배포, Edge Function Secrets 설정 |
| **Phase 1** | `BackendConfigSpecialist` | `App.tsx` 웹 라우트 가드, `useShiftScheduleStore` UUID 제거, `supabase.ts` |
| **Phase 2** | `AuthOnboardingSpecialist`| `LoginScreen.tsx`, `OnboardingFlowScreen.tsx`, 프로필 DB UPDATE 연동 |
| **Phase 2** | `ComplianceSpecialist` | `MyPageModal.tsx`(회원탈퇴, 약관), `PaywallBottomSheet.tsx`(구매복원), `app.json` |
| **Phase 2** | `CommunityUgcSpecialist` | `PostDetailModal.tsx` 댓글 신고 및 차단 액션 모달 연동 |
| **Phase 3** | `MonetizationSpecialist` | `useUserStore`(운세 카운터/리셋), `AskAiModal`, `InAppPurchaseModal`, SKU/가격 일원화 |
| **Phase 3** | `AppLifecycleSpecialist` | `App.tsx`(AppState 세션 갱신, 스플래시 플리커), `RootNavigator.tsx`(딥링크), 톡방 데이터 |
| **Phase 4** | `UxA11ySpecialist` | 0년차 버그, 탄생정보 초기화, 뒤로가기 `backBehavior`, 터치영역 및 로딩 처리 |
| **Phase 4** | `LegalMetadataSpecialist`| `VerificationModal.tsx`(개인정보 동의), `STORE_RELEASE_GUIDE.md`, `app.json` 빌드번호 |

---

## 🔴 Phase 1: 보안 긴급 조치 (Security Critical Fixes) — Day 1

> **목표**: 비인가 API 과금 공격, DB 권한 상승, 관리자 페이지 무단 접근 차단

### 1-1. Supabase Edge Function API 키 제거 & `verify_jwt: true` 배포 ⛔ CRITICAL
- [x] `schedule-ocr`의 `verify_jwt`를 `true`로 변경하여 무인증 호출 차단
- [x] `clinical-ai-qa`의 `verify_jwt`를 `true`로 변경하여 무인증 호출 차단
- [x] Edge Function 소스코드 내 하드코딩된 API Key 제거:
  - `clinical-ai-qa/index.ts`: OpenAI Key 하드코딩 제거
  - `schedule-ocr/index.ts`: Gemini Key 하드코딩 제거
  - `fortune-generate/index.ts`: OpenAI Key 하드코딩 및 `gpt-5.6-luna` 오타 제거 (`gpt-4o-mini`로 변경)
- [x] 유출된 OpenAI 키 2종 및 Gemini 키 1종 콘솔에서 폐기(Revoke) 및 재발급

### 1-2. `profiles` role 컬럼 무단 변경 방지 DB 트리거 배포 ⛔ CRITICAL
일반 사용자가 자신의 role을 'admin'으로 자가 승격시키는 취약점 차단:
- [x] Supabase SQL 실행 (`prevent_self_role_escalation` BEFORE UPDATE 트리거 배포 완료)

### 1-3. 웹 환경(`/admin`) 관리자 라우트 인가 가드 적용 ⛔ CRITICAL
- [x] `App.tsx`: `currentWebRoute === 'admin'` 분기 시 `isAuthenticated && role === 'admin'` 검증
- [x] 권한 없는 일반 유저/방문자 접근 시 관리자 화면 렌더링 차단 및 랜딩 페이지로 강제 리다이렉트

### 1-4. 개발자 고정 UUID(`33072254-...`) 폴백 소거 ⛔ HIGH
- [x] `src/store/useShiftScheduleStore.ts`: `userId || '33072254-...'` 폴백 제거 (userId 없으면 요청 중단)
- [x] `src/services/adminApi.ts`: 개발자 UUID 하드코딩 제거

### 1-5. DB RPC `accept_duty_swap` 함수 권한 승격 ⛔ HIGH
- [x] `public.accept_duty_swap`을 `SECURITY DEFINER`로 전환하여 1:1 맞교환 스케줄 DB 업데이트 RLS 충돌 해결

---

## 🔴 Phase 2: 크래시 & 스토어 차단 해소 (Crash & Store Review Blockers) — Day 1~2

> **목표**: 런타임 크래시 0건 달성 및 Apple/Google 정책 위반에 따른 즉시 거절(Rejection) 요건 100% 해소

### 2-1. `LoginScreen.tsx` navigation 인자 누락 크래시 해결 ⛔ CRITICAL
- [x] `src/screens/Auth/LoginScreen.tsx`: 컴포넌트 선언부에 `{ navigation }` 매개변수 바인딩
- [x] "3초 간편 시작" 및 온보딩 진입 시 `ReferenceError: navigation is not defined` 완전 해소

### 2-2. 온보딩 완료 시 Supabase `profiles` DB UPDATE 연동 ⛔ CRITICAL
- [x] `src/screens/Auth/OnboardingFlowScreen.tsx`: `handleFinalComplete`에서 `useUserStore.updateUserProfile()` 또는 `profileApi.updateProfile()` 호출
- [x] 닉네임, 병원명, 병동명, 임상 연차가 Supabase DB `public.profiles` 테이블에 정상 저장되는지 확인
- [x] 앱 재시작/재로그인 후 온보딩 정보 유지 검증

### 2-3. 회원 탈퇴 (Account Deletion — Apple Guideline 5.1.1(v)) 구현 ⛔ CRITICAL
- [x] `src/services/auth.ts`: `deleteAccount()` 함수 구현 (Auth 유저 삭제 또는 profiles 비활성화)
- [x] `src/store/useUserStore.ts`: `deleteAccount()` 액션 구현 (원격 삭제 + 로컬 스토리지 초기화)
- [x] `src/components/specific/MyPage/MyPageModal.tsx`: 마이페이지 최하단에 빨간색 "회원 탈퇴" 버튼 배치 및 재확인 Alert 다이얼로그 연동

### 2-4. `PaywallBottomSheet.tsx` 내 '구매 복원(Restore)' 버튼 추가 ⛔ CRITICAL
- [x] `src/components/common/PaywallBottomSheet.tsx`: 결제 유도 시트 하단에 "구매 내역 복원" 액션 버튼 추가
- [x] `inAppPurchaseService.restorePurchases()` 연결 및 구독 상태 복원 피드백 제공

### 2-5. `app.json` 미사용 `RECORD_AUDIO` 권한 삭제 ⛔ CRITICAL
- [x] `app.json`의 `android.permissions` 배열에서 `"android.permission.RECORD_AUDIO"` 삭제

### 2-6. 마이페이지 내 이용약관 및 개인정보처리방침 메뉴 신설 ⛔ HIGH
- [x] `src/components/specific/MyPage/MyPageModal.tsx`: "약관 및 정책" 섹션 추가
  - 서비스 이용약관 (`Linking.openURL('https://weganda.app/terms')`)
  - 개인정보 처리방침 (`Linking.openURL('https://weganda.app/privacy')`)
  - 오픈소스 라이선스 안내

### 2-7. 커뮤니티 댓글/대댓글 신고 및 작성자 차단 기능 구현 (Apple 1.2 UGC) ⛔ HIGH
- [x] `src/components/specific/Community/PostDetailModal.tsx`: 댓글 아이템에 더보기(···) 또는 롱프레스 제스처 추가
- [x] 댓글 신고 모달(`ReportModal`) 연동 및 댓글 작성자 차단(`blockUser`) 액션 연결

---

## 🟠 Phase 3: 비즈니스 로직 & 안정성 강화 (Business Logic & Stability) — Day 2~3

> **목표**: 프리미엄 과금 모델 완성도 확보, 토큰 라이프사이클 관리, 화면 전환 안정화

### 3-1. 사주/운세 서비스 과금 게이팅 & 월간 카운트 리셋 구현
- [x] `src/screens/Fortune/SajuCategoryTopicsScreen.tsx`: 사주 분석 실행 시 `useUserStore.getState().incrementFortuneCount()` 호출
- [x] `src/store/useUserStore.ts`: `lastFortuneResetMonth` 필드 추가 및 당월과 다를 경우 0으로 자동 리셋하는 로직 구현

### 3-2. Ask AI & 약물 계산기 일일 무료 3회 제한 연동
- [x] `src/store/useUserStore.ts`: `dailyAiCount`, `dailyDrugCalcCount`, `lastAiResetDate`, `lastDrugCalcResetDate` 상태 및 리셋 액션 구현
- [x] `src/components/specific/Study/AskAiModal.tsx` & `DrugCalculatorModal.tsx`: 무료 회원 3회 초과 시 `PaywallBottomSheet` 노출

### 3-3. 결제 모달 성공 화면 조기 언마운트 버그 수정
- [x] `src/components/common/InAppPurchaseModal.tsx`: 결제 성공 후 즉시 닫히지 않고 "축하 화면"을 노출한 뒤 유저가 확인 버튼을 눌렀을 때 부모 모달을 닫도록 플로우 개선

### 3-4. 가격 표기 및 스토어 SKU 일원화
- [x] `src/components/common/PaywallBottomSheet.tsx`의 7,800원 하드코딩 텍스트를 `membership.ts` 상수의 5,900원(얼리버드) / 7,900원(정규)으로 수정
- [x] `STORE_RELEASE_GUIDE.md`의 SKU(`com.weganda.app.premium.monthly`)를 실제 코드의 `com.weganda.app.sub.monthly.earlybird`로 통일

### 3-5. 백그라운드 장기 대기 복귀 시 세션 토큰 자동 갱신
- [x] `App.tsx`: `AppState.addEventListener('change')` 리스너 등록
  - `active` 상태 복귀 시 `supabase.auth.startAutoRefresh()` 및 세션 유효성 재검증 수행

### 3-6. 앱 콜드 스타트 시 로그인 화면 깜빡임(Flash) 차단
- [x] `src/store/useUserStore.ts`: `isLoading`의 초기값을 `true`로 설정하여 세션 검증 전 1프레임 로그인 화면 노출 원천 차단

### 3-7. 딥링크(Deep Linking) 설정 구성
- [x] `src/navigation/RootNavigator.tsx`: `NavigationContainer`에 `linking` prop 추가
  - `prefixes: ['weganda://', 'https://weganda.app', 'https://weganda.kr']`
  - OAuth 콜백 및 주요 화면 매핑

### 3-8. 단체 톡방 목데이터 주입 (2번 탭 활성화)
- [x] `src/store/useFriendsStore.ts`: `groupChats` 초기값을 `MOCK_GROUP_CHATS`로 바인딩하여 듀티 비교 화면 정상 노출

### 3-9. `MembershipScreen.tsx` 닫기 버튼 화이트 온 화이트 가독성 보정
- [x] 스크롤 시 흰색 배경 위에서도 닫기 버튼이 선명하게 보이도록 배경 반투명 처리 또는 색상 반응형 적용

---

## 🟡 Phase 4: UX 디테일 & 법률 보완 (UX, A11y & Legal) — Day 3~4

> **목표**: 0년차 입력 오류 등 사용자 경험 결함 수정, 접근성 확보, 스토어 규격 정합성 완성

### 4-1. 온보딩 0년차 입력 왜곡 버그 수정
- [x] `src/components/specific/Onboarding/Step1ProfileSetup.tsx`: `Number(experienceYears) || 1`을 `experienceYears === '' ? 1 : Math.max(0, parseInt(experienceYears, 10))`로 수정

### 4-2. 운세 초기 탄생정보 하드코딩 제거 & 수정 후 데일리 운세 재조회
- [x] `src/store/useFortuneStore.ts`: 기본 상태를 `birthDate: ''`, `isRegistered: false`로 초기화하여 신규 유저의 생년월일 입력 유도
- [x] `src/screens/Fortune/FortuneScreen.tsx`: 탄생 정보 변경 시 데일리 운세가 즉시 새로 조회되도록 갱신 트리거 연결

### 4-3. 전문직 서류 인증 제출 시 개인정보 수집/이용 동의 추가
- [x] `src/components/specific/Verification/VerificationModal.tsx`: 면허번호 및 서류 업로드 전 "간호사 면허 확인을 위한 개인정보 수집·이용 동의 (필수)" 체크박스 구현

### 4-4. `app.json` 빌드 번호 명시 & 연령 등급 상향
- [x] `app.json`: `ios.buildNumber: "1"`, `android.versionCode: 1` 추가
- [x] `STORE_RELEASE_GUIDE.md`: 익명 커뮤니티 및 사주 서비스 특성에 맞춰 연령 등급을 **12+**로 가이드 수정

### 4-5. 안드로이드 뒤로가기 `backBehavior` 설정
- [x] `src/navigation/BottomTabNavigator.tsx`: `<Tab.Navigator backBehavior="initialRoute" ...>` 지정으로 뒤로가기 시 홈 탭 복귀 보장

### 4-6. 피드 첫 진입 시 빈 화면 깜빡임 방지 & 최소 터치 영역(44px) 보강
- [x] `CommunityScreen.tsx`, `FriendsScreen.tsx`: 로딩 상태 시 스피너/스켈레톤 뷰 노출
- [x] 탭 필터 및 퀵 버튼에 최소 터치 영역(`hitSlop` 또는 패딩 확장) 적용

---

## 🚀 Phase 5: 최종 빌드 & 스토어 심사 제출 (Build & Submit) — Day 5~

> **목표**: EAS Build를 통한 프로덕션 번들 생성 및 양대 스토어 심사 신청

### 5-1. 사전 빌드 정적 검증
- [ ] TypeScript 무결성 검증: `npx tsc --noEmit` (에러 0건 통과)
- [ ] 미사용 console.log 프로덕션 제거: `babel.config.js` 정상 작동 확인

### 5-2. EAS Production Build 생성
```bash
# Android AAB 빌드
eas build --platform android --profile production

# iOS IPA 빌드
eas build --platform ios --profile production
```

### 5-3. TestFlight & Google 내부 테스트 배포 및 최종 하드 테스트
- [ ] 실제 iOS 기기에서 TestFlight 인스턴스 검증 (Apple 로그인, IAP 결제 테스트, 푸시 수신)
- [ ] 실제 Android 기기에서 내부 테스트 트랙 검증 (구글/카카오 로그인, 알림 채널)

### 5-4. 스토어 메타데이터 등록 & 심사 제출
- [ ] App Store Connect 메타데이터 입력 (스크린샷 5장, 설명, EULA 링크, 심사 메모에 테스트 계정 정보 제공)
- [ ] Google Play Console 데이터 보안 및 개인정보처리방침 설문 완료
- [ ] 최종 심사 제출 및 릴리즈 승인 대기

---

## 📌 Phase별 완료 확인 체크리스트

| 단계 | 목표 | 승인 기준 | 상태 |
|:---:|---|---|:---:|
| **Phase 1** | 보안 취약점 100% 제거 | Edge Function 키 제거, DB 트리거 활성화, 웹 관리자 가드 | ⬜ 대기 |
| **Phase 2** | 크래시 & 스토어 거절 요건 해소 | 로그인 크래시 픽스, 온보딩 DB저장, 회원탈퇴, 구매복원 | ⬜ 대기 |
| **Phase 3** | 비즈니스 로직 & 라이프사이클 안정화 | 운세/AI 횟수 제한, 결제 모달, AppState 토큰 갱신 | ⬜ 대기 |
| **Phase 4** | UX 완성도 & 법률/메타데이터 완비 | 0년차 버그, 개인정보 동의, 연령등급 12+, backBehavior | ⬜ 대기 |
| **Phase 5** | EAS 프로덕션 빌드 및 심사 제출 | Android AAB + iOS IPA 빌드 성공, 스토어 심사 접수 | ⬜ 대기 |
