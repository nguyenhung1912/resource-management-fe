/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { APP_PATHS, ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import { moderationDetailLoader } from '@/features/moderation/pages/moderationDetailLoader';
import { plagiarismReportLoader } from '@/features/moderation/pages/plagiarismReportLoader';
import { RoleGuard } from '../guards/RoleGuard';

const DocumentModerationDetailPage = lazy(() => import('@/features/moderation/pages/DocumentModerationDetailPage'));
const PlagiarismReportPage = lazy(() => import('@/features/moderation/pages/PlagiarismReportPage'));

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
        element: <Navigate to={APP_PATHS.PLAGIARISM_REPORTS} replace />,
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
