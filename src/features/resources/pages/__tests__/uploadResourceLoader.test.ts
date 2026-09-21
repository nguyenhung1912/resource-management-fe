import { beforeEach, describe, expect, it, vi } from 'vitest';
import { academicCatalogService } from '@/services/academicCatalogService';
import {
  clearUploadResourceCatalogCache,
  initialUploadResourceCatalogData,
  uploadResourceLoader,
} from '../uploadResourceLoader';
import type {
  CourseResponse,
  DepartmentResponse,
  FileTypeResponse,
  MajorResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

vi.mock('@/services/academicCatalogService', () => ({
  academicCatalogService: {
    getDepartments: vi.fn(),
    getMajors: vi.fn(),
    getSubMajors: vi.fn(),
    getCourses: vi.fn(),
    getFileTypes: vi.fn(),
  },
}));

describe('uploadResourceLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearUploadResourceCatalogCache();
  });

  it('tải đồng thời tất cả danh mục và trả về dữ liệu loader đầy đủ', async () => {
    const mockDepts: DepartmentResponse[] = [{ id: 'DEPT-001', name: 'Công nghệ Thông tin' }];
    const mockMajors: MajorResponse[] = [{ majorId: 'MAJOR-001', majorName: 'CNTT', departmentId: 'DEPT-001' }];
    const mockSubMajors: SubMajorResponse[] = [{ subMajorCode: 'SM-SE', subMajorName: 'KTPM', majorId: 'MAJOR-001' }];
    const mockCourses: CourseResponse[] = [{ courseCode: 'PRN222', courseName: 'C# .NET', subMajorCode: 'SM-SE' }];
    const mockFileTypes: FileTypeResponse[] = [{ id: 1, name: 'Báo cáo' }];

    vi.mocked(academicCatalogService.getDepartments).mockResolvedValueOnce(mockDepts);
    vi.mocked(academicCatalogService.getMajors).mockResolvedValueOnce(mockMajors);
    vi.mocked(academicCatalogService.getSubMajors).mockResolvedValueOnce(mockSubMajors);
    vi.mocked(academicCatalogService.getCourses).mockResolvedValueOnce(mockCourses);
    vi.mocked(academicCatalogService.getFileTypes).mockResolvedValueOnce(mockFileTypes);

    const result = await uploadResourceLoader();

    expect(result).toEqual({
      departments: mockDepts,
      majors: mockMajors,
      subMajors: mockSubMajors,
      courses: mockCourses,
      fileTypes: mockFileTypes,
    });

    // Gọi lần 2 lấy từ module cache mà không gọi lại service
    const cachedResult = await uploadResourceLoader();
    expect(cachedResult).toEqual(result);
    expect(academicCatalogService.getDepartments).toHaveBeenCalledTimes(1);
  });

  it('xử lý lỗi từng phần và trả về danh sách rỗng thay vì làm sập trang', async () => {
    vi.mocked(academicCatalogService.getDepartments).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(academicCatalogService.getMajors).mockResolvedValueOnce([
      { majorId: 'MAJOR-001', majorName: 'CNTT', departmentId: 'DEPT-001' },
    ]);
    vi.mocked(academicCatalogService.getSubMajors).mockRejectedValueOnce(new Error('500 Server Error'));
    vi.mocked(academicCatalogService.getCourses).mockResolvedValueOnce([]);
    vi.mocked(academicCatalogService.getFileTypes).mockResolvedValueOnce([{ id: 1, name: 'Báo cáo' }]);

    const result = await uploadResourceLoader();

    expect(result.departments).toEqual([]);
    expect(result.majors).toHaveLength(1);
    expect(result.subMajors).toEqual([]);
    expect(result.fileTypes).toHaveLength(1);
  });

  it('trả về fallback an toàn khi tất cả API đều thất bại', async () => {
    vi.mocked(academicCatalogService.getDepartments).mockRejectedValueOnce(new Error('Fatal'));
    vi.mocked(academicCatalogService.getMajors).mockRejectedValueOnce(new Error('Fatal'));
    vi.mocked(academicCatalogService.getSubMajors).mockRejectedValueOnce(new Error('Fatal'));
    vi.mocked(academicCatalogService.getCourses).mockRejectedValueOnce(new Error('Fatal'));
    vi.mocked(academicCatalogService.getFileTypes).mockRejectedValueOnce(new Error('Fatal'));

    const result = await uploadResourceLoader();

    expect(result).toEqual(initialUploadResourceCatalogData);
  });
});
