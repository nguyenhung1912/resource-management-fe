import { redirect } from 'react-router-dom';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

export async function googleCallbackLoader({ request }: { request: Request }) {
  const url = new URL(request.url);

  const token = url.searchParams.get('token');

  const expiration = url.searchParams.get('expiration');

  if (!token || !expiration) {
    return redirect(`${APP_PATHS.LOGIN}?error=google_callback_invalid`);
  }

  try {
    await useAuthStore.getState().completeGoogleLogin(token, expiration);

    return redirect(APP_PATHS.HOME);
  } catch {
    return redirect(`${APP_PATHS.LOGIN}?error=google_login_failed`);
  }
}
