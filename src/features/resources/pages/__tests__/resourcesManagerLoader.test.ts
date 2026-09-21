import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourcesManagerLoader } from '../resourcesManagerLoader';
import { resourceService } from '@/services/resourceService';
import { SAMPLE_RESOURCES } from '@/features/resources/components/ResourcesManager';

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
  };
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

    expect(result.isSampleData).toBe(false);
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

  it('tự động dự phòng về dữ liệu mẫu khi service quăng lỗi hoặc chưa đăng nhập', async () => {
    vi.mocked(resourceService.getMyUploads).mockRejectedValue(new Error('Unauthorized 401'));

    const result = await resourcesManagerLoader(
      createMockLoaderArgs('http://localhost:3000/dashboard/resources-manager'),
    );

    expect(result.isSampleData).toBe(true);
    expect(result.resourcesData.items).toHaveLength(SAMPLE_RESOURCES.length);
    expect(result.statusCounts.all).toBe(SAMPLE_RESOURCES.length);
    expect(result.stats[0].value).toBe(856);
  });

  it('lọc dữ liệu mẫu chính xác khi ở chế độ fallback', async () => {
    vi.mocked(resourceService.getMyUploads).mockRejectedValue(new Error('Network error'));

    const result = await resourcesManagerLoader(
      createMockLoaderArgs('http://localhost:3000/dashboard/resources-manager?status=1'),
    );

    expect(result.isSampleData).toBe(true);
    expect(result.resourcesData.items.every((item) => item.fileStatusId === 1)).toBe(true);
  });
});
