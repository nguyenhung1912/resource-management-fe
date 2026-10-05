import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
import type { AppealOverviewStats, AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AssignedAppealStatsCardsProps {
  stats: AppealOverviewStats;
  activeStatus?: AppealStatus;
  onSelectStatus?: (status?: AppealStatus) => void;
  className?: string;
}

export function AssignedAppealStatsCards({
  stats,
  activeStatus,
  onSelectStatus,
  className,
}: AssignedAppealStatsCardsProps) {
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
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            TỔNG QUAN NHIỆM VỤ GIẢI QUYẾT KHIẾU NẠI
          </span>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              <span className="font-medium text-emerald-600">{approvedRate}% đã duyệt lại</span>
              <span>•</span>
              <span className="font-medium text-amber-600">{pendingRate}% cần duyệt</span>
              <span>•</span>
              <span className="font-medium text-rose-600">{rejectedRate}% từ chối</span>
            </div>
            <div
              className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80"
              title={`Phân bổ: ${approvedRate}% đã duyệt lại, ${pendingRate}% cần duyệt, ${rejectedRate}% từ chối`}
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
        {/* Khối 1: Tổng đơn được giao */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(undefined) : undefined}
          aria-label={`Lọc theo Tổng đơn được giao: ${stats.total}`}
          aria-pressed={isSelectedAll}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedAll
              ? 'border-b-2 border-primary bg-primary/[0.04]'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Tổng đơn được giao</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Nhiệm vụ khiếu nại được phân công</p>
        </button>

        {/* Khối 2: Cần giải quyết */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Pending') : undefined}
          aria-label={`Lọc theo Cần giải quyết: ${stats.pending}`}
          aria-pressed={isSelectedPending}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedPending
              ? 'border-b-2 border-amber-500 bg-amber-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Cần giải quyết</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Chờ xử lý và kết luận</p>
        </button>

        {/* Khối 3: Đã duyệt lại */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Approved') : undefined}
          aria-label={`Lọc theo Đã duyệt lại: ${stats.approved}`}
          aria-pressed={isSelectedApproved}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedApproved
              ? 'border-b-2 border-emerald-500 bg-emerald-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đã duyệt lại</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Đã chấp thuận phục hồi tài nguyên</p>
        </button>

        {/* Khối 4: Đã giữ nguyên từ chối */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Rejected') : undefined}
          aria-label={`Lọc theo Đã giữ nguyên từ chối: ${stats.rejected}`}
          aria-pressed={isSelectedRejected}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedRejected
              ? 'border-b-2 border-rose-500 bg-rose-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đã giữ nguyên từ chối</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Bác đơn khiếu nại</p>
        </button>
      </div>
    </div>
  );
}

export default AssignedAppealStatsCards;
