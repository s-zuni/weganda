# Workflow — 우간다 서비스 구현 계획

> **프로젝트**: 우간다 (Weganda) — 대한민국 3교대 간호사 라이프스타일 플랫폼  
> **개발 전략**: 기획 → 디자인 → 프론트엔드 → 백엔드  
> **최종 목표**: B2C 모바일 앱 (iOS / Android) 정식 출시

---

## 🗺️ 전체 로드맵 개요

```
Phase 1: 기획 (Planning)
  └─ 서비스 정의 · 사용자 리서치 · 기능 명세 · 정보 아키텍처

Phase 2: 디자인 (Design)
  └─ 디자인 시스템 · Figma UI 설계 · 프로토타입 · 사용성 검증

Phase 3: 프론트엔드 (Frontend)
  └─ React Native/Expo 구현 · 목데이터 UI · 컴포넌트 라이브러리

Phase 4: 백엔드 (Backend)
  └─ Supabase Auth + DB · Python AI 서버 · API 연동 · 배포
```

---

## Phase 1: 기획 (Planning)

### 목표
사용자 문제를 명확히 정의하고, 간호사 전용 플랫폼의 핵심 기능을 확정한다.

### 1-1. 서비스 정의 및 포지셔닝

| 항목 | 내용 |
|------|------|
| **서비스명** | 우간다 (우리 간호사가 간다) |
| **타겟 유저** | 대한민국 3교대 근무 간호사 (신규 1~5년차 집중) |
| **핵심 Pain Point** | 복잡한 근무표 관리, 동기와의 오프 매칭, 정보 고립감 |
| **핵심 가치 제안** | AI 근무 달력 + 운세 + 익명 커뮤니티 + 공부 노트 + 친구 일정 연동 |
| **수익 모델** | Freemium (AI 스케줄링 고급 기능 구독) |

### 1-2. 사용자 리서치
- [ ] 임상 간호사 심층 인터뷰 (5~10명)
- [ ] 3교대 근무 패턴 분석 (D/E/N/O 조합)
- [ ] 경쟁 서비스 분석 (일반 캘린더 앱 vs 간호사 특화 앱)
- [ ] 핵심 사용자 페르소나 2~3개 작성

### 1-3. 핵심 기능 명세 (Feature Spec)

#### 🏠 홈 / 근무 대시보드
- 오늘/내일 근무 카드 (D/E/N/O 한눈에)
- 주간 캘린더 스트립
- 월간 근무 통계 (D: n회, E: n회, N: n회)
- 알람 맞추기 기능
- 데일리 노트 (특이사항 기록)

#### 🔮 운세
- 오늘의 간호 운세 텍스트 생성 (AI)
- 바이오리듬 점수 (주사 성공률, 커뮤니케이션, 멘탈)
- 행운의 아이템 / 컬러

#### 👥 친구 / 동기
- 동기 추가 및 근무표 열람 (공개 동의 기반)
- 겹치는 오프(Off)일 자동 매칭
- 친구 근무 상태 실시간 표시

#### 📚 학습 / 매뉴얼
- 임상 프로토콜 요약 카드 (약물 계산, ACLS 등)
- 검색 기능
- 즐겨찾기 / 메모 기능

#### 💬 커뮤니티
- 익명 게시판 (자유, 이직/취업, 임상/질문, 병원후기, 장터)
- 게시글 작성 / 댓글 / 좋아요
- 병원별 익명 태그

### 1-4. 정보 아키텍처 (IA)
```
우간다 앱
├── 온보딩/로그인 (소셜: Google, Kakao, Apple)
├── 홈 (근무 대시보드)
├── 운세 탭
├── 홈 FAB (빠른 기록/입력)
├── 학습 탭
└── 커뮤니티 탭
    ├── 친구 (탭 내 섹션)
    └── 익명 게시판
```

### 1-5. 기획 산출물 체크리스트
- [ ] 서비스 기획서 (PRD) 작성 완료
- [ ] 와이어프레임 초안 (손 스케치 또는 Balsamiq)
- [ ] 기능 우선순위 결정 (MoSCoW)
- [ ] 스프린트 플랜 수립

---

## Phase 2: 디자인 (Design)

### 목표
Figma 기반의 완성도 높은 디자인 시스템과 모든 화면의 High-fidelity 프로토타입을 완성한다.

### 2-1. 디자인 시스템 구축

| 항목 | 내용 | 상태 |
|------|------|------|
| 컬러 팔레트 | Primary `#FF507C`, 근무 코드 컬러 D/E/N/O/V | ✅ 완료 |
| 타이포그래피 | Pretendard (한글) + Inter (영문/숫자) | ✅ 완료 |
| 카드 컴포넌트 | 소프트 쉐도우, 16~20px radius | ✅ 완료 |
| 버튼 시스템 | Primary / Muted / Outline | ✅ 완료 |
| 하단 탭바 | 5탭 + 중앙 FAB (청진기) | ✅ 완료 |
| 아이콘 시스템 | 이모지 + Ionicons 혼용 | 🔄 진행중 |

### 2-2. 화면별 Figma UI 설계

| 화면 | 노드 | 상태 |
|------|------|------|
| 홈 (Home) | `5-3` | ✅ Figma 완료 |
| 운세 (Fortune) | TBD | ⬜ 예정 |
| 친구 (Friends) | TBD | ⬜ 예정 |
| 학습 (Study) | TBD | ⬜ 예정 |
| 커뮤니티 (Community) | TBD | ⬜ 예정 |
| 로그인 / 온보딩 | TBD | ⬜ 예정 |
| 스케줄 추가/편집 | TBD | ⬜ 예정 |

### 2-3. 프로토타입 & 사용성 테스트
- [ ] Figma Interactive Prototype 연결 (화면 전환 흐름)
- [ ] 간호사 타겟 베타 테스트 (5~10명)
- [ ] 피드백 반영 2차 수정

### 2-4. Design QA
- [ ] 컬러 대비 WCAG AA 검증
- [ ] 터치 타겟 최소 44px 확인
- [ ] 다양한 기기 해상도 대응 (iPhone SE ~ iPhone Pro Max)

---

## Phase 3: 프론트엔드 (Frontend)

### 목표
React Native (Expo) + NativeWind 기반으로 완전한 UI를 목데이터로 구동하고,
실제 백엔드 연결 시 빠른 스왑이 가능한 클린 아키텍처를 구현한다.

