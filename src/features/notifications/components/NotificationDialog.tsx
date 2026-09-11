import { useEffect, useRef } from 'react';
import type { NotificationItemResponse } from '@/features/notifications/types/notification.types';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationEmpty } from './NotificationEmpty';
import { NotificationFooter } from './NotificationFooter';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';
import { NotificationTabs } from './NotificationTabs';

interface NotificationDialogProps {
  onViewAll?: () => void;
  onNavigateToTarget?: (url: string) => void;
}

export function NotificationDialog({ onViewAll, onNavigateToTarget }: NotificationDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = useNotificationStore((state) => state.isOpen);
  const setOpen = useNotificationStore((state) => state.setOpen);
  const dialogItems = useNotificationStore((state) => state.dialogItems);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const activeFilter = useNotificationStore((state) => state.activeFilter);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const isMutating = useNotificationStore((state) => state.isMutating);
  const setFilter = useNotificationStore((state) => state.setFilter);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  // Xử lý đóng khi click ra ngoài hoặc phím Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const handleItemClick = (notification: NotificationItemResponse) => {
    if (notification.targetUrl && onNavigateToTarget) {
      setOpen(false);
      onNavigateToTarget(notification.targetUrl);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Hộp thoại thông báo"
      aria-modal="true"
      className="absolute right-0 top-full mt-2 w-[380px] sm:w-[400px] bg-surface rounded-xl border border-border-subtle shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={handleViewAll}
        isMutating={isMutating}
      />

      {/* Tabs Filter */}
      <NotificationTabs activeFilter={activeFilter} onFilterChange={setFilter} unreadCount={unreadCount} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-border-subtle">
        {isLoading ? (
          <NotificationSkeleton count={6} />
        ) : dialogItems.length === 0 ? (
          <NotificationEmpty
            description={
              activeFilter === 'unread'
                ? 'Bạn không có thông báo chưa đọc nào.'
                : 'Bạn đã cập nhật hết tất cả các thông báo mới nhất.'
            }
          />
        ) : (
          dialogItems.map((item) => (
            <NotificationItem
              key={item.notificationId}
              notification={item}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onClickItem={handleItemClick}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <NotificationFooter onViewAll={handleViewAll} />
    </div>
  );
}

export default NotificationDialog;
