import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardMenu } from '../DashboardMenu';
import type { DashboardMenuResponse } from '@/features/dashboard/types/dashboard-menu.types';

const menuData: DashboardMenuResponse = {
  groups: [
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
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <DashboardMenu
        menuData={menuData}
        user={{ displayName: 'User1', secondaryText: '465 tài nguyên' }}
        onNavigate={onNavigate}
      />
    </MemoryRouter>,
  );

  return { onNavigate };
}

describe('DashboardMenu', () => {
  it('render nhóm và chức năng trực tiếp từ dữ liệu backend', () => {
    renderMenu();

    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quản lý tài nguyên' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Upload tài nguyên' })).toHaveAttribute(
      'href',
      '/dashboard/resources-manager/upload',
    );
    expect(screen.getByRole('link', { name: 'Tài nguyên của tôi' })).toHaveAttribute('aria-current', 'page');
  });

  it('hiển thị FunctionDescription khi hover hoặc focus vào chức năng', () => {
    renderMenu();
    const uploadLink = screen.getByRole('link', { name: 'Upload tài nguyên' });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(uploadLink);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tải tài liệu mới lên hệ thống');
    fireEvent.mouseLeave(uploadLink);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.focus(uploadLink);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tải tài liệu mới lên hệ thống');
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
