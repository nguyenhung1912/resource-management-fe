import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RatingList } from '../RatingList';
import type { RatingItemResponse } from '../../types/rating.types';

const mockItems: RatingItemResponse[] = [
  {
    ratingId: 'RAT_01',
    fileId: 'FIL_01',
    uid: 'USR_01',
    fullName: 'Lê Thị Thu',
    roleName: 'Học viên',
    ratingScore: 5,
    createdAt: '2026-09-24T12:00:00Z',
  },
  {
    ratingId: 'RAT_02',
    fileId: 'FIL_01',
    uid: 'USR_02',
    fullName: 'Phạm Minh Tuấn',
    roleName: 'Giảng viên',
    ratingScore: 4,
    createdAt: '2026-09-25T14:00:00Z',
  },
];

describe('RatingList', () => {
  it('renders rating items when items array is not empty', () => {
    render(
      <RatingList
        items={mockItems}
        totalItems={2}
        pageIndex={1}
        pageSize={10}
        totalPages={1}
        isLoading={false}
        selectedStar={null}
        onPageChange={vi.fn()}
        onSelectStar={vi.fn()}
      />,
    );

    expect(screen.getByText('Lê Thị Thu')).toBeInTheDocument();
    expect(screen.getByText('Phạm Minh Tuấn')).toBeInTheDocument();
  });

  it('renders empty state when items array is empty and not loading', () => {
    render(
      <RatingList
        items={[]}
        totalItems={0}
        pageIndex={1}
        pageSize={10}
        totalPages={0}
        isLoading={false}
        selectedStar={null}
        onPageChange={vi.fn()}
        onSelectStar={vi.fn()}
      />,
    );

    expect(screen.getByText('Chưa có lượt đánh giá nào')).toBeInTheDocument();
  });

  it('renders specific empty state when filtered star has 0 items', () => {
    render(
      <RatingList
        items={[]}
        totalItems={0}
        pageIndex={1}
        pageSize={10}
        totalPages={0}
        isLoading={false}
        selectedStar={1}
        onPageChange={vi.fn()}
        onSelectStar={vi.fn()}
      />,
    );

    expect(screen.getByText('Chưa có đánh giá 1 sao nào')).toBeInTheDocument();
  });

  it('renders skeleton when isLoading is true and items is empty', () => {
    render(
      <RatingList
        items={[]}
        totalItems={0}
        pageIndex={1}
        pageSize={10}
        totalPages={0}
        isLoading={true}
        selectedStar={null}
        onPageChange={vi.fn()}
        onSelectStar={vi.fn()}
      />,
    );

    expect(screen.getByTestId('rating-list-skeleton')).toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    const handlePageChange = vi.fn();
    render(
      <RatingList
        items={mockItems}
        totalItems={20}
        pageIndex={1}
        pageSize={10}
        totalPages={2}
        isLoading={false}
        selectedStar={null}
        onPageChange={handlePageChange}
        onSelectStar={vi.fn()}
      />,
    );

    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
