/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';

import searchLoader from '@/features/resources/pages/searchLoader';
import { allResourcesLoader } from '@/features/digital-resources/all-resources/pages/allResourcesLoader';
import { sourceCodeLoader } from '@/features/digital-resources/source-code/pages/sourceCodeLoader';

const AllResourcesPage = lazy(() => import('@/features/digital-resources/all-resources/pages/AllResourcesPage'));
const SourceCodePage = lazy(() => import('@/features/digital-resources/source-code/pages/SourceCodePage'));

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.SEARCH,
    lazy: async () => {
      const { SearchHubPage } = await import('@/features/dashboard/pages/SearchHubPage');
      return { Component: SearchHubPage };
    },
    handle: {
      meta: {
        title: 'Tra cứu tài nguyên',
        breadcrumb: 'Tra cứu',
      },
    },
    loader: searchLoader,
  },
  {
    path: ROUTE_SEGMENTS.RESOURCES,
    // Trận địa của đồng đội: Trả lại route này cho AllResourcesPage và cắm ống allResourcesLoader của họ vào
    loader: allResourcesLoader,
    element: <AllResourcesPage />,
    handle: {
      meta: {
        title: 'Thư viện Tài nguyên Số',
        breadcrumb: 'Tất cả tài nguyên',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.SOURCE_CODE,
    loader: sourceCodeLoader,
    element: <SourceCodePage />,
    handle: {
      meta: {
        title: 'Kho Mã nguồn & Dự án mẫu',
        breadcrumb: 'Mã nguồn',
      },
    },
  },

  {
    path: ROUTE_SEGMENTS.LECTURES,
    element: <Navigate to={APP_PATHS.ALL_RESOURCES} replace />,
  },
  {
    path: ROUTE_SEGMENTS.THESES,
    element: <Navigate to={APP_PATHS.ALL_RESOURCES} replace />,
  },
  {
    path: ROUTE_SEGMENTS.COURSE_REPORTS,
    element: <Navigate to={APP_PATHS.ALL_RESOURCES} replace />,
  },
  {
    path: ROUTE_SEGMENTS.OTHER_RESOURCES,
    element: <Navigate to={APP_PATHS.ALL_RESOURCES} replace />,
  },
];

export default searchRoutes;
