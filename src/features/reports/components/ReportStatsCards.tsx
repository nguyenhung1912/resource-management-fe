import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import type { ReportOverviewStats, ReportStatus } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportStatsCardsProps {
  stats: ReportOverviewStats;
  activeStatus?: ReportStatus;
  onSelectStatus?: (status?: ReportStatus) => void;
  className?: string;
}

export function ReportStatsCards({ stats, activeStatus, onSelectStatus, className }: ReportStatsCardsProps) {
  const cards = [
    {
      id: 'all',
      status: undefined as ReportStatus | undefined,
      label: 'Tất cả báo cáo',
      value: stats.total,
      icon: ShieldAlert,
      colorClass: 'text-primary bg-primary/10',
      activeBorder: 'border-primary ring-2 ring-primary/20',
    },
    {
      id: 'Pending',
      status: 'Pending' as ReportStatus,
      label: 'Chờ xử lý',
      value: stats.pending,
      icon: Clock,
      colorClass: 'text-amber-600 bg-amber-50',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    {
      id: 'InProgress',
      status: 'InProgress' as ReportStatus,
      label: 'Đang kiểm tra',
      value: stats.inProgress,
      icon: AlertTriangle,
      colorClass: 'text-primary bg-blue-50',
      activeBorder: 'border-primary ring-2 ring-primary/20',
    },
    {
      id: 'Resolved',
      status: 'Resolved' as ReportStatus,
      label: 'Đã giải quyết',
      value: stats.resolved,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
    },
    {
      id: 'Rejected',
      status: 'Rejected' as ReportStatus,
      label: 'Đã bác bỏ',
      value: stats.rejected,
      icon: XCircle,
      colorClass: 'text-rose-600 bg-rose-50',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4', className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.status;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus?.(card.status)}
            aria-label={`Lọc theo ${card.label}: ${card.value}`}
            className={cn(
              'bg-surface rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-150 cursor-pointer shadow-xs select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm',
              isSelected ? card.activeBorder : 'border-border',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted leading-tight">{card.label}</span>
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', card.colorClass)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-text-main">{card.value}</span>
              <span className="text-xs text-text-muted">báo cáo</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ReportStatsCards;
