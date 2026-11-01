import { useMemo } from 'react';
import type { SearchHubLoaderData, SearchResourceItem } from '../types/search.types';
import type { SearchResultItem } from '@/features/home/types/search.types';

export function useSearchData(apiData: SearchHubLoaderData['apiData']) {
  const mappedResources: SearchResourceItem[] = useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item: SearchResultItem) => ({
      id: item.fileId,
      title: item.fileName || 'Chưa cập nhật',
      category: item.fileTypeName || 'Khác',
      author: item.uploadBy || 'Ẩn danh',
      faculty: item.subMajorCode || 'Chưa phân khoa',
      year: item.yearCompleted ? item.yearCompleted.toString() : new Date(item.createdAt).getFullYear().toString(),
      format: 'PDF',
      downloads: 0,
    }));
  }, [apiData]);

  const extractedAuthors = useMemo(() => {
    const authorMap = new Map<string, number>();

    mappedResources.forEach((res) => {
      if (res.author && res.author !== 'Ẩn danh') {
        authorMap.set(res.author, (authorMap.get(res.author) || 0) + 1);
      }
    });

    return Array.from(authorMap.entries()).map(([name, count]) => ({
      name,
      role: 'Giảng viên',
      dept: 'Chưa cập nhật',
      count,
    }));
  }, [mappedResources]);

  return { mappedResources, extractedAuthors };
}
