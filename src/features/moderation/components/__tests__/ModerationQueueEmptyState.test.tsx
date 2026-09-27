import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationQueueEmptyState } from '../ModerationQueueEmptyState';

describe('ModerationQueueEmptyState', () => {
  it('render trạng thái hàng đợi trống khi không có filter', () => {
    render(<ModerationQueueEmptyState hasActiveFilters={false} />);

    expect(screen.getByText('Hàng đợi kiểm duyệt đang trống')).toBeInTheDocument();
    expect(screen.getByText(/Tất cả tài liệu đã được thẩm định hoàn tất/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đặt lại bộ lọc' })).not.toBeInTheDocument();
  });

  it('render trạng thái không có kết quả lọc và hiển thị nút Đặt lại bộ lọc khi hasActiveFilters = true', () => {
    const handleReset = vi.fn();
    render(<ModerationQueueEmptyState hasActiveFilters={true} onResetFilters={handleReset} />);

    expect(screen.getByText('Không tìm thấy tài liệu phù hợp')).toBeInTheDocument();
    const resetButton = screen.getByRole('button', { name: 'Đặt lại bộ lọc' });
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
