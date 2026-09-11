import { useCallback, useState } from 'react';
import axios from 'axios';
import { appealService } from '@/services/appealService';
import type {
  AppealEnvelopeResponse,
  AppealItemResponse,
  CreateAppealRequest,
} from '@/features/appeals/types/appeal.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UseCreateAppealCallbacks {
  onSuccess?: (appeal: AppealItemResponse) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseCreateAppealReturn {
  isSubmitting: boolean;
  apiError: string | null;
  clearApiError: () => void;
  submitAppeal: (
    payload: CreateAppealRequest,
    callbacks?: UseCreateAppealCallbacks,
  ) => Promise<AppealEnvelopeResponse | null>;
}

export function useCreateAppeal(): UseCreateAppealReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const submitAppeal = useCallback(
    async (
      payload: CreateAppealRequest,
      callbacks?: UseCreateAppealCallbacks,
    ): Promise<AppealEnvelopeResponse | null> => {
      setIsSubmitting(true);
      setApiError(null);

      try {
        const response = await appealService.createAppeal(payload);
        callbacks?.onSuccess?.(response.data);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 400) {
            errorMessage = 'Tài liệu không bị từ chối hoặc đã hết số lượt khiếu nại.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền gửi khiếu nại cho tài liệu này.';
          }
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
    submitAppeal,
  };
}

export default useCreateAppeal;
