import { AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ModerationAiRiskFilter, ModerationQueueOverviewStats } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface ModerationQueueStatsCardsProps {
  stats: ModerationQueueOverviewStats;
  activeRisk?: ModerationAiRiskFilter;
  onSelectRisk?: (risk: ModerationAiRiskFilter) => void;
  className?: string;
}

interface StatItem {
  id: ModerationAiRiskFilter;
  label: string;
  value: number;
  icon: LucideIcon;
  dotColor: string;
  activeClass: string;
}

export function ModerationQueueStatsCards({
  stats,
  activeRisk = 'all',
  onSelectRisk,
  className,
}: ModerationQueueStatsCardsProps) {
  const items: StatItem[] = [
    {
      id: 'all',
      label: 'Chờ thẩm định',
      value: stats.totalPending,
      icon: Clock,
      dotColor: 'bg-primary',
      activeClass: 'bg-primary/10 text-primary border-danger-0 border-primary font-semibold shadow-xs',
    },
    {
      id: 'danger',
      label: 'Nguy cơ cao (>30%)',
      value: stats.highPlagiarismRisk,
      icon: AlertTriangle,
      dotColor: 'bg-danger',
      activeClass: 'bg-danger/10 text-danger border-danger font-semibold shadow-xs',
    },
    {
      id: 'safe',
      label: 'An toàn (≤15%)',
      value: stats.safePlagiarism,
      icon: CheckCircle2,
      dotColor: 'bg-success',
      activeClass: 'bg-success/10 text-success border-success font-semibold shadow-xs',
    },
    {
      id: 'uninspected',
      label: 'Chưa quét AI',
      value: stats.uninspectedCount,
      icon: Sparkles,
      dotColor: 'bg-secondary',
      activeClass: 'bg-neutral-100 text-text-main border-secondary/50 font-semibold shadow-xs',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Thống kê hàng đợi kiểm duyệt"
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-2 bg-surface p-1.5 rounded-xl border border-border-subtle shadow-xs',
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = activeRisk === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={onSelectRisk ? () => onSelectRisk(item.id) : undefined}
            aria-label={`Lọc theo ${item.label}: ${item.value} tài liệu`}
            aria-pressed={isSelected}
            className={cn(
              'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all text-left cursor-pointer border',
              isSelected
                ? item.activeClass
                : 'bg-transparent border-transparent text-text-muted hover:bg-background hover:text-text-main',
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('h-2 w-2 rounded-full shrink-0', item.dotColor)} aria-hidden="true" />
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
              <span className="truncate text-xs font-medium">{item.label}</span>
            </div>

            <span
              className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums shrink-0',
                isSelected ? 'bg-surface/80 shadow-2xs' : 'bg-background text-text-main',
              )}
            >
              {item.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ModerationQueueStatsCards;
