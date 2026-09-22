/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  adminRoutes,
  appealRoutes,
  changePasswordRoutes,
  moderationRoutes,
  notificationRoutes,
  profileRoutes,
  reportRoutes,
  resourceRoutes,
  searchRoutes,
} from './domains';
import { ProtectedRoute } from './guards/ProtectedRoute';

const HomePage = lazy(() => import('@/App'));
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
        element: <HomePage />,
        handle: {
          meta: {
            title: 'Trang chủ',
            breadcrumb: 'Trang chủ',
          },
        },
      },
      ...resourceRoutes,
      ...searchRoutes,
      ...moderationRoutes,
      ...reportRoutes,
      ...adminRoutes,
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: serverErrorElement,
    children: [...appealRoutes, ...profileRoutes, ...notificationRoutes, ...changePasswordRoutes],
  },
];

export default dashboardRoutes;
