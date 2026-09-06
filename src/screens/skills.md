# Screens Skill Guide (`src/screens/`)

## 1. Directory Structure

```
src/screens/
├── Auth/
│   ├── LoginScreen.tsx          # Email & Social login UI
│   └── OnboardingScreen.tsx     # Hospital, ward, and career profile input
├── Home/
│   └── DashboardScreen.tsx      # Main duty calendar, daily shift badge, stats
├── Fortune/
│   └── FortuneScreen.tsx        # Nurse daily fortune, biorhythm metrics
├── Study/
│   └── StudyScreen.tsx          # Clinical manuals, drug calc guides, protocols
├── Friends/
│   └── FriendsScreen.tsx        # Peer schedule sync & matching off days
└── Community/
    └── CommunityScreen.tsx      # Anonymous board categories & post feeds
```

## 2. Core Responsibilities & Rules

1. **Screen Level Orchestration**:
   - Screens assemble reusable common/specific components and bind them to state/mock data.
   - Screen components manage local UI interactions (modals, search queries, active tab filters).

2. **Frontend-First Data Sourcing**:
   - Read dummy data from `src/mocks/` and user profile from `src/store/useUserStore.ts`.
   - Never initiate blocking network calls directly in screen lifecycle.

3. **Screen Specifications**:
   - **DashboardScreen**:
     - Displays current nurse profile, today's shift badge, and full month calendar.
     - Displays D/E/N/O monthly summary stats.
     - Shows quick fortune teaser card.
   - **FortuneScreen**:
     - Deep dive into nurse biorhythm scores (IV line success, communication, mental resilience).
     - Displays lucky item and lucky colors.
   - **CommunityScreen**:
     - Category filter pills (`전체`, `자유게시판`, `이직/취업`, `임상/질문`, etc.).
     - Post cards with hospital tags, likes, comments, and relative timestamp.
   - **StudyScreen**:
     - Search bar for medical terminology, calculation formulas, and clinical procedures.
     - Categorized summary cards with estimated read times.
   - **FriendsScreen**:
     - List of connected colleagues and current shift badges.
     - Highlight matching off days (쉬는 날 맞추기).
   - **Auth Screens**:
     - Streamlined onboarding collecting hospital name, ward, and clinical experience years.

