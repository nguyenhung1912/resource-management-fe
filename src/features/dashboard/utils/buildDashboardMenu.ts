import type { DashboardFunction, DashboardMenuResponse } from '@/features/dashboard/types/dashboard-menu.types';

const ALWAYS_VISIBLE_IDS = new Set(['profile']);

export function buildDashboardMenu(
  menuTemplate: DashboardMenuResponse,
  allowedFunctions: DashboardFunction[],
): DashboardMenuResponse {
  const allowedIds = new Set(allowedFunctions.map((item) => item.functionId));

  return {
    groups: menuTemplate.groups
      .map((group) => ({
        ...group,

        functions: group.functions.filter(
          (item) => ALWAYS_VISIBLE_IDS.has(item.functionId) || allowedIds.has(item.functionId),
        ),
      }))
      .filter((group) => group.functions.length > 0),
  };
}
