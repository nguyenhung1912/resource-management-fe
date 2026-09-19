import { APP_PATHS } from '@/constants/path';

import type { DashboardMenuResponse } from '@/features/dashboard/types/dashboard-menu.types';

export const dashboardMenuPreviewData: DashboardMenuResponse = {
  groups: [
    {
      groupId: 'personal',
      groupName: 'Trang cá nhân',
      allowedRoles: ['Student', 'Lecturer', 'Admin'],
      functions: [
        {
          functionId: 'profile',
          functionName: 'Hồ sơ',
          functionUrl: APP_PATHS.PROFILE,
          functionDescription: 'Xem và cập nhật hồ sơ cá nhân',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'F014',
          functionName: 'Thông báo',
          functionUrl: APP_PATHS.NOTIFICATIONS,
          functionDescription: 'Theo dõi các thông báo mới',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
      ],
    },

    {
      groupId: 'digital-resources',
      groupName: 'Tài nguyên số',
      allowedRoles: ['Student', 'Lecturer', 'Admin'],
      functions: [
        {
          functionId: 'all-resources',
          functionName: 'Tất cả tài nguyên',
          functionUrl: APP_PATHS.ALL_RESOURCES,
          functionDescription: 'Duyệt toàn bộ tài nguyên số của nhà trường',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'lectures',
          functionName: 'Bài giảng',
          functionUrl: APP_PATHS.LECTURES,
          functionDescription: 'Tìm kiếm giáo trình và tài liệu bài giảng',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'graduation-theses',
          functionName: 'Khóa luận tốt nghiệp',
          functionUrl: APP_PATHS.THESES,
          functionDescription: 'Duyệt kho khóa luận tốt nghiệp xuất sắc',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'course-reports',
          functionName: 'Báo cáo môn học',
          functionUrl: APP_PATHS.COURSE_REPORTS,
          functionDescription: 'Duyệt báo cáo và đồ án môn học',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'source-code',
          functionName: 'Mã nguồn',
          functionUrl: APP_PATHS.SOURCE_CODE,
          functionDescription: 'Tìm kiếm tài nguyên mã nguồn và dự án mẫu',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'other-resources',
          functionName: 'Tài nguyên khác',
          functionUrl: APP_PATHS.OTHER_RESOURCES,
          functionDescription: 'Duyệt các loại tài liệu tham khảo khác',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
      ],
    },

    {
      groupId: 'user-management',
      groupName: 'Quản trị hệ thống',
      functions: [
        {
          functionId: 'F010',
          functionName: 'Quản lý người dùng',
          functionUrl: APP_PATHS.ADMIN_USERS,
          functionDescription: 'Xem và quản lý danh sách người dùng',
          allowedRoles: ['Admin']
        },
        {
          functionId: 'F012',
          functionName: 'Quản lý Role',
          functionUrl: APP_PATHS.ADMIN_ROLES,
          functionDescription: 'Xem và quản lý các Role trong hệ thống',
          allowedRoles: ['Admin']
        },
        {
          functionId: 'F013',
          functionName: 'Phân quyền chức năng',
          functionUrl: APP_PATHS.ADMIN_FUNCTIONS,
          functionDescription: 'Quản lý chức năng và phân quyền chức năng cho Role',
          allowedRoles: ['Admin']
        },
      ],
    },

    {
      groupId: 'resource-management',
      groupName: 'Quản lý tài nguyên',
      allowedRoles: ['Student', 'Lecturer', 'Admin'],
      functions: [
        {
          functionId: 'F003',
          functionName: 'Upload tài nguyên',
          functionUrl: APP_PATHS.RESOURCE_UPLOAD,
          functionDescription: 'Tải tài liệu mới lên hệ thống',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'F001',
          functionName: 'Tài nguyên của tôi',
          functionUrl: APP_PATHS.RESOURCES_MANAGER,
          functionDescription: 'Quản lý những tài nguyên bạn đã tải lên',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
        {
          functionId: 'manage-digital-resources',
          functionName: 'Quản lý tài nguyên số',
          functionUrl: APP_PATHS.MODERATION,
          functionDescription: 'Thẩm định, kiểm duyệt tài liệu và báo cáo đạo văn AI',
          allowedRoles: ['Lecturer', 'Admin'],
        },
        {
          functionId: 'my-appeals',
          functionName: 'Khiếu nại của tôi',
          functionUrl: APP_PATHS.APPEALS,
          functionDescription: 'Theo dõi tiến trình giải quyết khiếu nại tài liệu',
          allowedRoles: ['Student'],
        },
        {
          functionId: 'assigned-appeals',
          functionName: 'Tiếp nhận khiếu nại',
          functionUrl: APP_PATHS.ASSIGNED_APPEALS,
          functionDescription: 'Thẩm định và giải quyết khiếu nại từ sinh viên',
          allowedRoles: ['Lecturer', 'Admin'],
        },
        {
          functionId: 'F009',
          functionName: 'Báo cáo vi phạm',
          functionUrl: APP_PATHS.REPORTS_MANAGER,
          functionDescription: 'Xử lý báo cáo vi phạm tài liệu, bình luận và người dùng',
          allowedRoles: ['Lecturer', 'Admin'],
        },
        {
          functionId: 'F004',
          functionName: 'Thùng rác',
          functionUrl: APP_PATHS.RESOURCE_TRASH,
          functionDescription: 'Xem và khôi phục các tài nguyên đã xóa',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
      ],
    },

    {
      groupId: 'system-management',
      groupName: 'Quản lý hệ thống',
      allowedRoles: ['Lecturer', 'Admin'],
      functions: [
        {
          functionId: 'system-functions',
          functionName: 'Chức năng',
          functionUrl: APP_PATHS.ADMIN_SYSTEM_FUNCTIONS,
          functionDescription: 'Cấu hình và quản lý các chức năng hệ thống',
          allowedRoles: ['Admin'],
        },
        {
          functionId: 'academic-management',
          functionName: 'Quản lý học vụ',
          functionUrl: APP_PATHS.ADMIN_ACADEMIC,
          functionDescription: 'Quản lý chuyên ngành, khóa học và học phần',
          allowedRoles: ['Lecturer', 'Admin'],
        },
        {
          functionId: 'audit-logs',
          functionName: 'Nhật ký lưu vết',
          functionUrl: APP_PATHS.ADMIN_AUDIT_LOGS,
          functionDescription: 'Theo dõi nhật ký hoạt động và kiểm toán hệ thống',
          allowedRoles: ['Admin'],
        },
        {
          functionId: 'system-statistics',
          functionName: 'Thống kê',
          functionUrl: APP_PATHS.ADMIN_STATISTICS,
          functionDescription: 'Thống kê dữ liệu học liệu và báo cáo phân tích',
          allowedRoles: ['Lecturer', 'Admin'],
        },
      ],
    },

    {
      groupId: 'resource-discovery',
      groupName: 'Truy xuất tài nguyên',
      allowedRoles: ['Student', 'Lecturer', 'Admin'],
      functions: [
        {
          functionId: 'search-hub',
          functionName: 'Tra cứu tài nguyên',
          functionUrl: APP_PATHS.SEARCH,
          functionDescription: 'Tìm kiếm tài liệu thông minh, bộ lọc nâng cao và trợ lý AI',
          allowedRoles: ['Student', 'Lecturer', 'Admin'],
        },
      ],
    },
  ],
};

export default dashboardMenuPreviewData;
