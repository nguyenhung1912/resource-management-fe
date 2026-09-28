import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { MyReportCardItem } from '../components/MyReportCardItem';
import { MyReportEmptyState } from '../components/MyReportEmptyState';
import { MyReportFilterTabs } from '../components/MyReportFilterTabs';
import { MyReportStatsCards } from '../components/MyReportStatsCards';
import { MyReportTable } from '../components/MyReportTable';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { ReportPagination } from '../components/ReportPagination';
import { useReportDetail } from '../hooks/useReportDetail';
import type { MyReportsLoaderResult, ReportItemResponse, ReportStatus, ReportTargetType } from '../types/report.types';

export function MyReportsPage() {
  const loaderData = useLoaderData() as MyReportsLoaderResult;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // State xem chi tiết báo cáo
  const [selectedReport, setSelectedReport] = useState<ReportItemResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
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
      {/* Header trang */}
      <PageHeader
        title="Báo cáo vi phạm của tôi"
        description="Theo dõi tiến trình tiếp nhận, kiểm tra và kết quả xử lý các báo cáo vi phạm bạn đã gửi."
        icon={ShieldAlert}
        badge={
          <Badge variant="primary" showDot>
            Theo dõi xử lý
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing || revalidator.state === 'loading'}
            iconLeft={<RotateCcw className="h-4 w-4" />}
            aria-label="Làm mới danh sách báo cáo"
          >
            Làm mới
          </Button>
        }
      />

      {/* Thống kê chỉ số KPI (Pending, Resolved, etc.) */}
      <MyReportStatsCards stats={stats} activeStatus={currentStatus} onSelectStatus={handleStatusChange} />

      {/* Thanh bộ lọc & tìm kiếm */}
      <MyReportFilterTabs
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

      {/* Danh sách dữ liệu hoặc Trạng thái rỗng */}
      {reports.items.length === 0 ? (
        <MyReportEmptyState
          currentStatus={currentStatus}
          currentTargetType={currentTargetType}
          currentReportTypeId={currentReportTypeId}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Bảng dữ liệu dành cho Desktop */}
          <div className="hidden md:block">
            <MyReportTable items={reports.items} onViewDetail={handleViewDetail} />
          </div>

          {/* Dạng thẻ dành cho Mobile & Tablet */}
          <div className="md:hidden space-y-3">
            {reports.items.map((item) => (
              <MyReportCardItem key={item.reportId} item={item} onViewDetail={handleViewDetail} />
            ))}
          </div>

          {/* Phân trang */}
          <ReportPagination
            currentPage={currentPage}
            totalPages={reports.totalPages}
            totalCount={reports.totalCount ?? reports.totalItems ?? 0}
            pageSize={pageSize}
            hasPreviousPage={reports.hasPreviousPage}
            hasNextPage={reports.hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal xem chi tiết báo cáo vi phạm */}
      <ReportDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        detail={detail}
        fallbackItem={selectedReport}
        isLoading={isDetailLoading}
        error={detailError}
        onRetry={handleRetryDetail}
      />
    </div>
  );
}

export default MyReportsPage;
