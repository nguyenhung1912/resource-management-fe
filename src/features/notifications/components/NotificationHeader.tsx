import { CheckCheck, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onViewAll?: () => void;
  isMutating?: boolean;
}

export function NotificationHeader({
  unreadCount,
  onMarkAllAsRead,
  onViewAll,
  isMutating = false,
}: NotificationHeaderProps) {
  const hasUnread = unreadCount > 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface select-none">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-text-main">Thông báo</h3>
        {hasUnread && (
          <Badge variant="primary" showDot={true}>
            {unreadCount} mới
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer outline-none focus-visible:underline"
            title="Xem tất cả thông báo trên trang riêng"
          >
            <span>Xem tất cả</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </button>
        )}

        {onViewAll && (
          <span className="text-border-subtle text-xs" aria-hidden="true">
            |
          </span>
        )}

        <button
          type="button"
          disabled={!hasUnread || isMutating}
          onClick={onMarkAllAsRead}
          className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-main disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer outline-none focus-visible:underline"
          title="Đánh dấu tất cả thông báo là đã đọc"
        >
          {isMutating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>Đã đọc tất cả</span>
        </button>
      </div>
    </div>
  );
}

export default NotificationHeader;
