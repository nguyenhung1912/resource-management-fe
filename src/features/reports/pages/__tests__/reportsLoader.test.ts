import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import type {
  PagedReportResponse,
  ReportItemResponse,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';
import { initialReportOverviewStats, initialReportsPaginatedData, reportsLoader } from '../reportsLoader';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getAllReports: vi.fn(),
    getReportTypes: vi.fn(),
    getReportById: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}));

describe('reportsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTypes: ReportTypeResponse[] = [
    { reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép' },
    { reportTypeId: 2, reportTypeName: 'Nội dung phản cảm', description: 'Từ ngữ độc hại' },
  ];

  const mockItems: ReportItemResponse[] = [
    {
      reportId: 'RPT_001',
      reporterUid: 'USR_001',
      reporterName: 'Lê Văn C',
      targetType: 'File',
      targetId: 'FIL_001',
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      reason: 'Sao chép nguyên văn luận văn tốt nghiệp',
      status: 'Pending',
      createdAt: '2026-09-15T08:00:00Z',
    },
    {
      reportId: 'RPT_002',
      reporterUid: 'USR_002',
      reporterName: 'Trần Thị B',
      targetType: 'Comment',
      targetId: 'CMT_002',
      reportTypeId: 2,
      reportTypeName: 'Nội dung phản cảm',
      reason: 'Bình luận xúc phạm giảng viên',
      status: 'InProgress',
      createdAt: '2026-09-15T09:00:00Z',
    },
  ];

  const createPagedResponse = (items: ReportItemResponse[], totalCount: number): PagedReportResponse => ({
    items,
    pageIndex: 1,
    pageSize: 10,
    totalCount,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  it('tải dữ liệu mặc định thành công khi không có query params', async () => {
    vi.mocked(reportService.getAllReports).mockImplementation(async (params) => {
      if (params?.status === 'Pending') return createPagedResponse([mockItems[0]], 1);
      if (params?.status === 'InProgress') return createPagedResponse([mockItems[1]], 1);
      if (params?.status === 'Resolved') return createPagedResponse([], 0);
      if (params?.status === 'Rejected') return createPagedResponse([], 0);
      return createPagedResponse(mockItems, 2);
    });
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const request = new Request('http://localhost:5023/dashboard/reports');
    const result = await reportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.reports.items).toHaveLength(2);
    expect(result.stats).toEqual({
      total: 2,
      pending: 1,
      inProgress: 1,
      resolved: 0,
      rejected: 0,
    });
    expect(result.reportTypes).toEqual(mockTypes);
    expect(result.currentStatus).toBeUndefined();
    expect(result.currentPage).toBe(1);
  });

  it('lọc theo status hợp lệ và tính toán tổng số báo cáo', async () => {
    vi.mocked(reportService.getAllReports).mockImplementation(async (params) => {
      if (params?.status === 'Pending') return createPagedResponse([mockItems[0]], 1);
      if (params?.status === 'InProgress') return createPagedResponse([], 0);
      if (params?.status === 'Resolved') return createPagedResponse([], 0);
      if (params?.status === 'Rejected') return createPagedResponse([], 0);
      // Khi query all count
      return createPagedResponse(mockItems, 2);
    });
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const request = new Request('http://localhost:5023/dashboard/reports?status=Pending');
    const result = await reportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.currentStatus).toBe('Pending');
    expect(result.stats.total).toBe(2);
    expect(result.stats.pending).toBe(1);
  });

  it('lọc client-side theo targetType và search query', async () => {
    vi.mocked(reportService.getAllReports).mockResolvedValue(createPagedResponse(mockItems, 2));
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);

    const request = new Request('http://localhost:5023/dashboard/reports?targetType=Comment&search=xúc phạm');
    const result = await reportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.currentTargetType).toBe('Comment');
    expect(result.searchQuery).toBe('xúc phạm');
    expect(result.reports.items).toHaveLength(1);
    expect(result.reports.items[0].reportId).toBe('RPT_002');
  });

  it('trả về dữ liệu fallback an toàn khi API ném ngoại lệ', async () => {
    vi.mocked(reportService.getAllReports).mockRejectedValue(new Error('Network error'));
    vi.mocked(reportService.getReportTypes).mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost:5023/dashboard/reports');
    const result = await reportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.reports).toEqual(initialReportsPaginatedData);
    expect(result.stats).toEqual(initialReportOverviewStats);
    expect(result.reportTypes).toEqual([]);
  });
});
