import { create } from 'zustand';
import type { AuthState, AuthUser } from '@/features/auth/types/auth.types';

const initialPreviewUser: AuthUser = {
  id: 'user-demo-1',
  username: 'demo_user',
  displayName: 'Username_tx',
  role: 'LECTURER',
};

/**
 * Architectural Mock State Contract for Route Guards & Layouts.
 * Real auth state mutations and network handling are maintained by the Auth feature team.
 */
export const useAuthStore = create<AuthState>(() => ({
  user: initialPreviewUser,
  token: 'mock-demo-token',
  isAuthenticated: true,
  isLoading: false,
}));

export default useAuthStore;
