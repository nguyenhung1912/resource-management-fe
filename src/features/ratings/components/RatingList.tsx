import { memo } from 'react';
import { Star, StarOff } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import type { RatingItemResponse } from '../types/rating.types';
import { RatingFilterTabs } from './RatingFilterTabs';
import { RatingItemCard } from './RatingItemCard';
import { cn } from '@/utils/cn';

export interface RatingListProps {
  items: RatingItemResponse[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error?: string | null;
  selectedStar: number | null;
  starCounts?: Record<number, number>;
  onPageChange: (page: number) => void;
  onSelectStar: (star: number | null) => void;
  className?: string;
}

export const RatingList = memo(function RatingList({
  items,
  totalItems,
  pageIndex,
  pageSize,
  totalPages,
  isLoading,
  error,
  selectedStar,
  starCounts,
  onPageChange,
  onSelectStar,
  className,
}: RatingListProps) {
  return (
    <div className={cn('space-y-4', className)} data-testid="rating-list-container">
      {/* Star Filter Tabs */}
      {(totalItems > 0 || selectedStar !== null) && (
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2.5">
          <RatingFilterTabs
            selectedStar={selectedStar}
            counts={starCounts}
            totalCount={totalItems}
            onSelectStar={onSelectStar}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-medium"
        >
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && items.length === 0 ? (
        <div className="space-y-3" data-testid="rating-list-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-border-subtle bg-surface animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-24 rounded-md bg-slate-200" />
                    <div className="h-2.5 w-16 rounded-md bg-slate-200" />
                  </div>
                </div>
                <div className="h-4 w-16 rounded-md bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={selectedStar !== null ? StarOff : Star}
          iconBg="bg-amber-50 text-amber-500"
          title={selectedStar !== null ? `Chưa có đánh giá ${selectedStar} sao nào` : 'Chưa có lượt đánh giá nào'}
          description={
            selectedStar !== null
              ? 'Tài liệu chưa nhận được đánh giá nào ở mức sao này. Bạn có thể chọn mức sao khác hoặc quay lại xem tất cả.'
              : 'Hãy là người đầu tiên chia sẻ cảm nhận và đánh giá về tài liệu này.'
          }
          className="py-6 sm:py-7"
        />
      ) : (
        /* List of Ratings */
        <div className="space-y-2.5" data-testid="rating-items-list">
          {items.map((item) => (
            <RatingItemCard key={item.ratingId || `${item.uid}-${item.createdAt}`} item={item} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={pageIndex}
            totalPages={totalPages}
            totalCount={totalItems}
            pageSize={pageSize}
            itemLabel="đánh giá"
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
});

export default RatingList;
