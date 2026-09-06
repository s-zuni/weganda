# Mocks Skill Guide (`src/mocks/`)

## 1. Directory Structure

```
src/mocks/
├── shifts.ts            # Realistic monthly nurse duty schedules
├── fortunes.ts          # Daily fortune, lucky items, biorhythm scores
├── community.ts         # Anonymous community posts, comments, likes
├── study.ts             # Clinical manuals, calculations, protocols
├── friends.ts           # Peer nurse duty states & off-matching stats
└── index.ts             # Central export barrel
```

## 2. Mock Data Design Rules

1. **Mandate**:
   - In accordance with the **Frontend First** strategy, all screens and complex widgets must be testable using rich, realistic dummy data without network latency or server dependencies.

2. **Domain Realism**:
   - **Shifts**: Realistic 3-shift nurse rotation patterns (e.g. `D-D-E-E-N-N-O-O`).
   - **Community**: Natural clinical Korean jargon (e.g. "노티(Noti)", "바이탈(Vital)", "인계", "신환", "칼퇴", "오프(Off)").
   - **Study**: Practical clinical calculation guides (e.g. gtt calculation, ACLS, ABGA).
   - **Friends**: Matching off days calculation and peer hospital statuses.

3. **Data Types & Contracts**:
   - Mock data structures should mirror the future REST/Supabase JSON schemas to ensure zero-effort migration later.

