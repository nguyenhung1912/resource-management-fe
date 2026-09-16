import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardHeader } from '../DashboardHeader';

function renderHeader(overrides: Partial<React.ComponentProps<typeof DashboardHeader>> = {}) {
  const props = {
    isMenuOpen: false,
    onToggleMenu: vi.fn(),
    onProfile: vi.fn(),
    onChangePassword: vi.fn(),
    onLogout: vi.fn(),

    user: {
      displayName: 'Username_tx',
      role: 'Role_tx',
    },

    ...overrides,
  };

  render(<DashboardHeader {...props} />);

  return props;
}

describe('DashboardHeader', () => {
  it('uses the Essential light shell and hover color for the dashboard header', () => {
    renderHeader();

    expect(screen.getByRole('banner')).toHaveClass('bg-surface', 'text-text');

    expect(
      screen.getByRole('button', {
        name: 'Mở menu dashboard',
      }),
    ).toHaveClass('hover:bg-background');
  });

  it('hiển thị nhận diện trường và thông tin người dùng', () => {
    renderHeader();

    expect(
      screen.getByRole('banner', {
        name: 'Thanh điều hướng dashboard',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('TRƯỜNG ĐẠI HỌC QUY NHƠN')).toBeInTheDocument();

    expect(screen.getByText('Username_tx')).toBeInTheDocument();

    expect(screen.getByText('Role_tx')).toBeInTheDocument();
  });

  it('gửi yêu cầu mở menu dashboard', () => {
    const handleToggleMenu = vi.fn();

    const { rerender } = render(
      <DashboardHeader
        isMenuOpen={false}
        onToggleMenu={handleToggleMenu}
        onProfile={vi.fn()}
        onChangePassword={vi.fn()}
        onLogout={vi.fn()}
        user={{
          displayName: 'Username_tx',
          role: 'Role_tx',
        }}
      />,
    );

    const menuButton = screen.getByRole('button', {
      name: 'Mở menu dashboard',
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    expect(menuButton).toHaveAttribute('aria-controls', 'dashboard-menu');

    fireEvent.click(menuButton);

    expect(handleToggleMenu).toHaveBeenCalledTimes(1);

    rerender(
      <DashboardHeader
        isMenuOpen
        onToggleMenu={handleToggleMenu}
        onProfile={vi.fn()}
        onChangePassword={vi.fn()}
        onLogout={vi.fn()}
        user={{
          displayName: 'Username_tx',
          role: 'Role_tx',
        }}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Đóng menu dashboard',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('mở menu người dùng khi nhấn avatar', () => {
    renderHeader();

    const userButton = screen.getByRole('button', {
      name: /Username_tx/i,
    });

    fireEvent.click(userButton);

    expect(screen.getByRole('menu')).toBeInTheDocument();

    expect(
      screen.getByRole('menuitem', {
        name: 'Hồ sơ cá nhân',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('menuitem', {
        name: 'Đổi mật khẩu',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('menuitem', {
        name: 'Đăng xuất',
      }),
    ).toBeInTheDocument();
  });

  it('gọi đúng callback từ menu người dùng', () => {
    const onProfile = vi.fn();
    const onChangePassword = vi.fn();
    const onLogout = vi.fn();

    renderHeader({
      onProfile,
      onChangePassword,
      onLogout,
    });

    const userButton = screen.getByRole('button', {
      name: /Username_tx/i,
    });

    fireEvent.click(userButton);

    fireEvent.click(
      screen.getByRole('menuitem', {
        name: 'Hồ sơ cá nhân',
      }),
    );

    expect(onProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(userButton);

    fireEvent.click(
      screen.getByRole('menuitem', {
        name: 'Đổi mật khẩu',
      }),
    );

    expect(onChangePassword).toHaveBeenCalledTimes(1);

    fireEvent.click(userButton);

    fireEvent.click(
      screen.getByRole('menuitem', {
        name: 'Đăng xuất',
      }),
    );

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
