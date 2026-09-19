/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { adminRoutes, moderationRoutes, profileRoutes, reportRoutes, resourceRoutes, searchRoutes } from './domains';
import { ProtectedRoute } from './guards/ProtectedRoute';

const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage })),
);

const serverErrorElement = (
  <Suspense fallback={<PageLoadingState />}>
    <ServerErrorPage />
  </Suspense>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: serverErrorElement,
    children: [
      {
        index: true,
        element: <Navigate to={APP_PATHS.RESOURCES_MANAGER} replace />,
      },
      ...resourceRoutes,
      ...searchRoutes,
      ...moderationRoutes,
      ...reportRoutes,
      ...adminRoutes,
      ...profileRoutes,
      ...adminRoutes,
    ],
  },
];

export default dashboardRoutes;
