import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import type { ReportOverviewStats, ReportStatus } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface MyReportStatsCardsProps {
  stats: ReportOverviewStats;
  activeStatus?: ReportStatus;
  onSelectStatus?: (status?: ReportStatus) => void;
  className?: string;
}

export function MyReportStatsCards({ stats, activeStatus, onSelectStatus, className }: MyReportStatsCardsProps) {
  const total = stats.total;
  const pendingRate = total > 0 ? Math.round((stats.pending / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((stats.inProgress / total) * 100) : 0;
  const resolvedRate = total > 0 ? Math.round((stats.resolved / total) * 100) : 0;
  const rejectedRate = total > 0 ? Math.max(0, 100 - pendingRate - inProgressRate - resolvedRate) : 0;

  const isSelectedAll = activeStatus === undefined;
  const isSelectedPending = activeStatus === 'Pending';
  const isSelectedInProgress = activeStatus === 'InProgress';
  const isSelectedResolved = activeStatus === 'Resolved';
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
            TỔNG QUAN BÁO CÁO CỦA TÔI
          </span>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              <span className="font-medium text-emerald-600">{resolvedRate}% đã giải quyết</span>
              <span>•</span>
              <span className="font-medium text-blue-600">{inProgressRate}% đang kiểm tra</span>
              <span>•</span>
              <span className="font-medium text-amber-600">{pendingRate}% chờ xử lý</span>
              <span>•</span>
              <span className="font-medium text-rose-600">{rejectedRate}% bác bỏ</span>
            </div>
            <div
              className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80"
              title={`Phân bổ: ${resolvedRate}% đã giải quyết, ${inProgressRate}% đang kiểm tra, ${pendingRate}% chờ xử lý, ${rejectedRate}% bác bỏ`}
            >
              <div style={{ width: `${resolvedRate}%` }} className="bg-emerald-500 transition-all duration-300" />
              <div style={{ width: `${inProgressRate}%` }} className="bg-primary transition-all duration-300" />
              <div style={{ width: `${pendingRate}%` }} className="bg-amber-500 transition-all duration-300" />
              <div style={{ width: `${rejectedRate}%` }} className="bg-rose-500 transition-all duration-300" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Dãy 5 khối chỉ số */}
      <div className="grid grid-cols-2 divide-y divide-border-subtle sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
        {/* Khối 1: Tất cả báo cáo */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus(undefined) : undefined}
          aria-label={`Lọc theo Tất cả báo cáo: ${stats.total}`}
          aria-pressed={isSelectedAll}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedAll
              ? 'border-b-2 border-primary bg-primary/[0.04]'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Tất cả báo cáo</span>
            <ShieldAlert
              className={cn(
                'size-4 transition-colors',
                isSelectedAll ? 'text-primary' : 'text-text-muted group-hover:text-primary',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.total}</span>
            <span className="text-xs text-text-muted">báo cáo</span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Toàn bộ báo cáo đã gửi</p>
        </button>

        {/* Khối 2: Chờ xử lý */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Pending') : undefined}
          aria-label={`Lọc theo Chờ xử lý: ${stats.pending}`}
          aria-pressed={isSelectedPending}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedPending
              ? 'border-b-2 border-amber-500 bg-amber-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Chờ xử lý</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Đang chờ ban quản trị tiếp nhận</p>
        </button>

        {/* Khối 3: Đang kiểm tra */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('InProgress') : undefined}
          aria-label={`Lọc theo Đang kiểm tra: ${stats.inProgress}`}
          aria-pressed={isSelectedInProgress}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedInProgress
              ? 'border-b-2 border-primary bg-primary/[0.04]'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đang kiểm tra</span>
            <AlertTriangle
              className={cn(
                'size-4 transition-colors',
                isSelectedInProgress ? 'text-primary' : 'text-text-muted group-hover:text-primary',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {stats.inProgress}
            </span>
            {total > 0 && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary">
                {inProgressRate}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Đang trong quá trình rà soát</p>
        </button>

        {/* Khối 4: Đã giải quyết */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Resolved') : undefined}
          aria-label={`Lọc theo Đã giải quyết: ${stats.resolved}`}
          aria-pressed={isSelectedResolved}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedResolved
              ? 'border-b-2 border-emerald-500 bg-emerald-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Đã giải quyết</span>
            <CheckCircle2
              className={cn(
                'size-4 transition-colors',
                isSelectedResolved ? 'text-emerald-600' : 'text-text-muted group-hover:text-emerald-600',
              )}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">{stats.resolved}</span>
            {total > 0 && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                {resolvedRate}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Đã xử lý và có kết luận</p>
        </button>

        {/* Khối 5: Bác bỏ */}
        <button
          type="button"
          onClick={onSelectStatus ? () => onSelectStatus('Rejected') : undefined}
          aria-label={`Lọc theo Bác bỏ: ${stats.rejected}`}
          aria-pressed={isSelectedRejected}
          className={cn(
            'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
            isSelectedRejected
              ? 'border-b-2 border-rose-500 bg-rose-50/30'
              : 'border-b-2 border-transparent hover:bg-gray-50/80',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-text-muted">Bác bỏ</span>
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
          <p className="mt-2 text-[11px] text-text-muted">Báo cáo không đủ cơ sở</p>
        </button>
      </div>
    </div>
  );
}

export default MyReportStatsCards;
