import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
import type { AppealOverviewStats, AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AppealStatsCardsProps {
  stats: AppealOverviewStats;
  activeStatus?: AppealStatus;
  onSelectStatus?: (status?: AppealStatus) => void;
  className?: string;
}

export function AppealStatsCards({ stats, activeStatus, onSelectStatus, className }: AppealStatsCardsProps) {
  const total = stats.total;
  const approvedRate = total > 0 ? Math.round((stats.approved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((stats.pending / total) * 100) : 0;
  const rejectedRate = total > 0 ? Math.max(0, 100 - approvedRate - pendingRate) : 0;

  const isSelectedAll = activeStatus === undefined;
  const isSelectedPending = activeStatus === 'Pending';
  const isSelectedApproved = activeStatus === 'Approved';
  const isSelectedRejected = activeStatus === 'Rejected';

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xs', className)}>
      {/* 1. Header telemetry */}
      <div className="flex flex-col gap-2.5 border-b border-border-subtle bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">TỔNG QUAN KHIẾU NẠI</span>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              <span className="font-medium text-emerald-600">{approvedRate}% chấp thuận</span>
              <span>•</span>
              <span className="font-medium text-amber-600">{pendingRate}% chờ duyệt</span>
              <span>•</span>
              <span className="font-medium text-rose-600">{rejectedRate}% từ chối</span>
            </div>
            <div
              className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80"
              title={`Phân bổ: ${approvedRate}% chấp thuận, ${pendingRate}% chờ duyệt, ${rejectedRate}% từ chối`}
            >
              <div style={{ width: `${approvedRate}%` }} className="bg-emerald-500 transition-all duration-300" />
              <div style={{ width: `${pendingRate}%` }} className="bg-amber-500 transition-all duration-300" />
              <div style={{ width: `${rejectedRate}%` }} className="bg-rose-500 transition-all duration-300" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Dãy 4 khối chỉ số */}
      <div className="grid grid-cols-2 divide-y divide-border-subtle sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {/* Khối 1: Tổng khiếu nại */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(undefined) : undefined}
          aria-label={`Lọc theo Tổng khiếu nại: ${stats.total}`}
          aria-pressed={isSelectedAll}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedAll
              ? 'border-b-2 border-primary bg-primary/[0.04]'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Tổng khiếu nại</span>
            <FileText
              className={cn(
                'size-4 transition-colors',
                isSelectedAll ? 'text-primary' : 'text-text-muted group-hover:text-primary',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.total}</span>
            <span className="text-xs text-text-muted">đơn</span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Toàn bộ đơn khiếu nại đã gửi</p>
        </button>

        {/* Khối 2: Đang chờ duyệt */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Pending') : undefined}
          aria-label={`Lọc theo Đang chờ duyệt: ${stats.pending}`}
          aria-pressed={isSelectedPending}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedPending
              ? 'border-b-2 border-amber-500 bg-amber-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đang chờ duyệt</span>
            <Clock
              className={cn(
                'size-4 transition-colors',
                isSelectedPending ? 'text-amber-600' : 'text-text-muted group-hover:text-amber-600',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.pending}</span>
            {total > 0 && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-amber-700">
                {pendingRate}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Chờ kiểm duyệt viên phản hồi</p>
        </button>

        {/* Khối 3: Đã chấp thuận */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Approved') : undefined}
          aria-label={`Lọc theo Đã chấp thuận: ${stats.approved}`}
          aria-pressed={isSelectedApproved}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedApproved
              ? 'border-b-2 border-emerald-500 bg-emerald-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đã chấp thuận</span>
            <CheckCircle2
              className={cn(
                'size-4 transition-colors',
                isSelectedApproved ? 'text-emerald-600' : 'text-text-muted group-hover:text-emerald-600',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.approved}</span>
            {total > 0 && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                {approvedRate}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Khiếu nại được thông qua</p>
        </button>

        {/* Khối 4: Bị từ chối */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Rejected') : undefined}
          aria-label={`Lọc theo Bị từ chối: ${stats.rejected}`}
          aria-pressed={isSelectedRejected}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedRejected
              ? 'border-b-2 border-rose-500 bg-rose-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Bị từ chối</span>
            <XCircle
              className={cn(
                'size-4 transition-colors',
                isSelectedRejected ? 'text-rose-600' : 'text-text-muted group-hover:text-rose-600',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.rejected}</span>
            {total > 0 && (
              <span className="rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-rose-700">
                {rejectedRate}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Giữ nguyên quyết định xử lý</p>
        </button>
      </div>
    </div>
  );
}

export default AppealStatsCards;
