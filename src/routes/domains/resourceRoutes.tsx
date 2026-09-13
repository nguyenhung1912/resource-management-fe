/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';

const ResourcesManagerPage = lazy(() => import('@/features/resources/pages/ResourcesManagerPage'));
const UploadResourcePage = lazy(() => import('@/features/resources/pages/UploadResourcePage'));

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
    ],
  },
];

export default resourceRoutes;
