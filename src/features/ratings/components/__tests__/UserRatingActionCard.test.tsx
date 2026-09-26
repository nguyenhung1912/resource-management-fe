import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRatingActionCard } from '../UserRatingActionCard';
import { ratingService } from '@/services/ratingService';

vi.mock('@/services/ratingService', () => ({
  ratingService: {
    upsertRating: vi.fn(),
    deleteRating: vi.fn(),
  },
}));

describe('UserRatingActionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders unauthenticated prompt when isAuthenticated is false', () => {
    const handleRequireLogin = vi.fn();
    render(
      <UserRatingActionCard
        fileId="FIL_1"
        currentUserScore={null}
        isAuthenticated={false}
        onRequireLogin={handleRequireLogin}
      />,
    );

    expect(screen.getByTestId('unauthenticated-rating-card')).toBeInTheDocument();
    expect(screen.getByText(/Đăng nhập để chia sẻ đánh giá sao/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('require-login-rating-btn'));
    expect(handleRequireLogin).toHaveBeenCalledTimes(1);
  });

  it('renders rating input when authenticated and user has not rated yet', () => {
    render(<UserRatingActionCard fileId="FIL_1" currentUserScore={null} isAuthenticated={true} />);

    expect(screen.getByTestId('user-rating-action-card')).toBeInTheDocument();
    expect(screen.getByText('Đánh giá của bạn')).toBeInTheDocument();
    expect(screen.getByTestId('submit-rating-btn')).toHaveTextContent('Gửi đánh giá');
    expect(screen.getByTestId('submit-rating-btn')).toBeDisabled(); // disabled until a score is selected
  });

  it('enables submit button and calls upsertRating when star selected and submitted', async () => {
    vi.mocked(ratingService.upsertRating).mockResolvedValueOnce({
      message: 'Đánh giá thành công.',
    });

    const handleRatingSuccess = vi.fn();
    render(
      <UserRatingActionCard
        fileId="FIL_1"
        currentUserScore={null}
        isAuthenticated={true}
        onRatingSuccess={handleRatingSuccess}
      />,
    );

    // Select 5 stars
    await act(async () => {
      fireEvent.click(screen.getByTestId('star-input-5'));
    });

    const submitBtn = screen.getByTestId('submit-rating-btn');
    expect(submitBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(ratingService.upsertRating).toHaveBeenCalledWith({
      fileId: 'FIL_1',
      ratingScore: 5,
    });
    expect(handleRatingSuccess).toHaveBeenCalledWith(5);
  });

  it('renders "Hủy đánh giá của bạn" button when user already rated', () => {
    render(<UserRatingActionCard fileId="FIL_1" currentUserScore={4} isAuthenticated={true} />);

    expect(screen.getByText('Đã đánh giá: 4★')).toBeInTheDocument();
    expect(screen.getByTestId('open-delete-rating-dialog-btn')).toBeInTheDocument();
    expect(screen.getByTestId('submit-rating-btn')).toHaveTextContent('Cập nhật đánh giá');
  });

  it('opens DeleteRatingDialog when "Hủy đánh giá" clicked and confirms deletion', async () => {
    vi.mocked(ratingService.deleteRating).mockResolvedValueOnce({
      message: 'Đã xóa đánh giá thành công.',
    });

    const handleDeleteSuccess = vi.fn();
    render(
      <UserRatingActionCard
        fileId="FIL_1"
        currentUserScore={4}
        isAuthenticated={true}
        onDeleteSuccess={handleDeleteSuccess}
      />,
    );

    // Click "Hủy đánh giá"
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-delete-rating-dialog-btn'));
    });

    // Confirmation dialog should be open
    expect(screen.getByText('Hủy đánh giá của bạn?')).toBeInTheDocument();

    // Click confirm in dialog
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-delete-rating-btn'));
    });

    expect(ratingService.deleteRating).toHaveBeenCalledWith('FIL_1');
    expect(handleDeleteSuccess).toHaveBeenCalledTimes(1);
  });
});
