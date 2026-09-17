import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div className={cn('relative w-full overflow-auto', containerClassName)}>
      <table className={cn('w-full caption-bottom text-sm border-collapse text-left', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-border-subtle bg-background/60 text-xs font-semibold uppercase tracking-wider text-text-muted select-none',
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border-subtle [&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn('border-t border-border-subtle bg-background/50 font-medium text-text-main', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border-subtle transition-colors hover:bg-background/70 data-[state=selected]:bg-primary/5',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 py-3 sm:px-6 text-left align-middle font-semibold text-text-muted text-[11px] sm:text-xs has-[[role=checkbox]]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 sm:px-6 align-middle text-text-main text-sm has-[[role=checkbox]]:pr-0', className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mt-4 text-xs text-text-muted', className)} {...props} />;
}

export default Table;
