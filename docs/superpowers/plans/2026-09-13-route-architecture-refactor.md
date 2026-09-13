# Route Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the React Router v7 route tree to use one path source, lazy-load every page with a shared Suspense boundary, and isolate route tests without changing existing implemented URLs.

**Architecture:** Relative `ROUTE_SEGMENTS` define nested route structure and compose absolute `APP_PATHS` for navigation. Focused main, dashboard, and error route modules own page-level lazy imports while eager layouts provide persistent shells. `src/routes/index.tsx` only composes route arrays and creates the browser router.

**Tech Stack:** React 19, TypeScript 6 strict mode, React Router DOM 7, Vite 8, Vitest 4, Testing Library

**Spec:** `docs/superpowers/specs/2026-09-13-route-architecture-design.md`

## Global Constraints

- This is a Vite client-side SPA, not Next.js or React Server Components.
- Use `React.lazy` and `Suspense` for every page-level route; keep layouts eager.
- Keep route loaders outside components and never fetch remote data in `useEffect`.
- Use no `any`; use type-only imports where required by `verbatimModuleSyntax`.
- Preserve all currently implemented public URLs.
- Keep `/dashboard` and `/login` reserved without implementing their future pages.
- Do not add dependencies.
- Run `npm.cmd test -- --run`, `npm.cmd run lint`, and `npm.cmd run build` before completion.

## File structure

- Create `src/routes/RouteSuspense.tsx`: shared page-level Suspense boundary.
- Create `src/routes/__tests__/RouteSuspense.test.tsx`: fallback and resolution behavior.
- Create `src/routes/mainRoutes.tsx`: eager `MainLayout`, lazy home/notification/appeal pages, and loader error UI.
- Create `src/routes/dashboardRoutes.tsx`: eager `DashboardLayout` and lazy resource pages.
- Modify `src/routes/errorRoutes.tsx`: eager `ErrorLayout` and lazy error pages.
- Modify `src/routes/index.tsx`: compose route modules and create the router only.
- Modify `src/constants/path.ts`: export relative segments and derived absolute paths.
- Modify `src/routes/__tests__/errorRoutes.test.tsx`: use an isolated memory router per test.
- Modify `src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`: navigate through `APP_PATHS`.
- Create `src/routes/__tests__/routeConfiguration.test.tsx`: route matching and loader-error coverage.
- Delete `src/routes/dashboard.tsx`, `src/routes/ResourceRouteElements.tsx`, `src/routes/privateRoute.ts`, and `src/routes/publicRoutes.ts` after their responsibilities are replaced.

---

### Task 1: Shared page Suspense boundary

**Files:**
- Create: `src/routes/RouteSuspense.tsx`
- Create: `src/routes/__tests__/RouteSuspense.test.tsx`

**Interfaces:**
- Consumes: `PageLoadingState`, `ReactNode`
- Produces: `RouteSuspense({ children }: { children: ReactNode }): JSX.Element`

- [ ] **Step 1: Write the failing Suspense behavior test**

```tsx
import { act, render, screen } from '@testing-library/react';
import { lazy, type ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { RouteSuspense } from '../RouteSuspense';

describe('RouteSuspense', () => {
  it('shows the shared loading state until the lazy page resolves', async () => {
    let resolvePage: ((module: { default: ComponentType }) => void) | undefined;
    const LazyPage = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          resolvePage = resolve;
        }),
    );

    render(
      <RouteSuspense>
        <LazyPage />
      </RouteSuspense>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải trang...');

    await act(async () => {
      resolvePage?.({ default: () => <h1>Lazy page loaded</h1> });
    });

    expect(await screen.findByRole('heading', { name: 'Lazy page loaded' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- --run src/routes/__tests__/RouteSuspense.test.tsx`

Expected: FAIL because `../RouteSuspense` does not exist.

- [ ] **Step 3: Implement the shared boundary**

