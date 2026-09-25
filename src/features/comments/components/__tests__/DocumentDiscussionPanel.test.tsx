import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CommentItemResponse,
  CommentMutationResponse,
  PagedCommentResponse,
} from '@/features/comments/types/comment.types';
import { commentService } from '@/services/commentService';
import { useAuthStore } from '@/store/authStore';
import { DocumentDiscussionPanel } from '../DocumentDiscussionPanel';

vi.mock('@/services/commentService', () => ({
  commentService: {
    getCommentsByFile: vi.fn(),
    getReplies: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
  },
}));

const mockUser = {
  uid: 'USR_TESTER',
  userCode: 'tester',
  fullName: 'Nguyễn Kiểm Thử',
  email: 'tester@example.com',
  roleId: 2,
  role: 'Student',
};

const mockComment: CommentItemResponse = {
  commentId: 'CMT_001',
  fileId: 'FIL_DOC_001',
  uid: 'USR_TESTER',
  authorName: 'Nguyễn Kiểm Thử',
  authorRole: 'Student',
  content: 'Tài liệu này rất bổ ích cho học phần.',
  parentCommentId: null,
  likeCount: 5,
  replyCount: 0,
  isLiked: false,
  createdAt: '2026-09-24T10:00:00Z',
  updatedAt: null,
};

const mockInitialData: PagedCommentResponse = {
  items: [mockComment],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe('DocumentDiscussionPanel integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('render header thảo luận kèm số lượng bình luận và nút làm mới', () => {
    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Bình luận & Thảo luận')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /làm mới danh sách bình luận/i })).toBeInTheDocument();
  });

  it('gửi bình luận gốc mới thành công và cập nhật vào danh sách', async () => {
    const newCommentItem: CommentItemResponse = {
      commentId: 'CMT_NEW_002',
      fileId: 'FIL_DOC_001',
      uid: 'USR_TESTER',
      authorName: 'Nguyễn Kiểm Thử',
      authorRole: 'Student',
      content: 'Bình luận mới vừa thêm',
      parentCommentId: null,
      likeCount: 0,
      replyCount: 0,
      isLiked: false,
      createdAt: '2026-09-24T11:00:00Z',
      updatedAt: null,
    };

    const mutationRes: CommentMutationResponse = {
      message: 'Tạo bình luận thành công.',
      data: newCommentItem,
    };

    vi.mocked(commentService.createComment).mockResolvedValueOnce(mutationRes);

    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận hoặc chia sẻ câu hỏi/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Bình luận mới vừa thêm' } });
    });

    const submitBtn = screen.getByRole('button', { name: /^bình luận$/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(commentService.createComment).toHaveBeenCalledWith({
      fileId: 'FIL_DOC_001',
      content: 'Bình luận mới vừa thêm',
    });

    // Bình luận mới xuất hiện trong danh sách
    expect(screen.getByText('Bình luận mới vừa thêm')).toBeInTheDocument();
  });

  it('thực hiện thích và cập nhật lượt thích', async () => {
    const likedComment: CommentItemResponse = {
      ...mockComment,
      likeCount: 6,
      isLiked: true,
    };

    vi.mocked(commentService.likeComment).mockResolvedValueOnce({
      message: 'Đã thích bình luận.',
      data: likedComment,
    });

    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    const likeBtn = screen.getByRole('button', { name: /thích bình luận/i });
    await act(async () => {
      fireEvent.click(likeBtn);
    });

    expect(commentService.likeComment).toHaveBeenCalledWith('CMT_001');
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('thực hiện cập nhật lạc quan và hoàn nguyên (rollback) khi API thích thất bại', async () => {
    vi.mocked(commentService.likeComment).mockRejectedValueOnce(new Error('Lỗi thích'));

    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    const likeBtn = screen.getByRole('button', { name: /thích bình luận/i });
    expect(screen.getByText('5')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(likeBtn);
    });

    // Sau khi API reject, rollback về 5 lượt thích và hiển thị alert
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hiển thị lỗi cảnh báo khi mutation thất bại', async () => {
    vi.mocked(commentService.createComment).mockRejectedValueOnce(new Error('Lỗi gửi'));

    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/viết bình luận hoặc chia sẻ câu hỏi/i);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Lỗi' } });
    });

    const submitBtn = screen.getByRole('button', { name: /^bình luận$/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Không thể gửi bình luận.')).toBeInTheDocument();
  });

  it('gửi câu trả lời cho bình luận gốc thành công và cập nhật số lượng', async () => {
    const createdReply: CommentItemResponse = {
      commentId: 'CMT_REPLY_999',
      fileId: 'FIL_DOC_001',
      uid: 'USR_TESTER',
      authorName: 'Nguyễn Kiểm Thử',
      authorRole: 'Student',
      content: 'Câu trả lời thử nghiệm',
      parentCommentId: 'CMT_001',
      likeCount: 0,
      replyCount: 0,
      isLiked: false,
      createdAt: '2026-09-24T11:15:00Z',
      updatedAt: null,
    };

    vi.mocked(commentService.createComment).mockResolvedValueOnce({
      message: 'Tạo phản hồi thành công.',
      data: createdReply,
    });

    render(
      <MemoryRouter>
        <DocumentDiscussionPanel fileId="FIL_DOC_001" initialComments={mockInitialData} />
      </MemoryRouter>,
    );

    // Open reply form for CMT_001
    const replyTriggerBtn = screen.getByRole('button', {
      name: 'Trả lời bình luận của Nguyễn Kiểm Thử',
    });
    fireEvent.click(replyTriggerBtn);

    const replyTextarea = screen.getByPlaceholderText(/Trả lời @Nguyễn Kiểm Thử/i);
    act(() => {
      fireEvent.change(replyTextarea, { target: { value: 'Câu trả lời thử nghiệm' } });
    });

    const submitReplyBtn = screen.getByRole('button', { name: 'Trả lời' });
    await act(async () => {
      fireEvent.click(submitReplyBtn);
    });

    expect(commentService.createComment).toHaveBeenCalledWith({
      fileId: 'FIL_DOC_001',
      content: 'Câu trả lời thử nghiệm',
      parentCommentId: 'CMT_001',
    });

    // The reply appears in the UI
    expect(screen.getByText('Câu trả lời thử nghiệm')).toBeInTheDocument();
  });
});
