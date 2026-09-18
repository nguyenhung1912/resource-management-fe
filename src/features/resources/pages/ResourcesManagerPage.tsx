import { Files, Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { ResourcesManager } from '@/features/resources/components/ResourcesManager';
import { ResourceStats } from '@/features/resources/components/ResourceStats';

export function ResourcesManagerPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header Hero Banner */}
      <PageHeader
        title="Quản lý tài nguyên"
        description="Theo dõi, tìm kiếm và quản lý các tài liệu học tập, giáo trình đã tải lên hệ thống."
        icon={Files}
        actions={
          <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'md' })}>
            <Plus className="size-4 mr-1.5" aria-hidden="true" />
            Tải lên tài nguyên
          </Link>
        }
      />

      {/* 2. Statistics KPI Cards */}
      <ResourceStats />

      {/* 3. Resources Manager Table & Tools */}
      <ResourcesManager />

      <Outlet />
    </div>
  );
}

export default ResourcesManagerPage;