```tsx
import { Suspense, type ReactNode } from 'react';
import { PageLoadingState } from '@/components/common/PageLoadingState';

interface RouteSuspenseProps {
  children: ReactNode;
}

export function RouteSuspense({ children }: RouteSuspenseProps) {
  return <Suspense fallback={<PageLoadingState />}>{children}</Suspense>;
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npm.cmd test -- --run src/routes/__tests__/RouteSuspense.test.tsx`

Expected: 1 test passes with no warnings.

- [ ] **Step 5: Commit**

```bash
git add src/routes/RouteSuspense.tsx src/routes/__tests__/RouteSuspense.test.tsx
git commit -m "feat: add shared route suspense boundary"
```

### Task 2: Single-source paths and main routes

**Files:**
- Modify: `src/constants/path.ts`
- Create: `src/routes/mainRoutes.tsx`
- Create: `src/routes/__tests__/routeConfiguration.test.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `RouteSuspense`, `MainLayout`, existing page modules and loaders
- Produces: `ROUTE_SEGMENTS`, derived `APP_PATHS`, and `mainRoutes: RouteObject[]`

- [ ] **Step 1: Write the failing main-route configuration test**

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, matchRoutes, RouterProvider, type RouteObject } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { mainRoutes } from '@/routes/mainRoutes';

vi.mock('@/services/signalRService', () => ({
  default: {
    start: vi.fn().mockResolvedValue(undefined),
    onReceiveNotification: vi.fn(() => vi.fn()),
    onUnreadCountChanged: vi.fn(() => vi.fn()),
  },
}));

describe('main route configuration', () => {
  it.each([
    APP_PATHS.HOME,
    APP_PATHS.NOTIFICATIONS,
    APP_PATHS.APPEALS,
    APP_PATHS.ASSIGNED_APPEALS,
  ])('matches %s', (path) => {
    expect(matchRoutes(mainRoutes, path)).not.toBeNull();
  });

  it('renders the server error page when a child loader throws', async () => {
    const rootRoute = mainRoutes[0];
    const routesWithFailure: RouteObject[] = [
      {
        ...rootRoute,
        children: rootRoute.children?.map((route) =>
          route.path === ROUTE_SEGMENTS.NOTIFICATIONS
            ? {
                ...route,
                loader: () => {
                  throw new Error('loader failed');
                },
              }
            : route,
        ),
      },
    ];
    const router = createMemoryRouter(routesWithFailure, {
      initialEntries: [APP_PATHS.NOTIFICATIONS],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- --run src/routes/__tests__/routeConfiguration.test.tsx`

Expected: FAIL because `@/routes/mainRoutes` does not exist.

- [ ] **Step 3: Introduce relative route segments and derived absolute paths**

Replace `src/constants/path.ts` with:

```ts
export const ROUTE_SEGMENTS = {
  LOGIN: 'login',
  NOTIFICATIONS: 'notifications',
  APPEALS: 'appeals',
  ASSIGNED_APPEALS: 'assigned',
  DASHBOARD: 'dashboard',
  RESOURCES_MANAGER: 'resources-manager',
  RESOURCE_UPLOAD: 'upload',
  UNAUTHORIZED: '401',
  FORBIDDEN: '403',
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
} as const;

export const APP_PATHS = {
  HOME: '/',
  LOGIN: `/${ROUTE_SEGMENTS.LOGIN}`,
  NOTIFICATIONS: `/${ROUTE_SEGMENTS.NOTIFICATIONS}`,
  APPEALS: `/${ROUTE_SEGMENTS.APPEALS}`,
  ASSIGNED_APPEALS: `/${ROUTE_SEGMENTS.APPEALS}/${ROUTE_SEGMENTS.ASSIGNED_APPEALS}`,
  DASHBOARD: `/${ROUTE_SEGMENTS.DASHBOARD}`,
  RESOURCES_MANAGER: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.RESOURCES_MANAGER}`,
  RESOURCE_UPLOAD: `/${ROUTE_SEGMENTS.DASHBOARD}/${ROUTE_SEGMENTS.RESOURCES_MANAGER}/${ROUTE_SEGMENTS.RESOURCE_UPLOAD}`,
  UNAUTHORIZED: `/${ROUTE_SEGMENTS.UNAUTHORIZED}`,
  FORBIDDEN: `/${ROUTE_SEGMENTS.FORBIDDEN}`,
  NOT_FOUND: `/${ROUTE_SEGMENTS.NOT_FOUND}`,
  SERVER_ERROR: `/${ROUTE_SEGMENTS.SERVER_ERROR}`,
} as const;
```

This intentionally removes `APP_PATHS.RESOURCES`.

- [ ] **Step 4: Create the focused main route module**

Create `src/routes/mainRoutes.tsx` with module-scope lazy imports:

```tsx
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { assignedAppealsLoader } from '@/features/appeals/pages/assignedAppealsLoader';
import { myAppealsLoader } from '@/features/appeals/pages/myAppealsLoader';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteSuspense } from './RouteSuspense';

