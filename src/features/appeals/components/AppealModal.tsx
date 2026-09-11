import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { useCreateAppeal } from '@/features/appeals/hooks/useCreateAppeal';
import type { AppealItemResponse, RejectedResourceContext } from '@/features/appeals/types/appeal.types';
import { AppealForm, type AppealFormData } from './AppealForm';
import { AppealPolicyNotice } from './AppealPolicyNotice';
import { AppealResourceBanner } from './AppealResourceBanner';

export interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: RejectedResourceContext | null;
  onSuccess?: (appeal: AppealItemResponse) => void;
}

export function AppealModal({ isOpen, onClose, resource, onSuccess }: AppealModalProps) {
  const { isSubmitting, apiError, clearApiError, submitAppeal } = useCreateAppeal();

  // Reset API error khi modal được mở lại hoặc đổi tài liệu
  useEffect(() => {
    if (isOpen) {
      clearApiError();
    }
  }, [isOpen, resource?.fileId, clearApiError]);

  if (!isOpen || !resource) {
    return null;
  }

  const handleFormSubmit = async (formData: AppealFormData) => {
    await submitAppeal(
      {
        fileId: resource.fileId,
        studentExplanation: formData.studentExplanation,
        attachmentUrl: formData.attachmentUrl,
      },
      {
        onSuccess: (newAppeal) => {
          onSuccess?.(newAppeal);
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi đơn giải trình kiểm duyệt"
      description="Gửi phản hồi và tài liệu minh chứng để giảng viên xem xét lại kết quả kiểm duyệt."
      icon={
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
      }
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Tóm tắt tài liệu & lý do từ chối */}
        <AppealResourceBanner resource={resource} />

        {/* Thông tin quy chế kiểm duyệt */}
        <AppealPolicyNotice />

        {/* Biểu mẫu giải trình */}
        <AppealForm isSubmitting={isSubmitting} apiError={apiError} onSubmit={handleFormSubmit} onCancel={onClose} />
      </div>
    </BaseModal>
  );
}

export default AppealModal;
