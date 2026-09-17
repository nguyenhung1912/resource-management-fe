import axiosClient from '@/services/axiosClient';

import type { UpdateProfileRequest, UserProfile } from '@/features/profile/types/profile.types';

export const profileService = {
  async getMyProfile(): Promise<UserProfile> {
    const response = await axiosClient.get<UserProfile>('/api/User/me');

    return response.data;
  },

  async updateMyProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const response = await axiosClient.put<UserProfile>('/api/User/me', request);

    return response.data;
  },
};

export default profileService;
