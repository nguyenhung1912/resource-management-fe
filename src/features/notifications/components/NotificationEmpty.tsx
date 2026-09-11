import { BellOff } from 'lucide-react';

interface NotificationEmptyProps {
  title?: string;
  description?: string;
}

export function NotificationEmpty({
  title = 'Không có thông báo nào',
  description = 'Bạn đã cập nhật hết tất cả các thông báo mới nhất.',
}: NotificationEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
      <div className="size-12 rounded-full bg-background border border-border-subtle flex items-center justify-center mb-3">
        <BellOff className="size-5 text-text-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-text-main">{title}</p>
      <p className="text-xs text-text-muted mt-1 max-w-60 leading-relaxed">{description}</p>
    </div>
  );
}

export default NotificationEmpty;
