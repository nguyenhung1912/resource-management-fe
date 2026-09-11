export type NotificationType =
  | 'ResourceApproved'
  | 'ResourceRejected'
  | 'Moderation'
  | 'ModerationAppeal'
  | 'Comment'
  | 'CommentReply'
  | 'Report'
  | 'SystemAlert'
  | (string & {});

export interface NotificationItemResponse {
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PagedNotificationResponse {
  items: NotificationItemResponse[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NotificationReadAllResponse {
  message: string;
  updatedItems: number;
}

export interface MessageResponse {
  message: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationQueryParams {
  isRead?: boolean;
  pageIndex?: number;
  pageSize?: number;
}
