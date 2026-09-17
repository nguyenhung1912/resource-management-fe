/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTE_SEGMENTS } from '@/constants/path';

const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage'));

export const changePasswordRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.CHANGE_PASSWORD,

    element: <ChangePasswordPage />,

    handle: {
      meta: {
        title: 'Đổi mật khẩu',
        breadcrumb: 'Đổi mật khẩu',
      },
    },
  },
];

export default changePasswordRoutes;
