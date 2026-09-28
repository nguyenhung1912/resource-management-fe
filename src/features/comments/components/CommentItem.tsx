import { memo, useCallback, useState } from 'react';
import { CornerDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { useReportModalStore } from '@/store/useReportModalStore';
import { cn } from '@/utils/cn';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { getCommentAuthorInitials, getRoleBadgeInfo } from '../utils/commentUtils';
import { CommentActionMenu } from './CommentActionMenu';
import { CommentDeleteModal } from './CommentDeleteModal';
import { CommentForm } from './CommentForm';
import { CommentLikeButton } from './CommentLikeButton';

export interface CommentItemProps {
  comment: CommentItemResponse;
  currentUserId?: string | null;
  currentUserRole?: string | null;
  isReply?: boolean;
  parentAuthorName?: string | null;
  isLiking?: boolean;
  isDeleting?: boolean;
  onLikeToggle: (commentId: string, currentIsLiked: boolean) => Promise<CommentItemResponse | null | void> | void;
  onReplyClick?: () => void;
  onRequireLogin?: () => void;
  onEditSubmit: (commentId: string, newContent: string) => Promise<boolean | void>;
  onDeleteSubmit: (commentId: string) => Promise<boolean | void>;
  className?: string;
}

export const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  isReply = false,
  parentAuthorName = null,
  isLiking = false,
  isDeleting = false,
  onLikeToggle,
  onReplyClick,
  onRequireLogin,
  onEditSubmit,
  onDeleteSubmit,
  className,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const openReportModal = useReportModalStore((s) => s.openReportModal);

  const isAuthor = Boolean(currentUserId && currentUserId === comment.uid);
  const isAdmin = currentUserRole === 'Admin';
  const canDelete = isAuthor || isAdmin;
  const canEdit = isAuthor;
  const canReport = Boolean(currentUserId && !isAuthor);

  const roleInfo = getRoleBadgeInfo(comment.authorRole);
  const initials = getCommentAuthorInitials(comment.authorName);
  const relativeTime = formatRelativeTime(comment.createdAt);
  const fullTime = formatDateTime(comment.createdAt);
  const isEdited = Boolean(comment.updatedAt && comment.updatedAt !== comment.createdAt);

  const handleSaveEdit = useCallback(
    async (newContent: string) => {
      if (newContent.trim() === comment.content.trim()) {
        setIsEditing(false);
        return true;
      }
      setIsUpdating(true);
      try {
        const success = await onEditSubmit(comment.commentId, newContent);
        if (success !== false) {
          setIsEditing(false);
        }
        return success;
      } finally {
        setIsUpdating(false);
      }
    },
    [comment.commentId, comment.content, onEditSubmit],
  );

  const handleOpenDeleteModal = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteDialogOpen(false);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    const success = await onDeleteSubmit(comment.commentId);
    if (success !== false) {
      setIsDeleteDialogOpen(false);
    }
  }, [comment.commentId, onDeleteSubmit]);

  const handleReport = useCallback(() => {
    openReportModal({
      type: 'Comment',
      id: comment.commentId,
      content: comment.content,
      authorName: comment.authorName,
      fileId: comment.fileId,
      uidtarget: comment.uid,
    });
  }, [comment, openReportModal]);

  const handleParentMentionClick = useCallback(() => {
    if (!comment.parentCommentId) return;
    const parentEl = document.getElementById(`comment-${comment.parentCommentId}`);
    if (parentEl) {
      parentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      parentEl.classList.add('ring-2', 'ring-primary/40', 'bg-primary/5', 'rounded-xl');
      setTimeout(() => {
        parentEl.classList.remove('ring-2', 'ring-primary/40', 'bg-primary/5', 'rounded-xl');
      }, 1500);
    }
  }, [comment.parentCommentId]);

  return (
    <>
      <div
        id={`comment-${comment.commentId}`}
        className={cn(
          'group relative flex items-start gap-2.5 sm:gap-3 transition-opacity duration-150',
          isDeleting && 'opacity-40 pointer-events-none',
          className,
        )}
        data-testid={`comment-item-${comment.commentId}`}
      >
        {/* Avatar with initials */}
        <div
          className={cn(
            'rounded-full bg-slate-100 text-text-main font-semibold flex items-center justify-center shrink-0 border border-border-subtle shadow-2xs select-none',
            isReply ? 'size-6.5 text-[10px]' : 'size-8 text-xs',
          )}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Main Comment Body */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'rounded-xl border border-border-subtle/80 bg-surface px-3.5 py-2.5 shadow-2xs hover:border-border transition-colors',
              isReply && 'bg-slate-50/50',
            )}
          >
            {/* Comment Author Header & Menu */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="font-semibold text-xs sm:text-sm text-text-main truncate">{comment.authorName}</span>
                {parentAuthorName && isReply && (
                  <span className="text-[11px] text-text-muted flex items-center gap-0.5 select-none">
                    <span className="text-text-muted/70 font-normal">trả lời</span>
                    {comment.parentCommentId ? (
                      <button
                        type="button"
                        onClick={handleParentMentionClick}
                        className="font-medium text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded px-0.5"
                        aria-label={`Đi tới bình luận của ${parentAuthorName}`}
                      >
                        @{parentAuthorName}
                      </button>
                    ) : (
                      <span className="font-medium text-primary">@{parentAuthorName}</span>
                    )}
                  </span>
                )}
                {comment.authorRole && (
                  <Badge variant={roleInfo.variant} className="text-[10px] px-1.5 py-0 leading-tight">
                    {roleInfo.label}
                  </Badge>
                )}
                <span className="text-[11px] text-text-muted hover:text-text-main cursor-default" title={fullTime}>
                  • {relativeTime}
                </span>
                {isEdited && <span className="text-[10px] text-text-muted italic">(đã sửa)</span>}
              </div>

              {/* Action Menu (Edit, Delete, Report) */}
              <CommentActionMenu
                commentId={comment.commentId}
                canEdit={canEdit}
                canDelete={canDelete}
                canReport={canReport}
                disabled={isDeleting}
                onEdit={() => setIsEditing(true)}
                onDelete={handleOpenDeleteModal}
                onReport={handleReport}
              />
            </div>

            {/* Comment Content / Inline Edit Form */}
            {isEditing ? (
              <div className="pt-1">
                <CommentForm
                  mode="edit"
                  initialValue={comment.content}
                  autoFocus
                  isSubmitting={isUpdating}
                  onSubmit={handleSaveEdit}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-text-main leading-relaxed whitespace-pre-wrap wrap-break-word">
                {comment.content}
              </p>
            )}
          </div>

          {/* Action Row below card: Like & Reply */}
          {!isEditing && (
            <div className="flex items-center gap-3 pt-1 pl-1 text-xs text-text-muted">
              {/* Like button */}
              <CommentLikeButton
                commentId={comment.commentId}
                isLiked={comment.isLiked}
                likeCount={comment.likeCount}
                isLoading={isLiking}
                isAuthenticated={Boolean(currentUserId)}
                onToggle={onLikeToggle}
                onRequireLogin={onRequireLogin}
              />

              {/* Reply trigger button */}
              {onReplyClick && (
                <button
                  type="button"
                  onClick={onReplyClick}
                  className="inline-flex items-center gap-1 font-medium hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer select-none rounded-md px-1.5 py-0.5"
                  aria-label={`Trả lời bình luận của ${comment.authorName}`}
                >
                  <CornerDownRight className="size-3.5" aria-hidden="true" />
                  <span>Trả lời</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {canDelete && (
        <CommentDeleteModal
          isOpen={isDeleteDialogOpen}
          commentId={comment.commentId}
          replyCount={comment.replyCount}
          isDeleting={isDeleting}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
});

export default CommentItem;
