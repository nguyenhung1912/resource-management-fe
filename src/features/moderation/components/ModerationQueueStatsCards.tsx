import { AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { StatCard, type StatCardColorVariant } from '@/components/common/StatCard';
import type { ModerationAiRiskFilter, ModerationQueueOverviewStats } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface ModerationQueueStatsCardsProps {
  stats: ModerationQueueOverviewStats;
  activeRisk?: ModerationAiRiskFilter;
  onSelectRisk?: (risk: ModerationAiRiskFilter) => void;
  className?: string;
}

export function ModerationQueueStatsCards({
  stats,
  activeRisk = 'all',
  onSelectRisk,
  className,
}: ModerationQueueStatsCardsProps) {
  const cards: Array<{
    id: ModerationAiRiskFilter;
    label: string;
    value: number;
    icon: typeof Clock;
    variant: StatCardColorVariant;
    detail: string;
  }> = [
    {
      id: 'all',
      label: 'Chờ thẩm định',
      value: stats.totalPending,
      icon: Clock,
      variant: 'primary',
      detail: 'Tổng số tài liệu đang chờ duyệt',
    },
    {
      id: 'danger',
      label: 'Nguy cơ cao (>30%)',
      value: stats.highPlagiarismRisk,
      icon: AlertTriangle,
      variant: 'danger',
      detail: 'Tỷ lệ trùng lặp vượt ngưỡng',
    },
    {
      id: 'safe',
      label: 'An toàn (≤15%)',
      value: stats.safePlagiarism,
      icon: CheckCircle2,
      variant: 'success',
      detail: 'Mức độ trùng lặp đạt chuẩn',
    },
    {
      id: 'uninspected',
      label: 'Chưa quét AI',
      value: stats.uninspectedCount,
      icon: Sparkles,
      variant: 'neutral',
      detail: 'Cần kích hoạt quét kiểm tra',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Thống kê hàng đợi kiểm duyệt"
      className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4', className)}
    >
      {cards.map((card) => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          unit="tài liệu"
          detail={card.detail}
          icon={card.icon}
          colorVariant={card.variant}
          isSelected={activeRisk === card.id}
          onClick={onSelectRisk ? () => onSelectRisk(card.id) : undefined}
          ariaLabel={`Lọc theo ${card.label}: ${card.value} tài liệu`}
        />
      ))}
    </div>
  );
}

export default ModerationQueueStatsCards;
