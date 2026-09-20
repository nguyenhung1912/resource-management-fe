import type { ReactNode } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

export interface GuestRouteProps {
  children?: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const target = searchParams.get('redirect') || APP_PATHS.DASHBOARD;
    return <Navigate to={target} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default GuestRoute;
