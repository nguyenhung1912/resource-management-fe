import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RatingItemCard } from '../RatingItemCard';
import type { RatingItemResponse } from '../../types/rating.types';

const mockItem: RatingItemResponse = {
  ratingId: 'RAT_01',
  fileId: 'FIL_01',
  uid: 'USR_01',
  fullName: 'Trần Văn Bình',
  roleName: 'Sinh viên',
  ratingScore: 5,
  review: 'Tài liệu rất chi tiết và dễ hiểu.',
  createdAt: '2026-09-24T12:00:00Z',
};

describe('RatingItemCard', () => {
  it('renders user full name, role, review, and initials', () => {
    render(<RatingItemCard item={mockItem} />);

    expect(screen.getByText('Trần Văn Bình')).toBeInTheDocument();
    expect(screen.getByText('Sinh viên')).toBeInTheDocument();
    expect(screen.getByText('TB')).toBeInTheDocument(); // Initials for "Trần Văn Bình"
    expect(screen.getByText('Tài liệu rất chi tiết và dễ hiểu.')).toBeInTheDocument();
  });

  it('renders rating stars with score 5', () => {
    render(<RatingItemCard item={mockItem} />);

    expect(screen.getByTestId('star-display-score')).toHaveTextContent('5.0');
  });
});
