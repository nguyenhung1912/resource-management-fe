/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';

const NotificationCenterPage = lazy(() => import('@/features/notifications/pages/NotificationCenterPage'));

export const notificationRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.NOTIFICATIONS,
    element: <NotificationCenterPage />,
    loader: notificationsLoader,
    handle: {
      meta: {
        title: 'Trung tâm thông báo',
        breadcrumb: 'Thông báo',
      },
    },
  },
];

export default notificationRoutes;
