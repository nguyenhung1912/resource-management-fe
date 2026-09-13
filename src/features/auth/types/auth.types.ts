export type UserRole = 'ADMIN' | 'STUDENT' | 'LECTURER' | string;

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
