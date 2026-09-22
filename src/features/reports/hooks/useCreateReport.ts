import { useCallback, useState } from 'react';
import axios from 'axios';
import { reportService } from '@/services/reportService';
import type { CreateReportPayload, ReportMutationResponse } from '@/features/reports/types/report.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UseCreateReportCallbacks {
  onSuccess?: (response: ReportMutationResponse) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseCreateReportReturn {
  isSubmitting: boolean;
  apiError: string | null;
  clearApiError: () => void;
  submitReport: (
    payload: CreateReportPayload,
    callbacks?: UseCreateReportCallbacks,
  ) => Promise<ReportMutationResponse | null>;
}

export function useCreateReport(): UseCreateReportReturn {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const submitReport = useCallback(
    async (
      payload: CreateReportPayload,
      callbacks?: UseCreateReportCallbacks,
    ): Promise<ReportMutationResponse | null> => {
      setIsSubmitting(true);
      setApiError(null);

      try {
        const response = await reportService.createReport(payload);
        callbacks?.onSuccess?.(response);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi gửi báo cáo vi phạm. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          const status = error.response?.status;
          const backendMessage = error.response?.data?.message;

          if (backendMessage) {
            errorMessage = backendMessage;
          } else if (status === 409) {
            errorMessage = 'Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.';
          } else if (status === 400) {
            errorMessage = 'Dữ liệu báo cáo không hợp lệ hoặc bạn không thể tự báo cáo chính mình.';
          } else if (status === 401) {
            errorMessage = 'Vui lòng đăng nhập để gửi báo cáo vi phạm.';
          } else if (status === 403) {
            errorMessage = 'Bạn không có quyền gửi báo cáo cho nội dung này.';
          } else if (status === 500) {
            errorMessage = 'Máy chủ gặp sự cố khi xử lý báo cáo. Vui lòng thử lại sau.';
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setApiError(errorMessage);
        callbacks?.onError?.(errorMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return {
    isSubmitting,
    apiError,
    clearApiError,
    submitReport,
  };
}

export default useCreateReport;
