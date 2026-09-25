import type { LoaderFunctionArgs } from 'react-router-dom';
import { searchResources } from '@/services/searchService';
import type { SearchRequestParams } from '@/features/resources/types/search.types';

export async function searchLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const params: SearchRequestParams = {};

  const q = sp.get('q');
  if (q) params.q = q;

  const fileTypeId = sp.get('fileTypeId');
  if (fileTypeId) params.fileTypeId = fileTypeId;

  const subMajorCode = sp.get('subMajorCode');
  if (subMajorCode) params.subMajorCode = subMajorCode;

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

  const page = sp.get('page');
  params.page = page ? Number(page) || 1 : 1;

  const pageSize = sp.get('pageSize');
  params.pageSize = pageSize ? Number(pageSize) || 10 : 10;

  const result = await searchResources(params);

  return result;
}

export default searchLoader;
