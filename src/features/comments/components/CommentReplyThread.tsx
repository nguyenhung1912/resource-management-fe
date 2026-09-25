import { memo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { useCommentReplies } from '../hooks/useCommentReplies';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

export interface CommentReplyThreadProps {
  parentComment: CommentItemResponse;
  currentUserId?: string | null;
  currentUserRole?: string | null;
  isReplyFormOpen: boolean;
  onCloseReplyForm: () => void;
  onSubmitReply: (parentCommentId: string, content: string) => Promise<boolean | void>;
  onLikeToggle: (commentId: string, currentIsLiked: boolean) => Promise<void> | void;
  isCommentLiking: (commentId: string) => boolean;
  onEditSubmit: (commentId: string, content: string) => Promise<boolean | void>;
  onDeleteSubmit: (commentId: string) => Promise<boolean | void>;
  isCommentDeleting: (commentId: string) => boolean;
}

export const CommentReplyThread = memo(function CommentReplyThread({
  parentComment,
  currentUserId,
  currentUserRole,
  isReplyFormOpen,
  onCloseReplyForm,
  onSubmitReply,
  onLikeToggle,
  isCommentLiking,
  onEditSubmit,
  onDeleteSubmit,
  isCommentDeleting,
}: CommentReplyThreadProps) {
  const {
    replies,
    isExpanded,
    totalReplies,
    hasNextPage,
    isLoading,
    isLoadingMore,
    toggleExpand,
    loadMoreReplies,
    updateReply,
    removeReply,
  } = useCommentReplies({
    commentId: parentComment.commentId,
    initialReplyCount: parentComment.replyCount,
  });

  const handleReplyFormSubmit = useCallback(
    async (content: string) => {
      const result = await onSubmitReply(parentComment.commentId, content);
      if (result !== false) {
        onCloseReplyForm();
      }
    },
    [parentComment.commentId, onSubmitReply, onCloseReplyForm],
  );

  const handleEditReply = useCallback(
    async (commentId: string, content: string) => {
      const result = await onEditSubmit(commentId, content);
      if (result !== false) {
        updateReply(commentId, { content, updatedAt: new Date().toISOString() });
      }
    },
    [onEditSubmit, updateReply],
  );

  const handleDeleteReply = useCallback(
    async (commentId: string) => {
      const result = await onDeleteSubmit(commentId);
      if (result !== false) {
        removeReply(commentId);
      }
    },
    [onDeleteSubmit, removeReply],
  );

  const hasRepliesToToggle = totalReplies > 0 || replies.length > 0;

  return (
    <div className="space-y-2">
      {/* Toggle button to expand/collapse replies thread */}
      {hasRepliesToToggle && (
        <div className="pl-11 sm:pl-12 pt-0.5">
          <button
            type="button"
            onClick={toggleExpand}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Thu gọn câu trả lời'
                : `Xem ${totalReplies} câu trả lời cho bình luận của ${parentComment.authorName}`
            }
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : isExpanded ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
            <span>{isExpanded ? 'Thu gọn câu trả lời' : `Xem ${totalReplies} câu trả lời`}</span>
          </button>
        </div>
      )}

      {/* Indented Thread Container */}
      {(isExpanded || isReplyFormOpen) && (
        <div
          className="border-l-2 border-border-subtle/80 pl-3.5 ml-4 sm:ml-5 space-y-3 pt-1"
          aria-label={`Luồng câu trả lời cho bình luận của ${parentComment.authorName}`}
        >
          {/* Inline Reply Form */}
          {isReplyFormOpen && (
            <div className="pt-1">
              <CommentForm
                mode="reply"
                parentAuthorName={parentComment.authorName}
                autoFocus
                onSubmit={handleReplyFormSubmit}
                onCancel={onCloseReplyForm}
              />
            </div>
          )}

          {/* Expanded Replies List */}
          {isExpanded && (
            <>
              {replies.map((reply) => (
                <CommentItem
                  key={reply.commentId}
                  comment={reply}
                  isReply={true}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  isLiking={isCommentLiking(reply.commentId)}
                  isDeleting={isCommentDeleting(reply.commentId)}
                  onLikeToggle={onLikeToggle}
                  onEditSubmit={handleEditReply}
                  onDeleteSubmit={handleDeleteReply}
                />
              ))}

              {/* Load More Replies Button */}
              {hasNextPage && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={loadMoreReplies}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    {isLoadingMore && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
                    <span>Tải thêm câu trả lời...</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default CommentReplyThread;
