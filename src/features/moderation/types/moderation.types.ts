import type {
  DepartmentResponse,
  FileTypeResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';

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

export type SimilarityRiskLevel = 'safe' | 'warning' | 'danger';

export interface PlagiarismMatchedChunk {
  chunkIndex?: number;
  snippet?: string;
  matchedWithFileId?: string | null;
  matchedWithFileName?: string | null;
  cosineSimilarity?: number;
  sourceChildId?: string | null;
  targetChildId?: string | null;
  sourceFileId?: string;
  sourceFileName?: string;
  similarity?: number;
  contentSnippet?: string;
}

export interface NormalizedMatchedChunk {
  chunkIndex: number;
  sourceFileId: string;
  sourceFileName: string;
  similarity: number;
  contentSnippet: string;
  riskLevel: SimilarityRiskLevel;
}

export interface PlagiarismCheckResponse {
  fileId: string;
  fileName?: string;
  similarityRate?: number;
  similarityScore?: number;
  isPlagiarism?: boolean;
  matchedChunksCount?: number;
  totalChunksCount?: number;
  processingTimeMs?: number;
  matchedChunks?: PlagiarismMatchedChunk[];
  checkedAt?: string;
  candidateDocuments?: Array<{ fileId: string; fileName: string; similarityRate?: number }>;
}

export interface PlagiarismCheckEnvelopeResponse {
  message: string;
  data: PlagiarismCheckResponse;
}

export interface ModerationUploaderInfo {
  uid?: string;
  userCode?: string;
  fullName?: string;
  email?: string;
  roleName?: string;
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
  fileBannerImage?: string;
  fileSize?: number;
  fileTypeId?: number;
  fileTypeName?: string;
  majorId?: string;
  majorName?: string;
  subMajorCode?: string;
  subMajorName?: string;
  courseCode?: string;
  courseName?: string;
  yearCompleted?: number;
  createdAt?: string;
  updatedAt?: string;
  uploader?: ModerationUploaderInfo;
  authors?: ModerationAuthorItem[];
  latestModeration?: {
    moderationId?: string;
    decision?: string;
    reviewNote?: string;
    plagiarismScore?: number | null;
    moderatorUid?: string;
    moderatorName?: string;
    createdAt?: string;
  };
  uploaderName?: string;
  uploaderEmail?: string;
  fileStatusId?: number;
  fileStatusName?: string;
  latestPlagiarismScore?: number | null;
}

/**
 * Lấy tên hiển thị của người tải tài liệu, ưu tiên theo thứ tự:
 * 1. uploader.fullName (từ backend ModerationUploaderDto)
 * 2. uploaderName (tương thích ngược)
 * 3. uploader.email
 * 4. uploaderEmail
 * 5. fallback mặc định ('Người dùng')
 */
export function getModerationUploaderName(
  item?: Pick<ModerationResourceItemResponse, 'uploader' | 'uploaderName' | 'uploaderEmail'> | null,
  fallback = 'Người dùng',
): string {
  if (!item) return fallback;
  return (
    item.uploader?.fullName?.trim() ||
    item.uploaderName?.trim() ||
    item.uploader?.email?.trim() ||
    item.uploaderEmail?.trim() ||
    fallback
  );
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
  departmentId?: string;
  majorId?: string;
  subMajorCode?: string;
  fileTypeId?: number;
  courseCode?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type ModerationAiRiskFilter = 'all' | 'uninspected' | 'safe' | 'warning' | 'danger';

export interface ModerationQueueFilterState {
  search?: string;
  departmentId?: string;
  subMajorCode?: string;
  fileTypeId?: number;
  aiRisk?: ModerationAiRiskFilter;
  page?: number;
  pageSize?: number;
}

export interface ModerationQueueOverviewStats {
  totalPending: number;
  highPlagiarismRisk: number;
  safePlagiarism: number;
  uninspectedCount: number;
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

export interface ModerationQueueLoaderData {
  queue: ModerationQueuePaginatedData;
  stats: ModerationQueueOverviewStats;
  departments: DepartmentResponse[];
  subMajors: SubMajorResponse[];
  fileTypes: FileTypeResponse[];
  currentFilters: ModerationQueueFilterState;
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