const HomePage = lazy(() => import('@/App'));
const NotificationCenterPage = lazy(() => import('@/features/notifications/pages/NotificationCenterPage'));
const MyAppealsPage = lazy(() => import('@/features/appeals/pages/MyAppealsPage'));
const AssignedAppealsPage = lazy(() => import('@/features/appeals/pages/AssignedAppealsPage'));
const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage })),
);

const serverErrorElement = (
  <RouteSuspense>
    <ServerErrorPage />
  </RouteSuspense>
);

export const mainRoutes: RouteObject[] = [
  {
    path: APP_PATHS.HOME,
    element: <MainLayout />,
    errorElement: serverErrorElement,
    children: [
      {
        index: true,
        element: <RouteSuspense><HomePage /></RouteSuspense>,
      },
      {
        path: ROUTE_SEGMENTS.NOTIFICATIONS,
        element: <RouteSuspense><NotificationCenterPage /></RouteSuspense>,
        loader: notificationsLoader,
      },
      {
        path: ROUTE_SEGMENTS.APPEALS,
        element: <RouteSuspense><MyAppealsPage /></RouteSuspense>,
        loader: myAppealsLoader,
      },
      {
        path: `${ROUTE_SEGMENTS.APPEALS}/${ROUTE_SEGMENTS.ASSIGNED_APPEALS}`,
        element: <RouteSuspense><AssignedAppealsPage /></RouteSuspense>,
        loader: assignedAppealsLoader,
      },
    ],
  },
];
```

Format multiline JSX with Prettier after implementation.

- [ ] **Step 5: Reduce the router entry point to composition**

Update `src/routes/index.tsx` to:

```tsx
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { dashboardRoutes } from './dashboard';
import { errorRoutes } from './errorRoutes';
import { mainRoutes } from './mainRoutes';

export const appRoutes: RouteObject[] = [...mainRoutes, ...dashboardRoutes, ...errorRoutes];

export const router = createBrowserRouter(appRoutes);

export default router;
```

Task 3 will replace the temporary `./dashboard` import with `./dashboardRoutes` after creating that module.

- [ ] **Step 6: Run focused tests and type-aware build**

Run: `npm.cmd test -- --run src/routes/__tests__/routeConfiguration.test.tsx src/routes/__tests__/RouteSuspense.test.tsx`

Expected: route tests pass.

Run: `npm.cmd run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 7: Commit**

```bash
git add src/constants/path.ts src/routes/index.tsx src/routes/mainRoutes.tsx src/routes/__tests__/routeConfiguration.test.tsx
git commit -m "refactor: centralize main route paths"
```

### Task 3: Dashboard route module and lazy resource pages

**Files:**
- Create: `src/routes/dashboardRoutes.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`
- Modify: `src/routes/__tests__/routeConfiguration.test.tsx`
- Delete: `src/routes/dashboard.tsx`
- Delete: `src/routes/ResourceRouteElements.tsx`

**Interfaces:**
- Consumes: `ROUTE_SEGMENTS`, `APP_PATHS`, `RouteSuspense`, `DashboardLayout`
- Produces: `dashboardRoutes: RouteObject[]`

