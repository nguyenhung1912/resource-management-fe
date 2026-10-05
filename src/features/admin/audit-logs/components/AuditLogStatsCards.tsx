import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AUDIT_LOG_STATUS, type PagedAuditLogResponse } from '../types/audit-log.types';

export interface AuditLogStatsCardsProps {
  logs: PagedAuditLogResponse;
  selectedStatus?: number;
  onSelectStatus?: (status?: number) => void;
  className?: string;
}

export function AuditLogStatsCards({ logs, selectedStatus, onSelectStatus, className }: AuditLogStatsCardsProps) {
  // Tính toán số lượng theo trạng thái từ danh sách tải về
  const successCount = logs.items.filter((item) => item.status === AUDIT_LOG_STATUS.SUCCESS).length;
  const warningCount = logs.items.filter((item) => item.status === AUDIT_LOG_STATUS.WARNING).length;
  const failedCount = logs.items.filter((item) => item.status === AUDIT_LOG_STATUS.FAILED).length;

  // Tính tỷ lệ phần trăm phân bổ (phục vụ thanh trực quan hoá telemetry)
  const totalInPage = logs.items.length;
  const successRate = totalInPage > 0 ? Math.round((successCount / totalInPage) * 100) : 0;
  const warningRate = totalInPage > 0 ? Math.round((warningCount / totalInPage) * 100) : 0;
  const failedRate = totalInPage > 0 ? Math.max(0, 100 - successRate - warningRate) : 0;

  const isSelectedAll = selectedStatus === undefined;
  const isSelectedSuccess = selectedStatus === AUDIT_LOG_STATUS.SUCCESS;
  const isSelectedWarning = selectedStatus === AUDIT_LOG_STATUS.WARNING;
  const isSelectedFailed = selectedStatus === AUDIT_LOG_STATUS.FAILED;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xs', className)}>
      {/* 1. Header thanh phân bổ telemetry */}
      <div className="flex flex-col gap-2.5 border-b border-border-subtle bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">TỔNG QUAN HOẠT ĐỘNG</span>
        </div>

        {/* Thanh tỷ lệ phân bổ trạng thái */}
        {totalInPage > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              <span className="font-medium text-emerald-600">{successRate}% thành công</span>
              <span>•</span>
              <span className="font-medium text-amber-600">{warningRate}% cảnh báo</span>
              <span>•</span>
              <span className="font-medium text-rose-600">{failedRate}% thất bại</span>
            </div>
            <div
              className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80"
              title={`Phân bổ: ${successRate}% thành công, ${warningRate}% cảnh báo, ${failedRate}% thất bại`}
            >
              <div style={{ width: `${successRate}%` }} className="bg-emerald-500 transition-all duration-300" />
              <div style={{ width: `${warningRate}%` }} className="bg-amber-500 transition-all duration-300" />
              <div style={{ width: `${failedRate}%` }} className="bg-rose-500 transition-all duration-300" />
            </div>
          </div>
        ) : null}
      </div>

      {/* 2. Dãy 4 khối chỉ số tương tác liên hoàn */}
      <div className="grid grid-cols-2 divide-y divide-border-subtle sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {/* Khối 1: Tổng lượt ghi nhận */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(undefined) : undefined}
          aria-pressed={isSelectedAll}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedAll
              ? 'border-b-2 border-primary bg-primary/4'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Tổng lượt ghi nhận</span>
            <Activity
              className={cn(
                'size-4 transition-colors',
                isSelectedAll ? 'text-primary' : 'text-text-muted group-hover:text-primary',
              )}
            />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{logs.totalItems}</span>
            <span className="text-xs text-text-muted">nhật ký</span>
          </div>

          <p className="mt-2 text-[11px] text-text-muted">Toàn bộ lịch sử hệ thống</p>
        </button>

        {/* Khối 2: Thao tác thành công */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(AUDIT_LOG_STATUS.SUCCESS) : undefined}
          aria-pressed={isSelectedSuccess}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedSuccess
              ? 'border-b-2 border-emerald-500 bg-emerald-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Thao tác thành công</span>
            <CheckCircle2
              className={cn(
                'size-4 transition-colors',
                isSelectedSuccess ? 'text-emerald-600' : 'text-text-muted group-hover:text-emerald-600',
              )}
            />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{successCount}</span>
            {totalInPage > 0 && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                {successRate}%
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-text-muted">Được ghi nhận hợp lệ</p>
        </button>

        {/* Khối 3: Cảnh báo an toàn */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(AUDIT_LOG_STATUS.WARNING) : undefined}
          aria-pressed={isSelectedWarning}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedWarning
              ? 'border-b-2 border-amber-500 bg-amber-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Cảnh báo an toàn</span>
            <AlertTriangle
              className={cn(
                'size-4 transition-colors',
                isSelectedWarning ? 'text-amber-600' : 'text-text-muted group-hover:text-amber-600',
              )}
            />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{warningCount}</span>
            {totalInPage > 0 && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-amber-700">
                {warningRate}%
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-text-muted">Cần lưu ý kiểm tra</p>
        </button>

        {/* Khối 4: Thao tác thất bại */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(AUDIT_LOG_STATUS.FAILED) : undefined}
          aria-pressed={isSelectedFailed}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedFailed
              ? 'border-b-2 border-rose-500 bg-rose-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Thao tác thất bại</span>
            <XCircle
              className={cn(
                'size-4 transition-colors',
                isSelectedFailed ? 'text-rose-600' : 'text-text-muted group-hover:text-rose-600',
              )}
            />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{failedCount}</span>
            {totalInPage > 0 && (
              <span className="rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-rose-700">
                {failedRate}%
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-text-muted">Rủi ro / ngoại lệ</p>
        </button>
      </div>
    </div>
  );
}

export default AuditLogStatsCards;
