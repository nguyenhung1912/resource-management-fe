import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentItemResponse, PagedCommentResponse } from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { CommentThreadNode } from '../CommentThreadNode';

vi.mock('@/services/commentService', () => ({
  commentService: {
    getReplies: vi.fn(),
  },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: {
        uid: 'USR_TEST',
        userCode: 'GV01',
        fullName: 'Nguyễn Văn Test',
        roleName: 'Teacher',
      },
      isAuthenticated: true,
    }),
  ),
}));

describe('CommentThreadNode component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRootComment: CommentItemResponse = {
    commentId: 'CMT_ROOT_001',
    fileId: 'FIL_001',
    uid: 'USR_001',
    authorName: 'Nguyễn Văn A',
    authorRole: 'Teacher',
    content: 'Tài liệu hướng dẫn rất chi tiết!',
    parentCommentId: null,
    likeCount: 5,
    replyCount: 1,
    isLiked: false,
    createdAt: '2026-09-24T09:00:00Z',
    updatedAt: null,
  };

  const mockChildReply: CommentItemResponse = {
    commentId: 'CMT_CHILD_001',
    fileId: 'FIL_001',
    uid: 'USR_002',
    authorName: 'Trần Thị B',
    authorRole: 'Student',
    content: 'Em cảm ơn thầy nhiều ạ!',
    parentCommentId: 'CMT_ROOT_001',
    likeCount: 1,
    replyCount: 0,
    isLiked: false,
    createdAt: '2026-09-24T09:30:00Z',
    updatedAt: null,
  };

  const mockRepliesPage: PagedCommentResponse = {
    items: [mockChildReply],
    pageIndex: 1,
    pageSize: 5,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const defaultProps = {
    comment: mockRootComment,
    depth: 0,
    currentUserId: 'USR_TEST',
    currentUserRole: 'Teacher',
    isCommentLiking: vi.fn(() => false),
    isCommentDeleting: vi.fn(() => false),
    onLikeToggle: vi.fn(),
    onSubmitReply: vi.fn(),
    onEditSubmit: vi.fn(),
    onDeleteSubmit: vi.fn(),
  };

  it('render comment gốc với nội dung và tác giả chính xác', () => {
    render(<CommentThreadNode {...defaultProps} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu hướng dẫn rất chi tiết!')).toBeInTheDocument();
    expect(screen.getByText('Xem 1 câu trả lời')).toBeInTheDocument();
  });

  it('bấm Trả lời mở form nhập và bấm Hủy đóng form', () => {
    render(<CommentThreadNode {...defaultProps} />);

    const replyButton = screen.getByRole('button', {
      name: 'Trả lời bình luận của Nguyễn Văn A',
    });
    fireEvent.click(replyButton);

    // Form reply appears with placeholder referencing parent author
    const textarea = screen.getByPlaceholderText(/Trả lời @Nguyễn Văn A/i);
    expect(textarea).toBeInTheDocument();

    // Cancel closes form
    const cancelButton = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelButton);

    expect(screen.queryByPlaceholderText(/Trả lời @Nguyễn Văn A/i)).not.toBeInTheDocument();
  });

  it('gửi phản hồi thành công chèn reply mới và đóng form', async () => {
    const onSubmitReply = vi.fn().mockResolvedValueOnce(mockChildReply);
    render(<CommentThreadNode {...defaultProps} onSubmitReply={onSubmitReply} />);

    // Open reply form
    const replyButton = screen.getByRole('button', {
      name: 'Trả lời bình luận của Nguyễn Văn A',
    });
    fireEvent.click(replyButton);

    const textarea = screen.getByPlaceholderText(/Trả lời @Nguyễn Văn A/i);
    fireEvent.change(textarea, { target: { value: 'Phản hồi mới' } });

    const submitButton = screen.getByRole('button', { name: 'Trả lời' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitReply).toHaveBeenCalledWith('CMT_ROOT_001', 'Phản hồi mới');
    });

    // Form closes and new reply appears
    expect(screen.queryByPlaceholderText(/Trả lời @Nguyễn Văn A/i)).not.toBeInTheDocument();
    expect(screen.getByText('Em cảm ơn thầy nhiều ạ!')).toBeInTheDocument();
  });

  it('bấm Xem 1 câu trả lời gọi API và đệ quy render child CommentThreadNode', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage);

    render(<CommentThreadNode {...defaultProps} />);

    const toggleButton = screen.getByRole('button', {
      name: 'Xem 1 câu trả lời cho bình luận của Nguyễn Văn A',
    });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(commentService.getReplies).toHaveBeenCalledWith('CMT_ROOT_001', {
        pageIndex: 1,
        pageSize: 5,
      });
    });

    // Child reply is rendered
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    expect(screen.getByText('Em cảm ơn thầy nhiều ạ!')).toBeInTheDocument();

    // Toggle button changes to "Thu gọn câu trả lời"
    expect(screen.getByText('Thu gọn câu trả lời')).toBeInTheDocument();
  });

  it('cho phép phản hồi lồng cấp (nested reply) trên reply con', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage).mockResolvedValueOnce({
      items: [],
      pageIndex: 1,
      pageSize: 5,
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    const onSubmitReply = vi.fn().mockResolvedValueOnce(true);

    render(<CommentThreadNode {...defaultProps} onSubmitReply={onSubmitReply} />);

    // Expand replies
    const toggleButton = screen.getByRole('button', {
      name: 'Xem 1 câu trả lời cho bình luận của Nguyễn Văn A',
    });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    // Click reply on the child node
    const childReplyButton = screen.getByRole('button', {
      name: 'Trả lời bình luận của Trần Thị B',
    });
    fireEvent.click(childReplyButton);

    // Form appears for child with placeholder referencing child author
    const textarea = screen.getByPlaceholderText(/Trả lời @Trần Thị B/i);
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Trả lời cho Trần Thị B' } });
    const submitButton = screen.getByRole('button', { name: 'Trả lời' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmitReply).toHaveBeenCalledWith('CMT_CHILD_001', 'Trả lời cho Trần Thị B');
    });
  });

  it('hiển thị nút Thu gọn nhánh ở cuối thread khi có >= 3 câu trả lời và thu gọn khi click', async () => {
    const multiRepliesPage: PagedCommentResponse = {
      items: [
        { ...mockChildReply, commentId: 'R1', content: 'Phản hồi 1' },
        { ...mockChildReply, commentId: 'R2', content: 'Phản hồi 2' },
        { ...mockChildReply, commentId: 'R3', content: 'Phản hồi 3' },
      ],
      pageIndex: 1,
      pageSize: 5,
      totalCount: 3,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    vi.mocked(commentService.getReplies).mockResolvedValueOnce(multiRepliesPage);

    render(<CommentThreadNode {...defaultProps} comment={{ ...mockRootComment, replyCount: 3 }} />);

    const toggleButton = screen.getByRole('button', {
      name: 'Xem 3 câu trả lời cho bình luận của Nguyễn Văn A',
    });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Phản hồi 3')).toBeInTheDocument();
    });

    const bottomCollapseBtn = screen.getByRole('button', {
      name: 'Thu gọn luồng câu trả lời của Nguyễn Văn A',
    });
    expect(bottomCollapseBtn).toBeInTheDocument();

    fireEvent.click(bottomCollapseBtn);

    // Thread is collapsed
    expect(screen.queryByText('Phản hồi 3')).not.toBeInTheDocument();
  });

  it('cập nhật trạng thái thích và số lượng like cho câu trả lời con khi người dùng thích reply', async () => {
    vi.mocked(commentService.getReplies).mockResolvedValueOnce(mockRepliesPage);

    const likedReply: CommentItemResponse = {
      ...mockChildReply,
      likeCount: 2,
      isLiked: true,
    };
    const onLikeToggle = vi.fn().mockResolvedValueOnce(likedReply);

    render(<CommentThreadNode {...defaultProps} onLikeToggle={onLikeToggle} />);

    // Mở thread câu trả lời
    const toggleButton = screen.getByRole('button', {
      name: 'Xem 1 câu trả lời cho bình luận của Nguyễn Văn A',
    });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Em cảm ơn thầy nhiều ạ!')).toBeInTheDocument();
    });

    // Lấy nút Thích của reply con (child reply có 1 like ban đầu)
    const childLikeButtons = screen.getAllByRole('button', { name: /thích bình luận/i });
    const targetLikeBtn = childLikeButtons[childLikeButtons.length - 1];
    fireEvent.click(targetLikeBtn);

    await waitFor(() => {
      expect(onLikeToggle).toHaveBeenCalledWith('CMT_CHILD_001', false);
    });

    // Trạng thái cập nhật lên 2 lượt thích
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
