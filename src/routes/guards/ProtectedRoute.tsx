import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const searchParams = new URLSearchParams();
    const currentPath = `${location.pathname}${location.search}`;
    if (location.pathname !== APP_PATHS.HOME) {
      searchParams.set('redirect', currentPath);
    }
    const target = `${APP_PATHS.LOGIN}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
