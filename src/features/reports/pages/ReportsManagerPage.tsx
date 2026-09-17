import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header Hero Banner */}
      <PageHeader
        title="Quản lý & Xử lý Báo cáo vi phạm"
        description="Tiếp nhận, kiểm tra và xử lý các báo cáo vi phạm bản quyền, nội dung tài liệu, bình luận và hành vi người dùng trong hệ thống."
        icon={ShieldAlert}
        iconBg="bg-danger/10 text-danger"
        badge={
          <Badge variant="primary" showDot>
            Giảng viên / Quản trị viên
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

      {/* Success Notification Banner */}
      {successMessage ? (
        <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      ) : null}

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
