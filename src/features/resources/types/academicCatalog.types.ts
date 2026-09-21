export interface MajorResponse {
  majorId: string;
  majorName: string;
  departmentId?: string | null;
}

export interface SubMajorResponse {
  subMajorCode: string;
  subMajorName: string;
  majorId?: string | null;
}

export interface CourseResponse {
  courseCode: string;
  courseName: string;
  subMajorCode?: string | null;
}

export interface DepartmentResponse {
  id: string;
  name: string;
}

export interface FileTypeResponse {
  id: string | number;
  name: string;
}

export interface AcademicCatalogData {
  departments: DepartmentResponse[];
  majors: MajorResponse[];
  subMajors: SubMajorResponse[];
  courses: CourseResponse[];
  fileTypes: FileTypeResponse[];
}
