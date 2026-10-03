/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { APP_PATHS } from '@/constants/path';
import { homeLoader } from '@/features/home/pages/homeLoader';
import { MainLayout } from '@/layouts/MainLayout';
import { appealRoutes, notificationRoutes, profileRoutes, changePasswordRoutes } from './domains';
import { ProtectedRoute } from './guards/ProtectedRoute';
// import SearchHubPage from '@/features/dashboard/pages/SearchHubPage';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage })),
);

const serverErrorElement = (
  <Suspense fallback={<PageLoadingState />}>
    <ServerErrorPage />
  </Suspense>
);

export const mainRoutes: RouteObject[] = [
  {
    path: APP_PATHS.HOME,
    element: <MainLayout />,
    errorElement: serverErrorElement,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <HomePage />,
        handle: {
          meta: {
            title: 'Trang chủ',
            breadcrumb: 'Trang chủ',
          },
        },
      },
      {
        element: <ProtectedRoute />,
        children: [...notificationRoutes, ...appealRoutes, ...profileRoutes, ...changePasswordRoutes],
      },
      // {
      //   path: ROUTE_SEGMENTS.SEARCH,
      //       element: <SearchHubPage />,
      //       handle: {
      //         meta: {
      //           title: 'Tra cứu tài nguyên',
      //           breadcrumb: 'Tra cứu',
      //         },
      //       },
      // }
    ],
  },
];

export default mainRoutes;
