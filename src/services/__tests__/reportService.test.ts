import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { reportService } from '../reportService';
import type {
  CreateReportPayload,
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

  describe('getMyReports', () => {
    it('gọi GET /api/Report/me với đầy đủ query params', async () => {
      const mockPagedResponse: PagedReportResponse = {
        items: [
          {
            reportId: 'RPT_MY_001',
            reporterUid: 'USR_ME',
            reporterName: 'Tôi',
            targetType: 'File',
            targetId: 'FIL_123',
            reportTypeId: 1,
            reportTypeName: 'Vi phạm bản quyền',
            reason: 'Tài liệu sao chép nghiên cứu của tôi',
            status: 'Pending',
            createdAt: '2026-09-18T08:00:00Z',
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

      const result = await reportService.getMyReports({
        status: 'Pending',
        pageNumber: 1,
        pageSize: 10,
        reportTypeId: 1,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report/me', {
        params: {
          Status: 'Pending',
          PageNumber: 1,
          PageIndex: 1,
          PageSize: 10,
          ReportTypeId: 1,
        },
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('chuẩn hóa totalItems thành totalCount khi backend trả về DTO C#', async () => {
      const backendDtoResponse = {
        items: [
          {
            reportId: 'RPT_MY_002',
            reporterUid: 'USR_ME',
            reporterName: 'Tôi',
            targetType: 'Comment',
            targetId: 'CMT_456',
            reportTypeId: 2,
            reportTypeName: 'Spam',
            reason: 'Bình luận rác',
            status: 'Resolved',
            handlingNotes: 'Đã ẩn bình luận',
            createdAt: '2026-09-18T09:00:00Z',
          },
        ],
        totalItems: 15,
        pageIndex: 2,
        pageSize: 10,
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: backendDtoResponse });

      const result = await reportService.getMyReports({
        pageIndex: 2,
        pageSize: 10,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report/me', {
        params: {
          PageNumber: 2,
          PageIndex: 2,
          PageSize: 10,
        },
      });
      expect(result.totalCount).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.hasPreviousPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });

    it('gọi GET /api/Report/me khi không truyền params', async () => {
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

      const result = await reportService.getMyReports();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Report/me', {
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

  describe('createReport', () => {
    it('gửi báo cáo tài liệu (File) thành công với cấu trúc payload kép tương thích BE và Swagger', async () => {
      const payload: CreateReportPayload = {
        reportTypeId: 1,
        reportContent: 'Tài liệu sao chép toàn bộ từ khóa luận 2024.',
        fileId: 'FIL_001',
      };

      const mockResponse: ReportMutationResponse = {
        message: 'Gửi báo cáo thành công.',
        data: {
          reportId: 'RPT_NEW_01',
          reporterUid: 'USR_001',
          reporterName: 'Sinh viên A',
          targetType: 'File',
          targetId: 'FIL_001',
          reportTypeId: 1,
          reportTypeName: 'Vi phạm bản quyền',
          reason: 'Tài liệu sao chép toàn bộ từ khóa luận 2024.',
          status: 'Pending',
          createdAt: '2026-09-22T10:00:00Z',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await reportService.createReport(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Report', {
        reportTypeId: 1,
        reportContent: 'Tài liệu sao chép toàn bộ từ khóa luận 2024.',
        reason: 'Tài liệu sao chép toàn bộ từ khóa luận 2024.',
        fileId: 'FIL_001',
        targetType: 'File',
        targetId: 'FIL_001',
      });
      expect(result).toEqual(mockResponse);
    });

    it('gửi báo cáo bình luận (Comment) thành công với commentId', async () => {
      const payload: CreateReportPayload = {
        reportTypeId: '2',
        reportContent: 'Bình luận chứa từ ngữ thù địch xúc phạm người khác.',
        commentId: 'COM_001',
        fileId: 'FIL_001',
      };

      const mockResponse: ReportMutationResponse = {
        message: 'Gửi báo cáo thành công.',
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await reportService.createReport(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Report', {
        reportTypeId: '2',
        reportContent: 'Bình luận chứa từ ngữ thù địch xúc phạm người khác.',
        reason: 'Bình luận chứa từ ngữ thù địch xúc phạm người khác.',
        commentId: 'COM_001',
        fileId: 'FIL_001',
        targetType: 'Comment',
        targetId: 'COM_001',
      });
      expect(result).toEqual(mockResponse);
    });

    it('gửi báo cáo người dùng (User) thành công với uidtarget', async () => {
      const payload: CreateReportPayload = {
        reportTypeId: '3',
        reportContent: 'Tài khoản mạo danh sinh viên khác để phát tán tài liệu giả.',
        uidtarget: 'USR_TARGET_01',
      };

      const mockResponse: ReportMutationResponse = {
        message: 'Gửi báo cáo thành công.',
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await reportService.createReport(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Report', {
        reportTypeId: '3',
        reportContent: 'Tài khoản mạo danh sinh viên khác để phát tán tài liệu giả.',
        reason: 'Tài khoản mạo danh sinh viên khác để phát tán tài liệu giả.',
        uidtarget: 'USR_TARGET_01',
        targetType: 'User',
        targetId: 'USR_TARGET_01',
      });
      expect(result).toEqual(mockResponse);
    });

    it('bắt lỗi khi API ném ra lỗi 409 Conflict (báo cáo đã tồn tại và đang chờ duyệt)', async () => {
      const payload: CreateReportPayload = {
        reportTypeId: 1,
        reportContent: 'Báo cáo trùng lặp',
        fileId: 'FIL_DUPLICATE',
      };

      const conflictError = new Error('Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.');
      vi.mocked(axiosClient.post).mockRejectedValueOnce(conflictError);

      await expect(reportService.createReport(payload)).rejects.toThrow(
        'Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.',
      );
    });

    it('bắt lỗi khi API ném ra lỗi 400 Bad Request (lỗi validation)', async () => {
      const payload: CreateReportPayload = {
        reportTypeId: 1,
        reportContent: 'Ngắn',
        fileId: 'FIL_001',
      };

      const badRequestError = new Error('Nội dung báo cáo là bắt buộc và tối đa 4000 ký tự.');
      vi.mocked(axiosClient.post).mockRejectedValueOnce(badRequestError);

      await expect(reportService.createReport(payload)).rejects.toThrow(
        'Nội dung báo cáo là bắt buộc và tối đa 4000 ký tự.',
      );
    });
  });
});
