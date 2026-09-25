import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentItemResponse } from '@/features/comments/types/comment.types';
import { useReportModalStore } from '@/store/useReportModalStore';
import { CommentItem } from '../CommentItem';

const mockComment: CommentItemResponse = {
  commentId: 'CMT_001',
  fileId: 'FIL_001',
  uid: 'USR_AUTHOR',
  authorName: 'Nguyễn Văn Tác Giả',
  authorRole: 'Lecturer',
  content: 'Tài liệu hướng dẫn chuyên đề đồ án tốt nghiệp.',
  parentCommentId: null,
  likeCount: 5,
  replyCount: 2,
  isLiked: false,
  createdAt: '2026-09-24T10:00:00Z',
  updatedAt: null,
};

describe('CommentItem component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders author info, role badge, initials, and comment content', () => {
    render(
      <CommentItem comment={mockComment} onLikeToggle={vi.fn()} onEditSubmit={vi.fn()} onDeleteSubmit={vi.fn()} />,
    );

    expect(screen.getByText('Nguyễn Văn Tác Giả')).toBeInTheDocument();
    expect(screen.getByText('Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('NG')).toBeInTheDocument(); // Initials: N(guyễn) + G(iả)
    expect(screen.getByText('Tài liệu hướng dẫn chuyên đề đồ án tốt nghiệp.')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Like count
  });

  it('hiển thị nhãn (đã sửa) nếu updatedAt khác createdAt', () => {
    const editedComment: CommentItemResponse = {
      ...mockComment,
      updatedAt: '2026-09-24T12:00:00Z',
    };

    render(
      <CommentItem comment={editedComment} onLikeToggle={vi.fn()} onEditSubmit={vi.fn()} onDeleteSubmit={vi.fn()} />,
    );

    expect(screen.getByText('(đã sửa)')).toBeInTheDocument();
  });

  it('kích hoạt onLikeToggle khi người dùng đã đăng nhập nhấn nút Thích', () => {
    const handleLike = vi.fn();
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_LOGGED_IN"
        onLikeToggle={handleLike}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const likeButton = screen.getByRole('button', { name: /thích bình luận/i });
    fireEvent.click(likeButton);

    expect(handleLike).toHaveBeenCalledWith('CMT_001', false);
  });

  it('gọi onRequireLogin và không gọi onLikeToggle khi khách vãng lai nhấn nút Thích', () => {
    const handleLike = vi.fn();
    const handleRequireLogin = vi.fn();
    render(
      <CommentItem
        comment={mockComment}
        currentUserId={null}
        onLikeToggle={handleLike}
        onRequireLogin={handleRequireLogin}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const likeButton = screen.getByRole('button', { name: /thích bình luận/i });
    fireEvent.click(likeButton);

    expect(handleRequireLogin).toHaveBeenCalledTimes(1);
    expect(handleLike).not.toHaveBeenCalled();
  });

  it('hiển thị trạng thái đang thích và vô hiệu hóa nút like khi isLiking = true', () => {
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_LOGGED_IN"
        isLiking={true}
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const likeButton = screen.getByRole('button', { name: /thích bình luận/i });
    expect(likeButton).toBeDisabled();
    expect(likeButton.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('hiển thị trạng thái đã thích với aria-pressed="true" khi comment.isLiked = true', () => {
    const likedComment: CommentItemResponse = {
      ...mockComment,
      isLiked: true,
      likeCount: 6,
    };

    render(
      <CommentItem
        comment={likedComment}
        currentUserId="USR_LOGGED_IN"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const likeButton = screen.getByRole('button', { name: /bỏ thích bình luận/i });
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('kích hoạt onReplyClick khi nhấn nút Trả lời', () => {
    const handleReply = vi.fn();
    render(
      <CommentItem
        comment={mockComment}
        onLikeToggle={vi.fn()}
        onReplyClick={handleReply}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const replyButton = screen.getByRole('button', {
      name: /trả lời bình luận của nguyễn văn tác giả/i,
    });
    fireEvent.click(replyButton);

    expect(handleReply).toHaveBeenCalledTimes(1);
  });

  it('cho phép tác giả bình luận mở menu để Chỉnh sửa và Xóa', () => {
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const menuButton = screen.getByRole('button', { name: /tùy chọn bình luận/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('menuitem', { name: /chỉnh sửa/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /xóa/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /báo cáo/i })).not.toBeInTheDocument();
  });

  it('cho phép Admin xóa bình luận dù không phải tác giả', () => {
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_OTHER"
        currentUserRole="Admin"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const menuButton = screen.getByRole('button', { name: /tùy chọn bình luận/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('menuitem', { name: /xóa/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /chỉnh sửa/i })).not.toBeInTheDocument();
  });

  it('cho phép người dùng khác báo cáo bình luận và gọi openReportModal', () => {
    const openReportModalSpy = vi.spyOn(useReportModalStore.getState(), 'openReportModal');

    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_READER"
        currentUserRole="Student"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const menuButton = screen.getByRole('button', { name: /tùy chọn bình luận/i });
    fireEvent.click(menuButton);

    const reportButton = screen.getByRole('menuitem', { name: /báo cáo/i });
    fireEvent.click(reportButton);

    expect(openReportModalSpy).toHaveBeenCalledWith({
      type: 'Comment',
      id: 'CMT_001',
      content: 'Tài liệu hướng dẫn chuyên đề đồ án tốt nghiệp.',
      authorName: 'Nguyễn Văn Tác Giả',
      fileId: 'FIL_001',
      uidtarget: 'USR_AUTHOR',
    });
  });

  it('chuyển sang chế độ chỉnh sửa khi click Chỉnh sửa từ menu', () => {
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const menuButton = screen.getByRole('button', { name: /tùy chọn bình luận/i });
    fireEvent.click(menuButton);

    const editMenuItem = screen.getByRole('menuitem', { name: /chỉnh sửa/i });
    fireEvent.click(editMenuItem);

    expect(screen.getByText('Đang chỉnh sửa bình luận')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it('hủy chỉnh sửa và trở về nội dung ban đầu khi nhấn Hủy', () => {
    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    // Mở menu và click Chỉnh sửa
    fireEvent.click(screen.getByRole('button', { name: /tùy chọn bình luận/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /chỉnh sửa/i }));
    expect(screen.getByText('Đang chỉnh sửa bình luận')).toBeInTheDocument();

    // Click nút Hủy
    const cancelButtons = screen.getAllByRole('button', { name: /hủy/i });
    fireEvent.click(cancelButtons[0]);

    expect(screen.queryByText('Đang chỉnh sửa bình luận')).not.toBeInTheDocument();
    expect(screen.getByText('Tài liệu hướng dẫn chuyên đề đồ án tốt nghiệp.')).toBeInTheDocument();
  });

  it('lưu nội dung chỉnh sửa thành công khi thay đổi nội dung và bấm Lưu thay đổi', async () => {
    const handleEditSubmit = vi.fn().mockResolvedValue(true);

    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={handleEditSubmit}
        onDeleteSubmit={vi.fn()}
      />,
    );

    // Mở menu và click Chỉnh sửa
    fireEvent.click(screen.getByRole('button', { name: /tùy chọn bình luận/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /chỉnh sửa/i }));

    const textarea = screen.getByDisplayValue(mockComment.content);
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Nội dung cập nhật mới' } });
    });

    const saveButton = screen.getByRole('button', { name: /lưu thay đổi/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(handleEditSubmit).toHaveBeenCalledWith('CMT_001', 'Nội dung cập nhật mới');
    expect(screen.queryByText('Đang chỉnh sửa bình luận')).not.toBeInTheDocument();
  });

  it('hiển thị badge trả lời @TênTácGiả khi isReply = true và cuộn tới cha khi click', () => {
    const parentDiv = document.createElement('div');
    parentDiv.id = 'comment-CMT_PARENT_001';
    parentDiv.scrollIntoView = vi.fn();
    document.body.appendChild(parentDiv);

    const replyComment: CommentItemResponse = {
      ...mockComment,
      commentId: 'CMT_REPLY_001',
      parentCommentId: 'CMT_PARENT_001',
    };

    render(
      <CommentItem
        comment={replyComment}
        isReply={true}
        parentAuthorName="Lê Văn Cha"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    const mentionBtn = screen.getByRole('button', {
      name: 'Đi tới bình luận của Lê Văn Cha',
    });
    expect(mentionBtn).toBeInTheDocument();
    expect(mentionBtn).toHaveTextContent('@Lê Văn Cha');

    fireEvent.click(mentionBtn);
    expect(parentDiv.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
    });

    document.body.removeChild(parentDiv);
  });

  it('mở CommentDeleteModal khi click Xóa từ menu và gọi onDeleteSubmit khi xác nhận', async () => {
    const handleDeleteSubmit = vi.fn().mockResolvedValue(true);

    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={handleDeleteSubmit}
      />,
    );

    // Mở menu
    const menuButton = screen.getByRole('button', { name: /tùy chọn bình luận/i });
    fireEvent.click(menuButton);

    // Click Xóa trong menu
    const deleteMenuItem = screen.getByRole('menuitem', { name: /xóa/i });
    fireEvent.click(deleteMenuItem);

    // Kiểm tra Modal xuất hiện
    expect(screen.getByRole('heading', { name: 'Xóa bình luận' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác sau khi đã thực hiện.',
      ),
    ).toBeInTheDocument();

    // Click xác nhận "Xóa bình luận" trong modal
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Xóa bình luận' });
    await act(async () => {
      fireEvent.click(confirmDeleteBtn);
    });

    expect(handleDeleteSubmit).toHaveBeenCalledWith('CMT_001');
  });

  it('đóng CommentDeleteModal và không gọi onDeleteSubmit khi người dùng click Hủy trong modal', () => {
    const handleDeleteSubmit = vi.fn();

    render(
      <CommentItem
        comment={mockComment}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={handleDeleteSubmit}
      />,
    );

    // Mở menu và click Xóa
    fireEvent.click(screen.getByRole('button', { name: /tùy chọn bình luận/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /xóa/i }));

    expect(screen.getByRole('heading', { name: 'Xóa bình luận' })).toBeInTheDocument();

    // Click Hủy
    const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelBtn);

    expect(handleDeleteSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Xóa bình luận' })).not.toBeInTheDocument();
  });

  it('hiển thị cảnh báo số lượng phản hồi phụ thuộc trong modal xóa khi comment có replyCount > 0', () => {
    const commentWithReplies = {
      ...mockComment,
      replyCount: 4,
    };

    render(
      <CommentItem
        comment={commentWithReplies}
        currentUserId="USR_AUTHOR"
        onLikeToggle={vi.fn()}
        onEditSubmit={vi.fn()}
        onDeleteSubmit={vi.fn()}
      />,
    );

    // Mở menu và click Xóa
    fireEvent.click(screen.getByRole('button', { name: /tùy chọn bình luận/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /xóa/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('4');
    expect(alert).toHaveTextContent('câu trả lời phụ thuộc');
  });
});
