import type { TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const textareaVariants = cva(
  'w-full bg-surface text-text-main placeholder:text-text-muted text-sm border rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-y min-h-24 p-3',
  {
    variants: {
      variant: {
        default: 'border-border-subtle focus-visible:border-primary focus-visible:ring-primary/20',
        error: 'border-danger text-text-main focus-visible:border-danger focus-visible:ring-danger/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
  ref?: React.Ref<HTMLTextAreaElement>;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  currentLength?: number;
}

export function Textarea({
  ref,
  className,
  variant,
  error,
  helperText,
  maxLength,
  showCount = false,
  currentLength,
  id,
  disabled,
  value,
  ...props
}: TextareaProps) {
  const isError = Boolean(error) || variant === 'error';
  const activeVariant = isError ? 'error' : (variant ?? 'default');
  const errorId = id && isError ? `${id}-error` : undefined;
  const helperId = id && helperText && !isError ? `${id}-helper` : undefined;

  const textLength = currentLength !== undefined ? currentLength : typeof value === 'string' ? value.length : 0;

  const isOverLimit = maxLength !== undefined && textLength > maxLength;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <textarea
        ref={ref}
        id={id}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={isError ? 'true' : undefined}
        aria-describedby={errorId || helperId}
        className={cn(textareaVariants({ variant: activeVariant }), className)}
        {...props}
      />
      <div className="flex items-center justify-between text-xs gap-2 leading-tight">
        <div className="flex-1">
          {error ? (
            <p id={errorId} role="alert" className="text-danger flex items-center gap-1">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-text-muted">
              {helperText}
            </p>
          ) : null}
        </div>
        {showCount && maxLength !== undefined && (
          <span
            className={cn(
              'text-text-muted tabular-nums ml-auto shrink-0 select-none',
              isOverLimit && 'text-danger font-medium',
            )}
            aria-live="polite"
          >
            {textLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default Textarea;
