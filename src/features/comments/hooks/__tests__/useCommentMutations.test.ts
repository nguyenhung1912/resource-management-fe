import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CommentItemResponse,
  CommentMutationResponse,
  CreateCommentRequest,
  MessageResponse,
} from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { useCommentMutations } from '../useCommentMutations';

vi.mock('@/services/commentService', () => ({
  commentService: {
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
  },
}));

describe('useCommentMutations hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComment: CommentItemResponse = {
    commentId: 'CMT_001',
    fileId: 'FIL_001',
    uid: 'USR_001',
    authorName: 'Lê Văn C',
    authorRole: 'Student',
    content: 'Tài liệu tốt',
    parentCommentId: null,
    likeCount: 0,
    replyCount: 0,
    isLiked: false,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: null,
  };

  it('khởi tạo với state mặc định', () => {
    const { result } = renderHook(() => useCommentMutations());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.mutationError).toBeNull();
  });

  it('createComment thành công trả về CommentItemResponse', async () => {
    const payload: CreateCommentRequest = {
      fileId: 'FIL_001',
      content: 'Tài liệu tốt',
    };
    const response: CommentMutationResponse = {
      message: 'Tạo bình luận thành công.',
      data: mockComment,
    };

    vi.mocked(commentService.createComment).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCommentMutations());

    let created: CommentItemResponse | null = null;
    await act(async () => {
      created = await result.current.createComment(payload);
    });

    expect(commentService.createComment).toHaveBeenCalledWith(payload);
    expect(created).toEqual(mockComment);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.mutationError).toBeNull();
  });

  it('createComment thất bại cập nhật mutationError', async () => {
    vi.mocked(commentService.createComment).mockRejectedValueOnce(new Error('Tạo lỗi'));

    const { result } = renderHook(() => useCommentMutations());

    let created: CommentItemResponse | null = null;
    await act(async () => {
      created = await result.current.createComment({ fileId: 'FIL_001', content: 'Err' });
    });

    expect(created).toBeNull();
    expect(result.current.mutationError).toBe('Không thể gửi bình luận.');
  });

  it('updateComment thành công trả về comment đã cập nhật', async () => {
    const updatedComment: CommentItemResponse = {
      ...mockComment,
      content: 'Đã sửa',
    };
    const response: CommentMutationResponse = {
      message: 'Cập nhật thành công.',
      data: updatedComment,
    };

    vi.mocked(commentService.updateComment).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCommentMutations());

    let res: CommentItemResponse | null = null;
    await act(async () => {
      res = await result.current.updateComment('CMT_001', 'Đã sửa');
    });

    expect(commentService.updateComment).toHaveBeenCalledWith('CMT_001', { content: 'Đã sửa' });
    expect(res).toEqual(updatedComment);
  });

  it('deleteComment thành công trả về true', async () => {
    const response: MessageResponse = { message: 'Xóa thành công.' };
    vi.mocked(commentService.deleteComment).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCommentMutations());

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.deleteComment('CMT_001');
    });

    expect(commentService.deleteComment).toHaveBeenCalledWith('CMT_001');
    expect(isSuccess).toBe(true);
    expect(result.current.isCommentDeleting('CMT_001')).toBe(false);
  });

  it('toggleLike gọi like khi isLiked = false', async () => {
    const likedComment: CommentItemResponse = {
      ...mockComment,
      likeCount: 1,
      isLiked: true,
    };
    const response: CommentMutationResponse = {
      message: 'Đã thích.',
      data: likedComment,
    };

    vi.mocked(commentService.likeComment).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCommentMutations());

    let res: CommentItemResponse | null = null;
    await act(async () => {
      res = await result.current.toggleLike('CMT_001', false);
    });

    expect(commentService.likeComment).toHaveBeenCalledWith('CMT_001');
    expect(res).toEqual(likedComment);
  });

  it('toggleLike gọi unlike khi isLiked = true', async () => {
    const unlikedComment: CommentItemResponse = {
      ...mockComment,
      likeCount: 0,
      isLiked: false,
    };
    const response: CommentMutationResponse = {
      message: 'Đã bỏ thích.',
      data: unlikedComment,
    };

    vi.mocked(commentService.unlikeComment).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCommentMutations());

    let res: CommentItemResponse | null = null;
    await act(async () => {
      res = await result.current.toggleLike('CMT_001', true);
    });

    expect(commentService.unlikeComment).toHaveBeenCalledWith('CMT_001');
    expect(res).toEqual(unlikedComment);
  });

  it('ngăn chặn gửi trùng lặp (double-submit) khi cùng một commentId đang in-flight', async () => {
    let resolveFirst: (val: CommentMutationResponse) => void = () => {};
    const firstPromise = new Promise<CommentMutationResponse>((resolve) => {
      resolveFirst = resolve;
    });

    vi.mocked(commentService.likeComment).mockReturnValueOnce(firstPromise);

    const { result } = renderHook(() => useCommentMutations());

    let firstRes: Promise<CommentItemResponse | null> | undefined;
    let secondRes: CommentItemResponse | null = null;

    act(() => {
      firstRes = result.current.toggleLike('CMT_001', false);
    });

    await act(async () => {
      secondRes = await result.current.toggleLike('CMT_001', false);
    });

    // Lần gọi thứ 2 bị chặn ngay lập tức và trả về null
    expect(secondRes).toBeNull();
    expect(commentService.likeComment).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst({
        message: 'Thành công',
        data: { ...mockComment, isLiked: true, likeCount: 1 },
      });
      await firstRes;
    });
  });
});
