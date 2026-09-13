import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';

vi.mock('@/services/signalRService', () => ({
  default: {
    start: vi.fn().mockResolvedValue(undefined),
    onReceiveNotification: vi.fn(() => vi.fn()),
    onUnreadCountChanged: vi.fn(() => vi.fn()),
  },
}));

afterEach(() => {
  cleanup();
});

describe('error routes', () => {
  const errorCases = [
    { path: '/401', code: '401', title: 'Không có quyền truy cập' },
    { path: '/403', code: '403', title: 'Bạn không có quyền truy cập' },
    { path: '/404', code: '404', title: 'Không tìm thấy trang' },
    { path: '/500', code: '500', title: 'Đã xảy ra lỗi hệ thống' },
  ] as const;

  it.each(errorCases)('hiển thị trang lỗi $code trong ErrorLayout', async ({ path, code, title }) => {
    await router.navigate(path);

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('main', { name: 'Nội dung lỗi' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByText('Resource Management')).not.toBeInTheDocument();
    expect(screen.getByText(`LỖI ${code}`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /về trang chủ/i })).toHaveAttribute('href', '/');
  });

  it('dùng trang 404 cho URL không được khai báo', async () => {
    await router.navigate('/duong-dan-khong-ton-tai');

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('main', { name: 'Nội dung lỗi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
  });
});
