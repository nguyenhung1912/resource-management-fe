import { createBrowserRouter } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { notificationsLoader } from '@/features/notifications/pages/notificationLoader';
import { MainLayout } from '@/layouts/MainLayout';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import App from '@/App';

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
        element: <NotificationsPage />,
        loader: notificationsLoader,
      },
    ],
  },
]);

export default router;
