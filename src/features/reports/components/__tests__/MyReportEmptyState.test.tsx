import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MyReportEmptyState } from '../MyReportEmptyState';

describe('MyReportEmptyState', () => {
  it('hiển thị thông điệp bạn chưa gửi báo cáo nào khi không áp dụng bộ lọc', () => {
    render(<MyReportEmptyState />);

    expect(screen.getByText('Bạn chưa gửi báo cáo vi phạm nào')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /xóa tất cả bộ lọc/i })).not.toBeInTheDocument();
  });

  it('hiển thị thông điệp không tìm thấy báo cáo khi có lọc và hỗ trợ reset', () => {
    const handleReset = vi.fn();

    render(<MyReportEmptyState currentStatus="Pending" onResetFilters={handleReset} />);

    expect(screen.getByText('Không tìm thấy báo cáo phù hợp')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /xóa tất cả bộ lọc/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
