# Resource Management Frontend - Agent Guidelines

This document serves as the authoritative guidelines and operational rules for AI Assistants reading, architecting, and generating code within the `resource-management-fe` repository.

---

## 1. Project Overview & Tech Stack

- **Project Type**: Single Page Application (SPA) - Client-side Rendering (CSR).
- **Build Tool & Runtime**: Vite 8, React 19, TypeScript 6.
- **Styling & Design System**: Tailwind CSS v4, strictly conforming to tokens in `DESIGN.md` and the `essential-ui` skill.
- **UI Components**: shadcn/ui pattern (located in `src/components/ui/`) tailored to Essential design system tokens.
- **Iconography**: Lucide Icons (`lucide-react`) for all UI icons.
- **Routing**: React Router v7 (`react-router-dom`).
- **State Management**: Zustand v5.
- **HTTP Client**: Axios (configured in `src/services/`).
- **Utility Helpers**: `cn()` (`clsx` + `tailwind-merge`) for dynamic class merging.
- **Testing & Tooling**: Vitest, ESLint 10, Prettier, Husky, lint-staged.
- **Path Alias**: `@/*` maps to `./src/*` (in both `vite.config.ts` and `tsconfig.app.json`).

---

## 2. Design System & UI Styling Rules

- **Design System Reference**: Always adhere strictly to the token specification in `DESIGN.md` and guidance in the `essential-ui` skill.
- **Color Palette**:
  - `primary`: `#256EFF` (Electric Blue - brand identity for primary buttons, active states, sparklines, logo).
  - `secondary`: `#6B7280` (Neutral gray).
  - `success`: `#15A34A` | `warning`: `#F97316` | `danger`: `#DC2626`.
  - `surface`: `#FFFFFF` (Cards, modals, dropdowns, table containers).
  - `background`: `#F7F7F7` (Main canvas background).
  - `text`: `#1A1A1A` (Primary text, headings) | `textMuted`: `#71717A` (Descriptions, subtitles, meta labels).
  - `border`: `#E4E4E4` (Card borders, table dividers, strokes).
- **Styling Rules**:
  - Do not hardcode arbitrary hex colors when semantic utility classes exist (`bg-primary`, `text-text-muted`, `border-border-subtle`, etc.).
  - Maintain soft rounded corners: Use `rounded-lg` (12px) or `rounded-xl` (16px) for cards and containers. Avoid sharp right angles.
  - Use pill badges (`rounded-full`) with a status dot indicator for data status representation.
  - All icons must be imported from `lucide-react` (e.g. `import { Plus, Search } from 'lucide-react'`).
  - Comply with WCAG 2.2 AA contrast standards and ensure explicit interactive states (`hover`, `active`, `focus-visible`, `disabled`, `loading`).

---

## 3. Project Directory Architecture

All created files must strictly follow this directory structure:

```text
src/
├── assets/             # Static assets (images, svg, fonts)
├── components/
│   ├── ui/             # shadcn/ui base atomic components (Button, Input, Badge, Modal, Card...)
│   └── common/         # Layout & shared components (Navbar, Sidebar, Header, PageWrapper...)
├── features/           # Business domain modules (auth, resources, dashboard, users...)
│   └── <feature>/
│       ├── components/ # Domain-specific sub-components
│       ├── hooks/      # Feature-specific custom hooks
│       ├── pages/      # Route pages for the feature
│       └── types/      # Type definitions for the feature
├── layouts/            # Layout shells (MainLayout, AuthLayout, DashboardLayout)
├── routes/             # Route definitions with React Router v7 (lazy loading)
├── services/           # Axios instance configuration, interceptors, API service functions
├── store/              # Domain-specific Zustand stores (useAuthStore, useResourceStore)
├── constants/          # Global constants, app route paths, status enums
├── utils/              # Pure utility functions (`cn.ts`, date formatting, validation, number formatting)
└── index.css           # Tailwind CSS v4 setup (@import 'tailwindcss' & @theme)
```

---

## 4. Coding Conventions & Best Practices

### React & Performance
- Follow the guidelines in the `react-best-practices` skill.
- **CRITICAL**: This project is a **Vite SPA (Client-side)**, NOT Next.js or React Server Components (RSC):
  - **DO NOT USE**: `next/dynamic`, `server-auth-actions`, Next.js `React.cache()`, or Server Actions.
  - **Code Splitting**: Use `React.lazy()` and `<Suspense fallback={<LoadingState />} />` for page-level routing.
  - Strictly enforce performance practices: Re-render optimization (`rerender-*`), JavaScript performance (`js-*`), and asynchronous waterfall elimination (`async-*`).

### Component Architecture & shadcn/ui
- Base components in `src/components/ui/` should follow the `shadcn/ui` composition pattern with `class-variance-authority` (cva) and the `cn()` utility.
- Use `lucide-react` exclusively for icons across components and features.

### TypeScript Strictness
- `tsconfig.app.json` enforces strict compiler flags: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`.
- Always define explicit TypeScript interfaces/types for Props, State, and API responses.
- Never use `any`. Prefer `unknown` with type narrowing if the type is undetermined.
- When importing types, use the syntax: `import type { ... } from '...'`.

### State & API Handling
- Handle server state and fetched data judiciously; avoid duplicating server responses in global stores unnecessarily.
- Separate Zustand stores by domain and use selectors to prevent redundant re-renders.
- Route all network calls through `src/services/` with unified error handling.

---

## 5. Verification & Quality Gates

Before finalizing any changes or feature additions, the AI Assistant must verify:
1. `npm run lint` passes with zero ESLint errors or warnings.
2. `npm run build` compiles cleanly without type errors (`tsc -b`).
3. Code is clean, modular, properly documented for complex logic, and does not alter unrelated existing files or comments.