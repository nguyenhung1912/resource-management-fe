import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { commentService } from '../commentService';
import type {
  CommentItemResponse,
  CommentMutationResponse,
  CreateCommentRequest,
  MessageResponse,
  PagedCommentResponse,
  UpdateCommentRequest,
} from '@/features/comments/types/comment.types';

vi.mock('../axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCommentItem: CommentItemResponse = {
    commentId: 'CMT_001',
    fileId: 'FIL_001',
    uid: 'USR_001',
    authorName: 'Lê Văn C',
    authorRole: 'Student',
    content: 'Tài liệu rất chi tiết và dễ hiểu!',
    parentCommentId: null,
    likeCount: 5,
    replyCount: 2,
    isLiked: false,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: null,
  };

  const mockPagedResponse: PagedCommentResponse = {
    items: [mockCommentItem],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  describe('getCommentsByFile', () => {
    it('gọi GET /api/Comment/file/{fileId} không kèm query params', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await commentService.getCommentsByFile('FIL_001');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Comment/file/FIL_001', {
        params: {},
      });
      expect(result).toEqual(mockPagedResponse);
    });

    it('gọi GET /api/Comment/file/{fileId} với đầy đủ query params và encode URI', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await commentService.getCommentsByFile('FIL/001 with special', {
        pageIndex: 2,
        pageSize: 15,
        parentId: 'PAR_001',
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Comment/file/FIL%2F001%20with%20special', {
        params: {
          PageIndex: 2,
          PageSize: 15,
          ParentId: 'PAR_001',
        },
      });
      expect(result).toEqual(mockPagedResponse);
    });
  });

  describe('getReplies', () => {
    it('gọi GET /api/Comment/{commentId}/replies với query params', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPagedResponse });

      const result = await commentService.getReplies('CMT_001', {
        pageIndex: 1,
        pageSize: 5,
      });

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Comment/CMT_001/replies', {
        params: {
          PageIndex: 1,
          PageSize: 5,
        },
      });
      expect(result).toEqual(mockPagedResponse);
    });
  });

  describe('getCommentById', () => {
    it('gọi GET /api/Comment/{commentId} và trả về chi tiết bình luận', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockCommentItem });

      const result = await commentService.getCommentById('CMT_001');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/Comment/CMT_001');
      expect(result).toEqual(mockCommentItem);
    });
  });

  describe('createComment', () => {
    it('gọi POST /api/Comment với bình luận gốc và trim nội dung', async () => {
      const payload: CreateCommentRequest = {
        fileId: 'FIL_001',
        content: '   Bình luận mới có khoảng trắng   ',
      };
      const mockResponse: CommentMutationResponse = {
        message: 'Tạo bình luận thành công.',
        data: mockCommentItem,
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.createComment(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Comment', {
        fileId: 'FIL_001',
        content: 'Bình luận mới có khoảng trắng',
        commentContent: 'Bình luận mới có khoảng trắng',
        CommentContent: 'Bình luận mới có khoảng trắng',
        parentCommentId: null,
      });
      expect(result).toEqual(mockResponse);
    });

    it('gọi POST /api/Comment với phản hồi con (parentCommentId)', async () => {
      const payload: CreateCommentRequest = {
        fileId: 'FIL_001',
        content: 'Câu trả lời con',
        parentCommentId: 'CMT_PARENT',
      };
      const mockResponse: CommentMutationResponse = {
        message: 'Tạo bình luận thành công.',
        data: { ...mockCommentItem, parentCommentId: 'CMT_PARENT' },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.createComment(payload);

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Comment', {
        fileId: 'FIL_001',
        content: 'Câu trả lời con',
        commentContent: 'Câu trả lời con',
        CommentContent: 'Câu trả lời con',
        parentCommentId: 'CMT_PARENT',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateComment', () => {
    it('gọi PUT /api/Comment/{commentId} với nội dung cập nhật', async () => {
      const payload: UpdateCommentRequest = {
        content: '  Nội dung đã sửa  ',
      };
      const mockResponse: CommentMutationResponse = {
        message: 'Cập nhật bình luận thành công.',
        data: { ...mockCommentItem, content: 'Nội dung đã sửa', updatedAt: '2026-09-24T11:00:00Z' },
      };

      vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.updateComment('CMT_001', payload);

      expect(axiosClient.put).toHaveBeenCalledWith('/api/Comment/CMT_001', {
        content: 'Nội dung đã sửa',
        commentContent: 'Nội dung đã sửa',
        CommentContent: 'Nội dung đã sửa',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteComment', () => {
    it('gọi DELETE /api/Comment/{commentId}', async () => {
      const mockResponse: MessageResponse = {
        message: 'Xóa bình luận thành công.',
      };

      vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.deleteComment('CMT_001');

      expect(axiosClient.delete).toHaveBeenCalledWith('/api/Comment/CMT_001');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('likeComment & unlikeComment', () => {
    it('gọi POST /api/Comment/{commentId}/like để thích bình luận', async () => {
      const mockResponse: CommentMutationResponse = {
        message: 'Đã thích bình luận.',
        data: { ...mockCommentItem, likeCount: 6, isLiked: true },
      };

      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.likeComment('CMT_001');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/Comment/CMT_001/like');
      expect(result).toEqual(mockResponse);
    });

    it('gọi DELETE /api/Comment/{commentId}/like để bỏ thích bình luận', async () => {
      const mockResponse: CommentMutationResponse = {
        message: 'Đã bỏ thích bình luận.',
        data: { ...mockCommentItem, likeCount: 5, isLiked: false },
      };

      vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: mockResponse });

      const result = await commentService.unlikeComment('CMT_001');

      expect(axiosClient.delete).toHaveBeenCalledWith('/api/Comment/CMT_001/like');
      expect(result).toEqual(mockResponse);
    });
  });
});
