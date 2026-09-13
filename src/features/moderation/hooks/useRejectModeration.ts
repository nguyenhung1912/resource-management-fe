import { useCallback, useState } from 'react';
import axios from 'axios';
import { moderationService } from '@/services/moderationService';
import type {
  ModerationDecisionEnvelopeResponse,
  ModerationDecisionResponse,
  RejectModerationRequest,
} from '@/features/moderation/types/moderation.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UseRejectModerationCallbacks {
  onSuccess?: (decision: ModerationDecisionResponse, message: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseRejectModerationReturn {
  isRejecting: boolean;
  apiError: string | null;
  clearApiError: () => void;
  reject: (
    fileId: string,
    payload: RejectModerationRequest,
    callbacks?: UseRejectModerationCallbacks,
  ) => Promise<ModerationDecisionEnvelopeResponse | null>;
}

export function useRejectModeration(): UseRejectModerationReturn {
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const reject = useCallback(
    async (
      fileId: string,
      payload: RejectModerationRequest,
      callbacks?: UseRejectModerationCallbacks,
    ): Promise<ModerationDecisionEnvelopeResponse | null> => {
      setIsRejecting(true);
      setApiError(null);

      try {
        const response = await moderationService.rejectDocument(fileId, payload);
        callbacks?.onSuccess?.(response.data, response.message);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi từ chối tài liệu. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 400) {
            errorMessage = 'Dữ liệu từ chối không hợp lệ hoặc thiếu lý do từ chối.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền từ chối tài liệu này (yêu cầu vai trò Giảng viên/Quản trị viên).';
          } else if (error.response?.status === 404) {
            errorMessage = 'Không tìm thấy thông tin tài liệu cần từ chối.';
          }
        }

        setApiError(errorMessage);
        callbacks?.onError?.(errorMessage);
        return null;
      } finally {
        setIsRejecting(false);
      }
    },
    [],
  );

  return {
    isRejecting,
    apiError,
    clearApiError,
    reject,
  };
}

export default useRejectModeration;
