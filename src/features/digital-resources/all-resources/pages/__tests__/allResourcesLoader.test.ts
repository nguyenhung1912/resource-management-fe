import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import { allResourcesLoader, resetLibraryLookupCache } from '../allResourcesLoader';
import type {
  LibraryResourcePaginatedResult,
  LookupItem,
  RecommendedResourceItem,
} from '../../types/all-resources.types';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    getFileTypes: vi.fn(),
    getSubMajors: vi.fn(),
    getCourses: vi.fn(),
    getFileStatuses: vi.fn(),
    getRecommendations: vi.fn(),
    searchResources: vi.fn(),
  },
}));

describe('allResourcesLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLibraryLookupCache();
    vi.mocked(resourceService.getFileStatuses).mockResolvedValue([]);
    vi.mocked(resourceService.getRecommendations).mockResolvedValue([]);
  });

  it('nạp dữ liệu ban đầu song song với tham số mặc định', async () => {
    const mockFileTypes: LookupItem[] = [
      { id: '1', name: 'Bài giảng & Giáo trình' },
      { id: '2', name: 'Khóa luận tốt nghiệp' },
    ];
    const mockSubMajors: LookupItem[] = [{ id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' }];
    const mockRecommendations: RecommendedResourceItem[] = [
      {
        fileId: 'FIL_REC_01',
        fileName: 'Tài liệu đề xuất',
        averageScore: 4.9,
        createdAt: '2026-09-20T00:00:00Z',
      },
    ];
    const mockSearchResult: LibraryResourcePaginatedResult = {
      items: [
        {
          fileId: 'FIL_01',
          fileName: 'Giáo trình Cấu trúc Dữ liệu',
          fileDescription: 'Tài liệu môn học',
          fileUrl: 'https://example.com/file.pdf',
          fileTypeId: 1,
          fileTypeName: 'Bài giảng & Giáo trình',
          subMajorCode: 'CNTT_KTPM',
          courseCode: 'IT2020',
          yearCompleted: 2026,
          githubLink: null,
          bannerImage: 'https://example.com/banner.jpg',
          fileSize: 1024000,
          createdAt: '2026-09-20T10:00:00Z',
          uploadBy: 'ThS. Nguyễn Văn B',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 12,
    };

    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce(mockFileTypes);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce(mockSubMajors);
    vi.mocked(resourceService.getRecommendations).mockResolvedValueOnce(mockRecommendations);
    vi.mocked(resourceService.searchResources).mockResolvedValueOnce(mockSearchResult);

    const request = new Request('http://localhost/dashboard/resources');
    const result = await allResourcesLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.fileTypes).toEqual(mockFileTypes);
    expect(result.subMajors).toEqual(mockSubMajors);
    expect(result.recommendedResources).toEqual(mockRecommendations);
    expect(result.resourcesResult.items).toHaveLength(1);
    expect(result.filters.pageNumber).toBe(1);
    expect(result.filters.pageSize).toBe(12);
    expect(result.filters.viewMode).toBe('grid');
    expect(result.filters.search).toBe('');

    expect(resourceService.searchResources).toHaveBeenCalledWith({
      search: undefined,
      fileTypeId: undefined,
      subMajorId: undefined,
      courseId: undefined,
      statusId: undefined,
      pageNumber: 1,
      pageSize: 12,
    });
  });

  it('xử lý chính xác các query parameters từ URL', async () => {
    const mockSearchResult: LibraryResourcePaginatedResult = {
      items: [],
      totalCount: 0,
      page: 2,
      pageSize: 15,
    };

    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce([{ id: '2', name: 'Khóa luận' }]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce([{ id: 'CNTT_HTTT', name: 'Hệ thống thông tin' }]);
    vi.mocked(resourceService.getCourses).mockResolvedValueOnce([{ id: 'IT4010', name: 'Đồ án' }]);
    vi.mocked(resourceService.searchResources).mockResolvedValueOnce(mockSearchResult);

    const request = new Request(
      'http://localhost/dashboard/resources?search=AI&fileTypeId=2&subMajorId=CNTT_HTTT&courseId=IT4010&statusId=2&pageNumber=2&pageSize=15&viewMode=table&sortBy=name&sortDirection=desc',
    );
    const result = await allResourcesLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.filters.search).toBe('AI');
    expect(result.filters.fileTypeId).toBe(2);
    expect(result.filters.subMajorId).toBe('CNTT_HTTT');
    expect(result.filters.courseId).toBe('IT4010');
    expect(result.filters.pageNumber).toBe(2);
    expect(result.filters.pageSize).toBe(15);
    expect(result.filters.viewMode).toBe('table');
    expect(result.filters.sortBy).toBe('name');
    expect(result.filters.sortDirection).toBe('desc');

    expect(resourceService.getCourses).toHaveBeenCalledWith('CNTT_HTTT');
    expect(resourceService.searchResources).toHaveBeenCalledWith({
      search: 'AI',
      fileTypeId: 2,
      subMajorId: 'CNTT_HTTT',
      courseId: 'IT4010',
      statusId: 2,
      pageNumber: 2,
      pageSize: 15,
    });
  });

  it('tận dụng module-level caching cho lookups tĩnh', async () => {
    vi.mocked(resourceService.getFileTypes).mockResolvedValue([{ id: '1', name: 'Giáo trình' }]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValue([{ id: 'CNTT', name: 'Công nghệ thông tin' }]);
    vi.mocked(resourceService.searchResources).mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 12,
    });

    const request1 = new Request('http://localhost/dashboard/resources');
    await allResourcesLoader({ request: request1, params: {} } as LoaderFunctionArgs);

    const request2 = new Request('http://localhost/dashboard/resources?pageNumber=2');
    await allResourcesLoader({ request: request2, params: {} } as LoaderFunctionArgs);

    expect(resourceService.getFileTypes).toHaveBeenCalledTimes(1);
    expect(resourceService.getSubMajors).toHaveBeenCalledTimes(1);
  });

  it('fallback an toàn khi searchResources hoặc getRecommendations ném lỗi', async () => {
    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce([]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce([]);
    vi.mocked(resourceService.getRecommendations).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(resourceService.searchResources).mockRejectedValueOnce(new Error('Server error'));

    const request = new Request('http://localhost/dashboard/resources');
    const result = await allResourcesLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.resourcesResult.items).toEqual([]);
    expect(result.resourcesResult.totalCount).toBe(0);
    expect(result.recommendedResources).toEqual([]);
  });
});
