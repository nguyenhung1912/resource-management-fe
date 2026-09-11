import type { InputHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const inputVariants = cva(
  'w-full bg-surface text-text-main placeholder:text-text-muted text-sm border rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'border-border-subtle focus-visible:border-primary focus-visible:ring-primary/20',
        error: 'border-danger text-text-main focus-visible:border-danger focus-visible:ring-danger/20',
      },
      inputSize: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  error?: string;
  helperText?: string;
}

export function Input({
  className,
  variant,
  inputSize,
  iconLeft,
  iconRight,
  error,
  helperText,
  id,
  disabled,
  ...props
}: InputProps) {
  const isError = Boolean(error) || variant === 'error';
  const activeVariant = isError ? 'error' : (variant ?? 'default');
  const errorId = id && isError ? `${id}-error` : undefined;
  const helperId = id && helperText && !isError ? `${id}-helper` : undefined;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div
            className="absolute left-3 flex items-center pointer-events-none text-text-muted select-none"
            aria-hidden="true"
          >
            {iconLeft}
          </div>
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={isError ? 'true' : undefined}
          aria-describedby={errorId || helperId}
          className={cn(
            inputVariants({ variant: activeVariant, inputSize }),
            iconLeft && 'pl-9',
            iconRight && 'pr-9',
            className,
          )}
          {...props}
        />
        {iconRight && (
          <div
            className="absolute right-3 flex items-center pointer-events-none text-text-muted select-none"
            aria-hidden="true"
          >
            {iconRight}
          </div>
        )}
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

export default Input;
