import { useEffect, useState } from 'react';

import { dashboardService } from '@/services/dashboardService';
import type { DashboardFunction } from '@/features/dashboard/types/dashboard-menu.types';

export function useDashboardFunctions() {
  const [functions, setFunctions] = useState<DashboardFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFunctions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await dashboardService.getMyFunctions();

        setFunctions(data);
      } catch {
        setFunctions([]);
        setError('Không thể tải menu chức năng.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadFunctions();
  }, []);

  return {
    functions,
    isLoading,
    error,
  };
}
