# Workflow — 우간다 (Weganda) 앱스토어 / 플레이스토어 정식 출시 워크플로우

> **프로젝트**: 우간다 (Weganda) — 대한민국 3교대 간호사 라이프스타일 플랫폼  
> **문서 버전**: v2.0 (출시 전환) / 최종 갱신: 2026-09-09  
> **Supabase 프로젝트**: `vegtlnhgfjxdntnxbztb` (ap-northeast-2, ACTIVE_HEALTHY)  
> **번들 ID**: `com.weganda.app` (iOS & Android 공통)  
> **최종 목표**: iOS App Store + Google Play Store 동시 정식 출시

---

## 🗺️ 출시 로드맵 개요

```
Phase 0: 출시 차단 이슈 즉시 수정 (Critical Fixes)       — 1~2일
Phase 1: Supabase 보안 강화 & DB 성능 최적화              — 2~3일
Phase 2: 스토어 준비 (EAS Build / 에셋 / 메타데이터)       — 2~3일
Phase 3: 품질 보증 (접근성 / 법적 준수 / 크래시 방어)       — 3~5일
Phase 4: 베타 테스트 (TestFlight / Internal Testing)      — 1~2주
Phase 5: 스토어 제출 & 심사 대응                           — 1~2주
Phase 6: 출시 후 운영 (모니터링 / OTA / 유지보수)           — 지속
```

---

## Phase 0: 출시 차단 이슈 즉시 수정 (Critical Fixes) — 1~2일

> **목표**: 앱 리젝 사유 또는 심각한 보안 취약점을 즉시 제거한다.

### 0-1. `useUserStore` 하드코딩 개발자 계정 제거 ⛔ CRITICAL

- [x] 초기 상태를 null/빈 값으로 변경 (id: null, role: 'user', isPremium: false, isAuthenticated: false)
- [x] `initializeAuth()` 개발자 UUID 폴백 로직 제거
- [x] 세션 없으면 → 로그인 화면으로 이동하는 정상 플로우 확인

### 0-2. Supabase SECURITY DEFINER 함수 보안 패치 ⛔ CRITICAL

**anon 역할에 노출된 8개 함수 즉시 조치:**

```sql
-- 관리자 전용 함수: EXECUTE 권한 박탈
REVOKE EXECUTE ON FUNCTION public.admin_get_dashboard_stats() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_waitlist_entries() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_handle_report(uuid, text, boolean) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text, boolean) FROM anon, authenticated;

-- 일반 함수: SECURITY INVOKER로 전환 또는 auth.uid() 검증 추가
ALTER FUNCTION public.increment_view_count(uuid) SECURITY INVOKER;
ALTER FUNCTION public.accept_duty_swap(uuid) SECURITY INVOKER;
ALTER FUNCTION public.check_is_admin() SECURITY INVOKER;

-- search_path 고정 필수
ALTER FUNCTION public.submit_waitlist_email(text) SET search_path = public;
ALTER FUNCTION public.admin_get_waitlist_entries() SET search_path = public;
```

### 0-3. ErrorBoundary 구현 ⛔ CRITICAL

- [ ] `src/components/common/ErrorBoundary.tsx` 생성
- [ ] `App.tsx`에서 `RootNavigator`를 `<ErrorBoundary>` 래퍼로 감싸기
- [ ] "문제가 발생했습니다" 복구 UI (앱 재시작 버튼 포함)

### 0-4. Leaked Password Protection 활성화

- [ ] Supabase 대시보드 → Auth → Settings → Enable Leaked Password Protection

### 0-5. `.env` vs `.env.local` 불일치 정리

- [ ] `.env` 파일의 Supabase URL/Key를 `vegtlnhgfjxdntnxbztb`로 통일

---

## Phase 1: Supabase 보안 강화 & DB 성능 최적화 — 2~3일

> **목표**: Supabase Advisor의 모든 보안/성능 경고를 해소하고, 프로덕션 트래픽에 대비한다.

### 1-1. RLS initplan 최적화 (40건 경고 해소)

모든 RLS 정책에서 `auth.uid()` → `(select auth.uid())` 변환:

```sql
-- 예시: profiles 테이블
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);
```

- [ ] 전체 18개 테이블의 RLS 정책에 `(select ...)` 서브쿼리 패턴 적용

### 1-2. 누락된 FK 인덱스 추가 (5건)

```sql
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alarms_user_id ON public.clinical_alarms(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON public.friendships(addressee_id);
```

### 1-3. 다중 Permissive RLS 정책 통합 (45건)

- [x] `admin_*` 정책을 role 체크 기반으로 통합 완료

### 1-4. Edge Function JWT 검증 활성화

| Edge Function | 현재 | 수정 후 |
|---|---|---|
| `fortune-generate` | `true` ✅ | 유지 |
| `schedule-ocr` | `false` ❌ | `true` |
| `clinical-ai-qa` | `false` ❌ | `true` |

