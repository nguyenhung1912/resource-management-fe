import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface StatCardsGroupProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

const columnStyles: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

export function StatCardsGroup({ children, columns = 4, className }: StatCardsGroupProps) {
  return (
    <div className={cn('grid gap-3 sm:gap-4', columnStyles[columns] ?? columnStyles[4], className)}>{children}</div>
  );
}

export default StatCardsGroup;
