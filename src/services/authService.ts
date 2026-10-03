import axiosClient from '@/services/axiosClient';
import { APP_CONFIG } from '@/constants/config';

import type {
  ChangePasswordRequest,
  MessageResponse,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '@/features/auth/types/auth.types';

export interface IAuthService {
  login(request: LoginRequest): Promise<LoginResponse>;

  changePassword(request: ChangePasswordRequest): Promise<MessageResponse>;
  forgotPassword(request: ForgotPasswordRequest): Promise<MessageResponse>;

  verifyOtp(request: VerifyOtpRequest): Promise<MessageResponse>;

  resetPassword(request: ResetPasswordRequest): Promise<MessageResponse>;

  getCurrentUser(): Promise<CurrentUserResponse>;

  getCurrentUserWithToken(token: string): Promise<CurrentUserResponse>;

  getGoogleLoginUrl(): string;
}

class AuthService implements IAuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/api/Auth/login', request);

    return response.data;
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/api/Auth/forgot-password', request);

    return response.data;
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/api/Auth/verify-otp', request);

    return response.data;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/api/Auth/reset-password', request);

    return response.data;
  }

  async changePassword(request: ChangePasswordRequest): Promise<MessageResponse> {
    const response = await axiosClient.put<MessageResponse>('/api/Auth/change-password', request);

    return response.data;
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await axiosClient.get<CurrentUserResponse>('/api/Auth/me');

    return response.data;
  }

  async getCurrentUserWithToken(token: string): Promise<CurrentUserResponse> {
    const response = await axiosClient.get<CurrentUserResponse>('/api/Auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  getGoogleLoginUrl(): string {
    return `${APP_CONFIG.API_BASE_URL}/api/Auth/google-login`;
  }
}

export const authService: IAuthService = new AuthService();
