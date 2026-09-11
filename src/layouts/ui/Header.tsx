import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { APP_PATHS } from '@/constants/path';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { NotificationDialog } from '@/features/notifications/components/NotificationDialog';
import { useNotificationSignalR } from '@/features/notifications/hooks/useNotificationSignalR';

export function Header() {
  const navigate = useNavigate();
  useNotificationSignalR();

  const handleViewAllNotifications = () => {
    navigate(APP_PATHS.NOTIFICATIONS);
  };

  const handleNavigateToTarget = (url: string) => {
    navigate(url);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border-subtle shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link
          to={APP_PATHS.HOME}
          className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-text-main tracking-tight block leading-tight">
              Resource Management
            </span>
            <span className="text-[11px] text-text-muted block leading-none">Hệ thống Quản lý Tài nguyên</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
          <Link to={APP_PATHS.HOME} className="hover:text-text-main transition-colors">
            Trang chủ
          </Link>
        </nav>

        {/* Right actions: Notification & Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell & Popover Dialog */}
          <div className="relative">
            <NotificationBell />
            <NotificationDialog onViewAll={handleViewAllNotifications} onNavigateToTarget={handleNavigateToTarget} />
          </div>

          {/* User Profile Avatar */}
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs cursor-pointer">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
