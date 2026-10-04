import { useMemo, useState } from 'react';
import { Files, Plus } from 'lucide-react';
import { Link, Outlet, useLoaderData, useLocation, useRevalidator, useSearchParams } from 'react-router-dom';
import { AlertBanner } from '@/components/common/AlertBanner';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { ResourcesManager } from '@/features/resources/components/ResourcesManager';
import { ResourceStats } from '@/features/resources/components/ResourceStats';
import type { ResourcesManagerLoaderData } from './resourcesManagerLoader';

export function ResourcesManagerPage() {
  const loaderData = useLoaderData() as ResourcesManagerLoaderData | undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const location = useLocation();
  const [dismissedUploadNoticeKey, setDismissedUploadNoticeKey] = useState<string | null>(null);
  const showUploadSuccess =
    (location.state as { resourceUploadSucceeded?: boolean } | null)?.resourceUploadSucceeded === true &&
    dismissedUploadNoticeKey !== location.key;

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

      {showUploadSuccess ? (
        <AlertBanner
          type="success"
          title="Tải tài liệu thành công"
          message="Tài liệu đã được chuyển sang PDF và lưu ở trạng thái Chờ duyệt. Kiểm tra trùng lặp sẽ tiếp tục ở chế độ nền."
          onClose={() => setDismissedUploadNoticeKey(location.key)}
        />
      ) : null}

      {/* 2. Statistics KPI Cards */}
      <ResourceStats stats={loaderData?.stats} activeStatusId={activeStatusId} onSelectStatus={handleSelectStatus} />

      {/* 3. Resources Manager Table & Tools */}
      <ResourcesManager loaderData={loaderData} onRevalidate={() => revalidator.revalidate()} />

      <Outlet />
    </div>
  );
}

export default ResourcesManagerPage;
