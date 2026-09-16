import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import type { UserRole } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/store/authStore';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={APP_PATHS.FORBIDDEN} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default RoleGuard;
