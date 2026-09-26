import { useCallback, useRef, useState } from 'react';
import type { PagedRatingResponse, RatingItemResponse } from '../types/rating.types';
import { ratingService } from '@/services/ratingService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export interface UseRatingsListOptions {
  initialData?: PagedRatingResponse | null;
  pageSize?: number;
}

export function useRatingsList(options?: UseRatingsListOptions) {
  const initialPageSize = options?.pageSize ?? 10;
  const initialData = options?.initialData;

  const [items, setItems] = useState<RatingItemResponse[]>(initialData?.items ?? []);
  const [totalItems, setTotalItems] = useState<number>(initialData?.totalItems ?? 0);
  const [pageIndex, setPageIndex] = useState<number>(initialData?.pageIndex ?? 1);
  const [pageSize, setPageSize] = useState<number>(initialData?.pageSize ?? initialPageSize);
  const [totalPages, setTotalPages] = useState<number>(initialData?.totalPages ?? 0);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Store active fileId in a ref to avoid stale closure in callbacks
  const activeFileIdRef = useRef<string>('');

  const fetchRatings = useCallback(
    async (fileId: string, page = 1, star: number | null = null): Promise<void> => {
      if (!fileId.trim()) return;

      activeFileIdRef.current = fileId;
      setIsLoading(true);
      setError(null);

      try {
        const response = await ratingService.getRatingsList(fileId, {
          star: star ?? undefined,
          pageIndex: page,
          pageSize,
        });

        // Ensure we only apply results for the current file
        if (activeFileIdRef.current === fileId) {
          setItems(response.items);
          setTotalItems(response.totalItems);
          setPageIndex(response.pageIndex);
          setPageSize(response.pageSize);
          setTotalPages(response.totalPages);
          setSelectedStar(star);
        }
      } catch (err: unknown) {
        if (activeFileIdRef.current === fileId) {
          const message = getApiErrorMessage(err, 'Không thể tải danh sách đánh giá.');
          setError(message);
        }
      } finally {
        if (activeFileIdRef.current === fileId) {
          setIsLoading(false);
        }
      }
    },
    [pageSize],
  );

  const setStarFilter = useCallback(
    (star: number | null) => {
      const fileId = activeFileIdRef.current;
      if (fileId) {
        void fetchRatings(fileId, 1, star);
      } else {
        setSelectedStar(star);
      }
    },
    [fetchRatings],
  );

  const setPage = useCallback(
    (page: number) => {
      const fileId = activeFileIdRef.current;
      if (fileId) {
        void fetchRatings(fileId, page, selectedStar);
      } else {
        setPageIndex(page);
      }
    },
    [fetchRatings, selectedStar],
  );

  const refreshRatings = useCallback(() => {
    const fileId = activeFileIdRef.current;
    if (fileId) {
      return fetchRatings(fileId, pageIndex, selectedStar);
    }
    return Promise.resolve();
  }, [fetchRatings, pageIndex, selectedStar]);

  const setInitialData = useCallback((data: PagedRatingResponse | null, fileId: string) => {
    activeFileIdRef.current = fileId;
    if (data) {
      setItems(data.items);
      setTotalItems(data.totalItems);
      setPageIndex(data.pageIndex);
      setPageSize(data.pageSize);
      setTotalPages(data.totalPages);
      setSelectedStar(null);
    } else {
      setItems([]);
      setTotalItems(0);
      setPageIndex(1);
      setTotalPages(0);
      setSelectedStar(null);
    }
    setError(null);
  }, []);

  return {
    items,
    totalItems,
    pageIndex,
    pageSize,
    totalPages,
    selectedStar,
    isLoading,
    error,
    fetchRatings,
    setStarFilter,
    setPage,
    refreshRatings,
    setInitialData,
  };
}

export default useRatingsList;
