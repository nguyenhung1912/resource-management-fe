/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';
import { myAppealsLoader } from '@/features/appeals/pages/myAppealsLoader';
import { assignedAppealsLoader } from '@/features/appeals/pages/assignedAppealsLoader';
import { MainLayout } from '@/layouts/MainLayout';
import App from '@/App';
import { errorRoutes } from './errorRoutes';

const NotificationCenterPage = lazy(() => import('@/features/notifications/pages/NotificationCenterPage'));
const MyAppealsPage = lazy(() => import('@/features/appeals/pages/MyAppealsPage'));
const AssignedAppealsPage = lazy(() => import('@/features/appeals/pages/AssignedAppealsPage'));

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: APP_PATHS.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <NotificationCenterPage />
          </Suspense>
        ),
        loader: notificationsLoader,
      },
      {
        path: 'appeals',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <MyAppealsPage />
          </Suspense>
        ),
        loader: myAppealsLoader,
      },
      {
        path: 'appeals/assigned',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <AssignedAppealsPage />
          </Suspense>
        ),
        loader: assignedAppealsLoader,
      },
      ...errorRoutes,
    ],
  },
]);

export default router;
