import { useState } from 'react';

import type { UpdateProfileRequest } from '@/features/profile/types/profile.types';
import { profileService } from '@/services/profileService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export function useProfile() {
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (request: UpdateProfileRequest) => {
    try {
      setIsSaving(true);
      setError(null);

      const updated = await profileService.updateMyProfile(request);

      return updated;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể cập nhật hồ sơ.');

      setError(message);

      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    error,
    updateProfile,
  };
}
