import { type KeyboardEvent, memo, useCallback, useId, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StarInputSize = 'sm' | 'md' | 'lg';

export interface StarRatingInputProps {
  value: number | null;
  onChange: (score: number) => void;
  maxStars?: number;
  size?: StarInputSize;
  disabled?: boolean;
  readOnly?: boolean;
  showLabels?: boolean;
  labelPosition?: 'inline' | 'below';
  labels?: Record<number, string>;
  className?: string;
  ariaLabel?: string;
  id?: string;
}

const DEFAULT_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Cần cải thiện',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Xuất sắc',
};

const inputSizeClasses: Record<StarInputSize, { star: string; btn: string; text: string; gap: string }> = {
  sm: { star: 'size-4.5', btn: 'p-1', text: 'text-xs', gap: 'gap-1' },
  md: { star: 'size-6', btn: 'p-1.5', text: 'text-sm', gap: 'gap-1.5' },
  lg: { star: 'size-8', btn: 'p-2', text: 'text-base', gap: 'gap-2' },
};

export const StarRatingInput = memo(function StarRatingInput({
  value,
  onChange,
  maxStars = 5,
  size = 'md',
  disabled = false,
  readOnly = false,
  showLabels = true,
  labelPosition = 'inline',
  labels = DEFAULT_LABELS,
  className,
  ariaLabel = 'Đánh giá điểm số',
  id: externalId,
}: StarRatingInputProps) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const activeScore = hoverScore ?? value ?? 0;
  const sizeConfig = inputSizeClasses[size];
  const isInteractive = !disabled && !readOnly;

  const handleStarClick = useCallback(
    (star: number) => {
      if (!isInteractive) return;
      onChange(star);
    },
    [isInteractive, onChange],
  );

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (!isInteractive) return;
      setHoverScore(star);
    },
    [isInteractive],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverScore(null);
  }, [isInteractive]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return;

      const current = value ?? 0;
      let nextScore: number | null = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextScore = Math.min(maxStars, current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextScore = Math.max(1, current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextScore = 1;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextScore = maxStars;
      }

      if (nextScore !== null && nextScore !== value) {
        onChange(nextScore);
      }
    },
    [isInteractive, maxStars, onChange, value],
  );

  const activeLabel = activeScore > 0 ? labels[Math.round(activeScore)] : '';

  return (
    <div
      className={cn(
        'inline-flex select-none',
        labelPosition === 'below' ? 'flex-col items-center gap-1.5' : 'items-center gap-3',
        className,
      )}
    >
      <div
        id={inputId}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        aria-readonly={readOnly}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'inline-flex items-center rounded-lg outline-none transition-all',
          isInteractive && 'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeConfig.gap,
        )}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const star = index + 1;
          const isFilled = activeScore >= star;
          const isSelected = (value ?? 0) === star;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${star} trên ${maxStars} sao${labels[star] ? ` - ${labels[star]}` : ''}`}
              disabled={disabled}
              tabIndex={-1}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              className={cn(
                'group relative rounded-md transition-all duration-150 inline-flex items-center justify-center cursor-pointer outline-none',
                sizeConfig.btn,
                isInteractive && 'hover:scale-115 active:scale-95',
                disabled && 'cursor-not-allowed',
                readOnly && 'cursor-default pointer-events-none',
              )}
              data-testid={`star-input-${star}`}
            >
              <Star
                className={cn(
                  sizeConfig.star,
                  'transition-colors duration-150 shrink-0',
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.4)]'
                    : 'text-gray-300 fill-gray-100 hover:text-amber-200 hover:fill-amber-50',
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {showLabels && (
        <span
          className={cn(
            'font-medium transition-opacity duration-150 min-h-5 inline-flex items-center',
            sizeConfig.text,
            activeScore > 0 ? 'text-amber-600 font-semibold' : 'text-text-muted',
          )}
          data-testid="star-input-label"
          aria-live="polite"
        >
          {activeLabel || 'Chưa đánh giá'}
        </span>
      )}
    </div>
  );
});

export default StarRatingInput;
