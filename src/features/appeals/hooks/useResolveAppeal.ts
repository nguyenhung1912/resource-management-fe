import { useCallback, useState } from 'react';
import axios from 'axios';
import { appealService } from '@/services/appealService';
import type {
  AppealEnvelopeResponse,
  AppealItemResponse,
  ResolveAppealRequest,
} from '@/features/appeals/types/appeal.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UseResolveAppealCallbacks {
  onSuccess?: (item: AppealItemResponse, message: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseResolveAppealReturn {
  isResolving: boolean;
  apiError: string | null;
  clearApiError: () => void;
  resolve: (
    appealId: string,
    payload: ResolveAppealRequest,
    callbacks?: UseResolveAppealCallbacks,
  ) => Promise<AppealEnvelopeResponse | null>;
}

export function useResolveAppeal(): UseResolveAppealReturn {
  const [isResolving, setIsResolving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const resolve = useCallback(
    async (
      appealId: string,
      payload: ResolveAppealRequest,
      callbacks?: UseResolveAppealCallbacks,
    ): Promise<AppealEnvelopeResponse | null> => {
      setIsResolving(true);
      setApiError(null);

      try {
        const response = await appealService.resolveAppeal(appealId, payload);
        callbacks?.onSuccess?.(response.data, response.message);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi giải quyết khiếu nại. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 400) {
            errorMessage = 'Dữ liệu giải quyết không hợp lệ hoặc khiếu nại đã được giải quyết.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền giải quyết đơn khiếu nại này.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Không tìm thấy thông tin đơn khiếu nại.';
          }
        }

        setApiError(errorMessage);
        callbacks?.onError?.(errorMessage);
        return null;
      } finally {
        setIsResolving(false);
      }
    },
    [],
  );

  return {
    isResolving,
    apiError,
    clearApiError,
    resolve,
  };
}

export default useResolveAppeal;
