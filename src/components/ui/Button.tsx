import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out outline-none select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white border border-primary/90 shadow-xs shadow-primary/25 hover:bg-primary-hover hover:border-primary-hover hover:shadow-sm hover:shadow-primary/30 active:bg-primary-active active:scale-[0.98] active:shadow-xs focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-semibold',
        secondary:
          'bg-surface text-text-main border border-border shadow-xs hover:bg-neutral-50 hover:border-border-subtle hover:text-text-main hover:shadow-xs active:bg-neutral-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-medium',
        outline:
          'bg-transparent text-primary border border-primary/30 hover:bg-primary/5 hover:border-primary/50 hover:text-primary active:bg-primary/10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-medium',
        soft: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 hover:text-primary hover:shadow-2xs active:bg-primary/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-medium',
        danger:
          'bg-danger text-white border border-danger/90 shadow-xs shadow-danger/25 hover:bg-danger-hover hover:border-danger-hover hover:shadow-sm hover:shadow-danger/30 active:bg-danger-active active:scale-[0.98] active:shadow-xs focus-visible:ring-2 focus-visible:ring-danger/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-semibold',
        'danger-soft':
          'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/15 hover:border-danger/30 hover:text-danger active:bg-danger/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-danger/40 focus-visible:ring-offset-2 font-medium',
        success:
          'bg-success text-white border border-success/90 shadow-xs shadow-success/25 hover:bg-success-hover hover:border-success-hover hover:shadow-sm hover:shadow-success/30 active:bg-success-active active:scale-[0.98] active:shadow-xs focus-visible:ring-2 focus-visible:ring-success/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-semibold',
        'success-soft':
          'bg-success/10 text-success border border-success/20 hover:bg-success/15 hover:border-success/30 hover:text-success active:bg-success/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-success/40 focus-visible:ring-offset-2 font-medium',
        warning:
          'bg-warning text-white border border-warning/90 shadow-xs shadow-warning/25 hover:bg-warning-hover hover:border-warning-hover hover:shadow-sm hover:shadow-warning/30 active:bg-warning-active active:scale-[0.98] active:shadow-xs focus-visible:ring-2 focus-visible:ring-warning/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-semibold',
        ghost:
          'bg-transparent text-text-muted hover:text-text-main hover:bg-neutral-100 active:bg-neutral-200/70 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 font-medium',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
        md: 'text-sm px-4 py-2 rounded-lg gap-2 h-10',
        lg: 'text-sm sm:text-base px-5 py-2.5 rounded-xl gap-2.5 h-11',
        icon: 'h-10 w-10 p-0 rounded-lg shrink-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-lg shrink-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  iconLeft,
  iconRight,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button type={type} disabled={isDisabled} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : iconLeft}
      {children}
      {!isLoading && iconRight}
    </button>
  );
}
