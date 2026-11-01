/* eslint-disable react-refresh/only-export-components */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTE_SEGMENTS } from '@/constants/path';

import { adminAccountsLoader } from '@/features/admin/accounts/pages/adminAccountsLoader';
import { adminRolesLoader } from '@/features/admin/roles/pages/adminRolesLoader';
import { adminPermissionsLoader } from '@/features/admin/permissions/pages/adminPermissionsLoader';
import { academicManagementLoader } from '@/features/admin/academic/pages/academicManagementLoader';
import { auditLogsLoader } from '@/features/admin/audit-logs/pages/auditLogsLoader';

import { RoleGuard } from '../guards/RoleGuard';

const AdminAccountsPage = lazy(() => import('@/features/admin/accounts/pages/AdminAccountsPage'));

const AdminRolesPage = lazy(() => import('@/features/admin/roles/pages/AdminRolesPage'));

const AdminPermissionsPage = lazy(() => import('@/features/admin/permissions/pages/AdminPermissionsPage'));

const AcademicManagementPage = lazy(() => import('@/features/admin/academic/pages/AcademicManagementPage'));

const AuditLogsPage = lazy(() => import('@/features/admin/audit-logs/pages/AuditLogsPage'));

const PlaceholderFeaturePage = lazy(() => import('@/features/home/pages/PlaceholderFeaturePage'));

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.ADMIN,
    handle: {
      meta: {
        title: 'Quản trị hệ thống',
        breadcrumb: 'Quản trị',
      },
    },
    children: [
      // F010 - Quản lý người dùng
      {
        path: ROUTE_SEGMENTS.USERS,
        loader: adminAccountsLoader,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AdminAccountsPage />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Quản lý người dùng',
            breadcrumb: 'Người dùng',
          },
        },
      },

      // F012 - Quản lý Role
      {
        path: ROUTE_SEGMENTS.ROLES,
        loader: adminRolesLoader,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AdminRolesPage />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Quản lý Role',
            breadcrumb: 'Role',
          },
        },
      },

      // F013 - Phân quyền chức năng
      {
        path: ROUTE_SEGMENTS.FUNCTIONS,
        loader: adminPermissionsLoader,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AdminPermissionsPage />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Phân quyền chức năng',
            breadcrumb: 'Phân quyền',
          },
        },
      },

      // Cấu hình chức năng hệ thống
      {
        path: ROUTE_SEGMENTS.SYSTEM_FUNCTIONS,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <PlaceholderFeaturePage
              title="Cấu hình Chức năng Hệ thống"
              description="Danh mục các module nghiệp vụ và tham số cấu hình hệ thống."
            />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Chức năng hệ thống',
            breadcrumb: 'Chức năng',
          },
        },
      },

      // Quản lý học vụ
      {
        path: ROUTE_SEGMENTS.ACADEMIC,
        loader: academicManagementLoader,
        element: (
          <RoleGuard allowedRoles={['Admin', 'Lecturer']}>
            <AcademicManagementPage />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Quản lý học vụ',
            breadcrumb: 'Học vụ',
          },
        },
      },

      // Nhật ký lưu vết
      {
        path: ROUTE_SEGMENTS.AUDIT_LOGS,
        loader: auditLogsLoader,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AuditLogsPage />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Nhật ký lưu vết',
            breadcrumb: 'Nhật ký lưu vết',
          },
        },
      },

      // Thống kê
      {
        path: ROUTE_SEGMENTS.STATISTICS,
        element: (
          <RoleGuard allowedRoles={['Admin', 'Lecturer']}>
            <PlaceholderFeaturePage
              title="Thống kê Học liệu"
              description="Tổng hợp biểu đồ xuất bản học liệu, lượt tải về và báo cáo tỷ lệ đạo văn AI."
            />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Thống kê học liệu',
            breadcrumb: 'Thống kê',
          },
        },
      },
    ],
  },
];

export default adminRoutes;
