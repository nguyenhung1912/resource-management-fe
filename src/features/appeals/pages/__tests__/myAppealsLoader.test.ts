import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import type { AppealsPaginatedEnvelopeResponse } from '@/features/appeals/types/appeal.types';
import { initialAppealOverviewStats, initialAppealsPaginatedData, myAppealsLoader } from '../myAppealsLoader';

vi.mock('@/services/appealService', () => ({
  appealService: {
    getMyAppeals: vi.fn(),
  },
}));

describe('myAppealsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResponse = (
    items: AppealsPaginatedEnvelopeResponse['data']['items'],
    totalCount: number,
  ): AppealsPaginatedEnvelopeResponse => ({
    message: 'Lấy danh sách khiếu nại thành công.',
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
        fileName: 'Tài liệu giải tích 1',
        appealAttempt: 1,
        studentExplanation: 'Giải trình tài liệu chuẩn',
        status: 'Pending' as const,
        createdAt: '2026-09-12T10:00:00Z',
      },
    ];

    vi.mocked(appealService.getMyAppeals).mockResolvedValue(createMockResponse(mockAppeals, 1));

    const request = new Request('http://localhost:5173/appeals');
    const result = await myAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.currentStatus).toBeUndefined();
    expect(result.searchQuery).toBe('');
    expect(result.appeals.items).toHaveLength(1);
    expect(result.appeals.items[0].appealId).toBe('APL_001');
    expect(result.stats.total).toBe(1);
  });

  it('trích xuất đúng status filter hợp lệ từ searchParams', async () => {
    vi.mocked(appealService.getMyAppeals).mockResolvedValue(createMockResponse([], 0));

    const request = new Request('http://localhost:5173/appeals?status=Approved&page=2&pageSize=20');
    const result = await myAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentStatus).toBe('Approved');
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(20);
  });

  it('bỏ qua status filter không hợp lệ và coi như undefined', async () => {
    vi.mocked(appealService.getMyAppeals).mockResolvedValue(createMockResponse([], 0));

    const request = new Request('http://localhost:5173/appeals?status=InvalidStatus');
    const result = await myAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.currentStatus).toBeUndefined();
  });

  it('lọc danh sách phía client khi có search query', async () => {
    const mockAppeals = [
      {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Nghiên cứu Trí tuệ Nhân tạo',
        appealAttempt: 1,
        studentExplanation: 'Trích dẫn nguồn học thuật',
        status: 'Approved' as const,
        assignedLecturerName: 'TS. Nguyễn Văn A',
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        appealId: 'APL_002',
        fileId: 'FIL_002',
        fileName: 'Báo cáo Hệ thống thông tin',
        appealAttempt: 1,
        studentExplanation: 'Bổ sung tài liệu gốc',
        status: 'Pending' as const,
        assignedLecturerName: 'ThS. Lê Văn B',
        createdAt: '2026-09-11T10:00:00Z',
      },
    ];

    vi.mocked(appealService.getMyAppeals).mockImplementation(async (params) => {
      if (params?.status === 'Approved') return createMockResponse([mockAppeals[0]], 1);
      if (params?.status === 'Pending') return createMockResponse([mockAppeals[1]], 1);
      return createMockResponse(mockAppeals, 2);
    });

    const request = new Request('http://localhost:5173/appeals?search=Nhân+tạo');
    const result = await myAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.searchQuery).toBe('Nhân tạo');
    expect(result.appeals.items).toHaveLength(1);
    expect(result.appeals.items[0].appealId).toBe('APL_001');
  });

  it('trả về fallback an toàn khi API gặp lỗi', async () => {
    vi.mocked(appealService.getMyAppeals).mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost:5173/appeals');
    const result = await myAppealsLoader({ request, params: {} } as unknown as LoaderFunctionArgs);

    expect(result.appeals).toEqual(initialAppealsPaginatedData);
    expect(result.stats).toEqual(initialAppealOverviewStats);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});
