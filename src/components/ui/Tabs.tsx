import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string | number = string | number> {
  id: T;
  label: string;
  count?: number;
  dotColor?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface TabsProps<T extends string | number = string | number> {
  items: readonly TabItem<T>[];
  activeValue?: T;
  onChange: (value: T) => void;
  variant?: 'pills' | 'segmented' | 'underline';
  size?: 'sm' | 'md';
  itemRole?: 'tab' | 'button';
  ariaLabel?: string;
  className?: string;
}

export function Tabs<T extends string | number = string | number>({
  items,
  activeValue,
  onChange,
  variant = 'pills',
  size = 'md',
  itemRole = 'tab',
  ariaLabel = 'Danh sách tab',
  className,
}: TabsProps<T>) {
  const isTab = itemRole === 'tab';
  const containerRole = isTab ? 'tablist' : 'group';
  if (variant === 'segmented') {
    return (
      <div
        role={containerRole}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-background p-1 select-none overflow-x-auto max-w-full',
          className,
        )}
      >
        {items.map((item) => {
          const isActive = activeValue === item.id;
          const Icon = item.icon;

          return (
            <button
              key={String(item.id)}
              role={isTab ? 'tab' : undefined}
              type="button"
              disabled={item.disabled}
              aria-selected={isTab ? isActive : undefined}
              aria-pressed={!isTab ? isActive : undefined}
              aria-label={
                item.ariaLabel ?? (typeof item.count === 'number' ? `${item.label} (${item.count})` : item.label)
              }
              onClick={() => onChange(item.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
                isActive
                  ? 'bg-surface text-text-main font-semibold shadow-2xs border border-border-subtle'
                  : 'text-text-muted hover:text-text-main hover:bg-surface/50 border border-transparent',
              )}
            >
              {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-normal',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-gray-200/80 text-text-muted',
                  )}
                >
                  {item.count.toLocaleString('vi-VN')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        role={containerRole}
        aria-label={ariaLabel}
        className={cn('flex items-center gap-6 border-b border-border-subtle select-none overflow-x-auto', className)}
      >
        {items.map((item) => {
          const isActive = activeValue === item.id;
          const Icon = item.icon;

          return (
            <button
              key={String(item.id)}
              role={isTab ? 'tab' : undefined}
              type="button"
              disabled={item.disabled}
              aria-selected={isTab ? isActive : undefined}
              aria-pressed={!isTab ? isActive : undefined}
              aria-label={
                item.ariaLabel ?? (typeof item.count === 'number' ? `${item.label} (${item.count})` : item.label)
              }
              onClick={() => onChange(item.id)}
              className={cn(
                'relative flex items-center gap-2 pb-3 font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap',
                size === 'sm' ? 'text-xs' : 'text-sm',
                isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-main',
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-muted',
                  )}
                >
                  {item.count.toLocaleString('vi-VN')}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'pills'
  return (
    <div
      role={containerRole}
      aria-label={ariaLabel}
      className={cn('flex flex-wrap items-center gap-1.5 select-none', className)}
    >
      {items.map((item) => {
        const isActive = activeValue === item.id;
        const Icon = item.icon;

        return (
          <button
            key={String(item.id)}
            role={isTab ? 'tab' : undefined}
            type="button"
            disabled={item.disabled}
            aria-selected={isTab ? isActive : undefined}
            aria-pressed={!isTab ? isActive : undefined}
            aria-label={
              item.ariaLabel ?? (typeof item.count === 'number' ? `${item.label} (${item.count})` : item.label)
            }
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap select-none',
              size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs',
              isActive
                ? 'bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs'
                : 'bg-background text-text-muted border-border-subtle hover:border-gray-300 hover:text-text-main',
            )}
          >
            {item.dotColor ? (
              <span className={cn('size-1.5 rounded-full shrink-0', item.dotColor)} aria-hidden="true" />
            ) : null}
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-normal',
                  isActive ? 'bg-primary text-white' : 'bg-gray-200/80 text-text-muted',
                )}
              >
                {item.count.toLocaleString('vi-VN')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
