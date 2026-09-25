import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { CommentList } from '../CommentList';

const mockComment1: CommentItemResponse = {
  commentId: 'CMT_001',
  fileId: 'FIL_001',
  uid: 'USR_001',
  authorName: 'Nguyễn Văn A',
  authorRole: 'Student',
  content: 'Bình luận 1',
  parentCommentId: null,
  likeCount: 3,
  replyCount: 0,
  isLiked: false,
  createdAt: '2026-09-24T10:00:00Z',
  updatedAt: null,
};

const mockComment2: CommentItemResponse = {
  commentId: 'CMT_002',
  fileId: 'FIL_001',
  uid: 'USR_002',
  authorName: 'Trần Thị B',
  authorRole: 'Lecturer',
  content: 'Bình luận 2',
  parentCommentId: null,
  likeCount: 1,
  replyCount: 2,
  isLiked: true,
  createdAt: '2026-09-24T10:30:00Z',
  updatedAt: null,
};

describe('CommentList component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hiển thị skeleton khi đang loading lần đầu', () => {
    render(
      <CommentList
        comments={[]}
        isLoading={true}
        onLikeToggle={vi.fn()}
        isCommentLiking={() => false}
        onSubmitReply={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
        isCommentDeleting={() => false}
      />,
    );

    expect(screen.getByLabelText(/đang nạp bình luận/i)).toBeInTheDocument();
  });

  it('hiển thị empty state khi không có bình luận', () => {
    render(
      <CommentList
        comments={[]}
        isLoading={false}
        onLikeToggle={vi.fn()}
        isCommentLiking={() => false}
        onSubmitReply={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
        isCommentDeleting={() => false}
      />,
    );

    expect(screen.getByText('Chưa có bình luận nào')).toBeInTheDocument();
    expect(screen.getByText(/hãy là người đầu tiên/i)).toBeInTheDocument();
  });

  it('hiển thị danh sách các bình luận gốc', () => {
    render(
      <CommentList
        comments={[mockComment1, mockComment2]}
        isLoading={false}
        onLikeToggle={vi.fn()}
        isCommentLiking={() => false}
        onSubmitReply={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
        isCommentDeleting={() => false}
      />,
    );

    expect(screen.getByText('Bình luận 1')).toBeInTheDocument();
    expect(screen.getByText('Bình luận 2')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
  });

  it('hiển thị nút Xem thêm bình luận và kích hoạt onLoadMore khi click', () => {
    const handleLoadMore = vi.fn();

    render(
      <CommentList
        comments={[mockComment1]}
        isLoading={false}
        hasNextPage={true}
        onLoadMore={handleLoadMore}
        onLikeToggle={vi.fn()}
        isCommentLiking={() => false}
        onSubmitReply={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
        isCommentDeleting={() => false}
      />,
    );

    const loadMoreBtn = screen.getByRole('button', { name: /xem thêm bình luận/i });
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);
    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });
});
