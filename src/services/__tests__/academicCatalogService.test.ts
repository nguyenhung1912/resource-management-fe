import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { academicCatalogService } from '../academicCatalogService';
import type {
  CourseResponse,
  DepartmentResponse,
  FileTypeResponse,
  MajorResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('academicCatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMajors gọi đúng endpoint /api/AcademicCatalog/majors', async () => {
    const mockMajors: MajorResponse[] = [
      { majorId: 'MAJOR-001', majorName: 'Công nghệ Thông tin', departmentId: 'DEPT-001' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockMajors });

    const result = await academicCatalogService.getMajors();

    expect(axiosClient.get).toHaveBeenCalledWith('/api/AcademicCatalog/majors');
    expect(result).toEqual(mockMajors);
  });

  it('getSubMajors gọi đúng endpoint /api/AcademicCatalog/submajors', async () => {
    const mockSubMajors: SubMajorResponse[] = [
      { subMajorCode: 'SM-SE', subMajorName: 'Kỹ thuật Phần mềm', majorId: 'MAJOR-001' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockSubMajors });

    const result = await academicCatalogService.getSubMajors();

    expect(axiosClient.get).toHaveBeenCalledWith('/api/AcademicCatalog/submajors');
    expect(result).toEqual(mockSubMajors);
  });

  it('getCourses gọi đúng endpoint /api/AcademicCatalog/courses', async () => {
    const mockCourses: CourseResponse[] = [
      { courseCode: 'COURSE-001', courseName: 'Nhập môn Lập trình', subMajorCode: 'SM-SE' },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockCourses });

    const result = await academicCatalogService.getCourses();

    expect(axiosClient.get).toHaveBeenCalledWith('/api/AcademicCatalog/courses');
    expect(result).toEqual(mockCourses);
  });

  it('getDepartments gọi đúng endpoint /api/Lookup/departments', async () => {
    const mockDepartments: DepartmentResponse[] = [{ id: 'DEPT-001', name: 'Công nghệ Thông tin' }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockDepartments });

    const result = await academicCatalogService.getDepartments();

    expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/departments');
    expect(result).toEqual(mockDepartments);
  });

  it('getFileTypes gọi đúng endpoint /api/Lookup/file-types', async () => {
    const mockFileTypes: FileTypeResponse[] = [{ id: 1, name: 'Báo cáo nghiên cứu' }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockFileTypes });

    const result = await academicCatalogService.getFileTypes();

    expect(axiosClient.get).toHaveBeenCalledWith('/api/Lookup/file-types');
    expect(result).toEqual(mockFileTypes);
  });
});
