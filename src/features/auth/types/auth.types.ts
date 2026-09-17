export type UserRole = 'Admin' | 'Student' | 'Lecturer' | string;

export interface LoginRequest {
  userCode: string;
  password: string;
}

/**
 * Response trực tiếp từ POST /api/Auth/login
 */
export interface LoginResponse {
  token: string;
  uid: string;
  userCode: string;
  fullName: string;
  email: string;
  roleId: number;
  role: UserRole;
  expiration: string;
}

/**
 * Response từ GET /api/Auth/me
 */
export interface CurrentUserResponse {
  uid: string;
  userCode: string;
  email: string;
  role: UserRole;
  subMajorCode?: string | null;
}

/**
 * User được FE sử dụng.
 */
export interface AuthUser {
  uid: string;
  userCode: string;
  fullName?: string;
  email: string;
  roleId?: number;
  role: UserRole;
  subMajorCode?: string | null;
}

export interface AuthSession {
  token: string;
  expiration: string;
  user: AuthUser;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  expiration: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  userCode: string;
  email: string;
}

export interface VerifyOtpRequest {
  userCode: string;
  otp: string;
}

export interface ResetPasswordRequest {
  userCode: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}
