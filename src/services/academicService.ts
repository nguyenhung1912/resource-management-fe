import axiosClient from '@/services/axiosClient';

import type {
  Course,
  CreateCourseRequest,
  CreateDepartmentRequest,
  CreateMajorRequest,
  CreateSubMajorRequest,
  Department,
  Major,
  SubMajor,
  UpdateCourseRequest,
  UpdateDepartmentRequest,
  UpdateMajorRequest,
  UpdateSubMajorRequest,
} from '@/features/admin/academic/types/academic.types';

export const academicService = {
  // =========================
  // Department
  // =========================

  async getDepartments(): Promise<Department[]> {
    const response = await axiosClient.get<Department[]>('/api/Admin/departments');

    return response.data;
  },

  async createDepartment(request: CreateDepartmentRequest): Promise<Department> {
    const response = await axiosClient.post<Department>('/api/Admin/departments', request);

    return response.data;
  },

  async updateDepartment(request: UpdateDepartmentRequest): Promise<Department> {
    const response = await axiosClient.put<Department>('/api/Admin/departments', request);

    return response.data;
  },

  async deleteDepartment(departmentId: string): Promise<void> {
    await axiosClient.delete(`/api/Admin/departments/${departmentId}`);
  },

  // =========================
  // Major
  // =========================

  async getMajors(departmentId: string): Promise<Major[]> {
    const response = await axiosClient.get<Major[]>('/api/Admin/majors', {
      params: { departmentId },
    });

    return response.data;
  },

  async createMajor(request: CreateMajorRequest): Promise<Major> {
    const response = await axiosClient.post<Major>('/api/Admin/majors', request);

    return response.data;
  },

  async updateMajor(request: UpdateMajorRequest): Promise<Major> {
    const response = await axiosClient.put<Major>('/api/Admin/majors', request);

    return response.data;
  },

  async deleteMajor(majorId: string): Promise<void> {
    await axiosClient.delete(`/api/Admin/majors/${majorId}`);
  },

  // =========================
  // SubMajor
  // =========================

  async getSubMajors(majorId: string): Promise<SubMajor[]> {
    const response = await axiosClient.get<SubMajor[]>('/api/Admin/submajors', {
      params: { majorId },
    });

    return response.data;
  },

  async createSubMajor(request: CreateSubMajorRequest): Promise<SubMajor> {
    const response = await axiosClient.post<SubMajor>('/api/Admin/submajors', request);

    return response.data;
  },

  async updateSubMajor(request: UpdateSubMajorRequest): Promise<SubMajor> {
    const response = await axiosClient.put<SubMajor>('/api/Admin/submajors', request);

    return response.data;
  },

  async deleteSubMajor(subMajorCode: string): Promise<void> {
    await axiosClient.delete(`/api/Admin/submajors/${subMajorCode}`);
  },

  // =========================
  // Course
  // =========================

  async getCourses(subMajorCode: string): Promise<Course[]> {
    const response = await axiosClient.get<Course[]>('/api/Admin/courses', {
      params: { subMajorCode },
    });

    return response.data;
  },

  async createCourse(request: CreateCourseRequest): Promise<Course> {
    const response = await axiosClient.post<Course>('/api/Admin/courses', request);

    return response.data;
  },

  async updateCourse(request: UpdateCourseRequest): Promise<Course> {
    const response = await axiosClient.put<Course>('/api/Admin/courses', request);

    return response.data;
  },

  async deleteCourse(courseCode: string): Promise<void> {
    await axiosClient.delete(`/api/Admin/courses/${courseCode}`);
  },
};

export default academicService;
