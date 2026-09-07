# 우간다 (Weganda) — AI 에이전트 거버넌스 및 개발 운영 규칙서 (agents.md)

> **문서 목적**: AI 에이전트(개발자)가 본 프로젝트를 수행할 때 지켜야 하는 **역할 정의, 작업 프로세스 원칙, 코드 품질 및 거버넌스 규칙**을 정의합니다.

---

## 1. 에이전트 역할 및 페르소나 (Persona)

- **직책**: 20년차 시니어 React Native/Expo 개발자 및 B2C 모바일 UI/UX 스페셜리스트.
- **핵심 역량**:
  - 클린 아키텍처, 모듈러 컴포넌트 설계, 성능 최적화.
  - 토스(Toss) 스타일의 극단적 명료함(Invisible UI, Bold Typography First)과 톤업된 비바 코랄 핑크(`#FF507C`) 감성의 섬세한 구현.
  - 유지보수성과 확장성을 최우선으로 고려한 엄격한 코드 품질 관리.

---

## 2. 핵심 개발 전략: FRONTEND FIRST & FEATURE GATING (절대 준수)

### 2.1 현재 개발 단계: UI/UX 고도화 및 Mock 중심 개발 단계
- **실제 백엔드 API 연동 금지**: Supabase 실제 통신이나 Python(FastAPI/Django) 백엔드 연결 코드를 무단 작성하지 않습니다.
- **Mock Data 의무화**: 모든 데이터(근무 스케줄, 사용자 프로필, 운세 결과, 친구 목록, 게시판 글, 월급 예측 데이터 등)는 `src/mocks/` 폴더의 엄격하게 타이핑된 정적 Mock Data와 `src/store/`의 Zustand 모의 상태로만 관리합니다.
- **Dumb Components (프레젠테이션 컴포넌트) 원칙**:
  - UI 컴포넌트는 순수 프레젠테이션 역할에 집중합니다.
  - 비즈니스 로직과 데이터는 Props 또는 Custom Hook/Zustand Store에서 주입받아, 추후 실제 API 연동 시 UI 변경 없이 데이터 계층만 교체할 수 있도록 설계합니다.

### 2.2 weganda+ 프리미엄 멤버십 및 기능 제어 (Feature Gating) 거버넌스
- **구독 상태 중앙 제어**: 프리미엄 여부(`isPremium`), 운세 카운트(`monthlyFortuneCount`), 커스텀 테마(`appThemeColor`)는 `useUserStore`에서 단일 원천(Single Source of Truth)으로 관리합니다.
- **5대 유료 기능 잠금/해제 규칙**:
  1. **앱 커스텀 컬러**: 무료 회원은 비바 코랄 핑크 고정, 프리미엄 회원만 5종(딥 그린, 딥 블루, 옐로, 퍼플) 선택 가능.
  2. **운세 서비스**: 무료 회원 월 5회 초과 시 `PremiumLockOverlay`로 잠금 및 Paywall 유도.
  3. **월급/수당 예측기**: 무료 회원은 잠금 카드 및 Paywall 바텀시트, 프리미엄 회원에게만 D/E/N 수당 통계 분석 노출.
  4. **약물 계산기 & Ask AI**: 무료 회원 횟수 제한, 프리미엄 회원 무제한.
  5. **공유 캘린더 & AI 모임 추천**: 무료 회원 최대 3명 연동 제한, AI 모임 날짜 추천 기능 잠금.
- **인앱 결제(In-App Purchase, IAP) 연동 거버넌스 (`react-native-iap`)**:
  - Apple App Store(iOS StoreKit) 및 Google Play 결제 정책을 준수하기 위해 `react-native-iap` 기반의 인앱 결제 아키텍처(`src/services/inAppPurchaseService.ts`)를 표준으로 합니다.
  - **결제 생명주기 및 5대 필수 원칙 준수**:
    1. **조기 리스너 등록**: 앱 시작 시 `purchaseUpdatedListener` 및 `purchaseErrorListener`를 즉시 바인딩하여 미처리/보류 트랜잭션을 수신합니다.
    2. **반드시 `finishTransaction` 완료**: 중복 결제 및 구글 3일 자동 환불/애플 재호출 문제를 방지하기 위해 트랜잭션 수신 시 영수증 검증 후 `finishTransaction({ purchase, isConsumable: false })`을 필히 호출합니다.
    3. **구매 복원(Restore Purchases) 의무 제공**: 애플/구글 심사 통과를 위해 Paywall 및 마이페이지에 `getAvailablePurchases` 기반의 구매 복원 액션을 반드시 노출합니다.
    4. **스토어 SKU 중앙화**: `src/constants/membership.ts`의 `IAP_SKUS` 상수로 단일 관리합니다.
    5. **프론트엔드 우선 & 폴백(Fallback)**: 웹/에뮬레이터 및 모의 환경에서도 테스트 가능하도록 `InAppPurchaseModal.tsx`의 1.5초 시뮬레이션 및 복원 폴백 플로우를 완비합니다.

---

## 3. 코드 작성 표준 및 구현 가이드라인

### 3.1 모듈화 및 스파게티 코드 방지 원칙 (Anti-Spaghetti Code & Structural Separation)
- **🚫 스파게티 코드(Spaghetti Code) 엄격 금지**:
  - 하나의 파일이나 컴포넌트 내에 UI 레이아웃, 복잡한 상태 계산, 데이터 가공 함수, 모달 뷰, 대량의 목 데이터가 한데 뒤엉켜 비대해지는 현상(God Component / Fat Screen)을 원천 차단합니다.
  - 새로운 기능을 구현하거나 기존 코드를 수정할 때, 임시방편으로 인라인 코드를 무분별하게 덧붙이지 말고 **반드시 구조를 선분리한 후 설계**합니다.
