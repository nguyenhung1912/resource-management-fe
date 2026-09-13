import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { appRoutes } from '@/routes';

describe('resources manager routes', () => {
  it('hiển thị danh sách tài nguyên mẫu và các công cụ quản lý', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/dashboard/resources-manager'] });

    render(<RouterProvider router={router} />);

    const heading = await screen.findByRole('heading', { name: 'Quản lý tài nguyên' });
    const statistics = screen.getByRole('region', { name: 'Thống kê tài nguyên' });
    const resourceTable = screen.getByRole('table', { name: 'Danh sách tài nguyên đã tải lên' });

    expect(statistics).toHaveTextContent('Đã duyệt856');
    expect(statistics).toHaveTextContent('Chờ duyệt142');
    expect(statistics).toHaveTextContent('Bị từ chối24');
    expect(heading.compareDocumentPosition(statistics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(statistics.compareDocumentPosition(resourceTable) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Báo cáo thực tập_Final.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lọc tài nguyên' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sắp xếp tài nguyên' })).toBeInTheDocument();
    expect(screen.getByRole('banner', { name: 'Thanh điều hướng dashboard' })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: 'Quản lý tài nguyên' })).toBeInTheDocument();
  });
});
