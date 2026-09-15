import { useState, type FormEvent, type RefObject } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export interface DeleteResourceDialogProps {
  isOpen: boolean;
  fileName: string;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteResourceDialog({
  isOpen,
  fileName,
  restoreFocusRef,
  onClose,
  onConfirm,
}: DeleteResourceDialogProps) {
  const [confirmationName, setConfirmationName] = useState('');
  const isConfirmed = fileName.length > 0 && confirmationName === fileName;

  const closeDialog = () => {
    setConfirmationName('');
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConfirmed) return;

    onConfirm();
    closeDialog();
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" onClick={closeDialog}>
        Hủy
      </Button>
      <Button
        type="submit"
        form="delete-resource-form"
        variant="danger"
        disabled={!isConfirmed}
        iconLeft={<Trash2 className="size-4" aria-hidden="true" />}
      >
        Xóa vĩnh viễn
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeDialog}
      title="Xóa tài nguyên"
      description="Xác nhận thao tác xóa vĩnh viễn"
      icon={
        <span className="flex size-9 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Trash2 className="size-4" aria-hidden="true" />
        </span>
      }
      maxWidth="md"
      restoreFocusRef={restoreFocusRef}
      footer={footer}
    >
      <form id="delete-resource-form" className="space-y-4" onSubmit={handleSubmit}>
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm leading-relaxed text-text-main"
        >
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
          <p>
            <span className="font-semibold text-danger">Cảnh báo: </span>
            Tài nguyên và mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </p>
        </div>

        <div className="space-y-2">
          <p id="delete-resource-instructions" className="text-sm text-text-muted">
            Để xác nhận, hãy nhập chính xác tên file{' '}
            <strong className="break-all font-semibold text-text-main">{fileName}</strong>.
          </p>
          <Label htmlFor="delete-resource-confirmation">Nhập tên file để xác nhận</Label>
          <Input
            id="delete-resource-confirmation"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-describedby="delete-resource-instructions"
            placeholder={fileName}
            value={confirmationName}
            onChange={(event) => setConfirmationName(event.target.value)}
          />
        </div>
      </form>
    </BaseModal>
  );
}

export default DeleteResourceDialog;
