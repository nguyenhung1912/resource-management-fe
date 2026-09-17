import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ForbiddenPage, NotFoundPage, ServerErrorPage, UnauthorizedPage } from '../ErrorPages';

describe('ErrorPages', () => {
  it('render trang 401 Unauthorized', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Không có quyền truy cập' })).toBeInTheDocument();
    expect(screen.getByText('LỖI 401')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toBeInTheDocument();
  });

  it('render trang 403 Forbidden', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Bạn không có quyền truy cập' })).toBeInTheDocument();
    expect(screen.getByText('LỖI 403')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toBeInTheDocument();
  });

  it('render trang 404 NotFound', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByText('LỖI 404')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toBeInTheDocument();
  });

  it('render trang 500 ServerError', () => {
    render(
      <MemoryRouter>
        <ServerErrorPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Đã xảy ra lỗi hệ thống' })).toBeInTheDocument();
    expect(screen.getByText('LỖI 500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toBeInTheDocument();
  });
});
