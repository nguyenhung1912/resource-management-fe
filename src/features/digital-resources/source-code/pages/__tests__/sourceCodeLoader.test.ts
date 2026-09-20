import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import { sourceCodeLoader } from '../sourceCodeLoader';
import type {
  LookupItem,
  SourceCodePaginatedResult,
} from '@/features/digital-resources/source-code/types/source-code.types';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    getFileTypes: vi.fn(),
    getSubMajors: vi.fn(),
    getCourses: vi.fn(),
    getFileStatuses: vi.fn(),
    searchResources: vi.fn(),
  },
}));

describe('sourceCodeLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resourceService.getFileStatuses).mockResolvedValue([]);
  });

  it('nạp dữ liệu ban đầu song song và tự nhận diện fileTypeId của Mã nguồn', async () => {
    const mockFileTypes: LookupItem[] = [
      { id: '1', name: 'Báo cáo NCKH' },
      { id: '5', name: 'Mã nguồn' },
    ];
    const mockSubMajors: LookupItem[] = [{ id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' }];
    const mockSearchResult: SourceCodePaginatedResult = {
      items: [
        {
          fileId: 'FIL_01',
          fileName: 'Dự án Thương mại Điện tử',
          fileDescription: 'Mã nguồn đầy đủ',
          fileUrl: 'https://example.com/file.zip',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT_KTPM',
          courseCode: 'IT3040',
          yearCompleted: 2026,
          githubLink: 'https://github.com/example/ecommerce',
          bannerUrl: null,
          fileStatusId: 2,
          fileStatusName: 'Approved',
          uploadUserId: 'USR_01',
          createdAt: '2026-09-20',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 12,
    };

    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce(mockFileTypes);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce(mockSubMajors);
    vi.mocked(resourceService.searchResources).mockResolvedValueOnce(mockSearchResult);

    const request = new Request('http://localhost/dashboard/source-code');
    const result = await sourceCodeLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.sourceCodeFileTypeId).toBe(5);
    expect(result.resourcesResult.items).toHaveLength(1);
    expect(result.subMajors).toEqual(mockSubMajors);
    expect(result.filters.pageNumber).toBe(1);
    expect(result.filters.pageSize).toBe(12);
    expect(result.filters.viewMode).toBe('grid');

    expect(resourceService.searchResources).toHaveBeenCalledWith({
      search: undefined,
      fileTypeId: 5,
      subMajorId: undefined,
      courseId: undefined,
      statusId: undefined,
      pageNumber: 1,
      pageSize: 12,
    });
  });

  it('xử lý các query parameters từ URL chính xác', async () => {
    const mockSearchResult: SourceCodePaginatedResult = {
      items: [],
      totalCount: 0,
      page: 2,
      pageSize: 20,
    };

    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce([{ id: '5', name: 'Mã nguồn' }]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce([]);
    vi.mocked(resourceService.getCourses).mockResolvedValueOnce([{ id: 'IT3040', name: 'Thực tập' }]);
    vi.mocked(resourceService.searchResources).mockResolvedValueOnce(mockSearchResult);

    const request = new Request(
      'http://localhost/dashboard/source-code?search=React&subMajorId=CNTT_KTPM&courseId=IT3040&statusId=2&pageNumber=2&pageSize=20&viewMode=table',
    );
    const result = await sourceCodeLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.filters.search).toBe('React');
    expect(result.filters.subMajorId).toBe('CNTT_KTPM');
    expect(result.filters.courseId).toBe('IT3040');
    expect(result.filters.statusId).toBe('2');
    expect(result.filters.pageNumber).toBe(2);
    expect(result.filters.pageSize).toBe(20);
    expect(result.filters.viewMode).toBe('table');

    expect(resourceService.getCourses).toHaveBeenCalledWith('CNTT_KTPM');
    expect(resourceService.searchResources).toHaveBeenCalledWith({
      search: 'React',
      fileTypeId: 5,
      subMajorId: 'CNTT_KTPM',
      courseId: 'IT3040',
      statusId: 2,
      pageNumber: 2,
      pageSize: 20,
    });
  });

  it('lọc danh sách theo onlyGithub nếu tham số được bật', async () => {
    const mockSearchResult: SourceCodePaginatedResult = {
      items: [
        {
          fileId: 'FIL_01',
          fileName: 'Project With Github',
          fileDescription: null,
          fileUrl: 'url',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT',
          courseCode: null,
          yearCompleted: 2026,
          githubLink: 'https://github.com/user/repo',
          bannerUrl: null,
          fileStatusId: 2,
          fileStatusName: 'Approved',
          uploadUserId: 'USR_01',
          createdAt: '2026-09-20',
        },
        {
          fileId: 'FIL_02',
          fileName: 'Project Without Github',
          fileDescription: null,
          fileUrl: 'url',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT',
          courseCode: null,
          yearCompleted: 2026,
          githubLink: null,
          bannerUrl: null,
          fileStatusId: 2,
          fileStatusName: 'Approved',
          uploadUserId: 'USR_02',
          createdAt: '2026-09-20',
        },
      ],
      totalCount: 2,
      page: 1,
      pageSize: 12,
    };

    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce([{ id: '5', name: 'Mã nguồn' }]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce([]);
    vi.mocked(resourceService.searchResources).mockResolvedValueOnce(mockSearchResult);

    const request = new Request('http://localhost/dashboard/source-code?onlyGithub=true');
    const result = await sourceCodeLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.resourcesResult.items).toHaveLength(1);
    expect(result.resourcesResult.items[0].fileName).toBe('Project With Github');
    expect(result.resourcesResult.totalCount).toBe(1);
  });

  it('xử lý an toàn khi API search trả về lỗi', async () => {
    vi.mocked(resourceService.getFileTypes).mockResolvedValueOnce([]);
    vi.mocked(resourceService.getSubMajors).mockResolvedValueOnce([]);
    vi.mocked(resourceService.searchResources).mockRejectedValueOnce(new Error('Network error'));

    const request = new Request('http://localhost/dashboard/source-code');
    const result = await sourceCodeLoader({ request, params: {} } as LoaderFunctionArgs);

    expect(result.resourcesResult.items).toEqual([]);
    expect(result.resourcesResult.totalCount).toBe(0);
  });
});
