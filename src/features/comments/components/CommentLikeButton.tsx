import { memo, useCallback, type MouseEvent } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { cn } from '@/utils/cn';

export interface CommentLikeButtonProps {
  commentId: string;
  isLiked: boolean;
  likeCount: number;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  onToggle: (
    commentId: string,
    currentIsLiked: boolean,
  ) => Promise<CommentItemResponse | null | void> | Promise<void> | void;
  onRequireLogin?: () => void;
  className?: string;
}

export const CommentLikeButton = memo(function CommentLikeButton({
  commentId,
  isLiked,
  likeCount,
  isLoading = false,
  isAuthenticated = true,
  onToggle,
  onRequireLogin,
  className,
}: CommentLikeButtonProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (isLoading) return;

      if (!isAuthenticated) {
        if (onRequireLogin) {
          onRequireLogin();
        } else {
          void onToggle(commentId, isLiked);
        }
        return;
      }

      void onToggle(commentId, isLiked);
    },
    [isLoading, isAuthenticated, onRequireLogin, onToggle, commentId, isLiked],
  );

  const displayCount = likeCount > 0 ? likeCount : 'Thích';
  const ariaLabel = isLiked
    ? `Bỏ thích bình luận (hiện có ${likeCount} lượt thích)`
    : `Thích bình luận (hiện có ${likeCount} lượt thích)`;
  const tooltipTitle = !isAuthenticated ? 'Đăng nhập để thích bình luận' : isLiked ? 'Bỏ thích' : 'Thích';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isLiked}
      aria-label={ariaLabel}
      title={tooltipTitle}
      data-testid={`comment-like-button-${commentId}`}
      className={cn(
        'group inline-flex items-center gap-1 font-medium text-xs select-none rounded-md px-1.5 py-0.5 transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        isLiked
          ? 'text-primary bg-primary/10 hover:bg-primary/15 active:bg-primary/20 font-semibold'
          : 'text-text-muted hover:text-primary hover:bg-slate-100 active:bg-slate-200/70',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="size-3 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <Heart
          className={cn(
            'size-3.5 transition-transform duration-150 group-active:scale-125',
            isLiked
              ? 'fill-primary text-primary animate-in zoom-in-75 duration-150'
              : 'text-current group-hover:scale-110',
          )}
          aria-hidden="true"
        />
      )}
      <span className="tabular-nums leading-none">{displayCount}</span>
    </button>
  );
});

export default CommentLikeButton;
