/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { APP_PATHS, ROUTE_SEGMENTS } from '@/constants/path';
import { searchHubLoader } from '@/features/dashboard/pages/searchHubLoader';
import { allResourcesLoader } from '@/features/digital-resources/all-resources/pages/allResourcesLoader';
import { sourceCodeLoader } from '@/features/digital-resources/source-code/pages/sourceCodeLoader';

const SearchHubPage = lazy(() => import('@/features/dashboard/pages/SearchHubPage'));
const AllResourcesPage = lazy(() => import('@/features/digital-resources/all-resources/pages/AllResourcesPage'));
const SourceCodePage = lazy(() => import('@/features/digital-resources/source-code/pages/SourceCodePage'));

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.SEARCH,
    loader: searchHubLoader,
    element: <SearchHubPage />,
    handle: {
      meta: {
        title: 'Trung tâm Tra cứu Tài nguyên Số',
        breadcrumb: 'Tra cứu tài nguyên',
      },
    },
  },
  {
    path: ROUTE_SEGMENTS.RESOURCES,
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
  // Deep-linking backwards compatibility: Redirect legacy category routes to the centralized digital library
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
