import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconBg?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  iconBg = 'bg-gray-100 text-text-muted',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface p-8 sm:p-12 text-center select-none shadow-2xs',
        className,
      )}
    >
      <div className={cn('flex size-13 items-center justify-center rounded-2xl mb-4', iconBg)}>
        <Icon className="size-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-text-main">{title}</h3>

      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-text-muted max-w-md leading-relaxed">{description}</p>
      )}

      {action && <div className="mt-5 flex items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
