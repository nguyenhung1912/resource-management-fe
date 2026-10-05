import type { LoaderFunctionArgs } from 'react-router-dom';
import { searchResources } from '@/services/searchService';
import { resourceService } from '@/services/resourceService';
import type { SearchRequestParams } from '@/features/home/types/search.types';

export async function searchHubLoader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const sp = url.searchParams;
    const params: SearchRequestParams = {};

    const q = sp.get('q');
    if (q) params.search = q;

    const fileTypeId = sp.get('fileTypeId');
    if (fileTypeId) params.fileTypeId = fileTypeId;

    const subMajorCode = sp.get('subMajorCode');
    if (subMajorCode) params.subMajorId = subMajorCode;

    const courseCode = sp.get('courseCode');
    if (courseCode) params.courseCode = courseCode;

    const uploadUserId = sp.get('uploadUserId');
    if (uploadUserId) params.uploadUserId = uploadUserId;

    const yearCompleted = sp.get('yearCompleted');
    if (yearCompleted) {
      const n = Number(yearCompleted);
      if (!Number.isNaN(n)) params.yearCompleted = n;
    }

    const sortBy = sp.get('sortBy');
    if (sortBy) params.sortBy = sortBy;

    const sortDirection = sp.get('sortDirection');
    if (sortDirection === 'asc' || sortDirection === 'desc') params.sortDirection = sortDirection;

    params.page = Number(sp.get('page')) || 1;
    params.pageSize = Number(sp.get('pageSize')) || 10;

    const isSearching = !!(
      params.search ||
      params.fileTypeId ||
      params.subMajorId ||
      params.yearCompleted ||
      params.courseCode ||
      params.uploadUserId
    );

    const [apiData, submajors, fileTypes] = await Promise.all([
      isSearching
        ? searchResources(params)
        : Promise.resolve({ items: [], totalCount: 0, totalPages: 0, currentPage: 1 }),
      resourceService.getSubMajors().catch(() => []),
      resourceService.getFileTypes().catch(() => []),
    ]);

    return { apiData, submajors, fileTypes };
  } catch {
    return {
      apiData: { items: [], totalCount: 0, totalPages: 0, currentPage: 1 },
      submajors: [],
      fileTypes: [],
    };
  }
}

export default searchHubLoader;
