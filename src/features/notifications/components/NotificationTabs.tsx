import { cn } from '@/utils/cn';

interface NotificationTabsProps {
  activeFilter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
  unreadCount?: number;
}

export function NotificationTabs({ activeFilter, onFilterChange, unreadCount = 0 }: NotificationTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border-subtle bg-background/40 select-none">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary',
          activeFilter === 'all'
            ? 'bg-surface text-text-main font-semibold shadow-2xs border border-border-subtle'
            : 'text-text-muted hover:text-text-main',
        )}
      >
        Tất cả
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('unread')}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary',
          activeFilter === 'unread'
            ? 'bg-surface text-text-main font-semibold shadow-2xs border border-border-subtle'
            : 'text-text-muted hover:text-text-main',
        )}
      >
        <span>Chưa đọc</span>
        {unreadCount > 0 && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none',
              activeFilter === 'unread' ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted',
            )}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default NotificationTabs;
