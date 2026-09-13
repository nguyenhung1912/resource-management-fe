import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';
import { Header } from './ui/Header';

export function MainLayout() {
  useDocumentTitle();

  return (
    <div className="min-h-screen bg-background flex flex-col text-text-main">
      <Header />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs />
      </div>
      <main className="flex-1">
        <Suspense fallback={<PageLoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="py-6 border-t border-border-subtle bg-surface text-center text-xs text-text-muted">
        <p>© 2026 Resource Management System.</p>
      </footer>
    </div>
  );
}

export default MainLayout;
