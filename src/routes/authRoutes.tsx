/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTE_SEGMENTS } from '@/constants/path';
import { AuthLayout } from '@/layouts/AuthLayout';
import { GuestRoute } from './guards/GuestRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

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

      {
        path: ROUTE_SEGMENTS.FORGOT_PASSWORD,
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
        handle: {
          meta: {
            title: 'Quên mật khẩu',
            breadcrumb: 'Quên mật khẩu',
          },
        },
      },
    ],
  },
];

export default authRoutes;
