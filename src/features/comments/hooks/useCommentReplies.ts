import { useCallback, useState } from 'react';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export interface UseCommentRepliesOptions {
  commentId: string;
  initialReplyCount?: number;
  pageSize?: number;
}

export function useCommentReplies({ commentId, initialReplyCount = 0, pageSize = 5 }: UseCommentRepliesOptions) {
  const [replies, setReplies] = useState<CommentItemResponse[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalReplies, setTotalReplies] = useState<number>(initialReplyCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if commentId changes across recycled node components
  const [prevCommentId, setPrevCommentId] = useState<string>(commentId);
  if (prevCommentId !== commentId) {
    setPrevCommentId(commentId);
    setReplies([]);
    setIsExpanded(false);
    setHasLoaded(false);
    setPageIndex(1);
    setTotalReplies(initialReplyCount);
    setHasNextPage(false);
    setError(null);
  }

  // Sync total count if initialReplyCount changes externally before replies are loaded
  const [prevInitialCount, setPrevInitialCount] = useState<number>(initialReplyCount);
  if (prevInitialCount !== initialReplyCount) {
    setPrevInitialCount(initialReplyCount);
    if (!hasLoaded) {
      setTotalReplies(initialReplyCount);
    }
  }

  const applyPagedData = useCallback((data: PagedCommentResponse, isAppend: boolean) => {
    if (!data || !Array.isArray(data.items)) return;

    setReplies((prev) => {
      if (!isAppend) {
        return data.items;
      }
      // Deduplicate when appending subsequent pages
      const existingIds = new Set(prev.map((r) => r.commentId));
      const newItems = data.items.filter((item) => !existingIds.has(item.commentId));
      return [...prev, ...newItems];
    });
    setPageIndex(data.pageIndex);
    setTotalReplies(data.totalCount);
    setHasNextPage(data.hasNextPage);
    setHasLoaded(true);
  }, []);

  const fetchReplies = useCallback(
    async (targetPage = 1): Promise<PagedCommentResponse | null> => {
      if (!commentId.trim()) return null;

      const isAppend = targetPage > 1;
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await commentService.getReplies(commentId, {
          pageIndex: targetPage,
          pageSize,
        });
        if (response) {
          applyPagedData(response, isAppend);
        }
        return response;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Không thể tải câu trả lời.');
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
    [commentId, pageSize, applyPagedData],
  );

  const expandReplies = useCallback(async () => {
    setIsExpanded(true);
    if (!hasLoaded) {
      await fetchReplies(1);
    }
  }, [hasLoaded, fetchReplies]);

  const collapseReplies = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const toggleExpand = useCallback(async () => {
    if (isExpanded) {
      collapseReplies();
      return;
    }
    await expandReplies();
  }, [isExpanded, collapseReplies, expandReplies]);

  const loadMoreReplies = useCallback(async (): Promise<PagedCommentResponse | null> => {
    if (!hasNextPage || isLoadingMore || isLoading) return null;
    return fetchReplies(pageIndex + 1);
  }, [hasNextPage, isLoadingMore, isLoading, pageIndex, fetchReplies]);

  const addReply = useCallback((newReply: CommentItemResponse) => {
    setReplies((prev) => {
      if (prev.some((r) => r.commentId === newReply.commentId)) {
        return prev;
      }
      return [...prev, newReply];
    });
    setTotalReplies((prev) => Math.max(prev + 1, 1));
    setIsExpanded(true);
    setHasLoaded(true);
  }, []);

  const updateReply = useCallback(
    (replyId: string, updater: Partial<CommentItemResponse> | ((r: CommentItemResponse) => CommentItemResponse)) => {
      setReplies((prev) =>
        prev.map((r) => {
          if (r.commentId !== replyId) return r;
          if (typeof updater === 'function') {
            return updater(r);
          }
          return { ...r, ...updater };
        }),
      );
    },
    [],
  );

  const removeReply = useCallback((replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.commentId !== replyId));
    setTotalReplies((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    replies,
    isExpanded,
    hasLoaded,
    totalReplies,
    hasNextPage,
    isLoading,
    isLoadingMore,
    error,
    toggleExpand,
    expandReplies,
    collapseReplies,
    fetchReplies,
    loadMoreReplies,
    addReply,
    updateReply,
    removeReply,
  };
}

export default useCommentReplies;
