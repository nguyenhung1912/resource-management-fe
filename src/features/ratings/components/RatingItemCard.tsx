import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { StarRatingDisplay } from '@/components/ui/StarRatingDisplay';
import type { RatingItemResponse } from '../types/rating.types';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';

export interface RatingItemCardProps {
  item: RatingItemResponse;
  className?: string;
}

const AVATAR_COLOR_PALETTES = [
  'bg-blue-100 text-blue-700 border-blue-200/60',
  'bg-emerald-100 text-emerald-700 border-emerald-200/60',
  'bg-indigo-100 text-indigo-700 border-indigo-200/60',
  'bg-amber-100 text-amber-700 border-amber-200/60',
  'bg-rose-100 text-rose-700 border-rose-200/60',
  'bg-purple-100 text-purple-700 border-purple-200/60',
  'bg-teal-100 text-teal-700 border-teal-200/60',
];

function getInitials(name: string): string {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
  return AVATAR_COLOR_PALETTES[index];
}

export const RatingItemCard = memo(function RatingItemCard({ item, className }: RatingItemCardProps) {
  const initials = useMemo(() => getInitials(item.fullName), [item.fullName]);
  const avatarColor = useMemo(() => getAvatarColorClass(item.fullName), [item.fullName]);
  const timeFormatted = useMemo(() => formatRelativeTime(item.createdAt), [item.createdAt]);

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-2xs space-y-2.5 transition-colors hover:border-slate-300',
        className,
      )}
      data-testid={`rating-item-${item.ratingId || item.uid}`}
    >
      {/* Top row: Avatar + Name + Role + Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar initials */}
          <div
            className={cn(
              'size-8 sm:size-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border',
              avatarColor,
            )}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* User information */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-text-main truncate">{item.fullName}</span>
              {item.roleName && (
                <Badge variant="neutral" showDot={false} className="text-[10px] px-1.5 py-0 font-medium">
                  {item.roleName}
                </Badge>
              )}
            </div>

            <span className="text-[11px] text-text-muted">{timeFormatted}</span>
          </div>
        </div>

        {/* Rating score stars */}
        <div className="shrink-0 pt-0.5">
          <StarRatingDisplay rating={item.ratingScore} size="sm" showScore scorePosition="right" />
        </div>
      </div>

      {/* Review content if provided */}
      {item.review && (
        <p className="text-xs sm:text-sm text-text-main leading-relaxed whitespace-pre-line pl-10.5 sm:pl-11">
          {item.review}
        </p>
      )}
    </div>
  );
});

export default RatingItemCard;
