import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchedChunksToolbar } from '../MatchedChunksToolbar';

describe('MatchedChunksToolbar', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    activeRiskFilter: 'all' as const,
    onRiskFilterChange: vi.fn(),
    sortOption: 'similarity-desc' as const,
    onSortChange: vi.fn(),
    totalCount: 10,
    filteredCount: 5,
    riskCounts: { danger: 3, warning: 2, safe: 5 },
  };

  it('render thông số số lượng và các nút lọc', () => {
    render(<MatchedChunksToolbar {...defaultProps} />);

    expect(screen.getByText(/Chi tiết các đoạn trùng khớp \(10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nguy cơ cao/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cần lưu ý/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tương đồng thấp/i })).toBeInTheDocument();
  });

  it('gọi onSearchChange khi người dùng gõ vào ô tìm kiếm', () => {
    const handleSearchChange = vi.fn();
    render(<MatchedChunksToolbar {...defaultProps} onSearchChange={handleSearchChange} />);

    const searchInput = screen.getByLabelText('Tìm kiếm trong các đoạn trùng lặp');
    fireEvent.change(searchInput, { target: { value: 'máy học' } });

    expect(handleSearchChange).toHaveBeenCalledWith('máy học');
  });

  it('gọi onRiskFilterChange khi nhấp vào nút lọc nguy cơ', () => {
    const handleFilterChange = vi.fn();
    render(<MatchedChunksToolbar {...defaultProps} onRiskFilterChange={handleFilterChange} />);

    const dangerBtn = screen.getByRole('button', { name: /Nguy cơ cao/i });
    fireEvent.click(dangerBtn);

    expect(handleFilterChange).toHaveBeenCalledWith('danger');
  });

  it('gọi onSortChange khi chọn tùy chọn sắp xếp', () => {
    const handleSortChange = vi.fn();
    render(<MatchedChunksToolbar {...defaultProps} onSortChange={handleSortChange} />);

    const sortSelect = screen.getByLabelText('Sắp xếp danh sách đoạn trùng');
    fireEvent.change(sortSelect, { target: { value: 'similarity-asc' } });

    expect(handleSortChange).toHaveBeenCalledWith('similarity-asc');
  });
});
