import axiosClient from './axiosClient';
import type {
  GetReportsParams,
  PagedReportResponse,
  ReportDetailResponse,
  ReportMutationResponse,
  ReportTypeResponse,
  UpdateReportStatusRequest,
} from '@/features/reports/types/report.types';

export const reportService = {
  // GET /api/Report/types
  async getReportTypes(): Promise<ReportTypeResponse[]> {
    const response = await axiosClient.get<ReportTypeResponse[]>('/api/Report/types');
    return response.data;
  },

  // GET /api/Report
  async getAllReports(params?: GetReportsParams): Promise<PagedReportResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.status) {
      queryParams.Status = params.status;
    }
    if (typeof params?.pageNumber === 'number') {
      queryParams.PageNumber = params.pageNumber;
    }
    if (typeof params?.pageSize === 'number') {
      queryParams.PageSize = params.pageSize;
    }

    const response = await axiosClient.get<PagedReportResponse>('/api/Report', {
      params: queryParams,
    });
    const data = response.data;
    const totalCount = data.totalCount ?? data.totalItems ?? 0;
    const totalPages = data.totalPages ?? (data.pageSize > 0 ? Math.ceil(totalCount / data.pageSize) : 0);

    return {
      ...data,
      totalCount,
      totalPages,
      hasPreviousPage: data.hasPreviousPage ?? data.pageIndex > 1,
      hasNextPage: data.hasNextPage ?? data.pageIndex < totalPages,
    };
  },

  // GET /api/Report/me
  async getMyReports(params?: GetReportsParams): Promise<PagedReportResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.status) {
      queryParams.Status = params.status;
    }
    const page = params?.pageNumber ?? params?.pageIndex;
    if (typeof page === 'number') {
      queryParams.PageNumber = page;
      queryParams.PageIndex = page;
    }
    if (typeof params?.pageSize === 'number') {
      queryParams.PageSize = params.pageSize;
    }
    if (params?.reportTypeId !== undefined && params?.reportTypeId !== '') {
      queryParams.ReportTypeId = params.reportTypeId;
    }

    const response = await axiosClient.get<PagedReportResponse>('/api/Report/me', {
      params: queryParams,
    });
    const data = response.data;
    const totalCount = data.totalCount ?? data.totalItems ?? 0;
    const totalPages = data.totalPages ?? (data.pageSize > 0 ? Math.ceil(totalCount / data.pageSize) : 0);

    return {
      ...data,
      totalCount,
      totalPages,
      hasPreviousPage: data.hasPreviousPage ?? data.pageIndex > 1,
      hasNextPage: data.hasNextPage ?? data.pageIndex < totalPages,
    };
  },

  // GET /api/Report/{reportId}
  async getReportById(reportId: string): Promise<ReportDetailResponse> {
    const response = await axiosClient.get<ReportDetailResponse>(`/api/Report/${encodeURIComponent(reportId)}`);
    return response.data;
  },

  // PUT /api/Report/{reportId}/status
  async updateReportStatus(reportId: string, payload: UpdateReportStatusRequest): Promise<ReportMutationResponse> {
    const response = await axiosClient.put<ReportMutationResponse>(
      `/api/Report/${encodeURIComponent(reportId)}/status`,
      payload,
    );
    return response.data;
  },
};

export default reportService;
