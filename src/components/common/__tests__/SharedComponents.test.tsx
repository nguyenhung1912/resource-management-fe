import { fireEvent, render, screen } from '@testing-library/react';
import { Clock } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { AlertBanner } from '../AlertBanner';
import { Pagination } from '../Pagination';
import { StatCard } from '../StatCard';
import { StatCardsGroup } from '../StatCardsGroup';

describe('Pagination component', () => {
  it('render đúng số trang và kích hoạt onPageChange khi click', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalCount={50}
        pageSize={10}
        itemLabel="khiếu nại"
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText(/Hiển thị/)).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText(/khiếu nại/)).toBeInTheDocument();

    const page3Btn = screen.getByRole('button', { name: 'Trang 3' });
    fireEvent.click(page3Btn);
    expect(handlePageChange).toHaveBeenCalledWith(3);

    const prevBtn = screen.getByRole('button', { name: 'Trang trước' });
    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('ẩn phân trang khi tổng số trang <= 1 và dữ liệu nằm trong 1 trang', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} totalCount={5} pageSize={10} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('StatCard & StatCardsGroup components', () => {
  it('render đầy đủ số liệu và kích hoạt callback khi bấm chọn', () => {
    const handleClick = vi.fn();
    render(
      <StatCardsGroup columns={4}>
        <StatCard
          label="Đang chờ duyệt"
          value={142}
          unit="đơn"
          icon={Clock}
          colorVariant="warning"
          isSelected
          onClick={handleClick}
        />
      </StatCardsGroup>,
    );

    expect(screen.getByText('Đang chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('đơn')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('AlertBanner component', () => {
  it('render thông báo thành công và gọi hàm onClose khi tắt', () => {
    const handleClose = vi.fn();
    render(
      <AlertBanner type="success" title="Thành công" message="Thao tác đã được thực hiện" onClose={handleClose} />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Thành công')).toBeInTheDocument();
    expect(screen.getByText('Thao tác đã được thực hiện')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Đóng thông báo' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('render role alert đối với thông báo lỗi (danger)', () => {
    render(<AlertBanner type="danger" message="Đã xảy ra lỗi máy chủ" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Đã xảy ra lỗi máy chủ')).toBeInTheDocument();
  });
});
