# weganda (우간다) — CLAUDE.md

간호사 대상 B2C 모바일 앱(Expo/React Native). 이 문서는 코드 이해와 코드 리뷰를 위한 참조용이며, 상세 개발 거버넌스는 [agents.md](agents.md)를 따른다.

## 1. 기술 스택 & 실행

- **Expo 57** (React Native 0.86, React 19) + **TypeScript strict** + **NativeWind (Tailwind for RN)** + **Zustand**
- 경로 별칭: `@/*` → `src/*` (`tsconfig.json`)
- 실행: `npm start` / `npm run ios` / `npm run android` / `npm run web`
- 타입 검증(필수, 매 변경 후 실행): `npx tsc --noEmit`
- 백엔드: **Supabase 프로젝트(`vegtlnhgfjxdntnxbztb`)에 실제 연동 완료** — `@supabase/supabase-js`로 Auth/Postgres(RLS)와 실시간 통신 중 (아래 2번 참고). `react-native-iap`도 네이티브 결제 연동이 코드상 존재하나, 초기화(`init`/`setupPurchaseListeners`) 호출 누락 등 출시 전 마무리가 필요한 상태.

## 2. 절대 규칙: 서비스 계층 경유 원칙 (Mock 전용 단계 종료)

- **이 프로젝트는 더 이상 Mock 전용 단계가 아니다.** `friendsApi`, `scheduleApi`, `adminApi`, `verificationApi`, `waitlistApi`, `chatApi`, `communityApi`, `dailyNoteApi`, `profileApi`, `auth`, `fortuneApi`, `ocrApi` 등 대부분의 `src/services/*Api.ts`가 실제 Supabase(`.from()`, `.rpc()`, `.auth`, `.storage`)와 통신한다.
- **단, 모든 백엔드 통신은 반드시 `src/services/*Api.ts` / `*Service.ts`를 경유한다.** 화면(screens)이나 컴포넌트(components) 파일 안에서 `supabase.from(...)`, `fetch(...)`, `supabase.auth...`를 직접 호출하는 것은 여전히 금지 — 서비스 계층이 네트워크 프로토콜과 스키마를 캡슐화해야 UI가 영향받지 않는다.
- **게스트/프리뷰 모드는 예외적으로 Mock 유지**: `useUserStore().isGuest` 또는 `userId === 'guest_user_preview'`인 경우 각 서비스 함수는 `src/mocks/`의 정적 데이터를 반환하는 분기를 유지한다 (예: `friendsApi.getFriends`). 신규 서비스 함수를 추가할 때도 이 게스트 폴백 패턴을 따른다.
- **RLS가 실질적 보안 경계다.** 클라이언트 코드의 조건문(`if (userId === ...)` 등)은 UX 편의일 뿐 보안 통제가 아니다 — 권한 검증은 Supabase RLS 정책에 위임하고, 새 테이블/쿼리 추가 시 RLS 정책 존재 여부를 함께 확인한다.
- 컴포넌트는 여전히 **Dumb/Presentational**이어야 한다 — 비즈니스 로직·데이터는 props 또는 store/hook(그 안에서 서비스 계층 호출)에서 주입받는다.
- 리뷰 시 체크: 화면/컴포넌트 파일 안에 `fetch`, `supabase.from(...)` 등 서비스 계층을 우회한 직접 호출이나, 서비스 대신 하드코딩된 목 데이터 리터럴이 새로 들어갔는가? → 위반.

## 3. 디렉터리 구조 및 계층 분리

