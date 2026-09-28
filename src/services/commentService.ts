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

function normalizeCommentItem(item: unknown): CommentItemResponse {
  if (!item || typeof item !== 'object') {
    return item as CommentItemResponse;
  }
  const raw = item as Record<string, unknown>;
  const content =
    (typeof raw.content === 'string' && raw.content.length > 0 ? raw.content : '') ||
    (typeof raw.commentContent === 'string' && raw.commentContent.length > 0 ? raw.commentContent : '') ||
    (typeof raw.CommentContent === 'string' && raw.CommentContent.length > 0 ? raw.CommentContent : '');

  return {
    ...(raw as unknown as CommentItemResponse),
    content,
  };
}

export const commentService = {
  // GET /api/Comment/file/{fileId}
  async getCommentsByFile(fileId: string, query?: CommentFilterQuery): Promise<PagedCommentResponse> {
    const params = buildCommentFilterParams(query);
    const response = await axiosClient.get<PagedCommentResponse>(`/api/Comment/file/${encodeURIComponent(fileId)}`, {
      params,
    });
    const data = response.data;
    if (data && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(normalizeCommentItem),
      };
    }
    return data;
  },

  // GET /api/Comment/{commentId}/replies
  async getReplies(commentId: string, query?: CommentFilterQuery): Promise<PagedCommentResponse> {
    const params = buildCommentFilterParams(query);
    const response = await axiosClient.get<PagedCommentResponse>(
      `/api/Comment/${encodeURIComponent(commentId)}/replies`,
      { params },
    );
    const data = response.data;
    if (data && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(normalizeCommentItem),
      };
    }
    return data;
  },

  // GET /api/Comment/{commentId}
  async getCommentById(commentId: string): Promise<CommentItemResponse> {
    const response = await axiosClient.get<CommentItemResponse>(`/api/Comment/${encodeURIComponent(commentId)}`);
    return normalizeCommentItem(response.data);
  },

  // POST /api/Comment
  async createComment(payload: CreateCommentRequest): Promise<CommentMutationResponse> {
    const content = payload.content.trim();
    const response = await axiosClient.post<CommentMutationResponse>('/api/Comment', {
      fileId: payload.fileId,
      content,
      commentContent: content,
      CommentContent: content,
      parentCommentId: payload.parentCommentId?.trim() || null,
    });
    return {
      ...response.data,
      data: normalizeCommentItem(response.data?.data),
    };
  },

  // PUT /api/Comment/{commentId}
  async updateComment(commentId: string, payload: UpdateCommentRequest): Promise<CommentMutationResponse> {
    const content = payload.content.trim();
    const response = await axiosClient.put<CommentMutationResponse>(`/api/Comment/${encodeURIComponent(commentId)}`, {
      content,
      commentContent: content,
      CommentContent: content,
    });
    return {
      ...response.data,
      data: normalizeCommentItem(response.data?.data),
    };
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
