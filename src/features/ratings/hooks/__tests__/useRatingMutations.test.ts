import { act, renderHook } from '@testing-library/react';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ratingService } from '@/services/ratingService';
import { useRatingMutations } from '../useRatingMutations';

vi.mock('@/services/ratingService', () => ({
  ratingService: {
    upsertRating: vi.fn(),
    deleteRating: vi.fn(),
  },
}));

function createAxiosError(message: string): AxiosError {
  const error = new AxiosError(message);
  error.response = {
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data: { message },
  } as AxiosResponse;
  return error;
}

describe('useRatingMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useRatingMutations());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.mutationError).toBeNull();
    expect(result.current.mutationSuccess).toBeNull();
  });

  it('submits rating successfully', async () => {
    vi.mocked(ratingService.upsertRating).mockResolvedValueOnce({
      message: 'Đánh giá thành công.',
      data: {
        ratingId: 'RAT_1',
        fileId: 'FIL_1',
        uid: 'USR_1',
        fullName: 'Nguyễn Văn A',
        ratingScore: 5,
        createdAt: '2026-09-25T10:00:00Z',
      },
    });

    const { result } = renderHook(() => useRatingMutations());

    let res;
    await act(async () => {
      res = await result.current.submitRating('FIL_1', 5);
    });

    expect(res).not.toBeNull();
    expect(result.current.mutationSuccess).toBe('Đánh giá thành công.');
    expect(result.current.mutationError).toBeNull();
  });

  it('handles submit rating error gracefully with Axios error', async () => {
    vi.mocked(ratingService.upsertRating).mockRejectedValueOnce(createAxiosError('Lỗi kết nối máy chủ'));

    const { result } = renderHook(() => useRatingMutations());

    let res;
    await act(async () => {
      res = await result.current.submitRating('FIL_1', 5);
    });

    expect(res).toBeNull();
    expect(result.current.mutationError).toBe('Lỗi kết nối máy chủ');
  });

  it('removes rating successfully', async () => {
    vi.mocked(ratingService.deleteRating).mockResolvedValueOnce({
      message: 'Đã xóa đánh giá thành công.',
    });

    const { result } = renderHook(() => useRatingMutations());

    let success;
    await act(async () => {
      success = await result.current.removeRating('FIL_1');
    });

    expect(success).toBe(true);
    expect(result.current.mutationSuccess).toBe('Đã xóa đánh giá thành công.');
    expect(result.current.mutationError).toBeNull();
  });

  it('handles remove rating error gracefully with Axios error', async () => {
    vi.mocked(ratingService.deleteRating).mockRejectedValueOnce(createAxiosError('Không tìm thấy đánh giá để xóa'));

    const { result } = renderHook(() => useRatingMutations());

    let success;
    await act(async () => {
      success = await result.current.removeRating('FIL_1');
    });

    expect(success).toBe(false);
    expect(result.current.mutationError).toBe('Không tìm thấy đánh giá để xóa');
  });
});
