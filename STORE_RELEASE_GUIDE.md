# 📱 우간다 (Weganda) 스토어 심사 제출 가이드 (App Store & Google Play)

스토어 심사 제출 시 복사하여 사용할 수 있는 메타데이터 및 심사원 가이드 문서입니다.

---

## 1. Apple App Store Connect 제출 정보

| 항목 | 내용 |
|---|---|
| **앱 이름 (30자)** | 우간다 - 간호사 교대근무 캘린더 |
| **부제 (30자)** | 3교대 근무표, AI 운세, 익명 커뮤니티 |
| **기본 카테고리** | 건강 및 피트니스 (Health & Fitness) |
| **2차 카테고리** | 의학 (Medical) |
| **번들 ID** | `com.weganda.app` |
| **SKU** | `weganda-app-ios` |
| **가격** | 무료 (인앱 구독 제공) |
| **연령 등급** | 4+ |
| **지원 URL** | `https://weganda.app/support` |
| **마케팅 URL** | `https://weganda.app` |
| **개인정보 처리방침 URL** | `https://weganda.app/privacy` |
| **이용약관(EULA) URL** | `https://weganda.app/terms/membership` |

### 키워드 (100자 이내, 쉼표 구분)
```text
간호사,교대근무,3교대,근무표,듀티,병원,캘린더,사주,운세,간호학,약물계산,커뮤니티,나이트근무
```

### 앱 상세 설명 (Description)
```text
대한민국 1등 간호사 라이프스타일 플랫폼, 우간다(Weganda)

바쁜 3교대 간호사 선생님들의 일상과 임상을 가장 따뜻하고 스마트하게 챙겨드립니다.

[주요 기능]
1. 한눈에 보는 3교대 스마트 근무표
- 터치 몇 번으로 손쉽게 입력하는 D, E, N, Off 근무 캘린더
- 동기 및 선후배 간호사와의 실시간 근무표 공유 및 겹치는 휴일(Off) 자동 매칭
- 스마트폰 기본 캘린더 자동 동기화

2. 오늘의 임상 바이오리듬 & 맞춤 운세
- 오늘 나의 듀티(Day/Evening/Night)와 사주 명식을 결합한 맞춤 운세
- 오늘의 행운 아이템, 행운의 색상, 주의해야 할 임상 팁 제공

3. 간호사 전용 익명 커뮤니티
- 전국 병원 간호사들과의 솔직하고 따뜻한 소통
- 부서별, 연차별 고민 상담 및 인수인계 노하우 공유
- 철저한 익명 보장 및 안전한 커뮤니티 가이드라인 준수

4. 임상 실무 도우미 & 약물 점적 계산기
- gtt/min, cc/hr, 초당 방울수 즉시 계산
- 헷갈리기 쉬운 의학 약어 및 족보 가이드

5. 똑똑한 월급 및 수당 예측기 (weganda+)
- 야간 가산, 휴일 수당, 교대근무 패턴을 기반으로 한 실시간 예상 수당 분석

지금 바로 우간다와 함께 더 여유롭고 행복한 간호 라이프를 시작해보세요!
```

### 심사용 데모 계정 및 심사 메모 (App Review Information)
- **로그인 방식**: 전화번호나 복잡한 인증 없이 **"로그인 없이 앱 둘러보기"** (게스트 모드)를 탭하면 모든 기능을 즉시 심사관이 테스트할 수 있습니다.
- **인앱 결제 테스트**: StoreKit Sandbox 환경에서 `com.weganda.app.premium.monthly` 구독을 테스트할 수 있으며, 결제 후 즉시 프리미엄 혜택(수당 분석, 테마 변경 등)이 활성화됩니다.
- **심사 메모 (Reviewer Notes)**:
```text
Dear Apple App Review Team,
Thank you for reviewing Weganda!

- Fast Sign-in: You can tap "로그인 없이 앱 둘러보기" (Browse as Guest) at the bottom of the login screen to test all features instantly without social logins.
- In-App Purchase: StoreKit 2 is integrated for our monthly membership ("weganda+"). Terms of Use and Privacy Policy links are clearly presented on all paywalls and the login screen.
- Calendar & Photo Permissions: Requested only when the user explicitly triggers 'Sync Calendar' or 'Upload Schedule Image'.
```

---

## 2. Google Play Console 제출 정보

| 항목 | 내용 |
|---|---|
| **앱 이름 (30자)** | 우간다 - 간호사 교대근무 캘린더 |
| **간단한 설명 (80자)** | 3교대 간호사를 위한 스마트 근무표, 맞춤 운세, 익명 커뮤니티 플랫폼 |
| **패키지 이름** | `com.weganda.app` |
| **카테고리** | 건강/운동 |
| **콘텐츠 등급** | 전체이용가 (IARC 설문 진행) |
| **개인정보처리방침** | `https://weganda.app/privacy` |

---

## 3. EAS 프로덕션 빌드 명령어 요약

```bash
# 1. EAS 로그인 확인
npx eas-cli login

# 2. iOS TestFlight 배포용 빌드
npx eas-cli build --profile production --platform ios

# 3. Android Google Play AAB 빌드
npx eas-cli build --profile production --platform android
```
