import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { LoginPage } from '../LoginPage';

vi.mock('@/features/auth/hooks/useLogin', () => ({
  useLogin: () => ({
    error: null,
    isLoading: false,
    handleLogin: vi.fn(),
    handleGoogleLogin: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('render giao diện đăng nhập với logo QNU, tiêu đề, Google login, form đăng nhập và nút quay lại trang chủ', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // Kiểm tra logo trường và liên kết về trang chủ
    const logoLink = screen.getByRole('link', { name: /về trang chủ/i });
    expect(logoLink).toHaveAttribute('href', APP_PATHS.HOME);

    const logoImg = screen.getByAltText('Logo Trường Đại học Quy Nhơn');
    expect(logoImg).toBeInTheDocument();

    // Tiêu đề & nội dung form
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Truy cập hệ thống quản lý tài nguyên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập với google/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mã sinh viên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^đăng nhập$/i })).toBeInTheDocument();

    // Kiểm tra nút quay lại trang chủ trong form
    const backHomeLink = screen.getByRole('link', { name: /quay lại trang chủ/i });
    expect(backHomeLink).toBeInTheDocument();
    expect(backHomeLink).toHaveAttribute('href', APP_PATHS.HOME);
  });
});
