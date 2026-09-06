# Components Skill Guide (`src/components/`)

## 1. Directory Structure

```
src/components/
├── common/              # Generic, domain-agnostic UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Header.tsx
│   └── index.ts
└── specific/            # Domain-specific composite components
    ├── DutyCalendar.tsx
    ├── FortuneCard.tsx
    └── index.ts
```

## 2. Core Responsibilities & Rules

1. **"Dumb" Component Principle**:
   - Components in `src/components/` must be pure and presentation-focused.
   - Do NOT fetch network data or directly couple with external APIs.
   - Receive data and action callbacks strictly via `props`.

2. **Styling & Design System Standards**:
   - **NativeWind Preferred**: Style with Tailwind utility classes (`className`) where applicable.
   - **Theme Primary**: Viva Coral Pink (`#FF507C`).
   - **No Gradients**: Use solid background colors and borders.
   - **Soft Shadows & Rounded Corners**:
     - Cards must use `rounded-2xl` or `rounded-3xl` (12px ~ 20px).
     - Subtle elevation: `shadow-sm` / `elevation: 2`.
     - High contrast, legible typography.

3. **Domain Component Best Practices**:
   - **DutyCalendar**:
     - Provide visual badges for shift types (`D`, `E`, `N`, `O`, `V`).
     - Deeply customize themes using `#FF507C` for active/selected dates.
   - **FortuneCard**:
     - Clear presentation of fortune scores, lucky items, and biorhythm metrics.
     - Pure white/soft pink backgrounds with solid `#FF507C` accent badges.

4. **Export Convention**:
   - Always expose components via barrel `index.ts` files for clean imports:
     ```ts
     import { Button, Card, Header } from '@/components/common';
     import { DutyCalendar, FortuneCard } from '@/components/specific';
     ```

