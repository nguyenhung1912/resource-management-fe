import type { ReactNode } from 'react';

import { AlertTriangle } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';

interface ConfirmActionModalProps {
  isOpen: boolean;

  title: string;

  message: ReactNode;

  confirmLabel?: string;

  cancelLabel?: string;

  danger?: boolean;

  isProcessing?: boolean;

  error?: string | null;

  onClose: () => void;

  onConfirm: () => void;
}

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  danger = false,
  isProcessing = false,
  error,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  const handleClose = () => {
    if (isProcessing) {
      return;
    }

    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      title={title}
      icon={<AlertTriangle className="size-5 text-warning" />}
      onClose={handleClose}
      maxWidth="md"
      closeOnEscape={!isProcessing}
      closeOnBackdropClick={!isProcessing}
      showCloseButton={!isProcessing}
      footer={
        <>
          <Button type="button" variant="secondary" disabled={isProcessing} onClick={handleClose}>
            {cancelLabel}
          </Button>

          <Button type="button" variant={danger ? 'danger' : 'primary'} isLoading={isProcessing} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <AlertBanner type="danger" message={error} />}

        <p className="text-sm leading-relaxed text-text-muted">{message}</p>
      </div>
    </BaseModal>
  );
}

export default ConfirmActionModal;
