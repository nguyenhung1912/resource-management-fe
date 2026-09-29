import { hasAnyRole } from '@/features/auth/utils/roleUtils';
import type { DashboardFunction, DashboardMenuResponse } from '@/features/home/types/dashboard-menu.types';

const ALWAYS_VISIBLE_IDS = new Set(['profile']);

/**
 * Xây dựng danh sách menu dashboard dựa trên:
 * 1. Vai trò người dùng (userRole): lọc theo allowedRoles trên group và function.
 * 2. Quyền chức năng backend (allowedFunctions): lọc sâu hơn nếu backend cung cấp danh sách functionId.
 */
export function buildDashboardMenu(
  menuTemplate: DashboardMenuResponse,
  allowedFunctions?: DashboardFunction[] | null,
  userRole?: string | null,
): DashboardMenuResponse {
  const hasDynamicFunctions = Boolean(allowedFunctions && allowedFunctions.length > 0);
  const allowedIds = new Set(allowedFunctions?.map((item) => item.functionId) ?? []);

  return {
    groups: menuTemplate.groups
      // 1. Lọc nhóm theo vai trò
      .filter((group) => {
        if (!userRole || !group.allowedRoles || group.allowedRoles.length === 0) {
          return true;
        }
        return hasAnyRole(group.allowedRoles, userRole);
      })
      .map((group) => ({
        ...group,
        // 2. Lọc các chức năng con trong nhóm
        functions: group.functions.filter((item) => {
          // Các mục bắt buộc luôn hiển thị
          if (ALWAYS_VISIBLE_IDS.has(item.functionId)) {
            return true;
          }

          // Lọc theo vai trò (nếu có cấu hình allowedRoles trên item)
          if (userRole && item.allowedRoles && item.allowedRoles.length > 0) {
            if (!hasAnyRole(item.allowedRoles, userRole)) {
              return false;
            }
          }

          // Nếu có danh sách quyền chi tiết từ backend (mã dạng F001, F003...)
          if (hasDynamicFunctions && item.functionId.startsWith('F')) {
            return allowedIds.has(item.functionId);
          }

          return true;
        }),
      }))
      // 3. Chỉ giữ lại các nhóm có ít nhất 1 chức năng hợp lệ
      .filter((group) => group.functions.length > 0),
  };
}

export default buildDashboardMenu;
