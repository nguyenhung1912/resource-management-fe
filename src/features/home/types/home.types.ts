import type { LookupItem } from '@/features/digital-resources/source-code/types/source-code.types';

export interface GlobalSearchQuery {
  q?: string;
  fileTypeId?: number;
  subMajorCode?: string;
  courseCode?: string;
  yearCompleted?: number;
  sortBy?: 'date' | 'name' | 'year';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchResultItem {
  fileId: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl?: string | null;
  fileTypeName?: string | null;
  subMajorCode?: string | null;
  yearCompleted?: number | null;
  uploadBy?: string | null;
  createdAt?: string | null;
  keywords?: string[] | null;
}

export interface SearchPaginatedResult {
  items: SearchResultItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface HomeLoaderData {
  fileTypes: LookupItem[];
  featuredResources: SearchResultItem[];
  totalResources: number;
}
