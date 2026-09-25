import { memo } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { cn } from '@/utils/cn';
import { CommentThreadNode } from './CommentThreadNode';

export interface CommentListProps {
  comments: CommentItemResponse[];
  currentUserId?: string | null;
  currentUserRole?: string | null;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onLikeToggle: (commentId: string, currentIsLiked: boolean) => Promise<CommentItemResponse | null | void> | void;
  onRequireLogin?: () => void;
  isCommentLiking: (commentId: string) => boolean;
  onSubmitReply: (parentCommentId: string, content: string) => Promise<CommentItemResponse | null | boolean | void>;
  onEditSubmit: (commentId: string, content: string) => Promise<boolean | void>;
  onDeleteSubmit: (commentId: string) => Promise<boolean | void>;
  isCommentDeleting: (commentId: string) => boolean;
  className?: string;
}

function CommentSkeleton() {
  return (
    <div className="flex items-start gap-3 animate-pulse py-2">
      <div className="size-8 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-14 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export const CommentList = memo(function CommentList({
  comments,
  currentUserId,
  currentUserRole,
  isLoading = false,
  isLoadingMore = false,
  hasNextPage = false,
  onLoadMore,
  onLikeToggle,
  onRequireLogin,
  isCommentLiking,
  onSubmitReply,
  onEditSubmit,
  onDeleteSubmit,
  isCommentDeleting,
  className,
}: CommentListProps) {
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4 py-3" aria-label="Đang nạp bình luận...">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (!isLoading && comments.length === 0) {
    return (
      <div className="py-10 text-center flex flex-col items-center justify-center space-y-2 text-text-muted">
        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-text-muted/60">
          <MessageSquare className="size-5" aria-hidden="true" />
        </div>
        <p className="font-semibold text-text-main text-xs sm:text-sm">Chưa có bình luận nào</p>
        <p className="text-xs text-text-muted max-w-xs leading-relaxed">
          Hãy là người đầu tiên đóng góp ý kiến hoặc đặt câu hỏi về tài liệu này!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 py-2', className)} role="feed" aria-label="Danh sách bình luận">
      {comments.map((comment) => (
        <CommentThreadNode
          key={comment.commentId}
          comment={comment}
          depth={0}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isCommentLiking={isCommentLiking}
          isCommentDeleting={isCommentDeleting}
          onLikeToggle={onLikeToggle}
          onRequireLogin={onRequireLogin}
          onSubmitReply={onSubmitReply}
          onEditSubmit={onEditSubmit}
          onDeleteSubmit={onDeleteSubmit}
        />
      ))}

      {/* Load More Button */}
      {hasNextPage && onLoadMore && (
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-xs gap-1.5 cursor-pointer shadow-2xs hover:bg-slate-50"
          >
            {isLoadingMore && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            <span>{isLoadingMore ? 'Đang tải thêm bình luận...' : 'Xem thêm bình luận'}</span>
          </Button>
        </div>
      )}
    </div>
  );
});

export default CommentList;
