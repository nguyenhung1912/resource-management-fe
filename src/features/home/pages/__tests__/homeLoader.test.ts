import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resourceService } from '@/services/resourceService';
import { homeLoader } from '../homeLoader';
import type { LookupItem } from '@/features/digital-resources/source-code/types/source-code.types';
import type { SearchPaginatedResult } from '@/features/home/types/home.types';

describe('homeLoader', () => {
  const mockFileTypes: LookupItem[] = [
    { id: '1', name: 'Báo cáo NCKH' },
    { id: '2', name: 'Khóa luận tốt nghiệp' },
  ];

  const mockSearchResult: SearchPaginatedResult = {
    items: [
      {
        fileId: 'FIL_001',
        fileName: 'Nghiên cứu ứng dụng Deep Learning trong Y tế',
        fileDescription: 'Báo cáo NCKH cấp trường năm 2026',
        fileUrl: 'https://cdn.example.com/file1.pdf',
        fileTypeName: 'Báo cáo NCKH',
        subMajorCode: 'CNTT_KTPM',
        yearCompleted: 2026,
        uploadBy: 'Nguyễn Văn A',
        createdAt: '2026-03-15T08:00:00Z',
        keywords: ['Deep Learning', 'Healthcare'],
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 6,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches file types and featured resources in parallel and returns loader data', async () => {
    const getFileTypesSpy = vi.spyOn(resourceService, 'getFileTypes').mockResolvedValue(mockFileTypes);
    const globalSearchSpy = vi.spyOn(resourceService, 'globalSearch').mockResolvedValue(mockSearchResult);

    const data = await homeLoader();

    expect(getFileTypesSpy).toHaveBeenCalledTimes(1);
    expect(globalSearchSpy).toHaveBeenCalledWith({
      page: 1,
      pageSize: 6,
      sortBy: 'date',
      sortDirection: 'desc',
    });

    expect(data.fileTypes).toEqual(mockFileTypes);
    expect(data.featuredResources).toEqual(mockSearchResult.items);
    expect(data.totalResources).toBe(1);
  });

  it('gracefully handles getFileTypes failure and still returns search results', async () => {
    vi.spyOn(resourceService, 'getFileTypes').mockRejectedValue(new Error('Network error'));
    vi.spyOn(resourceService, 'globalSearch').mockResolvedValue(mockSearchResult);

    const data = await homeLoader();

    expect(data.fileTypes).toEqual([]);
    expect(data.featuredResources).toEqual(mockSearchResult.items);
    expect(data.totalResources).toBe(1);
  });

  it('gracefully handles globalSearch failure and still returns file types', async () => {
    vi.spyOn(resourceService, 'getFileTypes').mockResolvedValue(mockFileTypes);
    vi.spyOn(resourceService, 'globalSearch').mockRejectedValue(new Error('Server error'));

    const data = await homeLoader();

    expect(data.fileTypes).toEqual(mockFileTypes);
    expect(data.featuredResources).toEqual([]);
    expect(data.totalResources).toBe(0);
  });

  it('returns safe fallback when both API calls reject', async () => {
    vi.spyOn(resourceService, 'getFileTypes').mockRejectedValue(new Error('Down'));
    vi.spyOn(resourceService, 'globalSearch').mockRejectedValue(new Error('Down'));

    const data = await homeLoader();

    expect(data).toEqual({
      fileTypes: [],
      featuredResources: [],
      totalResources: 0,
    });
  });
});
