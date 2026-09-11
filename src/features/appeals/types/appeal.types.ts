export type AppealStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CreateAppealRequest {
  fileId: string;
  studentExplanation: string;
  attachmentUrl?: string | null;
}

export interface AppealItemResponse {
  appealId: string;
  fileId: string;
  fileName: string;
  fileUrl?: string;
  studentUid?: string;
  studentName?: string;
  studentEmail?: string;
  assignedLecturerUid?: string;
  assignedLecturerName?: string;
  appealAttempt: number;
  studentExplanation: string;
  attachmentUrl?: string | null;
  status: AppealStatus;
  lecturerResponse?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AppealDetailResponse extends AppealItemResponse {
  fileStatusId?: number;
  fileStatusName?: string;
  latestRejectionReason?: string;
  latestPlagiarismScore?: number;
  latestPlagiarismReportJson?: string | null;
}

export interface AppealEnvelopeResponse {
  message: string;
  data: AppealItemResponse;
}

export interface AppealDetailEnvelopeResponse {
  message: string;
  data: AppealDetailResponse;
}

export interface AppealsPaginatedData {
  items: AppealItemResponse[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AppealsPaginatedEnvelopeResponse {
  message: string;
  data: AppealsPaginatedData;
}

export interface GetMyAppealsParams {
  status?: AppealStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface RejectedResourceContext {
  fileId: string;
  fileName: string;
  rejectionReason?: string | null;
  fileTypeName?: string;
  fileStatusName?: string;
  createdAt?: string;
}
