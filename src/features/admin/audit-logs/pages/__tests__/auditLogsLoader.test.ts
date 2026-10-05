import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auditLogService } from '@/services/auditLogService';
import type { PagedAuditLogResponse } from '../../types/audit-log.types';
import { auditLogsLoader } from '../auditLogsLoader';

vi.mock('@/services/auditLogService', () => ({
  auditLogService: {
    getAuditLogs: vi.fn(),
    getAuditLogDetail: vi.fn(),
  },
}));

describe('auditLogsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLogsResponse: PagedAuditLogResponse = {
    items: [
      {
        logId: 'LOG-001',
        userId: 'USR-001',
        username: 'admin',
        action: 'USER_CREATED',
        description: 'Tạo tài khoản',
        timestamp: '2026-09-29T10:00:00Z',
        ipaddress: '127.0.0.1',
        userAgent: 'Chrome',
        status: 1,
        statusName: 'Success',
      },
    ],
    totalItems: 1,
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
  };

  it('nạp dữ liệu mặc định khi URL không có query params', async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockLogsResponse);

    const request = new Request('http://localhost:5173/dashboard/admin/audit-logs');
    const result = await auditLogsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(auditLogService.getAuditLogs).toHaveBeenCalledWith({
      search: undefined,
      action: undefined,
      userId: undefined,
      username: undefined,
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
      pageIndex: 1,
      pageSize: 10,
    });
    expect(result.logs).toEqual(mockLogsResponse);
    expect(result.query.pageIndex).toBe(1);
    expect(result.query.pageSize).toBe(10);
  });

  it('trích xuất đầy đủ các bộ lọc từ URL search parameters', async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockLogsResponse);

    const request = new Request(
      'http://localhost:5173/dashboard/admin/audit-logs?search=test&action=USER_ROLE_UPDATED&status=0&userId=USR-99&username=hung&fromDate=2026-09-01&toDate=2026-09-29&pageIndex=3&pageSize=25',
    );
    const result = await auditLogsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(auditLogService.getAuditLogs).toHaveBeenCalledWith({
      search: 'test',
      action: 'USER_ROLE_UPDATED',
      status: 0,
      userId: 'USR-99',
      username: 'hung',
      fromDate: '2026-09-01',
      toDate: '2026-09-29',
      pageIndex: 3,
      pageSize: 25,
    });
    expect(result.query.search).toBe('test');
    expect(result.query.action).toBe('USER_ROLE_UPDATED');
    expect(result.query.status).toBe(0);
    expect(result.query.pageIndex).toBe(3);
    expect(result.query.pageSize).toBe(25);
  });

  it('hỗ trợ tham số pageNumber như alias cho pageIndex', async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockLogsResponse);

    const request = new Request('http://localhost:5173/dashboard/admin/audit-logs?pageNumber=4');
    const result = await auditLogsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(auditLogService.getAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 4,
      }),
    );
    expect(result.query.pageIndex).toBe(4);
  });

  it('tự động fallback về pageIndex = 1 và pageSize = 10 khi giá trị âm hoặc không hợp lệ', async () => {
    vi.mocked(auditLogService.getAuditLogs).mockResolvedValueOnce(mockLogsResponse);

    const request = new Request('http://localhost:5173/dashboard/admin/audit-logs?pageIndex=-2&pageSize=invalid');
    const result = await auditLogsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(auditLogService.getAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 1,
        pageSize: 10,
      }),
    );
    expect(result.query.pageIndex).toBe(1);
    expect(result.query.pageSize).toBe(10);
  });

  it('ném lỗi khi auditLogService ném ngoại lệ để Error Boundary xử lý', async () => {
    const error = new Error('Database connection failed');
    vi.mocked(auditLogService.getAuditLogs).mockRejectedValueOnce(error);

    const request = new Request('http://localhost:5173/dashboard/admin/audit-logs');

    await expect(auditLogsLoader({ request, params: {} } as LoaderFunctionArgs)).rejects.toThrow(
      'Database connection failed',
    );
  });
});
