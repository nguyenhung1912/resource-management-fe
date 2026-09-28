import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RatingSummaryCard } from '../RatingSummaryCard';
import type { RatingSummaryResponse } from '../../types/rating.types';

const mockSummary: RatingSummaryResponse = {
  fileId: 'FIL_TEST',
  averageRating: 4.6,
  totalRatings: 10,
  starDistribution: {
    1: 0,
    2: 1,
    3: 1,
    4: 3,
    5: 5,
  },
  currentUserRating: 5,
};

describe('RatingSummaryCard', () => {
  it('renders average score and total ratings correctly', () => {
    render(<RatingSummaryCard summary={mockSummary} />);

    expect(screen.getByTestId('summary-average-score')).toHaveTextContent('4.6');
    expect(screen.getByTestId('summary-total-ratings')).toHaveTextContent('10');
  });

  it('renders distribution bars for 5, 4, 3, 2, 1 stars with correct counts', () => {
    render(<RatingSummaryCard summary={mockSummary} />);

    expect(screen.getByTestId('star-dist-count-5')).toHaveTextContent('5');
    expect(screen.getByTestId('star-dist-count-4')).toHaveTextContent('3');
    expect(screen.getByTestId('star-dist-count-3')).toHaveTextContent('1');
    expect(screen.getByTestId('star-dist-count-2')).toHaveTextContent('1');
    expect(screen.getByTestId('star-dist-count-1')).toHaveTextContent('0');

    // 5 stars = 5 / 10 = 50%
    expect(screen.getByTestId('star-dist-bar-5')).toHaveStyle({ width: '50%' });
    // 4 stars = 3 / 10 = 30%
    expect(screen.getByTestId('star-dist-bar-4')).toHaveStyle({ width: '30%' });
  });

  it('triggers onSelectStar when clicking on a star row', () => {
    const handleSelectStar = vi.fn();
    render(<RatingSummaryCard summary={mockSummary} onSelectStar={handleSelectStar} />);

    fireEvent.click(screen.getByTestId('star-dist-row-5'));
    expect(handleSelectStar).toHaveBeenCalledWith(5);
  });

  it('toggles filter off if clicking on already selected star', () => {
    const handleSelectStar = vi.fn();
    render(<RatingSummaryCard summary={mockSummary} selectedStar={5} onSelectStar={handleSelectStar} />);

    fireEvent.click(screen.getByTestId('star-dist-row-5'));
    expect(handleSelectStar).toHaveBeenCalledWith(null);
  });

  it('renders zero ratings state message when totalRatings is 0', () => {
    const emptySummary: RatingSummaryResponse = {
      fileId: 'FIL_EMPTY',
      averageRating: 0,
      totalRatings: 0,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      currentUserRating: null,
    };

    render(<RatingSummaryCard summary={emptySummary} />);

    expect(screen.getByTestId('summary-average-score')).toHaveTextContent('0.0');
    expect(screen.getByTestId('summary-total-ratings')).toHaveTextContent('0');
    expect(screen.getByText(/Tài liệu này chưa có đánh giá nào/i)).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<RatingSummaryCard summary={null} isLoading />);

    expect(screen.getByTestId('rating-summary-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('rating-summary-card')).not.toBeInTheDocument();
  });
});
