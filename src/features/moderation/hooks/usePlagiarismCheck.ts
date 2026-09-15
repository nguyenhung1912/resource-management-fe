import { useCallback, useState } from 'react';
import axios from 'axios';
import { moderationService } from '@/services/moderationService';
import type {
  PlagiarismCheckEnvelopeResponse,
  PlagiarismCheckResponse,
} from '@/features/moderation/types/moderation.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UsePlagiarismCheckCallbacks {
  onSuccess?: (result: PlagiarismCheckResponse, message: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface UsePlagiarismCheckReturn {
  isChecking: boolean;
  apiError: string | null;
  clearApiError: () => void;
  check: (fileId: string, callbacks?: UsePlagiarismCheckCallbacks) => Promise<PlagiarismCheckEnvelopeResponse | null>;
}

export function usePlagiarismCheck(): UsePlagiarismCheckReturn {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const check = useCallback(
    async (
      fileId: string,
      callbacks?: UsePlagiarismCheckCallbacks,
    ): Promise<PlagiarismCheckEnvelopeResponse | null> => {
      setIsChecking(true);
      setApiError(null);

      try {
        const response = await moderationService.checkPlagiarism(fileId);
        callbacks?.onSuccess?.(response.data, response.message);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi kích hoạt kiểm tra trùng lặp AI. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 400) {
            errorMessage = 'Tài liệu không hợp lệ hoặc không đủ điều kiện để kiểm tra trùng lặp.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền kích hoạt kiểm tra trùng lặp cho tài liệu này.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Không tìm thấy tài liệu cần kiểm tra trên hệ thống.';
          } else if (error.response?.status === 500) {
            errorMessage = 'Máy chủ phân tích AI gặp sự cố. Vui lòng thử lại sau ít phút.';
          }
        }

        setApiError(errorMessage);
        callbacks?.onError?.(errorMessage);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [],
  );

  return {
    isChecking,
    apiError,
    clearApiError,
    check,
  };
}

export default usePlagiarismCheck;
