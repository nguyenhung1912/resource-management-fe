export interface SelectOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

export interface UploadResourceFormValues {
  file: File;
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  keywords: string[];
  sourceCodeUrl: string | null;
  bannerImage: File | null;
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

export interface ResourceAuthorResponse {
  id: string;
  fullName: string;
}

export interface ResourceResponse {
  id: string;
  fileName: string;
  fileTypeName: string;
  fileSizeBytes: number | null;
  uploadedAt: string;
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
