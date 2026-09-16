import axiosClient from '@/services/axiosClient';

import type { DashboardFunction } from '@/features/dashboard/types/dashboard-menu.types';

export const dashboardService = {
  async getMyFunctions(): Promise<DashboardFunction[]> {
    const response = await axiosClient.get<DashboardFunction[]>('/api/User/me/functions');

    return response.data;
  },
};

export default dashboardService;
