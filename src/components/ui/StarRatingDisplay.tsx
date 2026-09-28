import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StarRatingSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StarRatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: StarRatingSize;
  showScore?: boolean;
  scorePosition?: 'left' | 'right';
  count?: number;
  className?: string;
  scoreClassName?: string;
  ariaLabel?: string;
}

const sizeClasses: Record<StarRatingSize, { star: string; text: string; gap: string }> = {
  xs: { star: 'size-3', text: 'text-[11px]', gap: 'gap-0.5' },
  sm: { star: 'size-3.5', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'size-4', text: 'text-sm', gap: 'gap-1' },
  lg: { star: 'size-5', text: 'text-base', gap: 'gap-1' },
};

export const StarRatingDisplay = memo(function StarRatingDisplay({
  rating,
  maxStars = 5,
  size = 'md',
  showScore = false,
  scorePosition = 'right',
  count,
  className,
  scoreClassName,
  ariaLabel,
}: StarRatingDisplayProps) {
  const clampedRating = Math.max(0, Math.min(maxStars, Number.isFinite(rating) ? rating : 0));
  const roundedScore = clampedRating.toFixed(1);
  const sizeConfig = sizeClasses[size];

  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starIndex = index + 1;
    let fillPercent = 0;

    if (clampedRating >= starIndex) {
      fillPercent = 100;
    } else if (clampedRating > starIndex - 1) {
      fillPercent = Math.round((clampedRating - (starIndex - 1)) * 100);
    }

    return (
      <span
        key={starIndex}
        className={cn('relative inline-flex items-center justify-center shrink-0 select-none', sizeConfig.star)}
        data-testid={`star-display-${starIndex}`}
      >
        {/* Background empty star */}
        <Star className={cn(sizeConfig.star, 'text-gray-200 fill-gray-200 shrink-0')} aria-hidden="true" />

        {/* Foreground filled/partial star */}
        {fillPercent > 0 && (
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${fillPercent}%` }}
            data-testid={`star-fill-${starIndex}`}
          >
            <Star className={cn(sizeConfig.star, 'text-amber-400 fill-amber-400 shrink-0')} aria-hidden="true" />
          </span>
        )}
      </span>
    );
  });

  const scoreElement = showScore && (
    <span
      className={cn('font-semibold text-text-main tabular-nums', sizeConfig.text, scoreClassName)}
      data-testid="star-display-score"
    >
      {roundedScore}
    </span>
  );

  const countElement = typeof count === 'number' && (
    <span className={cn('text-text-muted tabular-nums', sizeConfig.text)} data-testid="star-display-count">
      ({count.toLocaleString('vi-VN')})
    </span>
  );

  const defaultLabel = `${roundedScore} trên ${maxStars} sao${typeof count === 'number' ? ` (${count} đánh giá)` : ''}`;

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      className={cn('inline-flex items-center gap-1.5 leading-none', className)}
    >
      {scorePosition === 'left' && scoreElement}
      <div className={cn('inline-flex items-center', sizeConfig.gap)}>{stars}</div>
      {scorePosition === 'right' && scoreElement}
      {countElement}
    </div>
  );
});

export default StarRatingDisplay;
