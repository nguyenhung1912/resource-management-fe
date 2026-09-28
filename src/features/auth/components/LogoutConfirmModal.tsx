import { LogOut } from 'lucide-react';

import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ open, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      maxWidth="sm"
      title="Xác nhận đăng xuất"
      description="Bạn có chắc chắn muốn kết thúc phiên đăng nhập hiện tại?"
      icon={
        <div className="flex size-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <LogOut className="size-5" />
        </div>
      }
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>

          <Button type="button" variant="danger" iconLeft={<LogOut className="size-4" />} onClick={onConfirm}>
            Đăng xuất
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-muted">
        Sau khi đăng xuất, bạn cần đăng nhập lại để tiếp tục sử dụng các chức năng yêu cầu xác thực.
      </p>
    </BaseModal>
  );
}

export default LogoutConfirmModal;
