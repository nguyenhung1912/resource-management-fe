import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_PATHS } from '@/constants/path';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { useCommentMutations } from '../hooks/useCommentMutations';
import { useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

export interface DocumentDiscussionPanelProps {
  fileId: string;
  initialComments?: PagedCommentResponse | null;
  onRequireLogin?: () => void;
  className?: string;
}

export const DocumentDiscussionPanel = memo(function DocumentDiscussionPanel({
  fileId,
  initialComments = null,
  onRequireLogin,
  className,
}: DocumentDiscussionPanelProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const {
    items,
    totalCount,
    hasNextPage,
    isLoading,
    isLoadingMore,
    error: fetchError,
    fetchComments,
    loadMoreComments,
    addComment,
    updateComment: updateCommentItem,
    removeComment: removeCommentItem,
    incrementTotalCount,
    setCommentsData,
  } = useComments({ initialData: initialComments });

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    isCommentLiking,
    isCommentDeleting,
  } = useCommentMutations();

  // Adjust comments data if fileId or initialComments change across document opens
  const [prevFileId, setPrevFileId] = useState<string>(fileId);
  if (prevFileId !== fileId) {
    setPrevFileId(fileId);
    setCommentsData(initialComments);
  }

  const handleRequireLogin = useCallback(() => {
    if (onRequireLogin) {
      onRequireLogin();
    } else {
      navigate(APP_PATHS.LOGIN);
    }
  }, [navigate, onRequireLogin]);

  const handleRefresh = useCallback(() => {
    clearMutationError();
    void fetchComments(fileId, 1);
  }, [clearMutationError, fetchComments, fileId]);

  const handleCreateRoot = useCallback(
    async (content: string) => {
      clearMutationError();
      const created = await createComment({ fileId, content });
      if (created) {
        addComment(created);
        return true;
      }
      return false;
    },
    [clearMutationError, createComment, fileId, addComment],
  );

  const handleReplySubmit = useCallback(
    async (parentCommentId: string, content: string) => {
      clearMutationError();
      const created = await createComment({
        fileId,
        content,
        parentCommentId,
      });
      if (created) {
        // Increment reply count on parent comment locally
        updateCommentItem(parentCommentId, (c) => ({
          ...c,
          replyCount: c.replyCount + 1,
        }));
        incrementTotalCount(1);
        return created;
      }
      return null;
    },
    [clearMutationError, createComment, fileId, updateCommentItem, incrementTotalCount],
  );

  const handleEditSubmit = useCallback(
    async (commentId: string, content: string) => {
      clearMutationError();
      const updated = await updateComment(commentId, content);
      if (updated) {
        updateCommentItem(commentId, {
          content: updated.content,
          updatedAt: updated.updatedAt,
        });
        return true;
      }
      return false;
    },
    [clearMutationError, updateComment, updateCommentItem],
  );

  const handleDeleteSubmit = useCallback(
    async (commentId: string) => {
      clearMutationError();
      const success = await deleteComment(commentId);
      if (success) {
        removeCommentItem(commentId);
        return true;
      }
      return false;
    },
    [clearMutationError, deleteComment, removeCommentItem],
  );

  const handleLikeToggle = useCallback(
    async (commentId: string, currentIsLiked: boolean): Promise<CommentItemResponse | null> => {
      clearMutationError();

      // Snapshot previous state if this is a root comment
      const prevComment = items.find((c) => c.commentId === commentId);

      // Optimistic update
      updateCommentItem(commentId, (c) => ({
        ...c,
        isLiked: !currentIsLiked,
        likeCount: !currentIsLiked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1),
      }));

      const result = await toggleLike(commentId, currentIsLiked);
      if (result) {
        updateCommentItem(commentId, {
          isLiked: result.isLiked,
          likeCount: result.likeCount,
        });
        return result;
      } else {
        // Rollback on failure
        if (prevComment) {
          updateCommentItem(commentId, {
            isLiked: prevComment.isLiked,
            likeCount: prevComment.likeCount,
          });
        } else {
          updateCommentItem(commentId, (c) => ({
            ...c,
            isLiked: currentIsLiked,
            likeCount: currentIsLiked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1),
          }));
        }
        return null;
      }
    },
    [clearMutationError, items, toggleLike, updateCommentItem],
  );

  const activeError = mutationError || fetchError;

  return (
    <section
      aria-label="Khu vực bình luận và thảo luận tài liệu"
      className={cn('flex flex-col h-full space-y-4', className)}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MessageSquare className="size-4" aria-hidden="true" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-text-main truncate">Bình luận & Thảo luận</h3>
          <Badge variant="primary" className="text-xs font-semibold px-2 py-0.5">
            {totalCount}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
          className="size-7.5 text-text-muted hover:text-text-main cursor-pointer"
          aria-label="Làm mới danh sách bình luận"
        >
          <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin text-primary')} aria-hidden="true" />
        </Button>
      </div>

      {/* Mutation / Fetch Error Banner */}
      {activeError && (
        <div
          role="alert"
          className="p-3 rounded-xl border border-danger/20 bg-danger/5 text-danger flex items-start gap-2.5 text-xs animate-in fade-in duration-100"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{activeError}</p>
          </div>
        </div>
      )}

      {/* Root Comment Form */}
      <div className="shrink-0">
        <CommentForm mode="root" onSubmit={handleCreateRoot} isSubmitting={isSubmitting} />
      </div>

      {/* Scrollable Comments Stream */}
      <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-1">
        <CommentList
          comments={items}
          currentUserId={user?.uid}
          currentUserRole={user?.role}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasNextPage={hasNextPage}
          onLoadMore={() => void loadMoreComments(fileId)}
          onLikeToggle={handleLikeToggle}
          onRequireLogin={handleRequireLogin}
          isCommentLiking={isCommentLiking}
          onSubmitReply={handleReplySubmit}
          onEditSubmit={handleEditSubmit}
          onDeleteSubmit={handleDeleteSubmit}
          isCommentDeleting={isCommentDeleting}
        />
      </div>
    </section>
  );
});

export default DocumentDiscussionPanel;
