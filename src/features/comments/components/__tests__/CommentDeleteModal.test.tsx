import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentDeleteModal } from '../CommentDeleteModal';

describe('CommentDeleteModal', () => {
  it('không hiển thị khi isOpen = false', () => {
    render(<CommentDeleteModal isOpen={false} commentId="comment-1" onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByText('Xóa bình luận')).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ tiêu đề, mô tả và nút bấm khi isOpen = true', () => {
    render(<CommentDeleteModal isOpen={true} commentId="comment-1" onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Xóa bình luận' })).toBeInTheDocument();
    expect(screen.getByText('Thao tác này sẽ gỡ bỏ bình luận khỏi cuộc thảo luận.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác sau khi đã thực hiện.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa bình luận' })).toBeInTheDocument();
  });

  it('không hiển thị cảnh báo phản hồi khi replyCount = 0', () => {
    render(
      <CommentDeleteModal isOpen={true} commentId="comment-1" replyCount={0} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hiển thị hộp cảnh báo khi bình luận có câu trả lời phụ thuộc (replyCount > 0)', () => {
    render(
      <CommentDeleteModal isOpen={true} commentId="comment-1" replyCount={3} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('3');
    expect(alert).toHaveTextContent('câu trả lời phụ thuộc');
  });

  it('kích hoạt onClose khi người dùng nhấn nút Hủy', () => {
    const handleClose = vi.fn();
    render(<CommentDeleteModal isOpen={true} commentId="comment-1" onClose={handleClose} onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('kích hoạt onConfirm khi người dùng nhấn nút Xóa bình luận', () => {
    const handleConfirm = vi.fn();
    render(<CommentDeleteModal isOpen={true} commentId="comment-1" onClose={vi.fn()} onConfirm={handleConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa bình luận' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa các nút bấm khi isDeleting = true', () => {
    render(
      <CommentDeleteModal
        isOpen={true}
        commentId="comment-1"
        isDeleting={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: 'Hủy' });
    const deleteButton = screen.getByRole('button', { name: /Xóa bình luận/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
