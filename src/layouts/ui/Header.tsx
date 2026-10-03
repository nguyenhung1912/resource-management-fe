import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';

import logoQnu from '@/assets/logo-qnu.webp';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { useNotificationSignalR } from '@/features/notifications/hooks/useNotificationSignalR';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { UserDropdown } from './UserDropdown';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useNotificationSignalR();

  const navLinks = [
    { label: 'Trang chủ', to: APP_PATHS.HOME, end: true },
    { label: 'Kho học liệu', to: APP_PATHS.ALL_RESOURCES, end: false },
    { label: 'Tra cứu', to: APP_PATHS.SEARCH, end: false },
    ...(isAuthenticated ? [{ label: 'Bảng điều khiển', to: APP_PATHS.DASHBOARD, end: false }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface shadow-2xs select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to={APP_PATHS.HOME}
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group shrink-0"
        >
          <img
            src={logoQnu}
            alt="Logo Trường Đại học Quy Nhơn"
            className="size-9 rounded-full border border-border/80 bg-surface object-contain p-0.5 shadow-2xs shrink-0 transition-transform group-hover:scale-105"
          />

          <div className="min-w-0">
            <span className="block text-sm sm:text-base font-bold leading-tight tracking-tight text-text-main truncate group-hover:text-primary transition-colors">
              Resource Management
            </span>
            <span className="hidden sm:block text-[11px] leading-none text-text-muted truncate">
              Trường Đại học Quy Nhơn
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:text-text-main hover:bg-neutral-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Guest vs Authenticated & Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <NotificationBell />
                <NotificationDialog onViewAll={() => navigate(APP_PATHS.NOTIFICATIONS)} onNavigateToTarget={navigate} />
              </div>

              <UserDropdown />
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex size-9 items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-neutral-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {isMobileMenuOpen ? (
        <div className="md:hidden border-t border-border-subtle bg-surface px-4 py-2 space-y-1 animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:text-text-main hover:bg-neutral-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export default Header;
