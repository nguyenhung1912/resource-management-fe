import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconBg?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconBg = 'bg-primary/10 text-primary',
  badge,
  actions,
  ariaLabel,
  className,
}: PageHeaderProps) {
  return (
    <section
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : 'Tiêu đề trang')}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 sm:p-7 shadow-xs',
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-4 max-w-3xl">
          {Icon && (
            <div
              className={cn('flex size-11 items-center justify-center rounded-xl shrink-0 mt-0.5 select-none', iconBg)}
            >
              <Icon className="size-5.5" aria-hidden="true" />
            </div>
          )}

          <div className="space-y-1.5 min-w-0">
            {badge && <div className="flex items-center gap-2 flex-wrap pb-0.5">{badge}</div>}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-main truncate">
              {title}
            </h1>

            {description && <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">{actions}</div>}
      </div>
    </section>
  );
}

export default PageHeader;
