import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportStatusBadge } from '../ReportStatusBadge';

describe('ReportStatusBadge', () => {
  it('hiển thị đúng nhãn cho trạng thái Pending', () => {
    render(<ReportStatusBadge status="Pending" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Chờ xử lý');
    expect(badge).toHaveAttribute('aria-label', 'Trạng thái: Chờ xử lý');
  });

  it('hiển thị đúng nhãn cho trạng thái InProgress', () => {
    render(<ReportStatusBadge status="InProgress" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Đang thẩm tra');
    expect(badge).toHaveAttribute('aria-label', 'Trạng thái: Đang thẩm tra');
  });

  it('hiển thị đúng nhãn cho trạng thái Resolved', () => {
    render(<ReportStatusBadge status="Resolved" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Đã giải quyết');
    expect(badge).toHaveAttribute('aria-label', 'Trạng thái: Đã giải quyết');
  });

  it('hiển thị đúng nhãn cho trạng thái Rejected', () => {
    render(<ReportStatusBadge status="Rejected" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Bác bỏ');
    expect(badge).toHaveAttribute('aria-label', 'Trạng thái: Bác bỏ');
  });

  it('hiển thị nhãn mặc định khi trạng thái không xác định', () => {
    render(<ReportStatusBadge status="UNKNOWN_STATUS" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Không xác định');
  });
});
