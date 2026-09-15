/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import { moderationDetailLoader } from '@/features/moderation/pages/moderationDetailLoader';
import { RoleGuard } from '../guards/RoleGuard';

const DocumentModerationDetailPage = lazy(() => import('@/features/moderation/pages/DocumentModerationDetailPage'));

export const moderationRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.MODERATION,
    element: <RoleGuard allowedRoles={['Admin', 'Lecturer']} />,
    handle: {
      meta: {
        breadcrumb: 'Kiểm duyệt',
      },
    },
    children: [
      {
        path: ROUTE_PARAMS.FILE_ID,
        element: <DocumentModerationDetailPage />,
        loader: moderationDetailLoader,
        handle: {
          meta: {
            title: 'Chi tiết kiểm duyệt tài liệu',
            breadcrumb: 'Chi tiết tài liệu',
          },
        },
      },
    ],
  },
];

export default moderationRoutes;
