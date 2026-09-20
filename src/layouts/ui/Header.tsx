import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

import logoQnu from '@/assets/logo-qnu.webp';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { useNotificationSignalR } from '@/features/notifications/hooks/useNotificationSignalR';
import { useAuthStore } from '@/store/authStore';
import { UserDropdown } from './UserDropdown';

export function Header() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useNotificationSignalR();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface shadow-2xs select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to={isAuthenticated ? APP_PATHS.DASHBOARD : APP_PATHS.HOME}
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group"
        >
          <img
            src={logoQnu}
            alt="Logo Trường Đại học Quy Nhơn"
            className="size-9 rounded-full border border-border/80 bg-surface object-contain p-0.5 shadow-2xs shrink-0 transition-transform group-hover:scale-105"
          />

          <div>
            <span className="block text-base font-bold leading-tight tracking-tight text-text-main">
              Resource Management
            </span>
            <span className="block text-[11px] leading-none text-text-muted">Hệ thống Quản lý Tài nguyên</span>
          </div>
        </Link>

        {/* Guest vs Authenticated */}
        {!isAuthenticated ? (
          <Button
            variant="primary"
            size="md"
            iconLeft={<LogIn className="h-4 w-4" />}
            onClick={() => navigate(APP_PATHS.LOGIN)}
          >
            Đăng nhập
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative">
              <NotificationBell />
              <NotificationDialog onViewAll={() => navigate(APP_PATHS.NOTIFICATIONS)} onNavigateToTarget={navigate} />
            </div>

            <UserDropdown />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
