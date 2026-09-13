import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { appRoutes } from '@/routes';

describe('resources manager routes', () => {
  it('hiển thị empty state tại route quản lý tài nguyên', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/dashboard/resources-manager'] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Tài nguyên của tôi' })).toBeInTheDocument();
    expect(screen.getByText('Bạn chưa tải lên tài nguyên nào.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tải lên tài nguyên' })).toHaveAttribute(
      'href',
      '/dashboard/resources-manager/upload',
    );
  });

  it('mở popup tại route upload và quay về trang cha khi hủy', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/dashboard/resources-manager/upload'] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('dialog', { name: 'Tải lên tài nguyên mới' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard/resources-manager'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tài nguyên của tôi' })).toBeInTheDocument();
  });
});
