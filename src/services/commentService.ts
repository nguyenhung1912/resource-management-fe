import axiosClient from './axiosClient';
import type {
  CommentFilterQuery,
  CommentItemResponse,
  CommentMutationResponse,
  CreateCommentRequest,
  MessageResponse,
  PagedCommentResponse,
  UpdateCommentRequest,
} from '@/features/comments/types/comment.types';

function buildCommentFilterParams(query?: CommentFilterQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (typeof query?.pageIndex === 'number' && query.pageIndex > 0) {
    params.PageIndex = query.pageIndex;
  }
  if (typeof query?.pageSize === 'number' && query.pageSize > 0) {
    params.PageSize = query.pageSize;
  }
  if (query?.parentId?.trim()) {
    params.ParentId = query.parentId.trim();
  }

  return params;
}

export const commentService = {
  // GET /api/Comment/file/{fileId}
  async getCommentsByFile(fileId: string, query?: CommentFilterQuery): Promise<PagedCommentResponse> {
    const params = buildCommentFilterParams(query);
    const response = await axiosClient.get<PagedCommentResponse>(`/api/Comment/file/${encodeURIComponent(fileId)}`, {
      params,
    });
    return response.data;
  },

  // GET /api/Comment/{commentId}/replies
  async getReplies(commentId: string, query?: CommentFilterQuery): Promise<PagedCommentResponse> {
    const params = buildCommentFilterParams(query);
    const response = await axiosClient.get<PagedCommentResponse>(
      `/api/Comment/${encodeURIComponent(commentId)}/replies`,
      { params },
    );
    return response.data;
  },

  // GET /api/Comment/{commentId}
  async getCommentById(commentId: string): Promise<CommentItemResponse> {
    const response = await axiosClient.get<CommentItemResponse>(`/api/Comment/${encodeURIComponent(commentId)}`);
    return response.data;
  },

  // POST /api/Comment
  async createComment(payload: CreateCommentRequest): Promise<CommentMutationResponse> {
    const response = await axiosClient.post<CommentMutationResponse>('/api/Comment', {
      fileId: payload.fileId,
      content: payload.content.trim(),
      parentCommentId: payload.parentCommentId?.trim() || null,
    });
    return response.data;
  },

  // PUT /api/Comment/{commentId}
  async updateComment(commentId: string, payload: UpdateCommentRequest): Promise<CommentMutationResponse> {
    const response = await axiosClient.put<CommentMutationResponse>(`/api/Comment/${encodeURIComponent(commentId)}`, {
      content: payload.content.trim(),
    });
    return response.data;
  },

  // DELETE /api/Comment/{commentId}
  async deleteComment(commentId: string): Promise<MessageResponse> {
    const response = await axiosClient.delete<MessageResponse>(`/api/Comment/${encodeURIComponent(commentId)}`);
    return response.data;
  },

  // POST /api/Comment/{commentId}/like
  async likeComment(commentId: string): Promise<CommentMutationResponse> {
    const response = await axiosClient.post<CommentMutationResponse>(
      `/api/Comment/${encodeURIComponent(commentId)}/like`,
    );
    return response.data;
  },

  // DELETE /api/Comment/{commentId}/like
  async unlikeComment(commentId: string): Promise<CommentMutationResponse> {
    const response = await axiosClient.delete<CommentMutationResponse>(
      `/api/Comment/${encodeURIComponent(commentId)}/like`,
    );
    return response.data;
  },
};

export default commentService;
