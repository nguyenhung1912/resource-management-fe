import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { APP_PATHS } from '@/constants/path';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';
import { Header } from './ui/Header';

export function MainLayout() {
  useDocumentTitle();
  const location = useLocation();
  const isHomePage = location.pathname === APP_PATHS.HOME;

  return (
    <div className="min-h-screen bg-background flex flex-col text-text-main">
      <Header />
      {!isHomePage ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs />
        </div>
      ) : null}
      <main className="flex-1">
        <Suspense fallback={<PageLoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="py-6 border-t border-border-subtle bg-surface text-xs text-text-muted select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-text-main">Trường Đại học Quy Nhơn</p>
            <p className="text-[11px] text-text-muted">Cổng Quản lý Tài nguyên Học liệu Số</p>
          </div>
          <p>© 2026 Resource Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
