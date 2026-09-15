import type { AuthSession } from '@/features/auth/types/auth_types';

const AUTH_SESSION_KEY = 'resource-management-auth';

export interface IAuthStorage {
  getSession(): AuthSession | null;

  saveSession(session: AuthSession): void;

  clearSession(): void;

  isExpired(expiration: string): boolean;
}

class LocalAuthStorage implements IAuthStorage {
  getSession(): AuthSession | null {
    const rawSession = localStorage.getItem(AUTH_SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession) as AuthSession;

      if (this.isExpired(session.expiration)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  isExpired(expiration: string): boolean {
    const expirationTime = new Date(expiration).getTime();

    if (Number.isNaN(expirationTime)) {
      return true;
    }

    return expirationTime <= Date.now();
  }
}

export const authStorage: IAuthStorage = new LocalAuthStorage();
