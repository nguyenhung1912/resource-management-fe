import { useCallback, useState } from 'react';
import axios from 'axios';
import { appealService } from '@/services/appealService';
import type { AppealDetailResponse } from '@/features/appeals/types/appeal.types';

export interface UseAppealDetailReturn {
  isLoading: boolean;
  detail: AppealDetailResponse | null;
  error: string | null;
  loadDetail: (appealId: string) => Promise<AppealDetailResponse | null>;
  resetDetail: () => void;
}

export function useAppealDetail(): UseAppealDetailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState<AppealDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetDetail = useCallback(() => {
    setDetail(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const loadDetail = useCallback(async (appealId: string): Promise<AppealDetailResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await appealService.getAppealDetail(appealId);
      setDetail(response.data);
      return response.data;
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải chi tiết khiếu nại. Vui lòng thử lại sau.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy thông tin đơn khiếu nại này.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message as string;
        }
      }
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    detail,
    error,
    loadDetail,
    resetDetail,
  };
}

export default useAppealDetail;
