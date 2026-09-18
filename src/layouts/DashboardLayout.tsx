import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';

import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { dashboardMenuPreviewData } from '@/constants/dashboard-menu';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardMenu } from '@/features/dashboard/components/DashboardMenu';
import { useDashboardFunctions } from '@/features/dashboard/hooks/useDashboardFunctions';
import { buildDashboardMenu } from '@/features/dashboard/utils/buildDashboardMenu';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { functions } = useDashboardFunctions();

  useDocumentTitle();

  const displayName = user?.fullName ?? user?.userCode ?? 'Người dùng';

  const dashboardMenuData = buildDashboardMenu(dashboardMenuPreviewData, functions, user?.role);

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
        onLogout={() => {
          logout();
          navigate(APP_PATHS.HOME, {
            replace: true,
          });
        }}
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
          aria-hidden={!isMenuOpen}
          inert={!isMenuOpen}
          className={cn(
            'fixed bottom-0 left-0 top-16 z-40 w-64 shrink-0 transform overflow-visible transition-[transform,width] duration-200 lg:static lg:h-full',
            isMenuOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:w-0 lg:-translate-x-full',
          )}
        >
          <DashboardMenu
            menuData={dashboardMenuData}
            user={{
              displayName,
              secondaryText: user?.role ?? '',
            }}
            onNavigate={() => setIsMenuOpen(false)}
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
    </div>
  );
}

export default DashboardLayout;
