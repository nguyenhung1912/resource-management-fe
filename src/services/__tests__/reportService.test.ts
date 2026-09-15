import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { reportService } from '../reportService';
import type {
  PagedReportResponse,
  ReportDetailResponse,
  ReportMutationResponse,
  ReportTypeResponse,
  UpdateReportStatusRequest,
} from '@/features/reports/types/report.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReportTypes', () => {
    it('gọi GET /api/Report/types và trả về danh sách loại vi phạm dạng mảng', async () => {
      const mockTypes: ReportTypeResponse[] = [
        { reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép không trích dẫn' },
        { reportTypeId: 2, reportTypeName: 'Spam / Quảng cáo', description: 'Nội dung rác' },
      ];

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockTypes });

      const result = await reportService.getReportTypes();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report/types');
      expect(result).toEqual(mockTypes);
    });
  });

  describe('getAllReports', () => {
    it('gọi GET /api/Report với đầy đủ query params', async () => {
      const mockPagedResponse: PagedReportResponse = {
        items: [
          {
            reportId: 'RPT_001',
            reporterUid: 'USR_001',
            reporterName: 'Nguyễn Văn A',
            targetType: 'File',
            targetId: 'FIL_001',
            reportTypeId: 1,
            reportTypeName: 'Vi phạm bản quyền',
            reason: 'Tài liệu sao chép trái phép',
            status: 'Pending',
            createdAt: '2026-09-15T10:00:00Z',
          },
        ],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await reportService.getAllReports({
        status: 'Pending',
        pageNumber: 1,
        pageSize: 10,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report', {
        params: {
          Status: 'Pending',
          PageNumber: 1,
          PageSize: 10,
        },
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('gọi GET /api/Report khi không truyền params', async () => {
      const mockPagedResponse: PagedReportResponse = {
        items: [],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await reportService.getAllReports();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report', {
        params: {},
      });
      expect(result).toEqual(mockPagedResponse);
    });
  });

  describe('getReportById', () => {
    it('gọi GET /api/Report/{reportId} với param đã encode', async () => {
      const mockDetail: ReportDetailResponse = {
        reportId: 'RPT_001',
        reporterUid: 'USR_001',
        reporterName: 'Nguyễn Văn A',
        targetType: 'File',
        targetId: 'FIL_001',
        targetTitle: 'Nghiên cứu ứng dụng Deep Learning',
        reportTypeId: 1,
        reportTypeName: 'Vi phạm bản quyền',
        reason: 'Tài liệu sao chép nguyên văn',
        status: 'Pending',
        createdAt: '2026-09-15T10:00:00Z',
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await reportService.getReportById('RPT_001');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report/RPT_001');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('updateReportStatus', () => {
    it('gọi PUT /api/Report/{reportId}/status với đúng payload', async () => {
      const payload: UpdateReportStatusRequest = {
        status: 'Resolved',
        handlingNotes: 'Đã xác minh và gỡ tài liệu vi phạm.',
      };

      const mockResponse: ReportMutationResponse = {
        message: 'Cập nhật thành công.',
        data: {
          reportId: 'RPT_001',
          reporterUid: 'USR_001',
          reporterName: 'Nguyễn Văn A',
          targetType: 'File',
          targetId: 'FIL_001',
          reportTypeId: 1,
          reportTypeName: 'Vi phạm bản quyền',
          reason: 'Tài liệu sao chép',
          status: 'Resolved',
          handlingNotes: 'Đã xác minh và gỡ tài liệu vi phạm.',
          createdAt: '2026-09-15T10:00:00Z',
        },
      };

      vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await reportService.updateReportStatus('RPT_001', payload);

      expect(axiosClient.put).toHaveBeenCalledWith('/api/Report/RPT_001/status', payload);
      expect(result).toEqual(mockResponse);
    });
  });
});
