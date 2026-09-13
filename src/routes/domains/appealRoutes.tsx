/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { assignedAppealsLoader } from '@/features/appeals/pages/assignedAppealsLoader';
import { myAppealsLoader } from '@/features/appeals/pages/myAppealsLoader';

const MyAppealsPage = lazy(() => import('@/features/appeals/pages/MyAppealsPage'));
const AssignedAppealsPage = lazy(() => import('@/features/appeals/pages/AssignedAppealsPage'));

export const appealRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.APPEALS,
    handle: {
      meta: {
        breadcrumb: 'Khiếu nại',
      },
    },
    children: [
      {
        index: true,
        element: <MyAppealsPage />,
        loader: myAppealsLoader,
        handle: {
          meta: {
            title: 'Khiếu nại của tôi',
            breadcrumb: 'Của tôi',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.ASSIGNED_APPEALS,
        element: <AssignedAppealsPage />,
        loader: assignedAppealsLoader,
        handle: {
          meta: {
            title: 'Tiếp nhận khiếu nại',
            breadcrumb: 'Được phân công',
          },
        },
      },
    ],
  },
];

export default appealRoutes;
