import type { UserRole } from '@/features/auth/types/auth.types';

export interface DashboardFunction {
  functionId: string;
  functionName: string;
  functionUrl: string;
  functionDescription: string | null;
  allowedRoles?: UserRole[];
}

export interface DashboardMenuGroup {
  groupId: string;
  groupName: string;
  functions: DashboardFunction[];
  allowedRoles?: UserRole[];
}

export interface DashboardMenuResponse {
  groups: DashboardMenuGroup[];
}

export interface DashboardMenuUser {
  displayName: string;
  secondaryText?: string;
  avatarUrl?: string;
}
