import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { StatCard, type StatCardColorVariant } from '@/components/common/StatCard';
import { StatCardsGroup } from '@/components/common/StatCardsGroup';

export interface ResourceStat {
  label: string;
  value: number;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  badgeBg?: string;
  colorVariant?: StatCardColorVariant;
}

export const SAMPLE_RESOURCE_STATS: ResourceStat[] = [
  {
    label: 'Đã duyệt',
    value: 856,
    icon: CheckCircle2,
    colorVariant: 'success',
    iconClassName: 'text-success',
    badgeBg: 'bg-emerald-50 text-success',
  },
  {
    label: 'Chờ duyệt',
    value: 142,
    icon: Clock,
    colorVariant: 'warning',
    iconClassName: 'text-warning',
    badgeBg: 'bg-orange-50 text-warning',
  },
  {
    label: 'Bị từ chối',
    value: 24,
    icon: XCircle,
    colorVariant: 'danger',
    iconClassName: 'text-danger',
    badgeBg: 'bg-rose-50 text-danger',
  },
];

export interface ResourceStatsProps {
  stats?: ResourceStat[];
  activeStatusId?: number;
  onSelectStatus?: (statusId: number) => void;
  className?: string;
}

export function ResourceStats({
  stats = SAMPLE_RESOURCE_STATS,
  activeStatusId,
  onSelectStatus,
  className,
}: ResourceStatsProps) {
  const statusMapping: Record<string, number> = {
    'Đã duyệt': 1,
    'Chờ duyệt': 2,
    'Bị từ chối': 3,
  };

  return (
    <section aria-label="Thống kê tài nguyên" className={className}>
      <StatCardsGroup columns={3}>
        {stats.map((stat) => {
          const statusId = statusMapping[stat.label];
          const isSelected = activeStatusId !== undefined && activeStatusId === statusId;
          const Icon = stat.icon as LucideIcon;

          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={Icon}
              colorVariant={stat.colorVariant ?? 'primary'}
              iconBoxClassName={stat.badgeBg}
              isSelected={isSelected}
              onClick={onSelectStatus && statusId ? () => onSelectStatus(statusId) : undefined}
            />
          );
        })}
      </StatCardsGroup>
    </section>
  );
}

export default ResourceStats;
