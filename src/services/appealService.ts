import axiosClient from './axiosClient';
import type {
  AppealDetailEnvelopeResponse,
  AppealEnvelopeResponse,
  AppealsPaginatedEnvelopeResponse,
  CreateAppealRequest,
  GetAssignedAppealsParams,
  GetMyAppealsParams,
  ResolveAppealRequest,
} from '@/features/appeals/types/appeal.types';

export const appealService = {
  // POST /api/moderation/appeals
  async createAppeal(payload: CreateAppealRequest): Promise<AppealEnvelopeResponse> {
    const response = await axiosClient.post<AppealEnvelopeResponse>('/api/moderation/appeals', payload);
    return response.data;
  },

  // GET /api/moderation/appeals/me
  async getMyAppeals(params?: GetMyAppealsParams): Promise<AppealsPaginatedEnvelopeResponse> {
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

    const response = await axiosClient.get<AppealsPaginatedEnvelopeResponse>('/api/moderation/appeals/me', {
      params: queryParams,
    });
    return response.data;
  },

  // GET /api/moderation/appeals/assigned [Lecturer/Admin]
  async getAssignedAppeals(params?: GetAssignedAppealsParams): Promise<AppealsPaginatedEnvelopeResponse> {
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

    const response = await axiosClient.get<AppealsPaginatedEnvelopeResponse>('/api/moderation/appeals/assigned', {
      params: queryParams,
    });
    return response.data;
  },

  // GET /api/moderation/appeals/{appealId}
  async getAppealDetail(appealId: string): Promise<AppealDetailEnvelopeResponse> {
    const response = await axiosClient.get<AppealDetailEnvelopeResponse>(
      `/api/moderation/appeals/${encodeURIComponent(appealId)}`,
    );
    return response.data;
  },

  // PUT /api/moderation/appeals/{appealId}/resolve [Lecturer/Admin]
  async resolveAppeal(appealId: string, payload: ResolveAppealRequest): Promise<AppealEnvelopeResponse> {
    const response = await axiosClient.put<AppealEnvelopeResponse>(
      `/api/moderation/appeals/${encodeURIComponent(appealId)}/resolve`,
      payload,
    );
    return response.data;
  },
};

export default appealService;
