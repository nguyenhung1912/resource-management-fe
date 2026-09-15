import { useCallback, useState } from 'react';
import { reportService } from '@/services/reportService';
import type { ReportDetailResponse } from '@/features/reports/types/report.types';

export interface UseReportDetailResult {
  detail: ReportDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  loadDetail: (reportId: string) => Promise<void>;
  resetDetail: () => void;
}

export function useReportDetail(): UseReportDetailResult {
  const [detail, setDetail] = useState<ReportDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (reportId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reportService.getReportById(reportId);
      setDetail(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết báo cáo vi phạm. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDetail = useCallback(() => {
    setDetail(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    detail,
    isLoading,
    error,
    loadDetail,
    resetDetail,
  };
}

export default useReportDetail;
