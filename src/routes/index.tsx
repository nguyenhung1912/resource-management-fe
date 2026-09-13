/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { authRoutes } from './authRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { errorRoutes } from './errorRoutes';
import { mainRoutes } from './mainRoutes';

export const appRoutes: RouteObject[] = [...authRoutes, ...mainRoutes, ...dashboardRoutes, ...errorRoutes];

export const router = createBrowserRouter(appRoutes);

// Public Routing API Barrel Re-exports
export { authRoutes } from './authRoutes';
export { dashboardRoutes } from './dashboardRoutes';
export { errorRoutes } from './errorRoutes';
export { mainRoutes } from './mainRoutes';
export * from './domains';
export * from './guards';
export * from './hooks/useBreadcrumbs';
export * from './hooks/useDocumentTitle';
export * from './types';

export default router;
