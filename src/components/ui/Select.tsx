import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const selectVariants = cva(
  'w-full appearance-none bg-surface text-text-main text-sm border rounded-lg transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default:
          'border-border-subtle hover:border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20',
        error: 'border-danger text-text-main focus-visible:border-danger focus-visible:ring-danger/20',
      },
      selectSize: {
        sm: 'h-8 pl-2.5 pr-8 text-xs',
        md: 'h-10 pl-3 pr-9 text-sm',
        lg: 'h-12 pl-4 pr-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  },
);

export interface SelectOptionItem<T extends string | number = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, VariantProps<typeof selectVariants> {
  label?: string;
  iconLeft?: ReactNode;
  error?: string;
  helperText?: string;
  options?: readonly SelectOptionItem[];
}

export function Select({
  className,
  variant,
  selectSize,
  label,
  iconLeft,
  error,
  helperText,
  id,
  disabled,
  children,
  options,
  ...props
}: SelectProps) {
  const isError = Boolean(error) || variant === 'error';
  const activeVariant = isError ? 'error' : (variant ?? 'default');
  const errorId = id && isError ? `${id}-error` : undefined;
  const helperId = id && helperText && !isError ? `${id}-helper` : undefined;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-text-main select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div
            className="absolute left-3 flex items-center pointer-events-none text-text-muted select-none z-10"
            aria-hidden="true"
          >
            {iconLeft}
          </div>
        )}

        <select
          id={id}
          disabled={disabled}
          aria-invalid={isError ? 'true' : undefined}
          aria-describedby={errorId || helperId}
          className={cn(selectVariants({ variant: activeVariant, selectSize }), iconLeft && 'pl-9', className)}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div
          className="pointer-events-none absolute right-3 flex items-center text-text-muted select-none"
          aria-hidden="true"
        >
          <ChevronDown className="size-4" />
        </div>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger leading-tight flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text-muted leading-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Select;