### 1-5. 게스트 모드 안전 분리

- [x] 게스트 모드에서 Supabase API 호출을 완전히 차단하고 Mock 데이터만 사용하도록 가드 적용 완료

---

## Phase 2: 스토어 준비 (EAS Build / 에셋 / 메타데이터) — 2~3일

> **목표**: App Store / Play Store 제출에 필요한 모든 빌드 인프라와 에셋을 완비한다.

### 2-1. `eas.json` 생성

- [x] `eas.json` 생성 완료 (development, preview, production 프로필)

### 2-2. `app.json` 완성 (스토어 필수 필드)

- [x] `icon`, `splash`, `adaptiveIcon` 에셋 생성 및 app.json 매핑 완료
- [x] `expo-calendar`, `expo-notifications`, `expo-image-picker` 플러그인 추가 완료
- [x] iOS `infoPlist` 권한 사유 문구 5종 및 암호화 면제 플래그 완료
- [x] Android `permissions` 배열 등록 완료

### 2-3. 앱 에셋 준비

| 에셋 | 규격 | 상태 |
|------|------|------|
| 앱 아이콘 | 1024×1024 PNG | ✅ 등록 완료 (`src/assets/icon.png`) |
| 스플래시 | 1242×2436 PNG | ✅ 등록 완료 (`src/assets/splash.png`) |
| Android 적응형 아이콘 | 108dp | ✅ 등록 완료 (`src/assets/adaptive-icon.png`) |
| App Store 스크린샷 | 1290×2796 × 5장 | ⬜ 제작 필요 |
| Play Store 스크린샷 | 1080×1920+ × 5장 | ⬜ 제작 필요 |

### 2-4. console.log 프로덕션 제거

- [x] `babel.config.js` 상용 빌드 시 `transform-remove-console` 플러그인 설정 완료

---

## Phase 3: 품질 보증 (접근성 / 법적 준수 / 크래시 방어) — 3~5일

> **목표**: Apple/Google 심사 필수 요건과 사용자 경험 품질을 확보한다.

### 3-1. 접근성(Accessibility) 추가

| 우선순위 | 대상 | 적용 |
|---------|------|------|
| P0 | `Button.tsx` | ✅ `accessibilityRole="button"`, `accessibilityLabel` 적용 완료 |
| P0 | `Input.tsx` | ✅ `accessibilityLabel`, `accessibilityHint` 적용 완료 |
| P0 | 로그인 버튼 3종 | ✅ `accessibilityLabel="Apple로 로그인"` 등 적용 완료 |
| P0 | 탭바 아이콘 | ✅ `tabBarAccessibilityLabel` (홈, 동기, 운세, 학습, 커뮤니티) 적용 완료 |
| P1 | 모달 닫기(X) | ✅ `accessibilityLabel="닫기"` 적용 완료 |
| P1 | 헤더 뒤로가기 | ✅ `accessibilityRole="button"`, `accessibilityLabel="뒤로 가기"` 적용 완료 |
| P1 | 멤버십/Paywall | ✅ 결제/복원/약관 버튼 접근성 속성 적용 완료 |

### 3-2. 법적 준수 — 이용약관 & 개인정보처리방침

- [x] `LoginScreen.tsx`의 약관 텍스트 → `Linking.openURL()` 연결 완료
- [x] `MembershipScreen.tsx`에 이용약관 및 개인정보 처리방침 링크 노출 완료
- [x] `PaywallBottomSheet.tsx`에 이용약관 및 개인정보 처리방침 링크 노출 완료

### 3-3. 크래시 모니터링 (Crash Logger & Sentry 호환) 구축

- [x] `src/services/crashLogger.ts` 중앙 크래시 모니터링 서비스 구현 완료
- [x] `App.tsx` 인증 상태 변화 시 유저 ID 컨텍스트 동기화 완료
- [x] `ErrorBoundary.tsx`에서 컴포넌트 트리 크래시 시 `crashLogger.recordError` 자동 캡처 완료

### 3-4. 스플래시 스크린 구현

- [x] Figma `weganda_splash` 디자인 기반 `SplashScreenView.tsx` 컴포넌트 구현 완료
- [x] `App.tsx` 로딩 시 Figma 스플래시 뷰 및 부드러운 애니메이션 연동 완료
- [x] 네이티브 `src/assets/splash.png` Figma 고해상도 디자인으로 교체 완료

### 3-5. 푸시 알림 인프라 설정

- [x] `localNotificationService.ts` Android 알림 채널(MAX 중요도, 코랄 핑크 라이트) 생성 및 권한 로직 보강 완료
- [x] `app.json`에 `expo-notifications` 플러그인 등록 완료
- [ ] Firebase 프로젝트 생성 (Android FCM 프로덕션 배포 시)
- [ ] Apple Push Notification 인증키 등록 (EAS Submit 시)

