import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardHeader } from '../DashboardHeader';

describe('DashboardHeader', () => {
  it('uses the Essential light shell and hover color for the dashboard header', () => {
    render(
      <DashboardHeader
        isMenuOpen={false}
        onToggleMenu={vi.fn()}
        user={{ displayName: 'Username_tx', role: 'Role_tx' }}
      />,
    );

    expect(screen.getByRole('banner')).toHaveClass('bg-surface', 'text-text');
    expect(screen.getByRole('button')).toHaveClass('hover:bg-background');
  });

  it('hiển thị nhận diện trường và thông tin người dùng', () => {
    render(
      <DashboardHeader
        isMenuOpen={false}
        onToggleMenu={vi.fn()}
        user={{ displayName: 'Username_tx', role: 'Role_tx' }}
      />,
    );

    expect(screen.getByRole('banner', { name: 'Thanh điều hướng dashboard' })).toBeInTheDocument();
    expect(screen.getByText('TRƯỜNG ĐẠI HỌC QUY NHƠN')).toBeInTheDocument();
    expect(screen.getByText('Username_tx')).toBeInTheDocument();
    expect(screen.getByText('Role_tx')).toBeInTheDocument();
  });

  it('gửi yêu cầu mở menu và công bố đúng trạng thái cho công nghệ hỗ trợ', () => {
    const handleToggleMenu = vi.fn();
    const { rerender } = render(
      <DashboardHeader
        isMenuOpen={false}
        onToggleMenu={handleToggleMenu}
        user={{ displayName: 'Username_tx', role: 'Role_tx' }}
      />,
    );
    const menuButton = screen.getByRole('button', { name: 'Mở menu dashboard' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls', 'dashboard-menu');
    fireEvent.click(menuButton);
    expect(handleToggleMenu).toHaveBeenCalledTimes(1);

    rerender(
      <DashboardHeader
        isMenuOpen
        onToggleMenu={handleToggleMenu}
        user={{ displayName: 'Username_tx', role: 'Role_tx' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Đóng menu dashboard' })).toHaveAttribute('aria-expanded', 'true');
  });
});
