import { useCallback, useState } from 'react';
import type { PagedCommentResponse } from '@/features/comments/types/comment.types';
import type { PagedRatingResponse, RatingSummaryResponse } from '@/features/ratings/types/rating.types';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';
import { commentService } from '@/services/commentService';
import { ratingService } from '@/services/ratingService';
import { resourceService } from '@/services/resourceService';

export function useLibraryResourceDetail() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ResourceDetailResponse | null>(null);
  const [commentsData, setCommentsData] = useState<PagedCommentResponse | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummaryResponse | null>(null);
  const [ratingsData, setRatingsData] = useState<PagedRatingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDetail = useCallback(async (fileId: string) => {
    setIsOpen(true);
    setSelectedFileId(fileId);
    setIsLoading(true);
    setError(null);

    // Ghi nhận lượt xem trong background
    void resourceService.recordHistoryView(fileId).catch(() => {
      // Ignored: Lịch sử xem không làm gián đoạn luồng xem chi tiết
    });

    try {
      // Nạp song song thông tin tài liệu, bình luận và đánh giá ban đầu (loại bỏ waterfall)
      const [resourceDetail, initialComments, initialRatingSummary, initialRatingsList] = await Promise.all([
        resourceService.getResourceDetail<ResourceDetailResponse>(fileId),
        commentService.getCommentsByFile(fileId).catch(() => null),
        ratingService.getRatingSummary(fileId).catch(() => null),
        ratingService.getRatingsList(fileId, { pageIndex: 1, pageSize: 10 }).catch(() => null),
      ]);
      setDetail(resourceDetail);
      setCommentsData(initialComments);
      setRatingSummary(initialRatingSummary);
      setRatingsData(initialRatingsList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết tài liệu thư viện.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setIsOpen(false);
    setSelectedFileId(null);
    setDetail(null);
    setCommentsData(null);
    setRatingSummary(null);
    setRatingsData(null);
    setError(null);
  }, []);

  const handleDownload = useCallback(async (fileId: string, fileName?: string) => {
    setIsDownloading(true);
    try {
      await resourceService.downloadResourceFile(fileId, fileName);
    } catch {
      // Ignored: Lỗi download
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isOpen,
    selectedFileId,
    detail,
    commentsData,
    ratingSummary,
    ratingsData,
    isLoading,
    isDownloading,
    error,
    openDetail,
    closeDetail,
    handleDownload,
  };
}

export default useLibraryResourceDetail;
