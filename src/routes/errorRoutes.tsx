/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { ErrorLayout } from '@/layouts/ErrorLayout';

const UnauthorizedPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.UnauthorizedPage })),
);
const ForbiddenPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ForbiddenPage })),
);
const NotFoundPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.NotFoundPage })),
);
const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage })),
);

export const errorRoutes: RouteObject[] = [
  {
    element: <ErrorLayout />,
    children: [
      {
        path: ROUTE_SEGMENTS.UNAUTHORIZED,
        element: <UnauthorizedPage />,
        handle: { meta: { title: 'Lỗi 401 - Chưa xác thực' } },
      },
      {
        path: ROUTE_SEGMENTS.FORBIDDEN,
        element: <ForbiddenPage />,
        handle: { meta: { title: 'Lỗi 403 - Không có quyền truy cập' } },
      },
      {
        path: ROUTE_SEGMENTS.NOT_FOUND,
        element: <NotFoundPage />,
        handle: { meta: { title: 'Lỗi 404 - Không tìm thấy trang' } },
      },
      {
        path: ROUTE_SEGMENTS.SERVER_ERROR,
        element: <ServerErrorPage />,
        handle: { meta: { title: 'Lỗi 500 - Lỗi hệ thống' } },
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { meta: { title: 'Lỗi 404 - Không tìm thấy trang' } },
      },
    ],
  },
];
