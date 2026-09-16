/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { reportsLoader } from '@/features/reports/pages/reportsLoader';
import { RoleGuard } from '../guards/RoleGuard';

const ReportsManagerPage = lazy(() => import('@/features/reports/pages/ReportsManagerPage'));

export const reportRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.REPORTS,
    element: <RoleGuard allowedRoles={['Admin', 'Lecturer']} />,
    handle: {
      meta: {
        title: 'Quản lý báo cáo vi phạm',
        breadcrumb: 'Báo cáo vi phạm',
      },
    },
    children: [
      {
        index: true,
        element: <ReportsManagerPage />,
        loader: reportsLoader,
        handle: {
          meta: {
            title: 'Quản lý báo cáo vi phạm',
            breadcrumb: 'Báo cáo vi phạm',
          },
        },
      },
    ],
  },
];

export default reportRoutes;
