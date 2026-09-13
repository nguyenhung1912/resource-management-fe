import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';
import { myAppealsLoader } from '@/features/appeals/pages/myAppealsLoader';
import { assignedAppealsLoader } from '@/features/appeals/pages/assignedAppealsLoader';
import { MainLayout } from '@/layouts/MainLayout';
import { NotificationCenterPage } from '@/features/notifications/pages/NotificationCenterPage';
import { MyAppealsPage } from '@/features/appeals/pages/MyAppealsPage';
import { AssignedAppealsPage } from '@/features/appeals/pages/AssignedAppealsPage';
import App from '@/App';
import { dashboardRoutes } from './dashboard';
import { errorRoutes } from './errorRoutes';

export const appRoutes: RouteObject[] = [
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
        element: <NotificationCenterPage />,
        loader: notificationsLoader,
      },
      {
        path: 'appeals',
        element: <MyAppealsPage />,
        loader: myAppealsLoader,
      },
      {
        path: 'appeals/assigned',
        element: <AssignedAppealsPage />,
        loader: assignedAppealsLoader,
      },
    ],
  },
  ...dashboardRoutes,
  ...errorRoutes,
];

export const router = createBrowserRouter(appRoutes);

export default router;