- [ ] **Step 1: Add failing dashboard route-match coverage**

Append to `routeConfiguration.test.tsx`:

```tsx
import { dashboardRoutes } from '@/routes/dashboardRoutes';

describe('dashboard route configuration', () => {
  it.each([APP_PATHS.DASHBOARD, APP_PATHS.RESOURCES_MANAGER, APP_PATHS.RESOURCE_UPLOAD])(
    'matches %s',
    (path) => {
      expect(matchRoutes(dashboardRoutes, path)).not.toBeNull();
    },
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- --run src/routes/__tests__/routeConfiguration.test.tsx`

Expected: FAIL because `@/routes/dashboardRoutes` does not exist.

- [ ] **Step 3: Create the dashboard route module**

```tsx
import { lazy, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RouteSuspense } from './RouteSuspense';

const ResourcesManagerPage = lazy(() => import('@/features/resources/pages/ResourcesManagerPage'));
const UploadResourcePage = lazy(() => import('@/features/resources/pages/UploadResourcePage'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      {
        path: ROUTE_SEGMENTS.RESOURCES_MANAGER,
        element: <RouteSuspense><ResourcesManagerPage /></RouteSuspense>,
        children: [
          {
            path: ROUTE_SEGMENTS.RESOURCE_UPLOAD,
            element: <RouteSuspense><UploadResourcePage /></RouteSuspense>,
          },
        ],
      },
    ],
  },
];
```

- [ ] **Step 4: Switch composition and remove obsolete wrappers**

Update `src/routes/index.tsx` to import `./dashboardRoutes`. Delete `dashboard.tsx` and `ResourceRouteElements.tsx` only after no imports reference them.

- [ ] **Step 5: Replace resource test navigation literals with public paths**

In `resourcesManagerRoutes.test.tsx`, import `APP_PATHS` and use:

```tsx
createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCES_MANAGER] });
createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] });
expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER);
```

Keep the literal `href` assertion if it serves as an independent public-URL expectation; do not calculate both expected and actual values with the same helper.

- [ ] **Step 6: Run dashboard and resource route tests**

Run: `npm.cmd test -- --run src/routes/__tests__/routeConfiguration.test.tsx src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: all focused tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/routes/index.tsx src/routes/dashboardRoutes.tsx src/routes/__tests__/routeConfiguration.test.tsx src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx
git add -u src/routes/dashboard.tsx src/routes/ResourceRouteElements.tsx
git commit -m "refactor: organize dashboard routes"
```

### Task 4: Lazy error routes and isolated route tests

**Files:**
- Modify: `src/routes/errorRoutes.tsx`
- Modify: `src/routes/__tests__/errorRoutes.test.tsx`

**Interfaces:**
- Consumes: `ROUTE_SEGMENTS`, `RouteSuspense`, `ErrorLayout`, named exports from `ErrorPages.tsx`
- Produces: lazy explicit error routes and wildcard Not Found behavior

- [ ] **Step 1: Rewrite each error test to own its router**

Replace the shared browser router usage with:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
```

Use `renderRoute(path)` inside each test. Use `APP_PATHS.UNAUTHORIZED`, `APP_PATHS.FORBIDDEN`, `APP_PATHS.NOT_FOUND`, and `APP_PATHS.SERVER_ERROR` as inputs. Keep `/duong-dan-khong-ton-tai` literal because it is deliberately outside the route constants.

- [ ] **Step 2: Run the existing behavior tests as a safety baseline**

Run: `npm.cmd test -- --run src/routes/__tests__/errorRoutes.test.tsx`

Expected: explicit error routes and catch-all still pass with isolated routers.

- [ ] **Step 3: Convert error pages to lazy page elements**

Update `errorRoutes.tsx`:

```tsx
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { ErrorLayout } from '@/layouts/ErrorLayout';
import { RouteSuspense } from './RouteSuspense';

const UnauthorizedPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.UnauthorizedPage })),
);
const ForbiddenPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ForbiddenPage })),
);
const NotFoundPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.NotFoundPage })),
);
const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage })),
);

