import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import type {
  PagedReportResponse,
  ReportItemResponse,
  ReportTypeResponse,
} from '@/features/reports/types/report.types';
import { initialMyReportOverviewStats, initialMyReportsPaginatedData, myReportsLoader } from '../myReportsLoader';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getMyReports: vi.fn(),
    getReportTypes: vi.fn(),
    getAllReports: vi.fn(),
    getReportById: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}));

describe('myReportsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTypes: ReportTypeResponse[] = [
    { reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép nội dung' },
    { reportTypeId: 2, reportTypeName: 'Spam / Lừa đảo', description: 'Nội dung rác' },
  ];

  const mockItems: ReportItemResponse[] = [
    {
      reportId: 'RPT_MY_001',
      reporterUid: 'USR_ME',
      reporterName: 'Người dùng hiện tại',
      targetType: 'File',
      targetId: 'FIL_001',
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      reason: 'Tài liệu sao chép nghiên cứu của tôi',
      status: 'Pending',
      createdAt: '2026-09-18T08:00:00Z',
    },
    {
      reportId: 'RPT_MY_002',
      reporterUid: 'USR_ME',
      reporterName: 'Người dùng hiện tại',
      targetType: 'Comment',
      targetId: 'CMT_002',
      reportTypeId: 2,
      reportTypeName: 'Spam / Lừa đảo',
      reason: 'Bình luận chứa liên kết lừa đảo',
      status: 'Resolved',
      handlingNotes: 'Đã xác minh và gỡ bình luận vi phạm',
      createdAt: '2026-09-18T09:00:00Z',
    },
  ];

  const createPagedResponse = (items: ReportItemResponse[], totalCount: number): PagedReportResponse => ({
    items,
    pageIndex: 1,
    pageSize: 10,
    totalCount,
    totalPages: Math.ceil(totalCount / 10) || 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  it('tải dữ liệu báo cáo cá nhân thành công với tham số mặc định', async () => {
    vi.mocked(reportService.getMyReports).mockImplementation(async (params) => {
      if (params?.status === 'Pending') return createPagedResponse([mockItems[0]], 1);
      if (params?.status === 'InProgress') return createPagedResponse([], 0);
      if (params?.status === 'Resolved') return createPagedResponse([mockItems[1]], 1);
      if (params?.status === 'Rejected') return createPagedResponse([], 0);
      return createPagedResponse(mockItems, 2);
    });
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const request = new Request('http://localhost:5023/my-reports');
    const result = await myReportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.reports.items).toHaveLength(2);
    expect(result.stats).toEqual({
      total: 2,
      pending: 1,
      inProgress: 0,
      resolved: 1,
      rejected: 0,
    });
    expect(result.reportTypes).toEqual(mockTypes);
    expect(result.currentStatus).toBeUndefined();
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('lọc chính xác theo status hợp lệ (Pending, Resolved) và bỏ qua status không hợp lệ', async () => {
    vi.mocked(reportService.getMyReports).mockImplementation(async (params) => {
      if (params?.status === 'Pending') return createPagedResponse([mockItems[0]], 1);
      if (params?.status === 'InProgress') return createPagedResponse([], 0);
      if (params?.status === 'Resolved') return createPagedResponse([mockItems[1]], 1);
      if (params?.status === 'Rejected') return createPagedResponse([], 0);
      return createPagedResponse(mockItems, 2);
    });
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    // Kịch bản 1: Lọc status=Pending
    const pendingRequest = new Request('http://localhost:5023/my-reports?status=Pending');
    const pendingResult = await myReportsLoader({ request: pendingRequest, params: {} } as LoaderFunctionArgs);

    expect(pendingResult.currentStatus).toBe('Pending');
    expect(pendingResult.stats.pending).toBe(1);
    expect(pendingResult.stats.total).toBe(2);

    // Kịch bản 2: Lọc status=Resolved
    const resolvedRequest = new Request('http://localhost:5023/my-reports?status=Resolved');
    const resolvedResult = await myReportsLoader({ request: resolvedRequest, params: {} } as LoaderFunctionArgs);

    expect(resolvedResult.currentStatus).toBe('Resolved');
    expect(resolvedResult.stats.resolved).toBe(1);

    // Kịch bản 3: status không hợp lệ
    const invalidRequest = new Request('http://localhost:5023/my-reports?status=UnknownStatus');
    const invalidResult = await myReportsLoader({ request: invalidRequest, params: {} } as LoaderFunctionArgs);

    expect(invalidResult.currentStatus).toBeUndefined();
  });

  it('xử lý phân trang với page và pageSize từ URL search params', async () => {
    vi.mocked(reportService.getMyReports).mockResolvedValue(createPagedResponse([], 0));
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const request = new Request('http://localhost:5023/my-reports?page=3&pageSize=20');
    const result = await myReportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.currentPage).toBe(3);
    expect(result.pageSize).toBe(20);
    expect(reportService.getMyReports).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 3,
        pageSize: 20,
      }),
    );
  });

  it('thực hiện lọc client-side cho targetType, reportTypeId và search query', async () => {
    vi.mocked(reportService.getMyReports).mockResolvedValue(createPagedResponse(mockItems, 2));
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    // Tìm kiếm theo lý do
    const searchRequest = new Request('http://localhost:5023/my-reports?search=lừa+đảo');
    const searchResult = await myReportsLoader({ request: searchRequest, params: {} } as LoaderFunctionArgs);

    expect(searchResult.reports.items).toHaveLength(1);
    expect(searchResult.reports.items[0].reportId).toBe('RPT_MY_002');

    // Lọc theo targetType = File
    const targetRequest = new Request('http://localhost:5023/my-reports?targetType=File');
    const targetResult = await myReportsLoader({ request: targetRequest, params: {} } as LoaderFunctionArgs);

    expect(targetResult.reports.items).toHaveLength(1);
    expect(targetResult.reports.items[0].targetType).toBe('File');

    // Lọc theo reportTypeId = 1
    const typeRequest = new Request('http://localhost:5023/my-reports?reportTypeId=1');
    const typeResult = await myReportsLoader({ request: typeRequest, params: {} } as LoaderFunctionArgs);

    expect(typeResult.reports.items).toHaveLength(1);
    expect(typeResult.reports.items[0].reportTypeId).toBe(1);
  });

  it('trả về fallback an toàn khi gặp lỗi kết nối API', async () => {
    vi.mocked(reportService.getMyReports).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(reportService.getReportTypes).mockRejectedValueOnce(new Error('Network error'));

    // Giả lập lỗi ném ra
    vi.spyOn(reportService, 'getMyReports').mockImplementationOnce(() => {
      throw new Error('Fatal error');
    });

    const request = new Request('http://localhost:5023/my-reports');
    const result = await myReportsLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.reports).toEqual(initialMyReportsPaginatedData);
    expect(result.stats).toEqual(initialMyReportOverviewStats);
    expect(result.reportTypes).toEqual([]);
  });
});
