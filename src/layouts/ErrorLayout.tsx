import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';

export function ErrorLayout() {
  useDocumentTitle();
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col justify-between">
      {/* Main Error Content */}
      <main aria-label="Nội dung lỗi" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<PageLoadingState />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Institutional Footer */}
      <footer className="py-4 border-t border-border-subtle bg-surface text-center text-xs text-text-muted select-none">
        <p>© 2026 Trường Đại học Quy Nhơn. Hệ thống Quản lý Tài nguyên Học thuật.</p>
      </footer>
    </div>
  );
}

export default ErrorLayout;
