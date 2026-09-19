# 📱 우간다 (Weganda) 스토어 심사 및 출시 마스터 가이드 (App Store & Google Play)

> **최종 갱신일**: 2026-09-12  
> **공식 서비스 도메인**: `https://www.weganda.kr`  
> **앱 번들 ID / 패키지 이름 / SKU**: `com.weganda.app`

---

## 1. Apple App Store Connect 제출 메타데이터

| 항목 | 입력 내용 | 비고 |
|---|---|---|
| **앱 이름 (30자 이내)** | 우간다 - 간호사 교대근무 캘린더 | 검색 최적화(ASO) 반영 |
| **부제 (30자 이내)** | 3교대 근무표, AI 운세, 익명 커뮤니티 | 핵심 3대 기능 요약 |
| **번들 ID (Bundle ID)** | `com.weganda.app` | Developer Portal App ID와 일치 |
| **SKU** | `com.weganda.app` | App Store Connect 고유 식별자 |
| **기본 카테고리** | 건강 및 피트니스 (Health & Fitness) | 필수 |
| **2차 카테고리** | 의학 (Medical) | 선택 권장 |
| **가격** | 무료 (Free) | 인앱 정기구독 포함 |
| **연령 등급** | 12+ (의학 정보, 사주 운세, UGC 익명 커뮤니티 포함) | 설문 진행 |
| **지원 URL (Support)** | `https://www.weganda.kr/support` | 필수 |
| **마케팅 URL (Marketing)** | `https://www.weganda.kr` | 선택 권장 |
| **개인정보 처리방침 URL** | `https://www.weganda.kr/privacy` | 필수 |
| **표준 이용약관(EULA) URL** | `https://www.weganda.kr/terms` | 필수 |
| **멤버십 이용약관 URL** | `https://www.weganda.kr/membership` | Paywall 및 인앱결제 필수 |
| **커뮤니티 이용약관 URL** | `https://www.weganda.kr/community` | Apple 1.2 UGC 정책 필수 |

### 검색 키워드 (Keywords - 100자 이내, 쉼표 구분)
```text
간호사,교대근무,3교대,근무표,듀티,병원,캘린더,사주,운세,간호학,약물계산,커뮤니티,나이트근무
```

### 앱 상세 설명 (Description)
```text
대한민국 1등 간호사 라이프스타일 플랫폼, 우간다(Weganda)

바쁜 3교대 간호사 선생님들의 일상과 임상을 가장 따뜻하고 스마트하게 챙겨드립니다.

[주요 기능]
1. 한눈에 보는 3교대 스마트 근무표
- 터치 몇 번으로 손쉽게 입력하는 D, E, N, Off 교대근무 캘린더
- 동기 및 선후배 간호사와의 실시간 근무표 공유 및 겹치는 휴일(Off) 자동 매칭
- 스마트폰 기본 캘린더 자동 동기화 기능

2. 오늘의 임상 바이오리듬 & 맞춤 운세
- 오늘 나의 듀티(Day/Evening/Night)와 사주 명식을 결합한 맞춤형 임상 운세
- 오늘의 행운 아이템, 행운의 색상, 주의해야 할 임상 팁 제공

3. 간호사 전용 익명 커뮤니티
- 전국 병원 간호사들과의 솔직하고 따뜻한 소통 공간
- 부서별, 연차별 고민 상담 및 인수인계 노하우 공유
- 안전한 커뮤니티 가이드라인 및 신고/차단 시스템 준수

4. 임상 실무 도우미 & 약물 점적 계산기
- gtt/min, cc/hr, 초당 방울수 즉시 계산
- 헷갈리기 쉬운 의학 약어 및 임상 족보 가이드

5. 똑똑한 월급 및 수당 예측기 (weganda+)
- 야간 가산, 휴일 수당, 교대근무 패턴을 기반으로 한 실시간 예상 수당 분석

지금 바로 우간다와 함께 더 여유롭고 행복한 간호 라이프를 시작해보세요!
```

### 인앱 구입(IAP) 구독 상품 설정
- **구독 그룹 이름**: `weganda+ 멤버십`
- **참조 이름**: `우간다+ 월간 멤버십 (얼리버드)`
- **제품 ID (Product ID)**: `com.weganda.app.sub.monthly.earlybird`
- **구독 기간**: 1개월
- **무료 체험**: 1개월 (30일 무료 체험 프로모션 적용)
- **심사 제출용 스크린샷**: 마이페이지 또는 멤버십 결제(Paywall) 화면 캡처본 업로드

### 심사 메모 (App Review Notes - 심사관 전달용)
```text
Dear Apple App Review Team,

Thank you for reviewing Weganda!

1. Fast Test Account / Review Method:
- You do NOT need a Korean phone number or SNS authentication.
- Simply tap "로그인 없이 앱 둘러보기" (Browse as Guest) at the bottom of the login screen to test all features instantly.
- To test the onboarding flow, you can also use social login or test accounts.

2. In-App Purchase (StoreKit):
- We offer an auto-renewable monthly membership ("weganda+").
- Product ID: com.weganda.app.sub.monthly.earlybird
- Terms of Use and Privacy Policy links are clearly displayed on all paywalls, settings, and login screens:
  - Terms of Use (EULA): https://www.weganda.kr/terms
  - Membership Terms: https://www.weganda.kr/membership
  - Privacy Policy: https://www.weganda.kr/privacy

3. User Privacy & Permissions:
- Calendar: Requested only when the user explicitly taps "스마트폰 캘린더 동기화".
- Contacts: Requested only when the user chooses to find colleagues via device contacts (manual contact selection only; contacts are not harvested).
- Photo/Camera: Requested when attaching duty schedules or license verification documents.

4. UGC Moderation (Guideline 1.2):
- All community posts and comments have instant Report and Block mechanisms. Blocked users' content is immediately hidden.
```

