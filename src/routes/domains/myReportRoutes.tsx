/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { myReportsLoader } from '@/features/reports/pages/myReportsLoader';

const MyReportsPage = lazy(() => import('@/features/reports/pages/MyReportsPage'));

export const myReportRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.MY_REPORTS,
    element: <MyReportsPage />,
    loader: myReportsLoader,
    handle: {
      meta: {
        title: 'Báo cáo vi phạm của tôi',
        breadcrumb: 'Báo cáo của tôi',
      },
    },
  },
];

export default myReportRoutes;
