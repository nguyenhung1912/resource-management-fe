import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeCategoryFilter } from '../HomeCategoryFilter';
import type { LookupItem } from '@/features/digital-resources/source-code/types/source-code.types';

describe('HomeCategoryFilter', () => {
  const mockCategories: LookupItem[] = [
    { id: '1', name: 'Báo cáo NCKH' },
    { id: '2', name: 'Khóa luận tốt nghiệp' },
    { id: '3', name: 'Giáo trình / Bài giảng' },
  ];

  it('renders "Tất cả học liệu" along with provided category pills', () => {
    const handleSelect = vi.fn();
    render(<HomeCategoryFilter categories={mockCategories} selectedCategoryId="all" onSelectCategory={handleSelect} />);

    expect(screen.getByRole('tab', { name: 'Tất cả học liệu' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Báo cáo NCKH' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Khóa luận tốt nghiệp' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Giáo trình / Bài giảng' })).toBeInTheDocument();
  });

  it('marks selected tab with aria-selected="true"', () => {
    const handleSelect = vi.fn();
    render(<HomeCategoryFilter categories={mockCategories} selectedCategoryId="2" onSelectCategory={handleSelect} />);

    const activeTab = screen.getByRole('tab', { name: 'Khóa luận tốt nghiệp' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');

    const inactiveTab = screen.getByRole('tab', { name: 'Tất cả học liệu' });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectCategory when a pill is clicked', () => {
    const handleSelect = vi.fn();
    render(<HomeCategoryFilter categories={mockCategories} selectedCategoryId="all" onSelectCategory={handleSelect} />);

    const nckhTab = screen.getByRole('tab', { name: 'Báo cáo NCKH' });
    fireEvent.click(nckhTab);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
