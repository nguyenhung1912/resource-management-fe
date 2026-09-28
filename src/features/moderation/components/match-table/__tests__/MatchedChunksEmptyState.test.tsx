import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchedChunksEmptyState } from '../MatchedChunksEmptyState';

describe('MatchedChunksEmptyState', () => {
  it('render trạng thái an toàn không có đoạn trùng', () => {
    render(<MatchedChunksEmptyState type="no-matches" />);

    expect(screen.getByText('Không phát hiện đoạn văn bản trùng lặp đáng kể')).toBeInTheDocument();
  });

  it('render trạng thái lọc không ra kết quả kèm từ khóa tìm kiếm và nút reset', () => {
    const handleReset = vi.fn();
    render(<MatchedChunksEmptyState type="filter-empty" searchTerm="Deep Learning" onResetFilters={handleReset} />);

    expect(screen.getByText('Không tìm thấy đoạn trùng khớp phù hợp')).toBeInTheDocument();
    expect(screen.getByText('"Deep Learning"')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
