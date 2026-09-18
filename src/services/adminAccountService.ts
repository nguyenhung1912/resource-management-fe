import axiosClient from '@/services/axiosClient';

import type {
  AdminUser,
  AdminUserQuery,
  CreateAdminUserRequest,
  MessageResponse,
  PaginatedResponse,
  Role,
  UpdateAdminUserRequest,
} from '@/features/admin/accounts/types/admin-account.types';

export const adminAccountService = {
  async getUsers(params: AdminUserQuery): Promise<PaginatedResponse<AdminUser>> {
    const response = await axiosClient.get<PaginatedResponse<AdminUser>>('/api/Admin/users', {
      params,
    });

    return response.data;
  },

  async getUser(uid: string): Promise<AdminUser> {
    const response = await axiosClient.get<AdminUser>(`/api/Admin/users/${uid}`);

    return response.data;
  },

  async createUser(request: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosClient.post<AdminUser>('/api/Admin/users', request);

    return response.data;
  },

  async updateUser(uid: string, request: UpdateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosClient.put<AdminUser>(`/api/Admin/users/${uid}`, request);

    return response.data;
  },

  async deleteUser(uid: string): Promise<void> {
    await axiosClient.delete(`/api/Admin/users/${uid}`);
  },

  async updateStatus(uid: string, isActive: boolean): Promise<MessageResponse> {
    const response = await axiosClient.put<MessageResponse>(`/api/Admin/users/${uid}/status`, {
      isActive,
    });

    return response.data;
  },

  async getRoles(): Promise<Role[]> {
    const response = await axiosClient.get<Role[]>('/api/Admin/roles');

    return response.data;
  },
};

export default adminAccountService;
