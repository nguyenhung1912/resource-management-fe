/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import { ROUTE_PARAMS, ROUTE_SEGMENTS } from '@/constants/path';

import { searchHubLoader } from '@/features/home/pages/searchHubLoader';
import resourceDetailLoader from '@/features/resources/pages/resourceDetailLoader';

const SearchHubPage = lazy(() => import('@/features/home/pages/SearchHubPage'));
const ResourceDetailPage = lazy(() => import('@/features/resources/pages/ResourceDetailPage'));

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.SEARCH,
    element: <SearchHubPage />,
    loader: searchHubLoader,
    handle: {
      meta: {
        title: 'Trung tâm Tra cứu Tài nguyên Số',
        breadcrumb: 'Tra cứu tài nguyên',
      },
    },
  },
  // định tuyến Resource detail
  {
    path: `${ROUTE_SEGMENTS.RESOURCE_DETAIL}/${ROUTE_PARAMS.RESOURCE_ID}`,
    element: <ResourceDetailPage />,
    loader: resourceDetailLoader,
  },
];

export default searchRoutes;
