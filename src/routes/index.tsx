import { createBrowserRouter } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';
import { myAppealsLoader } from '@/features/appeals/pages/myAppealsLoader';
import { MainLayout } from '@/layouts/MainLayout';
import { NotificationCenterPage } from '@/features/notifications/pages/NotificationCenterPage';
import { MyAppealsPage } from '@/features/appeals/pages/MyAppealsPage';
import App from '@/App';
import { errorRoutes } from './errorRoutes';

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
        element: <NotificationCenterPage />,
        loader: notificationsLoader,
      },
      {
        path: 'appeals',
        element: <MyAppealsPage />,
        loader: myAppealsLoader,
      },
      ...errorRoutes,
    ],
  },
]);

export default router;
