# Store Skill Guide (`src/store/`)

## 1. Directory Structure

```
src/store/
└── useUserStore.ts      # Global user profile and auth state
```

## 2. Core Responsibilities & Rules

1. **State Management Technology**:
   - Built on **Zustand** for lightweight, boilerplate-free state management without React context re-rendering overhead.

2. **State Structure**:
   - `id`: Unique user identifier
   - `email`: User email
   - `name`: Nurse name or nickname
   - `hospitalName`: Affiliated hospital
   - `wardName`: Ward or department (e.g. 71병동, 응급실, 중환자실)
   - `experienceYears`: Clinical experience (연차)
   - `isAuthenticated`: Boolean authentication flag

3. **Mock & Swapping Strategy**:
   - In the mock UI phase, `useUserStore` holds mock user profiles to simulate authenticated sessions.
   - When switching to real Supabase/Python Auth, only the store action implementations need updating.

