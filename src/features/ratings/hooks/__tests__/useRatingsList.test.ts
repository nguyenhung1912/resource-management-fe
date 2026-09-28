import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ratingService } from '@/services/ratingService';
import { useRatingsList } from '../useRatingsList';

vi.mock('@/services/ratingService', () => ({
  ratingService: {
    getRatingsList: vi.fn(),
  },
}));

const mockRatingItem = {
  ratingId: 'RAT_1',
  fileId: 'FIL_1',
  uid: 'USR_1',
  fullName: 'Nguyễn Văn A',
  ratingScore: 5,
  createdAt: '2026-09-25T10:00:00Z',
};

describe('useRatingsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty items and default paging', () => {
    const { result } = renderHook(() => useRatingsList());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.pageIndex).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.selectedStar).toBeNull();
  });

  it('fetches ratings list successfully and updates state', async () => {
    vi.mocked(ratingService.getRatingsList).mockResolvedValueOnce({
      items: [mockRatingItem],
      totalItems: 1,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const { result } = renderHook(() => useRatingsList());

    await act(async () => {
      await result.current.fetchRatings('FIL_1', 1, null);
    });

    expect(ratingService.getRatingsList).toHaveBeenCalledWith('FIL_1', {
      star: undefined,
      pageIndex: 1,
      pageSize: 10,
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
  });

  it('updates star filter and triggers fetch', async () => {
    vi.mocked(ratingService.getRatingsList).mockResolvedValueOnce({
      items: [mockRatingItem],
      totalItems: 1,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const { result } = renderHook(() => useRatingsList());

    // Initial fetch to set activeFileId
    await act(async () => {
      await result.current.fetchRatings('FIL_1', 1);
    });

    // Set star filter to 5
    await act(async () => {
      result.current.setStarFilter(5);
    });

    expect(ratingService.getRatingsList).toHaveBeenLastCalledWith('FIL_1', {
      star: 5,
      pageIndex: 1,
      pageSize: 10,
    });
  });

  it('updates page and triggers fetch', async () => {
    vi.mocked(ratingService.getRatingsList).mockResolvedValue({
      items: [],
      totalItems: 15,
      pageIndex: 2,
      pageSize: 10,
      totalPages: 2,
    });

    const { result } = renderHook(() => useRatingsList());

    await act(async () => {
      await result.current.fetchRatings('FIL_1', 1);
    });

    await act(async () => {
      result.current.setPage(2);
    });

    expect(ratingService.getRatingsList).toHaveBeenLastCalledWith('FIL_1', {
      star: undefined,
      pageIndex: 2,
      pageSize: 10,
    });
  });
});
