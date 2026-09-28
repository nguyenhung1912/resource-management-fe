import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

describe('App (Guest Landing Page & Auth Forwarding)', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      expiration: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders guest landing page with system operational status when unauthenticated', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const hero = screen.getByRole('region', { name: 'Lời chào mừng và tổng quan hệ thống' });
    expect(within(hero).getByText('Hệ thống hoạt động bình thường')).toBeInTheDocument();
    expect(within(hero).getByRole('heading', { name: 'Cổng Quản lý Tài nguyên Học liệu Số' })).toBeInTheDocument();
    expect(within(hero).getByRole('link', { name: /Tải lên tài nguyên/i })).toHaveAttribute(
      'href',
      APP_PATHS.RESOURCE_UPLOAD,
    );
    expect(within(hero).getByRole('link', { name: /Quản lý tài liệu/i })).toHaveAttribute(
      'href',
      APP_PATHS.RESOURCES_MANAGER,
    );
  });

  it('redirects to APP_PATHS.DASHBOARD when user is logged in', () => {
    useAuthStore.setState({
      user: {
        uid: 'user-123',
        userCode: 'lecturer_qnu',
        fullName: 'TS. Nguyễn Văn Hùng',
        email: 'hung.nguyen@qnu.edu.vn',
        roleId: 2,
        role: 'Giảng viên',
      },
      token: 'mock-token',
      expiration: '2099-12-31T23:59:59Z',
      isAuthenticated: true,
      isLoading: false,
    });

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          element: <App />,
        },
        {
          path: APP_PATHS.DASHBOARD,
          element: <h1>Dashboard Hub</h1>,
        },
      ],
      {
        initialEntries: [APP_PATHS.HOME],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Dashboard Hub' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.DASHBOARD);
  });

  it('renders all 6 quick action cards connecting to main domain workflows', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const quickActionsSection = screen.getByRole('region', { name: 'Lối tắt tính năng chính' });

    const expectedActions = [
      { name: 'Quản lý Tài nguyên', href: APP_PATHS.RESOURCES_MANAGER },
      { name: 'Tải lên Tài nguyên mới', href: APP_PATHS.RESOURCE_UPLOAD },
      { name: 'Khiếu nại của tôi', href: APP_PATHS.APPEALS },
      { name: 'Tiếp nhận Khiếu nại', href: APP_PATHS.ASSIGNED_APPEALS },
      { name: 'Báo cáo Vi phạm', href: APP_PATHS.REPORTS_MANAGER },
      { name: 'Báo cáo Đạo văn AI', href: APP_PATHS.PLAGIARISM_REPORTS },
    ];

    expectedActions.forEach(({ name, href }) => {
      const cardLink = within(quickActionsSection).getByRole('link', { name: new RegExp(name, 'i') });
      expect(cardLink).toHaveAttribute('href', href);
    });
  });

  it('renders platform metrics and guideline sections', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tài nguyên học liệu')).toBeInTheDocument();
    expect(screen.getByText('Thời gian phản hồi')).toBeInTheDocument();
    expect(screen.getByText('Kiểm duyệt tự động AI')).toBeInTheDocument();
    expect(screen.getByText('Quy chuẩn tải lên & Kiểm duyệt học liệu')).toBeInTheDocument();
  });
});