---

## Phase 4: 베타 테스트 (TestFlight / Internal Testing) — 1~2주

> **목표**: 실제 간호사 사용자 그룹으로 베타 테스트를 진행하고 치명적 버그를 잡는다.

### 테스트 체크리스트

| # | 시나리오 | 통과 기준 |
|---|---------|--------|
| 1 | Apple 로그인 → 프로필 → 로그아웃 → 재로그인 | 세션 복원 |
| 2 | 카카오/Google 로그인 | 닉네임/아바타 자동 설정 |
| 3 | 게스트 모드 → 기능 탐색 | 크래시 없음 |
| 4 | 근무표 수동/OCR 등록 | DB 저장 & UI 반영 |
| 5 | 운세 생성 (AI) | Edge Function 정상 |
| 6 | 만세력 사주 분석 | 1,000자+ 리포트 |
| 7 | 커뮤니티 CRUD + 신고 | 완전 동작 |
| 8 | 친구 채팅 + 듀티 교환 | Realtime 정상 |
| 9 | weganda+ 구독 결제 | IAP 정상 |
| 10 | 구매 복원 | 구독 복원 |
| 11 | 네이티브 캘린더 동기화 | 이벤트 등록 |
| 12 | 임상 알람 + 푸시 알림 | 알림 도착 |
| 13 | 네트워크 끊김 상태 | 크래시 없이 폴백 |

---

## Phase 5: 스토어 제출 & 심사 대응 — 1~2주

### App Store Connect

| 항목 | 내용 |
|------|------|
| **앱 이름** | 우간다 - 간호사 교대근무 캘린더 |
| **카테고리** | 건강 및 피트니스 (1차) / 의학 (2차) |
| **가격** | 무료 (인앱 구독: ₩7,800/월) |
| **키워드** | 간호사,교대근무,3교대,근무표,듀티,캘린더,사주,운세,커뮤니티 |
| **개인정보 처리방침** | https://weganda.app/privacy |

### Google Play Console

| 항목 | 내용 |
|------|------|
| **앱 이름** | 우간다 - 간호사 교대근무 캘린더 |
| **짧은 설명** | 3교대 간호사를 위한 AI 근무표 관리 |
| **카테고리** | 건강 및 피트니스 |
| **인앱 상품** | 구독 `com.weganda.app.premium.monthly` |

---

## Phase 6: 출시 후 운영 — 지속

### 모니터링 도구

| 도구 | 용도 |
|------|------|
| Sentry | 크래시 리포트, 에러 추적 |
| Supabase Dashboard | DB 쿼리 성능, Edge Function 로그 |
| App Store Connect | 다운로드, 리뷰, 크래시 |
| Google Play Console | ANR, 크래시, 리텐션 |

### v1.1 백로그

| 우선순위 | 기능 |
|---------|------|
| P1 | 다국어(i18n) 기반 구축 |
| P1 | TypeScript `any` 제거 |
| P2 | 앱 위젯 (오늘의 근무) |
| P2 | 오프라인 모드 강화 |
| P3 | 다크 모드 지원 |

---

## ⚙️ 기술 스택

| 계층 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React Native (Expo Managed) | SDK 57, RN 0.86.3 |
| 언어 | TypeScript | 6.0 (strict) |
| 상태관리 | Zustand (persist + SecureStore) | 4.5.2 |
| 스타일링 | NativeWind (Tailwind CSS for RN) | 2.0.11 |
| 백엔드 | Supabase (Auth + PostgreSQL + Realtime + Edge Functions) | — |
| AI 엔진 | OpenAI GPT (운세/임상 Q&A), Gemini Vision (OCR) | Edge Function 프록시 |
| 인앱 결제 | react-native-iap (StoreKit 2 / Google Billing) | 16.5.1 |
| 빌드/배포 | EAS Build + EAS Submit + expo-updates (OTA) | — |

---

## 📐 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 모바일 앱 (Expo)                      │
│   React Native + Zustand + @supabase/supabase-js            │
└───────────┬──────────────────┬───────────────────┬──────────┘
            │ HTTPS             │ WSS (Realtime)    │ HTTPS
            ▼                  ▼                   ▼
┌───────────────────────────────────────────────────────────────┐
│                     Supabase Platform                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   Auth   │  │PostgreSQL│  │ Storage  │  │  Realtime     │ │
│  │ (OAuth)  │  │ (RLS)    │  │ (이미지)  │  │ (채팅/알림)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                                                               │
│  ┌──────────────── Edge Functions (Deno) ──────────────────┐ │
│  │  fortune-generate  │  schedule-ocr  │  clinical-ai-qa   │ │
│  │       ↓            │       ↓        │       ↓           │ │
│  │  OpenAI GPT API    │  Gemini Vision │  OpenAI GPT API   │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```
