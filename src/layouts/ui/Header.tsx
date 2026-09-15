import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, KeyRound, Layers, LogIn, LogOut, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { useNotificationSignalR } from '@/features/notifications/hooks/useNotificationSignalR';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn('transition-colors hover:text-text-main', isActive ? 'font-semibold text-primary' : 'text-text-muted');

function getInitials(fullName?: string, userCode?: string) {
  if (!fullName?.trim()) {
    return userCode?.slice(0, 2).toUpperCase() ?? 'US';
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Header() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useNotificationSignalR();

  const navItems = [
    {
      label: 'Trang chủ',
      to: APP_PATHS.HOME,
      private: false,
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

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        {/* Guest */}
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
          /* Authenticated */
          <div className="flex items-center gap-3">
            <div className="relative">
              <NotificationBell />
              <NotificationDialog onViewAll={() => navigate(APP_PATHS.NOTIFICATIONS)} onNavigateToTarget={navigate} />
            </div>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((value) => !value)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <div className="hidden text-right sm:block">
                  <p className="max-w-[170px] truncate text-sm font-semibold text-text-main">
                    {user?.fullName ?? user?.userCode}
                  </p>

                  <p className="text-xs text-text-muted">{user?.role}</p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(user?.fullName, user?.userCode)}
                </div>

                <ChevronDown
                  className={cn('h-4 w-4 text-text-muted transition-transform', isMenuOpen && 'rotate-180')}
                />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-lg">
                  <div className="border-b border-border-subtle px-4 py-3">
                    <p className="truncate text-sm font-semibold text-text-main">{user?.fullName ?? user?.userCode}</p>

                    <p className="mt-1 truncate text-xs text-text-muted">{user?.email}</p>
                  </div>

                  <div className="p-1.5">
                    <MenuItem
                      icon={<UserRound className="h-4 w-4" />}
                      label="Hồ sơ cá nhân"
                      onClick={() => {
                        closeMenu();
                        navigate(APP_PATHS.PROFILE);
                      }}
                    />

                    <MenuItem
                      icon={<KeyRound className="h-4 w-4" />}
                      label="Đổi mật khẩu"
                      onClick={() => {
                        closeMenu();
                        navigate(APP_PATHS.CHANGE_PASSWORD);
                      }}
                    />

                    <div className="my-1 border-t border-border-subtle" />

                    <MenuItem icon={<LogOut className="h-4 w-4" />} label="Đăng xuất" danger onClick={handleLogout} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

function MenuItem({ icon, label, danger = false, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
        danger ? 'text-danger hover:bg-danger/5' : 'text-text-main hover:bg-background',
      )}
    >
      <span className={danger ? '' : 'text-text-muted'}>{icon}</span>
      {label}
    </button>
  );
}

export default Header;
