import { useState } from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { AlertBanner } from '@/components/common/AlertBanner';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { auditLogService } from '@/services/auditLogService';
import { AuditLogDetailModal } from '../components/AuditLogDetailModal';
import { AuditLogFilterToolbar } from '../components/AuditLogFilterToolbar';
import { AuditLogStatsCards } from '../components/AuditLogStatsCards';
import { AuditLogTable } from '../components/AuditLogTable';
import type { AuditLogDetail, AuditLogItem } from '../types/audit-log.types';
import type { AuditLogsLoaderData } from './auditLogsLoader';

export function AuditLogsPage() {
  const { logs, query } = useLoaderData() as AuditLogsLoaderData;
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  // State quản lý xem chi tiết log trong modal
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Kiểm tra có filter nào đang hoạt động ngoài phân trang không
  const hasActiveFilters = Boolean(
    query.search ||
    query.action ||
    query.status !== undefined ||
    query.fromDate ||
    query.toDate ||
    query.userId ||
    query.username,
  );

  // Helper cập nhật query parameters trên URL
  const updateQueryParams = (updates: Record<string, string | number | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });

    if (resetPage) {
      next.delete('pageIndex');
      next.delete('pageNumber');
    }

    setSearchParams(next);
  };

  // Các handler lọc dữ liệu
  const handleSearchChange = (search?: string) => {
    updateQueryParams({ search });
  };

  const handleActionChange = (action?: string) => {
    updateQueryParams({ action });
  };

  const handleStatusChange = (status?: number) => {
    updateQueryParams({ status });
  };

  const handleDateChange = (fromDate?: string, toDate?: string) => {
    updateQueryParams({ fromDate, toDate });
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ pageIndex: newPage }, false);
  };

  // Mở modal và fetch chi tiết log theo ID
  const handleOpenDetail = async (item: AuditLogItem) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    setSelectedLogDetail({
      ...item,
      oldValue: null,
      newValue: null,
    });

    try {
      const detail = await auditLogService.getAuditLogDetail(item.logId);
      setSelectedLogDetail(detail);
    } catch {
      setDetailError('Không thể tải dữ liệu chi tiết biến động. Hiển thị thông tin tổng quan.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedLogDetail(null);
    setDetailError(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6" data-testid="audit-logs-page">
      {/* 1. Page Header */}
      <PageHeader
        icon={ShieldCheck}
        title="Nhật ký Lưu vết"
        description="Theo dõi lịch sử truy vết đăng nhập, thao tác người dùng và kiểm toán an ninh hệ thống."
        actions={
          <Button
            type="button"
            variant="secondary"
            iconLeft={<RotateCw className={`size-4 ${revalidator.state === 'loading' ? 'animate-spin' : ''}`} />}
            onClick={() => revalidator.revalidate()}
            disabled={revalidator.state === 'loading'}
          >
            Làm mới
          </Button>
        }
      />

      {/* Thông báo lỗi chi tiết nếu có */}
      {detailError && <AlertBanner type="warning" message={detailError} onClose={() => setDetailError(null)} />}

      {/* 2. Thống kê KPI */}
      <AuditLogStatsCards logs={logs} selectedStatus={query.status} onSelectStatus={handleStatusChange} />

      {/* 3. Bảng Quản trị và Bộ lọc */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Thanh công cụ lọc */}
          <AuditLogFilterToolbar
            search={query.search}
            action={query.action}
            status={query.status}
            fromDate={query.fromDate}
            toDate={query.toDate}
            onSearchChange={handleSearchChange}
            onActionChange={handleActionChange}
            onStatusChange={handleStatusChange}
            onDateChange={handleDateChange}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Bảng dữ liệu */}
          <AuditLogTable
            items={logs.items}
            onViewDetail={handleOpenDetail}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          {/* Phân trang */}
          <Pagination
            currentPage={logs.pageIndex}
            totalPages={logs.totalPages}
            totalCount={logs.totalItems}
            pageSize={logs.pageSize}
            itemLabel="sự kiện"
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* 4. Modal Chi tiết & So sánh dữ liệu */}
      <AuditLogDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        log={selectedLogDetail}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}

export default AuditLogsPage;
