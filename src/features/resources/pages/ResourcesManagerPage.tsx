import { useMemo } from 'react';
import { Files, Plus } from 'lucide-react';
import { Link, Outlet, useLoaderData, useSearchParams } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { ResourcesManager } from '@/features/resources/components/ResourcesManager';
import { ResourceStats } from '@/features/resources/components/ResourceStats';
import type { ResourcesManagerLoaderData } from './resourcesManagerLoader';

export function ResourcesManagerPage() {
  const loaderData = useLoaderData() as ResourcesManagerLoaderData | undefined;
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStatusId = useMemo(() => {
    const statusParam = searchParams.get('status');
    return statusParam ? Number.parseInt(statusParam, 10) : undefined;
  }, [searchParams]);

  const handleSelectStatus = (statusId: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (statusId === activeStatusId || statusId === 0) {
      nextParams.delete('status');
    } else {
      nextParams.set('status', String(statusId));
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

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
      <ResourceStats stats={loaderData?.stats} activeStatusId={activeStatusId} onSelectStatus={handleSelectStatus} />

      {/* 3. Resources Manager Table & Tools */}
      <ResourcesManager loaderData={loaderData} />

      <Outlet />
    </div>
  );
}

export default ResourcesManagerPage;
