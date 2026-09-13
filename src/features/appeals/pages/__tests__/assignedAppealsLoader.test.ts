import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import type { AppealsPaginatedEnvelopeResponse } from '@/features/appeals/types/appeal.types';
import {
  assignedAppealsLoader,
  initialAssignedAppealOverviewStats,
  initialAssignedAppealsPaginatedData,
} from '../assignedAppealsLoader';

vi.mock('@/services/appealService', () => ({
  appealService: {
    getAssignedAppeals: vi.fn(),
  },
}));

describe('assignedAppealsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResponse = (
    items: AppealsPaginatedEnvelopeResponse['data']['items'],
    totalCount: number,
  ): AppealsPaginatedEnvelopeResponse => ({
    message: 'Lấy danh sách khiếu nại được chỉ định thành công.',
    data: {
      items,
      pageIndex: 1,
      pageSize: 10,
      totalCount,
      totalPages: Math.ceil(totalCount / 10) || 1,
      hasPreviousPage: false,
      hasNextPage: totalCount > 10,
    },
  });

  it('lấy dữ liệu mặc định với page = 1, pageSize = 10 khi không truyền query param', async () => {
    const mockAppeals = [
      {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Tài liệu nghiên cứu AI',
        studentUid: 'USR_SV1',
        studentName: 'Nguyễn Văn Nam',
        studentEmail: 'nam@example.com',
        appealAttempt: 1,
        studentExplanation: 'Giải trình chi tiết minh chứng',
        status: 'Pending' as const,
        createdAt: '2026-09-12T10:00:00Z',
      },
    ];

    vi.mocked(appealService.getAssignedAppeals).mockResolvedValue(createMockResponse(mockAppeals, 1));

    const request = new Request('http://localhost:5173/appeals/assigned');
    const result = await assignedAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.currentStatus).toBeUndefined();
    expect(result.searchQuery).toBe('');
    expect(result.appeals.items).toHaveLength(1);
    expect(result.appeals.items[0].appealId).toBe('APL_001');
    expect(result.stats.total).toBe(1);
  });

  it('trích xuất đúng status filter hợp lệ từ searchParams', async () => {
    vi.mocked(appealService.getAssignedAppeals).mockResolvedValue(createMockResponse([], 0));

    const request = new Request('http://localhost:5173/appeals/assigned?status=Approved&page=2&pageSize=20');
    const result = await assignedAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentStatus).toBe('Approved');
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(20);
  });

  it('bỏ qua status filter không hợp lệ và coi như undefined', async () => {
    vi.mocked(appealService.getAssignedAppeals).mockResolvedValue(createMockResponse([], 0));

    const request = new Request('http://localhost:5173/appeals/assigned?status=UnknownStatus');
    const result = await assignedAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentStatus).toBeUndefined();
  });

  it('lọc danh sách phía client khi có search query theo tên sinh viên hoặc mã đơn', async () => {
    const mockAppeals = [
      {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Nghiên cứu Deep Learning',
        studentName: 'Trần Minh Tuấn',
        studentEmail: 'tuan@example.com',
        appealAttempt: 1,
        studentExplanation: 'Minh chứng code gốc',
        status: 'Pending' as const,
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        appealId: 'APL_002',
        fileId: 'FIL_002',
        fileName: 'Báo cáo An toàn Mạng',
        studentName: 'Lê Hoàng Yến',
        studentEmail: 'yen@example.com',
        appealAttempt: 1,
        studentExplanation: 'Bổ sung trích dẫn chuẩn',
        status: 'Approved' as const,
        createdAt: '2026-09-11T10:00:00Z',
      },
    ];

    vi.mocked(appealService.getAssignedAppeals).mockResolvedValue(createMockResponse(mockAppeals, 2));

    // Tìm kiếm theo tên sinh viên "Tuấn"
    const request1 = new Request('http://localhost:5173/appeals/assigned?search=Tu%E1%BA%A5n');
    const result1 = await assignedAppealsLoader({ request: request1, params: {} } as unknown as LoaderFunctionArgs);

    expect(result1.appeals.items).toHaveLength(1);
    expect(result1.appeals.items[0].appealId).toBe('APL_001');

    // Tìm kiếm theo mã đơn "APL_002"
    const request2 = new Request('http://localhost:5173/appeals/assigned?search=APL_002');
    const result2 = await assignedAppealsLoader({ request: request2, params: {} } as unknown as LoaderFunctionArgs);

    expect(result2.appeals.items).toHaveLength(1);
    expect(result2.appeals.items[0].appealId).toBe('APL_002');
  });

  it('tổng hợp chính xác các số liệu thống kê KPI trạng thái', async () => {
    vi.mocked(appealService.getAssignedAppeals).mockImplementation(async (params) => {
      if (params?.status === 'Pending') {
        return createMockResponse([], 5);
      }
      if (params?.status === 'Approved') {
        return createMockResponse([], 3);
      }
      if (params?.status === 'Rejected') {
        return createMockResponse([], 2);
      }
      return createMockResponse([], 10);
    });

    const request = new Request('http://localhost:5173/appeals/assigned?status=Pending');
    const result = await assignedAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.stats.pending).toBe(5);
    expect(result.stats.approved).toBe(3);
    expect(result.stats.rejected).toBe(2);
    expect(result.stats.total).toBe(10);
  });

  it('xử lý lỗi kết nối và trả về fallback data an toàn', async () => {
    vi.mocked(appealService.getAssignedAppeals).mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost:5173/appeals/assigned');
    const result = await assignedAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.appeals).toEqual(initialAssignedAppealsPaginatedData);
    expect(result.stats).toEqual(initialAssignedAppealOverviewStats);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});
