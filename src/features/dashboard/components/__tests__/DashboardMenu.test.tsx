import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardMenu } from '../DashboardMenu';
import type { DashboardMenuResponse } from '@/features/dashboard/types/dashboard-menu.types';

const menuData: DashboardMenuResponse = {
  groups: [
    {
      groupId: 'personal',
      groupName: 'Trang cá nhân',
      functions: [
        {
          functionId: 'homepage',
          functionName: 'Trang chủ',
          functionUrl: '/dashboard',
          functionDescription: 'Quay về trang chủ dashboard',
        },
      ],
    },
    {
      groupId: 'resource-management',
      groupName: 'Quản lý tài nguyên',
      functions: [
        {
          functionId: 'upload-resource',
          functionName: 'Upload tài nguyên',
          functionUrl: '/dashboard/resources-manager/upload',
          functionDescription: 'Tải tài liệu mới lên hệ thống',
        },
        {
          functionId: 'my-resources',
          functionName: 'Tài nguyên của tôi',
          functionUrl: '/dashboard/resources-manager',
          functionDescription: null,
        },
      ],
    },
  ],
};

function renderMenu(initialPath = '/dashboard/resources-manager', onNavigate = vi.fn()) {
  const renderResult = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <DashboardMenu
        menuData={menuData}
        user={{ displayName: 'User1', secondaryText: '465 tài nguyên' }}
        onNavigate={onNavigate}
      />
    </MemoryRouter>,
  );

  return { onNavigate, ...renderResult };
}

describe('DashboardMenu', () => {
  it('hiển thị Trang chủ với icon Home và chỉ active tại /dashboard', () => {
    const { unmount } = renderMenu('/dashboard');
    const homepageLink = screen.getByRole('link', { name: 'Trang chủ' });

    expect(homepageLink).toHaveAttribute('href', '/dashboard');
    expect(homepageLink).toHaveAttribute('aria-current', 'page');
    expect(homepageLink.querySelector('svg')).toHaveClass('lucide-house');

    unmount();
    renderMenu('/dashboard/resources-manager');

    expect(screen.getByRole('link', { name: 'Trang chủ' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Trang cá nhân' })).not.toHaveClass('bg-primary/10');
  });

  it('uses Essential UI group headers and active route styles', () => {
    renderMenu();

    expect(screen.getByRole('navigation', { name: 'Menu dashboard' })).toHaveClass(
      'bg-surface',
      'text-text',
      'dashboard-menu-scrollbar',
    );
    expect(screen.getByRole('button', { name: 'Quản lý tài nguyên' })).toHaveClass('bg-primary/10', 'text-primary');
    expect(screen.getByRole('link', { name: 'Upload tài nguyên' })).toHaveClass('hover:bg-neutral-100');
    expect(screen.getByRole('link', { name: 'Tài nguyên của tôi' })).toHaveClass('bg-primary', 'text-white');
  });

  it('render nhóm và chức năng trực tiếp từ dữ liệu backend', () => {
    renderMenu();

    expect(screen.getByRole('img', { name: 'Logo Trường Đại học Quy Nhơn' })).toBeInTheDocument();
    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quản lý tài nguyên' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Upload tài nguyên' })).toHaveAttribute(
      'href',
      '/dashboard/resources-manager/upload',
    );
    expect(screen.getByRole('link', { name: 'Tài nguyên của tôi' })).toHaveAttribute('aria-current', 'page');
  });

  it('không hiển thị tooltip khi hover nhưng vẫn cung cấp mô tả cho trình đọc màn hình', () => {
    renderMenu();
    const uploadLink = screen.getByRole('link', { name: 'Upload tài nguyên' });

    expect(uploadLink).toHaveAccessibleDescription('Tải tài liệu mới lên hệ thống');
    fireEvent.mouseEnter(uploadLink);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    fireEvent.mouseLeave(uploadLink);
    fireEvent.focus(uploadLink);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    expect(uploadLink).toHaveAccessibleDescription('Tải tài liệu mới lên hệ thống');
  });

  it('đóng nhóm và ẩn các chức năng khi nhấn tiêu đề nhóm', () => {
    renderMenu();
    const groupButton = screen.getByRole('button', { name: 'Quản lý tài nguyên' });

    fireEvent.click(groupButton);

    expect(groupButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Upload tài nguyên' })).not.toBeInTheDocument();
  });

  it('thông báo cho layout sau khi người dùng điều hướng', () => {
    const handleNavigate = vi.fn();
    renderMenu('/dashboard', handleNavigate);

    fireEvent.click(screen.getByRole('link', { name: 'Tài nguyên của tôi' }));

    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
