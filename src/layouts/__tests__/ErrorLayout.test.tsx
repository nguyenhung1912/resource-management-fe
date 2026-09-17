import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ErrorLayout } from '../ErrorLayout';

describe('ErrorLayout', () => {
  it('render vùng nội dung lỗi không chứa banner và hiển thị chân trang thương hiệu', () => {
    const router = createMemoryRouter(
      [
        {
          element: <ErrorLayout />,
          children: [
            {
              path: '/404',
              element: <div>Trang 404 mẫu</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/404'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('main', { name: 'Nội dung lỗi' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.getByText('Trang 404 mẫu')).toBeInTheDocument();
    expect(screen.getByText(/Trường Đại học Quy Nhơn\. Hệ thống Quản lý Tài nguyên Học thuật\./i)).toBeInTheDocument();
  });
});
