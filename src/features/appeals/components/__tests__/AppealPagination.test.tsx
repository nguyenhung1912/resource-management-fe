import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealPagination } from '../AppealPagination';

describe('AppealPagination', () => {
  it('không render khi chỉ có 1 trang và số lượng nhỏ hơn pageSize', () => {
    const { container } = render(
      <AppealPagination currentPage={1} totalPages={1} totalCount={5} pageSize={10} onPageChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('hiển thị thông tin dải số lượng và các nút trang', () => {
    render(<AppealPagination currentPage={1} totalPages={3} totalCount={25} pageSize={10} onPageChange={vi.fn()} />);

    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Trang 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trang 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trang 3/i })).toBeInTheDocument();
  });

  it('gọi callback onPageChange khi nhấn trang tiếp theo', () => {
    const handlePageChange = vi.fn();
    render(
      <AppealPagination currentPage={1} totalPages={3} totalCount={25} pageSize={10} onPageChange={handlePageChange} />,
    );

    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
    fireEvent.click(nextBtn);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
