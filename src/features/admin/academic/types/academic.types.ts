export interface Department {
  departmentId: string;
  departmentName: string;
}

export interface Major {
  majorId: string;
  majorName: string;
  departmentId: string;
}

export interface SubMajor {
  subMajorCode: string;
  subMajorName: string;
  majorId: string;
}

export interface Course {
  courseCode: string;
  courseName: string;
  subMajorCode: string;
}

export interface CreateDepartmentRequest {
  departmentName: string;
}

export interface UpdateDepartmentRequest {
  departmentId: string;
  departmentName: string;
}

export interface CreateMajorRequest {
  majorName: string;
  departmentId: string;
}

export interface UpdateMajorRequest {
  majorId: string;
  majorName: string;
  departmentId: string;
}

export interface CreateSubMajorRequest {
  subMajorName: string;
  majorId: string;
}

export interface UpdateSubMajorRequest {
  subMajorCode: string;
  subMajorName: string;
  majorId: string;
}

export interface CreateCourseRequest {
  courseName: string;
  subMajorCode: string;
}

export interface UpdateCourseRequest {
  courseCode: string;
  courseName: string;
  subMajorCode: string;
}

export type AcademicTab = 'departments' | 'majors' | 'submajors' | 'courses';
