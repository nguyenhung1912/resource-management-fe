import { memo, useCallback, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { cn } from '@/utils/cn';
import { useCommentReplies } from '../hooks/useCommentReplies';
import { getTreeIndentationClass } from '../utils/commentTreeUtils';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

export interface CommentThreadNodeProps {
  comment: CommentItemResponse;
  depth?: number;
  parentAuthorName?: string | null;
  currentUserId?: string | null;
  currentUserRole?: string | null;
  isCommentLiking: (commentId: string) => boolean;
  isCommentDeleting: (commentId: string) => boolean;
  onLikeToggle: (commentId: string, currentIsLiked: boolean) => Promise<CommentItemResponse | null | void> | void;
  onRequireLogin?: () => void;
  onSubmitReply: (parentCommentId: string, content: string) => Promise<CommentItemResponse | null | boolean | void>;
  onEditSubmit: (commentId: string, content: string) => Promise<boolean | void>;
  onDeleteSubmit: (commentId: string) => Promise<boolean | void>;
  className?: string;
}

export const CommentThreadNode = memo(function CommentThreadNode({
  comment,
  depth = 0,
  parentAuthorName = null,
  currentUserId,
  currentUserRole,
  isCommentLiking,
  isCommentDeleting,
  onLikeToggle,
  onRequireLogin,
  onSubmitReply,
  onEditSubmit,
  onDeleteSubmit,
  className,
}: CommentThreadNodeProps) {
  const {
    replies,
    isExpanded,
    totalReplies,
    hasNextPage,
    isLoading,
    isLoadingMore,
    toggleExpand,
    expandReplies,
    collapseReplies,
    loadMoreReplies,
    addReply,
    updateReply,
    removeReply,
  } = useCommentReplies({
    commentId: comment.commentId,
    initialReplyCount: comment.replyCount,
  });

  const [isReplyFormOpen, setIsReplyFormOpen] = useState<boolean>(false);

  const handleReplyFormSubmit = useCallback(
    async (content: string) => {
      const result = await onSubmitReply(comment.commentId, content);
      if (result) {
        setIsReplyFormOpen(false);
        if (typeof result === 'object' && result !== null && 'commentId' in result) {
          addReply(result as CommentItemResponse);
        } else {
          void expandReplies();
        }
      }
    },
    [comment.commentId, onSubmitReply, addReply, expandReplies],
  );

  const handleEditChild = useCallback(
    async (childCommentId: string, newContent: string) => {
      const success = await onEditSubmit(childCommentId, newContent);
      if (success !== false) {
        updateReply(childCommentId, {
          content: newContent,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [onEditSubmit, updateReply],
  );

  const handleDeleteChild = useCallback(
    async (childCommentId: string) => {
      const success = await onDeleteSubmit(childCommentId);
      if (success !== false) {
        removeReply(childCommentId);
      }
    },
    [onDeleteSubmit, removeReply],
  );

  const handleLikeChild = useCallback(
    async (childCommentId: string, currentIsLiked: boolean): Promise<CommentItemResponse | null> => {
      const prevReply = replies.find((r) => r.commentId === childCommentId);

      // Optimistic update on child reply
      updateReply(childCommentId, (r) => ({
        ...r,
        isLiked: !currentIsLiked,
        likeCount: !currentIsLiked ? r.likeCount + 1 : Math.max(0, r.likeCount - 1),
      }));

      const result = await onLikeToggle(childCommentId, currentIsLiked);
      if (result && typeof result === 'object' && 'isLiked' in result) {
        updateReply(childCommentId, {
          isLiked: (result as CommentItemResponse).isLiked,
          likeCount: (result as CommentItemResponse).likeCount,
        });
        return result as CommentItemResponse;
      } else {
        // Rollback on failure
        if (prevReply) {
          updateReply(childCommentId, {
            isLiked: prevReply.isLiked,
            likeCount: prevReply.likeCount,
          });
        } else {
          updateReply(childCommentId, (r) => ({
            ...r,
            isLiked: currentIsLiked,
            likeCount: currentIsLiked ? r.likeCount + 1 : Math.max(0, r.likeCount - 1),
          }));
        }
        return null;
      }
    },
    [onLikeToggle, replies, updateReply],
  );

  const hasRepliesToToggle = totalReplies > 0 || replies.length > 0;
  const isReply = depth > 0;
  const childIndentationClass = getTreeIndentationClass(depth + 1);

  return (
    <div
      className={cn('space-y-2', className)}
      data-testid={`comment-thread-node-${comment.commentId}`}
      data-depth={depth}
    >
      {/* Current Comment Item */}
      <CommentItem
        comment={comment}
        isReply={isReply}
        parentAuthorName={parentAuthorName}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        isLiking={isCommentLiking(comment.commentId)}
        isDeleting={isCommentDeleting(comment.commentId)}
        onLikeToggle={onLikeToggle}
        onRequireLogin={onRequireLogin}
        onReplyClick={() => setIsReplyFormOpen((prev) => !prev)}
        onEditSubmit={onEditSubmit}
        onDeleteSubmit={onDeleteSubmit}
      />

      {/* Inline Reply Form (when user clicked "Trả lời" on this comment) */}
      {isReplyFormOpen && (
        <div className={cn('pt-1', childIndentationClass)}>
          <CommentForm
            mode="reply"
            parentAuthorName={comment.authorName}
            autoFocus
            onSubmit={handleReplyFormSubmit}
            onCancel={() => setIsReplyFormOpen(false)}
          />
        </div>
      )}

      {/* Button to toggle expand / collapse replies */}
      {hasRepliesToToggle && (
        <div className={cn('pt-0.5', isReply ? 'pl-8 sm:pl-9' : 'pl-11 sm:pl-12')}>
          <button
            type="button"
            onClick={toggleExpand}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Thu gọn câu trả lời'
                : `Xem ${totalReplies} câu trả lời cho bình luận của ${comment.authorName}`
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

      {/* Expanded Child Replies Thread Container */}
      {isExpanded && replies.length > 0 && (
        <div
          className={cn('space-y-3 pt-1', childIndentationClass)}
          role="group"
          aria-label={`Luồng câu trả lời cho bình luận của ${comment.authorName}`}
        >
          {replies.map((reply) => (
            <CommentThreadNode
              key={reply.commentId}
              comment={reply}
              depth={depth + 1}
              parentAuthorName={comment.authorName}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isCommentLiking={isCommentLiking}
              isCommentDeleting={isCommentDeleting}
              onLikeToggle={handleLikeChild}
              onRequireLogin={onRequireLogin}
              onSubmitReply={onSubmitReply}
              onEditSubmit={handleEditChild}
              onDeleteSubmit={handleDeleteChild}
            />
          ))}

          {/* Thread Footer Actions: Load More & Collapse */}
          {(hasNextPage || replies.length >= 3) && (
            <div className="pt-1 flex items-center justify-between gap-2 text-xs">
              {hasNextPage ? (
                <button
                  type="button"
                  onClick={loadMoreReplies}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-1 font-medium text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {isLoadingMore && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
                  <span>Tải thêm câu trả lời...</span>
                </button>
              ) : (
                <div />
              )}

              {replies.length >= 3 && (
                <button
                  type="button"
                  onClick={collapseReplies}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer ml-auto"
                  aria-label={`Thu gọn luồng câu trả lời của ${comment.authorName}`}
                >
                  <ChevronUp className="size-3" aria-hidden="true" />
                  <span>Thu gọn nhánh</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CommentThreadNode;
