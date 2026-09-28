import { academicCatalogService } from '@/services/academicCatalogService';
import type {
  CourseResponse,
  DepartmentResponse,
  FileTypeResponse,
  MajorResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

export interface UploadResourceLoaderData {
  departments: DepartmentResponse[];
  majors: MajorResponse[];
  subMajors: SubMajorResponse[];
  courses: CourseResponse[];
  fileTypes: FileTypeResponse[];
}

export const initialUploadResourceCatalogData: UploadResourceLoaderData = {
  departments: [],
  majors: [],
  subMajors: [],
  courses: [],
  fileTypes: [],
};

// Module-level cache để tối ưu hiệu năng và tránh gọi lặp lại các danh mục tĩnh
let cachedCatalog: UploadResourceLoaderData | null = null;

export function clearUploadResourceCatalogCache(): void {
  cachedCatalog = null;
}

export async function uploadResourceLoader(): Promise<UploadResourceLoaderData> {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  try {
    // async-parallel: Tải đồng thời tất cả danh mục tĩnh cho trang upload
    const [departmentsRes, majorsRes, subMajorsRes, coursesRes, fileTypesRes] = await Promise.allSettled([
      academicCatalogService.getDepartments(),
      academicCatalogService.getMajors(),
      academicCatalogService.getSubMajors(),
      academicCatalogService.getCourses(),
      academicCatalogService.getFileTypes(),
    ]);

    const result: UploadResourceLoaderData = {
      departments: departmentsRes.status === 'fulfilled' ? departmentsRes.value : [],
      majors: majorsRes.status === 'fulfilled' ? majorsRes.value : [],
      subMajors: subMajorsRes.status === 'fulfilled' ? subMajorsRes.value : [],
      courses: coursesRes.status === 'fulfilled' ? coursesRes.value : [],
      fileTypes: fileTypesRes.status === 'fulfilled' ? fileTypesRes.value : [],
    };

    // Chỉ lưu cache khi có ít nhất một nguồn dữ liệu thành công
    if (
      result.departments.length > 0 ||
      result.majors.length > 0 ||
      result.subMajors.length > 0 ||
      result.courses.length > 0 ||
      result.fileTypes.length > 0
    ) {
      cachedCatalog = result;
    }

    return result;
  } catch {
    return initialUploadResourceCatalogData;
  }
}

export default uploadResourceLoader;
