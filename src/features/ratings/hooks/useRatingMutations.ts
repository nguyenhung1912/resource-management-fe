import { useCallback, useState } from 'react';
import type { RatingMutationResponse } from '../types/rating.types';
import { ratingService } from '@/services/ratingService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export function useRatingMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

  const clearMutationStatus = useCallback(() => {
    setMutationError(null);
    setMutationSuccess(null);
  }, []);

  const submitRating = useCallback(
    async (fileId: string, ratingScore: number, review?: string | null): Promise<RatingMutationResponse | null> => {
      setIsSubmitting(true);
      setMutationError(null);
      setMutationSuccess(null);

      try {
        const response = await ratingService.upsertRating({ fileId, ratingScore, review });
        setMutationSuccess(response.message || 'Đánh giá tài liệu thành công.');
        return response;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Không thể gửi đánh giá. Vui lòng thử lại.');
        setMutationError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const removeRating = useCallback(async (fileId: string): Promise<boolean> => {
    setIsDeleting(true);
    setMutationError(null);
    setMutationSuccess(null);

    try {
      const response = await ratingService.deleteRating(fileId);
      setMutationSuccess(response.message || 'Đã hủy đánh giá thành công.');
      return true;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Không thể hủy đánh giá. Vui lòng thử lại.');
      setMutationError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isSubmitting,
    isDeleting,
    mutationError,
    mutationSuccess,
    clearMutationStatus,
    submitRating,
    removeRating,
  };
}

export default useRatingMutations;
