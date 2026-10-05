import type { LucideIcon } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { StatCardColorVariant } from '@/components/common/StatCard';
import { cn } from '@/utils/cn';
import { DEFAULT_RESOURCE_STATS } from '../constants/resourceConstants';

export interface ResourceStat {
  label: string;
  value: number;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  badgeBg?: string;
  colorVariant?: StatCardColorVariant;
}

export interface ResourceStatsProps {
  stats?: ResourceStat[];
  activeStatusId?: number;
  onSelectStatus?: (statusId: number) => void;
  className?: string;
}

const statusMapping: Record<string, number> = {
  'Đã duyệt': 1,
  'Chờ duyệt': 2,
  'Bị từ chối': 3,
};

const activeStyles: Record<string, { border: string; bg: string; text: string }> = {
  'Đã duyệt': {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50/30',
    text: 'text-emerald-600',
  },
  'Chờ duyệt': {
    border: 'border-amber-500',
    bg: 'bg-amber-50/30',
    text: 'text-amber-600',
  },
  'Bị từ chối': {
    border: 'border-rose-500',
    bg: 'bg-rose-50/30',
    text: 'text-rose-600',
  },
};

export function ResourceStats({
  stats = DEFAULT_RESOURCE_STATS,
  activeStatusId,
  onSelectStatus,
  className,
}: ResourceStatsProps) {
  const total = stats.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <section aria-label="Thống kê tài nguyên" className={className}>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-xs">
        {/* 1. Header telemetry */}
        <div className="flex flex-col gap-2.5 border-b border-border-subtle bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              TỔNG QUAN TÀI NGUYÊN HỌC LIỆU
            </span>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                {stats.map((s, idx) => {
                  const rate = Math.round((s.value / total) * 100);
                  const style = activeStyles[s.label] ?? { text: 'text-text-muted' };
                  return (
                    <span key={s.label} className="inline-flex items-center gap-1.5">
                      <span className={cn('font-medium', style.text)}>
                        {rate}% {s.label.toLowerCase()}
                      </span>
                      {idx < stats.length - 1 && <span>•</span>}
                    </span>
                  );
                })}
              </div>
              <div className="flex h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200/80">
                {stats.map((s) => {
                  const rate = Math.round((s.value / total) * 100);
                  const barColor =
                    s.label === 'Đã duyệt'
                      ? 'bg-emerald-500'
                      : s.label === 'Chờ duyệt'
                        ? 'bg-amber-500'
                        : 'bg-rose-500';
                  return (
                    <div
                      key={s.label}
                      style={{ width: `${rate}%` }}
                      className={cn(barColor, 'transition-all duration-300')}
                      title={`${s.label}: ${rate}%`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Dãy các khối chỉ số */}
        <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {stats.map((stat) => {
            const statusId = statusMapping[stat.label];
            const isSelected = activeStatusId !== undefined && activeStatusId === statusId;
            const Icon = stat.icon as LucideIcon;
            const rate = total > 0 ? Math.round((stat.value / total) * 100) : 0;
            const style = activeStyles[stat.label] ?? {
              border: 'border-primary',
              bg: 'bg-primary/5',
              text: 'text-primary',
            };

            return (
              <button
                key={stat.label}
                type="button"
                onClick={onSelectStatus && statusId ? () => onSelectStatus(statusId) : undefined}
                aria-label={`Lọc theo ${stat.label}: ${stat.value}`}
                aria-pressed={isSelected}
                className={cn(
                  'group flex flex-col justify-between p-4 text-left transition-all duration-150 outline-none sm:p-5',
                  isSelected
                    ? cn('border-b-2', style.border, style.bg)
                    : 'border-b-2 border-transparent hover:bg-gray-50/80',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-text-muted">{stat.label}</span>
                  <Icon
                    className={cn(
                      'size-4 transition-colors',
                      isSelected ? style.text : 'text-text-muted group-hover:text-primary',
                    )}
                  />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl">
                    {stat.value}
                  </span>
                  {total > 0 && (
                    <span
                      className={cn('rounded px-1.5 py-0.5 font-mono text-[11px] font-medium', style.bg, style.text)}
                    >
                      {rate}%
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[11px] text-text-muted">
                  {stat.label === 'Đã duyệt'
                    ? 'Học liệu công khai hợp lệ'
                    : stat.label === 'Chờ duyệt'
                      ? 'Đang chờ thẩm định'
                      : 'Không đạt tiêu chuẩn kiểm duyệt'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ResourceStats;
