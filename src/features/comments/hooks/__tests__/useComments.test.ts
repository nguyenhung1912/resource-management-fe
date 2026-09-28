import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { useComments } from '../useComments';

vi.mock('@/services/commentService', () => ({
  commentService: {
    getCommentsByFile: vi.fn(),
  },
}));

describe('useComments hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComment: CommentItemResponse = {
    commentId: 'CMT_001',
    fileId: 'FIL_001',
    uid: 'USR_001',
    authorName: 'Lê Văn C',
    authorRole: 'Student',
    content: 'Tài liệu hữu ích!',
    parentCommentId: null,
    likeCount: 2,
    replyCount: 1,
    isLiked: false,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: null,
  };

  const mockPagedData: PagedCommentResponse = {
    items: [mockComment],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  it('khởi tạo với state mặc định khi không truyền initialData', () => {
    const { result } = renderHook(() => useComments());

    expect(result.current.items).toEqual([]);
    expect(result.current.pageIndex).toBe(1);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('khởi tạo với initialData khi được truyền vào', () => {
    const { result } = renderHook(() => useComments({ initialData: mockPagedData }));

    expect(result.current.items).toEqual([mockComment]);
    expect(result.current.totalCount).toBe(1);
  });

  it('fetchComments thành công cập nhật items và pagination', async () => {
    vi.mocked(commentService.getCommentsByFile).mockResolvedValueOnce(mockPagedData);

    const { result } = renderHook(() => useComments());

    let res: PagedCommentResponse | null = null;
    await act(async () => {
      res = await result.current.fetchComments('FIL_001', 1);
    });

    expect(commentService.getCommentsByFile).toHaveBeenCalledWith('FIL_001', {
      pageIndex: 1,
      pageSize: 10,
    });
    expect(res).toEqual(mockPagedData);
    expect(result.current.items).toEqual([mockComment]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetchComments thất bại cập nhật error', async () => {
    vi.mocked(commentService.getCommentsByFile).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useComments());

    await act(async () => {
      await result.current.fetchComments('FIL_001', 1);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('Không thể tải danh sách bình luận.');
  });

  it('loadMoreComments tải trang tiếp theo và nối vào mảng items', async () => {
    const initialPage: PagedCommentResponse = {
      items: [mockComment],
      pageIndex: 1,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    const nextPageComment: CommentItemResponse = {
      ...mockComment,
      commentId: 'CMT_002',
      content: 'Bình luận trang 2',
    };

    const nextPage: PagedCommentResponse = {
      items: [nextPageComment],
      pageIndex: 2,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    };

    vi.mocked(commentService.getCommentsByFile).mockResolvedValueOnce(nextPage);

    const { result } = renderHook(() => useComments({ initialData: initialPage }));

    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.loadMoreComments('FIL_001');
    });

    expect(commentService.getCommentsByFile).toHaveBeenCalledWith('FIL_001', {
      pageIndex: 2,
      pageSize: 1,
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[1].commentId).toBe('CMT_002');
    expect(result.current.hasNextPage).toBe(false);
  });

  it('addComment chèn comment mới vào đầu danh sách và tăng totalCount', () => {
    const { result } = renderHook(() => useComments({ initialData: mockPagedData }));

    const newComment: CommentItemResponse = {
      ...mockComment,
      commentId: 'CMT_NEW',
      content: 'Comment mới nhất',
    };

    act(() => {
      result.current.addComment(newComment);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].commentId).toBe('CMT_NEW');
    expect(result.current.totalCount).toBe(2);
  });

  it('updateComment cập nhật comment mục tiêu', () => {
    const { result } = renderHook(() => useComments({ initialData: mockPagedData }));

    act(() => {
      result.current.updateComment('CMT_001', { content: 'Nội dung cập nhật', likeCount: 3 });
    });

    expect(result.current.items[0].content).toBe('Nội dung cập nhật');
    expect(result.current.items[0].likeCount).toBe(3);
  });

  it('removeComment xóa comment khỏi danh sách và giảm totalCount', () => {
    const { result } = renderHook(() => useComments({ initialData: mockPagedData }));

    act(() => {
      result.current.removeComment('CMT_001');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('incrementTotalCount tăng hoặc giảm totalCount theo delta', () => {
    const { result } = renderHook(() => useComments({ initialData: mockPagedData }));

    expect(result.current.totalCount).toBe(1);

    act(() => {
      result.current.incrementTotalCount(1);
    });
    expect(result.current.totalCount).toBe(2);

    act(() => {
      result.current.incrementTotalCount(-1);
    });
    expect(result.current.totalCount).toBe(1);
  });
});
