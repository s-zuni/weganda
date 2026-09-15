# 우간다 (Weganda) UI Figma 내보내기 & 수정 가이드

본 디렉터리(`export-figma/`)에는 현재 구현된 우간다 5대 핵심 화면의 **Stitch 기반 고해상도 HTML/CSS 소스** 및 **고해상도 원본 PNG 스크린샷**이 포함되어 있어 Figma에서 100% 편집 가능한 벡터/오토레이아웃 레이어로 즉시 변환할 수 있습니다.

---

## 📁 파일 구성 안내

| 번호 | 화면명 | HTML 파일 (Figma 임포트용) | 고해상도 스크린샷 |
|:---:|:---|:---|:---|
| **01** | **홈 화면** | [`01_home_screen.html`](./01_home_screen.html) | [`screenshots/01_home_screen.png`](./screenshots/01_home_screen.png) |
| **02** | **운세 화면** | [`02_fortune_screen.html`](./02_fortune_screen.html) | [`screenshots/02_fortune_screen.png`](./screenshots/02_fortune_screen.png) |
| **03** | **친구 화면** | [`03_friends_screen.html`](./03_friends_screen.html) | [`screenshots/03_friends_screen.png`](./screenshots/03_friends_screen.png) |
| **04** | **교육(학습) 화면** | [`04_study_screen.html`](./04_study_screen.html) | [`screenshots/04_study_screen.png`](./screenshots/04_study_screen.png) |
| **05** | **커뮤니티 화면** | [`05_community_screen.html`](./05_community_screen.html) | [`screenshots/05_community_screen.png`](./screenshots/05_community_screen.png) |

---

## 🚀 Figma에서 수정 가능한 형태로 여는 3가지 방법

### 방법 1. Figma 'html.to.design' 플러그인 사용 (가장 추천 ⭐⭐⭐)
Figma에서 텍스트 수정, 컴포넌트 분리, 오토레이아웃(Auto Layout)이 100% 적용된 완벽한 피그마 레이어로 변환됩니다.

1. **Figma 실행** 후 새 캔버스 열기.
2. 상단 메뉴의 **Plugins** (단축키 `Ctrl + /` 또는 `Cmd + /`) 검색창에 `html.to.design` 입력 후 실행.
3. 플러그인 탭 중 **[File]** 또는 **[HTML File Upload]** 선택.
4. `export-figma/` 폴더 안의 `01_home_screen.html` ~ `05_community_screen.html`을 차례대로 드래그 앤 드롭(또는 선택).
5. **[Import]** 버튼을 누르면 Figma 프레임과 텍스트 레이어로 즉시 자동 렌더링됩니다.

---

### 방법 2. Figma 'Builder.io' (Figma to Code / HTML to Figma) 플러그인 사용
1. Figma에서 **Builder.io** 플러그인 실행.
2. HTML 코드 복사/업로드 탭에서 해당 HTML 파일 내용을 붙여넣거나 로컬 브라우저로 연 후 URL/HTML 임포트.

---

### 방법 3. Stitch 클라우드 프로젝트에서 직접 확인 및 내보내기
Stitch 프로젝트 캔버스에서 화면을 확인하고 내보낼 수도 있습니다.

- **Stitch 프로젝트 ID**: `5889089571168163755`
- **프로젝트 명**: `우간다 (Weganda) - 간호사 라이프스타일 앱`

---

## 🎨 우간다 핵심 디자인 토큰 (Figma 스타일 참조)

피그마에서 컴포넌트를 커스텀하거나 수정할 때 다음 디자인 토큰을 활용하세요.

### 1. 브랜드 컬러 (Brand Colors)
- **Primary Accent**: `#FF507C` (비바 코랄 핑크 - 앱 메인 액센트, 토스 스타일)
- **Primary Forest**: `#024833` (딥 포레스트 그린 - weganda+ 프리미엄 전용)
- **Background**: `#FFFFFF` (순백색 기본 배경)
- **Surface / Light Gray**: `#F8F9FA` (카드 및 인풋 배경)
- **Border / Divider**: `#E5E7EB` / `#F3F4F6`
- **Text Primary**: `#1A1A1A` (헤드라인, 본문 텍스트)
- **Text Secondary**: `#6B7280` (서브 레이블)
- **Text Muted**: `#9CA3AF` (플레이스홀더)

### 2. 듀티 교대근무 컬러 (Shift Colors)
- **Day (주간 D)**: `#4F98CA` (스카이 블루)
- **Evening (저녁 E)**: `#E2703A` (웜 오렌지)
- **Night (야간 N)**: `#272727` (다크 차콜)
- **Off (휴무 O)**: `#E84A5F` (소프트 레드)
- **Vacation (연차 V)**: `#9B51E0` (퍼플)

### 3. 타이포그래피 & 라운드 규격
- **Font Family**: `Pretendard`, `Inter`
- **Card Corner Radius**: `16px` (`rounded-2xl`)
- **Button Corner Radius**: `Pill Shape` (`rounded-full`) 또는 `12px`
- **Shadow**: `rgba(0, 0, 0, 0.04~0.08)`, Blur `6px`, Offset `(0, 2)` (소프트 드롭 섀도우)
- **원칙**: 그라디언트(Gradient) 사용 금지 (솔리드 컬러만 사용)