---

## 2. Google Play Console 제출 메타데이터

| 항목 | 입력 내용 |
|---|---|
| **앱 이름 (30자)** | 우간다 - 간호사 교대근무 캘린더 |
| **간단한 설명 (80자)** | 3교대 간호사를 위한 스마트 근무표, 맞춤 운세, 익명 커뮤니티 플랫폼 |
| **패키지 이름** | `com.weganda.app` |
| **기본 카테고리** | 건강/운동 (Health & Fitness) |
| **웹사이트** | `https://www.weganda.kr` |
| **개인정보처리방침 URL** | `https://www.weganda.kr/privacy` |
| **이메일** | `support@weganda.kr` (또는 개발자 대표 이메일) |

### Google Play 데이터 보안 (Data Safety) 답변 요약
- **연락처(Contacts)**:
  - 수집 여부: 예 (사용자 동의 시)
  - 목적: 앱 기능 (동료 간호사 찾기 및 친구 추가)
  - 공유 여부: 제3자 공유 없음, 서버 무단 수집 없음 (단말 내 검색 후 사용자가 직접 선택한 친구만 매칭)
- **사진 및 동영상(Photos/Videos)**:
  - 수집 목적: 커뮤니티 게시글 사진 첨부 및 면허 증빙 서류 업로드
- **캘린더(Calendar)**:
  - 수집 목적: 단말 기본 캘린더에 교대근무 스케줄 양방향 동기화

---

## 3. 디바이스 권한(Permissions) 총람 (`app.json` 기준)

| 구분 | iOS (`infoPlist`) | Android (`permissions`) | 안내 문구 (스토어 표시) |
|---|---|---|---|
| **캘린더** | `NSCalendarsUsageDescription`<br>`NSRemindersUsageDescription` | `READ_CALENDAR`<br>`WRITE_CALENDAR` | 근무표를 스마트폰 기본 캘린더에 동기화하기 위해 캘린더 접근 권한이 필요합니다. |
| **연락처** | `NSContactsUsageDescription` | `READ_CONTACTS` | 동료 간호사를 찾아 근무표를 공유하고 친구로 추가하기 위해 연락처 접근 권한이 필요합니다. |
| **사진 라이브러리** | `NSPhotoLibraryUsageDescription` | `READ_EXTERNAL_STORAGE` | 근무표 이미지를 업로드하거나 커뮤니티 게시글에 사진을 첨부하기 위해 사진 접근 권한이 필요합니다. |
| **카메라** | `NSCameraUsageDescription` | `CAMERA` | 근무표를 직접 촬영하여 OCR로 자동 입력하기 위해 카메라 접근 권한이 필요합니다. |
| **푸시 알림** | 기본 알림 권한 프롬프트 | `POST_NOTIFICATIONS` | 출근 1시간 전 근무 리마인더 및 교환 요청 알림을 받기 위함입니다. |

---

## 4. 빌드 및 배포 실행 가이드

### A. iOS: Codemagic CI/CD + App Store Connect API 자동화 (Mac 불필요)

1. **App Store Connect API Key 준비**:
   - [App Store Connect API 키 관리](https://appstoreconnect.apple.com/access/api)에서 키 생성 (`관리자` 또는 `앱 관리자` 권한).
   - 발급 정보 3가지: **Issuer ID**, **Key ID**, **비공개 키(.p8 파일)**.
2. **Apple Developer Capabilities 확인**:
   - [Apple Developer Identifiers](https://developer.apple.com/account/resources/identifiers/list) → `com.weganda.app` 선택.
   - `In-App Purchase` 및 `Sign In with Apple`이 활성화되어 있는지 확인.
3. **Codemagic 설정**:
   - [Codemagic](https://codemagic.io) 접속 → Team Settings → **Integrations** → **Apple Developer Portal** 선택.
   - Issuer ID, Key ID, `.p8` 파일 등록.
4. **빌드 실행**:
   - 레포지토리에 커밋 후 푸시하면 [codemagic.yaml](file:///c:/Users/zxzx7/Desktop/weganda/codemagic.yaml)의 `ios-app-store` 워크플로우에 의해 자동으로 빌드되고 **TestFlight / App Store Connect에 업로드**됩니다.

---

### B. Android: Windows 로컬 Android Studio를 통한 AAB 빌드

1. **Android 네이티브 프로젝트 생성**:
   ```bash
   npx expo prebuild --platform android --clean
   ```
2. **Release Keystore 생성** (최초 1회):
   ```bash
   keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
3. **Android Studio에서 서명된 번들 생성**:
   - Android Studio 실행 → `c:\Users\zxzx7\Desktop\weganda\android` 폴더 열기.
   - **Build** → **Generate Signed Bundle / APK...** → **Android App Bundle (.aab)** 선택.
   - 위 Keystore와 비밀번호 입력 후 `release` 빌드 생성.
   - 생성된 `android/app/release/app-release.aab`를 Google Play Console에 업로드.
