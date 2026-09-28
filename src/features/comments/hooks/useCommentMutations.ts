import { useCallback, useRef, useState } from 'react';
import type { CommentItemResponse, CreateCommentRequest } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export function useCommentMutations() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);

  const likingRef = useRef<Record<string, boolean>>({});

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const createComment = useCallback(async (request: CreateCommentRequest): Promise<CommentItemResponse | null> => {
    setIsSubmitting(true);
    setMutationError(null);
    try {
      const response = await commentService.createComment(request);
      return response.data;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Không thể gửi bình luận.');
      setMutationError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateComment = useCallback(async (commentId: string, content: string): Promise<CommentItemResponse | null> => {
    setIsSubmitting(true);
    setMutationError(null);
    try {
      const response = await commentService.updateComment(commentId, { content });
      return response.data;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Không thể cập nhật bình luận.');
      setMutationError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    setDeletingMap((prev) => ({ ...prev, [commentId]: true }));
    setMutationError(null);
    try {
      await commentService.deleteComment(commentId);
      return true;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Không thể xóa bình luận.');
      setMutationError(message);
      return false;
    } finally {
      setDeletingMap((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    }
  }, []);

  const toggleLike = useCallback(async (commentId: string, isLiked: boolean): Promise<CommentItemResponse | null> => {
    if (likingRef.current[commentId]) {
      return null;
    }
    likingRef.current[commentId] = true;
    setLikingMap((prev) => ({ ...prev, [commentId]: true }));
    setMutationError(null);
    try {
      const response = isLiked
        ? await commentService.unlikeComment(commentId)
        : await commentService.likeComment(commentId);
      return response.data;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, isLiked ? 'Không thể bỏ thích.' : 'Không thể thích bình luận.');
      setMutationError(message);
      return null;
    } finally {
      delete likingRef.current[commentId];
      setLikingMap((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    }
  }, []);

  const isCommentLiking = useCallback((commentId: string): boolean => Boolean(likingMap[commentId]), [likingMap]);

  const isCommentDeleting = useCallback((commentId: string): boolean => Boolean(deletingMap[commentId]), [deletingMap]);

  return {
    isSubmitting,
    mutationError,
    clearMutationError,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    isCommentLiking,
    isCommentDeleting,
  };
}

export default useCommentMutations;