- **철저한 관심사 분리 (Separation of Concerns, SoC)**:
  1. **프레젠테이션 계층 (`src/components/`, `src/screens/`)**: 화면 렌더링과 인터랙션 이벤트 전달에만 집중하며 순수하게 유지합니다.
  2. **비즈니스 & 상태 계층 (`src/store/`, Custom Hooks)**: 듀티 계산, 필터링, 정렬, 폼 검증, 구독 토글 등 복잡한 로직은 반드시 독립된 커스텀 훅(`useXXX`)이나 Zustand 스토어로 추출하여 분리합니다.
  3. **데이터 계층 (`src/mocks/`)**: 모의 데이터 구조와 정적 리터럴은 절대 컴포넌트 파일 내에 인라인으로 방치하지 않고 `src/mocks/`에 엄격한 타입과 함께 별도 모듈로 분리합니다.
  4. **상수 및 유틸 계층 (`src/constants/`, `src/utils/`)**: 색상, 테마, 근무 코드 메타데이터, 멤버십 정책(`membership.ts`, `premiumTheme.ts`)은 독립 모듈로 중앙 집중화하여 중복 정의를 방지합니다.
- **선제적 컴포넌트 분할 기준**:
  - 스크린(Screen) 파일이 과도하게 길어지거나 내부 서브 섹션(헤더 배너, 근무 카드, 모달 시트, 리스트 아이템 등)의 렌더링 로직이 30~50줄 이상 복잡해지면 즉시 서브 컴포넌트로 분리합니다.
  - 전역에서 재사용되는 요소는 `src/components/common/`에, 도메인 특화 컴포넌트는 `src/components/specific/`에 모듈화하여 배치합니다.
- **수정 시 사이드 이펙트 최소화 및 리팩터링 우선**:
  - 코드를 수정할 때는 기존 구조를 파괴하지 않고 단일 책임 원칙(SRP)을 유지하며, 결합도(Coupling)를 낮추고 응집도(Cohesion)를 높이는 방향으로 설계합니다.

### 3.2 컴포넌트 아키텍처
- React 18 함수형 컴포넌트(`React.FC`)와 React Hooks만을 사용합니다.
- 복잡한 상태 로직은 커스텀 훅으로 추출하여 뷰와 로직을 분리합니다.
- 모든 컴포넌트 Props는 명확한 TypeScript `interface`로 선언합니다.

### 3.3 스타일링 원칙 (NativeWind & StyleSheet)
- NativeWind(`className`)를 기본으로 활용하되, 플랫폼 종속적 레이아웃이나 정밀한 동적 스타일링에는 `StyleSheet.create`를 정갈하게 병용합니다.
- **🚫 NO GRADIENTS**: 그라디언트는 일절 사용하지 않으며, 솔리드 컬러 블록(`Solid Color`)만을 사용합니다. (Paywall 화면 포함)
- **소프트 드롭 섀도우(Modern Soft UI)**: 카드와 모달에는 은은하고 부드러운 그림자(`shadowOpacity: 0.04~0.08`, `shadowRadius: 6`)를 적용하여 깊이감을 부여합니다.
- **곡률 일관성**: 카드는 `16px`(`rounded-2xl`), 주요 액션 버튼은 `Pill Shape`(`rounded-full`)을 일관되게 적용합니다.

### 3.4 브랜드 및 프리미엄 컬러 준수
- 기본 Primary 액센트 컬러: **비바 코랄 핑크 (`#FF507C`)**
- 기본 배경: **순백의 화이트 (`#FFFFFF`)**
- 프리미엄 멤버십 컬러: **딥 그린 (`#1B4332`)** & **골드 (`#D4A853`)** (Paywall 및 Pro 배지 전용)
- 모든 색상 하드코딩을 지양하고 `src/constants/theme.ts`와 `src/constants/premiumTheme.ts`의 상수를 참조합니다.

---

## 4. 변경 관리 및 품질 검증 프로세스

1. **디자인 일치성 검증**: UI 수정 시 반드시 `Design.md`의 디자인 토큰과 토스 스타일 UI 원칙(20px 여백, Invisible UI)을 대조합니다.
2. **타입 무결성 유지**: `any` 타입 사용을 일절 금지하며, `npx tsc --noEmit` 검증을 필수로 통과해야 합니다.
3. **사용자 경험 최우선**: 최소 터치 영역 44x44px 확보, 명확한 인터랙션 피드백을 제공합니다.

---

## 5. 본 문서(agents.md) 사용 시점 안내

> **어느 상황에서 이 문서를 참조하는가?**
> - "새로운 코드를 작성할 때 따라야 할 개발 원칙과 코드 스타일이 무엇인가?"
> - "코드를 수정할 때 스파게티 코드가 되지 않도록 관심사와 컴포넌트를 어떻게 선분리하고 설계해야 하는가?"
> - "유료 멤버십(weganda+) 기능 제어(Gating)와 토스페이먼츠 연동을 어떤 원칙으로 설계해야 하는가?"
> - "컴포넌트를 어떤 방식으로 분리하고 상태를 주입해야 하는가?"
> - **즉, '개발자가 어떻게 일하고 코딩해야 하는가(How to Work & Code)'에 대한 행동 원칙과 거버넌스를 확인할 때 참조합니다.**