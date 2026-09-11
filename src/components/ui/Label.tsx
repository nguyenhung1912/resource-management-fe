import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const labelVariants = cva(
  'text-xs font-medium text-text-main leading-none select-none transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1',
  {
    variants: {
      error: {
        true: 'text-danger',
        false: '',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  requiredBadge?: boolean;
  children?: ReactNode;
}

export function Label({ className, error = false, requiredBadge = false, children, ...props }: LabelProps) {
  return (
    <label className={cn(labelVariants({ error }), className)} {...props}>
      {children}
      {requiredBadge && (
        <span className="text-danger font-semibold" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export default Label;
