# Services Skill Guide (`src/services/`)

## 1. Directory Structure

```
src/services/
├── supabase.ts          # Supabase client config & initialization
├── auth.ts              # OAuth & email auth service interfaces
└── scheduleApi.ts       # Duty schedule CRUD & bulk operations
```

## 2. Core Responsibilities & Architecture

1. **Role of Services Layer**:
   - Acts as the single integration point for Supabase Auth, PostgreSQL, and future Python backend endpoints (FastAPI/Django).
   - Keeps network protocols and backend database schemas encapsulated away from UI components.

2. **Frontend-First / Mock Phase Rule (CRITICAL)**:
   - During the current UI/UX Phase, actual network calls to Supabase or external APIs should NOT block UI rendering.
   - All services define clean TypeScript contracts (Interfaces, DTOs) so that mock data can be swapped with live queries without altering screens or components.

3. **Planned Future Backend Integrations**:
   - **Supabase**: User Auth, Social Logins (Google, Apple, Kakao), Row Level Security (RLS) PostgreSQL for schedules and community posts.
   - **Python Backend**: OCR duty table image parsing, AI schedule recommendations, AI fortune & biorhythm generation engine.

