import { create } from 'zustand';

import type { AuthState, AuthUser, LoginRequest } from '@/features/auth/types/auth.types';

import { authService } from '@/services/authService';

import { AUTH_UNAUTHORIZED_EVENT } from '@/services/apiClient';

import { authStorage } from '@/utils/authStorage';

interface AuthActions {
  login(request: LoginRequest): Promise<void>;

  completeGoogleLogin(token: string, expiration: string): Promise<void>;

  logout(): void;
}

type AuthStore = AuthState & AuthActions;

const savedSession = authStorage.getSession();

export const useAuthStore = create<AuthStore>((set) => ({
  user: savedSession?.user ?? null,

  token: savedSession?.token ?? null,

  expiration: savedSession?.expiration ?? null,

  isAuthenticated: Boolean(savedSession),

  isLoading: false,

  login: async (request) => {
    set({
      isLoading: true,
    });

    try {
      const response = await authService.login(request);

      const user: AuthUser = {
        uid: response.uid,
        userCode: response.userCode,
        fullName: response.fullName,
        email: response.email,
        roleId: response.roleId,
        role: response.role,
      };

      authStorage.saveSession({
        token: response.token,
        expiration: response.expiration,
        user,
      });

      set({
        user,
        token: response.token,
        expiration: response.expiration,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        expiration: null,
        isAuthenticated: false,
      });

      throw error;
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  completeGoogleLogin: async (token, expiration) => {
    set({
      isLoading: true,
    });

    try {
      const response = await authService.getCurrentUserWithToken(token);

      const user: AuthUser = {
        uid: response.uid,
        userCode: response.userCode,
        email: response.email,
        role: response.role,
        subMajorCode: response.subMajorCode,
      };

      authStorage.saveSession({
        token,
        expiration,
        user,
      });

      set({
        user,
        token,
        expiration,
        isAuthenticated: true,
      });
    } catch (error) {
      authStorage.clearSession();

      set({
        user: null,
        token: null,
        expiration: null,
        isAuthenticated: false,
      });

      throw error;
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  logout: () => {
    authStorage.clearSession();

    set({
      user: null,
      token: null,
      expiration: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
    useAuthStore.getState().logout();
  });
}
