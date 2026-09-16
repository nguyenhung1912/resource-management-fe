import { ChevronDown, CircleUserRound, KeyRound, LogOut, Menu, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { DashboardHeaderUser } from '@/features/dashboard/types/dashboard-header.types';
import { cn } from '@/utils/cn';

interface DashboardHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;

  user: DashboardHeaderUser;

  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  isMenuOpen,
  onToggleMenu,
  user,
  onProfile,
  onChangePassword,
  onLogout,
}: DashboardHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const menuButtonLabel = isMenuOpen ? 'Đóng menu dashboard' : 'Mở menu dashboard';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    setIsUserMenuOpen(false);
    onProfile();
  };

  const handleChangePassword = () => {
    setIsUserMenuOpen(false);
    onChangePassword();
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  return (
    <header
      aria-label="Thanh điều hướng dashboard"
      className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface px-3 text-text shadow-sm sm:px-4"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label={menuButtonLabel}
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-menu"
          onClick={onToggleMenu}
          className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-background"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>

        <p className="truncate text-sm font-bold text-danger sm:text-xl">TRƯỜNG ĐẠI HỌC QUY NHƠN</p>
      </div>

      <div ref={userMenuRef} className="relative ml-3 shrink-0">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          onClick={() => setIsUserMenuOpen((current) => !current)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-background"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <CircleUserRound className="size-9 text-text-muted" aria-hidden="true" />
          )}

          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-text-main">{user.displayName}</p>

            <p className="text-xs text-text-muted">{user.role}</p>
          </div>

          <ChevronDown
            className={cn('size-4 text-text-muted transition-transform', isUserMenuOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        {isUserMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg"
          >
            <div className="border-b border-border-subtle px-3 py-2 sm:hidden">
              <p className="truncate text-sm font-semibold">{user.displayName}</p>

              <p className="text-xs text-text-muted">{user.role}</p>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={handleProfile}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-background"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Hồ sơ cá nhân
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleChangePassword}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-background"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Đổi mật khẩu
            </button>

            <div className="my-1 border-t border-border-subtle" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-background"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default DashboardHeader;