```
src/
├── components/
│   ├── common/      # 전역 재사용 컴포넌트 (버튼, 카드 등)
│   └── specific/    # 도메인 특화 컴포넌트 (Admin/, Friends/, Home/, MyPage/ ... 도메인별 하위 폴더)
├── screens/         # 라우트 단위 화면 (Admin, Auth, Community, Fortune, Friends, Home, Landing, Legal, MyPage, Study)
├── navigation/       # React Navigation 설정 (Root/Auth/BottomTab/StackNavigator)
├── store/            # Zustand 스토어 — 도메인별 use*Store.ts, 상태+액션 정의
├── mocks/            # 엄격 타입 정적 목 데이터 (도메인별 파일 + index.ts 배럴) — 게스트/프리뷰 모드 폴백용으로 계속 사용
├── services/         # API 클라이언트 계층 — 대부분 실제 Supabase 연동 완료 (*Api.ts / *Service.ts), 게스트 모드만 mocks 폴백
├── constants/        # theme.ts, premiumTheme.ts, membership.ts, shiftTypes.ts, saju.ts, legal/ 등 정책·색상 상수
├── hooks/            # 커스텀 훅 (예: useAppTheme)
├── types/            # 공용 TypeScript 타입 (database.ts, support.ts 등)
└── utils/            # 순수 유틸 함수
```

- 관심사 분리 원칙: **프레젠테이션(components/screens) / 상태·로직(store, hooks) / 데이터(mocks) / 정책·상수(constants)**를 절대 섞지 않는다.
- 일부 폴더(`src/mocks/`, `src/navigation/`)에는 `skills.md`가 있어 해당 폴더 전용 컨벤션을 설명한다 — 그 폴더를 리뷰/수정할 때 함께 참조.
- `index.ts` 배럴 파일로 도메인 폴더의 공개 컴포넌트를 재노출하는 패턴을 사용한다 (예: `components/specific/Friends/index.ts`). 새 컴포넌트 추가 시 배럴에 등록됐는지 확인.

## 4. 컴포넌트 분할 기준 (리뷰 시 가장 흔한 위반)

- 화면(Screen) 파일이 비대해지거나 서브 섹션(헤더, 카드, 모달, 리스트 아이템) 렌더링 로직이 **30~50줄 이상**이면 즉시 서브 컴포넌트로 분리.
- 참고 규모: 현재 화면 파일은 79~950줄까지 분포한다(`SajuDetailResultScreen.tsx` 942줄, `MembershipScreen.tsx` 752줄 등 대형 화면은 이미 존재하는 예외이지 지향점이 아님). **새 코드를 추가할 때 이런 God Component를 더 키우지 말고, 가능하면 분리를 제안한다.**
- 복잡한 상태 계산/필터링/정렬/폼 검증은 커스텀 훅(`useXXX`) 또는 Zustand 스토어로 추출한다. 화면 파일 안에 인라인으로 방치하지 않는다.
- 대량의 정적 목 데이터를 컴포넌트/화면 파일에 인라인으로 선언하는 것은 금지 — `src/mocks/`로 이동.

## 5. 상태 관리 (Zustand)

- 스토어는 `src/store/use<Domain>Store.ts` 네이밍, 상태+액션을 한 파일에 정의.
- 구독/멤버십 관련 단일 원천은 `useUserStore` (`isPremium`, `monthlyFortuneCount`, `appThemeColor`). 다른 곳에서 프리미엄 여부를 별도로 재정의/중복 관리하면 리뷰에서 지적.
- 전역 싱글턴 상태(store)와 로컬 컴포넌트 상태(`useState`)를 혼동하지 않았는지 확인 — 화면 간 공유가 필요 없는 상태를 store에 넣거나, 반대로 여러 화면이 공유해야 할 상태를 지역 state로 관리하는 것은 지적 대상.

## 6. weganda+ 프리미엄 기능 게이팅

5대 유료 기능과 잠금 로직은 `src/constants/membership.ts`(`PREMIUM_BENEFITS`, `FREE_LIMITS`, `IAP_SKUS` 등)에 중앙화되어 있다:

