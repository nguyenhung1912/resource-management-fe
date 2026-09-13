import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealEmptyState } from '../AppealEmptyState';

describe('AppealEmptyState', () => {
  it('hiển thị thông điệp mặc định khi chưa có khiếu nại nào', () => {
    render(<AppealEmptyState />);
    expect(screen.getByText('Chưa có đơn khiếu nại nào')).toBeInTheDocument();
  });

  it('hiển thị thông điệp khi lọc trạng thái Pending', () => {
    render(<AppealEmptyState currentStatus="Pending" />);
    expect(screen.getByText('Không có khiếu nại chờ xử lý')).toBeInTheDocument();
  });

  it('hiển thị thông điệp tìm kiếm và nút đặt lại bộ lọc', () => {
    const handleReset = vi.fn();
    render(<AppealEmptyState searchQuery="Machine Learning" onResetFilter={handleReset} />);

    expect(screen.getByText('Không tìm thấy kết quả phù hợp')).toBeInTheDocument();
    expect(screen.getByText(/Machine Learning/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
