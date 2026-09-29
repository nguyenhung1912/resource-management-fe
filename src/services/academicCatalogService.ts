import axiosClient from '@/services/axiosClient';
import type {
  CourseResponse,
  DepartmentResponse,
  FileTypeResponse,
  MajorResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

export const academicCatalogService = {
  // GET /api/Lookup/majors
  async getMajors(departmentId?: string): Promise<MajorResponse[]> {
    const response = await axiosClient.get<MajorResponse[]>('/api/Lookup/majors', {
      params: departmentId ? { departmentId } : undefined,
    });
    return response.data;
  },

  // GET /api/Lookup/submajors
  async getSubMajors(majorId?: string): Promise<SubMajorResponse[]> {
    const response = await axiosClient.get<SubMajorResponse[]>('/api/Lookup/submajors', {
      params: majorId ? { majorId } : undefined,
    });
    return response.data;
  },

  // GET /api/Lookup/courses
  async getCourses(submajorCode?: string): Promise<CourseResponse[]> {
    const response = await axiosClient.get<CourseResponse[]>('/api/Lookup/courses', {
      params: submajorCode ? { submajorCode } : undefined,
    });
    return response.data;
  },

  // GET /api/Lookup/departments
  async getDepartments(): Promise<DepartmentResponse[]> {
    const response = await axiosClient.get<DepartmentResponse[]>('/api/Lookup/departments');
    return response.data;
  },

  // GET /api/Lookup/file-types
  async getFileTypes(): Promise<FileTypeResponse[]> {
    const response = await axiosClient.get<FileTypeResponse[]>('/api/Lookup/file-types');
    return response.data;
  },
};

export default academicCatalogService;
