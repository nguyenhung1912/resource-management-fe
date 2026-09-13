import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';

export function AuthLayout() {
  useDocumentTitle();
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Suspense fallback={<PageLoadingState />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      <footer className="py-4 border-t border-border-subtle bg-surface text-center text-xs text-text-muted">
        <p>© 2026 Resource Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AuthLayout;
