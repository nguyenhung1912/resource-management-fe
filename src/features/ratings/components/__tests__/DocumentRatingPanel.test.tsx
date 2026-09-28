import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentRatingPanel } from '../DocumentRatingPanel';
import type { PagedRatingResponse, RatingSummaryResponse } from '../../types/rating.types';
import { ratingService } from '@/services/ratingService';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/ratingService', () => ({
  ratingService: {
    getRatingSummary: vi.fn(),
    getRatingsList: vi.fn(),
    upsertRating: vi.fn(),
    deleteRating: vi.fn(),
  },
}));

const mockSummary: RatingSummaryResponse = {
  fileId: 'FIL_TEST_01',
  averageRating: 4.5,
  totalRatings: 2,
  starDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
  currentUserRating: 5,
};

const mockRatings: PagedRatingResponse = {
  items: [
    {
      ratingId: 'RAT_01',
      fileId: 'FIL_TEST_01',
      uid: 'USR_01',
      fullName: 'Trần Văn A',
      roleName: 'Sinh viên',
      ratingScore: 5,
      createdAt: '2026-09-25T10:00:00Z',
    },
  ],
  totalItems: 1,
  pageIndex: 1,
  pageSize: 10,
  totalPages: 1,
};

describe('DocumentRatingPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        uid: 'USR_01',
        fullName: 'Trần Văn A',
        email: 'test@example.com',
        userCode: 'test',
        roleId: 1,
        role: 'User',
      },
    });
  });

  it('renders summary card, user rating action card, and rating list', () => {
    render(<DocumentRatingPanel fileId="FIL_TEST_01" initialSummary={mockSummary} initialRatings={mockRatings} />);

    expect(screen.getByTestId('document-rating-panel')).toBeInTheDocument();
    expect(screen.getByTestId('summary-average-score')).toHaveTextContent('4.5');
    expect(screen.getByTestId('user-rating-action-card')).toBeInTheDocument();
    expect(screen.getByTestId('rating-list-container')).toBeInTheDocument();
    expect(screen.getByText('Trần Văn A')).toBeInTheDocument();
  });

  it('handles rating update workflow and refreshes data', async () => {
    vi.mocked(ratingService.upsertRating).mockResolvedValueOnce({
      message: 'Cập nhật thành công',
    });
    vi.mocked(ratingService.getRatingSummary).mockResolvedValueOnce({
      ...mockSummary,
      averageRating: 4.0,
      currentUserRating: 4,
    });
    vi.mocked(ratingService.getRatingsList).mockResolvedValueOnce({
      ...mockRatings,
      items: [{ ...mockRatings.items[0], ratingScore: 4 }],
    });

    render(<DocumentRatingPanel fileId="FIL_TEST_01" initialSummary={mockSummary} initialRatings={mockRatings} />);

    // Select 4 stars
    await act(async () => {
      fireEvent.click(screen.getByTestId('star-input-4'));
    });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-rating-btn'));
    });

    expect(ratingService.upsertRating).toHaveBeenCalledWith({
      fileId: 'FIL_TEST_01',
      ratingScore: 4,
    });
    expect(ratingService.getRatingSummary).toHaveBeenCalledWith('FIL_TEST_01');
    expect(ratingService.getRatingsList).toHaveBeenCalled();
  });

  it('handles rating deletion workflow and refreshes data', async () => {
    vi.mocked(ratingService.deleteRating).mockResolvedValueOnce({
      message: 'Đã xóa thành công',
    });
    vi.mocked(ratingService.getRatingSummary).mockResolvedValueOnce({
      ...mockSummary,
      currentUserRating: null,
      totalRatings: 1,
    });
    vi.mocked(ratingService.getRatingsList).mockResolvedValueOnce({
      items: [],
      totalItems: 0,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 0,
    });

    render(<DocumentRatingPanel fileId="FIL_TEST_01" initialSummary={mockSummary} initialRatings={mockRatings} />);

    // Open delete dialog
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-delete-rating-dialog-btn'));
    });

    // Confirm deletion
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-delete-rating-btn'));
    });

    expect(ratingService.deleteRating).toHaveBeenCalledWith('FIL_TEST_01');
    expect(ratingService.getRatingSummary).toHaveBeenCalledWith('FIL_TEST_01');
    expect(ratingService.getRatingsList).toHaveBeenCalled();
  });

  it('triggers star filtering when clicking a distribution bar', async () => {
    vi.mocked(ratingService.getRatingsList).mockResolvedValueOnce({
      items: [],
      totalItems: 0,
      pageIndex: 1,
      pageSize: 10,
      totalPages: 0,
    });

    render(<DocumentRatingPanel fileId="FIL_TEST_01" initialSummary={mockSummary} initialRatings={mockRatings} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('star-dist-row-5'));
    });

    expect(ratingService.getRatingsList).toHaveBeenCalledWith('FIL_TEST_01', {
      star: 5,
      pageIndex: 1,
      pageSize: 10,
    });
  });
});
