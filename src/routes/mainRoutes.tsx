/* eslint-disable react-refresh/only-export-components */
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
        element: (
          <RouteSuspense>
            <HomePage />
          </RouteSuspense>
        ),
      },
      {
        path: ROUTE_SEGMENTS.NOTIFICATIONS,
        element: (
          <RouteSuspense>
            <NotificationCenterPage />
          </RouteSuspense>
        ),
        loader: notificationsLoader,
      },
      {
        path: ROUTE_SEGMENTS.APPEALS,
        element: (
          <RouteSuspense>
            <MyAppealsPage />
          </RouteSuspense>
        ),
        loader: myAppealsLoader,
      },
      {
        path: `${ROUTE_SEGMENTS.APPEALS}/${ROUTE_SEGMENTS.ASSIGNED_APPEALS}`,
        element: (
          <RouteSuspense>
            <AssignedAppealsPage />
          </RouteSuspense>
        ),
        loader: assignedAppealsLoader,
      },
    ],
  },
];