### 3-1. 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 플랫폼 | React Native (Expo Managed) | ~51.x |
| 라우팅 | React Navigation (Bottom Tabs + Native Stack) | ^6.x |
| 스타일링 | NativeWind (Tailwind CSS for RN) | ^2.x |
| 상태관리 | Zustand | ^4.x |
| 목데이터 | `src/mocks/` 폴더 정적 TS 파일 | — |
| 폰트 | expo-font (Pretendard + Inter) | — |

### 3-2. 폴더 구조 (구현 완료)

```
src/
├── assets/        # 폰트, 이미지
├── components/    # common / specific 재사용 컴포넌트
├── constants/     # theme.ts, shiftTypes.ts
├── mocks/         # 목데이터 (shifts, fortunes, community, study, friends)
├── navigation/    # RootNavigator, BottomTabNavigator, AuthNavigator
├── screens/       # Auth, Home, Fortune, Study, Friends, Community
├── services/      # supabase.ts, auth.ts, scheduleApi.ts (인터페이스 선정의)
├── store/         # useUserStore.ts (Zustand)
└── utils/         # dateHelpers.ts, helpers.ts
```

### 3-3. 화면 구현 체크리스트

| 화면 | 컴포넌트 | 목데이터 | 상태 |
|------|----------|----------|------|
| 홈 (DashboardScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 운세 (FortuneScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 학습 (StudyScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 친구 (FriendsScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 커뮤니티 (CommunityScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 로그인 (LoginScreen) | ✅ | ✅ | ✅ 구현 완료 |
| 온보딩 (OnboardingScreen) | ✅ | — | ✅ 구현 완료 |
| 스케줄 추가/편집 Modal | ⬜ | ⬜ | ⬜ 예정 |
| 게시글 상세 | ⬜ | ⬜ | ⬜ 예정 |
| 프로필 설정 | ⬜ | ⬜ | ⬜ 예정 |

### 3-4. 공통 컴포넌트 구현 상태

| 컴포넌트 | 파일 | 상태 |
|----------|------|------|
| Button | `components/common/Button.tsx` | ✅ |
| Card | `components/common/Card.tsx` | ✅ |
| Input | `components/common/Input.tsx` | ✅ |
| Header | `components/common/Header.tsx` | ✅ |
| DutyCalendar | `components/specific/DutyCalendar.tsx` | ✅ |
| FortuneCard | `components/specific/FortuneCard.tsx` | ✅ |
| WeekStrip | ⬜ 별도 분리 필요 | ⬜ |
| ShiftCard | ⬜ 별도 분리 필요 | ⬜ |

### 3-5. 프론트엔드 다음 단계 작업
- [ ] Pretendard + Inter 폰트 에셋 다운로드 및 `expo-font` 로드 설정
- [ ] 스케줄 추가/편집 Modal 구현
- [ ] 근무표 OCR 입력 UI 화면 (이미지 → 듀티 파싱 화면)
- [ ] 애니메이션 (react-native-reanimated) 추가
- [ ] iOS/Android 실제 기기 테스트

---

## Phase 4: 백엔드 (Backend) — 상세 구현 계획

> **작성일**: 2026-09-05  
> **아키텍처**: Supabase 올인원 (Auth + DB + Storage + Realtime + Edge Functions)  
> **AI 엔진**: OpenAI GPT API (운세/임상 Q&A), Google Gemini Vision (OCR)  
> **별도 서버**: 없음 (Supabase Edge Functions = Deno/TypeScript, 프론트와 동일 언어)

---

### 4-0. 아키텍처 개요

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
│                                                               │
│  ┌──── Database Functions (PL/pgSQL) ──────────────────────┐ │
│  │  matching_off_days()  │  monthly_stats()  │  triggers   │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

**이 아키텍처를 선택한 이유:**
1. **별도 서버 운영 불필요** → 인프라 비용 0원, DevOps 부담 제로
2. **프론트엔드와 동일한 TypeScript** → 학습 곡선 최소화
3. **Supabase MCP 도구로 AI 에이전트가 직접 구현 가능** → 테이블 생성, RLS 정책, Edge Function 배포까지 자동화
4. **보안 내장** → RLS, JWT 검증, API Key 서버사이드 격리가 기본 제공

---

### 4-1. 기술 스택

| 계층 | 기술 | 역할 | 비고 |
|------|------|------|------|
| **BaaS 플랫폼** | Supabase | Auth, PostgreSQL, Storage, Realtime, Edge Functions | 프로젝트 ID: `tffvsyarxfujmvbqlutr` |
| **서버리스 함수** | Supabase Edge Functions (Deno) | AI API 프록시, OCR 처리, 비즈니스 로직 | TypeScript, JWT 자동 검증 |
| **인증** | Supabase Auth | OAuth (카카오/구글/애플) + 이메일 | RLS와 연동 |
| **AI 텍스트** | OpenAI GPT-4o API | 운세 생성, 임상 Q&A 멘토 | `sk-proj-...` Edge Function 환경변수로 격리 |
| **AI 비전/OCR** | Google Gemini 2.5 Pro Vision | 근무표 이미지 → 구조화 JSON 파싱 | `GEMINI_API_KEY` Edge Function 환경변수로 격리 |
| **실시간** | Supabase Realtime | 1:1 채팅, 듀티 교환 제안 알림 | Postgres Changes + Broadcast |
| **파일 저장** | Supabase Storage | 근무표 이미지, 커뮤니티 게시글 사진 | Bucket 정책으로 접근 제어 |
| **모니터링** | Supabase Dashboard + Logs | 쿼리 성능, Edge Function 로그, 에러 추적 | 기본 제공 |

---

### 4-2. 환경변수 관리 (보안 최우선)

> **🔒 핵심 원칙: 모든 서드파티 API 키는 프론트엔드에 절대 노출되지 않습니다.**

#### 4-2-1. 프론트엔드 `.env.local` (클라이언트 사이드 — 공개 가능한 키만)

```env
# ─── Supabase 공개 키 (anon key = 공개용, RLS가 보안 담당) ───
EXPO_PUBLIC_SUPABASE_URL=https://tffvsyarxfujmvbqlutr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── 기타 공개 설정 ───
EXPO_PUBLIC_APP_ENV=production
```

#### 4-2-2. Supabase Edge Function 환경변수 (서버 사이드 — 절대 비공개)

```env
# ─── AI API Keys (Edge Function에서만 접근 가능) ───
OPENAI_API_KEY=sk-proj-4sWqyic_xpAsOgH44-dciTrSAWPBfWbOFjVtKqQA2u_de3-...
GEMINI_API_KEY=AIzaSyCHnto6h-UThCVTRQ9f7ctM1ECrnmnwRWU
GOOGLE_CLOUD_PROJECT=proud-climber-458207-e8

# ─── Supabase 서비스 키 (관리자 권한, Edge Function 전용) ───
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **⚠️ 보안 규칙:**
> - `OPENAI_API_KEY`, `GEMINI_API_KEY`는 **Edge Function 환경변수로만** 설정 (`supabase secrets set`)
> - 프론트엔드 코드에서 직접 AI API를 호출하는 것은 **금지**
> - 프론트엔드 → Edge Function → AI API 경로만 허용 (프록시 패턴)
> - `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 내부에서 관리 작업 시에만 사용

---

### 4-3. Supabase 데이터베이스 스키마 (보안 강화 버전)

#### 4-3-1. 핵심 테이블 스키마

```sql
-- ═══════════════════════════════════════════════════════
-- 1. 유저 프로필 (User Profiles)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  nickname TEXT UNIQUE,                          -- 커뮤니티 닉네임
  hospital_name TEXT,
  ward_name TEXT,                               -- 병동
  experience_years INTEGER DEFAULT 1 CHECK (experience_years >= 0 AND experience_years <= 50),
  role TEXT DEFAULT 'nurse' CHECK (role IN ('nurse', 'head_nurse', 'student')),
  avatar_url TEXT,
  -- 사주/운세 탄생 정보
  birth_date DATE,
  birth_time TIME,
  calendar_type TEXT DEFAULT 'solar' CHECK (calendar_type IN ('solar', 'lunar')),
  gender TEXT CHECK (gender IN ('female', 'male')),
  -- 메타
  push_token TEXT,                              -- FCM/APNs 푸시 토큰
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 자동 생성 트리거 (회원가입 시)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 2. 근무 스케줄 (Shift Schedules)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_code TEXT NOT NULL CHECK (shift_code IN ('D', 'E', 'N', 'O', 'V', 'F', 'M')),
  start_time TIME,                              -- 커스텀 시작 시간
  end_time TIME,                                -- 커스텀 종료 시간
  memo TEXT CHECK (char_length(memo) <= 500),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ocr', 'ai_recommend')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_schedules_user_date ON public.schedules(user_id, date);
CREATE INDEX idx_schedules_date ON public.schedules(date);

CREATE TRIGGER schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 3. 커스텀 듀티 코드 (Custom Shift Codes)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.custom_shift_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL CHECK (char_length(code) <= 3),
  name TEXT NOT NULL CHECK (char_length(name) <= 20),
  color TEXT NOT NULL,                          -- HEX 컬러
  text_color TEXT DEFAULT '#FFFFFF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, code)
);

-- ═══════════════════════════════════════════════════════
-- 4. 커뮤니티 게시글 (Community Posts)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    '전체', '자유게시판', '임상/질문', '이직/취업', '교대근무', '한풀이'
  )),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
  is_anonymous BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT '{}',                   -- Storage URL 배열 (최대 3장)
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  is_hidden BOOLEAN DEFAULT FALSE,              -- 신고 누적 시 숨김
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_category ON public.posts(category, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════
-- 5. 댓글 (Comments) — 대댓글 지원
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- 대댓글
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);

-- ═══════════════════════════════════════════════════════
-- 6. 좋아요 (Likes) — 게시글/댓글 공용
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON public.likes(target_type, target_id);

-- ═══════════════════════════════════════════════════════
-- 7. 북마크 (Bookmarks)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'study_guide')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

-- ═══════════════════════════════════════════════════════
-- 8. 친구 관계 (Friendships)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  is_favorite BOOLEAN DEFAULT FALSE,            -- 즐겨찾기 고정
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id != addressee_id)           -- 자기 자신 친구 추가 방지
);

CREATE INDEX idx_friendships_users ON public.friendships(requester_id, addressee_id);

-- ═══════════════════════════════════════════════════════
-- 9. 1:1 채팅 메시지 (Chat Messages)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  is_read BOOLEAN DEFAULT FALSE,
  -- 듀티 맞교환 제안 관련
  is_swap_request BOOLEAN DEFAULT FALSE,
  swap_my_date DATE,
  swap_my_shift TEXT,
  swap_their_date DATE,
  swap_their_shift TEXT,
  swap_status TEXT CHECK (swap_status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_chat_sender_receiver ON public.chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_chat_receiver_unread ON public.chat_messages(receiver_id, is_read) WHERE is_read = FALSE;

-- ═══════════════════════════════════════════════════════
-- 10. 데일리 노트 (Daily Patient Notes)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.daily_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  patient TEXT NOT NULL CHECK (char_length(patient) <= 100),  -- "503호 정환자"
  diagnosis TEXT CHECK (char_length(diagnosis) <= 200),       -- 진단명
  note TEXT NOT NULL CHECK (char_length(note) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_notes_user_date ON public.daily_notes(user_id, date DESC);

-- ═══════════════════════════════════════════════════════
-- 11. 임상 알람 (Clinical Alarms) — 로컬 우선, 서버 백업
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.clinical_alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient TEXT NOT NULL,
  content TEXT NOT NULL,
  trigger_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 12. 알림 센터 (Notifications)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('swap', 'shift', 'comment', 'friend', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,                              -- 관련 게시글/채팅 ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ═══════════════════════════════════════════════════════
-- 13. 신고 (Reports)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    '불쾌한 내용', '스팸/광고', '의료법 위반', '개인정보 노출', '허위 정보', '기타'
  )),
  description TEXT CHECK (char_length(description) <= 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reporter_id, target_type, target_id)  -- 동일 대상 중복 신고 방지
);

-- ═══════════════════════════════════════════════════════
-- 14. 차단 (Blocks)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- ═══════════════════════════════════════════════════════
-- 15. 운세 캐시 (Fortune Cache)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.fortune_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fortune_type TEXT NOT NULL CHECK (fortune_type IN ('daily', 'saju', 'love', 'career', 'wealth')),
  result JSONB NOT NULL,                        -- AI 생성 결과 JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date, fortune_type)
);

CREATE INDEX idx_fortune_cache_lookup ON public.fortune_cache(user_id, date, fortune_type);

-- ═══════════════════════════════════════════════════════
-- 16. 임상 학습 가이드 (Study Guides) — 관리자 관리
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.study_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    '약물 계산', '응급 간호', '검사/수치', '임상 술기', 'EKG'
  )),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  read_time TEXT DEFAULT '3분',
  icon TEXT DEFAULT '🧪',
  is_new BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 17. AI 임상 Q&A 대화 기록 (Clinical AI Chat History)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_user ON public.ai_chat_history(user_id, created_at);
```

#### 4-3-2. DB 헬퍼 함수 (PL/pgSQL)

```sql
-- 친구 간 공통 오프일 계산 함수
CREATE OR REPLACE FUNCTION public.get_matching_off_days(
  p_user_id UUID,
  p_friend_id UUID,
  p_year_month TEXT  -- '2026-09'
)
RETURNS TABLE (date DATE, user_shift TEXT, friend_shift TEXT)
AS $$
BEGIN
  RETURN QUERY
  SELECT s1.date, s1.shift_code, s2.shift_code
  FROM public.schedules s1
  JOIN public.schedules s2 ON s1.date = s2.date
  WHERE s1.user_id = p_user_id
    AND s2.user_id = p_friend_id
    AND s1.shift_code IN ('O', 'V')
    AND s2.shift_code IN ('O', 'V')
    AND s1.date >= (p_year_month || '-01')::DATE
    AND s1.date < ((p_year_month || '-01')::DATE + INTERVAL '1 month')
  ORDER BY s1.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 월간 근무 통계 함수
CREATE OR REPLACE FUNCTION public.get_monthly_stats(
  p_user_id UUID,
  p_year_month TEXT
)
RETURNS JSONB
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(shift_code, cnt)
  INTO result
  FROM (
    SELECT shift_code, COUNT(*) AS cnt
    FROM public.schedules
    WHERE user_id = p_user_id
      AND date >= (p_year_month || '-01')::DATE
      AND date < ((p_year_month || '-01')::DATE + INTERVAL '1 month')
    GROUP BY shift_code
  ) sub;

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 게시글 조회수 증가 (원자적)
CREATE OR REPLACE FUNCTION public.increment_view_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET views_count = views_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4-4. Row Level Security (RLS) 정책 — 보안 핵심

> **🔒 모든 테이블에 RLS를 활성화하여 사용자 데이터를 완전히 격리합니다.**

```sql
-- ═══ RLS 활성화 ═══
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_shift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fortune_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- ═══ profiles ═══
CREATE POLICY "프로필 본인 조회" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "프로필 본인 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "친구 프로필 조회" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT CASE WHEN requester_id = auth.uid() THEN addressee_id ELSE requester_id END
      FROM public.friendships
      WHERE (requester_id = auth.uid() OR addressee_id = auth.uid())
        AND status = 'accepted'
    )
  );

-- ═══ schedules ═══
CREATE POLICY "스케줄 본인 CRUD" ON public.schedules
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "친구 스케줄 조회" ON public.schedules
  FOR SELECT USING (
    user_id IN (
      SELECT CASE WHEN requester_id = auth.uid() THEN addressee_id ELSE requester_id END
      FROM public.friendships
      WHERE (requester_id = auth.uid() OR addressee_id = auth.uid())
        AND status = 'accepted'
    )
  );

-- ═══ posts (커뮤니티는 차단된 사용자 콘텐츠 제외) ═══
CREATE POLICY "게시글 조회 (차단 제외)" ON public.posts
  FOR SELECT USING (
    is_hidden = FALSE
    AND author_id NOT IN (
      SELECT blocked_id FROM public.blocks WHERE blocker_id = auth.uid()
    )
  );
CREATE POLICY "게시글 작성" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "게시글 수정 (본인만)" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "게시글 삭제 (본인만)" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ═══ comments ═══
CREATE POLICY "댓글 조회" ON public.comments
  FOR SELECT USING (
    is_hidden = FALSE
    AND author_id NOT IN (
      SELECT blocked_id FROM public.blocks WHERE blocker_id = auth.uid()
    )
  );
CREATE POLICY "댓글 작성" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "댓글 삭제 (본인만)" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ═══ likes / bookmarks ═══
CREATE POLICY "좋아요 본인 관리" ON public.likes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "북마크 본인 관리" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ═══ friendships ═══
CREATE POLICY "친구 관계 조회" ON public.friendships
  FOR SELECT USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "친구 요청 생성" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "친구 관계 수정" ON public.friendships
  FOR UPDATE USING (auth.uid() IN (requester_id, addressee_id));

-- ═══ chat_messages ═══
CREATE POLICY "채팅 본인 관련만" ON public.chat_messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "채팅 발신" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "채팅 읽음 처리" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ═══ daily_notes / clinical_alarms ═══
CREATE POLICY "노트 본인만" ON public.daily_notes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "알람 본인만" ON public.clinical_alarms
  FOR ALL USING (auth.uid() = user_id);

-- ═══ notifications ═══
CREATE POLICY "알림 본인만" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "알림 읽음 처리" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══ reports / blocks ═══
CREATE POLICY "신고 본인 작성" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "차단 본인 관리" ON public.blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- ═══ fortune_cache ═══
CREATE POLICY "운세 캐시 본인만" ON public.fortune_cache
  FOR ALL USING (auth.uid() = user_id);

-- ═══ study_guides (모든 인증 사용자 읽기 가능) ═══
CREATE POLICY "학습 가이드 읽기" ON public.study_guides
  FOR SELECT USING (auth.role() = 'authenticated');

-- ═══ ai_chat_history ═══
CREATE POLICY "AI 채팅 본인만" ON public.ai_chat_history
  FOR ALL USING (auth.uid() = user_id);
```

---

### 4-5. Supabase Edge Functions (서버리스 API 목록)

> **모든 Edge Function은 JWT 검증(`verify_jwt: true`)을 기본으로 활성화하여 인증된 사용자만 호출 가능합니다.**

#### EF-01: `fortune-generate` — AI 운세 생성

```
POST /functions/v1/fortune-generate
Headers: Authorization: Bearer <user_jwt>
Body: {
  "fortune_type": "daily" | "saju" | "love" | "career" | "wealth",
  "birth_info": { "birthDate", "birthTime", "calendarType", "gender" },
  "partner_info"?: { ... },     // love 타입 시
  "colleague_info"?: { ... }    // career 타입 시
}
Response: {
  "fortune_text": "...",
  "scores": { "overall": 95, "injection": 98, "communication": 88, "mental": 92 },
  "lucky": { "color": "...", "number": 7, "item": "3색 볼펜", "direction": "스테이션 동쪽" }
}

보안:
- OpenAI API Key는 Edge Function 환경변수에서만 접근
- 하루 1회 생성 → fortune_cache 테이블에 캐싱, 동일 날짜 재요청 시 캐시 반환
- Rate Limiting: 사용자당 1분에 최대 5회 호출
```

#### EF-02: `schedule-ocr` — 근무표 이미지 OCR 파싱

```
POST /functions/v1/schedule-ocr
Headers: Authorization: Bearer <user_jwt>
Body: FormData { image: File }
Response: {
  "parsed_schedules": [
    { "date": "2026-09-01", "shift_code": "D" },
    { "date": "2026-09-02", "shift_code": "E" },
    ...
  ],
  "confidence": 0.95,
  "raw_text": "..."
}

보안:
- Gemini API Key는 Edge Function 환경변수에서만 접근
- 이미지 크기 제한: 최대 10MB
- 허용 MIME 타입: image/jpeg, image/png, image/webp만 허용
- 파싱 결과는 사용자 확인 후 schedules 테이블에 저장 (자동 저장 금지)
```

#### EF-03: `clinical-ai-qa` — 임상 AI 멘토 Q&A

```
POST /functions/v1/clinical-ai-qa
Headers: Authorization: Bearer <user_jwt>
Body: {
  "question": "도파민 5mcg/kg/min 60kg 환자 점적 속도 계산해주세요",
  "chat_history"?: [{ "role": "user" | "assistant", "content": "..." }]
}
Response: {
  "answer": "💡 [도파민 점적 계산 요약]\n\n• 공식: ...",
  "references": ["KACLS 가이드라인 2024", "...]
}

보안:
- OpenAI API Key Edge Function 환경변수 격리
- System Prompt에 "의료 면허 없는 AI 보조" 면책 조항 삽입
- 대화 기록은 ai_chat_history 테이블에 저장 (학습 이력 관리)
- Rate Limiting: 사용자당 1분에 최대 10회
```

#### EF-04: `push-notification` — 푸시 알림 발송

```
POST /functions/v1/push-notification  (내부 호출 전용)
Headers: Authorization: Bearer <service_role_key>
Body: {
  "user_id": "uuid",
  "title": "듀티 맞교환 제안 도착",
  "body": "김민지님이 9월 12일(금) 데이 맞교환을 제안했습니다.",
  "data": { "type": "swap", "related_id": "uuid" }
}

보안:
- service_role_key로만 호출 가능 (일반 사용자 JWT로 호출 불가)
- Expo Push Notifications API 또는 FCM/APNs 직접 호출
```

---

### 4-6. 전체 API 카탈로그 (Supabase Client + Edge Functions)

> **프론트엔드 `src/services/` 에서 호출하는 모든 API 목록**

#### 🔐 Auth API (Supabase Auth 내장)

| # | 메서드 | 엔드포인트 | 설명 |
|---|--------|-----------|------|
| A1 | `supabase.auth.signInWithOAuth()` | — | 소셜 로그인 (카카오/구글/애플) |
| A2 | `supabase.auth.signInWithPassword()` | — | 이메일/비밀번호 로그인 |
| A3 | `supabase.auth.signUp()` | — | 이메일 회원가입 |
| A4 | `supabase.auth.signOut()` | — | 로그아웃 |
| A5 | `supabase.auth.getUser()` | — | 현재 사용자 정보 |
| A6 | `supabase.auth.resetPasswordForEmail()` | — | 비밀번호 재설정 이메일 |
| A7 | `supabase.auth.onAuthStateChange()` | — | 인증 상태 변화 리스너 |

#### 👤 Profile API (Supabase REST)

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| P1 | SELECT | `profiles` | 내 프로필 조회 |
| P2 | UPDATE | `profiles` | 프로필 수정 (닉네임, 병원, 병동, 연차, 탄생정보) |
| P3 | SELECT | `profiles` | 친구 프로필 조회 |

#### 📅 Schedule API (Supabase REST)

| # | 메서드 | 테이블/함수 | 설명 |
|---|--------|------------|------|
| S1 | SELECT | `schedules` | 월간 스케줄 조회 (`user_id`, `date >= ?`, `date <= ?`) |
| S2 | UPSERT | `schedules` | 근무 추가/수정 (단일) |
| S3 | UPSERT | `schedules` | 근무 일괄 저장 (OCR 파싱 결과 확인 후) |
| S4 | DELETE | `schedules` | 근무 삭제 |
| S5 | RPC | `get_monthly_stats()` | 월간 근무 통계 (D:n, E:n, N:n, O:n) |
| S6 | CRUD | `custom_shift_codes` | 커스텀 듀티 코드 관리 |

#### 🔮 Fortune API (Edge Functions)

| # | 메서드 | 엔드포인트 | 설명 |
|---|--------|-----------|------|
| F1 | POST | `/functions/v1/fortune-generate` | 오늘의 간호 운세 생성 (GPT) |
| F2 | POST | `/functions/v1/fortune-generate` | 간호사주 상세 (fortune_type=saju) |
| F3 | POST | `/functions/v1/fortune-generate` | 연애운 상세 (fortune_type=love) |
| F4 | POST | `/functions/v1/fortune-generate` | 직업운 상세 (fortune_type=career) |
| F5 | POST | `/functions/v1/fortune-generate` | 재물운 상세 (fortune_type=wealth) |
| F6 | SELECT | `fortune_cache` | 오늘 운세 캐시 조회 (동일 날짜 재생성 방지) |

#### 📷 OCR API (Edge Functions)

| # | 메서드 | 엔드포인트 | 설명 |
|---|--------|-----------|------|
| O1 | POST | `/functions/v1/schedule-ocr` | 근무표 이미지 → JSON 파싱 (Gemini Vision) |

#### 🤖 Clinical AI API (Edge Functions)

| # | 메서드 | 엔드포인트 | 설명 |
|---|--------|-----------|------|
| AI1 | POST | `/functions/v1/clinical-ai-qa` | 임상 AI 멘토 실시간 Q&A |
| AI2 | SELECT | `ai_chat_history` | AI 대화 기록 조회 |

#### 👥 Friends API (Supabase REST + RPC)

| # | 메서드 | 테이블/함수 | 설명 |
|---|--------|------------|------|
| FR1 | SELECT | `friendships` | 내 친구 목록 조회 (status=accepted) |
| FR2 | INSERT | `friendships` | 친구 요청 보내기 |
| FR3 | UPDATE | `friendships` | 친구 요청 수락/거절 |
| FR4 | UPDATE | `friendships` | 즐겨찾기 토글 |
| FR5 | DELETE | `friendships` | 친구 삭제 |
| FR6 | RPC | `get_matching_off_days()` | 공통 오프일 계산 |
| FR7 | SELECT | `schedules` | 친구 스케줄 조회 (RLS 허용 범위 내) |

#### 💬 Chat API (Supabase REST + Realtime)

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| CH1 | SELECT | `chat_messages` | 1:1 채팅 기록 조회 (페이지네이션) |
| CH2 | INSERT | `chat_messages` | 메시지 발송 |
| CH3 | UPDATE | `chat_messages` | 읽음 처리 |
| CH4 | INSERT | `chat_messages` | 듀티 맞교환 제안 (is_swap_request=true) |
| CH5 | UPDATE | `chat_messages` | 맞교환 수락/거절 (swap_status 변경) |
| CH6 | Realtime | `chat_messages` | 실시간 메시지 수신 (Postgres Changes) |

#### 📝 Community API (Supabase REST)

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| C1 | SELECT | `posts` | 게시글 목록 조회 (카테고리 필터, 페이지네이션) |
| C2 | SELECT | `posts` + `comments` | 게시글 상세 + 댓글 조회 |
| C3 | INSERT | `posts` | 게시글 작성 |
| C4 | UPDATE | `posts` | 게시글 수정 (본인만) |
| C5 | DELETE | `posts` | 게시글 삭제 (본인만) |
| C6 | INSERT | `comments` | 댓글/대댓글 작성 |
| C7 | DELETE | `comments` | 댓글 삭제 (본인만) |
| C8 | INSERT/DELETE | `likes` | 좋아요 토글 (게시글/댓글) |
| C9 | INSERT/DELETE | `bookmarks` | 북마크 토글 |
| C10 | RPC | `increment_view_count()` | 조회수 증가 |

#### 🚨 Report / Block API

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| R1 | INSERT | `reports` | 신고 접수 (게시글/댓글/사용자) |
| R2 | INSERT | `blocks` | 사용자 차단 |
| R3 | DELETE | `blocks` | 차단 해제 |
| R4 | SELECT | `blocks` | 차단 목록 조회 |

#### 📋 Daily Note / Alarm API

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| DN1 | SELECT | `daily_notes` | 날짜별 데일리 노트 조회 |
| DN2 | INSERT | `daily_notes` | 노트 추가 |
| DN3 | DELETE | `daily_notes` | 노트 삭제 |
| AL1 | CRUD | `clinical_alarms` | 임상 알람 관리 |

#### 🔔 Notification API

| # | 메서드 | 테이블/Realtime | 설명 |
|---|--------|----------------|------|
| N1 | SELECT | `notifications` | 알림 목록 조회 |
| N2 | UPDATE | `notifications` | 읽음 처리 (개별/전체) |
| N3 | DELETE | `notifications` | 알림 삭제 |
| N4 | Realtime | `notifications` | 실시간 알림 수신 |

#### 📚 Study API

| # | 메서드 | 테이블 | 설명 |
|---|--------|--------|------|
| ST1 | SELECT | `study_guides` | 학습 가이드 목록 (카테고리 필터) |
| ST2 | INSERT/DELETE | `bookmarks` | 학습 가이드 북마크 토글 |

#### 📦 Storage API (파일 업로드)

| # | 메서드 | 버킷 | 설명 |
|---|--------|------|------|
| STO1 | Upload | `schedule-images` | 근무표 OCR 이미지 업로드 |
| STO2 | Upload | `post-images` | 커뮤니티 게시글 이미지 (최대 3장) |
| STO3 | Upload | `avatars` | 프로필 아바타 이미지 |

---

### 4-7. Supabase Storage 버킷 정책

```sql
-- 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('schedule-images', 'schedule-images', FALSE);
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- Storage RLS 정책
-- schedule-images: 본인만 업로드/조회
CREATE POLICY "스케줄 이미지 본인만" ON storage.objects
  FOR ALL USING (bucket_id = 'schedule-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- post-images: 인증 사용자 업로드, 모든 사용자 조회
CREATE POLICY "게시글 이미지 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
CREATE POLICY "게시글 이미지 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

-- avatars: 본인 업로드, 모든 사용자 조회
CREATE POLICY "아바타 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "아바타 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

### 4-8. 보안 강화 체크리스트

| # | 항목 | 구현 방법 | 우선순위 |
|---|------|---------|---------|
| SEC-01 | **RLS 전 테이블 활성화** | 위 4-4 참조, 모든 테이블 `ENABLE ROW LEVEL SECURITY` | 🔴 필수 |
| SEC-02 | **API 키 서버사이드 격리** | OpenAI/Gemini 키는 Edge Function 환경변수 전용, `.env.local`에 `EXPO_PUBLIC_` 접두사 없이 저장 금지 | 🔴 필수 |
| SEC-03 | **JWT 검증** | 모든 Edge Function `verify_jwt: true` 기본 활성화 | 🔴 필수 |
| SEC-04 | **입력값 검증** | DB 레벨 CHECK 제약조건 + Edge Function 입력 Zod 스키마 검증 | 🔴 필수 |
| SEC-05 | **SQL Injection 방지** | Supabase Client 파라미터 바인딩, Raw SQL 미사용 | 🔴 필수 |
| SEC-06 | **XSS 방지** | React Native는 기본 XSS 안전, 커뮤니티 콘텐츠 HTML 태그 이스케이프 | 🟡 높음 |
| SEC-07 | **Rate Limiting** | Edge Function 내 IP/User별 호출 횟수 제한 (AI API 비용 보호) | 🟡 높음 |
| SEC-08 | **이미지 업로드 검증** | MIME 타입 화이트리스트 (jpeg/png/webp), 최대 10MB 제한 | 🟡 높음 |
| SEC-09 | **익명성 보장** | 커뮤니티 API 응답에서 `author_id` 제거, 닉네임만 반환 (is_anonymous=true 시) | 🟡 높음 |
| SEC-10 | **차단 사용자 격리** | RLS 정책에서 blocks 테이블 참조하여 차단 유저 콘텐츠 필터링 | 🟡 높음 |
| SEC-11 | **민감 정보 암호화** | 환자 정보(daily_notes) pgcrypto 확장 고려 (HIPAA 준수 방향) | 🟠 중간 |
| SEC-12 | **감사 로그 (Audit Log)** | 관리자 작업 + 신고 처리 이력 기록 | 🟠 중간 |
| SEC-13 | **서비스 역할 키 보호** | `SUPABASE_SERVICE_ROLE_KEY`는 push-notification Edge Function에서만 사용 | 🔴 필수 |

---

### 4-9. 인증 전략 (Supabase Auth 상세)

| 방법 | 지원 여부 | 우선순위 | 구현 비고 |
|------|-----------|----------|---------|
| 카카오 OAuth | ✅ | 1순위 | Supabase Auth → Kakao Developer 앱 등록 필요 |
| 구글 OAuth | ✅ | 2순위 | GCP OAuth 2.0 클라이언트 ID 설정 |
| 애플 OAuth | ✅ | 3순위 | Apple Developer에서 Sign In with Apple 설정 (iOS 필수) |
| 이메일/비밀번호 | ✅ | 4순위 | Fallback, 이메일 인증 활성화 |

**OAuth 플로우 (Expo + Supabase):**
```
[앱] → expo-auth-session으로 OAuth URL 열기
→ [카카오/구글/애플] 로그인 완료
→ Supabase Auth에 토큰 전달
→ auth.users 테이블에 유저 생성
→ handle_new_user() 트리거가 profiles 자동 생성
→ JWT 발급 → 앱에서 Zustand에 저장
```

---

### 4-10. Realtime 구현 범위

| 기능 | Realtime 타입 | 테이블/채널 |
|------|-------------|------------|
| 1:1 채팅 메시지 수신 | Postgres Changes (INSERT) | `chat_messages` (receiver_id = my_id) |
| 듀티 맞교환 제안 알림 | Postgres Changes (INSERT) | `notifications` (user_id = my_id) |
| 새 댓글 알림 | Postgres Changes (INSERT) | `notifications` (user_id = my_id) |

---

### 4-11. AI 에이전트가 사용하는 MCP 도구 목록

> **이 프로젝트의 백엔드를 AI 에이전트가 직접 구현할 때 사용하는 MCP 도구입니다.**

#### Supabase MCP (`supabase`)

| MCP 도구 | 용도 | 사용 시점 |
|----------|------|---------|
| `list_projects` | 프로젝트 목록 확인 | 프로젝트 ID 확인 |
| `get_project` | 프로젝트 상세 정보 | 리전, 상태, DB 버전 확인 |
| `list_tables` | 현재 테이블 구조 조회 | 마이그레이션 전 기존 스키마 파악 |
| `apply_migration` | DDL 실행 (테이블 생성, RLS 정책 등) | **핵심** — 4-3, 4-4의 모든 SQL 실행 |
| `execute_sql` | DML 실행 (데이터 삽입, 함수 호출) | 시드 데이터 삽입, DB 함수 테스트 |
| `list_migrations` | 마이그레이션 이력 확인 | 이미 적용된 마이그레이션 확인 |
| `deploy_edge_function` | Edge Function 배포 | **핵심** — 4-5의 모든 Edge Function 배포 |
| `list_edge_functions` | 배포된 Edge Function 목록 | 배포 상태 확인 |
| `get_edge_function` | Edge Function 상세 | 배포 버전, 설정 확인 |
| `get_project_url` | 프로젝트 URL 확인 | 프론트엔드 환경변수 설정 |
| `get_publishable_keys` | Anon Key 확인 | 프론트엔드 환경변수 설정 |
| `list_extensions` | DB 확장 목록 | pgcrypto, pg_trgm 등 필요 확장 확인 |
| `query_logs` | Edge Function/DB 로그 조회 | 디버깅, 에러 추적 |
| `get_advisors` | 성능/보안 권고 | RLS 미설정 테이블 등 보안 점검 |
| `generate_typescript_types` | DB 스키마 → TS 타입 자동 생성 | `src/types/database.ts` 자동 생성 |
| `search_docs` | Supabase 공식 문서 검색 | 구현 중 레퍼런스 참조 |

#### Context7 MCP (`context7`)

| MCP 도구 | 용도 |
|----------|------|
| `resolve-library-id` | 라이브러리 ID 확인 (`@supabase/supabase-js` 등) |
| `query-docs` | Supabase JS 클라이언트 API 문서 조회 |

#### Sequential Thinking MCP (`sequential-thinking`)

| MCP 도구 | 용도 |
|----------|------|
| `sequentialthinking` | 복잡한 RLS 정책 설계, Edge Function 로직 설계 시 단계별 추론 |

---

### 4-12. 백엔드 구현 스프린트 계획

#### Sprint 1 (1주차): 인프라 & 인증
- [ ] Supabase 프로젝트 DB 스키마 마이그레이션 (4-3 전체)
- [ ] RLS 정책 적용 (4-4 전체)
- [ ] Storage 버킷 생성 및 정책 (4-7)
- [ ] DB 헬퍼 함수 배포 (4-3-2)
- [ ] OAuth 프로바이더 설정 (카카오/구글/애플)
- [ ] 프론트엔드 `.env.local` 설정
- [ ] `src/services/supabase.ts` 개선 (환경변수 참조)
- [ ] `src/services/auth.ts` OAuth 플로우 실연동
- [ ] `src/types/database.ts` 자동 생성 (`generate_typescript_types`)

#### Sprint 2 (2주차): 핵심 CRUD API 연동
- [ ] `src/services/scheduleApi.ts` 실연동 (S1~S6)
- [ ] `src/services/profileApi.ts` 신규 작성 (P1~P3)
- [ ] `src/services/communityApi.ts` 신규 작성 (C1~C10)
- [ ] `src/services/friendsApi.ts` 신규 작성 (FR1~FR7)
- [ ] `src/services/dailyNoteApi.ts` 신규 작성 (DN1~DN3)
- [ ] `src/services/notificationApi.ts` 신규 작성 (N1~N4)
- [ ] Zustand Store → 실 API 호출로 교체 (Mock → Real)

#### Sprint 3 (3주차): AI Edge Functions
- [ ] Edge Function 환경변수 설정 (`supabase secrets set`)
- [ ] `fortune-generate` Edge Function 개발 & 배포 (EF-01)
- [ ] `schedule-ocr` Edge Function 개발 & 배포 (EF-02)
- [ ] `clinical-ai-qa` Edge Function 개발 & 배포 (EF-03)
- [ ] `src/services/fortuneApi.ts` 신규 작성 (F1~F6)
- [ ] `src/services/ocrApi.ts` 신규 작성 (O1)
- [ ] `src/services/aiChatApi.ts` 신규 작성 (AI1~AI2)

#### Sprint 4 (4주차): Realtime & 채팅
- [ ] Realtime 구독 설정 (chat_messages, notifications)
- [ ] `src/services/chatApi.ts` 신규 작성 (CH1~CH6)
- [ ] 듀티 맞교환 프로토콜 구현
- [ ] `push-notification` Edge Function 개발 & 배포 (EF-04)
- [ ] Storage 이미지 업로드 연동 (STO1~STO3)

#### Sprint 5 (5주차): 보안 강화 & QA
- [ ] 보안 체크리스트 전 항목 점검 (4-8)
- [ ] Rate Limiting 구현 (Edge Functions)
- [ ] 입력값 검증 강화 (Zod 스키마)
- [ ] 익명성 보장 로직 검증
- [ ] E2E 테스트 (인증 → 스케줄 → 커뮤니티 → 채팅 플로우)
- [ ] Supabase Advisors 보안 점검 실행
- [ ] 성능 최적화 (인덱스, 쿼리 분석)

---

### 4-13. 프론트엔드 서비스 레이어 변경 계획

> **Mock Data → Real API 교체 시 UI 컴포넌트 변경 없이 데이터 계층만 교체**

```
src/services/                          (변경/신규)
├── supabase.ts                        [MODIFY] 환경변수 참조 개선
├── auth.ts                            [MODIFY] OAuth 실연동
├── scheduleApi.ts                     [MODIFY] 실 Supabase 연동
├── profileApi.ts                      [NEW] 프로필 CRUD
├── communityApi.ts                    [NEW] 게시글/댓글/좋아요/북마크
├── friendsApi.ts                      [NEW] 친구 관계 + 공통 오프일
├── chatApi.ts                         [NEW] 1:1 채팅 + Realtime
├── dailyNoteApi.ts                    [NEW] 데일리 노트 CRUD
├── notificationApi.ts                 [NEW] 알림 센터 + Realtime
├── fortuneApi.ts                      [NEW] Edge Function 호출 (운세)
├── ocrApi.ts                          [NEW] Edge Function 호출 (OCR)
├── aiChatApi.ts                       [NEW] Edge Function 호출 (AI Q&A)
└── storageApi.ts                      [NEW] 이미지 업로드

src/types/
└── database.ts                        [NEW] Supabase MCP 자동 생성 DB 타입
```

---

## 📅 마일스톤 타임라인 (업데이트)

| Phase | 기간 | 주요 산출물 |
|-------|------|-------------|
| **Phase 1: 기획** | 2주 | PRD, 와이어프레임, 페르소나, 기능 명세서 |
| **Phase 2: 디자인** | 3주 | Figma 전 화면 완성, Design System, 프로토타입 |
| **Phase 3: 프론트엔드** | 4주 | 앱 전 화면 목데이터 기반 동작, 컴포넌트 완성 |
| **Phase 4: 백엔드** | 5주 | Supabase 올인원 + Edge Functions, 앱 실데이터 연동 |
| ↳ Sprint 1 | 1주 | DB 스키마 + RLS + 인증 |
| ↳ Sprint 2 | 1주 | 핵심 CRUD API 연동 |
| ↳ Sprint 3 | 1주 | AI Edge Functions (운세/OCR/임상AI) |
| ↳ Sprint 4 | 1주 | Realtime 채팅 + 푸시 알림 |
| ↳ Sprint 5 | 1주 | 보안 강화 + QA + 성능 최적화 |
| **베타 테스트** | 2주 | 실 사용자 피드백 수집, 버그 픽스 |
| **정식 출시** | — | App Store + Google Play 출시 |

---

## ✅ 현재 진행 상태 (2026-09-05 기준)

| 단계 | 항목 | 상태 |
|------|------|------|
| 기획 | 서비스 컨셉 및 기능 정의 | ✅ 완료 |
| 기획 | 폴더 구조 및 아키텍처 설계 | ✅ 완료 |
| 디자인 | 디자인 시스템 (Design.md) | ✅ 완료 |
| 디자인 | 홈 화면 Figma UI | ✅ 완료 |
| 프론트엔드 | 홈 화면 구현 (DashboardScreen) | ✅ 완료 |
| 프론트엔드 | 운세 화면 구현 (FortuneScreen) | ✅ 완료 |
| 프론트엔드 | 학습 화면 구현 (StudyScreen) | ✅ 완료 |
| 프론트엔드 | 친구 화면 구현 (FriendsScreen) | ✅ 완료 |
| 프론트엔드 | 커뮤니티 화면 구현 (CommunityScreen) | ✅ 완료 |
| 프론트엔드 | 로그인/온보딩 화면 구현 | ✅ 완료 |
| 프론트엔드 | 공통 컴포넌트 (Button, Card, Input, Header) | ✅ 완료 |
| 프론트엔드 | 내비게이션 구조 (Root, BottomTab, Auth) | ✅ 완료 |
| 프론트엔드 | 목데이터 (shifts, fortunes, community, study, friends) | ✅ 완료 |
| 프론트엔드 | 전체 모달 컴포넌트 (Home/Fortune/Friends/Community/Study/MyPage/Notification) | ✅ 완료 |
| 백엔드 | Supabase 클라이언트 초기화 | ✅ 완료 (연동 미완) |
| 백엔드 | API 인터페이스 정의 | ✅ 완료 |
| 백엔드 | **백엔드 상세 구현 계획 (workflow.md Phase 4)** | ✅ 완료 |
| **→ 다음 작업** | Sprint 1: DB 마이그레이션 + RLS + 인증 | 🔄 진행 예정 |
| **→ 다음 작업** | Sprint 2: 핵심 CRUD API 연동 | ⬜ 예정 |
| **→ 다음 작업** | Sprint 3: AI Edge Functions | ⬜ 예정 |

