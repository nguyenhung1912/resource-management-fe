import type { UserRole } from '@/features/auth/types/auth_types';

export interface RouteMeta {
  title?: string;
  breadcrumb?: string;
  roles?: UserRole[];
}

export interface RouteHandle {
  meta?: RouteMeta;
}
