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
