import type { ReportStatus } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportStatusBadgeProps {
  status: ReportStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

interface StatusConfig {
  label: string;
  dotColor: string;
  badgeClass: string;
}

const STATUS_MAP: Record<ReportStatus, StatusConfig> = {
  Pending: {
    label: 'Chờ xử lý',
    dotColor: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  InProgress: {
    label: 'Đang kiểm tra',
    dotColor: 'bg-primary',
    badgeClass: 'bg-blue-50 text-primary border-blue-200/80',
  },
  Resolved: {
    label: 'Đã giải quyết',
    dotColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  Rejected: {
    label: 'Bác bỏ',
    dotColor: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: 'Không xác định',
  dotColor: 'bg-gray-400',
  badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function ReportStatusBadge({ status, size = 'sm', className }: ReportStatusBadgeProps) {
  const config = (STATUS_MAP as Record<string, StatusConfig>)[status] ?? DEFAULT_CONFIG;

  return (
    <span
      role="status"
      aria-label={`Trạng thái: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border shrink-0 select-none transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px] leading-tight' : 'px-3 py-1 text-xs leading-normal',
        config.badgeClass,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default ReportStatusBadge;
