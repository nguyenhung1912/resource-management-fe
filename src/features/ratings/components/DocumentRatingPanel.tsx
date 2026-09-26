import { memo, useCallback, useEffect, useState } from 'react';
import { RatingSummaryCard } from './RatingSummaryCard';
import { UserRatingActionCard } from './UserRatingActionCard';
import { RatingList } from './RatingList';
import type { PagedRatingResponse, RatingSummaryResponse } from '../types/rating.types';
import { useRatingsList } from '../hooks/useRatingsList';
import { ratingService } from '@/services/ratingService';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export interface DocumentRatingPanelProps {
  fileId: string;
  initialSummary?: RatingSummaryResponse | null;
  initialRatings?: PagedRatingResponse | null;
  onRequireLogin?: () => void;
  className?: string;
}

export const DocumentRatingPanel = memo(function DocumentRatingPanel({
  fileId,
  initialSummary = null,
  initialRatings = null,
  onRequireLogin,
  className,
}: DocumentRatingPanelProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = Boolean(user);

  const [summary, setSummary] = useState<RatingSummaryResponse | null>(initialSummary);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Sync summary when fileId or initialSummary changes
  const [prevFileId, setPrevFileId] = useState(fileId);
  if (prevFileId !== fileId) {
    setPrevFileId(fileId);
    setSummary(initialSummary);
  }

  const {
    items,
    totalItems,
    pageIndex,
    pageSize,
    totalPages,
    selectedStar,
    isLoading: isListLoading,
    error: listError,
    fetchRatings,
    setStarFilter,
    setPage,
    refreshRatings,
    setInitialData,
  } = useRatingsList({ initialData: initialRatings });

  // Update initial data in useRatingsList when fileId changes
  useEffect(() => {
    setInitialData(initialRatings, fileId);
    // If no initial ratings provided, fetch page 1
    if (!initialRatings) {
      void fetchRatings(fileId, 1, null);
    }
  }, [fileId, initialRatings, setInitialData, fetchRatings]);

  // Synchronize summary from server
  const reloadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const freshSummary = await ratingService.getRatingSummary(fileId);
      setSummary(freshSummary);
    } catch {
      // Ignored: summary revalidation failure handled gracefully
    } finally {
      setIsSummaryLoading(false);
    }
  }, [fileId]);

  // Triggered when current user creates or updates their rating
  const handleRatingSuccess = useCallback(async () => {
    await Promise.all([reloadSummary(), refreshRatings()]);
  }, [reloadSummary, refreshRatings]);

  // Triggered when current user deletes their rating
  const handleDeleteSuccess = useCallback(async () => {
    await Promise.all([reloadSummary(), refreshRatings()]);
  }, [reloadSummary, refreshRatings]);

  // Triggered when clicking a star distribution bar in the summary card or filter tabs
  const handleSelectStar = useCallback(
    (star: number | null) => {
      setStarFilter(star);
    },
    [setStarFilter],
  );

  return (
    <div className={cn('space-y-5', className)} data-testid="document-rating-panel">
      {/* Rating Summary & 5-Star Distribution Card */}
      <RatingSummaryCard
        summary={summary}
        isLoading={isSummaryLoading}
        selectedStar={selectedStar}
        onSelectStar={handleSelectStar}
      />

      {/* User Rating Action Box & Delete Action */}
      <UserRatingActionCard
        fileId={fileId}
        currentUserScore={summary?.currentUserRating ?? null}
        isAuthenticated={isAuthenticated}
        onRequireLogin={onRequireLogin}
        onRatingSuccess={handleRatingSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Rating Reviews List & Star Filtering */}
      <RatingList
        items={items}
        totalItems={totalItems}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isListLoading}
        error={listError}
        selectedStar={selectedStar}
        starCounts={summary?.starDistribution}
        onPageChange={setPage}
        onSelectStar={handleSelectStar}
      />
    </div>
  );
});

export default DocumentRatingPanel;
