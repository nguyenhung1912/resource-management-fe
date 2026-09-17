import { useCallback, useEffect, useRef } from 'react';
import { Link, useInRouterContext, useNavigate, type NavigateFunction } from 'react-router-dom';
import { Layers, Menu } from 'lucide-react';

import { APP_PATHS } from '@/constants/path';
import type { DashboardHeaderUser } from '@/features/dashboard/types/dashboard-header.types';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { UserDropdown } from '@/layouts/ui/UserDropdown';

interface DashboardHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  user: DashboardHeaderUser;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

function RouterNavigator({ onReady }: { onReady: (nav: NavigateFunction) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    onReady(navigate);
  }, [navigate, onReady]);
  return null;
}

export function DashboardHeader({
  isMenuOpen,
  onToggleMenu,
  user,
  onProfile,
  onChangePassword,
  onLogout,
}: DashboardHeaderProps) {
  const inRouter = useInRouterContext();
  const navigateRef = useRef<NavigateFunction | null>(null);

  const setNavigator = useCallback((nav: NavigateFunction) => {
    navigateRef.current = nav;
  }, []);

  const menuButtonLabel = isMenuOpen ? 'Đóng menu dashboard' : 'Mở menu dashboard';

  const handleBrandClick = () => {
    if (navigateRef.current) {
      navigateRef.current(APP_PATHS.HOME);
    }
  };

  const handleViewAllNotifications = () => {
    if (navigateRef.current) {
      navigateRef.current(APP_PATHS.NOTIFICATIONS);
    }
  };

  const handleNavigateToTarget = (url: string) => {
    if (navigateRef.current) {
      navigateRef.current(url);
    }
  };

  return (
    <header
      aria-label="Thanh điều hướng dashboard"
      className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface px-3 text-text shadow-2xs sm:px-4 select-none"
    >
      {inRouter ? <RouterNavigator onReady={setNavigator} /> : null}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label={menuButtonLabel}
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-menu"
          onClick={onToggleMenu}
          className="inline-flex size-10 items-center justify-center rounded-lg text-text-muted hover:text-text-main transition-colors hover:bg-background cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {inRouter ? (
          <Link
            to={APP_PATHS.HOME}
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm sm:text-base font-bold leading-tight tracking-tight text-text-main truncate group-hover:text-primary transition-colors">
                TRƯỜNG ĐẠI HỌC QUY NHƠN
              </span>
              <span className="hidden sm:block text-[11px] leading-none text-text-muted truncate">
                Hệ thống Quản lý Tài nguyên
              </span>
            </div>
          </Link>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={handleBrandClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleBrandClick();
            }}
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm sm:text-base font-bold leading-tight tracking-tight text-text-main truncate group-hover:text-primary transition-colors">
                TRƯỜNG ĐẠI HỌC QUY NHƠN
              </span>
              <span className="hidden sm:block text-[11px] leading-none text-text-muted truncate">
                Hệ thống Quản lý Tài nguyên
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <NotificationBell />
          <NotificationDialog onViewAll={handleViewAllNotifications} onNavigateToTarget={handleNavigateToTarget} />
        </div>

        <UserDropdown
          displayName={user.displayName}
          role={user.role}
          avatarUrl={user.avatarUrl}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}

export default DashboardHeader;
