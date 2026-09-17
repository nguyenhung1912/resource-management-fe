/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTE_SEGMENTS } from '@/constants/path';
import { profileLoader } from '@/features/profile/pages/profileLoader';

const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

export const profileRoutes: RouteObject[] = [
  {
    path: ROUTE_SEGMENTS.PROFILE,
    element: <ProfilePage />,
    loader: profileLoader,
    handle: {
      meta: {
        title: 'Hồ sơ cá nhân',
        breadcrumb: 'Hồ sơ',
      },
    },
  },
];

export default profileRoutes;
