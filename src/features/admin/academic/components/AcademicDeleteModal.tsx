import { AlertTriangle, Trash2 } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';

interface AcademicDeleteModalProps {
  isOpen: boolean;

  title: string;
  itemName: string;

  error?: string | null;
  isDeleting?: boolean;

  onClose: () => void;
  onConfirm: () => void;
}

export function AcademicDeleteModal({
  isOpen,
  title,
  itemName,
  error,
  isDeleting = false,
  onClose,
  onConfirm,
}: AcademicDeleteModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      closeOnEscape={!isDeleting}
      closeOnBackdropClick={!isDeleting}
      title={title}
      description="Hành động này không thể hoàn tác."
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <AlertTriangle className="size-5" />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" disabled={isDeleting} onClick={onClose}>
            Hủy
          </Button>

          <Button variant="danger" isLoading={isDeleting} iconLeft={<Trash2 className="size-4" />} onClick={onConfirm}>
            Xóa
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <AlertBanner type="danger" title="Không thể xóa" message={error} />}

        <p className="text-sm leading-relaxed text-text-muted">
          Bạn có chắc chắn muốn xóa <span className="font-semibold text-text-main">{itemName}</span>?
        </p>
      </div>
    </BaseModal>
  );
}

export default AcademicDeleteModal;
