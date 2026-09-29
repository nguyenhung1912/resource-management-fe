import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { APP_PATHS } from '@/constants/path';
import { useAuthStore } from '@/store/authStore';

describe('App (Academic Resource Management Home Page)', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      expiration: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders landing page with hero search and title', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const hero = screen.getByRole('region', { name: 'Lời chào mừng và tìm kiếm học liệu' });
    expect(within(hero).getByRole('heading', { name: 'Cổng Quản lý Tài nguyên Học liệu Số' })).toBeInTheDocument();
    expect(within(hero).getByRole('search')).toBeInTheDocument();
    expect(within(hero).getByRole('button', { name: /Tìm kiếm/i })).toBeInTheDocument();
  });

  it('renders core action shortcuts connecting to main domain workflows', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const quickActionsSection = screen.getByRole('region', { name: 'Lối tắt tính năng cốt lõi' });

    const expectedActions = [
      { name: 'Đăng tải Tài nguyên mới', href: APP_PATHS.RESOURCE_UPLOAD },
      { name: 'Quản lý Tài liệu', href: APP_PATHS.RESOURCES_MANAGER },
      { name: 'Tra cứu Học liệu', href: APP_PATHS.SEARCH },
      { name: 'Kiểm tra Đạo văn AI', href: APP_PATHS.PLAGIARISM_REPORTS },
    ];

    expectedActions.forEach(({ name, href }) => {
      const cardLink = within(quickActionsSection).getByRole('link', { name: new RegExp(name, 'i') });
      expect(cardLink).toHaveAttribute('href', href);
    });
  });

  it('renders academic guidelines and policy section', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Quy chuẩn tải lên & Kiểm duyệt học liệu' })).toBeInTheDocument();
    expect(screen.getByText(/Quyền tác giả:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỷ lệ tương đồng AI:/i)).toBeInTheDocument();
    expect(screen.getByText(/Quy trình khiếu nại:/i)).toBeInTheDocument();
  });
});
