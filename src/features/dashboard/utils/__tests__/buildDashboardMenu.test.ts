import { describe, expect, it } from 'vitest';

import { dashboardMenuPreviewData } from '@/constants/dashboard-menu';

import { buildDashboardMenu } from '../buildDashboardMenu';

describe('buildDashboardMenu', () => {
  describe('Vai trò Sinh viên (Student / Sinh viên)', () => {
    it('hiển thị đúng 4 nhóm chức năng và bao gồm Khiếu nại của tôi', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Student',
      );

      expect(menu.groups).toHaveLength(4);

      const groupIds = menu.groups.map((g) => g.groupId);

      expect(groupIds).toEqual([
        'personal',
        'digital-resources',
        'resource-management',
        'resource-discovery',
      ]);

      // Không chứa Quản lý người dùng và Quản lý hệ thống
      expect(groupIds).not.toContain('user-management');
      expect(groupIds).not.toContain('system-management');

      // Quản lý tài nguyên:
      // có Upload, Tài nguyên của tôi, Khiếu nại của tôi, Thùng rác
      const resourceGroup = menu.groups.find(
        (g) => g.groupId === 'resource-management',
      );

      const functionIds =
        resourceGroup?.functions.map((f) => f.functionId) ?? [];

      expect(functionIds).toContain('my-appeals');
      expect(functionIds).toContain('F003'); // Upload tài nguyên
      expect(functionIds).toContain('F001'); // Tài nguyên của tôi
      expect(functionIds).toContain('F004'); // Thùng rác

      expect(functionIds).not.toContain('manage-digital-resources');
      expect(functionIds).not.toContain('assigned-appeals');
      expect(functionIds).not.toContain('F009');

      // Truy xuất tài nguyên chỉ có Tra cứu tài nguyên
      const discoveryGroup = menu.groups.find(
        (g) => g.groupId === 'resource-discovery',
      );

      expect(discoveryGroup?.functions).toHaveLength(1);
      expect(discoveryGroup?.functions[0].functionId).toBe('search-hub');
    });

    it('hoạt động chính xác với chuỗi tiếng Việt "Sinh viên"', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Sinh viên',
      );

      expect(menu.groups).toHaveLength(4);

      const groupIds = menu.groups.map((g) => g.groupId);

      expect(groupIds).not.toContain('user-management');
      expect(groupIds).not.toContain('system-management');
    });
  });

  describe('Vai trò Giảng viên (Lecturer / Giảng viên)', () => {
    it('hiển thị đúng 5 nhóm chức năng học thuật & kiểm duyệt, không có Quản lý người dùng', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Lecturer',
      );

      expect(menu.groups).toHaveLength(5);

      const groupIds = menu.groups.map((g) => g.groupId);

      expect(groupIds).toEqual([
        'personal',
        'digital-resources',
        'resource-management',
        'system-management',
        'resource-discovery',
      ]);

      expect(groupIds).not.toContain('user-management');

      // Quản lý tài nguyên:
      // có Quản lý tài nguyên số, Tiếp nhận khiếu nại, Báo cáo vi phạm
      const resourceGroup = menu.groups.find(
        (g) => g.groupId === 'resource-management',
      );

      const functionIds =
        resourceGroup?.functions.map((f) => f.functionId) ?? [];

      expect(functionIds).toContain('manage-digital-resources');
      expect(functionIds).toContain('assigned-appeals');
      expect(functionIds).toContain('F009'); // Báo cáo vi phạm

      expect(functionIds).not.toContain('my-appeals');

      // Quản lý hệ thống:
      // Lecturer chỉ có Học vụ và Thống kê
      const systemGroup = menu.groups.find(
        (g) => g.groupId === 'system-management',
      );

      const systemFunctionIds =
        systemGroup?.functions.map((f) => f.functionId) ?? [];

      expect(systemFunctionIds).toContain('academic-management');
      expect(systemFunctionIds).toContain('system-statistics');

      expect(systemFunctionIds).not.toContain('system-functions');
      expect(systemFunctionIds).not.toContain('audit-logs');
    });

    it('hoạt động chính xác với chuỗi tiếng Việt "Giảng viên"', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Giảng viên',
      );

      expect(menu.groups).toHaveLength(5);
    });
  });

  describe('Vai trò Quản trị viên (Admin / Quản trị viên)', () => {
    it('hiển thị đầy đủ 6 nhóm chức năng và toàn quyền quản trị', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Admin',
      );

      expect(menu.groups).toHaveLength(6);

      const groupIds = menu.groups.map((g) => g.groupId);

      expect(groupIds).toContain('user-management');
      expect(groupIds).toContain('system-management');

      // Quản lý người dùng:
      // F010 - Quản lý người dùng
      // F012 - Quản lý Role
      // F013 - Phân quyền chức năng
      const userGroup = menu.groups.find(
        (g) => g.groupId === 'user-management',
      );

      expect(
        userGroup?.functions.map((f) => f.functionId),
      ).toEqual([
        'F010',
        'F012',
        'F013',
      ]);

      // Quản lý hệ thống có đủ 4 chức năng
      const systemGroup = menu.groups.find(
        (g) => g.groupId === 'system-management',
      );

      expect(
        systemGroup?.functions.map((f) => f.functionId),
      ).toEqual([
        'system-functions',
        'academic-management',
        'audit-logs',
        'system-statistics',
      ]);
    });

    it('hoạt động chính xác với chuỗi tiếng Việt "Quản trị viên"', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        'Quản trị viên',
      );

      expect(menu.groups).toHaveLength(6);
    });
  });

  describe('Trường hợp không có role hoặc role không hợp lệ', () => {
    it('trả về menu an toàn mà không bị crash', () => {
      const menu = buildDashboardMenu(
        dashboardMenuPreviewData,
        [],
        undefined,
      );

      expect(menu.groups.length).toBeGreaterThan(0);
    });
  });
});
