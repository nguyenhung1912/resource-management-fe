import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { auditLogService } from '../auditLogService';
import type { AuditLogDetail, PagedAuditLogResponse } from '@/features/admin/audit-logs/types/audit-log.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('auditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuditLogs', () => {
    const mockPagedResponse: PagedAuditLogResponse = {
      items: [
        {
          logId: 'LOG-001',
          userId: 'USR-001',
          username: 'admin',
          action: 'USER_CREATED',
          description: 'Admin tạo tài khoản mới',
          timestamp: '2026-09-29T10:00:00Z',
          ipaddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Chrome',
          status: 1,
          statusName: 'Success',
        },
      ],
      totalItems: 1,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 1,
    };

    it('gọi GET /api/AuditLogs không có params khi không truyền tham số', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await auditLogService.getAuditLogs();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs', {
        params: undefined,
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('gọi GET /api/AuditLogs không có params khi truyền object rỗng hoặc chuỗi khoảng trắng', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await auditLogService.getAuditLogs({
        search: '   ',
        userId: '',
        action: '  ',
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs', {
        params: undefined,
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('gọi GET /api/AuditLogs với đầy đủ các bộ lọc được trim chuẩn xác', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await auditLogService.getAuditLogs({
        search: '  admin  ',
        userId: 'USR-123',
        username: 'nguyenhung',
        action: 'RESOURCE_APPROVED',
        status: 1,
        fromDate: '2026-09-01T00:00:00Z',
        toDate: '2026-09-29T23:59:59Z',
        pageIndex: 2,
        pageSize: 20,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs', {
        params: {
          Search: 'admin',
          UserId: 'USR-123',
          Username: 'nguyenhung',
          Action: 'RESOURCE_APPROVED',
          Status: 1,
          FromDate: '2026-09-01T00:00:00Z',
          ToDate: '2026-09-29T23:59:59Z',
          PageIndex: 2,
          PageSize: 20,
        },
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('hỗ trợ lọc status = 0 (Failed)', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      await auditLogService.getAuditLogs({
        status: 0,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs', {
        params: {
          Status: 0,
        },
      });
    });

    it('bỏ qua pageIndex và pageSize không hợp lệ (nhỏ hơn hoặc bằng 0)', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      await auditLogService.getAuditLogs({
        pageIndex: 0,
        pageSize: -5,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs', {
        params: undefined,
      });
    });

    it('ném lỗi khi axiosClient.get thất bại', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosClient.get).mockRejectedValueOnce(error);

      await expect(auditLogService.getAuditLogs()).rejects.toThrow('Network Error');
    });
  });

  describe('getAuditLogDetail', () => {
    const mockDetail: AuditLogDetail = {
      logId: 'LOG-001',
      userId: 'USR-001',
      username: 'admin',
      action: 'USER_ROLE_UPDATED',
      description: 'Cập nhật quyền người dùng',
      timestamp: '2026-09-29T10:00:00Z',
      ipaddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      status: 1,
      statusName: 'Success',
      oldValue: '{"Role": "Lecturer"}',
      newValue: '{"Role": "Admin"}',
    };

    it('gọi GET /api/AuditLogs/{logId} với logId được mã hóa an toàn', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await auditLogService.getAuditLogDetail('LOG/SPECIAL 001');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/AuditLogs/LOG%2FSPECIAL%20001');
      expect(result).toEqual(mockDetail);
    });

    it('ném lỗi khi không tìm thấy hoặc server phản hồi lỗi', async () => {
      const error = new Error('Not Found');
      vi.mocked(axiosClient.get).mockRejectedValueOnce(error);

      await expect(auditLogService.getAuditLogDetail('INVALID-ID')).rejects.toThrow('Not Found');
    });
  });
});
