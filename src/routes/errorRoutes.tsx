import type { RouteObject } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { ForbiddenPage, NotFoundPage, ServerErrorPage, UnauthorizedPage } from '@/features/errors/pages/ErrorPages';
import { ErrorLayout } from '@/layouts/ErrorLayout';

export const errorRoutes: RouteObject[] = [
  {
    element: <ErrorLayout />,
    children: [
      {
        path: APP_PATHS.UNAUTHORIZED,
        element: <UnauthorizedPage />,
      },
      {
        path: APP_PATHS.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        path: APP_PATHS.NOT_FOUND,
        element: <NotFoundPage />,
      },
      {
        path: APP_PATHS.SERVER_ERROR,
        element: <ServerErrorPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
