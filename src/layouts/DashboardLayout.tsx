import { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';

import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { DASHBOARD_MENU_CONFIG } from '@/constants/dashboard-menu';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardMenu } from '@/features/dashboard/components/DashboardMenu';
import { useDashboardFunctions } from '@/features/dashboard/hooks/useDashboardFunctions';
import { buildDashboardMenu } from '@/features/dashboard/utils/buildDashboardMenu';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { SessionExpiryWatcher } from '@/features/auth/components/SessionExpiryWatcher';
import { LogoutConfirmModal } from '@/features/auth/components/LogoutConfirmModal';

export function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { functions } = useDashboardFunctions();

  useDocumentTitle();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);

    navigate(APP_PATHS.HOME, {
      replace: true,
    });
  };

  const displayName = user?.fullName ?? user?.userCode ?? 'Người dùng';

  const dashboardMenuData = buildDashboardMenu(DASHBOARD_MENU_CONFIG, functions, user?.role);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-text-main">
      <DashboardHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((currentValue) => !currentValue)}
        user={{
          displayName,
          role: user?.role ?? '',
        }}
        onProfile={() => navigate(APP_PATHS.PROFILE)}
        onChangePassword={() => navigate(APP_PATHS.CHANGE_PASSWORD)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {isMenuOpen ? (
          <button
            type="button"
            aria-label="Đóng menu khi nhấn bên ngoài"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-dashboard-shell/40 lg:hidden"
          />
        ) : null}

        <aside
          id="dashboard-menu"
          aria-hidden={isMobile ? !isMenuOpen : undefined}
          inert={isMobile && !isMenuOpen ? true : undefined}
          className={cn(
            'fixed bottom-0 left-0 top-16 z-40 w-64 shrink-0 transform overflow-visible transition-[transform,width] duration-200',
            'lg:static lg:h-full lg:translate-x-0',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <DashboardMenu
            menuData={dashboardMenuData}
            user={{
              displayName,
              secondaryText: user?.role ?? '',
            }}
            onNavigate={handleNavigate}
          />
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="px-4 pt-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
          </div>

          <Suspense fallback={<PageLoadingState />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <SessionExpiryWatcher />

      <LogoutConfirmModal
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}

export default DashboardLayout;
