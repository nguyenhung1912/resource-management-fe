/* eslint-disable react-refresh/only-export-components */
import { lazy, type ReactNode } from 'react';
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
      {
        path: ROUTE_SEGMENTS.UNAUTHORIZED,
        element: suspense(<UnauthorizedPage />),
      },
      {
        path: ROUTE_SEGMENTS.FORBIDDEN,
        element: suspense(<ForbiddenPage />),
      },
      {
        path: ROUTE_SEGMENTS.NOT_FOUND,
        element: suspense(<NotFoundPage />),
      },
      {
        path: ROUTE_SEGMENTS.SERVER_ERROR,
        element: suspense(<ServerErrorPage />),
      },
      {
        path: '*',
        element: suspense(<NotFoundPage />),
      },
    ],
  },
];
