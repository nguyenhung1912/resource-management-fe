import axiosClient from '@/services/axiosClient';

import type { MessageResponse, Role } from '@/features/admin/accounts/types/admin-account.types';

export const adminRoleService = {
  async getRoles(): Promise<Role[]> {
    const response = await axiosClient.get<Role[]>('/api/Admin/roles');

    return response.data;
  },

  async updateUserRole(uid: string, roleId: number): Promise<MessageResponse> {
    const response = await axiosClient.put<MessageResponse>(`/api/Admin/users/${uid}/role`, {
      roleId,
    });

    return response.data;
  },
};

export default adminRoleService;
