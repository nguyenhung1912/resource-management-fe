import { useCallback, useState } from 'react';
import axios from 'axios';
import { moderationService } from '@/services/moderationService';
import type {
  ApproveModerationRequest,
  ModerationDecisionEnvelopeResponse,
  ModerationDecisionResponse,
} from '@/features/moderation/types/moderation.types';

interface BackendErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UseApproveModerationCallbacks {
  onSuccess?: (decision: ModerationDecisionResponse, message: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface UseApproveModerationReturn {
  isApproving: boolean;
  apiError: string | null;
  clearApiError: () => void;
  approve: (
    fileId: string,
    payload?: ApproveModerationRequest,
    callbacks?: UseApproveModerationCallbacks,
  ) => Promise<ModerationDecisionEnvelopeResponse | null>;
}

export function useApproveModeration(): UseApproveModerationReturn {
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const approve = useCallback(
    async (
      fileId: string,
      payload: ApproveModerationRequest = {},
      callbacks?: UseApproveModerationCallbacks,
    ): Promise<ModerationDecisionEnvelopeResponse | null> => {
      setIsApproving(true);
      setApiError(null);

      try {
        const response = await moderationService.approveDocument(fileId, payload);
        callbacks?.onSuccess?.(response.data, response.message);
        return response;
      } catch (error: unknown) {
        let errorMessage = 'Đã có lỗi xảy ra khi phê duyệt tài liệu. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 400) {
            errorMessage = 'Dữ liệu phê duyệt không hợp lệ hoặc tài liệu đã được xử lý.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền phê duyệt tài liệu này (yêu cầu vai trò Giảng viên/Quản trị viên).';
          } else if (error.response?.status === 404) {
            errorMessage = 'Không tìm thấy thông tin tài liệu cần phê duyệt.';
          }
        }

        setApiError(errorMessage);
        callbacks?.onError?.(errorMessage);
        return null;
      } finally {
        setIsApproving(false);
      }
    },
    [],
  );

  return {
    isApproving,
    apiError,
    clearApiError,
    approve,
  };
}

export default useApproveModeration;
