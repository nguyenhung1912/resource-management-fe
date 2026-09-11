import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationItemResponse } from '@/features/notifications/types/notification.types';
import { useNotificationStore } from './useNotificationStore';

vi.mock('@/services/notificationService', () => ({
  default: {
    getMyNotifications: vi.fn().mockResolvedValue({
      items: [],
      pageIndex: 1,
      pageSize: 6,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    }),
    getUnreadCount: vi.fn().mockResolvedValue(5),
    markAsRead: vi.fn().mockResolvedValue({ message: 'Success' }),
    markAllAsRead: vi.fn().mockResolvedValue({ message: 'Success', updatedItems: 2 }),
    deleteNotification: vi.fn().mockResolvedValue({ message: 'Success' }),
  },
}));

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      dialogItems: [],
      unreadCount: 0,
      isOpen: false,
      activeFilter: 'all',
      isLoading: false,
      isMutating: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('khởi tạo state mặc định chính xác', () => {
    const state = useNotificationStore.getState();
    expect(state.dialogItems).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.isOpen).toBe(false);
    expect(state.activeFilter).toBe('all');
  });

  it('cập nhật trạng thái mở/đóng với setOpen', () => {
    useNotificationStore.getState().setOpen(true);
    expect(useNotificationStore.getState().isOpen).toBe(true);

    useNotificationStore.getState().setOpen(false);
    expect(useNotificationStore.getState().isOpen).toBe(false);
  });

  it('cập nhật số lượng chưa đọc với setUnreadCount', () => {
    useNotificationStore.getState().setUnreadCount(7);
    expect(useNotificationStore.getState().unreadCount).toBe(7);

    // Không cho phép số âm
    useNotificationStore.getState().setUnreadCount(-2);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it('thêm thông báo realtime và giới hạn tối đa 6 items', () => {
    const mockItem: NotificationItemResponse = {
      notificationId: 'NTF_1',
      title: 'Thông báo mới',
      message: 'Nội dung test',
      type: 'ResourceApproved',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    useNotificationStore.getState().addRealtimeNotification(mockItem);
    expect(useNotificationStore.getState().dialogItems).toHaveLength(1);
    expect(useNotificationStore.getState().unreadCount).toBe(1);

    // Thêm 7 items tiếp theo
    for (let i = 2; i <= 8; i++) {
      useNotificationStore.getState().addRealtimeNotification({
        ...mockItem,
        notificationId: `NTF_${i}`,
      });
    }

    // Danh sách chỉ lưu tối đa 6 items cố định
    expect(useNotificationStore.getState().dialogItems).toHaveLength(6);
    expect(useNotificationStore.getState().dialogItems[0].notificationId).toBe('NTF_8');
  });

  it('đánh dấu đã đọc 1 item bằng optimistic update', async () => {
    const item1: NotificationItemResponse = {
      notificationId: 'NTF_1',
      title: 'Chưa đọc',
      message: 'Msg',
      type: 'Comment',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    useNotificationStore.setState({
      dialogItems: [item1],
      unreadCount: 3,
    });

    await useNotificationStore.getState().markAsRead('NTF_1');

    const state = useNotificationStore.getState();
    expect(state.dialogItems[0].isRead).toBe(true);
    expect(state.unreadCount).toBe(2);
  });

  it('đánh dấu tất cả đã đọc bằng optimistic update', async () => {
    const items: NotificationItemResponse[] = [
      {
        notificationId: 'NTF_1',
        title: 'Item 1',
        message: 'Msg 1',
        type: 'Comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: 'NTF_2',
        title: 'Item 2',
        message: 'Msg 2',
        type: 'ResourceApproved',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    useNotificationStore.setState({
      dialogItems: items,
      unreadCount: 2,
    });

    await useNotificationStore.getState().markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.dialogItems.every((item) => item.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('xóa thông báo khỏi danh sách và giảm số lượng chưa đọc nếu item đó chưa đọc', async () => {
    const items: NotificationItemResponse[] = [
      {
        notificationId: 'NTF_1',
        title: 'Item 1',
        message: 'Msg 1',
        type: 'Comment',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: 'NTF_2',
        title: 'Item 2',
        message: 'Msg 2',
        type: 'ResourceApproved',
        isRead: true,
        createdAt: new Date().toISOString(),
      },
    ];

    useNotificationStore.setState({
      dialogItems: items,
      unreadCount: 1,
    });

    await useNotificationStore.getState().deleteNotification('NTF_1');

    const state = useNotificationStore.getState();
    expect(state.dialogItems).toHaveLength(1);
    expect(state.dialogItems[0].notificationId).toBe('NTF_2');
    expect(state.unreadCount).toBe(0);
  });
});
