import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardMenu } from '@/features/dashboard/components/DashboardMenu';
import { dashboardMenuPreviewData } from '@/constants/dashboard-menu';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

export function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useDocumentTitle();

  return (
    <div className="min-h-screen bg-background text-text-main">
      <DashboardHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((currentValue) => !currentValue)}
        user={{ displayName: 'Username_tx', role: 'Role_tx' }}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
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
            'fixed bottom-0 left-0 top-16 z-40 w-64 shrink-0 transform overflow-visible transition-[transform,width] duration-200 lg:static lg:h-[calc(100vh-4rem)]',
            isMenuOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:w-0 lg:-translate-x-full',
          )}
        >
          <DashboardMenu
            menuData={dashboardMenuPreviewData}
            user={{ displayName: 'User1', secondaryText: '465 tài nguyên' }}
            onNavigate={() => setIsMenuOpen(false)}
          />
        </aside>

        <main className="min-w-0 flex-1">
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
