import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { moderationService } from '@/services/moderationService';
import type { QueuedCheckEnvelope } from '../types/queued-check.types';
import type { ProcessingJob } from '@/features/processing/types/processing.types';
import { processingDeployment, processingPausedMessage } from '@/features/processing/utils/processingDeployment';
import { processingErrorMessage } from '@/services/processingService';
import { useAuthStore } from '@/store/authStore';

interface BackendErrorPayload {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UsePlagiarismCheckCallbacks {
  onSuccess?: (result: ProcessingJob, message: string) => void;
  onError?: (errorMessage: string) => void;
}

export interface UsePlagiarismCheckReturn {
  isChecking: boolean;
  apiError: string | null;
  clearApiError: () => void;
  check: (fileId: string, callbacks?: UsePlagiarismCheckCallbacks) => Promise<QueuedCheckEnvelope | null>;
}

export function usePlagiarismCheck(): UsePlagiarismCheckReturn {
  const inFlight = useRef(new Set<string>());
  const intentKeys = useRef(new Map<string, string>());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  const check = useCallback(
    async (fileId: string, callbacks?: UsePlagiarismCheckCallbacks): Promise<QueuedCheckEnvelope | null> => {
      if (!processingDeployment().enabled) {
        setApiError(processingPausedMessage);
        callbacks?.onError?.(processingPausedMessage);
        return null;
      }
      if (inFlight.current.has(fileId)) return null;
      const session = useAuthStore.getState().token;
      inFlight.current.add(fileId);
      const key = intentKeys.current.get(fileId) ?? crypto.randomUUID();
      intentKeys.current.set(fileId, key);
      setIsChecking(true);
      setApiError(null);

      try {
        const response = await moderationService.checkPlagiarism(fileId, key);
        if (useAuthStore.getState().token !== session) return null;
        if (!response.data?.jobId) throw new Error('Expected accepted processing job');
        intentKeys.current.delete(fileId);
        callbacks?.onSuccess?.(response.data, response.message);
        return response;
      } catch (error: unknown) {
        if (useAuthStore.getState().token !== session) return null;
        let errorMessage = 'Đã có lỗi xảy ra khi kích hoạt kiểm tra trùng lặp AI. Vui lòng thử lại sau.';

        if (axios.isAxiosError<BackendErrorPayload>(error)) {
          if (error.response?.data?.code) {
            errorMessage = processingErrorMessage(error);
          } else if (error.response?.data?.message) {
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
        inFlight.current.delete(fileId);
        setIsChecking(inFlight.current.size > 0);
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
