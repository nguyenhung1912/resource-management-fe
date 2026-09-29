import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { MainLayout } from '@/layouts/MainLayout';
import { useAuthStore } from '@/store/authStore';

describe('MainLayout', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      expiration: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders Header, Footer, and hides Breadcrumbs on home page ("/")', () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          element: <MainLayout />,
          children: [{ index: true, element: <div data-testid="home-content">Nội dung trang chủ</div> }],
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    // Brand and logo
    expect(screen.getByRole('link', { name: /Resource Management/i })).toBeInTheDocument();

    // Nav links
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kho học liệu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tra cứu' })).toBeInTheDocument();

    // Login button when unauthenticated
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();

    // Content rendered
    expect(screen.getByTestId('home-content')).toBeInTheDocument();

    // Breadcrumbs should NOT be rendered on home page
    expect(screen.queryByRole('navigation', { name: 'Đường dẫn phân cấp' })).not.toBeInTheDocument();

    // Footer
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('Trường Đại học Quy Nhơn')).toBeInTheDocument();
  });

  it('renders Breadcrumbs when on a sub-route (e.g. /notifications)', () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          element: <MainLayout />,
          handle: {
            meta: {
              title: 'Trang chủ',
              breadcrumb: 'Trang chủ',
            },
          },
          children: [
            {
              path: 'notifications',
              element: <div data-testid="notifications-content">Trang thông báo</div>,
              handle: {
                meta: {
                  title: 'Thông báo',
                  breadcrumb: 'Thông báo',
                },
              },
            },
          ],
        },
      ],
      { initialEntries: ['/notifications'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('notifications-content')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Đường dẫn phân cấp' })).toBeInTheDocument();
  });

  it('shows "Bảng điều khiển" link and UserDropdown when user is authenticated', () => {
    useAuthStore.setState({
      user: {
        uid: 'USR_001',
        userCode: 'GV001',
        fullName: 'TS. Nguyễn Văn A',
        email: 'nva@qnu.edu.vn',
        roleId: 2,
        role: 'Giảng viên',
      },
      token: 'jwt-token',
      expiration: '2099-12-31T23:59:59Z',
      isAuthenticated: true,
      isLoading: false,
    });

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          element: <MainLayout />,
          children: [{ index: true, element: <div>Home</div> }],
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: 'Bảng điều khiển' })).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đăng nhập/i })).not.toBeInTheDocument();
  });
});
