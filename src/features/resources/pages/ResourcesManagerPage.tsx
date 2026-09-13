import { FileText, Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';

export function ResourcesManagerPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-main">Tài nguyên của tôi</h1>
          <p className="mt-1 text-sm text-text-muted">Quản lý các tài liệu bạn đã tải lên hệ thống.</p>
        </div>
        <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'md' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tải lên tài nguyên
        </Link>
      </div>

      <section className="mt-8" aria-labelledby="uploaded-resources-heading">
        <h2 id="uploaded-resources-heading" className="sr-only">
          Danh sách tài nguyên đã tải lên
        </h2>
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-main">Bạn chưa tải lên tài nguyên nào.</h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-muted">
            Tài liệu bạn tải lên sẽ xuất hiện tại đây để theo dõi và quản lý.
          </p>
        </div>
      </section>

      <Outlet />
    </div>
  );
}

export default ResourcesManagerPage;
