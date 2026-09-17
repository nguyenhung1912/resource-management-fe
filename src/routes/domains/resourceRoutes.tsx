/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import searchLoader from '@/features/resources/pages/searchLoader';

const ResourcesManagerPage = lazy(() => import('@/features/resources/pages/ResourcesManagerPage'));
const UploadResourcePage = lazy(() => import('@/features/resources/pages/UploadResourcePage'));
const ModifyResourcePage = lazy(() => import('@/features/resources/pages/ModifyResourcePage'));
const SearchResourcesPage = lazy(() => import('@/features/resources/pages/SearchResourcesPage'));

export const resourceRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.RESOURCES_MANAGER,
    element: <ResourcesManagerPage />,
    handle: {
      meta: {
        title: 'Quản lý tài nguyên',
        breadcrumb: 'Tài nguyên',
      },
    },
    children: [
      {
        path: ROUTE_SEGMENTS.RESOURCE_UPLOAD,
        element: <UploadResourcePage />,
        handle: {
          meta: {
            title: 'Tải lên tài nguyên',
            breadcrumb: 'Tải lên',
          },
        },
      },
      {
        path: `${ROUTE_PARAMS.RESOURCE_ID}/${ROUTE_SEGMENTS.RESOURCE_EDIT}`,
        element: <ModifyResourcePage />,
        handle: {
          meta: {
            title: 'Chỉnh sửa tài nguyên',
            breadcrumb: 'Chỉnh sửa',
          },
        },
      },
      {
        path: ROUTE_SEGMENTS.SEARCH,
        element: <SearchResourcesPage />,
        loader: searchLoader,
      },
    ],
  },
];

export default resourceRoutes;
