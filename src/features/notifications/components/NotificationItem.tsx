import { memo, type MouseEvent, type ReactNode } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, MessageSquare, ShieldAlert, Trash2, XCircle } from 'lucide-react';
import type { NotificationItemResponse, NotificationType } from '@/features/notifications/types/notification.types';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';

interface NotificationItemProps {
  notification: NotificationItemResponse;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClickItem?: (notification: NotificationItemResponse) => void;
}

interface TypeVisualConfig {
  icon: ReactNode;
  wrapperClass: string;
}

function getTypeVisualConfig(type: NotificationType): TypeVisualConfig {
  switch (type) {
    case 'ResourceApproved':
      return {
        icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-badge-success-bg text-badge-success-text',
      };
    case 'ResourceRejected':
      return {
        icon: <XCircle className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-badge-danger-bg text-badge-danger-text',
      };
    case 'Moderation':
    case 'ModerationAppeal':
      return {
        icon: <ShieldAlert className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-blue-50 text-primary',
      };
    case 'Comment':
    case 'CommentReply':
      return {
        icon: <MessageSquare className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-orange-50 text-warning',
      };
    case 'Report':
      return {
        icon: <AlertTriangle className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-badge-danger-bg text-danger',
      };
    case 'SystemAlert':
    default:
      return {
        icon: <Bell className="size-4" aria-hidden="true" />,
        wrapperClass: 'bg-gray-100 text-text-muted',
      };
  }
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClickItem,
}: NotificationItemProps) {
  const { icon, wrapperClass } = getTypeVisualConfig(notification.type);
  const relativeTime = formatRelativeTime(notification.createdAt);

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification.notificationId);
    }
    onClickItem?.(notification);
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.(notification.notificationId);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer w-full select-none outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary/40',
        notification.isRead ? 'bg-surface hover:bg-gray-50/70' : 'bg-blue-50/30 hover:bg-blue-50/50',
      )}
    >
      {/* Icon Avatar */}
      <div
        className={cn(
          'size-9 rounded-lg flex items-center justify-center shrink-0 border border-transparent shadow-xs',
          wrapperClass,
        )}
      >
        {icon}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'text-xs tracking-tight line-clamp-1',
              notification.isRead ? 'font-medium text-text-main' : 'font-semibold text-text-main',
            )}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span
              className="size-1.5 rounded-full bg-primary shrink-0"
              title="Chưa đọc"
              aria-label="Thông báo chưa đọc"
            />
          )}
        </div>

        <p className="text-xs text-text-muted line-clamp-2 mt-0.5 leading-relaxed wrap-break-word">
          {notification.message}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1.5">
          <Clock className="size-3 shrink-0" aria-hidden="true" />
          <span>{relativeTime}</span>
        </div>
      </div>

      {/* Quick Action Button: Delete on Hover */}
      <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded-md text-text-muted hover:text-danger hover:bg-gray-100 active:bg-gray-200 transition-colors"
          title="Xóa thông báo"
          aria-label={`Xóa thông báo: ${notification.title}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
});

export default NotificationItem;
