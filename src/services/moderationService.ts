import axiosClient from './axiosClient';
import type {
  ApproveModerationRequest,
  ModerationDecisionEnvelopeResponse,
  ModerationDetailEnvelopeResponse,
  ModerationHistoryEnvelopeResponse,
  ModerationQueuePaginatedResponse,
  ModerationQueueParams,
  PlagiarismCheckEnvelopeResponse,
  RejectModerationRequest,
} from '@/features/moderation/types/moderation.types';

export const moderationService = {
  // POST /api/Moderation/{fileId}/approve
  async approveDocument(
    fileId: string,
    payload: ApproveModerationRequest = {},
  ): Promise<ModerationDecisionEnvelopeResponse> {
    const response = await axiosClient.post<ModerationDecisionEnvelopeResponse>(
      `/api/Moderation/${encodeURIComponent(fileId)}/approve`,
      payload,
    );
    return response.data;
  },

  // POST /api/Moderation/{fileId}/reject
  async rejectDocument(fileId: string, payload: RejectModerationRequest): Promise<ModerationDecisionEnvelopeResponse> {
    const response = await axiosClient.post<ModerationDecisionEnvelopeResponse>(
      `/api/Moderation/${encodeURIComponent(fileId)}/reject`,
      payload,
    );
    return response.data;
  },

  // GET /api/Moderation/{fileId}/details
  async getModerationDetails(fileId: string): Promise<ModerationDetailEnvelopeResponse> {
    const response = await axiosClient.get<ModerationDetailEnvelopeResponse>(
      `/api/Moderation/${encodeURIComponent(fileId)}/details`,
    );
    return response.data;
  },

  // GET /api/Moderation/queue
  async getModerationQueue(params?: ModerationQueueParams): Promise<ModerationQueuePaginatedResponse> {
    const queryParams: Record<string, string | number> = {};

    if (params?.search?.trim()) {
      queryParams.Search = params.search.trim();
    }
    if (params?.subMajorCode?.trim()) {
      queryParams.SubMajorCode = params.subMajorCode.trim();
    }
    if (typeof params?.fileTypeId === 'number') {
      queryParams.FileTypeId = params.fileTypeId;
    }
    if (typeof params?.pageNumber === 'number') {
      queryParams.PageNumber = params.pageNumber;
    }
    if (typeof params?.pageSize === 'number') {
      queryParams.PageSize = params.pageSize;
    }

    const response = await axiosClient.get<ModerationQueuePaginatedResponse>('/api/Moderation/queue', {
      params: queryParams,
    });
    return response.data;
  },

  // POST /api/Moderation/{fileId}/check-plagiarism
  async checkPlagiarism(fileId: string): Promise<PlagiarismCheckEnvelopeResponse> {
    const response = await axiosClient.post<PlagiarismCheckEnvelopeResponse>(
      `/api/Moderation/${encodeURIComponent(fileId)}/check-plagiarism`,
    );
    return response.data;
  },

  // GET /api/Moderation/{fileId}/history
  async getModerationHistory(fileId: string): Promise<ModerationHistoryEnvelopeResponse> {
    const response = await axiosClient.get<ModerationHistoryEnvelopeResponse>(
      `/api/Moderation/${encodeURIComponent(fileId)}/history`,
    );
    return response.data;
  },
};

export default moderationService;
