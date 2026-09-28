/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import { moderationDetailLoader } from '@/features/moderation/pages/moderationDetailLoader';
import { moderationQueueLoader } from '@/features/moderation/pages/moderationQueueLoader';
import { plagiarismReportLoader } from '@/features/moderation/pages/plagiarismReportLoader';
import { RoleGuard } from '../guards/RoleGuard';

const DocumentModerationDetailPage = lazy(() => import('@/features/moderation/pages/DocumentModerationDetailPage'));
const PlagiarismReportPage = lazy(() => import('@/features/moderation/pages/PlagiarismReportPage'));
const ModerationQueuePage = lazy(() => import('@/features/moderation/pages/ModerationQueuePage'));

const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((m) => ({ default: m.ServerErrorPage })),
);

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
        index: true,
        element: <ModerationQueuePage />,
        loader: moderationQueueLoader,
        errorElement: <ServerErrorPage />,
        handle: {
          meta: {
            title: 'Hàng đợi kiểm duyệt',
            breadcrumb: 'Hàng đợi kiểm duyệt',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.PLAGIARISM_REPORTS,
        element: <PlagiarismReportPage />,
        loader: plagiarismReportLoader,
        errorElement: <ServerErrorPage />,
        handle: {
          meta: {
            title: 'Báo cáo Đạo văn AI',
            breadcrumb: 'Báo cáo Đạo văn AI',
          },
        },
      },
      {
        path: ROUTE_PARAMS.FILE_ID,
        element: <DocumentModerationDetailPage />,
        loader: moderationDetailLoader,
        errorElement: <ServerErrorPage />,
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