1. 앱 커스텀 컬러 (무료: 핑크 고정 / 프리미엄: `deepGreen`, `deepBlue`, `yellow`, `purple` 추가 — `src/constants/theme.ts`의 `APP_THEME_COLORS`, `THEME_PALETTES` 참고)
2. 운세 서비스 (무료 월 5회 — `FREE_LIMITS.maxMonthlyFortune`)
3. 월급/수당 예측기 (프리미엄 전용)
4. 약물 계산기 & Ask AI (무료 횟수 제한 — `FREE_LIMITS.maxDailyAiQueries/maxDailyDrugCalculations`)
5. 스마트 듀티 건강 & 번아웃 분석 (프리미엄 전용; 공유 캘린더·AI 모임 추천은 전면 무료)

리뷰 체크리스트:
- 새 프리미엄 기능/제한을 만들 때 매직 넘버 대신 `membership.ts`의 상수를 참조하는가?
- 무료 사용자 분기 시 `PremiumLockOverlay` / Paywall 패턴을 따르는가, 아니면 기능을 그냥 숨기기만 하는가(요구사항은 잠금 UI 노출이지 완전 은닉이 아님)?
- IAP 관련 코드(`inAppPurchaseService.ts` 등)를 만질 경우 `finishTransaction` 누락, 구매 복원(`getAvailablePurchases`) 누락 여부를 반드시 확인 — 스토어 심사 거절 사유.
- SKU 문자열을 하드코딩하지 않고 `IAP_SKUS`를 참조하는가?

## 7. 스타일링 규칙

- NativeWind(`className`) 기본, 플랫폼 종속 레이아웃/정밀 동적 스타일은 `StyleSheet.create` 병용.
- **그라디언트 절대 금지** — 솔리드 컬러만 사용 (Paywall 포함). PR에 `LinearGradient` 등장 시 지적.
- 카드/모달 그림자는 은은하게: `shadowOpacity: 0.04~0.08`, `shadowRadius: 6`.
- 곡률: 카드 `16px`(`rounded-2xl`), 주요 액션 버튼은 Pill(`rounded-full`).
- 색상 하드코딩 금지 — `src/constants/theme.ts`(`COLORS`, `THEME_PALETTES`, `getAppTheme()`, `useAppTheme` 훅) / `premiumTheme.ts` 참조. 리뷰 시 `#FF507C` 같은 리터럴이 컴포넌트에 새로 박혀 있으면 상수 참조로 바꾸도록 제안.
- 기본 Primary: 비바 코랄 핑크 `#FF507C` / 배경 `#FFFFFF` / 프리미엄 전용: 딥 그린 `#1B4332`, 골드 `#D4A853`.
- 최소 터치 영역 44x44px 확보 여부.

## 8. 컴포넌트/타입 컨벤션

- `React.FC` + Hooks만 사용 (클래스 컴포넌트 금지).
- 모든 Props는 명시적 TypeScript `interface`로 선언.
- **`any` 타입 사용 금지** — 리뷰에서 최우선으로 잡아야 할 항목. `npx tsc --noEmit` 통과가 병합 조건.
- 텍스트 대부분이 한국어(주석/문자열)이며 이는 프로젝트 규범이다. 임의로 영어로 바꾸지 않는다.

## 9. 리뷰 시 우선순위 요약

1. 서비스 계층 우회 여부(화면/컴포넌트에서 `supabase.from(...)`/`fetch` 직접 호출) 및 RLS 미적용 테이블/쿼리 여부
2. God Component화(관심사 미분리, 30~50줄 초과 인라인 섹션) 여부
3. `any` 타입, `tsc` 에러 유발 여부
4. 프리미엄 게이팅 로직이 `useUserStore`/`membership.ts` 단일 원천을 우회하지 않는지
5. 그라디언트 사용, 색상/SKU 하드코딩 등 디자인·상수 규칙 위반
6. 목 데이터가 `src/mocks/`가 아닌 곳에 인라인으로 추가되지 않았는지(단, 게스트/프리뷰 모드 폴백 목적은 예외)

세부 배경과 예시는 [agents.md](agents.md) 참고.
