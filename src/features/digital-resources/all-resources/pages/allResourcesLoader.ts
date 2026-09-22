import type { LoaderFunctionArgs } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import type {
  LibraryLoaderData,
  LibraryResourcePaginatedResult,
  LibraryViewMode,
  LookupItem,
  RecommendedResourceItem,
} from '../types/all-resources.types';

// Module-level cache for static lookup data to minimize network requests
let cachedFileTypes: LookupItem[] | null = null;
let cachedSubMajors: LookupItem[] | null = null;
let cachedFileStatuses: LookupItem[] | null = null;

export function resetLibraryLookupCache(): void {
  cachedFileTypes = null;
  cachedSubMajors = null;
  cachedFileStatuses = null;
}

export async function allResourcesLoader({ request }: LoaderFunctionArgs): Promise<LibraryLoaderData> {
  const url = new URL(request.url);

  const searchParam = url.searchParams.get('search')?.trim() || undefined;
  const fileTypeIdParam = url.searchParams.get('fileTypeId');
  const subMajorIdParam = url.searchParams.get('subMajorId')?.trim() || undefined;
  const courseIdParam = url.searchParams.get('courseId')?.trim() || undefined;
  const statusIdParam = url.searchParams.get('statusId');
  const pageParam = Number(url.searchParams.get('pageNumber'));
  const pageSizeParam = Number(url.searchParams.get('pageSize'));
  const viewModeParam = url.searchParams.get('viewMode');
  const sortByParam = url.searchParams.get('sortBy')?.trim() || undefined;
  const sortDirectionParam = url.searchParams.get('sortDirection');

  const pageNumber = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 12;
  const fileTypeId = fileTypeIdParam ? Number(fileTypeIdParam) : undefined;
  const statusId = statusIdParam ? Number(statusIdParam) : undefined;
  const viewMode: LibraryViewMode = viewModeParam === 'table' ? 'table' : 'grid';
  const sortDirection = sortDirectionParam === 'asc' || sortDirectionParam === 'desc' ? sortDirectionParam : undefined;

  const [fileTypes, subMajors, courses, fileStatuses, recommendedResources] = await Promise.all([
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

    resourceService.getRecommendations(10).catch(() => [] as RecommendedResourceItem[]),
  ]);

  let resourcesResult: LibraryResourcePaginatedResult;
  try {
    resourcesResult = await resourceService.searchResources<LibraryResourcePaginatedResult>({
      search: searchParam,
      fileTypeId,
      subMajorId: subMajorIdParam,
      courseId: courseIdParam,
      statusId,
      pageNumber,
      pageSize,
    });
  } catch {
    // Graceful fallback on network error
    resourcesResult = {
      items: [],
      totalCount: 0,
      page: pageNumber,
      pageSize,
    };
  }

  return {
    resourcesResult,
    fileTypes,
    subMajors,
    courses,
    fileStatuses,
    recommendedResources,
    filters: {
      search: searchParam || '',
      fileTypeId,
      subMajorId: subMajorIdParam,
      courseId: courseIdParam,
      pageNumber,
      pageSize,
      viewMode,
      sortBy: sortByParam,
      sortDirection,
    },
  };
}
