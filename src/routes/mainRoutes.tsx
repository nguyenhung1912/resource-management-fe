import { Navigate, type RouteObject } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';

export const mainRoutes: RouteObject[] = [
  {
    path: APP_PATHS.HOME,
    element: <Navigate to={APP_PATHS.DASHBOARD} replace />,
  },
];

export default mainRoutes;
