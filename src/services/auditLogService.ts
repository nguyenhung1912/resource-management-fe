import axiosClient from './axiosClient';
import type {
  AuditLogDetail,
  AuditLogQueryParams,
  PagedAuditLogResponse,
} from '@/features/admin/audit-logs/types/audit-log.types';

export const auditLogService = {
  /**
   * Lấy danh sách nhật ký kiểm toán hệ thống có phân trang và bộ lọc
   * Endpoint: GET /api/AuditLogs
   */
  async getAuditLogs(params?: AuditLogQueryParams): Promise<PagedAuditLogResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.search?.trim()) {
      queryParams.Search = params.search.trim();
    }
    if (params?.userId?.trim()) {
      queryParams.UserId = params.userId.trim();
    }
    if (params?.username?.trim()) {
      queryParams.Username = params.username.trim();
    }
    if (params?.action?.trim()) {
      queryParams.Action = params.action.trim();
    }
    if (typeof params?.status === 'number') {
      queryParams.Status = params.status;
    }
    if (params?.fromDate?.trim()) {
      queryParams.FromDate = params.fromDate.trim();
    }
    if (params?.toDate?.trim()) {
      queryParams.ToDate = params.toDate.trim();
    }
    if (typeof params?.pageIndex === 'number' && params.pageIndex > 0) {
      queryParams.PageIndex = params.pageIndex;
    }
    if (typeof params?.pageSize === 'number' && params.pageSize > 0) {
      queryParams.PageSize = params.pageSize;
    }

    const response = await axiosClient.get<PagedAuditLogResponse>('/api/AuditLogs', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    return response.data;
  },

  /**
   * Xem chi tiết một nhật ký kiểm toán (kèm oldValue, newValue, userAgent)
   * Endpoint: GET /api/AuditLogs/{logId}
   */
  async getAuditLogDetail(logId: string): Promise<AuditLogDetail> {
    const response = await axiosClient.get<AuditLogDetail>(`/api/AuditLogs/${encodeURIComponent(logId)}`);

    return response.data;
  },
};

export default auditLogService;
