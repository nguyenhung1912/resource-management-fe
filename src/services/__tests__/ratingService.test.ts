import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { ratingService } from '../ratingService';
import {
  normalizePagedRating,
  normalizeRatingSummary,
  normalizeStarDistribution,
} from '@/features/ratings/types/rating.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

function createAxiosError(status: number): AxiosError {
  const error = new AxiosError(`Request failed with status code ${status}`);
  error.response = {
    status,
    statusText: status === 404 ? 'Not Found' : 'Unauthorized',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data: { message: 'Error' },
  } as AxiosResponse;
  return error;
}

describe('ratingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizers', () => {
    it('normalizeStarDistribution handles dictionary keys and star-prefixed keys', () => {
      const fromDictionary = { 1: 2, 2: 0, 3: 5, 4: 10, 5: 20 };
      expect(normalizeStarDistribution(fromDictionary)).toEqual({
        1: 2,
        2: 0,
        3: 5,
        4: 10,
        5: 20,
      });

      const fromSwagger = { star1: 1, star2: 2, star3: 3, star4: 4, star5: 5 };
      expect(normalizeStarDistribution(fromSwagger)).toEqual({
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
      });

      expect(normalizeStarDistribution(null)).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
    });

    it('normalizeRatingSummary correctly normalizes C# AverageScore and Swagger averageRating', () => {
      const csharpData = {
        fileId: 'FIL_001',
        averageScore: 4.67,
        totalRatings: 15,
        starDistribution: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 8 },
        currentUserRating: 5.0,
      };

      const result1 = normalizeRatingSummary(csharpData);
      expect(result1.fileId).toBe('FIL_001');
      expect(result1.averageRating).toBe(4.7);
      expect(result1.totalRatings).toBe(15);
      expect(result1.currentUserRating).toBe(5);

      const swaggerData = {
        fileId: 'FIL_002',
        averageRating: 3.5,
        totalRatings: 4,
        starDistribution: { star1: 0, star2: 0, star3: 2, star4: 2, star5: 0 },
        currentUserRating: {
          ratingScore: 4.0,
        },
      };

      const result2 = normalizeRatingSummary(swaggerData);
      expect(result2.fileId).toBe('FIL_002');
      expect(result2.averageRating).toBe(3.5);
      expect(result2.currentUserRating).toBe(4);
    });

    it('normalizePagedRating handles items, totalItems, and missing values safely', () => {
      const raw = {
        items: [
          {
            ratingId: 'RAT_1',
            fileId: 'FIL_1',
            uid: 'USR_1',
            fullName: 'Nguyễn Văn A',
            ratingScore: 5,
            createdAt: '2026-09-25T12:00:00Z',
          },
        ],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
      };

      const paged = normalizePagedRating(raw);
      expect(paged.items).toHaveLength(1);
      expect(paged.items[0].fullName).toBe('Nguyễn Văn A');
      expect(paged.items[0].ratingScore).toBe(5);
      expect(paged.totalItems).toBe(1);
    });
  });

  describe('API methods', () => {
    it('getRatingSummary calls GET /api/Rating/file/{fileId}/summary and returns normalized summary', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: {
          fileId: 'FIL_TEST',
          averageScore: 4.5,
          totalRatings: 10,
          starDistribution: { 1: 0, 2: 0, 3: 0, 4: 5, 5: 5 },
          currentUserRating: 5,
        },
      });

      const summary = await ratingService.getRatingSummary('FIL_TEST');
      expect(axiosClient.get).toHaveBeenCalledWith('/api/Rating/file/FIL_TEST/summary');
      expect(summary.averageRating).toBe(4.5);
      expect(summary.totalRatings).toBe(10);
      expect(summary.currentUserRating).toBe(5);
    });

    it('getMyRating returns rating item on success', async () => {
      const mockItem = {
        ratingId: 'RAT_MY',
        fileId: 'FIL_TEST',
        uid: 'USR_123',
        fullName: 'Tôi',
        ratingScore: 4,
        createdAt: '2026-09-25T10:00:00Z',
      };
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockItem });

      const result = await ratingService.getMyRating('FIL_TEST');
      expect(axiosClient.get).toHaveBeenCalledWith('/api/Rating/file/FIL_TEST/my-rating');
      expect(result).toEqual(mockItem);
    });

    it('getMyRating returns null gracefully on 404 or 401', async () => {
      vi.mocked(axiosClient.get).mockRejectedValueOnce(createAxiosError(404));

      const result = await ratingService.getMyRating('FIL_TEST');
      expect(result).toBeNull();
    });

    it('upsertRating calls POST /api/Rating with fileId and ratingScore', async () => {
      vi.mocked(axiosClient.post).mockResolvedValueOnce({
        data: { message: 'Đánh giá tài liệu thành công.' },
      });

      const res = await ratingService.upsertRating({ fileId: 'FIL_TEST', ratingScore: 5 });
      expect(axiosClient.post).toHaveBeenCalledWith('/api/Rating', {
        fileId: 'FIL_TEST',
        ratingScore: 5,
      });
      expect(res.message).toBe('Đánh giá tài liệu thành công.');
    });

    it('deleteRating calls DELETE /api/Rating/file/{fileId}', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValueOnce({
        data: { message: 'Đã xóa đánh giá thành công.' },
      });

      const res = await ratingService.deleteRating('FIL_TEST');
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/Rating/file/FIL_TEST');
      expect(res.message).toBe('Đã xóa đánh giá thành công.');
    });

    it('deleteRating falls back to /api/Rating/file/{fileId}/my-rating when primary returns 404', async () => {
      vi.mocked(axiosClient.delete)
        .mockRejectedValueOnce(createAxiosError(404))
        .mockResolvedValueOnce({
          data: { message: 'Đã xóa đánh giá thành công qua fallback.' },
        });

      const res = await ratingService.deleteRating('FIL_TEST');
      expect(axiosClient.delete).toHaveBeenCalledTimes(2);
      expect(axiosClient.delete).toHaveBeenNthCalledWith(1, '/api/Rating/file/FIL_TEST');
      expect(axiosClient.delete).toHaveBeenNthCalledWith(2, '/api/Rating/file/FIL_TEST/my-rating');
      expect(res.message).toBe('Đã xóa đánh giá thành công qua fallback.');
    });

    it('getRatingsList passes Star, PageIndex, and PageSize params', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: {
          items: [],
          totalItems: 0,
          pageIndex: 2,
          pageSize: 5,
          totalPages: 0,
        },
      });

      await ratingService.getRatingsList('FIL_TEST', {
        star: 5,
        pageIndex: 2,
        pageSize: 5,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Rating/file/FIL_TEST/list', {
        params: {
          Star: 5,
          RatingScore: 5,
          PageIndex: 2,
          PageSize: 5,
        },
      });
    });
  });
});
