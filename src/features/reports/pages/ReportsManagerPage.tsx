import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { CheckCircle2, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReportCardItem } from '../components/ReportCardItem';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { ReportEmptyState } from '../components/ReportEmptyState';
import { ReportFilterBar } from '../components/ReportFilterBar';
import { ReportPagination } from '../components/ReportPagination';
import { ReportResolutionDialog } from '../components/ReportResolutionDialog';
import { ReportStatsCards } from '../components/ReportStatsCards';
import { ReportTable } from '../components/ReportTable';
import { useReportDetail } from '../hooks/useReportDetail';
import type { ReportItemResponse, ReportsLoaderResult, ReportStatus, ReportTargetType } from '../types/report.types';

export function ReportsManagerPage() {
  const loaderData = useLoaderData() as ReportsLoaderResult;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // State xem chi tiết
  const [selectedReport, setSelectedReport] = useState<ReportItemResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // State xử lý phán quyết
  const [reportToResolve, setReportToResolve] = useState<ReportItemResponse | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState<boolean>(false);

  // State thông báo thành công và trạng thái làm mới
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { detail, isLoading: isDetailLoading, error: detailError, loadDetail, resetDetail } = useReportDetail();

  const {
    reports,
    stats,
    reportTypes,
    currentStatus,
    currentTargetType,
    currentReportTypeId,
    searchQuery,
    currentPage,
    pageSize,
  } = loaderData;

  const handleStatusChange = (newStatus?: ReportStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newStatus) {
      nextParams.set('status', newStatus);
    } else {
      nextParams.delete('status');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleTargetTypeChange = (newTargetType?: ReportTargetType) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newTargetType) {
      nextParams.set('targetType', newTargetType);
    } else {
      nextParams.delete('targetType');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleReportTypeIdChange = (newReportTypeId?: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newReportTypeId !== undefined) {
      nextParams.set('reportTypeId', String(newReportTypeId));
    } else {
      nextParams.delete('reportTypeId');
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

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    setSearchParams(nextParams);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      revalidator.revalidate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetail = (item: ReportItemResponse) => {
    setSelectedReport(item);
    setIsDetailModalOpen(true);
    void loadDetail(item.reportId);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    resetDetail();
    setSelectedReport(null);
  };

  const handleRetryDetail = () => {
    if (selectedReport) {
      void loadDetail(selectedReport.reportId);
    }
  };

  const handleOpenResolveDialog = (item: ReportItemResponse) => {
    setReportToResolve(item);
    setIsResolveDialogOpen(true);
  };

  const handleCloseResolveDialog = () => {
    setIsResolveDialogOpen(false);
    setReportToResolve(null);
  };

  const handleResolveSuccess = (_updatedItem: ReportItemResponse, message: string) => {
    setSuccessMessage(message || 'Xử lý báo cáo vi phạm thành công.');
    revalidator.revalidate();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
                Quản lý & Xử lý Báo cáo vi phạm
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 select-none">
                Giảng viên / Quản trị viên
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Tiếp nhận, kiểm tra và xử lý các báo cáo vi phạm bản quyền, nội dung tài liệu, bình luận và hành vi người
              dùng trong hệ thống.
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
            className="text-xs sm:text-sm cursor-pointer"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
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

      {/* KPI Statistics Cards */}
      <ReportStatsCards stats={stats} activeStatus={currentStatus} onSelectStatus={handleStatusChange} />

      {/* Filter & Search Bar */}
      <ReportFilterBar
        activeStatus={currentStatus}
        onStatusChange={handleStatusChange}
        currentTargetType={currentTargetType}
        onTargetTypeChange={handleTargetTypeChange}
        currentReportTypeId={currentReportTypeId}
        onReportTypeIdChange={handleReportTypeIdChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        reportTypes={reportTypes}
        stats={stats}
        onResetFilters={handleResetFilters}
      />

      {/* Manager Table & Responsive Content */}
      {reports.items.length === 0 ? (
        <ReportEmptyState
          currentStatus={currentStatus}
          currentTargetType={currentTargetType}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ReportTable items={reports.items} onViewDetail={handleViewDetail} onResolve={handleOpenResolveDialog} />
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="md:hidden space-y-3">
            {reports.items.map((item) => (
              <ReportCardItem
                key={item.reportId}
                item={item}
                onViewDetail={handleViewDetail}
                onResolve={handleOpenResolveDialog}
              />
            ))}
          </div>

          {/* Pagination */}
          <ReportPagination
            currentPage={currentPage}
            totalPages={reports.totalPages}
            totalCount={reports.totalCount}
            pageSize={pageSize}
            hasPreviousPage={reports.hasPreviousPage}
            hasNextPage={reports.hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Detail Modal */}
      <ReportDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        detail={detail}
        fallbackItem={selectedReport}
        isLoading={isDetailLoading}
        error={detailError}
        onRetry={handleRetryDetail}
        onOpenResolve={handleOpenResolveDialog}
      />

      {/* Resolution Dialog */}
      <ReportResolutionDialog
        isOpen={isResolveDialogOpen}
        onClose={handleCloseResolveDialog}
        report={reportToResolve}
        onSuccess={handleResolveSuccess}
      />
    </div>
  );
}

export default ReportsManagerPage;
