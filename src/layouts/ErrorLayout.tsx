import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoadingState } from '@/components/common/PageLoadingState';
import { useDocumentTitle } from '@/routes/hooks/useDocumentTitle';

export function ErrorLayout() {
  useDocumentTitle();
  return (
    <div className="min-h-screen bg-background text-text-main">
      <main aria-label="Nội dung lỗi" className="min-h-screen">
        <Suspense fallback={<PageLoadingState />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default ErrorLayout;
