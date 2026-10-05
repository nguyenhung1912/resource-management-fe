export const AUDIT_LOG_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  WARNING: 2,
} as const;

export type AuditLogStatusCode = (typeof AUDIT_LOG_STATUS)[keyof typeof AUDIT_LOG_STATUS];

export type AuditLogStatusName = 'Failed' | 'Success' | 'Warning' | 'Unknown';

export interface AuditLogItem {
  logId: string;
  userId: string | null;
  username: string;
  action: string;
  description: string | null;
  timestamp: string;
  ipaddress: string | null;
  userAgent: string | null;
  status: number;
  statusName: string;
}

export interface AuditLogDetail extends AuditLogItem {
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLogQueryParams {
  search?: string;
  userId?: string;
  username?: string;
  action?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedAuditLogResponse {
  items: AuditLogItem[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export const AUDIT_ACTIONS = {
  // Người dùng & Phân quyền
  USER_CREATED: 'USER_CREATED',
  USER_STATUS_UPDATED: 'USER_STATUS_UPDATED',
  USER_ROLE_UPDATED: 'USER_ROLE_UPDATED',

  // Khoa & Bộ môn
  DEPARTMENT_CREATED: 'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED: 'DEPARTMENT_UPDATED',
  DEPARTMENT_DELETED: 'DEPARTMENT_DELETED',

  // Ngành
  MAJOR_CREATED: 'MAJOR_CREATED',
  MAJOR_UPDATED: 'MAJOR_UPDATED',
  MAJOR_DELETED: 'MAJOR_DELETED',

  // Chuyên ngành
  SUBMAJOR_CREATED: 'SUBMAJOR_CREATED',
  SUBMAJOR_UPDATED: 'SUBMAJOR_UPDATED',
  SUBMAJOR_DELETED: 'SUBMAJOR_DELETED',

  // Học phần / Môn học
  COURSE_CREATED: 'COURSE_CREATED',
  COURSE_UPDATED: 'COURSE_UPDATED',
  COURSE_DELETED: 'COURSE_DELETED',

  // Tài nguyên / Học liệu
  RESOURCE_CREATED: 'RESOURCE_CREATED',
  RESOURCE_REMOVED: 'RESOURCE_REMOVED',
  RESOURCE_APPROVED: 'RESOURCE_APPROVED',
  RESOURCE_REJECTED: 'RESOURCE_REJECTED',

  // Bình luận
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_UPDATED: 'COMMENT_UPDATED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  COMMENT_LIKED: 'COMMENT_LIKED',
  COMMENT_UNLIKED: 'COMMENT_UNLIKED',

  // Thông báo
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  NOTIFICATION_READ_ALL: 'NOTIFICATION_READ_ALL',
  NOTIFICATION_DELETED: 'NOTIFICATION_DELETED',

  // Báo cáo vi phạm
  REPORT_CREATED: 'REPORT_CREATED',
  REPORT_STATUS_UPDATED: 'REPORT_STATUS_UPDATED',

  // Khiếu nại
  APPEAL_CREATED: 'APPEAL_CREATED',
  APPEAL_RESOLVED: 'APPEAL_RESOLVED',
} as const;

export type AuditActionType = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface AuditActionMeta {
  label: string;
  category: 'User' | 'Academic' | 'Resource' | 'Community' | 'Moderation';
  categoryLabel: string;
}

export const AUDIT_ACTION_MAP: Record<string, AuditActionMeta> = {
  [AUDIT_ACTIONS.USER_CREATED]: {
    label: 'Tạo tài khoản',
    category: 'User',
    categoryLabel: 'Người dùng',
  },
  [AUDIT_ACTIONS.USER_STATUS_UPDATED]: {
    label: 'Cập nhật trạng thái người dùng',
    category: 'User',
    categoryLabel: 'Người dùng',
  },
  [AUDIT_ACTIONS.USER_ROLE_UPDATED]: {
    label: 'Cập nhật quyền người dùng',
    category: 'User',
    categoryLabel: 'Người dùng',
  },

  [AUDIT_ACTIONS.DEPARTMENT_CREATED]: {
    label: 'Tạo khoa viện',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.DEPARTMENT_UPDATED]: {
    label: 'Cập nhật khoa viện',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.DEPARTMENT_DELETED]: {
    label: 'Xóa khoa viện',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },

  [AUDIT_ACTIONS.MAJOR_CREATED]: {
    label: 'Tạo ngành học',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.MAJOR_UPDATED]: {
    label: 'Cập nhật ngành học',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.MAJOR_DELETED]: {
    label: 'Xóa ngành học',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },

  [AUDIT_ACTIONS.SUBMAJOR_CREATED]: {
    label: 'Tạo chuyên ngành',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.SUBMAJOR_UPDATED]: {
    label: 'Cập nhật chuyên ngành',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.SUBMAJOR_DELETED]: {
    label: 'Xóa chuyên ngành',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },

  [AUDIT_ACTIONS.COURSE_CREATED]: {
    label: 'Tạo học phần',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.COURSE_UPDATED]: {
    label: 'Cập nhật học phần',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },
  [AUDIT_ACTIONS.COURSE_DELETED]: {
    label: 'Xóa học phần',
    category: 'Academic',
    categoryLabel: 'Học vụ',
  },

  [AUDIT_ACTIONS.RESOURCE_CREATED]: {
    label: 'Đăng tải tài liệu',
    category: 'Resource',
    categoryLabel: 'Học liệu',
  },
  [AUDIT_ACTIONS.RESOURCE_REMOVED]: {
    label: 'Gỡ tài liệu',
    category: 'Resource',
    categoryLabel: 'Học liệu',
  },
  [AUDIT_ACTIONS.RESOURCE_APPROVED]: {
    label: 'Phê duyệt tài liệu',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },
  [AUDIT_ACTIONS.RESOURCE_REJECTED]: {
    label: 'Từ chối tài liệu',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },

  [AUDIT_ACTIONS.COMMENT_CREATED]: {
    label: 'Tạo bình luận',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.COMMENT_UPDATED]: {
    label: 'Sửa bình luận',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.COMMENT_DELETED]: {
    label: 'Xóa bình luận',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.COMMENT_LIKED]: {
    label: 'Thích bình luận',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.COMMENT_UNLIKED]: {
    label: 'Bỏ thích bình luận',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },

  [AUDIT_ACTIONS.NOTIFICATION_CREATED]: {
    label: 'Tạo thông báo',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.NOTIFICATION_READ]: {
    label: 'Đọc thông báo',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.NOTIFICATION_READ_ALL]: {
    label: 'Đọc tất cả thông báo',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },
  [AUDIT_ACTIONS.NOTIFICATION_DELETED]: {
    label: 'Xóa thông báo',
    category: 'Community',
    categoryLabel: 'Cộng đồng',
  },

  [AUDIT_ACTIONS.REPORT_CREATED]: {
    label: 'Gửi báo cáo vi phạm',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },
  [AUDIT_ACTIONS.REPORT_STATUS_UPDATED]: {
    label: 'Xử lý báo cáo vi phạm',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },

  [AUDIT_ACTIONS.APPEAL_CREATED]: {
    label: 'Gửi khiếu nại tài liệu',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },
  [AUDIT_ACTIONS.APPEAL_RESOLVED]: {
    label: 'Giải quyết khiếu nại',
    category: 'Moderation',
    categoryLabel: 'Kiểm duyệt',
  },
};
