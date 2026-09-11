import { useEffect } from 'react';
import signalRNotificationService from '@/services/signalRService';
import { useNotificationStore } from '@/store/useNotificationStore';

export function useNotificationSignalR() {
  const addRealtimeNotification = useNotificationStore((state) => state.addRealtimeNotification);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    // Khởi tạo kết nối nếu đã đăng nhập
    void signalRNotificationService.start();

    // Lắng nghe sự kiện thông báo mới
    const unsubscribeNotification = signalRNotificationService.onReceiveNotification((notification) => {
      addRealtimeNotification(notification);
    });

    // Lắng nghe cập nhật số lượng chưa đọc
    const unsubscribeUnreadCount = signalRNotificationService.onUnreadCountChanged((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotification();
      unsubscribeUnreadCount();
    };
  }, [addRealtimeNotification, setUnreadCount]);
}

export default useNotificationSignalR;
