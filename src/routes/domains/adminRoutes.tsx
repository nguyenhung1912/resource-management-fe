/* eslint-disable react-refresh/only-export-components */

import { lazy } from 'react';

import type { RouteObject } from 'react-router-dom';

import { adminAccountsLoader } from '@/features/admin/accounts/pages/adminAccountsLoader';

import { adminRolesLoader } from '@/features/admin/roles/pages/adminRolesLoader';

import { adminPermissionsLoader } from '@/features/admin/permissions/pages/adminPermissionsLoader';
import { ROUTE_SEGMENTS } from '@/constants/path';

const AdminAccountsPage = lazy(() => import('@/features/admin/accounts/pages/AdminAccountsPage'));

const AdminRolesPage = lazy(() => import('@/features/admin/roles/pages/AdminRolesPage'));

const AdminPermissionsPage = lazy(() => import('@/features/admin/permissions/pages/AdminPermissionsPage'));

export const adminRoutes: RouteObject[] = [
  {
    path: `${ROUTE_SEGMENTS.ADMIN}/${ROUTE_SEGMENTS.USERS}`,

    loader: adminAccountsLoader,

    element: <AdminAccountsPage />,

    handle: {
      meta: {
        title: 'Quản lý tài khoản',

        breadcrumb: 'Quản lý tài khoản',
      },
    },
  },

  {
    path: `${ROUTE_SEGMENTS.ADMIN}/${ROUTE_SEGMENTS.ROLES}`,

    loader: adminRolesLoader,

    element: <AdminRolesPage />,

    handle: {
      meta: {
        title: 'Quản lý Role',

        breadcrumb: 'Quản lý Role',
      },
    },
  },

  {
    path: `${ROUTE_SEGMENTS.ADMIN}/${ROUTE_SEGMENTS.FUNCTIONS}`,

    loader: adminPermissionsLoader,

    element: <AdminPermissionsPage />,

    handle: {
      meta: {
        title: 'Phân quyền chức năng',

        breadcrumb: 'Phân quyền chức năng',
      },
    },
  },
];

export default adminRoutes;
