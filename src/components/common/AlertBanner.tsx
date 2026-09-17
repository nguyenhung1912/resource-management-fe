import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertBannerType = 'success' | 'danger' | 'warning' | 'info';

export interface AlertBannerProps {
  type?: AlertBannerType;
  title?: string;
  message: ReactNode;
  onClose?: () => void;
  className?: string;
}

const bannerTypeConfig: Record<
  AlertBannerType,
  {
    container: string;
    icon: typeof CheckCircle2;
    iconClass: string;
    closeClass: string;
  }
> = {
  success: {
    container: 'bg-emerald-50 border-emerald-200/80 text-emerald-950',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    closeClass: 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70',
  },
  danger: {
    container: 'bg-rose-50 border-rose-200/80 text-rose-950',
    icon: AlertCircle,
    iconClass: 'text-rose-600',
    closeClass: 'text-rose-700 hover:text-rose-900 hover:bg-rose-100/70',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200/80 text-amber-950',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    closeClass: 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/70',
  },
  info: {
    container: 'bg-blue-50 border-blue-200/80 text-blue-950',
    icon: Info,
    iconClass: 'text-primary',
    closeClass: 'text-blue-700 hover:text-blue-900 hover:bg-blue-100/70',
  },
};

export function AlertBanner({ type = 'success', title, message, onClose, className }: AlertBannerProps) {
  const config = bannerTypeConfig[type];
  const Icon = config.icon;

  return (
    <div
      role={type === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl border text-xs animate-in fade-in shadow-xs',
        config.container,
        className,
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.iconClass)} aria-hidden="true" />
        <div className="space-y-0.5 leading-relaxed min-w-0">
          {title ? <p className="font-semibold text-text-main">{title}</p> : null}
          <div className="text-current font-medium">{message}</div>
        </div>
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className={cn('p-1 rounded-md transition-colors cursor-pointer shrink-0 -mr-1 -mt-1', config.closeClass)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default AlertBanner;
