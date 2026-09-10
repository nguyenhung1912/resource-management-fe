import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:opacity-90 active:opacity-100 focus-visible:ring-primary/40 shadow-xs',
        secondary:
          'bg-surface text-text-main border border-border-subtle hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-300 shadow-xs',
        outline:
          'bg-transparent text-primary border border-primary/40 hover:bg-primary/5 active:bg-primary/10 focus-visible:ring-primary/40',
        danger: 'bg-danger text-white hover:opacity-90 active:opacity-100 focus-visible:ring-danger/40 shadow-xs',
        ghost:
          'bg-transparent text-text-muted hover:text-text-main hover:bg-gray-100/70 active:bg-gray-200/70 focus-visible:ring-gray-300',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5 h-8',
        md: 'text-sm px-4 py-2 rounded-lg gap-2 h-10',
        lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5 h-12',
        icon: 'h-10 w-10 p-0 rounded-lg',
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
