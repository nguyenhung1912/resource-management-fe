import { ArrowRight } from 'lucide-react';

interface NotificationFooterProps {
  onViewAll: () => void;
}

export function NotificationFooter({ onViewAll }: NotificationFooterProps) {
  return (
    <div className="border-t border-border-subtle bg-surface rounded-b-xl overflow-hidden select-none">
      <button
        type="button"
        onClick={onViewAll}
        className="w-full py-2.5 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:bg-blue-50/50 active:bg-blue-50 transition-colors cursor-pointer outline-none focus-visible:bg-blue-50"
      >
        <span>Xem tất cả thông báo</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default NotificationFooter;
