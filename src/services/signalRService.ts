import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { APP_CONFIG } from '@/constants/config';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import type { NotificationItemResponse } from '@/features/notifications/types/notification.types';

type NotificationHandler = (notification: NotificationItemResponse) => void;
type UnreadCountHandler = (count: number) => void;

class SignalRNotificationService {
  private connection: HubConnection | null = null;
  private notificationListeners = new Set<NotificationHandler>();
  private unreadCountListeners = new Set<UnreadCountHandler>();
  private isStarting = false;

  private getHubUrl(): string {
    return `${APP_CONFIG.API_BASE_URL.replace(/\/$/, '')}/hubs/notifications`;
  }

  public async start(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected || this.isStarting) {
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    // Nếu chưa có token, không khởi tạo kết nối
    if (!token) {
      return;
    }

    try {
      this.isStarting = true;

      this.connection = new HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      // Đăng ký các sự kiện từ Server
      this.connection.on('ReceiveNotification', (notification: NotificationItemResponse) => {
        this.notificationListeners.forEach((listener) => {
          try {
            listener(notification);
          } catch {
            // Không để lỗi của 1 listener làm hỏng kết nối
          }
        });
      });

      this.connection.on('UnreadCountChanged', (count: number) => {
        this.unreadCountListeners.forEach((listener) => {
          try {
            listener(count);
          } catch {
            // Không để lỗi của 1 listener làm hỏng kết nối
          }
        });
      });

      await this.connection.start();
    } catch {
      // Khi server local chưa bật hub, không throw crash ứng dụng
    } finally {
      this.isStarting = false;
    }
  }

  public async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Bỏ qua lỗi khi ngắt kết nối
      } finally {
        this.connection = null;
      }
    }
  }

  public onReceiveNotification(handler: NotificationHandler): () => void {
    this.notificationListeners.add(handler);
    return () => {
      this.notificationListeners.delete(handler);
    };
  }

  public onUnreadCountChanged(handler: UnreadCountHandler): () => void {
    this.unreadCountListeners.add(handler);
    return () => {
      this.unreadCountListeners.delete(handler);
    };
  }

  public getState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }
}

export const signalRNotificationService = new SignalRNotificationService();
export default signalRNotificationService;
