import { APP_PATHS } from '@/constants/path';

import type { DashboardMenuResponse } from '@/features/dashboard/types/dashboard-menu.types';

export const dashboardMenuPreviewData: DashboardMenuResponse = {
  groups: [
    {
      groupId: 'personal',
      groupName: 'Trang cá nhân',
      functions: [
        {
          functionId: 'profile',
          functionName: 'Hồ sơ',
          functionUrl: APP_PATHS.PROFILE,
          functionDescription: 'Xem và cập nhật hồ sơ cá nhân',
        },
        {
          functionId: 'F014',
          functionName: 'Thông báo',
          functionUrl: APP_PATHS.NOTIFICATIONS,
          functionDescription: 'Theo dõi các thông báo mới',
        },
      ],
    },

    {
      groupId: 'digital-resources',
      groupName: 'Tài nguyên số',
      functions: [
        {
          functionId: 'all-resources',
          functionName: 'Tất cả tài nguyên',
          functionUrl: '/dashboard/resources',
          functionDescription: 'Duyệt toàn bộ tài nguyên số',
        },
        {
          functionId: 'lectures',
          functionName: 'Bài giảng',
          functionUrl: '/dashboard/lectures',
          functionDescription: 'Tìm kiếm tài liệu bài giảng',
        },
        {
          functionId: 'graduation-theses',
          functionName: 'Khóa luận tốt nghiệp',
          functionUrl: '/dashboard/theses',
          functionDescription: 'Duyệt kho khóa luận tốt nghiệp',
        },
        {
          functionId: 'course-reports',
          functionName: 'Báo cáo môn học',
          functionUrl: '/dashboard/course-reports',
          functionDescription: 'Duyệt báo cáo và đồ án môn học',
        },
        {
          functionId: 'source-code',
          functionName: 'Mã nguồn',
          functionUrl: '/dashboard/source-code',
          functionDescription: 'Tìm kiếm tài nguyên mã nguồn',
        },
        {
          functionId: 'other-resources',
          functionName: 'Tài nguyên khác',
          functionUrl: '/dashboard/other-resources',
          functionDescription: 'Duyệt các loại tài nguyên khác',
        },
      ],
    },

    {
      groupId: 'resource-management',
      groupName: 'Quản lý tài nguyên',
      functions: [
        {
          functionId: 'F003',
          functionName: 'Upload tài nguyên',
          functionUrl: APP_PATHS.RESOURCE_UPLOAD,
          functionDescription: 'Tải tài liệu mới lên hệ thống',
        },
        {
          functionId: 'F001',
          functionName: 'Tài nguyên của tôi',
          functionUrl: APP_PATHS.RESOURCES_MANAGER,
          functionDescription: 'Quản lý những tài nguyên bạn đã tải lên',
        },
        {
          functionId: 'F004',
          functionName: 'Thùng rác',
          functionUrl: '/dashboard/resources-manager/trash',
          functionDescription: 'Xem các tài nguyên đã xóa',
        },
      ],
    },

    {
      groupId: 'resource-discovery',
      groupName: 'Truy xuất tài nguyên',
      functions: [
        {
          functionId: 'search',
          functionName: 'Tìm kiếm',
          functionUrl: '/dashboard/search',
          functionDescription: 'Tìm kiếm nhanh trong kho tài nguyên',
        },
        {
          functionId: 'advanced-search',
          functionName: 'Tìm kiếm nâng cao',
          functionUrl: '/dashboard/search/advanced',
          functionDescription: 'Tìm kiếm theo nhiều tiêu chí',
        },
        {
          functionId: 'ai-search',
          functionName: 'Tìm kiếm AI',
          functionUrl: '/dashboard/search/ai',
          functionDescription: 'Tìm kiếm tài nguyên với trợ lý AI',
        },
        {
          functionId: 'user-search',
          functionName: 'Tìm kiếm người dùng',
          functionUrl: '/dashboard/search/users',
          functionDescription: 'Tìm kiếm người dùng trong hệ thống',
        },
      ],
    },

    {
      groupId: 'moderation-management',
      groupName: 'Kiểm duyệt & Báo cáo',
      functions: [
        {
          functionId: 'F009',
          functionName: 'Báo cáo vi phạm',
          functionUrl: APP_PATHS.REPORTS_MANAGER,
          functionDescription: 'Xử lý báo cáo vi phạm tài liệu, bình luận và người dùng',
        },
      ],
    },

    // BỔ SUNG CHO ADMIN
    {
      groupId: 'admin-management',
      groupName: 'Quản trị hệ thống',
      functions: [
        {
          functionId: 'F010',
          functionName: 'Quản lý người dùng',
          functionUrl: '/dashboard/admin/users',
          functionDescription: 'Xem và quản lý danh sách người dùng',
        },
        {
          functionId: 'F012',
          functionName: 'Quản lý Role',
          functionUrl: '/dashboard/admin/roles',
          functionDescription: 'Xem và quản lý các Role trong hệ thống',
        },
        {
          functionId: 'F013',
          functionName: 'Phân quyền chức năng',
          functionUrl: '/dashboard/admin/functions',
          functionDescription: 'Quản lý chức năng và phân quyền chức năng cho Role',
        },
      ],
    },
  ],
};
