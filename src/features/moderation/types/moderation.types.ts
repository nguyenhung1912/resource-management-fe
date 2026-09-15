export interface ApproveModerationRequest {
  notes?: string;
}

export interface RejectModerationRequest {
  reason: string;
  notes?: string;
  plagiarismScore?: number;
}

export interface ModerationDecisionResponse {
  fileId: string;
  fileStatusId: number;
  fileStatusName: string;
  moderatorUid: string;
  decisionAt: string;
  notes?: string;
}

export interface ModerationDecisionEnvelopeResponse {
  message: string;
  data: ModerationDecisionResponse;
}

export interface PlagiarismMatchedChunk {
  chunkIndex?: number;
  sourceFileId?: string;
  sourceFileName?: string;
  similarity?: number;
  contentSnippet?: string;
}

export interface PlagiarismCheckResponse {
  fileId: string;
  similarityScore?: number;
  matchedChunks?: PlagiarismMatchedChunk[];
  checkedAt?: string;
}

export interface PlagiarismCheckEnvelopeResponse {
  message: string;
  data: PlagiarismCheckResponse;
}

export interface ModerationUploaderInfo {
  uid?: string;
  fullName?: string;
  email?: string;
}

export interface ModerationAuthorItem {
  authorId?: string;
  authorName?: string;
  fullName?: string;
  email?: string;
  affiliation?: string;
}

export interface ModerationResourceItemResponse {
  fileId: string;
  fileName: string;
  fileDescription?: string;
  fileUrl?: string;
  fileTypeId?: number;
  fileTypeName?: string;
  subMajorCode?: string;
  subMajorName?: string;
  uploaderName?: string;
  uploaderEmail?: string;
  fileStatusId?: number;
  fileStatusName?: string;
  createdAt?: string;
  latestPlagiarismScore?: number | null;
}

export interface ModerationResourceDetailResponse {
  fileId: string;
  fileName: string;
  fileDescription?: string;
  fileUrl?: string;
  fileTypeId?: number;
  fileTypeName?: string;
  subMajorCode?: string;
  subMajorName?: string;
  departmentName?: string;
  uploader?: ModerationUploaderInfo;
  authors?: ModerationAuthorItem[];
  createdAt?: string;
  latestPlagiarismCheck?: PlagiarismCheckResponse | null;
}

export interface ModerationDetailEnvelopeResponse {
  message: string;
  data: ModerationResourceDetailResponse;
}

export interface ModerationQueueParams {
  search?: string;
  subMajorCode?: string;
  fileTypeId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface ModerationQueuePaginatedData {
  items: ModerationResourceItemResponse[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ModerationQueuePaginatedResponse {
  message: string;
  data: ModerationQueuePaginatedData;
}

export interface ModerationTargetDocument {
  fileId: string;
  fileName: string;
  fileTypeName?: string;
  subMajorName?: string;
  departmentName?: string;
  uploaderName?: string;
  uploaderEmail?: string;
  createdAt?: string;
  fileUrl?: string;
  latestPlagiarismScore?: number | null;
}

export interface ModerationHistorySummaryDto {
  historyId: string;
  action: string;
  moderatorName?: string;
  reason?: string;
  notes?: string;
  plagiarismScore?: number;
  createdAt: string;
}

export interface ModerationHistoryEnvelopeResponse {
  message: string;
  data: ModerationHistorySummaryDto[];
}

export interface ModerationDetailLoaderData {
  detail: ModerationResourceDetailResponse;
  history: ModerationHistorySummaryDto[];
}
