import { memo } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';

export interface DeleteRatingDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteRatingDialog = memo(function DeleteRatingDialog({
  isOpen,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: DeleteRatingDialogProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      maxWidth="md"
      title="Hủy đánh giá của bạn?"
      description="Thao tác này sẽ xóa vĩnh viễn điểm đánh giá của bạn trên tài liệu này."
      icon={
        <div className="size-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
          <Trash2 className="size-5" aria-hidden="true" />
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button type="button" variant="outline" size="md" disabled={isDeleting} onClick={onClose}>
            Không, giữ lại
          </Button>

          <Button
            type="button"
            size="md"
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-danger hover:bg-danger/90 text-white focus-visible:ring-danger/40"
            data-testid="confirm-delete-rating-btn"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" aria-hidden="true" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-1.5" aria-hidden="true" />
                Xác nhận hủy
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1 text-sm text-text-main">
        <p className="leading-relaxed">
          Sau khi hủy, điểm số trung bình và số lượt đánh giá của tài liệu sẽ được hệ thống tính toán lại. Bạn vẫn có
          thể đánh giá lại tài liệu này bất cứ lúc nào trong tương lai.
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed"
          >
            <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </BaseModal>
  );
});

export default DeleteRatingDialog;
