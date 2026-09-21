import type { LucideIcon } from 'lucide-react';
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

import { DEFAULT_RESOURCE_STATS } from '../constants/resourceConstants';

export interface ResourceStatsProps {
  stats?: ResourceStat[];
  activeStatusId?: number;
  onSelectStatus?: (statusId: number) => void;
  className?: string;
}

export function ResourceStats({
  stats = DEFAULT_RESOURCE_STATS,
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
