# Route Architecture Refactor Design

**Date:** 2026-09-13  
**Status:** Approved in chat; awaiting written-spec review

## Context

The application uses React Router v7 in Data Mode through `createBrowserRouter`. The current route tree is valid, but URL values are duplicated between `src/constants/path.ts` and route definitions, route modules are organized inconsistently, and only some page components are lazy-loaded.

This refactor will establish a single source of truth for URL segments and absolute application paths, apply `React.lazy` and `Suspense` to every page-level route component, and keep route composition predictable without changing existing public URLs.

## Goals

- Remove duplicated literal route segments from route definitions.
- Preserve relative child paths for nested React Router routes.
- Keep absolute paths available for `Link`, `NavLink`, `navigate`, redirects, and HTTP interceptors.
- Lazy-load every page-level route component with a shared Suspense fallback.
- Keep layout components eagerly loaded so the application shell can render without an additional page chunk request.
- Keep loaders attached to route objects and preserve the existing no-fetch-in-`useEffect` rule.
- Give each route domain one focused route module.
- Make route tests isolated and deterministic.

## Non-goals

- Implementing the future Dashboard Home page.
- Implementing authentication or the future Login page.
- Changing existing URLs.
- Converting the Vite SPA to React Router Framework Mode or file-system routing.
- Replacing `React.lazy` with React Router `route.lazy`.
- Adding authorization behavior to the currently empty private/public route files.

## Decisions

### Page loading boundary

Every page used as a route element will be declared with `React.lazy` at module scope and rendered inside a shared `RouteSuspense` component. The fallback will be the existing `PageLoadingState` component.

The following page components will be lazy-loaded:

- Home (`App`)
- Notification Center
- My Appeals
- Assigned Appeals
- Resources Manager
- Upload Resource
- Unauthorized
- Forbidden
- Not Found
- Server Error

`MainLayout`, `DashboardLayout`, and `ErrorLayout` will remain eager. They are small route shells required to render navigation, outlets, and page framing.

### Path model

`src/constants/path.ts` will export two related objects:

- `ROUTE_SEGMENTS`: relative URL segments used in nested route definitions.
- `APP_PATHS`: absolute URLs composed from `ROUTE_SEGMENTS`, used by navigation and redirect code.

Representative shape:

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

The unused `APP_PATHS.RESOURCES` entry will be removed. `/dashboard` and `/login` remain reserved URLs. This refactor intentionally does not add their future pages.

### Route modules

The route directory will have these responsibilities:

```text
src/routes/
├── index.tsx                 # Compose route arrays and create the browser router
├── mainRoutes.tsx            # MainLayout: Home, Notifications, Appeals
├── dashboardRoutes.tsx       # DashboardLayout: resource routes
├── errorRoutes.tsx           # ErrorLayout: explicit errors and catch-all
└── RouteSuspense.tsx         # Shared Suspense boundary using PageLoadingState
```

`privateRoute.ts` and `publicRoutes.ts` will be deleted because they are empty and have no consumers. `ResourceRouteElements.tsx` will be deleted after its responsibility moves into `dashboardRoutes.tsx` and the shared `RouteSuspense` wrapper.

`src/routes/index.tsx` will not declare page components or loaders. It will export `appRoutes`, create `router` once outside the React tree, and export that router for `RouterProvider`.

### Route tree

The effective URLs remain:

```text
/
├── notifications
├── appeals
│   └── assigned
├── dashboard
│   └── resources-manager
│       └── upload
├── 401
├── 403
├── 404
└── 500
```

The Dashboard and Login URLs are reserved for later work:

- `/dashboard` renders `DashboardLayout` with an empty outlet until Dashboard Home is implemented.
- `/login` is represented by `APP_PATHS.LOGIN` but has no route until authentication is implemented. Navigation to it therefore continues to reach the catch-all page temporarily.

### Data loading

Existing loaders remain on the matching route objects:

- Notifications: `notificationsLoader`
- My Appeals: `myAppealsLoader`
- Assigned Appeals: `assignedAppealsLoader`

Loaders remain normal static imports in this refactor. This keeps route matching and loader execution explicit and avoids altering data behavior while page bundles are split.

### Route error handling

Routes with loaders will receive an `errorElement` that renders the existing Server Error page through the shared page-loading boundary. This prevents React Router's default error UI from appearing when a loader throws.

Explicit `/401`, `/403`, `/404`, and `/500` routes remain under `ErrorLayout`. The wildcard route continues to render Not Found.

## Testing strategy

- Keep existing route behavior tests for resource and error pages.
- Refactor error route tests to construct a new `createMemoryRouter(appRoutes)` for each test rather than mutating the shared browser router.
- Add route integration coverage for Home, Notifications, Appeals, Assigned Appeals, Resources Manager, Upload Resource, explicit error routes, and the catch-all route.
- Assert navigation behavior using public URLs from `APP_PATHS`; do not add tests that only mirror constant values.
- Verify that loader-backed pages still receive loader data through their route definitions.
- Use the production build output to verify that page-level dynamic imports create route chunks.

## Accessibility and loading behavior

- `PageLoadingState` remains the single visible fallback for page chunks.
- The fallback must expose its existing accessible loading status.
- Layout shells remain mounted while child page chunks load, avoiding a blank full-screen transition during in-app navigation.
- Error pages continue to use the dedicated `ErrorLayout` without the main application header.

## Migration sequence

1. Add route behavior tests that expose the current inconsistencies.
2. Introduce `ROUTE_SEGMENTS` and derive `APP_PATHS`.
3. Add `RouteSuspense` using `PageLoadingState`.
4. Extract `mainRoutes.tsx` from `index.tsx` and lazy-load its pages.
5. Refactor dashboard routes and lazy-load resource pages.
6. Refactor error routes and lazy-load error pages.
7. Add loader error elements.
8. Remove obsolete route files and the duplicated loading fallback.
9. Run the full test, lint, and production build gates.

## Acceptance criteria

- No route definition contains duplicated application URL strings when a matching `ROUTE_SEGMENTS` entry exists.
- Every page-level route component is loaded through `React.lazy` and rendered within `RouteSuspense`.
- Layout components remain eager.
- Existing URLs and rendered page behavior remain unchanged.
- `/dashboard` and `/login` remain intentionally unimplemented and documented as reserved.
- Loader-backed routes preserve their loaders and render the Server Error page when a loader throws.
- Empty and obsolete route files are removed.
- Each route test owns an isolated memory router.
- `npm run test -- --run`, `npm run lint`, and `npm run build` pass.
