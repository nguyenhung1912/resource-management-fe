import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { NotificationEmpty } from '@/features/notifications/components/NotificationEmpty';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import type {
  NotificationItemResponse,
  PagedNotificationResponse,
} from '@/features/notifications/types/notification.types';
import notificationService from '@/services/notificationService';
import { useNotificationStore } from '@/store/useNotificationStore';

export function NotificationCenterPage() {
  const data = useLoaderData() as PagedNotificationResponse;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

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

  const notificationTabs: TabItem[] = [
    { id: 'all', label: 'Tất cả' },
    {
      id: 'unread',
      label: 'Chưa đọc',
      count: unreadCount > 0 ? unreadCount : undefined,
      dotColor: 'bg-primary',
    },
    { id: 'read', label: 'Đã đọc' },
  ];

  const startItem = data.totalCount === 0 ? 0 : (currentPage - 1) * data.pageSize + 1;
  const endItem = Math.min(currentPage * data.pageSize, data.totalCount);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Trung tâm thông báo"
        description="Quản lý và theo dõi tất cả các thông báo, cập nhật tài liệu và kiểm duyệt của bạn."
        icon={Bell}
        badge={
          <Badge variant="primary" showDot>
            Hộp thư cá nhân
          </Badge>
        }
        actions={
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
        }
      />

      {/* Main Container */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Filter Tabs & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle px-5 py-3.5 gap-3 bg-background/40">
          <Tabs
            items={notificationTabs}
            activeValue={activeTab}
            onChange={(val) => handleTabChange(val as 'all' | 'unread' | 'read')}
            variant="pills"
            itemRole="button"
          />

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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            itemLabel="thông báo"
            hasPreviousPage={data.hasPreviousPage}
            hasNextPage={data.hasNextPage}
            onPageChange={handlePageChange}
            className="rounded-t-none border-x-0 border-b-0 bg-background/20"
          />
        )}
      </div>
    </div>
  );
}

export default NotificationCenterPage;
