import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NotificationEmpty } from '@/features/notifications/components/NotificationEmpty';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import type {
  NotificationItemResponse,
  PagedNotificationResponse,
} from '@/features/notifications/types/notification.types';
import notificationService from '@/services/notificationService';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/utils/cn';

export function NotificationCenterPage() {
  const data = useLoaderData() as PagedNotificationResponse;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  const currentIsRead = searchParams.get('isRead');
  const currentPage = data.pageIndex || 1;
  const totalPages = data.totalPages || 1;

  const handleTabChange = (filter: 'all' | 'unread' | 'read') => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('pageIndex', '1');

    if (filter === 'unread') {
      nextParams.set('isRead', 'false');
    } else if (filter === 'read') {
      nextParams.set('isRead', 'true');
    } else {
      nextParams.delete('isRead');
    }

    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('pageIndex', String(newPage));
    setSearchParams(nextParams);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      void fetchUnreadCount();
      revalidator.revalidate();
    } catch {
      // Skip Error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      void fetchUnreadCount();
      revalidator.revalidate();
    } catch {
      // Skip Error
    }
  };

  const handleItemClick = (item: NotificationItemResponse) => {
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      void fetchUnreadCount();
      revalidator.revalidate();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const activeTab: 'all' | 'unread' | 'read' =
    currentIsRead === 'false' ? 'unread' : currentIsRead === 'true' ? 'read' : 'all';

  const startItem = data.totalCount === 0 ? 0 : (currentPage - 1) * data.pageSize + 1;
  const endItem = Math.min(currentPage * data.pageSize, data.totalCount);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main">Trung tâm thông báo</h1>
              <p className="text-sm text-text-muted mt-0.5">
                Quản lý và theo dõi tất cả các thông báo, cập nhật tài liệu và kiểm duyệt của bạn.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            disabled={isMarkingAll || data.totalCount === 0}
            onClick={handleMarkAllAsRead}
            iconLeft={
              isMarkingAll ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <CheckCheck className="h-4 w-4 text-primary" />
              )
            }
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-surface rounded-xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Filter Tabs & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle px-5 py-3 gap-3 bg-background/30">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'all'
                  ? 'bg-surface text-primary font-semibold shadow-xs border border-border-subtle'
                  : 'text-text-muted hover:text-text-main',
              )}
            >
              Tất cả
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('unread')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'unread'
                  ? 'bg-surface text-primary font-semibold shadow-xs border border-border-subtle'
                  : 'text-text-muted hover:text-text-main',
              )}
            >
              Chưa đọc
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('read')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                activeTab === 'read'
                  ? 'bg-surface text-primary font-semibold shadow-xs border border-border-subtle'
                  : 'text-text-muted hover:text-text-main',
              )}
            >
              Đã đọc
            </button>
          </div>

          {/* Meta count badge */}
          <div className="text-xs text-text-muted flex items-center gap-2">
            <span>
              Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên <strong>{data.totalCount}</strong>{' '}
              thông báo
            </span>
            {data.totalCount > 0 && (
              <Badge variant="neutral" showDot={false}>
                Trang {currentPage} / {totalPages}
              </Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-border-subtle">
          {data.items.length === 0 ? (
            <NotificationEmpty
              title="Không tìm thấy thông báo nào"
              description={
                activeTab === 'unread'
                  ? 'Tuyệt vời! Bạn không còn thông báo chưa đọc nào.'
                  : activeTab === 'read'
                    ? 'Bạn chưa có thông báo nào đã đọc.'
                    : 'Hộp thư thông báo của bạn hiện đang trống.'
              }
            />
          ) : (
            data.items.map((item) => (
              <NotificationItem
                key={item.notificationId}
                notification={item}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClickItem={handleItemClick}
              />
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border-subtle bg-background/20 select-none">
            <Button
              variant="secondary"
              size="sm"
              disabled={!data.hasPreviousPage}
              onClick={() => handlePageChange(currentPage - 1)}
              iconLeft={<ChevronLeft className="h-4 w-4" />}
            >
              Trang trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary',
                      isCurrent
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-muted hover:bg-gray-100 hover:text-text-main',
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={!data.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
              iconRight={<ChevronRight className="h-4 w-4" />}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenterPage;
