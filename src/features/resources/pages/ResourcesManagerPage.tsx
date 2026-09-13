import { Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import { ResourcesManager } from '@/features/resources/components/ResourcesManager';
import { ResourceStats } from '@/features/resources/components/ResourceStats';

export function ResourcesManagerPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-main">Quản lý tài nguyên</h1>
          <p className="mt-1 text-sm text-text-muted">Theo dõi các tài liệu bạn đã tải lên hệ thống.</p>
        </div>
        <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'md' })}>
          <Plus className="size-4" aria-hidden="true" />
          Tải lên tài nguyên
        </Link>
      </div>

      <div className="mt-6">
        <ResourceStats />
      </div>

      <div className="mt-6">
        <ResourcesManager />
      </div>
      <Outlet />
    </div>
  );
}

export default ResourcesManagerPage;
