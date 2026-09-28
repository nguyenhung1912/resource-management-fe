import axiosClient from '@/services/axiosClient';

import type { MessageResponse, Role } from '@/features/admin/accounts/types/admin-account.types';

import type { RoleWithFunctions, SystemFunction } from '@/features/admin/permissions/types/admin-permission.types';

export const adminPermissionService = {
  async getRoles(): Promise<Role[]> {
    const response = await axiosClient.get<Role[]>('/api/Admin/roles');

    return response.data;
  },

  async getFunctions(): Promise<SystemFunction[]> {
    const response = await axiosClient.get<SystemFunction[]>('/api/Admin/functions');

    return response.data;
  },

  async getRoleFunctions(roleId: number): Promise<RoleWithFunctions> {
    const response = await axiosClient.get<RoleWithFunctions>(`/api/Admin/roles/${roleId}/functions`);

    return response.data;
  },

  async assignFunctions(roleId: number, functionIds: string[]): Promise<MessageResponse> {
    const response = await axiosClient.put<MessageResponse>(`/api/Admin/roles/${roleId}/functions`, {
      functionIds,
    });

    return response.data;
  },
};

export default adminPermissionService;
