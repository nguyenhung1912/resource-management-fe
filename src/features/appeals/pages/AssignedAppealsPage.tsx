import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Gavel, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppealDetailModal } from '../components/AppealDetailModal';
import { AppealPagination } from '../components/AppealPagination';
import { AppealResolutionDialog } from '../components/AppealResolutionDialog';
import { AssignedAppealCard } from '../components/AssignedAppealCard';
import { AssignedAppealEmptyState } from '../components/AssignedAppealEmptyState';
import { AssignedAppealFilterBar } from '../components/AssignedAppealFilterBar';
import { AssignedAppealStatsCards } from '../components/AssignedAppealStatsCards';
import { AssignedAppealTable } from '../components/AssignedAppealTable';
import { useAppealDetail } from '../hooks/useAppealDetail';
import type { AppealItemResponse, AppealStatus, AssignedAppealsLoaderResult } from '../types/appeal.types';

export function AssignedAppealsPage() {
  const loaderData = useLoaderData() as AssignedAppealsLoaderResult;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // State cho xem chi tiết
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItemResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // State cho giải quyết khiếu nại
  const [appealToResolve, setAppealToResolve] = useState<AppealItemResponse | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  // State cho banner thông báo thành công
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setIsDetailModalOpen(true);
    void loadDetail(item.appealId);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    resetDetail();
    setSelectedAppeal(null);
  };

  const handleRetryDetail = () => {
    if (selectedAppeal) {
      void loadDetail(selectedAppeal.appealId);
    }
  };

  const handleOpenResolveDialog = (item: AppealItemResponse) => {
    setAppealToResolve(item);
    setIsResolveDialogOpen(true);
    void loadDetail(item.appealId);
  };

  const handleCloseResolveDialog = () => {
    setIsResolveDialogOpen(false);
    setAppealToResolve(null);
    resetDetail();
  };

  const handleResolveSuccess = (_updatedItem: AppealItemResponse, message: string) => {
    setSuccessMessage(message || 'Giải quyết khiếu nại thành công.');
    revalidator.revalidate();
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
            <Gavel className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
                Tiếp nhận & Xử lý Khiếu nại
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 select-none">
                Giảng viên / Ban kiểm duyệt
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Xem xét giải trình từ sinh viên đối với các tài liệu bị từ chối và đưa ra phán quyết (Duyệt lại hoặc Giữ
              nguyên).
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

      {/* Success Alert Banner */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs animate-in fade-in shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Đóng thông báo"
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <AssignedAppealStatsCards stats={stats} activeStatus={currentStatus} onSelectStatus={handleStatusChange} />

      {/* Filter & Search Bar */}
      <AssignedAppealFilterBar
        activeStatus={currentStatus}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        stats={stats}
      />

      {/* Appeals Content Presentation */}
      {appeals.items.length === 0 ? (
        <AssignedAppealEmptyState
          currentStatus={currentStatus}
          searchQuery={searchQuery}
          onResetFilter={handleResetFilter}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <AssignedAppealTable
              items={appeals.items}
              onViewDetail={handleViewDetail}
              onResolve={handleOpenResolveDialog}
            />
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="md:hidden space-y-3">
            {appeals.items.map((item) => (
              <AssignedAppealCard
                key={item.appealId}
                item={item}
                onViewDetail={handleViewDetail}
                onResolve={handleOpenResolveDialog}
              />
            ))}
          </div>

          {/* Pagination */}
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
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        detail={detail}
        fallbackItem={selectedAppeal}
        isLoading={isDetailLoading}
        error={detailError}
        onRetry={handleRetryDetail}
      />

      {/* Appeal Resolution Dialog */}
      <AppealResolutionDialog
        isOpen={isResolveDialogOpen}
        onClose={handleCloseResolveDialog}
        appeal={appealToResolve}
        detail={detail}
        onSuccess={handleResolveSuccess}
      />
    </div>
  );
}

export default AssignedAppealsPage;
