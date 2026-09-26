import { memo, useMemo } from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';
import type { RatingSummaryResponse } from '../types/rating.types';
import { cn } from '@/utils/cn';

export interface RatingSummaryCardProps {
  summary: RatingSummaryResponse | null;
  isLoading?: boolean;
  selectedStar?: number | null;
  onSelectStar?: (star: number | null) => void;
  className?: string;
}

export const RatingSummaryCard = memo(function RatingSummaryCard({
  summary,
  isLoading = false,
  selectedStar = null,
  onSelectStar,
  className,
}: RatingSummaryCardProps) {
  const totalRatings = summary?.totalRatings ?? 0;
  const averageRating = summary?.averageRating ?? 0;

  const starPercentages = useMemo(() => {
    const distribution = summary?.starDistribution;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = distribution ? (distribution[star] ?? 0) : 0;
      const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
      return { star, count, percentage };
    });
  }, [summary?.starDistribution, totalRatings]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs animate-pulse space-y-4',
          className,
        )}
        data-testid="rating-summary-skeleton"
      >
        <div className="flex items-center gap-6">
          <div className="space-y-2">
            <div className="h-9 w-20 rounded-md bg-slate-200" />
            <div className="h-4 w-28 rounded-md bg-slate-200" />
            <div className="h-3 w-16 rounded-md bg-slate-200" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 rounded-full bg-slate-200 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 shadow-2xs transition-all duration-200',
        className,
      )}
      data-testid="rating-summary-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
        {/* Left Column: Big Score & Overview */}
        <div className="flex flex-col items-start sm:items-center justify-center sm:border-r sm:border-border-subtle sm:pr-6 shrink-0">
          <div className="flex items-baseline gap-1">
            <span
              className="text-3.5xl sm:text-4xl font-extrabold text-text-main tabular-nums leading-none tracking-tight"
              data-testid="summary-average-score"
            >
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm font-medium text-text-muted">/ 5</span>
          </div>

          <div className="mt-2">
            <StarRatingDisplay rating={averageRating} size="md" />
          </div>

          <div className="mt-2.5">
            <Badge variant="neutral" showDot={false} className="text-xs px-2.5 py-0.5 font-medium">
              <span data-testid="summary-total-ratings">{totalRatings.toLocaleString('vi-VN')}</span>
              <span className="ml-1 text-text-muted">lượt đánh giá</span>
            </Badge>
          </div>
        </div>

        {/* Right Column: Star Distribution Bars */}
        <div className="flex-1 space-y-1.5 w-full">
          {starPercentages.map(({ star, count, percentage }) => {
            const isSelected = selectedStar === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelectStar?.(isSelected ? null : star)}
                className={cn(
                  'group flex items-center gap-2.5 w-full text-left rounded-lg px-2 py-1 transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-slate-50',
                )}
                aria-label={`Lọc ${star} sao: ${count} đánh giá (${percentage}%)`}
                data-testid={`star-dist-row-${star}`}
              >
                {/* Star label */}
                <div className="flex items-center gap-1 w-8 shrink-0 text-xs font-semibold text-text-main group-hover:text-primary transition-colors">
                  <span>{star}</span>
                  <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                </div>

                {/* Progress bar track */}
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      isSelected ? 'bg-primary' : 'bg-amber-400 group-hover:bg-amber-500',
                    )}
                    style={{ width: `${percentage}%` }}
                    data-testid={`star-dist-bar-${star}`}
                  />
                </div>

                {/* Count badge */}
                <span
                  className={cn(
                    'text-[11px] font-medium tabular-nums min-w-9 text-right',
                    isSelected ? 'text-primary font-bold' : 'text-text-muted group-hover:text-text-main',
                  )}
                  data-testid={`star-dist-count-${star}`}
                >
                  {count.toLocaleString('vi-VN')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {totalRatings === 0 && (
        <p className="mt-3.5 pt-3 border-t border-border-subtle text-xs text-text-muted text-center italic">
          Tài liệu này chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
        </p>
      )}
    </div>
  );
});

export default RatingSummaryCard;
