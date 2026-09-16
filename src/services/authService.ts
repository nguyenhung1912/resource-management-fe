import { apiClient } from '@/services/apiClient';

import type { CurrentUserResponse, LoginRequest, LoginResponse } from '@/features/auth/types/auth.types';

export interface IAuthService {
  login(request: LoginRequest): Promise<LoginResponse>;

  getCurrentUser(): Promise<CurrentUserResponse>;

  getCurrentUserWithToken(token: string): Promise<CurrentUserResponse>;

  getGoogleLoginUrl(): string;
}

class AuthService implements IAuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/Auth/login', request);

    return response.data;
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/api/Auth/me');

    return response.data;
  }

  async getCurrentUserWithToken(token: string): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/api/Auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  getGoogleLoginUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL;

    return `${baseUrl}/api/Auth/google-login`;
  }
}

export const authService: IAuthService = new AuthService();
