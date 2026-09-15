import { useCallback, useState } from 'react';
import { reportService } from '@/services/reportService';
import type { ReportMutationResponse, UpdateReportStatusRequest } from '@/features/reports/types/report.types';

export interface UseUpdateReportStatusResult {
  isSubmitting: boolean;
  error: string | null;
  updateStatus: (reportId: string, payload: UpdateReportStatusRequest) => Promise<ReportMutationResponse | null>;
  clearError: () => void;
}

export function useUpdateReportStatus(): UseUpdateReportStatusResult {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateStatus = useCallback(
    async (reportId: string, payload: UpdateReportStatusRequest): Promise<ReportMutationResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await reportService.updateReportStatus(reportId, payload);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Xử lý báo cáo vi phạm thất bại. Vui lòng kiểm tra lại kết nối và thử lại.';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return {
    isSubmitting,
    error,
    updateStatus,
    clearError,
  };
}

export default useUpdateReportStatus;
