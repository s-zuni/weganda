# Utils Skill Guide (`src/utils/`)

## 1. Directory Structure

```
src/utils/
├── dateHelpers.ts       # Date formatters, monthly D/E/N/O stats calculations
└── helpers.ts           # String truncation, comma formatting, common utilities
```

## 2. Core Responsibilities & Rules

1. **Pure Functions Only**:
   - Every utility function must be stateless, pure, and easily unit-testable.
   - Avoid side-effects, DOM/Native API calls, or global state mutations inside `utils`.

2. **Domain-Specific Utilities (`dateHelpers.ts`)**:
   - `formatDate(date: Date): string` -> `'YYYY-MM-DD'`
   - `getYearMonth(date: Date): string` -> `'YYYY-MM'`
   - `calculateMonthlyShiftStats(schedules)` -> Total counts of `D`, `E`, `N`, `O`, `V` for a given month.
   - `getKoreanDayOfWeek(date: Date): string` -> `'일'`, `'월'`, `'화'`, etc.

3. **General Utilities (`helpers.ts`)**:
   - `formatNumberWithComma(num: number)`
   - `truncateText(text: string, maxLength: number)`
   - `isEmpty(value)`

