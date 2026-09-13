import { ChevronDown, CircleUserRound, Menu } from 'lucide-react';
import type { DashboardHeaderUser } from '@/features/dashboard/types/dashboard-header.types';

interface DashboardHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  user: DashboardHeaderUser;
}

export function DashboardHeader({ isMenuOpen, onToggleMenu, user }: DashboardHeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Đóng menu dashboard' : 'Mở menu dashboard';

  return (
    <header
      aria-label="Thanh điều hướng dashboard"
      className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-dashboard-shell px-3 text-white shadow-sm sm:px-4"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label={menuButtonLabel}
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-menu"
          onClick={onToggleMenu}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Menu aria-hidden="true" className="size-7" strokeWidth={2} />
        </button>

        <p className="truncate text-sm font-bold text-danger sm:text-xl">TRƯỜNG ĐẠI HỌC QUY NHƠN</p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="size-10 rounded-full border border-white/60 bg-surface object-cover"
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full border border-white/60 bg-surface text-secondary">
            <CircleUserRound aria-hidden="true" className="size-7" />
          </span>
        )}

        <div className="hidden min-w-0 sm:block">
          <p className="max-w-40 truncate text-xs font-semibold leading-tight">{user.displayName}</p>
          <p className="max-w-40 truncate text-xs leading-tight text-white/70">{user.role}</p>
        </div>
        <ChevronDown aria-hidden="true" className="hidden size-4 sm:block" />
      </div>
    </header>
  );
}
