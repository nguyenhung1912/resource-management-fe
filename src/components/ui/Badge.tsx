import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-badge-success-bg text-badge-success-text border-emerald-200/50',
        danger: 'bg-badge-danger-bg text-badge-danger-text border-rose-200/50',
        warning: 'bg-orange-50 text-warning border-orange-200/50',
        neutral: 'bg-gray-100 text-text-muted border-border-subtle',
        primary: 'bg-blue-50 text-primary border-blue-200/50',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

const dotColors: Record<string, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  neutral: 'bg-status-inactive',
  primary: 'bg-primary',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  showDot?: boolean;
  children: ReactNode;
}

export function Badge({ className, variant = 'neutral', showDot = true, children, ...props }: BadgeProps) {
  const activeVariant = variant ?? 'neutral';

  return (
    <span className={cn(badgeVariants({ variant: activeVariant }), className)} {...props}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[activeVariant])} aria-hidden="true" />}
      {children}
    </span>
  );
}
