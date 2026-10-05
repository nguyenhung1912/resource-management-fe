import type { LucideIcon } from 'lucide-react';

export type SearchTab = 'all' | 'ai' | 'advanced' | 'authors';

export interface SearchTabConfig {
  id: SearchTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
  showCount?: boolean;
}

export interface SearchResourceItem {
  id: string;
  title: string;
  category: string;
  author: string;
  faculty: string;
  year: string;
  format: string;
  downloads: number;
}

export interface AuthorItem {
  name: string;
  role: string;
  dept: string;
  count: number;
}

export interface AdvancedSearchFilters {
  faculty: string;
  year: string;
  format: string;
  plagiarismRate: string;
}

export interface LookupItem {
  id: number | string;
  name: string;
}

export interface SearchHubLoaderData {
  apiData: SearchResponse;
  submajors: LookupItem[];
  fileTypes: LookupItem[];
}
export interface SearchRequestParams {
  search?: string;
  fileTypeId?: string;
  subMajorId?: string;
  courseCode?: string;
  uploadUserId?: string;
  yearCompleted?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number; // default: 1
  pageSize?: number; // default: 10
}

export interface SearchResultItem {
  fileId: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl: string;
  fileTypeName?: string | null;
  subMajorCode?: string | null;
  yearCompleted?: number | null;
  uploadBy?: string | null;
  createdAt: string; // ISO date string
  keywords: string[];
}

export interface SearchResponse {
  items: SearchResultItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
