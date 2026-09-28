export interface AuthorResponse {
  id: string;
  fullName: string;
}

export interface KeywordResponse {
  id: number | string;
  keyword: string;
}

export interface RatingSummaryResponse {
  averageRating: number;
  totalRatings: number;
}

export interface SourceCodeItem {
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
  bannerUrl: string | null;
  fileStatusId: number;
  fileStatusName: string | null;
  uploadUserId: string | null;
  createdAt: string;
}

export interface SourceCodeDetail {
  fileId: string;
  fileName: string;
  fileDescription: string | null;
  fileUrl: string;
  fileTypeId: number;
  fileTypeName: string | null;
  subMajorCode: string | null;
  subMajorName: string | null;
  majorName: string | null;
  departmentName: string | null;
  courseCode: string | null;
  courseName: string | null;
  yearCompleted: number | null;
  githubLink: string | null;
  bannerUrl: string | null;
  fileStatusId: number;
  fileStatusName: string | null;
  uploadUserId: string | null;
  uploadUserName: string | null;
  uploadUserEmail: string | null;
  createdAt: string;
  updatedAt: string | null;
  authors: AuthorResponse[];
  keywords: KeywordResponse[];
  ratingSummary?: RatingSummaryResponse | null;
}

export interface SourceCodeQuery {
  search?: string;
  fileTypeId?: number;
  subMajorId?: string;
  courseId?: string;
  statusId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface SourceCodePaginatedResult {
  items: SourceCodeItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LookupItem {
  id: string;
  name: string;
}

export interface SourceCodeStats {
  totalCount: number;
  withGithubCount: number;
  subMajorsCount: number;
  approvedCount: number;
}

export type SourceCodeViewMode = 'grid' | 'table';

export interface SourceCodeFilterValues {
  search: string;
  subMajorId: string;
  courseId: string;
  onlyGithub: boolean;
  statusId: string;
  pageNumber: number;
  pageSize: number;
  viewMode: SourceCodeViewMode;
}

export interface UploadSourceCodeFormValues {
  file: File;
  fileName: string;
  fileDescription?: string;
  fileTypeId: number;
  subMajorCode: string;
  courseCode?: string;
  yearCompleted?: number;
  authorNames?: string[];
  authorIds: string[];
  githubLink?: string;
  bannerImage?: File | null;
}

export interface UploadResourceSuccessResponse {
  message: string;
  data?: {
    id: string;
    fileName: string;
    fileTypeName: string;
    fileSizeBytes: number | null;
    uploadedAt: string;
  };
}
