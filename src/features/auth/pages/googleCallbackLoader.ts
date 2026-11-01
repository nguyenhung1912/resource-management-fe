import { redirect } from 'react-router-dom';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

/**
 * Removes sensitive authentication query params (token, expiration) from the current
 * browser history entry to mitigate token leakage via browser history, screenshots,
 * or HTTP Referer headers.
 */
export function sanitizeHistoryUrl(): void {
  if (typeof window !== 'undefined' && window.history?.replaceState) {
    try {
      const cleanUrl = new URL(window.location.href);
      if (cleanUrl.searchParams.has('token') || cleanUrl.searchParams.has('expiration')) {
        cleanUrl.searchParams.delete('token');
        cleanUrl.searchParams.delete('expiration');
        window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
      }
    } catch {
      // Ignore in non-browser or test environments
    }
  }
}

export async function googleCallbackLoader({ request }: { request: Request }) {
  const url = new URL(request.url);

  const token = url.searchParams.get('token');

  const expiration = url.searchParams.get('expiration');

  // Clean sensitive query parameters from history state
  sanitizeHistoryUrl();

  if (!token || !expiration) {
    return redirect(`${APP_PATHS.LOGIN}?error=google_callback_invalid`);
  }

  try {
    await useAuthStore.getState().completeGoogleLogin(token, expiration);

    return redirect(APP_PATHS.DASHBOARD);
  } catch {
    return redirect(`${APP_PATHS.LOGIN}?error=google_login_failed`);
  }
}
