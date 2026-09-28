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
