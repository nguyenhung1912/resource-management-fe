import axiosClient from '@/services/axiosClient';
import type {
  CourseResponse,
  DepartmentResponse,
  FileTypeResponse,
  MajorResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

export const academicCatalogService = {
  // GET /api/AcademicCatalog/majors
  async getMajors(): Promise<MajorResponse[]> {
    const response = await axiosClient.get<MajorResponse[]>('/api/AcademicCatalog/majors');
    return response.data;
  },

  // GET /api/AcademicCatalog/submajors
  async getSubMajors(): Promise<SubMajorResponse[]> {
    const response = await axiosClient.get<SubMajorResponse[]>('/api/AcademicCatalog/submajors');
    return response.data;
  },

  // GET /api/AcademicCatalog/courses
  async getCourses(): Promise<CourseResponse[]> {
    const response = await axiosClient.get<CourseResponse[]>('/api/AcademicCatalog/courses');
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
