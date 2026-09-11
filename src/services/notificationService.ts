import axiosClient from './axiosClient';
import type {
  MessageResponse,
  NotificationQueryParams,
  NotificationReadAllResponse,
  PagedNotificationResponse,
  UnreadCountResponse,
} from '@/features/notifications/types/notification.types';

export const notificationService = {
  // GET /api/Notification/me
  async getMyNotifications(params?: NotificationQueryParams): Promise<PagedNotificationResponse> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (typeof params?.isRead === 'boolean') {
      queryParams.IsRead = params.isRead;
    }
    if (typeof params?.pageIndex === 'number') {
      queryParams.PageIndex = params.pageIndex;
    }
    if (typeof params?.pageSize === 'number') {
      queryParams.PageSize = params.pageSize;
    }

    const response = await axiosClient.get<PagedNotificationResponse>('/api/Notification/me', {
      params: queryParams,
    });
    return response.data;
  },

  // GET /api/Notification/me/unread-count
  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get<UnreadCountResponse>('/api/Notification/me/unread-count');
    return response.data.unreadCount;
  },

  // PUT /api/Notification/{notificationId}/read
  async markAsRead(notificationId: string): Promise<MessageResponse> {
    const response = await axiosClient.put<MessageResponse>(
      `/api/Notification/${encodeURIComponent(notificationId)}/read`,
    );
    return response.data;
  },

  // PUT /api/Notification/me/read-all
  async markAllAsRead(): Promise<NotificationReadAllResponse> {
    const response = await axiosClient.put<NotificationReadAllResponse>('/api/Notification/me/read-all');
    return response.data;
  },

  // DELETE /api/Notification/{notificationId}
  async deleteNotification(notificationId: string): Promise<MessageResponse> {
    const response = await axiosClient.delete<MessageResponse>(
      `/api/Notification/${encodeURIComponent(notificationId)}`,
    );
    return response.data;
  },
};

export default notificationService;
