import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { dashboardRoutes } from './dashboardRoutes';
import { errorRoutes } from './errorRoutes';
import { mainRoutes } from './mainRoutes';

export const appRoutes: RouteObject[] = [...mainRoutes, ...dashboardRoutes, ...errorRoutes];

export const router = createBrowserRouter(appRoutes);

export default router;
