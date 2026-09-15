import { useState } from 'react';

import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  const isLoading = useAuthStore((state) => state.isLoading);

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (userCode: string, password: string) => {
    setError(null);

    try {
      await login({
        userCode,
        password,
      });

      /*
       * Không navigate ở đây.
       *
       * Khi isAuthenticated chuyển thành true,
       * GuestRoute sẽ tự redirect.
       */
    } catch (error) {
      setError(getApiErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'));
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(authService.getGoogleLoginUrl());
  };

  return {
    error,
    isLoading,
    handleLogin,
    handleGoogleLogin,
  };
}
