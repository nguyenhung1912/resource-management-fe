import axios from 'axios';
import axiosClient from './axiosClient';
import type {
  MessageResponse,
  PagedRatingResponse,
  RatingFilterQuery,
  RatingItemResponse,
  RatingMutationResponse,
  RatingSummaryResponse,
  UpsertRatingRequest,
} from '@/features/ratings/types/rating.types';
import { normalizePagedRating, normalizeRatingSummary } from '@/features/ratings/types/rating.types';

function buildRatingFilterParams(query?: RatingFilterQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (typeof query?.star === 'number' && query.star >= 1 && query.star <= 5) {
    params.Star = query.star;
    params.RatingScore = query.star;
  }
  if (typeof query?.pageIndex === 'number' && query.pageIndex > 0) {
    params.PageIndex = query.pageIndex;
  }
  if (typeof query?.pageSize === 'number' && query.pageSize > 0) {
    params.PageSize = query.pageSize;
  }

  return params;
}

export const ratingService = {
  // GET /api/Rating/file/{fileId}/summary
  async getRatingSummary(fileId: string): Promise<RatingSummaryResponse> {
    const response = await axiosClient.get<unknown>(`/api/Rating/file/${encodeURIComponent(fileId)}/summary`);
    return normalizeRatingSummary(response.data, fileId);
  },

  // GET /api/Rating/file/{fileId}/my-rating
  async getMyRating(fileId: string): Promise<RatingItemResponse | null> {
    try {
      const response = await axiosClient.get<RatingItemResponse>(
        `/api/Rating/file/${encodeURIComponent(fileId)}/my-rating`,
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 401)) {
        return null;
      }
      throw error;
    }
  },

  // POST /api/Rating
  async upsertRating(payload: UpsertRatingRequest): Promise<RatingMutationResponse> {
    const response = await axiosClient.post<RatingMutationResponse>('/api/Rating', {
      fileId: payload.fileId,
      ratingScore: payload.ratingScore,
      ...(payload.review ? { review: payload.review } : {}),
    });
    return response.data;
  },

  // DELETE /api/Rating/file/{fileId}
  async deleteRating(fileId: string): Promise<MessageResponse> {
    try {
      const response = await axiosClient.delete<MessageResponse>(`/api/Rating/file/${encodeURIComponent(fileId)}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback for Swagger contract path compatibility
        const fallbackResponse = await axiosClient.delete<MessageResponse>(
          `/api/Rating/file/${encodeURIComponent(fileId)}/my-rating`,
        );
        return fallbackResponse.data;
      }
      throw error;
    }
  },

  // GET /api/Rating/file/{fileId}/list
  async getRatingsList(fileId: string, query?: RatingFilterQuery): Promise<PagedRatingResponse> {
    const params = buildRatingFilterParams(query);
    const response = await axiosClient.get<unknown>(`/api/Rating/file/${encodeURIComponent(fileId)}/list`, {
      params,
    });
    return normalizePagedRating(response.data);
  },
};

export default ratingService;
