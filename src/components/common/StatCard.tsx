import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatCardColorVariant = 'primary' | 'warning' | 'success' | 'danger' | 'neutral';

export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  detail?: string;
  icon: LucideIcon;
  colorVariant?: StatCardColorVariant;
  iconBoxClassName?: string;
  isSelected?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

const colorVariantStyles: Record<
  StatCardColorVariant,
  {
    iconBox: string;
    activeBorder: string;
  }
> = {
  primary: {
    iconBox: 'text-primary bg-primary/10',
    activeBorder: 'border-primary ring-2 ring-primary/20',
  },
  warning: {
    iconBox: 'text-warning bg-orange-50',
    activeBorder: 'border-warning ring-2 ring-warning/20',
  },
  success: {
    iconBox: 'text-success bg-emerald-50',
    activeBorder: 'border-success ring-2 ring-success/20',
  },
  danger: {
    iconBox: 'text-danger bg-rose-50',
    activeBorder: 'border-danger ring-2 ring-danger/20',
  },
  neutral: {
    iconBox: 'text-text-muted bg-gray-100',
    activeBorder: 'border-border ring-2 ring-border/40',
  },
};

export function StatCard({
  label,
  value,
  unit,
  detail,
  icon: Icon,
  colorVariant = 'primary',
  iconBoxClassName,
  isSelected = false,
  onClick,
  ariaLabel,
  className,
}: StatCardProps) {
  const styles = colorVariantStyles[colorVariant];
  const isInteractive = Boolean(onClick);

  const sharedClassName = cn(
    'bg-surface rounded-xl border p-4 text-left transition-all duration-150 shadow-xs select-none flex flex-col justify-between',
    isInteractive &&
      'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-gray-300 hover:shadow-sm',
    isSelected ? styles.activeBorder : 'border-border-subtle',
    className,
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-muted leading-tight truncate">{label}</span>
        <div
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
            iconBoxClassName ?? styles.iconBox,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-text-main">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </span>
          {unit ? <span className="text-xs text-text-muted">{unit}</span> : null}
        </div>
        {detail ? <p className="text-[11px] text-text-muted mt-0.5 truncate">{detail}</p> : null}
      </div>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? `${label}: ${value} ${unit ?? ''}`.trim()}
        aria-pressed={isSelected}
        className={sharedClassName}
      >
        {content}
      </button>
    );
  }

  return <div className={sharedClassName}>{content}</div>;
}

export default StatCard;
