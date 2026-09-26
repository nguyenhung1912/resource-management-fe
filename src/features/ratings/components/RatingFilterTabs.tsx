import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RatingFilterTabsProps {
  selectedStar: number | null;
  counts?: Record<number, number>;
  totalCount?: number;
  onSelectStar: (star: number | null) => void;
  className?: string;
}

export const RatingFilterTabs = memo(function RatingFilterTabs({
  selectedStar,
  counts,
  totalCount,
  onSelectStar,
  className,
}: RatingFilterTabsProps) {
  const tabs = [
    { star: null, label: 'Tất cả', count: totalCount },
    { star: 5, label: '5', count: counts?.[5] },
    { star: 4, label: '4', count: counts?.[4] },
    { star: 3, label: '3', count: counts?.[3] },
    { star: 2, label: '2', count: counts?.[2] },
    { star: 1, label: '1', count: counts?.[1] },
  ];

  return (
    <div
      role="group"
      aria-label="Lọc đánh giá theo số sao"
      className={cn('flex flex-wrap items-center gap-1.5 overflow-x-auto select-none py-1', className)}
    >
      {tabs.map((tab) => {
        const isSelected = selectedStar === tab.star;
        const count = tab.count ?? 0;

        return (
          <button
            key={tab.star === null ? 'all' : String(tab.star)}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectStar(tab.star)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isSelected
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-text-muted hover:bg-slate-200/70 hover:text-text-main',
            )}
            data-testid={`filter-tab-${tab.star === null ? 'all' : tab.star}`}
          >
            {tab.star !== null && (
              <Star
                className={cn(
                  'size-3 shrink-0',
                  isSelected ? 'fill-white text-white' : 'fill-amber-400 text-amber-400',
                )}
                aria-hidden="true"
              />
            )}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold leading-none',
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-text-muted',
                )}
              >
                {count.toLocaleString('vi-VN')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default RatingFilterTabs;
