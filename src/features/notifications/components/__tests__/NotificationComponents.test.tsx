import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationHeader } from '../NotificationHeader';
import { NotificationItem } from '../NotificationItem';
import { NotificationTabs } from '../NotificationTabs';
import type { NotificationItemResponse } from '@/features/notifications/types/notification.types';

describe('NotificationHeader', () => {
  it('hiển thị tiêu đề và số lượng thông báo mới', () => {
    render(<NotificationHeader unreadCount={4} onMarkAllAsRead={vi.fn()} />);

    expect(screen.getByText('Thông báo')).toBeInTheDocument();
    expect(screen.getByText(/4 mới/i)).toBeInTheDocument();
  });

  it('vô hiệu hóa nút Đã đọc tất cả khi không có thông báo chưa đọc', () => {
    const handleMarkAll = vi.fn();
    render(<NotificationHeader unreadCount={0} onMarkAllAsRead={handleMarkAll} />);

    const button = screen.getByRole('button', { name: /đã đọc tất cả/i });
    expect(button).toBeDisabled();
  });

  it('gọi onMarkAllAsRead khi người dùng click', () => {
    const handleMarkAll = vi.fn();
    render(<NotificationHeader unreadCount={3} onMarkAllAsRead={handleMarkAll} />);

    const button = screen.getByRole('button', { name: /đã đọc tất cả/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(handleMarkAll).toHaveBeenCalledTimes(1);
  });

  it('gọi onViewAll khi click vào nút Xem tất cả', () => {
    const handleViewAll = vi.fn();
    render(<NotificationHeader unreadCount={3} onMarkAllAsRead={vi.fn()} onViewAll={handleViewAll} />);

    const viewAllBtn = screen.getByRole('button', { name: /xem tất cả/i });
    expect(viewAllBtn).toBeInTheDocument();
    fireEvent.click(viewAllBtn);
    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });
});

describe('NotificationTabs', () => {
  it('hiển thị 2 tabs Tất cả và Chưa đọc', () => {
    const handleFilterChange = vi.fn();
    render(<NotificationTabs activeFilter="all" onFilterChange={handleFilterChange} unreadCount={2} />);

    expect(screen.getByRole('button', { name: /tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chưa đọc/i })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('gọi onFilterChange khi click tab Chưa đọc', () => {
    const handleFilterChange = vi.fn();
    render(<NotificationTabs activeFilter="all" onFilterChange={handleFilterChange} unreadCount={2} />);

    fireEvent.click(screen.getByRole('button', { name: /chưa đọc/i }));
    expect(handleFilterChange).toHaveBeenCalledWith('unread');
  });
});

describe('NotificationItem', () => {
  const mockNotification: NotificationItemResponse = {
    notificationId: 'NTF_100',
    title: 'Tài liệu đã được duyệt',
    message: 'Tài liệu nghiên cứu của bạn đã được thông qua.',
    type: 'ResourceApproved',
    targetUrl: '/resources/100',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  it('hiển thị tiêu đề, nội dung và chấm chưa đọc', () => {
    render(<NotificationItem notification={mockNotification} />);

    expect(screen.getByText('Tài liệu đã được duyệt')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu nghiên cứu của bạn đã được thông qua.')).toBeInTheDocument();
    expect(screen.getByLabelText('Thông báo chưa đọc')).toBeInTheDocument();
  });

  it('kích hoạt onRead và onClickItem khi click vào thông báo', () => {
    const handleRead = vi.fn();
    const handleClickItem = vi.fn();

    render(<NotificationItem notification={mockNotification} onRead={handleRead} onClickItem={handleClickItem} />);

    fireEvent.click(screen.getByText('Tài liệu đã được duyệt'));
    expect(handleRead).toHaveBeenCalledWith('NTF_100');
    expect(handleClickItem).toHaveBeenCalledWith(mockNotification);
  });

  it('gọi onDelete khi click vào nút xóa thùng rác', () => {
    const handleDelete = vi.fn();

    render(<NotificationItem notification={mockNotification} onDelete={handleDelete} />);

    const deleteBtn = screen.getByTitle('Xóa thông báo');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('NTF_100');
  });
});
