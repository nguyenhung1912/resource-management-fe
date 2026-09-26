import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteRatingDialog } from '../DeleteRatingDialog';

describe('DeleteRatingDialog', () => {
  it('does not render content when isOpen is false', () => {
    render(<DeleteRatingDialog isOpen={false} isDeleting={false} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByText('Hủy đánh giá của bạn?')).not.toBeInTheDocument();
  });

  it('renders title, description and triggers onConfirm and onClose', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(<DeleteRatingDialog isOpen={true} isDeleting={false} onConfirm={handleConfirm} onClose={handleClose} />);

    expect(screen.getByText('Hủy đánh giá của bạn?')).toBeInTheDocument();
    expect(screen.getByText(/Thao tác này sẽ xóa vĩnh viễn điểm đánh giá/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Không, giữ lại'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('confirm-delete-rating-btn'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('displays loading state when isDeleting is true and disables buttons', () => {
    render(<DeleteRatingDialog isOpen={true} isDeleting={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText('Đang xóa...')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-rating-btn')).toBeDisabled();
    expect(screen.getByText('Không, giữ lại')).toBeDisabled();
  });

  it('renders error message when error is provided', () => {
    render(
      <DeleteRatingDialog
        isOpen={true}
        isDeleting={false}
        error="Lỗi xóa đánh giá từ máy chủ"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi xóa đánh giá từ máy chủ');
  });
});
