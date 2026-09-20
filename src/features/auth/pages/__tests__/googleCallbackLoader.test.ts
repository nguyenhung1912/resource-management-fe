import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';
import { googleCallbackLoader } from '../googleCallbackLoader';

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
});
