import type { LoaderFunctionArgs } from 'react-router-dom';
import type { PagedNotificationResponse } from '@/features/notifications/types/notification.types';
import notificationService from '@/services/notificationService';

export async function notificationsLoader({ request }: LoaderFunctionArgs): Promise<PagedNotificationResponse> {
  const url = new URL(request.url);
  const isReadParam = url.searchParams.get('isRead');
  const pageIndexParam = url.searchParams.get('pageIndex');
  const pageSizeParam = url.searchParams.get('pageSize');

  const pageIndex = pageIndexParam ? Math.max(1, parseInt(pageIndexParam, 10) || 1) : 1;
  const pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10) || 10) : 10;

  let isRead: boolean | undefined;
  if (isReadParam === 'true') {
    isRead = true;
  } else if (isReadParam === 'false') {
    isRead = false;
  }

  try {
    return await notificationService.getMyNotifications({
      isRead,
      pageIndex,
      pageSize,
    });
  } catch {
    // Trả về kết quả rỗng nếu server chưa có data hoặc lỗi xác thực
    return {
      items: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
}
