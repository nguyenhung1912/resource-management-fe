import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { StatCard, type StatCardColorVariant } from '@/components/common/StatCard';
import type { ReportOverviewStats, ReportStatus } from '@/features/reports/types/report.types';
import { cn } from '@/utils/cn';

export interface ReportStatsCardsProps {
  stats: ReportOverviewStats;
  activeStatus?: ReportStatus;
  onSelectStatus?: (status?: ReportStatus) => void;
  className?: string;
}

export function ReportStatsCards({ stats, activeStatus, onSelectStatus, className }: ReportStatsCardsProps) {
  const cards: Array<{
    id: string;
    status: ReportStatus | undefined;
    label: string;
    value: number;
    icon: typeof ShieldAlert;
    variant: StatCardColorVariant;
  }> = [
    {
      id: 'all',
      status: undefined,
      label: 'Tất cả báo cáo',
      value: stats.total,
      icon: ShieldAlert,
      variant: 'primary',
    },
    {
      id: 'Pending',
      status: 'Pending',
      label: 'Chờ xử lý',
      value: stats.pending,
      icon: Clock,
      variant: 'warning',
    },
    {
      id: 'InProgress',
      status: 'InProgress',
      label: 'Đang kiểm tra',
      value: stats.inProgress,
      icon: AlertTriangle,
      variant: 'primary',
    },
    {
      id: 'Resolved',
      status: 'Resolved',
      label: 'Đã giải quyết',
      value: stats.resolved,
      icon: CheckCircle2,
      variant: 'success',
    },
    {
      id: 'Rejected',
      status: 'Rejected',
      label: 'Đã bác bỏ',
      value: stats.rejected,
      icon: XCircle,
      variant: 'danger',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4', className)}>
      {cards.map((card) => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          unit="báo cáo"
          icon={card.icon}
          colorVariant={card.variant}
          isSelected={activeStatus === card.status}
          onClick={onSelectStatus ? () => onSelectStatus(card.status) : undefined}
          ariaLabel={`Lọc theo ${card.label}: ${card.value}`}
        />
      ))}
    </div>
  );
}

export default ReportStatsCards;
