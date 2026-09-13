import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">Khiếu nại của tôi</h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Theo dõi tiến trình xử lý và phản hồi giải trình các tài liệu bị từ chối kiểm duyệt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing || revalidator.state === 'loading'}
            iconLeft={<RotateCcw className="h-4 w-4" />}
            className="text-xs sm:text-sm"
          >
            Làm mới
          </Button>
        </div>
      </div>

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
