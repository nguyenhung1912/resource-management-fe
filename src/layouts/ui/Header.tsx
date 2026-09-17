import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Layers, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { useNotificationSignalR } from '@/features/notifications/hooks/useNotificationSignalR';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { UserDropdown } from './UserDropdown';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn('transition-colors hover:text-text-main', isActive ? 'font-semibold text-primary' : 'text-text-muted');

export function Header() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useNotificationSignalR();

  const navItems = [
    {
      label: 'Trang chủ',
      to: APP_PATHS.HOME,
      private: false,
    },
    {
      label: 'Bảng điều khiển',
      to: APP_PATHS.RESOURCES_MANAGER,
      private: true,
    },
    {
      label: 'Khiếu nại của tôi',
      to: APP_PATHS.APPEALS,
      private: true,
    },
    {
      label: 'Tiếp nhận khiếu nại',
      to: APP_PATHS.ASSIGNED_APPEALS,
      private: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.private || isAuthenticated);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface shadow-2xs select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to={APP_PATHS.HOME}
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>

          <div>
            <span className="block text-base font-bold leading-tight tracking-tight text-text-main">
              Resource Management
            </span>
            <span className="block text-[11px] leading-none text-text-muted">Hệ thống Quản lý Tài nguyên</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

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
