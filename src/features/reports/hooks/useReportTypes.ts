import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { reportService } from '@/services/reportService';
import type { ReportTypeResponse } from '@/features/reports/types/report.types';

export interface UseReportTypesOptions {
  initialData?: ReportTypeResponse[];
  enabled?: boolean;
}

export interface UseReportTypesReturn {
  reportTypes: ReportTypeResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<ReportTypeResponse[] | null>;
}

// Module-level in-memory cache to prevent duplicate network requests (client-swr-dedup)
let cachedReportTypes: ReportTypeResponse[] | null = null;
let inflightPromise: Promise<ReportTypeResponse[]> | null = null;

export function clearReportTypesCache(): void {
  cachedReportTypes = null;
  inflightPromise = null;
}

export function useReportTypes(options?: UseReportTypesOptions): UseReportTypesReturn {
  const { initialData, enabled = true } = options ?? {};

  const [fetchedTypes, setFetchedTypes] = useState<ReportTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (initialData && initialData.length > 0) return false;
    if (cachedReportTypes && cachedReportTypes.length > 0) return false;
    return enabled;
  });
  const [error, setError] = useState<string | null>(null);

  // Derived state without calling setState synchronously in effect
  const reportTypes =
    initialData && initialData.length > 0
      ? initialData
      : cachedReportTypes && cachedReportTypes.length > 0
        ? cachedReportTypes
        : fetchedTypes;

  useEffect(() => {
    if (!enabled) return;

    if (initialData && initialData.length > 0) {
      cachedReportTypes = initialData;
      return;
    }

    if (cachedReportTypes && cachedReportTypes.length > 0) {
      return;
    }

    let isMounted = true;

    const loadTypes = async () => {
      try {
        if (!inflightPromise) {
          inflightPromise = reportService.getReportTypes();
        }

        const data = await inflightPromise;
        cachedReportTypes = data;

        if (isMounted) {
          setFetchedTypes(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          let errorMsg = 'Không thể tải danh mục loại vi phạm. Vui lòng thử lại sau.';
          if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
            const resData = err.response.data as { message?: string };
            if (resData.message) {
              errorMsg = resData.message;
            }
          } else if (err instanceof Error) {
            errorMsg = err.message;
          }
          setError(errorMsg);
        }
      } finally {
        inflightPromise = null;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTypes();

    return () => {
      isMounted = false;
    };
  }, [enabled, initialData]);

  const refetch = useCallback(async (): Promise<ReportTypeResponse[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await reportService.getReportTypes();
      cachedReportTypes = data;
      setFetchedTypes(data);
      return data;
    } catch (err: unknown) {
      let errorMsg = 'Không thể tải danh mục loại vi phạm. Vui lòng thử lại sau.';
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const resData = err.response.data as { message?: string };
        if (resData.message) {
          errorMsg = resData.message;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    reportTypes,
    isLoading,
    error,
    refetch,
  };
}

export default useReportTypes;
