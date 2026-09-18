/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { RoleGuard } from '../guards/RoleGuard';

const PlaceholderFeaturePage = lazy(() => import('@/features/dashboard/pages/PlaceholderFeaturePage'));

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.ADMIN,
    element: <RoleGuard allowedRoles={['Admin', 'Lecturer']} />,
    handle: {
      meta: {
        title: 'Quản trị hệ thống',
        breadcrumb: 'Quản trị',
      },
    },
    children: [
      {
        path: ROUTE_SEGMENTS.USERS,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <PlaceholderFeaturePage
              title="Quản lý Người dùng"
              description="Xem và quản lý danh sách tài khoản sinh viên, giảng viên và quản trị viên."
            />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Quản lý Người dùng',
            breadcrumb: 'Người dùng',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.FUNCTIONS,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <PlaceholderFeaturePage
              title="Phân quyền Chức năng"
              description="Quản lý ma trận phân quyền và gán chức năng cho từng vai trò trong hệ thống."
            />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Phân quyền chức năng',
            breadcrumb: 'Phân quyền',
          },
        },
      },
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
      {
        path: ROUTE_SEGMENTS.ACADEMIC,
        element: (
          <PlaceholderFeaturePage
            title="Quản lý Học vụ"
            description="Quản lý thông tin khoa, ngành đào tạo, học kỳ và học phần giảng dạy."
          />
        ),
        handle: {
          meta: {
            title: 'Quản lý học vụ',
            breadcrumb: 'Học vụ',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.AUDIT_LOGS,
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <PlaceholderFeaturePage
              title="Nhật ký Lưu vết (Audit Logs)"
              description="Ghi nhận nhật ký truy vết đăng nhập, thao tác người dùng và kiểm toán an ninh."
            />
          </RoleGuard>
        ),
        handle: {
          meta: {
            title: 'Nhật ký lưu vết',
            breadcrumb: 'Nhật ký lưu vết',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.STATISTICS,
        element: (
          <PlaceholderFeaturePage
            title="Thống kê Học liệu"
            description="Tổng hợp biểu đồ xuất bản học liệu, lượt tải về và báo cáo tỷ lệ đạo văn AI."
          />
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
