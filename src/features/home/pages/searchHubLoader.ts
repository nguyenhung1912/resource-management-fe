import type { LoaderFunctionArgs } from 'react-router-dom';
import type {
  LibraryResourceItem,
  LibraryResourcePaginatedResult,
} from '@/features/digital-resources/all-resources/types/all-resources.types';
import { resourceService } from '@/services/resourceService';
import type { AuthorItem, SearchResultItem } from '../types/search.types';

export interface SearchHubLoaderData {
  resources: SearchResultItem[];
  authors: AuthorItem[];
  searchParam?: string;
}

function mapLibraryResourceToSearchResult(item: LibraryResourceItem): SearchResultItem {
  const extMatch = item.fileName.match(/\.([a-zA-Z0-9]+)$/);
  const format = extMatch ? extMatch[1].toUpperCase() : (item.fileTypeName ?? 'DOC');

  const year = item.yearCompleted
    ? String(item.yearCompleted)
    : item.createdAt
      ? new Date(item.createdAt).getFullYear().toString()
      : '2026';

  return {
    id: item.fileId,
    title: item.fileName,
    category: item.fileTypeName || 'Tài liệu khác',
    author: item.uploadBy || 'Giảng viên / Sinh viên',
    faculty: item.subMajorCode || 'Khoa CNTT',
    year,
    format,
    downloads: 0,
  };
}

function extractAuthorsFromResources(items: LibraryResourceItem[]): AuthorItem[] {
  const authorMap = new Map<string, { count: number; dept: string }>();

  items.forEach((item) => {
    const authorName = item.uploadBy?.trim();
    if (authorName) {
      const existing = authorMap.get(authorName);
      if (existing) {
        existing.count += 1;
      } else {
        authorMap.set(authorName, {
          count: 1,
          dept: item.subMajorCode || 'Khoa CNTT',
        });
      }
    }
  });

  return Array.from(authorMap.entries()).map(([name, data]) => ({
    name,
    role: 'Tác giả',
    dept: data.dept,
    count: data.count,
  }));
}

export async function searchHubLoader({ request }: LoaderFunctionArgs): Promise<SearchHubLoaderData> {
  const url = new URL(request.url);
  const searchParam = url.searchParams.get('search')?.trim() || url.searchParams.get('q')?.trim() || undefined;

  try {
    const result = await resourceService.searchResources<LibraryResourcePaginatedResult>({
      search: searchParam,
      pageNumber: 1,
      pageSize: 50,
    });

    const items = result?.items ?? [];
    return {
      resources: items.map(mapLibraryResourceToSearchResult),
      authors: extractAuthorsFromResources(items),
      searchParam,
    };
  } catch {
    return {
      resources: [],
      authors: [],
      searchParam,
    };
  }
}
