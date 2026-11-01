import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';
import { googleCallbackLoader, sanitizeHistoryUrl } from '../googleCallbackLoader';

describe('googleCallbackLoader', () => {
  it('redirects to login with error when token is missing', async () => {
    const request = new Request('http://localhost:5173/google-callback?expiration=2099-12-31T23:59:59Z');

    const response = await googleCallbackLoader({ request });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(`${APP_PATHS.LOGIN}?error=google_callback_invalid`);
  });

  it('redirects to login with error when expiration is missing', async () => {
    const request = new Request('http://localhost:5173/google-callback?token=valid_token');

    const response = await googleCallbackLoader({ request });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(`${APP_PATHS.LOGIN}?error=google_callback_invalid`);
  });

  it('redirects to APP_PATHS.DASHBOARD upon successful Google login', async () => {
    const completeGoogleLoginSpy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      completeGoogleLogin: completeGoogleLoginSpy,
    } as unknown as ReturnType<typeof useAuthStore.getState>);

    const request = new Request(
      'http://localhost:5173/google-callback?token=test_token&expiration=2099-12-31T23:59:59Z',
    );

    const response = await googleCallbackLoader({ request });

    expect(completeGoogleLoginSpy).toHaveBeenCalledWith('test_token', '2099-12-31T23:59:59Z');
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(APP_PATHS.DASHBOARD);
  });

  it('redirects to login with error when completeGoogleLogin throws', async () => {
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      completeGoogleLogin: vi.fn().mockRejectedValue(new Error('Auth failed')),
    } as unknown as ReturnType<typeof useAuthStore.getState>);

    const request = new Request(
      'http://localhost:5173/google-callback?token=test_token&expiration=2099-12-31T23:59:59Z',
    );

    const response = await googleCallbackLoader({ request });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(`${APP_PATHS.LOGIN}?error=google_login_failed`);
  });

  it('sanitizeHistoryUrl strips token and expiration query parameters from browser history', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    window.history.pushState({}, '', '/google-callback?token=secret123&expiration=2099&extra=1');

    sanitizeHistoryUrl();

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/google-callback?extra=1');
    replaceStateSpy.mockRestore();
  });
});
