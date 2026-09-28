/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';
import resourceDetailLoader from '@/features/resources/pages/resourceDetailLoader';
import { uploadResourceLoader } from '@/features/resources/pages/uploadResourceLoader';
import { resourcesManagerLoader } from '@/features/resources/pages/resourcesManagerLoader';
import { modifyResourceLoader } from '@/features/resources/pages/modifyResourceLoader';

const ResourcesManagerPage = lazy(() => import('@/features/resources/pages/ResourcesManagerPage'));
const UploadResourcePage = lazy(() => import('@/features/resources/pages/UploadResourcePage'));
const ModifyResourcePage = lazy(() => import('@/features/resources/pages/ModifyResourcePage'));
const PlaceholderFeaturePage = lazy(() => import('@/features/dashboard/pages/PlaceholderFeaturePage'));
const ResourceDetailPage = lazy(() => import('@/features/resources/pages/ResourceDetailPage'));

export const resourceRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.RESOURCES_MANAGER,
    element: <ResourcesManagerPage />,
    loader: resourcesManagerLoader,
    shouldRevalidate: () => true,
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
        loader: uploadResourceLoader,
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
        loader: modifyResourceLoader,
        handle: {
          meta: {
            title: 'Chỉnh sửa tài nguyên',
            breadcrumb: 'Chỉnh sửa',
          },
        },
      },
      // Đã xóa bỏ block SEARCH gây nhiễu
      {
        path: ROUTE_PARAMS.RESOURCE_ID,
        element: <ResourceDetailPage />,
        loader: resourceDetailLoader,
      },
      {
        path: ROUTE_SEGMENTS.TRASH,
        element: (
          <PlaceholderFeaturePage
            title="Thùng rác tài nguyên"
            description="Xem và khôi phục các tài nguyên đã chuyển vào thùng rác."
          />
        ),
        handle: {
          meta: {
            title: 'Thùng rác',
            breadcrumb: 'Thùng rác',
          },
        },
      },
    ],
  },
];

export default resourceRoutes;
