import { useState } from 'react';

import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

import type { ChangePasswordRequest } from '@/features/auth/types/auth.types';

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const changePassword = async (request: ChangePasswordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authService.changePassword(request);

      setSuccess(response.message);

      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Đổi mật khẩu thất bại.'));

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    changePassword,
  };
}
