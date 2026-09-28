import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import * as uploadLoaderModule from '../uploadResourceLoader';
import { createFallbackResource, mapDetailToInitialValues, modifyResourceLoader } from '../modifyResourceLoader';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';

describe('modifyResourceLoader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCatalog = {
    departments: [],
    majors: [],
    subMajors: [{ subMajorCode: 'SE', subMajorName: 'Kỹ thuật phần mềm', majorId: 'CNTT' }],
    courses: [{ courseCode: 'PRN222', courseName: 'Lập trình .NET', subMajorCode: 'SE' }],
    fileTypes: [{ id: 1, name: 'Báo cáo', description: '' }],
  };

  const mockDetail: ResourceDetailResponse = {
    fileId: 'res-999',
    fileName: 'Đồ án tốt nghiệp AI.pdf',
    fileDescription: 'Mô tả chi tiết đồ án',
    fileUrl: 'https://storage.example.com/res-999.pdf',
    fileTypeId: 2,
    fileTypeName: 'Đồ án',
    fileStatusId: 1,
    fileStatusName: 'Đã duyệt',
    majorId: 'CNTT',
    majorName: 'Công nghệ thông tin',
    subMajorCode: 'AI',
    subMajorName: 'Trí tuệ nhân tạo',
    courseCode: 'AIT301',
    courseName: 'Deep Learning',
    yearCompleted: 2025,
    fileSize: 5_000_000,
    createdAt: '2025-01-01T00:00:00Z',
    authorNames: ['Trần Thị B', 'Lê Văn C'],
    keywords: ['AI', 'Computer Vision'],
    authors: [],
  };

  it('tải dữ liệu tài nguyên và catalog thành công từ backend', async () => {
    vi.spyOn(resourceService, 'getResourceDetail').mockResolvedValue(mockDetail);
    vi.spyOn(uploadLoaderModule, 'uploadResourceLoader').mockResolvedValue(mockCatalog);

    const args = {
      params: { resourceId: 'res-999' },
      request: new Request('http://localhost:5173/dashboard/resources-manager/res-999/edit'),
    } as unknown as LoaderFunctionArgs;

    const result = await modifyResourceLoader(args);

    expect(result.resource.id).toBe('res-999');
    expect(result.resource.fileName).toBe('Đồ án tốt nghiệp AI.pdf');
    expect(result.resource.fileDescription).toBe('Mô tả chi tiết đồ án');
    expect(result.resource.fileTypeId).toBe(2);
    expect(result.resource.subMajorCode).toBe('AI');
    expect(result.resource.courseCode).toBe('AIT301');
    expect(result.resource.yearCompleted).toBe(2025);
    expect(result.resource.authorNames).toEqual(['Trần Thị B', 'Lê Văn C']);
    expect(result.resource.keywords).toEqual(['AI', 'Computer Vision']);
    expect(result.catalog).toEqual(mockCatalog);
  });

  it('dự phòng về fallback resource khi backend trả về lỗi hoặc null', async () => {
    vi.spyOn(resourceService, 'getResourceDetail').mockRejectedValue(new Error('Network error'));
    vi.spyOn(uploadLoaderModule, 'uploadResourceLoader').mockResolvedValue(mockCatalog);

    const args = {
      params: { resourceId: 'res-fallback' },
      request: new Request('http://localhost:5173/dashboard/resources-manager/res-fallback/edit'),
    } as unknown as LoaderFunctionArgs;

    const result = await modifyResourceLoader(args);

    expect(result.resource.id).toBe('res-fallback');
    expect(result.resource.documentFileName).toBe('Báo cáo thực tập_Final.pdf');
    expect(result.catalog).toEqual(mockCatalog);
  });

  it('mapDetailToInitialValues chuyển đổi authors array khi authorNames trống', () => {
    const detailWithAuthors: ResourceDetailResponse = {
      ...mockDetail,
      authorNames: [],
      authors: [{ id: 'a-1', fullName: 'Hoàng Văn D' }],
    };

    const initialValues = mapDetailToInitialValues('res-1', detailWithAuthors);
    expect(initialValues.authorNames).toEqual(['Hoàng Văn D']);
  });

  it('createFallbackResource trả về dữ liệu mẫu với đúng id', () => {
    const fallback = createFallbackResource('test-id');
    expect(fallback.id).toBe('test-id');
    expect(fallback.fileName).toBe('Báo cáo thực tập');
  });
});
