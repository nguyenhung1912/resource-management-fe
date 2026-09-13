import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppealStatusBadge } from '../AppealStatusBadge';

describe('AppealStatusBadge', () => {
  it('hiển thị đúng nhãn và variant cho trạng thái Pending', () => {
    render(<AppealStatusBadge status="Pending" />);
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });

  it('hiển thị đúng nhãn và variant cho trạng thái Approved', () => {
    render(<AppealStatusBadge status="Approved" />);
    expect(screen.getByText('Đã chấp thuận')).toBeInTheDocument();
  });

  it('hiển thị đúng nhãn và variant cho trạng thái Rejected', () => {
    render(<AppealStatusBadge status="Rejected" />);
    expect(screen.getByText('Bị từ chối')).toBeInTheDocument();
  });
});
