# Constants Skill Guide (`src/constants/`)

## 1. Directory Structure

```
src/constants/
├── theme.ts             # Primary brand colors, neutral palette, typography
└── shiftTypes.ts        # Nurse shift codes (D, E, N, O, V) & metadata
```

## 2. Core Responsibilities & Standards

1. **Theme Tokens (`theme.ts`)**:
   - **Primary Brand**: `#FF507C` (Viva Coral Pink)
   - **Primary Light**: `#FF6B8E`
   - **Primary Muted**: `#FFAEC0`
   - **Primary Tint**: `#FFE8EE`
   - **Background**: `#FFFFFF` (Pure White) / Off-White (`#F8F9FA`)
   - **Text**: Primary (`#1A1A1A`), Secondary (`#6B7280`), Muted (`#9CA3AF`)
   - **Borders & Dividers**: Border (`#E5E7EB`), Divider (`#F3F4F6`)

2. **Shift Types (`shiftTypes.ts`)**:
   - South Korean 3-shift hospital standard abbreviations and color conventions:
     - `D` (Day / 주간): `#4F98CA` (Blue)
     - `E` (Evening / 저녁): `#E2703A` (Orange)
     - `N` (Night / 야간): `#272727` (Dark Charcoal / Black)
     - `O` (Off / 휴무): `#E84A5F` (Red / Coral)
     - `V` (Vacation / 연차): `#9B51E0` (Purple)
   - Each shift type includes:
     - `code`: ShiftCode (`'D' | 'E' | 'N' | 'O' | 'V'`)
     - `name`: Full Korean name
     - `shortName`: Short Korean label
     - `color`: Hex color
     - `textColor`: Text contrast color (`#FFFFFF`)
     - `defaultStartTime` / `defaultEndTime`

3. **Usage Rule**:
   - Never hardcode color hex values or shift metadata inside components. Always reference `COLORS` and `SHIFT_TYPES`.

