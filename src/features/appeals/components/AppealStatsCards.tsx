import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
import { StatCard, type StatCardColorVariant } from '@/components/common/StatCard';
import type { AppealOverviewStats, AppealStatus } from '@/features/appeals/types/appeal.types';
import { cn } from '@/utils/cn';

export interface AppealStatsCardsProps {
  stats: AppealOverviewStats;
  activeStatus?: AppealStatus;
  onSelectStatus?: (status?: AppealStatus) => void;
  className?: string;
}

export function AppealStatsCards({ stats, activeStatus, onSelectStatus, className }: AppealStatsCardsProps) {
  const cards: Array<{
    id: string;
    status: AppealStatus | undefined;
    label: string;
    value: number;
    icon: typeof FileText;
    variant: StatCardColorVariant;
  }> = [
    {
      id: 'all',
      status: undefined,
      label: 'Tổng khiếu nại',
      value: stats.total,
      icon: FileText,
      variant: 'primary',
    },
    {
      id: 'Pending',
      status: 'Pending',
      label: 'Đang chờ duyệt',
      value: stats.pending,
      icon: Clock,
      variant: 'warning',
    },
    {
      id: 'Approved',
      status: 'Approved',
      label: 'Đã chấp thuận',
      value: stats.approved,
      icon: CheckCircle2,
      variant: 'success',
    },
    {
      id: 'Rejected',
      status: 'Rejected',
      label: 'Bị từ chối',
      value: stats.rejected,
      icon: XCircle,
      variant: 'danger',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4', className)}>
      {cards.map((card) => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          unit="đơn"
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

export default AppealStatsCards;
