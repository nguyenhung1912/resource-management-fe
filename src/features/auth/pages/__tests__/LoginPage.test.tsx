import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
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
  it('render giao diện đăng nhập với tiêu đề, Google login và form đăng nhập', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Truy cập hệ thống quản lý tài nguyên')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập với google/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mã sinh viên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^đăng nhập$/i })).toBeInTheDocument();
  });
});
