import { useCallback } from 'react';
import { useReportModalStore } from '@/store/useReportModalStore';
import type { ReportMutationResponse } from '@/features/reports/types/report.types';
import { ReportViolationModal } from './ReportViolationModal';

export function GlobalReportModal() {
  const isOpen = useReportModalStore((s) => s.isOpen);
  const target = useReportModalStore((s) => s.target);
  const closeReportModal = useReportModalStore((s) => s.closeReportModal);
  const onSuccessCallback = useReportModalStore((s) => s.onSuccessCallback);

  const handleSuccess = useCallback(
    (response: ReportMutationResponse) => {
      onSuccessCallback?.(response);
    },
    [onSuccessCallback],
  );

  if (!isOpen || !target) {
    return null;
  }

  return <ReportViolationModal isOpen={isOpen} onClose={closeReportModal} target={target} onSuccess={handleSuccess} />;
}

export default GlobalReportModal;
