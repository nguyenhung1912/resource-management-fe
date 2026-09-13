import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealFilterTabs } from '../AppealFilterTabs';

describe('AppealFilterTabs', () => {
  it('hiển thị danh sách các tabs và số lượng thống kê', () => {
    render(
      <AppealFilterTabs
        searchQuery=""
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        stats={{ total: 10, pending: 2, approved: 5, rejected: 3 }}
      />,
    );

    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('Đã chấp thuận')).toBeInTheDocument();
    expect(screen.getByText('Bị từ chối')).toBeInTheDocument();
  });

  it('gọi callback onStatusChange khi nhấp vào tab', () => {
    const handleStatusChange = vi.fn();
    render(<AppealFilterTabs searchQuery="" onSearchChange={vi.fn()} onStatusChange={handleStatusChange} />);

    fireEvent.click(screen.getByText('Chờ duyệt'));
    expect(handleStatusChange).toHaveBeenCalledWith('Pending');

    fireEvent.click(screen.getByText('Tất cả'));
    expect(handleStatusChange).toHaveBeenCalledWith(undefined);
  });

  it('gọi callback onSearchChange khi gõ từ khóa', () => {
    const handleSearchChange = vi.fn();
    render(<AppealFilterTabs searchQuery="" onSearchChange={handleSearchChange} onStatusChange={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Tìm theo mã, tên tài liệu/i);
    fireEvent.change(input, { target: { value: 'Báo cáo tốt nghiệp' } });
    expect(handleSearchChange).toHaveBeenCalledWith('Báo cáo tốt nghiệp');
  });

  it('xóa từ khóa tìm kiếm khi nhấn nút X', () => {
    const handleSearchChange = vi.fn();
    render(<AppealFilterTabs searchQuery="Toán" onSearchChange={handleSearchChange} onStatusChange={vi.fn()} />);

    const clearBtn = screen.getByRole('button', { name: /Xóa từ khóa tìm kiếm/i });
    fireEvent.click(clearBtn);
    expect(handleSearchChange).toHaveBeenCalledWith('');
  });
});
