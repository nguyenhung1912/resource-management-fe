import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import { useAuthStore } from '@/store/authStore';

const authenticatedState = {
  user: {
    uid: 'test-lecturer',
    userCode: 'lecturer_test',
    fullName: 'Test Lecturer',
    email: 'lecturer@test.com',
    roleId: 3,
    role: 'Lecturer',
  },
  token: 'valid-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const unauthenticatedState = {
  user: null,
  token: null,
  expiration: null,
  isAuthenticated: false,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

describe('resources manager routes', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });
  it('hiển thị danh sách tài nguyên mẫu và các công cụ quản lý', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCES_MANAGER] });

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
    expect(screen.getByRole('link', { name: 'Tải lên tài nguyên' })).toHaveAttribute('href', APP_PATHS.RESOURCE_UPLOAD);
    expect(screen.getByRole('link', { name: 'Chỉnh sửa Báo cáo thực tập_Final.pdf' })).toHaveAttribute(
      'href',
      APP_PATHS.RESOURCE_EDIT('resource-1'),
    );
  });

  it('mở popup tại route upload và quay về trang cha khi hủy', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCE_UPLOAD] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('dialog', { name: 'Tải lên tài nguyên mới' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quản lý tài nguyên' })).toBeInTheDocument();
  });

  it('mở form chỉnh sửa theo resource id và quay về trang quản lý khi hủy', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [APP_PATHS.RESOURCE_EDIT('resource-1')] });

    render(<RouterProvider router={router} />);

    const dialog = await screen.findByRole('dialog', { name: 'Chỉnh sửa tài nguyên' });
    expect(within(dialog).getByText('Báo cáo thực tập_Final.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