function suspense(page: ReactNode) {
  return <RouteSuspense>{page}</RouteSuspense>;
}

export const errorRoutes: RouteObject[] = [
  {
    element: <ErrorLayout />,
    children: [
      { path: ROUTE_SEGMENTS.UNAUTHORIZED, element: suspense(<UnauthorizedPage />) },
      { path: ROUTE_SEGMENTS.FORBIDDEN, element: suspense(<ForbiddenPage />) },
      { path: ROUTE_SEGMENTS.NOT_FOUND, element: suspense(<NotFoundPage />) },
      { path: ROUTE_SEGMENTS.SERVER_ERROR, element: suspense(<ServerErrorPage />) },
      { path: '*', element: suspense(<NotFoundPage />) },
    ],
  },
];
```

- [ ] **Step 4: Run error and route configuration tests**

Run: `npm.cmd test -- --run src/routes/__tests__/errorRoutes.test.tsx src/routes/__tests__/routeConfiguration.test.tsx`

Expected: all explicit error pages, wildcard behavior, and loader error boundary pass.

- [ ] **Step 5: Commit**

```bash
git add src/routes/errorRoutes.tsx src/routes/__tests__/errorRoutes.test.tsx
git commit -m "refactor: lazy load error routes"
```

### Task 5: Remove dead route files and audit route literals

**Files:**
- Delete: `src/routes/privateRoute.ts`
- Delete: `src/routes/publicRoutes.ts`

**Interfaces:**
- Consumes: completed route modules from Tasks 2–4
- Produces: route directory with no unused placeholder modules or duplicate path definitions

- [ ] **Step 1: Verify empty files have no consumers**

Run:

```powershell
rg -n "privateRoute|publicRoutes" src
```

Expected: no import or runtime usage.

- [ ] **Step 2: Delete only the confirmed empty files**

Delete `src/routes/privateRoute.ts` and `src/routes/publicRoutes.ts` with `apply_patch`.

- [ ] **Step 3: Audit route definitions and obsolete path entries**

Run:

```powershell
rg -n "path:\s*['\"]" src/routes
rg -n "APP_PATHS\.RESOURCES\b" src
rg -n "ResourceRouteElements|from './dashboard'" src
```

Expected:

- Literal `path: '*'` is the only intentional route-definition literal.
- No `APP_PATHS.RESOURCES` usage remains.
- No obsolete dashboard or resource wrapper imports remain.

- [ ] **Step 4: Run all route-focused tests**

Run: `npm.cmd test -- --run src/routes src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: all route-focused tests pass.

- [ ] **Step 5: Commit**

```bash
git add -u src/routes/privateRoute.ts src/routes/publicRoutes.ts
git commit -m "chore: remove obsolete route modules"
```

### Task 6: Full verification and lazy-chunk audit

**Files:**
- Modify: none unless verification exposes a defect caused by this refactor

**Interfaces:**
- Consumes: all completed route refactor tasks
- Produces: verified application and build evidence

- [ ] **Step 1: Run the complete test suite**

Run: `npm.cmd test -- --run`

Expected: all test files pass with zero failures and warnings.

- [ ] **Step 2: Run ESLint**

Run: `npm.cmd run lint`

Expected: exit code 0 with zero errors and warnings.

- [ ] **Step 3: Run the production build**

Run: `npm.cmd run build`

Expected: TypeScript compilation and Vite build both exit 0.

- [ ] **Step 4: Inspect emitted page chunks**

Confirm the build output contains separate lazy chunks for the implemented pages, including Home, Notifications, Appeals, Assigned Appeals, Resources Manager, Upload Resource, and Error Pages. Layouts may remain in an eager application or vendor chunk.

- [ ] **Step 5: Check the final diff and repository state**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only the intended route refactor files are pending.

- [ ] **Step 6: Commit any final verification-only corrections**

If and only if verification required a scoped correction:

```bash
git add <exact corrected files>
git commit -m "fix: complete route architecture refactor"
```

Do not create an empty commit.
