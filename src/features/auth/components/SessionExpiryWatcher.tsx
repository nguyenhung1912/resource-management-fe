import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

const WARNING_DURATION_MS = 5_000;
const TICK_INTERVAL_MS = 100;

export function SessionExpiryWatcher() {
  const expiration = useAuthStore((state) => state.expiration);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingMs, setRemainingMs] = useState(WARNING_DURATION_MS);

  useEffect(() => {
    if (!isAuthenticated || !expiration) {
      return;
    }

    const expirationTime = new Date(expiration).getTime();

    if (Number.isNaN(expirationTime)) {
      return;
    }

    // setTimeout của JS không nên nhận delay lớn hơn ~2^31 - 1 ms.
    const MAX_TIMEOUT_MS = 2_147_000_000;

    let warningTimer: number | undefined;
    let expirationTimer: number | undefined;
    let countdownInterval: number | undefined;

    let cancelled = false;

    const startWarning = () => {
      if (cancelled) {
        return;
      }

      setIsWarningVisible(true);

      setRemainingMs(Math.max(expirationTime - Date.now(), 0));

      countdownInterval = window.setInterval(() => {
        setRemainingMs(Math.max(expirationTime - Date.now(), 0));
      }, TICK_INTERVAL_MS);
    };

    const scheduleWarning = () => {
      if (cancelled) {
        return;
      }

      const warningTime = expirationTime - WARNING_DURATION_MS;

      const remaining = warningTime - Date.now();

      if (remaining <= 0) {
        startWarning();
        return;
      }

      warningTimer = window.setTimeout(scheduleWarning, Math.min(remaining, MAX_TIMEOUT_MS));
    };

    const handleExpiration = () => {
      if (cancelled) {
        return;
      }

      const remaining = expirationTime - Date.now();

      // Nếu expiration còn quá xa thì tiếp tục chia nhỏ timer.
      if (remaining > 0) {
        expirationTimer = window.setTimeout(handleExpiration, Math.min(remaining, MAX_TIMEOUT_MS));

        return;
      }

      const currentPath = `${location.pathname}${location.search}`;

      if (countdownInterval !== undefined) {
        window.clearInterval(countdownInterval);
      }

      logout();

      navigate(`${APP_PATHS.LOGIN}?redirect=${encodeURIComponent(currentPath)}`, {
        replace: true,
      });
    };

    scheduleWarning();
    handleExpiration();

    return () => {
      cancelled = true;

      if (warningTimer !== undefined) {
        window.clearTimeout(warningTimer);
      }

      if (expirationTimer !== undefined) {
        window.clearTimeout(expirationTimer);
      }

      if (countdownInterval !== undefined) {
        window.clearInterval(countdownInterval);
      }
    };
  }, [expiration, isAuthenticated, location.pathname, location.search, logout, navigate]);

  if (!isAuthenticated || !expiration || !isWarningVisible) {
    return null;
  }

  const remainingSeconds = Math.ceil(remainingMs / 100) / 10;

  const progress = Math.max(Math.min((remainingMs / WARNING_DURATION_MS) * 100, 100), 0);

  return (
    <div className="fixed inset-x-0 top-5 z-[9999] flex justify-center px-4">
      <div
        role="alert"
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-xl
          border
          border-amber-200
          bg-white
          shadow-xl
        "
      >
        <div className="flex gap-3 p-4">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-50
            "
          >
            <Clock3 className="h-5 w-5 text-amber-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary">Phiên đăng nhập sắp hết hạn</p>

            <p className="mt-1 text-sm text-text-muted">
              Bạn sẽ được chuyển về trang đăng nhập sau{' '}
              <strong className="text-amber-600">{remainingSeconds.toFixed(1)}s</strong>
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-amber-100">
          <div
            className="h-full bg-amber-500"
            style={{
              width: `${progress}%`,
              transition: `width ${TICK_INTERVAL_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SessionExpiryWatcher;
