import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { moderationService } from '../moderationService';
import type {
  ApproveModerationRequest,
  ModerationDecisionEnvelopeResponse,
  ModerationDetailEnvelopeResponse,
  ModerationHistoryEnvelopeResponse,
  ModerationQueuePaginatedResponse,
  PlagiarismCheckEnvelopeResponse,
  RejectModerationRequest,
} from '@/features/moderation/types/moderation.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('moderationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('approveDocument', () => {
    it('gửi POST tới đúng endpoint /api/Moderation/{fileId}/approve với payload', async () => {
      const fileId = 'FIL_abc-123';
      const payload: ApproveModerationRequest = {
        notes: 'Tài liệu đạt yêu cầu chuẩn NCKH',
      };

      const mockResponse: ModerationDecisionEnvelopeResponse = {
        message: 'Phê duyệt tài liệu thành công.',
        data: {
          fileId: 'FIL_abc-123',
          fileStatusId: 2,
          fileStatusName: 'Approved',
          moderatorUid: 'USR_lecturer01',
          decisionAt: '2026-09-13T07:20:00Z',
          notes: 'Tài liệu đạt yêu cầu chuẩn NCKH',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.approveDocument(fileId, payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Moderation/FIL_abc-123/approve', payload);
      expect(result).toEqual(mockResponse);
    });

    it('gửi payload rỗng mặc định nếu không truyền', async () => {
      const fileId = 'FIL_999';
      const mockResponse: ModerationDecisionEnvelopeResponse = {
        message: 'Phê duyệt tài liệu thành công.',
        data: {
          fileId: 'FIL_999',
          fileStatusId: 2,
          fileStatusName: 'Approved',
          moderatorUid: 'USR_lecturer01',
          decisionAt: '2026-09-13T07:20:00Z',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.approveDocument(fileId);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Moderation/FIL_999/approve', {});
      expect(result).toEqual(mockResponse);
    });

    it('encodeURIComponent an toàn cho fileId chứa ký tự đặc biệt', async () => {
      const fileId = 'FIL/#special?param=1';
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: {} });

      await moderationService.approveDocument(fileId);

      expect(axiosClient.post).toHaveBeenCalledWith(`/api/Moderation/${encodeURIComponent(fileId)}/approve`, {});
    });
  });

  describe('rejectDocument', () => {
    it('gửi POST tới đúng endpoint /api/Moderation/{fileId}/reject với payload đầy đủ', async () => {
      const fileId = 'FIL_reject_01';
      const payload: RejectModerationRequest = {
        reason: 'Độ trùng lặp vượt quá 30% quy định.',
        notes: 'Vui lòng xem lại chương 2 và chương 3 để trích dẫn lại.',
        plagiarismScore: 38.5,
      };

      const mockResponse: ModerationDecisionEnvelopeResponse = {
        message: 'Từ chối tài liệu thành công.',
        data: {
          fileId: 'FIL_reject_01',
          fileStatusId: 3,
          fileStatusName: 'Rejected',
          moderatorUid: 'USR_lecturer01',
          decisionAt: '2026-09-13T07:25:00Z',
          notes: 'Vui lòng xem lại chương 2 và chương 3 để trích dẫn lại.',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.rejectDocument(fileId, payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Moderation/FIL_reject_01/reject', payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getModerationDetails', () => {
    it('gọi GET tới /api/Moderation/{fileId}/details', async () => {
      const fileId = 'FIL_detail_01';
      const mockResponse: ModerationDetailEnvelopeResponse = {
        message: 'Lấy thông tin chi tiết tài liệu kiểm duyệt thành công.',
        data: {
          fileId: 'FIL_detail_01',
          fileName: 'Nghiên cứu AI',
          fileTypeId: 1,
          fileTypeName: 'Báo cáo NCKH',
        },
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.getModerationDetails(fileId);

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Moderation/FIL_detail_01/details');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getModerationQueue', () => {
    it('gọi GET tới /api/Moderation/queue với đầy đủ query parameters', async () => {
      const mockResponse: ModerationQueuePaginatedResponse = {
        message: 'Lấy danh sách hàng đợi kiểm duyệt thành công.',
        data: {
          items: [],
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.getModerationQueue({
        search: 'Học sâu',
        departmentId: 'DPT_IT',
        majorId: 'MAJ_CS',
        subMajorCode: 'CNTT_KTPM',
        fileTypeId: 2,
        courseCode: 'CS101',
        fromDate: '2026-09-01T00:00:00Z',
        toDate: '2026-09-25T23:59:59Z',
        pageNumber: 1,
        pageSize: 15,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Moderation/queue', {
        params: {
          Search: 'Học sâu',
          DepartmentId: 'DPT_IT',
          MajorId: 'MAJ_CS',
          SubMajorCode: 'CNTT_KTPM',
          FileTypeId: 2,
          CourseCode: 'CS101',
          FromDate: '2026-09-01T00:00:00Z',
          ToDate: '2026-09-25T23:59:59Z',
          PageNumber: 1,
          PageSize: 15,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('gọi GET tới /api/Moderation/queue không có params', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: { message: 'Thành công', data: { items: [] } },
      });

      await moderationService.getModerationQueue();

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Moderation/queue', {
        params: {},
      });
    });
  });

  describe('checkPlagiarism', () => {
    it('gọi POST tới /api/Moderation/{fileId}/check-plagiarism', async () => {
      const fileId = 'FIL_check_01';
      const mockResponse: PlagiarismCheckEnvelopeResponse = {
        message: 'Kết quả phân tích trùng lặp',
        data: {
          fileId: 'FIL_check_01',
          similarityScore: 18.5,
          matchedChunks: [],
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.checkPlagiarism(fileId);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Moderation/FIL_check_01/check-plagiarism');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getModerationHistory', () => {
    it('gọi GET tới /api/Moderation/{fileId}/history', async () => {
      const fileId = 'FIL_history_01';
      const mockResponse: ModerationHistoryEnvelopeResponse = {
        message: 'Lấy lịch sử kiểm duyệt thành công.',
        data: [
          {
            historyId: 'MDH_1',
            action: 'Reject',
            moderatorName: 'TS. Nguyễn Văn A',
            reason: 'Độ trùng lặp 35%',
            notes: 'Yêu cầu trích dẫn lại',
            plagiarismScore: 35,
            createdAt: '2026-09-12T10:00:00Z',
          },
        ],
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await moderationService.getModerationHistory(fileId);

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Moderation/FIL_history_01/history');
      expect(result).toEqual(mockResponse);
    });

    it('encodeURIComponent fileId trong URL history', async () => {
      const fileId = 'FIL/#special-id';
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: { message: 'OK', data: [] } });

      await moderationService.getModerationHistory(fileId);

      expect(axiosClient.get).toHaveBeenCalledWith(`/api/Moderation/${encodeURIComponent(fileId)}/history`);
    });
  });
});
