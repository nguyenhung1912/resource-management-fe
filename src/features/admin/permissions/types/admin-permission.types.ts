import type { Role } from '@/features/admin/accounts/types/admin-account.types';

export interface SystemFunction {
  functionId: string;
  functionName: string;

  functionUrl?: string | null;

  functionDescription?: string | null;
}

export interface RoleWithFunctions extends Role {
  functions: SystemFunction[];
}

export interface AssignFunctionsRequest {
  functionIds: string[];
}
