import { useState, type FormEvent } from 'react';
import { AlertCircle, Flag, Send } from 'lucide-react';
import { BaseModal } from '@/components/common/BaseModal';
import { Button } from '@/components/ui/Button';
import { useCreateReport } from '@/features/reports/hooks/useCreateReport';
import { useReportTypes } from '@/features/reports/hooks/useReportTypes';
import type {
  CreateReportPayload,
  ReportMutationResponse,
  ReportTargetContext,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';
import { ReportPolicyNotice } from './ReportPolicyNotice';
import { ReportReasonField, MIN_REASON_LENGTH, MAX_REASON_LENGTH } from './ReportReasonField';
import { ReportTargetCard } from './ReportTargetCard';
import { ReportTypeSelector } from './ReportTypeSelector';

export interface ReportViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTargetContext | null;
  onSuccess?: (response: ReportMutationResponse) => void;
  initialReportTypes?: ReportTypeResponse[];
}

interface ReportViolationFormProps {
  target: ReportTargetContext;
  onClose: () => void;
  onSuccess?: (response: ReportMutationResponse) => void;
  reportTypes: ReportTypeResponse[];
  isLoadingTypes: boolean;
  typesError: string | null;
  refetchTypes: () => Promise<ReportTypeResponse[] | null>;
}

function ReportViolationForm({
  target,
  onClose,
  onSuccess,
  reportTypes,
  isLoadingTypes,
  typesError,
  refetchTypes,
}: ReportViolationFormProps) {
  const { isSubmitting, apiError, submitReport } = useCreateReport();

  const [selectedTypeId, setSelectedTypeId] = useState<string | number | null>(null);
  const [reason, setReason] = useState<string>('');
  const [touched, setTouched] = useState({
    type: false,
    reason: false,
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Derived validation
  const trimmedReason = reason.trim();
  const isTypeMissing = (touched.type || isSubmitted) && selectedTypeId === null;
  const isReasonEmpty = (touched.reason || isSubmitted) && trimmedReason.length === 0;
  const isReasonTooShort =
    (touched.reason || isSubmitted) && trimmedReason.length > 0 && trimmedReason.length < MIN_REASON_LENGTH;
  const isReasonTooLong = reason.length > MAX_REASON_LENGTH;

  const typeError = isTypeMissing ? 'Vui lòng chọn loại vi phạm.' : undefined;
  const reasonError = isReasonEmpty
    ? 'Vui lòng nhập nội dung chi tiết vi phạm.'
    : isReasonTooShort
      ? `Nội dung vi phạm phải có ít nhất ${MIN_REASON_LENGTH} ký tự (hiện có ${trimmedReason.length}).`
      : isReasonTooLong
        ? `Nội dung vi phạm không được vượt quá ${MAX_REASON_LENGTH} ký tự.`
        : undefined;

  const isFormValid =
    selectedTypeId !== null && trimmedReason.length >= MIN_REASON_LENGTH && reason.length <= MAX_REASON_LENGTH;

  const handleSelectType = (id: string | number) => {
    setSelectedTypeId(id);
    setTouched((prev) => ({ ...prev, type: true }));
  };

  const handleReasonChange = (val: string) => {
    setReason(val);
  };

  const handleReasonBlur = () => {
    setTouched((prev) => ({ ...prev, reason: true }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid || selectedTypeId === null || isSubmitting) {
      return;
    }

    const payload: CreateReportPayload = {
      reportTypeId: selectedTypeId,
      reportContent: trimmedReason,
      targetType: target.type,
      targetId: target.id,
    };

    if (target.type === 'File') {
      payload.fileId = target.id;
    } else if (target.type === 'Comment') {
      payload.commentId = target.id;
      if (target.fileId) payload.fileId = target.fileId;
      if (target.uidtarget) payload.uidtarget = target.uidtarget;
    } else if (target.type === 'User') {
      payload.uidtarget = target.id;
    }

    await submitReport(payload, {
      onSuccess: (res) => {
        onSuccess?.(res);
        onClose();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Backend API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-danger leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold">Không thể gửi báo cáo: </span>
            {apiError}
          </div>
        </div>
      )}

      <ReportTargetCard target={target} />

      <ReportPolicyNotice />

      <ReportTypeSelector
        reportTypes={reportTypes}
        selectedTypeId={selectedTypeId}
        onSelectType={handleSelectType}
        isLoading={isLoadingTypes}
        error={typesError}
        onRetry={refetchTypes}
        validationError={typeError}
        disabled={isSubmitting}
      />

      <ReportReasonField
        value={reason}
        onChange={handleReasonChange}
        onBlur={handleReasonBlur}
        error={reasonError}
        disabled={isSubmitting}
      />

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Hủy bỏ
        </Button>

        <Button
          type="submit"
          variant="danger"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          iconLeft={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        </Button>
      </div>
    </form>
  );
}

export function ReportViolationModal({
  isOpen,
  onClose,
  target,
  onSuccess,
  initialReportTypes,
}: ReportViolationModalProps) {
  const {
    reportTypes,
    isLoading: isLoadingTypes,
    error: typesError,
    refetch: refetchTypes,
  } = useReportTypes({
    initialData: initialReportTypes,
    enabled: isOpen && Boolean(target),
  });

  if (!isOpen || !target) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Báo cáo nội dung vi phạm"
      description="Phản ánh các sai phạm về bản quyền, nội dung phản cảm hoặc hành vi không phù hợp tới Ban kiểm duyệt."
      icon={
        <div className="p-2 rounded-lg bg-red-100/80 text-danger shrink-0" aria-hidden="true">
          <Flag className="h-5 w-5" />
        </div>
      }
      maxWidth="xl"
    >
      <ReportViolationForm
        key={`${target.type}-${target.id}`}
        target={target}
        onClose={onClose}
        onSuccess={onSuccess}
        reportTypes={reportTypes}
        isLoadingTypes={isLoadingTypes}
        typesError={typesError}
        refetchTypes={refetchTypes}
      />
    </BaseModal>
  );
}

export default ReportViolationModal;
