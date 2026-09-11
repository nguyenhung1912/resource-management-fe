import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/utils/cn';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isOpen = useNotificationStore((state) => state.isOpen);
  const toggleOpen = useNotificationStore((state) => state.toggleOpen);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <button
      type="button"
      onClick={toggleOpen}
      aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={cn(
        'relative inline-flex items-center justify-center h-10 w-10 rounded-lg text-text-muted hover:text-text-main hover:bg-gray-100/80 active:bg-gray-200/80 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isOpen && 'text-text-main bg-gray-100',
        className,
      )}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />

      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface shadow-2xs animate-in fade-in zoom-in-75 duration-150"
          aria-hidden="true"
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;
