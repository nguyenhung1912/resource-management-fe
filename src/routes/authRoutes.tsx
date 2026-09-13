/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { AuthLayout } from '@/layouts/AuthLayout';
import { GuestRoute } from './guards/GuestRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTE_SEGMENTS.LOGIN,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
        handle: {
          meta: {
            title: 'Đăng nhập',
            breadcrumb: 'Đăng nhập',
          },
        },
      },
    ],
  },
];

export default authRoutes;
