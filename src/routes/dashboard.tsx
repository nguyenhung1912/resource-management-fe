import type { RouteObject } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ResourcesManagerRouteElement, UploadResourceRouteElement } from './ResourceRouteElements';

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <DashboardLayout />,
    children: [
      {
        path: 'resources-manager',
        element: <ResourcesManagerRouteElement />,
        children: [
          {
            path: 'upload',
            element: <UploadResourceRouteElement />,
          },
        ],
      },
    ],
  },
];
