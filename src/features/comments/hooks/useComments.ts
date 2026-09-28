import { useCallback, useState } from 'react';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export interface UseCommentsOptions {
  initialData?: PagedCommentResponse | null;
  pageSize?: number;
}

export function useComments(options: UseCommentsOptions = {}) {
  const defaultPageSize = options.pageSize ?? 10;

  const [items, setItems] = useState<CommentItemResponse[]>(options.initialData?.items ?? []);
  const [pageIndex, setPageIndex] = useState<number>(options.initialData?.pageIndex ?? 1);
  const [pageSize, setPageSize] = useState<number>(options.initialData?.pageSize ?? defaultPageSize);
  const [totalCount, setTotalCount] = useState<number>(options.initialData?.totalCount ?? 0);
  const [totalPages, setTotalPages] = useState<number>(options.initialData?.totalPages ?? 1);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(options.initialData?.hasPreviousPage ?? false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(options.initialData?.hasNextPage ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const applyPagedData = useCallback((data: PagedCommentResponse, isAppend: boolean) => {
    setItems((prev) => (isAppend ? [...prev, ...data.items] : data.items));
    setPageIndex(data.pageIndex);
    setPageSize(data.pageSize);
    setTotalCount(data.totalCount);
    setTotalPages(data.totalPages);
    setHasPreviousPage(data.hasPreviousPage);
    setHasNextPage(data.hasNextPage);
  }, []);

  const setCommentsData = useCallback(
    (data: PagedCommentResponse | null) => {
      if (!data) {
        setItems([]);
        setPageIndex(1);
        setTotalCount(0);
        setTotalPages(1);
        setHasPreviousPage(false);
        setHasNextPage(false);
        setError(null);
        return;
      }
      applyPagedData(data, false);
      setError(null);
    },
    [applyPagedData],
  );

  const fetchComments = useCallback(
    async (fileId: string, targetPage = 1): Promise<PagedCommentResponse | null> => {
      if (!fileId.trim()) return null;

      const isAppend = targetPage > 1;
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await commentService.getCommentsByFile(fileId, {
          pageIndex: targetPage,
          pageSize,
        });
        applyPagedData(response, isAppend);
        return response;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Không thể tải danh sách bình luận.');
        setError(message);
        return null;
      } finally {
        if (isAppend) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [pageSize, applyPagedData],
  );

  const loadMoreComments = useCallback(
    async (fileId: string): Promise<PagedCommentResponse | null> => {
      if (!hasNextPage || isLoadingMore || isLoading) return null;
      return fetchComments(fileId, pageIndex + 1);
    },
    [hasNextPage, isLoadingMore, isLoading, pageIndex, fetchComments],
  );

  const addComment = useCallback((newComment: CommentItemResponse) => {
    setItems((prev) => [newComment, ...prev]);
    setTotalCount((prev) => prev + 1);
  }, []);

  const updateComment = useCallback(
    (commentId: string, updater: Partial<CommentItemResponse> | ((c: CommentItemResponse) => CommentItemResponse)) => {
      setItems((prev) =>
        prev.map((c) => {
          if (c.commentId !== commentId) return c;
          if (typeof updater === 'function') {
            return updater(c);
          }
          return { ...c, ...updater };
        }),
      );
    },
    [],
  );

  const removeComment = useCallback((commentId: string) => {
    setItems((prev) => prev.filter((c) => c.commentId !== commentId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  }, []);

  const incrementTotalCount = useCallback((delta = 1) => {
    setTotalCount((prev) => Math.max(0, prev + delta));
  }, []);

  const resetComments = useCallback(() => {
    setItems([]);
    setPageIndex(1);
    setTotalCount(0);
    setTotalPages(1);
    setHasPreviousPage(false);
    setHasNextPage(false);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
  }, []);

  return {
    items,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    isLoading,
    isLoadingMore,
    error,
    setCommentsData,
    fetchComments,
    loadMoreComments,
    addComment,
    updateComment,
    removeComment,
    incrementTotalCount,
    resetComments,
  };
}

export default useComments;
