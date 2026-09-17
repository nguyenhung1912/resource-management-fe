import { useEffect, useRef, useState } from 'react';
import { useInRouterContext, useNavigate, type NavigateFunction } from 'react-router-dom';
import { ChevronDown, CircleUserRound, KeyRound, LogOut, UserRound } from 'lucide-react';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export interface UserDropdownProps {
  displayName?: string;
  role?: string;
  email?: string;
  avatarUrl?: string;
  onProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name?.trim()) return 'US';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function RouterNavigator({ onReady }: { onReady: (nav: NavigateFunction) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    onReady(navigate);
  }, [navigate, onReady]);
  return null;
}

export function UserDropdown({
  displayName,
  role,
  email,
  avatarUrl,
  onProfile,
  onChangePassword,
  onLogout,
  className,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inRouter = useInRouterContext();
  const navigateRef = useRef<NavigateFunction | null>(null);

  const authUser = useAuthStore((state) => state.user);
  const authLogout = useAuthStore((state) => state.logout);

  const effectiveDisplayName = displayName ?? authUser?.fullName ?? authUser?.userCode ?? 'Người dùng';
  const effectiveRole = role ?? authUser?.role ?? '';
  const effectiveEmail = email ?? authUser?.email ?? '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    setIsOpen(false);
    if (onProfile) {
      onProfile();
    } else if (navigateRef.current) {
      navigateRef.current(APP_PATHS.PROFILE);
    }
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    if (onChangePassword) {
      onChangePassword();
    } else if (navigateRef.current) {
      navigateRef.current(APP_PATHS.CHANGE_PASSWORD);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      authLogout();
      if (navigateRef.current) {
        navigateRef.current(APP_PATHS.HOME, { replace: true });
      }
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative shrink-0', className)}>
      {inRouter ? (
        <RouterNavigator
          onReady={(nav) => {
            navigateRef.current = nav;
          }}
        />
      ) : null}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
      >
        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-text-main">{effectiveDisplayName}</p>
          {effectiveRole ? <p className="text-xs text-text-muted">{effectiveRole}</p> : null}
        </div>

        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary shrink-0">
            {effectiveDisplayName ? (
              getInitials(effectiveDisplayName)
            ) : (
              <CircleUserRound className="size-5 text-text-muted" aria-hidden="true" />
            )}
          </div>
        )}

        <ChevronDown
          className={cn('size-4 text-text-muted transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border-subtle bg-surface p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="border-b border-border-subtle px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-text-main">{effectiveDisplayName}</p>
            {effectiveEmail ? (
              <p className="mt-0.5 truncate text-xs text-text-muted">{effectiveEmail}</p>
            ) : effectiveRole ? (
              <p className="mt-0.5 truncate text-xs text-text-muted">{effectiveRole}</p>
            ) : null}
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleProfile}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-text-main transition-colors hover:bg-background cursor-pointer"
            >
              <UserRound className="size-4 text-text-muted" aria-hidden="true" />
              Hồ sơ cá nhân
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleChangePassword}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-text-main transition-colors hover:bg-background cursor-pointer"
            >
              <KeyRound className="size-4 text-text-muted" aria-hidden="true" />
              Đổi mật khẩu
            </button>

            <div className="my-1 border-t border-border-subtle" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/5 cursor-pointer"
            >
              <LogOut className="size-4 text-danger" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default UserDropdown;
