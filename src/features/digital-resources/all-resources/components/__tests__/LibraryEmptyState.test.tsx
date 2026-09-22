import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LibraryEmptyState } from '../LibraryEmptyState';

describe('LibraryEmptyState', () => {
  it('render thông báo không tìm thấy tài liệu và nút đặt lại bộ lọc', () => {
    const handleReset = vi.fn();
    render(<LibraryEmptyState onResetFilters={handleReset} hasFilters={true} />);

    expect(screen.getByText('Không tìm thấy tài liệu trong thư viện')).toBeInTheDocument();
    expect(screen.getByText(/Không có giáo trình, khóa luận hoặc đề tài nào khớp với bộ lọc/i)).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /đặt lại tất cả bộ lọc tìm kiếm/i });
    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('ẩn nút đặt lại bộ lọc khi hasFilters là false', () => {
    render(<LibraryEmptyState onResetFilters={vi.fn()} hasFilters={false} />);

    expect(screen.getByText('Thư viện hiện chưa có tài liệu nào trong danh mục này.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
