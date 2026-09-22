export type ReportTargetType = 'File' | 'Comment' | 'User';

export type ReportStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Rejected';

export interface ReportItemResponse {
  reportId: string;
  reporterUid: string;
  reporterName: string;
  targetType: ReportTargetType | string;
  targetId: string;
  reportTypeId: number;
  reportTypeName: string;
  reason: string;
  status: ReportStatus | string;
  handlingNotes?: string | null;
  createdAt: string;
}

export interface ReportDetailResponse extends ReportItemResponse {
  targetTitle?: string | null;
  handledByUid?: string | null;
  handledByName?: string | null;
  resolvedAt?: string | null;
}

export interface PagedReportResponse {
  items: ReportItemResponse[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalItems?: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus | string;
  handlingNotes?: string;
}

export interface ReportTypeResponse {
  reportTypeId: number;
  reportTypeName: string;
  description: string;
}

export interface ReportMutationResponse {
  message: string;
  data?: ReportItemResponse;
}

export interface GetReportsParams {
  status?: ReportStatus | string;
  pageNumber?: number;
  pageIndex?: number;
  pageSize?: number;
  reportTypeId?: number | string;
}

export interface ReportOverviewStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface ReportsLoaderResult {
  reports: PagedReportResponse;
  stats: ReportOverviewStats;
  reportTypes: ReportTypeResponse[];
  currentStatus?: ReportStatus;
  currentTargetType?: ReportTargetType;
  currentReportTypeId?: number;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
}

export interface MyReportsLoaderResult {
  reports: PagedReportResponse;
  stats: ReportOverviewStats;
  reportTypes: ReportTypeResponse[];
  currentStatus?: ReportStatus;
  currentTargetType?: ReportTargetType;
  currentReportTypeId?: number;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
}
