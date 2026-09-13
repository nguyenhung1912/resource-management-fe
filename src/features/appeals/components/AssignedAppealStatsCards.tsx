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
  const cards = [
    {
      id: 'all',
      status: undefined as AppealStatus | undefined,
      label: 'Tổng đơn được giao',
      value: stats.total,
      icon: FileText,
      colorClass: 'text-primary bg-primary/10',
      activeBorder: 'border-primary ring-2 ring-primary/20',
    },
    {
      id: 'Pending',
      status: 'Pending' as AppealStatus,
      label: 'Cần giải quyết',
      value: stats.pending,
      icon: Clock,
      colorClass: 'text-warning bg-orange-50',
      activeBorder: 'border-warning ring-2 ring-warning/20',
    },
    {
      id: 'Approved',
      status: 'Approved' as AppealStatus,
      label: 'Đã duyệt lại',
      value: stats.approved,
      icon: CheckCircle2,
      colorClass: 'text-success bg-emerald-50',
      activeBorder: 'border-success ring-2 ring-success/20',
    },
    {
      id: 'Rejected',
      status: 'Rejected' as AppealStatus,
      label: 'Đã giữ nguyên từ chối',
      value: stats.rejected,
      icon: XCircle,
      colorClass: 'text-danger bg-rose-50',
      activeBorder: 'border-danger ring-2 ring-danger/20',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4', className)}>
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
              'bg-surface rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer shadow-xs select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm',
              isSelected ? card.activeBorder : 'border-border-subtle',
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
              <span className="text-xs text-text-muted">đơn</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AssignedAppealStatsCards;
