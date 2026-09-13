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
├── routes/             # React Router v7 configuration
│   ├── index.tsx       # Route composition hub and browser router creation
│   ├── mainRoutes.tsx  # MainLayout routes (Home, Notifications, Appeals)
│   ├── dashboardRoutes.tsx # DashboardLayout routes (Resources)
│   ├── errorRoutes.tsx # ErrorLayout routes and wildcard fallback
│   └── RouteSuspense.tsx # Shared Suspense boundary with PageLoadingState
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

### TypeScript Strictness (Zero `any` Tolerance)
- **ABSOLUTE PROHIBITION ON `any`**: Never use `any` under any circumstances. Every prop, state variable, function parameter, and API response must have an explicit interface or type.
- If the incoming data shape is truly dynamic or uncertain, use `unknown` paired with type narrowing or type guards.
- `tsconfig.app.json` enforces strict compiler flags: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`.
- When importing types, strictly use the syntax: `import type { ... } from '...'`.

### Data Fetching & API Rules (No Fetching in `useEffect`)
- **ABSOLUTE PROHIBITION ON API CALLS IN `useEffect`**: Strictly forbidden to call APIs or fetch remote data inside `useEffect` on component mount (eliminates render waterfalls, race conditions, boilerplate state, and React StrictMode double-invocations).
- **Initial page/route data**: MUST be fetched via **React Router v7 `loader` functions** and read via `useLoaderData()`.
- **User interactions & mutations**: MUST be initiated directly inside **event handlers** (`onClick`, `onSubmit`, `onChange`, etc.) or React Router actions.
- Route all network calls through `src/services/` with unified error handling.
- Separate Zustand stores by domain and use selectors to prevent redundant re-renders.

---

## 5. Route Architecture & Navigation Rules

The application uses **React Router v7 in Data Mode** (`createBrowserRouter`) with client-side code splitting. All route definitions must adhere strictly to the following architectural patterns:

### Path Centralization (`src/constants/path.ts`)
- **Single Source of Truth**: All URL paths and path segments must be centralized in `src/constants/path.ts`.
- **`ROUTE_SEGMENTS`**: Defines relative, unslashed path segments (e.g. `LOGIN: 'login'`, `RESOURCES_MANAGER: 'resources-manager'`). Used exclusively for nested route definitions in route modules.
- **`APP_PATHS`**: Defines absolute URLs composed from `ROUTE_SEGMENTS` (e.g. `RESOURCES_MANAGER: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.RESOURCES_MANAGER}``). Used for navigation (`Link`, `NavLink`, `navigate()`), redirects, API interceptors, and tests.
- **No Hardcoded Path Literals**: Never hardcode route strings in route definitions, components, or tests. The only permissible path literal is the wildcard catch-all (`path: '*'`).

### Modular Route Tree (`src/routes/`)
- **Domain-based Route Modules**: Route definitions are organized into focused modules grouped by layout shell:
  - `src/routes/mainRoutes.tsx`: Routes rendered inside `MainLayout` (Home, Notifications, Appeals).
  - `src/routes/dashboardRoutes.tsx`: Routes rendered inside `DashboardLayout` (Resource Management, Upload).
  - `src/routes/errorRoutes.tsx`: Explicit error pages (`/401`, `/403`, `/404`, `/500`) and the wildcard catch-all rendered inside `ErrorLayout`.
- **Composition Hub (`src/routes/index.tsx`)**:
  - Responsible solely for aggregating domain route arrays (`appRoutes = [...mainRoutes, ...dashboardRoutes, ...errorRoutes]`) and instantiating the browser router (`createBrowserRouter(appRoutes)`).
  - Must NOT declare page components, loaders, or inline JSX elements.

### Code Splitting & Suspense Boundaries
- **Page-Level Lazy Loading**: Every page-level component must be lazy-loaded at module scope using `React.lazy()` (e.g. `const HomePage = lazy(() => import('@/App'))`).
- **Shared Suspense Boundary**: Wrap all lazy-loaded page elements in `<RouteSuspense>` (`src/routes/RouteSuspense.tsx`), which renders the standardized `PageLoadingState` fallback.
- **Eager Layout Shells**: Layout components (`MainLayout`, `DashboardLayout`, `ErrorLayout`) must remain **eagerly loaded** (direct static imports). This ensures the application shell (header, sidebar, navigation) remains mounted without full-page loading flickers during child page transitions.
- **Named Exports**: For modules exporting multiple named page components (such as `ErrorPages.tsx`), use `.then((m) => ({ default: m.PageName }))` within `React.lazy()`.

### Route Data Loading & Error Handling
- **Loaders on Route Objects**: Attach data loaders directly to route objects (e.g. `loader: notificationsLoader`). Never fetch initial page data inside `useEffect`.
- **Loader Error Boundaries**: Every route declaring a data loader must provide an `errorElement` (rendering `<ServerErrorPage />` wrapped in `<RouteSuspense>`) to gracefully catch loader errors and prevent React Router's default error stack from exposing to users.

### Route Testing Standards
- **Isolated Memory Routers**: Route tests must never mutate or share a singleton browser router. Each test must instantiate its own isolated router using `createMemoryRouter(appRoutes, { initialEntries: [targetPath] })`.
- **Public URL Assertions**: Use `APP_PATHS` constants for navigation targets and URL assertions in tests rather than mirror values or duplicate strings.

---

## 6. Verification & Quality Gates

Before finalizing any changes or feature additions, the AI Assistant must verify:
1. `npm run lint` passes with zero ESLint errors or warnings.
2. `npm run build` compiles cleanly without type errors (`tsc -b`).
3. Code is clean, modular, properly documented for complex logic, and does not alter unrelated existing files or comments.