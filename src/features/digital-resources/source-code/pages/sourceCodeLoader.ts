import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import type {
  LookupItem,
  SourceCodeFilterValues,
  SourceCodePaginatedResult,
} from '@/features/digital-resources/source-code/types/source-code.types';
import { isValidGithubUrl } from '../utils/sourceCodeUtils';

export interface SourceCodeLoaderData {
  resourcesResult: SourceCodePaginatedResult;
  fileTypes: LookupItem[];
  subMajors: LookupItem[];
  courses: LookupItem[];
  fileStatuses: LookupItem[];
  sourceCodeFileTypeId: number | null;
  filters: SourceCodeFilterValues;
}

// Module-level cache for lookup data to prevent repeated network round-trips
let cachedFileTypes: LookupItem[] | null = null;
let cachedSubMajors: LookupItem[] | null = null;
let cachedFileStatuses: LookupItem[] | null = null;

export async function sourceCodeLoader({ request }: LoaderFunctionArgs): Promise<SourceCodeLoaderData> {
  const url = new URL(request.url);

  const searchParam = url.searchParams.get('search')?.trim() || undefined;
  const fileTypeIdParam = url.searchParams.get('fileTypeId');
  const subMajorIdParam = url.searchParams.get('subMajorId')?.trim() || undefined;
  const courseIdParam = url.searchParams.get('courseId')?.trim() || undefined;
  const statusIdParam = url.searchParams.get('statusId');
  const onlyGithub = url.searchParams.get('onlyGithub') === 'true';
  const pageParam = Number(url.searchParams.get('pageNumber'));
  const pageSizeParam = Number(url.searchParams.get('pageSize'));
  const viewModeParam = url.searchParams.get('viewMode');

  const pageNumber = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 12;
  const statusId = statusIdParam ? Number(statusIdParam) : undefined;
  const explicitFileTypeId = fileTypeIdParam ? Number(fileTypeIdParam) : undefined;
  const viewMode = viewModeParam === 'table' ? 'table' : 'grid';

  const [fileTypes, subMajors, courses, fileStatuses] = await Promise.all([
    cachedFileTypes
      ? Promise.resolve(cachedFileTypes)
      : resourceService
          .getFileTypes()
          .then((res) => {
            cachedFileTypes = res;
            return res;
          })
          .catch(() => [] as LookupItem[]),

    cachedSubMajors
      ? Promise.resolve(cachedSubMajors)
      : resourceService
          .getSubMajors()
          .then((res) => {
            cachedSubMajors = res;
            return res;
          })
          .catch(() => [] as LookupItem[]),

    subMajorIdParam
      ? resourceService.getCourses(subMajorIdParam).catch(() => [] as LookupItem[])
      : Promise.resolve([] as LookupItem[]),

    cachedFileStatuses
      ? Promise.resolve(cachedFileStatuses)
      : resourceService
          .getFileStatuses()
          .then((res) => {
            cachedFileStatuses = res;
            return res;
          })
          .catch(() => [] as LookupItem[]),
  ]);

  const matchedFileType = fileTypes.find((ft) => /mã nguồn|source\s*code|source|manguon/i.test(ft.name));
  const detectedSourceCodeFileTypeId = matchedFileType ? Number(matchedFileType.id) : null;

  const effectiveFileTypeId = explicitFileTypeId ?? detectedSourceCodeFileTypeId ?? undefined;

  let resourcesResult: SourceCodePaginatedResult;
  try {
    resourcesResult = await resourceService.searchResources({
      search: searchParam,
      fileTypeId: effectiveFileTypeId,
      subMajorId: subMajorIdParam,
      courseId: courseIdParam,
      statusId,
      pageNumber,
      pageSize,
    });
  } catch {
    // Graceful fallback khi lỗi mạng hoặc chưa có dữ liệu
    resourcesResult = {
      items: [],
      totalCount: 0,
      page: pageNumber,
      pageSize,
    };
  }

  // 4. Nếu người dùng chọn lọc "Chỉ hiện có GitHub", lọc danh sách
  if (onlyGithub && resourcesResult.items.length > 0) {
    const githubItems = resourcesResult.items.filter((item) => isValidGithubUrl(item.githubLink));
    resourcesResult = {
      ...resourcesResult,
      items: githubItems,
      totalCount: githubItems.length,
    };
  }

  return {
    resourcesResult,
    fileTypes,
    subMajors,
    courses,
    fileStatuses,
    sourceCodeFileTypeId: detectedSourceCodeFileTypeId,
    filters: {
      search: searchParam ?? '',
      subMajorId: subMajorIdParam ?? '',
      courseId: courseIdParam ?? '',
      onlyGithub,
      statusId: statusIdParam ?? '',
      pageNumber,
      pageSize,
      viewMode,
    },
  };
}

export default sourceCodeLoader;
