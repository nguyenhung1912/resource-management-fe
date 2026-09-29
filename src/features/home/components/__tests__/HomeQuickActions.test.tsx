import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomeQuickActions } from '../HomeQuickActions';
import { APP_PATHS } from '@/constants/path';

describe('HomeQuickActions', () => {
  it('renders all core action shortcut links and university policy notice', () => {
    render(
      <MemoryRouter>
        <HomeQuickActions />
      </MemoryRouter>,
    );

    // Section title
    expect(screen.getByRole('heading', { name: 'Tính năng & Điều hướng nhanh' })).toBeInTheDocument();

    const quickActionsSection = screen.getByRole('region', { name: 'Lối tắt tính năng cốt lõi' });

    // Check all 4 core shortcuts
    const expectedActions = [
      { name: 'Đăng tải Tài nguyên mới', href: APP_PATHS.RESOURCE_UPLOAD },
      { name: 'Quản lý Tài liệu', href: APP_PATHS.RESOURCES_MANAGER },
      { name: 'Tra cứu Học liệu', href: APP_PATHS.SEARCH },
      { name: 'Kiểm tra Đạo văn AI', href: APP_PATHS.PLAGIARISM_REPORTS },
    ];

    expectedActions.forEach(({ name, href }) => {
      const link = within(quickActionsSection).getByRole('link', { name: new RegExp(name, 'i') });
      expect(link).toHaveAttribute('href', href);
    });

    // Institutional Policy Card
    expect(screen.getByRole('heading', { name: 'Quy chuẩn tải lên & Kiểm duyệt học liệu' })).toBeInTheDocument();
    expect(screen.getByText(/Quyền tác giả:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỷ lệ tương đồng AI:/i)).toBeInTheDocument();
    expect(screen.getByText(/Quy trình khiếu nại:/i)).toBeInTheDocument();
  });
});
