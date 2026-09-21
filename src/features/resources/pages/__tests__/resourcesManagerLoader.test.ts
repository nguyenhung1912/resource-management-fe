import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourcesManagerLoader } from '../resourcesManagerLoader';
import { resourceService } from '@/services/resourceService';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    getMyUploads: vi.fn(),
  },
}));

function createMockLoaderArgs(url: string): LoaderFunctionArgs {
  return {
    request: new Request(url),
    params: {},
    context: undefined,
  } as LoaderFunctionArgs;
}

describe('resourcesManagerLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lấy dữ liệu thành công từ resourceService và tổng hợp số liệu thống kê', async () => {
    const mockItems = [
      {
        fileId: 'FIL_1',
        fileName: 'Tài liệu hướng dẫn.pdf',
        fileTypeName: 'Tài liệu',
        fileStatusId: 1,
        fileStatusName: 'Đã duyệt',
        majorId: 'CNTT',
        majorName: 'Công nghệ thông tin',
        subMajorName: 'Kỹ thuật phần mềm',
        courseName: 'Lập trình Web',
        keywords: ['web'],
        authors: [{ id: '1', fullName: 'Giảng viên A' }],
      },
    ];

    vi.mocked(resourceService.getMyUploads)
      .mockResolvedValueOnce({
        items: mockItems,
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      .mockResolvedValueOnce({ items: [], totalCount: 15, pageNumber: 1, pageSize: 1, totalPages: 15 }) // approved
      .mockResolvedValueOnce({ items: [], totalCount: 4, pageNumber: 1, pageSize: 1, totalPages: 4 }) // pending
      .mockResolvedValueOnce({ items: [], totalCount: 2, pageNumber: 1, pageSize: 1, totalPages: 2 }); // rejected

    const result = await resourcesManagerLoader(
      createMockLoaderArgs('http://localhost:3000/dashboard/resources-manager?search=web&status=1&page=1&sort=oldest'),
    );

    expect(resourceService.getMyUploads).toHaveBeenCalledWith({
      search: 'web',
      fileStatusId: 1,
      pageNumber: 1,
      pageSize: 10,
      sortDirection: 'asc',
    });

    expect(result.resourcesData.items).toEqual(mockItems);
    expect(result.statusCounts).toEqual({
      all: 21,
      approved: 15,
      pending: 4,
      rejected: 2,
    });
    expect(result.stats).toEqual([
      expect.objectContaining({ label: 'Đã duyệt', value: 15 }),
      expect.objectContaining({ label: 'Chờ duyệt', value: 4 }),
      expect.objectContaining({ label: 'Bị từ chối', value: 2 }),
    ]);
  });

  it('trả về danh sách rỗng và số liệu 0 khi service báo lỗi hoặc không có dữ liệu', async () => {
    vi.mocked(resourceService.getMyUploads).mockRejectedValue(new Error('Unauthorized 401'));

    const result = await resourcesManagerLoader(
      createMockLoaderArgs('http://localhost:3000/dashboard/resources-manager'),
    );

    expect(result.resourcesData.items).toHaveLength(0);
    expect(result.resourcesData.totalCount).toBe(0);
    expect(result.statusCounts).toEqual({
      all: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });
    expect(result.stats[0].value).toBe(0);
    expect(result.stats[1].value).toBe(0);
    expect(result.stats[2].value).toBe(0);
  });
});
