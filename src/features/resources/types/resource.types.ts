export interface SelectOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

export interface UploadResourceRequest {
  file: File;
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  githubLink: string | null;
  bannerImage: File | null;
}

export interface UploadResourceFormValues extends Omit<UploadResourceRequest, 'githubLink'> {
  sourceCodeUrl: string | null;
}

export interface ModifyResourceInitialValues {
  id: string;
  documentFileName: string;
  documentFileTypeName: string;
  documentFileSizeBytes: number | null;
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  keywords: string[];
}

export interface ModifyResourceFormValues {
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  keywords: string[];
  bannerImage: File | null;
}

export interface MyUploadFilterRequest {
  search?: string;
  fileStatusId?: number;
  fileTypeId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ResourceAuthorResponse {
  id?: string;
  fullName?: string;
  authorName?: string;
}

export interface ResourceResponse {
  id?: string;
  fileId?: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl?: string | null;
  fileTypeId?: number;
  fileTypeName: string;
  subMajorCode?: string | null;
  courseCode?: string | null;
  yearCompleted?: number | null;
  authorNames?: string[];
  githubLink?: string | null;
  bannerImage?: string | null;
  fileSize?: number | null;
  fileSizeBytes?: number | null;
  createdAt?: string;
  uploadedAt?: string;
  updatedAt?: string;
  uploadBy?: string | null;
  statusName?: string | null;
}

export interface MyUploadItemResponse extends ResourceResponse {
  fileStatusId: number;
  fileStatusName: string | null;
  majorId: string;
  majorName: string | null;
  subMajorName: string | null;
  courseName: string | null;
  keywords: string[];
  authors: ResourceAuthorResponse[];
}

export interface ResourceDetail {
  fileId: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl: string;
  fileTypeName?: string | null;
  uploadUserName?: string | null;
  githubLink?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  keywords: string[];
}

export interface RecommendedResource {
  fileId: string;
  fileName: string;
  uploadUserName?: string | null;
  fileUrl?: string | null;
  averageRating?: number;
  totalRatings?: number;
}

export interface ResourceDetailLoaderData {
  detail: ResourceDetail;
  recommendations: RecommendedResource[];
}
export interface UpdateResourceRequest {
  fileName?: string | null;
  fileDescription?: string | null;
  fileTypeId?: number | null;
  majorID?: string | null;
  subMajorCode?: string | null;
  courseCode?: string | null;
  yearCompleted?: number | null;
  gitHubLink?: string | null;
  fileBannerImage?: string | null;
}

export interface UpdateAuthorsRequest {
  authorNames: string[];
}

export interface AddKeywordsRequest {
  keywords: string[];
}

export interface ResourceKeywordItem {
  fileKeywordId: string;
  keyword: string;
}

export interface ResourceDetailResponse {
  fileId: string;
  fileName: string;
  fileDescription?: string | null;
  fileUrl?: string | null;
  fileTypeId: number;
  fileTypeName?: string | null;
  fileStatusId: number;
  fileStatusName?: string | null;
  majorId?: string | null;
  majorName?: string | null;
  subMajorCode?: string | null;
  subMajorName?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  yearCompleted?: number | null;
  uploadUserId?: string | null;
  uploadUserName?: string | null;
  githubLink?: string | null;
  bannerImage?: string | null;
  fileSize: number;
  createdAt: string;
  updatedAt?: string | null;
  keywords: string[];
  authorNames: string[];
  authors: ResourceAuthorResponse[];
}
