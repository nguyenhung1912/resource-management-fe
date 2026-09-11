import { create } from 'zustand';
import type { NotificationItemResponse } from '@/features/notifications/types/notification.types';
import notificationService from '@/services/notificationService';

export interface NotificationState {
  dialogItems: NotificationItemResponse[];
  unreadCount: number;
  isOpen: boolean;
  activeFilter: 'all' | 'unread';
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setFilter: (filter: 'all' | 'unread') => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  fetchDialogNotifications: (filter?: 'all' | 'unread') => Promise<void>;
  addRealtimeNotification: (notification: NotificationItemResponse) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  dialogItems: [],
  unreadCount: 0,
  isOpen: false,
  activeFilter: 'all',
  isLoading: false,
  isMutating: false,
  error: null,

  toggleOpen: () => {
    const nextOpen = !get().isOpen;
    set({ isOpen: nextOpen });
    if (nextOpen) {
      void get().fetchDialogNotifications(get().activeFilter);
      void get().fetchUnreadCount();
    }
  },

  setOpen: (open: boolean) => {
    set({ isOpen: open });
    if (open) {
      void get().fetchDialogNotifications(get().activeFilter);
      void get().fetchUnreadCount();
    }
  },

  setFilter: async (filter: 'all' | 'unread') => {
    set({ activeFilter: filter });
    await get().fetchDialogNotifications(filter);
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Bỏ qua lỗi nếu chưa đăng nhập hoặc mạng tạm thời
    }
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: Math.max(0, count) });
  },

  addRealtimeNotification: (notification: NotificationItemResponse) => {
    const currentItems = get().dialogItems;
    const filtered = currentItems.filter((item) => item.notificationId !== notification.notificationId);
    set({
      dialogItems: [notification, ...filtered].slice(0, 6),
      unreadCount: get().unreadCount + (notification.isRead ? 0 : 1),
    });
  },

  fetchDialogNotifications: async (filter?: 'all' | 'unread') => {
    const targetFilter = filter ?? get().activeFilter;
    set({ isLoading: true, error: null });

    try {
      const response = await notificationService.getMyNotifications({
        isRead: targetFilter === 'unread' ? false : undefined,
        pageIndex: 1,
        pageSize: 6,
      });

      set({
        dialogItems: response.items,
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách thông báo. Vui lòng thử lại.';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    const previousItems = get().dialogItems;
    const previousUnreadCount = get().unreadCount;

    const targetItem = previousItems.find((item) => item.notificationId === notificationId);
    const wasUnread = targetItem ? !targetItem.isRead : false;

    if (wasUnread) {
      set({
        dialogItems: previousItems.map((item) =>
          item.notificationId === notificationId ? { ...item, isRead: true } : item,
        ),
        unreadCount: Math.max(0, previousUnreadCount - 1),
      });
    }

    try {
      await notificationService.markAsRead(notificationId);
    } catch (err: unknown) {
      // Revert lại trạng thái cũ nếu API trả lỗi
      set({
        dialogItems: previousItems,
        unreadCount: previousUnreadCount,
        error: err instanceof Error ? err.message : 'Lỗi đánh dấu đã đọc.',
      });
    }
  },

  markAllAsRead: async () => {
    const previousItems = get().dialogItems;
    const previousUnreadCount = get().unreadCount;

    set({
      isMutating: true,
      dialogItems: previousItems.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    });

    try {
      await notificationService.markAllAsRead();
      set({ isMutating: false });
    } catch (err: unknown) {
      // Revert lại nếu có lỗi
      set({
        isMutating: false,
        dialogItems: previousItems,
        unreadCount: previousUnreadCount,
        error: err instanceof Error ? err.message : 'Lỗi đánh dấu tất cả đã đọc.',
      });
    }
  },

  deleteNotification: async (notificationId: string) => {
    const previousItems = get().dialogItems;
    const previousUnreadCount = get().unreadCount;

    const targetItem = previousItems.find((item) => item.notificationId === notificationId);
    const wasUnread = targetItem ? !targetItem.isRead : false;

    set({
      dialogItems: previousItems.filter((item) => item.notificationId !== notificationId),
      unreadCount: wasUnread ? Math.max(0, previousUnreadCount - 1) : previousUnreadCount,
    });

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err: unknown) {
      // Revert lại nếu có lỗi
      set({
        dialogItems: previousItems,
        unreadCount: previousUnreadCount,
        error: err instanceof Error ? err.message : 'Không thể xóa thông báo.',
      });
    }
  },
}));

export default useNotificationStore;
