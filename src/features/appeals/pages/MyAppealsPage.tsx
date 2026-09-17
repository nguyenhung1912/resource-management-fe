import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { AppealCardItem } from '../components/AppealCardItem';
import { AppealDetailModal } from '../components/AppealDetailModal';
import { AppealEmptyState } from '../components/AppealEmptyState';
import { AppealFilterTabs } from '../components/AppealFilterTabs';
import { AppealPagination } from '../components/AppealPagination';
import { AppealStatsCards } from '../components/AppealStatsCards';
import { AppealTable } from '../components/AppealTable';
import { useAppealDetail } from '../hooks/useAppealDetail';
import type { AppealItemResponse, AppealStatus, MyAppealsLoaderResult } from '../types/appeal.types';

export function MyAppealsPage() {
  const loaderData = useLoaderData() as MyAppealsLoaderResult;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [selectedAppeal, setSelectedAppeal] = useState<AppealItemResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { detail, isLoading: isDetailLoading, error: detailError, loadDetail, resetDetail } = useAppealDetail();

  const { appeals, stats, currentStatus, searchQuery, currentPage, pageSize } = loaderData;

  const handleStatusChange = (newStatus?: AppealStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newStatus) {
      nextParams.set('status', newStatus);
    } else {
      nextParams.delete('status');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSearchChange = (query: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      nextParams.set('search', trimmed);
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };

  const handleResetFilter = () => {
    const nextParams = new URLSearchParams();
    setSearchParams(nextParams);
  };

  const handleViewDetail = (item: AppealItemResponse) => {
    setSelectedAppeal(item);
    setIsModalOpen(true);
    void loadDetail(item.appealId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetDetail();
    setSelectedAppeal(null);
  };

  const handleRetryDetail = () => {
    if (selectedAppeal) {
      void loadDetail(selectedAppeal.appealId);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      revalidator.revalidate();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Khiếu nại của tôi"
        description="Theo dõi tiến trình xử lý và phản hồi giải trình các tài liệu bị từ chối kiểm duyệt."
        icon={Scale}
        badge={
          <Badge variant="primary" showDot>
            Giải trình & Phản hồi
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing || revalidator.state === 'loading'}
            iconLeft={<RotateCcw className="h-4 w-4" />}
          >
            Làm mới
          </Button>
        }
      />

      {/* Stats Card KPI */}
      <AppealStatsCards stats={stats} activeStatus={currentStatus} onSelectStatus={handleStatusChange} />

      {/* Filter & Search */}
      <AppealFilterTabs
        activeStatus={currentStatus}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        stats={stats}
      />

      {/* Appeal List */}
      {appeals.items.length === 0 ? (
        <AppealEmptyState currentStatus={currentStatus} searchQuery={searchQuery} onResetFilter={handleResetFilter} />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <AppealTable items={appeals.items} onViewDetail={handleViewDetail} />
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="md:hidden space-y-3">
            {appeals.items.map((item) => (
              <AppealCardItem key={item.appealId} item={item} onViewDetail={handleViewDetail} />
            ))}
          </div>

          <AppealPagination
            currentPage={currentPage}
            totalPages={appeals.totalPages}
            totalCount={appeals.totalCount}
            pageSize={pageSize}
            hasPreviousPage={appeals.hasPreviousPage}
            hasNextPage={appeals.hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Detail Modal */}
      <AppealDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        detail={detail}
        fallbackItem={selectedAppeal}
        isLoading={isDetailLoading}
        error={detailError}
        onRetry={handleRetryDetail}
      />
    </div>
  );
}

export default MyAppealsPage;
