import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { useCommentReplies } from '../useCommentReplies';

vi.mock('@/services/commentService', () => ({
  commentService: {
    getReplies: vi.fn(),
  },
}));

describe('useCommentReplies hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReply: CommentItemResponse = {
    commentId: 'CMT_REP_001',
    fileId: 'FIL_001',
    uid: 'USR_002',
    authorName: 'Trần Thị B',
    authorRole: 'Student',
    content: 'Cảm ơn bạn đã chia sẻ!',
    parentCommentId: 'CMT_ROOT',
    likeCount: 1,
    replyCount: 0,
    isLiked: false,
    createdAt: '2026-09-24T10:05:00Z',
    updatedAt: null,
  };

  const mockReply2: CommentItemResponse = {
    commentId: 'CMT_REP_002',
    fileId: 'FIL_001',
    uid: 'USR_003',
    authorName: 'Lê Văn C',
    authorRole: 'Teacher',
    content: 'Tài liệu giải thích rất rõ ràng.',
    parentCommentId: 'CMT_ROOT',
    likeCount: 2,
    replyCount: 1,
    isLiked: true,
    createdAt: '2026-09-24T10:15:00Z',
    updatedAt: null,
  };

  const mockRepliesPage: PagedCommentResponse = {
    items: [mockReply],
    pageIndex: 1,
    pageSize: 5,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  it('khởi tạo với state mặc định và isExpanded = false', () => {
    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 3 }));

    expect(result.current.replies).toEqual([]);
    expect(result.current.isExpanded).toBe(false);
    expect(result.current.hasLoaded).toBe(false);
    expect(result.current.totalReplies).toBe(3);
    expect(result.current.isLoading).toBe(false);
  });

  it('toggleExpand lần đầu tiên sẽ mở rộng và tự động fetch replies', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage);

    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 1 }));

    await act(async () => {
      await result.current.toggleExpand();
    });

    expect(commentService.getReplies).toHaveBeenCalledWith('CMT_ROOT', {
      pageIndex: 1,
      pageSize: 5,
    });
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.hasLoaded).toBe(true);
    expect(result.current.replies).toEqual([mockReply]);
  });

  it('toggleExpand lần thứ hai sẽ chỉ thu gọn mà không gọi lại API', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage);

    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 1 }));

    await act(async () => {
      await result.current.toggleExpand();
    });

    expect(commentService.getReplies).toHaveBeenCalledTimes(1);
    expect(result.current.isExpanded).toBe(true);

    act(() => {
      void result.current.toggleExpand();
    });

    expect(result.current.isExpanded).toBe(false);
    expect(commentService.getReplies).toHaveBeenCalledTimes(1);
  });

  it('expandReplies và collapseReplies điều khiển trạng thái mở rộng tường minh', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage);

    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 1 }));

    await act(async () => {
      await result.current.expandReplies();
    });

    expect(result.current.isExpanded).toBe(true);
    expect(result.current.replies).toEqual([mockReply]);

    act(() => {
      result.current.collapseReplies();
    });

    expect(result.current.isExpanded).toBe(false);
  });

  it('addReply thêm reply mới, tự động mở rộng và không nhân bản nếu commentId đã tồn tại', () => {
    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 0 }));

    act(() => {
      result.current.addReply(mockReply);
    });

    expect(result.current.replies).toEqual([mockReply]);
    expect(result.current.totalReplies).toBe(1);
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.hasLoaded).toBe(true);

    // Call addReply with the same ID - should not duplicate
    act(() => {
      result.current.addReply(mockReply);
    });

    expect(result.current.replies).toHaveLength(1);
  });

  it('updateReply cập nhật reply theo id bằng object hoặc functional updater', () => {
    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 0 }));

    act(() => {
      result.current.addReply(mockReply);
    });

    // Update with partial object
    act(() => {
      result.current.updateReply('CMT_REP_001', { content: 'Nội dung đã chỉnh sửa' });
    });

    expect(result.current.replies[0]?.content).toBe('Nội dung đã chỉnh sửa');

    // Update with functional updater for nested reply count
    act(() => {
      result.current.updateReply('CMT_REP_001', (prev) => ({
        ...prev,
        replyCount: prev.replyCount + 1,
      }));
    });

    expect(result.current.replies[0]?.replyCount).toBe(1);
  });

  it('removeReply xóa câu trả lời và giảm totalReplies', () => {
    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', initialReplyCount: 0 }));

    act(() => {
      result.current.addReply(mockReply);
    });

    expect(result.current.replies).toHaveLength(1);

    act(() => {
      result.current.removeReply('CMT_REP_001');
    });

    expect(result.current.replies).toHaveLength(0);
    expect(result.current.totalReplies).toBe(0);
  });

  it('reset state khi commentId thay đổi', () => {
    let currentId = 'CMT_1';
    const { result, rerender } = renderHook(() => useCommentReplies({ commentId: currentId, initialReplyCount: 2 }));

    act(() => {
      result.current.addReply(mockReply);
    });
    expect(result.current.replies).toHaveLength(1);

    currentId = 'CMT_2';
    rerender();

    expect(result.current.replies).toEqual([]);
    expect(result.current.isExpanded).toBe(false);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('tải trang tiếp theo với loadMoreReplies và loại trừ trùng lặp', async () => {
    const page1: PagedCommentResponse = {
      items: [mockReply],
      pageIndex: 1,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    const page2: PagedCommentResponse = {
      items: [mockReply, mockReply2], // mockReply is duplicate from server, mockReply2 is new
      pageIndex: 2,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    };

    vi.mocked(commentService.getReplies).mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useCommentReplies({ commentId: 'CMT_ROOT', pageSize: 1 }));

    await act(async () => {
      await result.current.expandReplies();
    });

    expect(result.current.replies).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.loadMoreReplies();
    });

    // Should have 2 items without duplicating mockReply
    expect(result.current.replies).toHaveLength(2);
    expect(result.current.replies[0]?.commentId).toBe('CMT_REP_001');
    expect(result.current.replies[1]?.commentId).toBe('CMT_REP_002');
  });
});
