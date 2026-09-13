import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from '../Breadcrumbs';

describe('Breadcrumbs Component', () => {
  it('renders nothing when there is only one or zero breadcrumb items', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Breadcrumbs />,
          handle: { meta: { breadcrumb: 'Trang chủ' } },
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.queryByRole('navigation', { name: 'Đường dẫn phân cấp' })).not.toBeInTheDocument();
  });

  it('renders accessible breadcrumbs navigation with links and current page', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/appeals',
          handle: { meta: { breadcrumb: 'Khiếu nại' } },
          children: [
            {
              path: 'assigned',
              element: <Breadcrumbs />,
              handle: { meta: { breadcrumb: 'Tiếp nhận khiếu nại' } },
            },
          ],
        },
      ],
      { initialEntries: ['/appeals/assigned'] },
    );

    render(<RouterProvider router={router} />);

    const nav = screen.getByRole('navigation', { name: 'Đường dẫn phân cấp' });
    expect(nav).toBeInTheDocument();

    const parentLink = screen.getByRole('link', { name: 'Khiếu nại' });
    expect(parentLink).toHaveAttribute('href', '/appeals');

    const currentPage = screen.getByText('Tiếp nhận khiếu nại');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });
});
