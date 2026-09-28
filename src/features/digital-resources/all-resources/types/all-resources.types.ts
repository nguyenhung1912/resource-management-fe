import type { LookupItem } from '@/features/digital-resources/source-code/types/source-code.types';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';

export type { LookupItem, ResourceDetailResponse };

export type LibraryViewMode = 'grid' | 'table';

export interface LibraryResourceItem {
  fileId: string;
  fileName: string;
  fileDescription: string | null;
  fileUrl: string;
  fileTypeId: number;
  fileTypeName: string | null;
  subMajorCode: string | null;
  courseCode: string | null;
  yearCompleted: number | null;
  githubLink: string | null;
  bannerImage?: string | null;
  bannerUrl?: string | null;
  fileSize?: number | null;
  fileStatusId?: number;
  fileStatusName?: string | null;
  statusName?: string | null;
  uploadUserId?: string | null;
  uploadBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RecommendedResourceItem {
  fileId: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl?: string;
  fileTypeName?: string | null;
  subMajorCode?: string | null;
  courseName?: string | null;
  bannerUrl?: string | null;
  bannerImage?: string | null;
  averageScore?: number | null;
  totalReviews?: number | null;
  createdAt: string;
}

export interface LibraryResourcePaginatedResult {
  items: LibraryResourceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LibraryFilterValues {
  search: string;
  fileTypeId?: number;
  subMajorId?: string;
  courseId?: string;
  pageNumber: number;
  pageSize: number;
  viewMode: LibraryViewMode;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface LibraryResourceQuery {
  search?: string;
  fileTypeId?: number;
  subMajorId?: string;
  courseId?: string;
  statusId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface LibraryStats {
  totalCount: number;
  totalFiltered: number;
  activeCategoryName?: string;
}

export interface LibraryLoaderData {
  resourcesResult: LibraryResourcePaginatedResult;
  fileTypes: LookupItem[];
  subMajors: LookupItem[];
  courses: LookupItem[];
  fileStatuses: LookupItem[];
  recommendedResources: RecommendedResourceItem[];
  filters: LibraryFilterValues;
}
