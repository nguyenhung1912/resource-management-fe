import type { RefObject } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';

export interface CommentDeleteModalProps {
  isOpen: boolean;
  commentId?: string;
  replyCount?: number;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
}

export function CommentDeleteModal({
  isOpen,
  commentId,
  replyCount = 0,
  isDeleting = false,
  onClose,
  onConfirm,
  restoreFocusRef,
}: CommentDeleteModalProps) {
  const footer = (
    <div className="flex w-full items-center justify-end gap-2.5">
      <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
        Hủy
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={onConfirm}
        isLoading={isDeleting}
        disabled={isDeleting}
        iconLeft={<Trash2 className="size-4" aria-hidden="true" />}
      >
        Xóa bình luận
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Xóa bình luận"
      description="Thao tác này sẽ gỡ bỏ bình luận khỏi cuộc thảo luận."
      icon={
        <span className="flex size-9 items-center justify-center rounded-full bg-danger/10 text-danger shrink-0">
          <Trash2 className="size-4" aria-hidden="true" />
        </span>
      }
      maxWidth="sm"
      restoreFocusRef={restoreFocusRef}
      footer={footer}
    >
      <div
        className="space-y-3 text-sm text-text-muted"
        data-testid={commentId ? `comment-delete-modal-${commentId}` : 'comment-delete-modal'}
      >
        <p>Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác sau khi đã thực hiện.</p>

        {replyCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-text-main leading-relaxed"
          >
            <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-text-main">Lưu ý quan trọng: </span>
              Bình luận này đang có <strong className="font-semibold text-warning">{replyCount}</strong> câu trả lời phụ
              thuộc. Việc xóa bình luận gốc có thể khiến các câu trả lời mất ngữ cảnh liên kết.
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
