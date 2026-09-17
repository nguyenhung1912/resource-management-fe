import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationCenterPage } from '../NotificationCenterPage';
import type { PagedNotificationResponse } from '@/features/notifications/types/notification.types';

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockRevalidate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useRevalidator: () => ({ revalidate: mockRevalidate, state: 'idle' }),
  };
});

const mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);
const mockMarkAsRead = vi.fn().mockResolvedValue(undefined);
const mockDeleteNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/notificationService', () => ({
  default: {
    markAllAsRead: () => mockMarkAllAsRead(),
    markAsRead: (id: string) => mockMarkAsRead(id),
    deleteNotification: (id: string) => mockDeleteNotification(id),
    getUnreadCount: vi.fn().mockResolvedValue(2),
  },
}));

import { useLoaderData } from 'react-router-dom';

describe('NotificationCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const mockData: PagedNotificationResponse = {
    items: [
      {
        notificationId: 'NTF_1',
        title: 'Tài liệu đã được duyệt',
        message: 'Tài liệu của bạn đã được giảng viên thông qua.',
        type: 'ResourceApproved',
        targetUrl: '/resources/1',
        isRead: false,
        createdAt: '2026-09-17T10:00:00Z',
      },
      {
        notificationId: 'NTF_2',
        title: 'Báo cáo mới được gửi',
        message: 'Có báo cáo vi phạm mới cần kiểm tra.',
        type: 'Report',
        targetUrl: '/reports/2',
        isRead: true,
        createdAt: '2026-09-17T09:00:00Z',
      },
    ],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  it('render tiêu đề PageHeader, badge và danh sách thông báo', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockData);

    render(<NotificationCenterPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Trung tâm thông báo' })).toBeInTheDocument();
    expect(screen.getByText('Hộp thư cá nhân')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu đã được duyệt')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo mới được gửi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đánh dấu tất cả đã đọc/i })).toBeInTheDocument();
  });

  it('chuyển tab sang Chưa đọc khi người dùng click', () => {
    vi.mocked(useLoaderData).mockReturnValue(mockData);

    render(<NotificationCenterPage />);

    const unreadTab = screen.getByRole('button', { name: /^chưa đọc$/i });
    fireEvent.click(unreadTab);

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    const updatedParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(updatedParams.get('isRead')).toBe('false');
    expect(updatedParams.get('pageIndex')).toBe('1');
  });

  it('gọi service markAllAsRead khi bấm nút Đánh dấu tất cả đã đọc', async () => {
    vi.mocked(useLoaderData).mockReturnValue(mockData);

    render(<NotificationCenterPage />);

    const markAllBtn = screen.getByRole('button', { name: /đánh dấu tất cả đã đọc/i });
    fireEvent.click(markAllBtn);

    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('hiển thị empty state khi danh sách thông báo trống', () => {
    vi.mocked(useLoaderData).mockReturnValue({
      ...mockData,
      items: [],
      totalCount: 0,
      totalPages: 0,
    });

    render(<NotificationCenterPage />);

    expect(screen.getByText('Không tìm thấy thông báo nào')).toBeInTheDocument();
  });
});
