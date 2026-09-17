/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { APP_PATHS } from '@/constants/path';
import { MainLayout } from '@/layouts/MainLayout';
import { appealRoutes, notificationRoutes, profileRoutes, changePasswordRoutes } from './domains';
import { ProtectedRoute } from './guards/ProtectedRoute';
import SearchResourcesPage from '@/features/resources/pages/SearchResourcesPage';
import searchLoader from '@/features/resources/pages/searchLoader';

const HomePage = lazy(() => import('@/App'));
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
      {
        path: '/test-ui',
        element: <SearchResourcesPage />,
        loader: searchLoader,
      },
    ],
  },
];

export default mainRoutes;
