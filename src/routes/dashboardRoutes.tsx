/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_SEGMENTS } from '@/constants/path';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RouteSuspense } from './RouteSuspense';

const ResourcesManagerPage = lazy(() => import('@/features/resources/pages/ResourcesManagerPage'));
const UploadResourcePage = lazy(() => import('@/features/resources/pages/UploadResourcePage'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      {
        path: ROUTE_SEGMENTS.RESOURCES_MANAGER,
        element: (
          <RouteSuspense>
            <ResourcesManagerPage />
          </RouteSuspense>
        ),
        children: [
          {
            path: ROUTE_SEGMENTS.RESOURCE_UPLOAD,
            element: (
              <RouteSuspense>
                <UploadResourcePage />
              </RouteSuspense>
            ),
          },
        ],
      },
    ],
  },
];
