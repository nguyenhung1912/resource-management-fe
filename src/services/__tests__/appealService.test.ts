import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { appealService } from '../appealService';
import type {
  AppealDetailEnvelopeResponse,
  AppealEnvelopeResponse,
  AppealsPaginatedEnvelopeResponse,
  CreateAppealRequest,
} from '@/features/appeals/types/appeal.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('appealService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppeal', () => {
    it('gửi payload tới đúng endpoint POST /api/moderation/appeals', async () => {
      const mockPayload: CreateAppealRequest = {
        fileId: 'FIL_123456',
        studentExplanation: 'Giải trình chi tiết nội dung bị hiểu nhầm trùng lặp',
        attachmentUrl: 'https://example.com/minh-chung.pdf',
      };

      const mockResponse: AppealEnvelopeResponse = {
        message: 'Gửi khiếu nại/giải trình thành công.',
        data: {
          appealId: 'APL_001',
          fileId: 'FIL_123456',
          fileName: 'Tài liệu nghiên cứu',
          appealAttempt: 1,
          studentExplanation: 'Giải trình chi tiết nội dung bị hiểu nhầm trùng lặp',
          attachmentUrl: 'https://example.com/minh-chung.pdf',
          status: 'Pending',
          createdAt: '2026-09-11T12:00:00Z',
        },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await appealService.createAppeal(mockPayload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/moderation/appeals', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMyAppeals', () => {
    it('gọi GET /api/moderation/appeals/me với query params chuẩn', async () => {
      const mockResponse: AppealsPaginatedEnvelopeResponse = {
        message: 'Lấy danh sách khiếu nại thành công.',
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

      const result = await appealService.getMyAppeals({
        status: 'Pending',
        pageNumber: 2,
        pageSize: 5,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/moderation/appeals/me', {
        params: {
          Status: 'Pending',
          PageNumber: 2,
          PageSize: 5,
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAppealDetail', () => {
    it('gọi GET /api/moderation/appeals/{appealId} với appealId được encode', async () => {
      const mockResponse: AppealDetailEnvelopeResponse = {
        message: 'Lấy chi tiết thành công',
        data: {
          appealId: 'APL/123',
          fileId: 'FIL_123',
          fileName: 'Tài liệu A',
          appealAttempt: 1,
          studentExplanation: 'Giải trình',
          status: 'Pending',
          createdAt: '2026-09-11T12:00:00Z',
          fileStatusId: 3,
          fileStatusName: 'Rejected',
        },
      };

      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await appealService.getAppealDetail('APL/123');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/moderation/appeals/APL%2F123');
      expect(result).toEqual(mockResponse);
    });
  });
});
